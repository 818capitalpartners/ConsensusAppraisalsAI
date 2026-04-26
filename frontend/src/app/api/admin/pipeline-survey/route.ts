import { NextResponse } from "next/server";

/**
 * Pipeline cleanup survey.
 *
 * Pulls every item on the Loan Pipeline board, runs heuristics to score
 * "likelihood this is SMS/text pollution that should be archived," and
 * returns a sortable JSON list for review in the Cleanup tab.
 *
 * Read-only. No mutations. Safe to call repeatedly.
 *
 * Heuristics (each adds points; >= 70 = likely pollution, auto-checked):
 *   +40  Item name looks like a raw phone number (mostly digits/symbols)
 *   +30  Item name is a generic placeholder (Unknown, SMS Lead, Caller, etc.)
 *   +20  Lender field empty AND address empty AND loan_type empty (triple-empty)
 *   +15  Address field empty
 *   +15  Lender field empty
 *   +10  No update activity since creation
 *   +10  Created in the last 60 days (recent SMS pollution period)
 *   -30  Has a status set to anything other than empty / 'New' / 'Lead'
 *        (i.e. a human moved it forward — probably real)
 *   -40  Item name contains street suffix words (St, Ave, Rd, Blvd, Dr,
 *        Place, Ln, Way, Ct) — almost certainly a real deal
 */

const PIPELINE_BOARD = "18402100042";

const COLUMNS = {
  address: "text_mm12e5bc",
  borrower: "text_mm12gee2",
  lender: "text_mm155c62",
  phone: "text_mm1dm4wq",
  nextAction: "text_mm15px3",
};

type RawItem = {
  id: string;
  name: string;
  group?: { id: string; title: string };
  created_at: string;
  updated_at: string;
  state: string;
  column_values: { id: string; text: string }[];
};

type ScoredItem = {
  id: string;
  name: string;
  group: string;
  status: string;
  loanType: string;
  lender: string;
  address: string;
  phone: string;
  borrower: string;
  createdAt: string;
  updatedAt: string;
  hasUpdates: boolean;
  score: number;
  reasons: string[];
};

const PHONE_LIKE = /^[+\d\s()-]{7,}$/;
const GENERIC_NAMES = /^(unknown|sms\s*lead|inbound|lead|caller|new\s*lead|test|n\/?a|tbd|\.|--)$/i;
const STREET_WORDS = /\b(st|ave|rd|blvd|dr|drive|place|pl|ln|lane|way|ct|court|circle|cir|highway|hwy|road|street|avenue|boulevard|terrace|trail|parkway|pkwy)\.?\b/i;

function scoreItem(item: ScoredItem): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (PHONE_LIKE.test(item.name.trim())) {
    score += 40;
    reasons.push("name_looks_like_phone");
  }
  if (GENERIC_NAMES.test(item.name.trim())) {
    score += 30;
    reasons.push("generic_placeholder_name");
  }

  const noLender = !item.lender || /^\s*(tbd|n\/?a|none)?\s*$/i.test(item.lender);
  const noAddress = !item.address || /^\s*(tbd|n\/?a|none)?\s*$/i.test(item.address);
  const noLoanType = !item.loanType || /^\s*(tbd|n\/?a|none)?\s*$/i.test(item.loanType);

  if (noLender && noAddress && noLoanType) {
    score += 20;
    reasons.push("triple_empty_lender_address_type");
  }
  if (noAddress) {
    score += 15;
    reasons.push("no_address");
  }
  if (noLender) {
    score += 15;
    reasons.push("no_lender");
  }
  if (!item.hasUpdates) {
    score += 10;
    reasons.push("no_update_activity");
  }

  const createdMs = Date.parse(item.createdAt);
  if (Number.isFinite(createdMs)) {
    const ageDays = (Date.now() - createdMs) / 86400000;
    if (ageDays < 60) {
      score += 10;
      reasons.push("recent_creation");
    }
  }

  // Counter-signals (likely a real deal)
  const hasMeaningfulStatus = item.status && !/^(new|lead|inbound|sms)$/i.test(item.status);
  if (hasMeaningfulStatus) {
    score -= 30;
    reasons.push("has_real_status");
  }
  if (STREET_WORDS.test(item.name)) {
    score -= 40;
    reasons.push("name_has_street_suffix");
  }
  if (item.address && item.address.length > 5 && !noAddress) {
    score -= 20;
    reasons.push("has_real_address");
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

export async function GET() {
  const token = process.env.MONDAY_API_TOKEN || process.env.MONDAY_API_KEY;
  if (!token) {
    return NextResponse.json({ error: "MONDAY_API_KEY not configured" }, { status: 500 });
  }

  const query = `
    query($boardId: ID!) {
      boards(ids: [$boardId]) {
        columns { id title }
        items_page(limit: 500) {
          items {
            id
            name
            state
            created_at
            updated_at
            group { id title }
            column_values { id text }
            updates(limit: 1) { id }
          }
        }
      }
    }
  `;

  let json;
  try {
    const res = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
        "API-Version": "2024-01",
      },
      body: JSON.stringify({ query, variables: { boardId: PIPELINE_BOARD } }),
    });
    json = await res.json();
  } catch (e) {
    return NextResponse.json({ error: `Monday fetch failed: ${(e as Error).message}` }, { status: 502 });
  }

  if (json.errors) {
    return NextResponse.json({ error: `GraphQL: ${JSON.stringify(json.errors).slice(0, 400)}` }, { status: 502 });
  }

  const board = json?.data?.boards?.[0];
  if (!board) return NextResponse.json({ error: "Board not found / no access" }, { status: 404 });

  const columns = (board.columns || []) as { id: string; title: string }[];
  const titleByCol: Record<string, string> = {};
  for (const c of columns) titleByCol[c.id] = c.title;

  const statusColId = columns.find((c) => /^(status|stage)$/i.test(c.title))?.id;
  const loanTypeColId = columns.find((c) => /loan\s*type|product/i.test(c.title))?.id;

  const items: RawItem[] = board.items_page?.items || [];

  const scored: ScoredItem[] = items
    // Already-archived items don't need to be re-archived
    .filter((it) => it.state !== "archived" && it.state !== "deleted")
    .map((it: RawItem & { updates?: { id: string }[] }) => {
      const cv: Record<string, string> = {};
      for (const v of it.column_values) cv[v.id] = v.text || "";

      const partial: ScoredItem = {
        id: it.id,
        name: it.name || "(unnamed)",
        group: it.group?.title || "",
        status: statusColId ? cv[statusColId] || "" : "",
        loanType: loanTypeColId ? cv[loanTypeColId] || "" : "",
        lender: cv[COLUMNS.lender] || "",
        address: cv[COLUMNS.address] || "",
        phone: cv[COLUMNS.phone] || "",
        borrower: cv[COLUMNS.borrower] || "",
        createdAt: it.created_at,
        updatedAt: it.updated_at,
        hasUpdates: ((it as RawItem & { updates?: { id: string }[] }).updates?.length || 0) > 0,
        score: 0,
        reasons: [],
      };

      const { score, reasons } = scoreItem(partial);
      partial.score = score;
      partial.reasons = reasons;
      return partial;
    });

  // Sort: highest pollution score first
  scored.sort((a, b) => b.score - a.score);

  const summary = {
    total: scored.length,
    likely_pollution: scored.filter((i) => i.score >= 70).length,
    review: scored.filter((i) => i.score >= 40 && i.score < 70).length,
    likely_real: scored.filter((i) => i.score < 40).length,
  };

  return NextResponse.json({ summary, items: scored });
}
