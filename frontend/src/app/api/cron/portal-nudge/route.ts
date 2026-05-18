/**
 * Borrower portal SMS nudge cron.
 *
 * Triggered by an external scheduler (e.g. 818-portal-nudge scheduled task, or
 * Vercel Cron — see vercel.json once created). Looks at Monday Pipeline items
 * that match "docs outstanding" heuristics and haven't been touched in N days,
 * then sends a templated SMS to the borrower on file.
 *
 * Memory anchor: "Doc flow lag — Borrowers sitting on docs is the #1
 * deal-velocity blocker. Prioritize nudge/visibility features." This is v1
 * of the outbound side; inbound side already lives in /api/webhooks/quo.
 *
 * Auth:
 *   - Requires CRON_SECRET via either:
 *       Authorization: Bearer <CRON_SECRET>
 *       OR  ?key=<CRON_SECRET>
 *   - If CRON_SECRET is not configured, the route 503s (fail closed).
 *
 * Query params:
 *   - dry=1            Returns candidates without sending. Always safe.
 *   - days=N           Override the "no contact in N days" threshold (default 3).
 *   - limit=N          Cap recipients per run (default 25, ceiling 100).
 *
 * Returns JSON: { ok, scanned, candidates, sent, results[], dry }
 *
 * v1 scoping note: this queries Monday Pipeline (the curated active-deals
 * board) and matches against the existing column ids in lib/monday.ts. It
 * does NOT yet query a borrower_doc_status table — that's portal v1 work
 * still in progress. When the schema lands, swap the data source here and
 * the rest of the pipeline stays identical.
 */

import { NextRequest, NextResponse } from "next/server";
import { resolveFromNumber, sendSmsBatch } from "@/lib/quo-send";
import { sbInsert, sbSelect } from "@/lib/supabase";
import { normalizePhone } from "@/lib/quo-webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MONDAY_API = "https://api.monday.com/v2";
const PIPELINE_BOARD = "18402100042";

// Column ids from lib/monday.ts — keep in sync.
const COL = {
  address: "text_mm12e5bc",
  borrower: "text_mm12gee2",
  lender: "text_mm155c62",
  phone: "text_mm1dm4wq",
  nextAction: "text_mm15px3",
  lastContacted: "date_mm12parv",
};

// Heuristics for "docs outstanding" — next_action contains any of these.
// Cheap, predictable, easy to tune. Real status column comes with portal v1.
const DOC_KEYWORDS = /\b(doc|docs|document|paperwork|waiting|outstanding|need|missing|provide|send|upload|tax return|bank statement|paystub|insurance|appraisal)\b/i;

const NUDGE_TEMPLATE = (borrowerFirstName: string | null) =>
  borrowerFirstName
    ? `Hi ${borrowerFirstName}, Ravi at 818 Capital — checking in on your file. Reply with any questions or send outstanding docs to deals@818capitalpartners.com. Reply STOP to opt out.`
    : `Hi — Ravi at 818 Capital checking in on your loan file. Reply here with any questions or send outstanding docs to deals@818capitalpartners.com. Reply STOP to opt out.`;

interface MondayItem {
  id: string;
  name: string;
  column_values: { id: string; text: string | null; value: string | null }[];
}

interface Candidate {
  itemId: string;
  itemName: string;
  borrowerName: string | null;
  borrowerFirstName: string | null;
  phone: string;
  nextAction: string;
  lastContacted: string | null;
  daysSince: number | null;
}

function authOk(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const qs = req.nextUrl.searchParams.get("key");
  return bearer === secret || qs === secret;
}

async function fetchPipelineItems(): Promise<{ items: MondayItem[]; error: string | null }> {
  const token = process.env.MONDAY_API_TOKEN || process.env.MONDAY_API_KEY;
  if (!token) return { items: [], error: "MONDAY_API_TOKEN not configured" };

  const colIds = Object.values(COL);
  const query = `
    query($boardId: ID!) {
      boards(ids: [$boardId]) {
        items_page(limit: 500) {
          items {
            id
            name
            column_values(ids: ${JSON.stringify(colIds)}) {
              id
              text
              value
            }
          }
        }
      }
    }
  `;
  try {
    const res = await fetch(MONDAY_API, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json", "API-Version": "2024-01" },
      body: JSON.stringify({ query, variables: { boardId: PIPELINE_BOARD } }),
    });
    const json = await res.json();
    if (json.errors) return { items: [], error: JSON.stringify(json.errors).slice(0, 400) };
    const items = json.data?.boards?.[0]?.items_page?.items || [];
    return { items, error: null };
  } catch (e) {
    return { items: [], error: (e as Error).message };
  }
}

function col(item: MondayItem, id: string): string {
  return item.column_values.find((c) => c.id === id)?.text || "";
}

