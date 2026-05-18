/**
 * Quo (OpenPhone) outbound SMS helper.
 *
 * Mirrors Pella's pellanyc-site/src/lib/openphone.ts pattern, but supports
 * two outbound lines so proactive nudges don't ride on the main business line:
 *
 *   - OPENPHONE_API_KEY        — from openphone.com → Settings → API
 *   - OPENPHONE_DEFAULT_NUMBER — main 818 line; human conversations
 *   - OPENPHONE_NUDGE_NUMBER   — proactive-outbound line; must be A2P 10DLC
 *                                registered. Falls back to DEFAULT if unset.
 *
 * Callers pick a `kind` ("default" | "nudge"). The cron route should pass
 * "nudge" so spam reports/blocks land on the dedicated line, not the main one.
 *
 * Gracefully no-ops with a structured error when env vars are missing, so
 * callers can ship without breaking when running locally without secrets.
 */

import { normalizePhone } from "./quo-webhook";
import { sbSelect } from "./supabase";

const API_BASE = "https://api.openphone.com/v1";

/**
 * Check the contacts table for a phone's opt-out status.
 * Returns `true` if SAFE TO SEND (no opt-out on file OR contact doesn't exist).
 * Returns `false` if the phone has a `sms_opt_out_at` set.
 *
 * Fails OPEN on Supabase errors — we'd rather risk a duplicate send than
 * block all outbound when the audit DB is unreachable. Errors get logged.
 */
export async function isPhoneOptedIn(phone: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const normalized = normalizePhone(phone);
    if (!normalized) return { allowed: false, reason: "invalid_phone" };
    const { data, error } = await sbSelect<{ sms_opt_out_at: string | null }>(
      "contacts",
      `phone=eq.${encodeURIComponent(normalized)}&select=sms_opt_out_at`,
    );
    if (error) {
      console.warn("[quo-send] opt-out check failed (failing open):", error);
      return { allowed: true, reason: "db_error_failing_open" };
    }
    const row = data?.[0];
    if (row?.sms_opt_out_at) return { allowed: false, reason: "opted_out" };
    return { allowed: true };
  } catch (e) {
    console.warn("[quo-send] opt-out check threw (failing open):", (e as Error).message);
    return { allowed: true, reason: "exception_failing_open" };
  }
}

export type SendKind = "default" | "nudge";

/** Resolve which OpenPhone line to send from. Falls back to DEFAULT if NUDGE is unset. */
export function resolveFromNumber(kind: SendKind = "default"): string | undefined {
  if (kind === "nudge") {
    return process.env.OPENPHONE_NUDGE_NUMBER || process.env.OPENPHONE_DEFAULT_NUMBER || undefined;
  }
  return process.env.OPENPHONE_DEFAULT_NUMBER || undefined;
}

export function isQuoOutboundConfigured(kind: SendKind = "default"): boolean {
  return Boolean(process.env.OPENPHONE_API_KEY && resolveFromNumber(kind));
}

export type SmsResult =
  | { ok: true; status: number; messageId?: string; to: string; body?: unknown }
  | { ok: false; status: number; to?: string; error: string; body?: unknown };

export interface SendOpts {
  /**
   * Skip the per-send opt-out DB check. Set to `true` only when the caller
   * has already pre-filtered recipients (e.g. the cron route which batches).
   * Default `false` — every send pays one extra Supabase round-trip for safety.
   */
  skipOptOutCheck?: boolean;
}

/**
 * Send a single SMS via OpenPhone. Best-effort with structured error returns —
 * callers should not throw. Logs failures to console for Vercel log aggregation.
 *
 * `kind` selects which line to send from:
 *   - "default" → main 818 line (human conversations, callbacks)
 *   - "nudge"   → dedicated A2P-registered proactive-outbound line
 *
 * Opt-out check: by default, every send queries Supabase for the recipient's
 * sms_opt_out_at status and refuses to send if the phone has opted out. Bulk
 * callers (e.g. the nudge cron) should pre-filter and pass `skipOptOutCheck`.
 */
export async function sendSms(
  toRaw: string,
  content: string,
  kind: SendKind = "default",
  opts: SendOpts = {},
): Promise<SmsResult> {
  const from = resolveFromNumber(kind);
  if (!process.env.OPENPHONE_API_KEY || !from) {
    return {
      ok: false,
      status: 0,
      error: `OpenPhone not configured (missing OPENPHONE_API_KEY or ${kind === "nudge" ? "OPENPHONE_NUDGE_NUMBER/DEFAULT_NUMBER" : "OPENPHONE_DEFAULT_NUMBER"})`,
    };
  }
  const to = normalizePhone(toRaw);
  if (!to) {
    return { ok: false, status: 0, error: "Invalid phone number" };
  }

  if (!opts.skipOptOutCheck) {
    const eligibility = await isPhoneOptedIn(to);
    if (!eligibility.allowed) {
      return { ok: false, status: 0, to, error: `opt_out_blocked: ${eligibility.reason || "opted_out"}` };
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: {
        Authorization: process.env.OPENPHONE_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        content,
      }),
    });
  } catch (e) {
    const error = (e as Error).message;
    console.error("[quo-send] network error:", error);
    return { ok: false, status: 0, to, error };
  }

  let body: unknown = null;
  try { body = await res.json(); } catch { /* non-JSON response — ignore */ }

  if (!res.ok) {
    console.error("[quo-send] sendSms failed:", res.status, body);
    return { ok: false, status: res.status, to, body, error: `OpenPhone ${res.status}` };
  }

  // OpenPhone returns { data: { id, ... } } on success
  let messageId: string | undefined;
  if (body && typeof body === "object" && "data" in body) {
    const id = (body as { data?: { id?: string } }).data?.id;
    if (typeof id === "string") messageId = id;
  }

  return { ok: true, status: res.status, to, messageId, body };
}

/**
 * Send the same content to many recipients sequentially. Sequential (not parallel)
 * to stay nice with the OpenPhone rate limit (10/sec at time of writing). Returns
 * a per-recipient result array so callers can log + diagnose partial failures.
 */
export async function sendSmsBatch(
  recipients: { phone: string; content: string; ref?: string }[],
  kind: SendKind = "default",
  opts: SendOpts = {},
): Promise<(SmsResult & { ref?: string })[]> {
  const out: (SmsResult & { ref?: string })[] = [];
  for (const r of recipients) {
    const result = await sendSms(r.phone, r.content, kind, opts);
    out.push({ ...result, ref: r.ref });
    // small spacing — well under 10/sec
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return out;
}
