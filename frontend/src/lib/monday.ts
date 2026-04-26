/**
 * Monday.com helpers for the call/text webhook pipeline.
 *
 * - PIPELINE_BOARD: 18402100042 — active deals only. Strict gating: we only
 *   UPDATE existing items here. Never create. Pipeline is curated.
 * - LEADS_BOARD: 18405961545 — top-of-funnel inbox. New unknown callers
 *   land here with a "From: phone webhook" tag for triage.
 *
 * Column IDs from S10 blueprint:
 *   text_mm12e5bc  — property address
 *   text_mm12gee2  — borrower name
 *   text_mm155c62  — lender name
 *   text_mm1dm4wq  — phone
 *   text_mm15px3   — next action
 *   long_text_mm12f6cx — summary
 *   date_mm12parv  — last contacted
 *   date_mm1521mv  — first contacted
 */

const MONDAY_API = "https://api.monday.com/v2";
const PIPELINE_BOARD = "18402100042";
const LEADS_BOARD = "18405961545";

const COLUMNS = {
  pipeline: {
    address: "text_mm12e5bc",
    borrower: "text_mm12gee2",
    lender: "text_mm155c62",
    phone: "text_mm1dm4wq",
    nextAction: "text_mm15px3",
    summary: "long_text_mm12f6cx",
    lastContacted: "date_mm12parv",
    firstContacted: "date_mm1521mv",
  },
};

function authHeader() {
  const token = process.env.MONDAY_API_TOKEN || process.env.MONDAY_API_KEY;
  if (!token) throw new Error("MONDAY_API_KEY not configured");
  return { Authorization: token, "Content-Type": "application/json", "API-Version": "2024-01" };
}

async function gql<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(MONDAY_API, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) return { data: null, error: JSON.stringify(json.errors).slice(0, 400) };
    return { data: json.data as T, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

/** Find an item on the Pipeline board by exact phone match. Returns item id or null. */
export async function findPipelineItemByPhone(phone: string): Promise<{ id: string; name: string } | null> {
  const query = `
    query($boardId: ID!, $columnId: String!, $phone: String!) {
      items_page_by_column_values(
        board_id: $boardId
        limit: 1
        columns: [{ column_id: $columnId, column_values: [$phone] }]
      ) {
        items { id name }
      }
    }
  `;
  const { data, error } = await gql<{ items_page_by_column_values: { items: { id: string; name: string }[] } }>(
    query,
    { boardId: PIPELINE_BOARD, columnId: COLUMNS.pipeline.phone, phone },
  );
  if (error || !data) return null;
  return data.items_page_by_column_values?.items?.[0] || null;
}

/**
 * Update an existing pipeline item with new context from a call/text. Touches:
 *   - last_contacted date (today)
 *   - summary (Claude-extracted)
 *   - lender (only if currently empty — never overwrite UW's manual entry)
 *   - next_action (Claude-extracted)
 * Then writes an "Update" post (visible in Monday timeline) with the call details.
 */
export async function updatePipelineItemFromCall(
  itemId: string,
  fields: { summary?: string; nextAction?: string; lender?: string; lastUpdate: string },
): Promise<{ ok: boolean; error?: string }> {
  const cols: Record<string, unknown> = {};
  cols[COLUMNS.pipeline.lastContacted] = { date: new Date().toISOString().slice(0, 10) };
  if (fields.summary) cols[COLUMNS.pipeline.summary] = { text: fields.summary.slice(0, 500) };
  if (fields.nextAction) cols[COLUMNS.pipeline.nextAction] = fields.nextAction.slice(0, 200);
  if (fields.lender) cols[COLUMNS.pipeline.lender] = fields.lender.slice(0, 100);

  const colJson = JSON.stringify(cols).replace(/"/g, '\\"');

  const mutation = `
    mutation {
      change_multiple_column_values(
        item_id: ${itemId}
        board_id: ${PIPELINE_BOARD}
        column_values: "${colJson}"
      ) { id }
      create_update(
        item_id: ${itemId}
        body: ${JSON.stringify(fields.lastUpdate)}
      ) { id }
    }
  `;
  const { error } = await gql(mutation);
  return error ? { ok: false, error } : { ok: true };
}

/**
 * Create a new lead on the Leads board (NOT Pipeline). For unknown callers
 * whose transcript indicates a real loan inquiry. Pipeline stays curated.
 */
export async function createLeadFromCall(fields: {
  borrowerName?: string;
  phone: string;
  property?: string;
  loanType?: string;
  summary?: string;
  source: "call_in" | "sms_in" | "call_out" | "sms_out" | string;
}): Promise<{ ok: boolean; itemId?: string; error?: string }> {
  const name = fields.borrowerName || fields.phone;
  const itemName = fields.property ? `${name} — ${fields.property}` : name;

  const noteBody = [
    `📞 Auto-created from ${fields.source}`,
    fields.borrowerName ? `Caller: ${fields.borrowerName}` : null,
    `Phone: ${fields.phone}`,
    fields.property ? `Property: ${fields.property}` : null,
    fields.loanType ? `Loan Type: ${fields.loanType}` : null,
    fields.summary ? `Summary: ${fields.summary}` : null,
  ].filter(Boolean).join("\n");

  const mutation = `
    mutation($boardId: ID!, $itemName: String!, $body: String!) {
      create_item(board_id: $boardId, item_name: $itemName) { id }
    }
  `;
  const { data, error } = await gql<{ create_item: { id: string } }>(mutation, {
    boardId: LEADS_BOARD,
    itemName: itemName.slice(0, 200),
    body: noteBody,
  });
  if (error || !data?.create_item?.id) return { ok: false, error: error || "no_item_id" };

  // Add a post (update) with the full context. Best-effort — don't fail the whole op if it errors.
  await gql(`mutation { create_update(item_id: ${data.create_item.id}, body: ${JSON.stringify(noteBody)}) { id } }`);

  return { ok: true, itemId: data.create_item.id };
}