function daysBetween(isoDate: string, now: Date): number | null {
  // Monday date columns are stored as YYYY-MM-DD strings.
  if (!isoDate) return null;
  const then = new Date(isoDate + "T00:00:00Z");
  if (Number.isNaN(then.getTime())) return null;
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function deriveCandidates(items: MondayItem[], thresholdDays: number): Candidate[] {
  const now = new Date();
  const candidates: Candidate[] = [];

  for (const item of items) {
    const nextAction = col(item, COL.nextAction);
    if (!nextAction || !DOC_KEYWORDS.test(nextAction)) continue;

    const phoneRaw = col(item, COL.phone);
    const phone = normalizePhone(phoneRaw);
    if (!phone) continue;

    const lastContacted = col(item, COL.lastContacted) || null;
    const daysSince = lastContacted ? daysBetween(lastContacted, now) : null;
    // Only nudge if we've gone quiet for >= thresholdDays. Items with no
    // lastContacted date at all are NOT nudged — that means we've never
    // engaged and SMS would be cold.
    if (daysSince === null || daysSince < thresholdDays) continue;

    const borrowerName = col(item, COL.borrower) || null;
    const borrowerFirstName = borrowerName ? borrowerName.split(/\s+/)[0] : null;

    candidates.push({
      itemId: item.id,
      itemName: item.name,
      borrowerName,
      borrowerFirstName,
      phone,
      nextAction,
      lastContacted,
      daysSince,
    });
  }
  return candidates;
}

export async function GET(req: NextRequest) {
  if (!authOk(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const dry = req.nextUrl.searchParams.get("dry") === "1";
  const days = Math.max(1, Math.min(30, Number(req.nextUrl.searchParams.get("days")) || 3));
  const limit = Math.max(1, Math.min(100, Number(req.nextUrl.searchParams.get("limit")) || 25));

  const { items, error: fetchError } = await fetchPipelineItems();
  if (fetchError) {
    return NextResponse.json({ ok: false, error: `monday_fetch_failed: ${fetchError}` }, { status: 502 });
  }

  const allCandidates = deriveCandidates(items, days);

  // Pre-filter against the contacts table:
  //   1. Drop anyone with sms_opt_out_at set (must respect)
  //   2. Drop anyone without sms_opted_in_at (TCPA: no express consent on file)
  // Compliance bar: we will NEVER nudge a number without a logged opt-in.
  const phoneList = allCandidates.map((c) => c.phone);
  let eligiblePhones = new Set<string>(phoneList);
  if (phoneList.length > 0) {
    const inClause = `in.(${phoneList.map((p) => `"${p}"`).join(",")})`;
    const { data: contactRows, error: contactErr } = await sbSelect<{
      phone: string;
      sms_opted_in_at: string | null;
      sms_opt_out_at: string | null;
    }>(
      "contacts",
      `phone=${encodeURIComponent(inClause)}&select=phone,sms_opted_in_at,sms_opt_out_at`,
    );
    if (contactErr) {
      // Fail CLOSED on consent — we'd rather skip a nudge than send without
      // recorded consent and hit a TCPA complaint.
      return NextResponse.json(
        { ok: false, error: `consent_lookup_failed: ${contactErr}` },
        { status: 502 },
      );
    }
    eligiblePhones = new Set(
      (contactRows || [])
        .filter((r) => r.sms_opted_in_at && !r.sms_opt_out_at)
        .map((r) => r.phone),
    );
  }
  const eligibleCandidates = allCandidates.filter((c) => eligiblePhones.has(c.phone));
  const droppedForConsent = allCandidates.length - eligibleCandidates.length;
  const targets = eligibleCandidates.slice(0, limit);

  if (dry) {
    return NextResponse.json({
      ok: true,
      dry: true,
      scanned: items.length,
      thresholdDays: days,
      candidates: allCandidates.length,
      droppedForConsent,
      eligible: eligibleCandidates.length,
      truncatedTo: targets.length,
      preview: targets.map((c) => ({
        itemId: c.itemId,
        itemName: c.itemName,
        phone: c.phone,
        daysSince: c.daysSince,
        nextAction: c.nextAction.slice(0, 120),
      })),
    });
  }

  // Use the dedicated nudge line (A2P 10DLC-registered) so spam reports
  // don't poison the main 818 business line. Falls back to default if unset.
  // skipOptOutCheck=true because we already pre-filtered above against the
  // contacts table — no need to re-query per recipient.
  const results = await sendSmsBatch(
    targets.map((c) => ({
      phone: c.phone,
      content: NUDGE_TEMPLATE(c.borrowerFirstName),
      ref: c.itemId,
    })),
    "nudge",
    { skipOptOutCheck: true },
  );

  // Best-effort audit log. If the nudge_log table doesn't exist, swallow the
  // error — we don't want logging to break the actual send.
  const sentAt = new Date().toISOString();
  const fromNumber = resolveFromNumber("nudge") || null;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const c = targets[i];
    await sbInsert("nudge_log", {
      sent_at: sentAt,
      monday_item_id: c.itemId,
      monday_item_name: c.itemName,
      phone: r.to || c.phone,
      from_number: fromNumber,
      ok: r.ok,
      status: r.status,
      error: r.ok ? null : r.error,
      message_id: r.ok ? r.messageId || null : null,
      template: "portal-nudge-v1",
      days_since_contact: c.daysSince,
    }).catch(() => { /* table may not exist — ignore */ });
  }

  const sent = results.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: true,
    dry: false,
    scanned: items.length,
    thresholdDays: days,
    candidates: allCandidates.length,
    droppedForConsent,
    eligible: eligibleCandidates.length,
    targeted: targets.length,
    sent,
    failed: targets.length - sent,
    results: results.map((r, i) => ({
      itemId: targets[i].itemId,
      itemName: targets[i].itemName,
      phone: r.to,
      ok: r.ok,
      status: r.status,
      error: r.ok ? undefined : r.error,
      messageId: r.ok ? r.messageId : undefined,
    })),
  });
}

// Allow POST too — some schedulers (and the user's existing 818-* task pattern)
// prefer POST for state-changing endpoints.
export const POST = GET;
