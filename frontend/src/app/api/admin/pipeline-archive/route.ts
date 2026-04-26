import { NextRequest, NextResponse } from "next/server";

/**
 * Archive (NOT delete) a list of items on the Loan Pipeline board.
 *
 * Monday "archive" moves items to the archive view — recoverable.
 * Hard delete is intentionally NOT supported here. If you really need
 * to delete an item, do it manually in Monday after verifying.
 *
 * Body: { item_ids: string[], reason?: string }
 * Auth: gated by middleware (HTTP Basic Auth on /api/admin/*)
 */

export async function POST(req: NextRequest) {
  const token = process.env.MONDAY_API_TOKEN || process.env.MONDAY_API_KEY;
  if (!token) {
    return NextResponse.json({ error: "MONDAY_API_KEY not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const itemIds: string[] = Array.isArray(body?.item_ids) ? body.item_ids.filter((id: unknown) => typeof id === "string") : [];
  if (itemIds.length === 0) {
    return NextResponse.json({ error: "item_ids must be a non-empty array of strings" }, { status: 400 });
  }
  if (itemIds.length > 200) {
    return NextResponse.json({ error: "Refuse: more than 200 items at once. Split the request." }, { status: 400 });
  }

  const results: { id: string; ok: boolean; error?: string }[] = [];

  // Sequential to avoid Monday rate limits. ~5-10 items/sec is fine.
  for (const id of itemIds) {
    const mutation = `mutation { archive_item(item_id: ${id}) { id } }`;
    try {
      const res = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          "API-Version": "2024-01",
        },
        body: JSON.stringify({ query: mutation }),
      });
      const json = await res.json();
      if (json.errors) {
        results.push({ id, ok: false, error: JSON.stringify(json.errors).slice(0, 200) });
      } else if (json?.data?.archive_item?.id) {
        results.push({ id, ok: true });
      } else {
        results.push({ id, ok: false, error: "no_id_returned" });
      }
    } catch (e) {
      results.push({ id, ok: false, error: (e as Error).message });
    }
  }

  const successCount = results.filter((r) => r.ok).length;
  return NextResponse.json({
    requested: itemIds.length,
    archived: successCount,
    failed: itemIds.length - successCount,
    results,
  });
}
