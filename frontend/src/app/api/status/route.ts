/**
 * /api/status — operational diagnostic endpoint.
 *
 * One URL to confirm the moving parts are wired:
 *   - Monday Pipeline reachable + token valid
 *   - Supabase reachable + service-role key valid
 *   - OpenPhone API reachable + token valid (no SMS sent)
 *   - Required env vars present (presence-only — never echo values)
 *   - Latest nudge cron run (if any)
 *
 * Optional auth: if STATUS_AUTH_KEY is set, requires `?key=<value>` to view.
 * Without it, the endpoint is open — safe to leave open since it leaks zero
 * secret material (booleans + counts only) but the deployer can lock it down
 * if they prefer.
 *
 * Returns JSON, never throws. Each check has its own try/catch so one failure
 * doesn't black-hole the rest of the report.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CheckResult {
  ok: boolean;
  latencyMs?: number;
  detail?: string;
  error?: string;
}

async function timed<T>(fn: () => Promise<T>): Promise<{ result: T | null; ms: number; error?: string }> {
  const start = Date.now();
  try {
    const result = await fn();
    return { result, ms: Date.now() - start };
  } catch (e) {
    return { result: null, ms: Date.now() - start, error: (e as Error).message };
  }
}

async function checkMonday(): Promise<CheckResult> {
  const token = process.env.MONDAY_API_TOKEN || process.env.MONDAY_API_KEY;
  if (!token) return { ok: false, error: 'no_token_configured' };

  const { result, ms, error } = await timed(async () => {
    const res = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ me { id name } }' }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 200));
    if (!json.data?.me?.id) throw new Error('no_user_returned');
    return json.data.me as { id: string; name: string };
  });

  if (!result) return { ok: false, latencyMs: ms, error: error || 'unknown' };
  return { ok: true, latencyMs: ms, detail: `auth as ${result.name}` };
}

async function checkSupabase(): Promise<CheckResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, error: 'no_credentials_configured' };

  const { result, ms, error } = await timed(async () => {
    // PostgREST returns 200 + empty array on a no-match query — cheapest auth ping.
    const res = await fetch(`${url}/rest/v1/contacts?select=id&limit=1`, {
      method: 'GET',
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${text.slice(0, 200)}`);
    }
    const body = (await res.json()) as unknown[];
    return { rowCount: body.length };
  });

  if (!result) return { ok: false, latencyMs: ms, error: error || 'unknown' };
  return { ok: true, latencyMs: ms, detail: 'rest_reachable' };
}

async function checkOpenPhone(): Promise<CheckResult> {
  const key = process.env.OPENPHONE_API_KEY;
  if (!key) return { ok: false, error: 'no_token_configured' };

  // /v1/phone-numbers is cheap, auth-required, and read-only. Good token check.
  const { result, ms, error } = await timed(async () => {
    const res = await fetch('https://api.openphone.com/v1/phone-numbers', {
      method: 'GET',
      headers: { Authorization: key },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${text.slice(0, 200)}`);
    }
    const body = (await res.json()) as { data?: unknown[] };
    return { numbers: body.data?.length || 0 };
  });

  if (!result) return { ok: false, latencyMs: ms, error: error || 'unknown' };
  return { ok: true, latencyMs: ms, detail: `${result.numbers} number(s) on account` };
}

/**
 * Last nudge cron run — pulled from the nudge_log audit table. Useful signal:
 *   - Missing entirely → cron not registered or not authorized
 *   - All recent entries `ok=false` → outbound broken (check OpenPhone status above)
 */
async function checkLastNudgeRun(): Promise<CheckResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, error: 'no_supabase_credentials' };

  const { result, ms, error } = await timed(async () => {
    const res = await fetch(
      `${url}/rest/v1/nudge_log?select=sent_at,ok,template,from_number&order=sent_at.desc&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) {
      // 404 here usually means the table hasn't been created yet — that's a
      // valid state pre-migration, not an outage. Convey it but don't fail.
      if (res.status === 404) return { tableMissing: true };
      throw new Error(`${res.status}`);
    }
    const rows = (await res.json()) as { sent_at: string; ok: boolean; template: string; from_number: string | null }[];
    return { tableMissing: false, last: rows[0] || null };
  });

  if (!result) return { ok: false, latencyMs: ms, error: error || 'unknown' };
  if (result.tableMissing) return { ok: false, latencyMs: ms, detail: 'nudge_log table not created (run migration)' };
  if (!result.last) return { ok: true, latencyMs: ms, detail: 'no nudges sent yet' };
  const ageMin = Math.floor((Date.now() - new Date(result.last.sent_at).getTime()) / 60000);
  return {
    ok: result.last.ok,
    latencyMs: ms,
    detail: `last ${ageMin}m ago · ${result.last.template} · ${result.last.ok ? 'ok' : 'failed'}`,
  };
}

function envPresence(): Record<string, boolean> {
  // Presence-only — never echo values. Order matches setup priority.
  const keys = [
    'MONDAY_API_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENPHONE_API_KEY',
    'OPENPHONE_WEBHOOK_SECRET',
    'QUO_WEBHOOK_SECRET',
    'QUO_WEBHOOK_BYPASS_SIGNATURE',
    'OPENPHONE_DEFAULT_NUMBER',
    'OPENPHONE_NUDGE_NUMBER',
    'CRON_SECRET',
    'ANTHROPIC_API_KEY',
    'BREVO_API_KEY',
    'SLACK_WEBHOOK_URL',
  ];
  return Object.fromEntries(keys.map((k) => [k, Boolean(process.env[k])]));
}

export async function GET(req: NextRequest) {
  const authKey = process.env.STATUS_AUTH_KEY;
  if (authKey) {
    const provided = req.nextUrl.searchParams.get('key') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (provided !== authKey) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  // Run all checks in parallel — one slow API doesn't block the rest.
  const [monday, supabase, openphone, lastNudge] = await Promise.all([
    checkMonday(),
    checkSupabase(),
    checkOpenPhone(),
    checkLastNudgeRun(),
  ]);

  const env = envPresence();
  const allOk = monday.ok && supabase.ok && openphone.ok;

  return NextResponse.json(
    {
      ok: allOk,
      service: '818-capital-frontend',
      version: 'status-1.0',
      checkedAt: new Date().toISOString(),
      env,
      checks: {
        monday,
        supabase,
        openphone,
        lastNudgeRun: lastNudge,
      },
    },
    { status: allOk ? 200 : 503, headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}

export const POST = GET;
