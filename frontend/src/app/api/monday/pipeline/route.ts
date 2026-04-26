import { NextResponse } from "next/server";

/**
 * Direct Monday.com GraphQL → Pipeline data.
 *
 * Replaces the Claude+MCP roundtrip in /command-center. That approach
 * was returning 182k+ input tokens (the entire 223-deal board), blowing
 * past Anthropic's 200k context limit and costing $0.45/refresh.
 *
 * This route:
 *   - Queries Monday GraphQL once
 *   - Maps board columns by title to a stable schema
 *   - Caches the result in-memory for 60 seconds (warm function)
 *   - Returns Deal[] matching the shape the Pipeline tab expects
 *
 * Cost: $0 per refresh. Monday GraphQL has a generous free quota.
 */

const BOARD_ID = "18402100042";
const CACHE_TTL_MS = 60 * 1000;

type Deal = {
  id: string;
  name: string;
  status: string;
  loanType: string;
  urgency: string;
  lastUpdate: string;
  address: string;
  lender: string;
};

// Module-level cache — persists across requests on the same warm instance.
// Cold starts re-fetch, which is fine.
let cache: { data: Deal[]; ts: number } | null = null;

const QUERY = `
  query GetPipeline($boardId: ID!) {
    boards(ids: [$boardId]) {
      columns {
        id
        title
      }
      items_page(limit: 500) {
        items {
          id
          name
          column_values {
            id
            text
          }
          updates(limit: 1) {
            body
            created_at
          }
        }
      }
    }
  }
`;

// Heuristic column-title → field mapping. Lowercased + includes-based
// so minor renames in Monday don't break things.
function mapColumnsToField(columns: { id: string; title: string }[]) {
  const map: Record<string, string> = {};
  for (const c of columns) {
    const t = (c.title || "").toLowerCase();
    if (!map.status && (t === "status" || t.includes("stage"))) map.status = c.id;
    if (!map.loanType && (t.includes("loan type") || t.includes("product") || t === "type")) map.loanType = c.id;
    if (!map.urgency && (t.includes("urgency") || t.includes("priority") || t.includes("flag"))) map.urgency = c.id;
    if (!map.lender && (t === "lender" || t.includes("lender"))) map.lender = c.id;
    if (!map.address && (t === "address" || t.includes("property") || t.includes("location"))) map.address = c.id;
  }
  return map;
}

function stripHtml(s: string): string {
  return (s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function shortDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return "";
  }
}

export async function GET() {
  // Cache hit
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json({ deals: cache.data, cached: true, age: Date.now() - cache.ts });
  }

  const token = process.env.MONDAY_API_TOKEN || process.env.MONDAY_API_KEY;
  if (!token) {
    return NextResponse.json(
      { error: "Monday API token not configured. Set MONDAY_API_KEY in Vercel env vars." },
      { status: 500 },
    );
  }

  let mondayResponse;
  try {
    const res = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
        "API-Version": "2024-01",
      },
      body: JSON.stringify({ query: QUERY, variables: { boardId: BOARD_ID } }),
    });
    mondayResponse = await res.json();
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to reach Monday API: ${(e as Error).message}` },
      { status: 502 },
    );
  }

  if (mondayResponse.errors) {
    return NextResponse.json(
      { error: `Monday GraphQL error: ${JSON.stringify(mondayResponse.errors).slice(0, 400)}` },
      { status: 502 },
    );
  }

  const board = mondayResponse?.data?.boards?.[0];
  if (!board) {
    return NextResponse.json({ error: `Board ${BOARD_ID} not accessible with this token.` }, { status: 404 });
  }

  const columnMap = mapColumnsToField(board.columns || []);
  const items = board.items_page?.items || [];

  const deals: Deal[] = items.map((item: {
    id: string;
    name: string;
    column_values: { id: string; text: string }[];
    updates: { body: string; created_at: string }[];
  }) => {
    const cv: Record<string, string> = {};
    for (const v of item.column_values || []) cv[v.id] = v.text || "";

    const lastUpdateRaw = item.updates?.[0];
    const lastUpdate = lastUpdateRaw
      ? `${shortDate(lastUpdateRaw.created_at)}: ${stripHtml(lastUpdateRaw.body).slice(0, 200)}`
      : "";

    return {
      id: item.id,
      name: item.name || "(unnamed)",
      status: columnMap.status ? cv[columnMap.status] || "" : "",
      loanType: columnMap.loanType ? cv[columnMap.loanType] || "" : "",
      urgency: columnMap.urgency ? cv[columnMap.urgency] || "" : "",
      lender: columnMap.lender ? cv[columnMap.lender] || "" : "",
      address: columnMap.address ? cv[columnMap.address] || "" : "",
      lastUpdate,
    };
  });

  cache = { data: deals, ts: Date.now() };
  return NextResponse.json({ deals, cached: false, count: deals.length });
}
