/**
 * Minimal Supabase REST client for server-side use.
 *
 * Uses PostgREST over fetch — no @supabase/supabase-js dependency, fewer cold-start
 * surprises, easier to reason about. Service role key bypasses RLS.
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (server-only — NEVER ship to client)
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function assertConfigured() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.");
  }
}

const baseHeaders = () => {
  assertConfigured();
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
};

type SbResponse<T> = { data: T | null; error: string | null };

export async function sbInsert<T = unknown>(table: string, row: Record<string, unknown>): Promise<SbResponse<T>> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...baseHeaders(), Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    const text = await res.text();
    if (!res.ok) return { data: null, error: `${res.status} ${text.slice(0, 300)}` };
    const parsed = text ? JSON.parse(text) : [];
    return { data: Array.isArray(parsed) ? parsed[0] : parsed, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

/**
 * Upsert by unique column. Pass on_conflict (e.g. "phone") to specify the conflict target.
 * On conflict, the existing row is merged with new values.
 */
export async function sbUpsert<T = unknown>(
  table: string,
  row: Record<string, unknown>,
  onConflict: string,
): Promise<SbResponse<T>> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...baseHeaders(),
        Prefer: "return=representation,resolution=merge-duplicates",
      },
      body: JSON.stringify(row),
    });
    const text = await res.text();
    if (!res.ok) return { data: null, error: `${res.status} ${text.slice(0, 300)}` };
    const parsed = text ? JSON.parse(text) : [];
    return { data: Array.isArray(parsed) ? parsed[0] : parsed, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function sbSelect<T = unknown>(table: string, query: string): Promise<SbResponse<T[]>> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method: "GET",
      headers: baseHeaders(),
    });
    const text = await res.text();
    if (!res.ok) return { data: null, error: `${res.status} ${text.slice(0, 300)}` };
    return { data: text ? JSON.parse(text) : [], error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

/**
 * Increment a counter atomically using PostgREST RPC. Falls back to SELECT+UPDATE
 * if the RPC doesn't exist (we don't create one for v1; this just writes the new value).
 */
export async function sbUpdate<T = unknown>(
  table: string,
  query: string,
  patch: Record<string, unknown>,
): Promise<SbResponse<T[]>> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method: "PATCH",
      headers: { ...baseHeaders(), Prefer: "return=representation" },
      body: JSON.stringify(patch),
    });
    const text = await res.text();
    if (!res.ok) return { data: null, error: `${res.status} ${text.slice(0, 300)}` };
    return { data: text ? JSON.parse(text) : [], error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
