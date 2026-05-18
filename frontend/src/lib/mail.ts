/**
 * Hardened outbound email — for borrower-facing transactional/notification mail.
 *
 * This is the deliverability-aware sender for the borrower portal and future
 * outbound paths (doc requests, status updates, nudges-by-email, .ics invites).
 *
 * The existing lib/leads.ts sends INTERNAL alerts to Ravi — those don't need
 * the same hardening because they're not commercial mail to a recipient
 * you're trying to acquire. Don't refactor leads.ts to use this; they have
 * different requirements.
 *
 * Required env vars:
 *   RESEND_API_KEY              — Resend account
 *   FROM_EMAIL                  — verified sender, e.g. notifications@818capitalpartners.com
 *
 * Optional env vars:
 *   REPLY_TO_EMAIL              — default Reply-To. Defaults to deals@818capitalpartners.com.
 *   UNSUBSCRIBE_BASE_URL        — where the one-click unsub link points
 *                                 (default: https://www.818capitalpartners.com/unsubscribe)
 *
 * Deliverability features baked in:
 *   - Plain-text fallback auto-derived from HTML (boosts inbox placement)
 *   - Explicit Reply-To header
 *   - List-Unsubscribe (mailto + https URL) for one-click unsubscribe per RFC 8058
 *   - List-Unsubscribe-Post for Gmail/Yahoo one-click compliance
 *   - Marketing vs transactional flag — transactional skips unsub headers
 *
 * Gracefully no-ops with a structured error when env vars are missing.
 */

const RESEND_URL = 'https://api.resend.com/emails';

const DEFAULT_FROM_NAME = '818 Capital';
const DEFAULT_REPLY_TO = 'deals@818capitalpartners.com';
const DEFAULT_UNSUB_BASE = 'https://www.818capitalpartners.com/unsubscribe';

export interface SendMailArgs {
  to: string | string[];
  subject: string;
  /** HTML body. Plain-text fallback is auto-derived if `text` isn't provided. */
  html: string;
  /** Optional explicit plain-text body. If omitted, derived from HTML. */
  text?: string;
  /** Override the From address. Defaults to FROM_EMAIL env. */
  from?: string;
  /** Override Reply-To. Defaults to REPLY_TO_EMAIL or deals@. */
  replyTo?: string;
  /**
   * "marketing" attaches List-Unsubscribe headers (one-click unsub).
   * "transactional" doesn't — TCPA/CAN-SPAM allow transactional w/o unsub
   * (loan status, doc requests, .ics invites for booked calls).
   * Default: "marketing" (safer).
   */
  kind?: 'marketing' | 'transactional';
  /**
   * Recipient identifier appended to the unsubscribe URL as `?u=<id>`.
   * Use the contact id or an opaque token — never the email itself,
   * since logged URLs would leak PII.
   */
  unsubToken?: string;
  /**
   * Optional .ics calendar invite body. When set, attached as
   * `application/ics` so mail clients render an "Add to calendar" button.
   * See lib/ics.ts.
   */
  ics?: { filename: string; content: string };
}

export type MailResult =
  | { ok: true; messageId: string; status: number }
  | { ok: false; status: number; error: string };

/**
 * Derive a plain-text fallback from HTML. Not a full sanitizer — just enough
 * to give mail clients the alternative body they boost for inbox placement.
 * Preserves URLs as bracketed text so links survive the conversion.
 */
export function htmlToPlainText(html: string): string {
  return html
    // Block-level breaks
    .replace(/<\/?(p|div|h[1-6]|li|tr|br)\b[^>]*>/gi, '\n')
    // Anchors → "text (https://url)"
    .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, label) => {
      const clean = String(label).replace(/<[^>]+>/g, '').trim();
      return clean && clean !== href ? `${clean} (${href})` : href;
    })
    // Strip remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode the common entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ')
    // Collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL);
}

export async function sendMail(args: SendMailArgs): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const defaultFrom = process.env.FROM_EMAIL;
  if (!apiKey || !defaultFrom) {
    return { ok: false, status: 0, error: 'Mail not configured (missing RESEND_API_KEY or FROM_EMAIL)' };
  }

  const fromAddr = args.from ?? defaultFrom;
  const from = fromAddr.includes('<') ? fromAddr : `${DEFAULT_FROM_NAME} <${fromAddr}>`;
  const replyTo = args.replyTo || process.env.REPLY_TO_EMAIL || DEFAULT_REPLY_TO;
  const toArray = Array.isArray(args.to) ? args.to : [args.to];

  const kind = args.kind || 'marketing';
  const text = args.text || htmlToPlainText(args.html);

  // Build Resend payload
  const payload: Record<string, unknown> = {
    from,
    to: toArray,
    subject: args.subject,
    html: args.html,
    text,
    reply_to: replyTo,
  };

  // Custom headers — Resend supports these via the `headers` field.
  const headers: Record<string, string> = {};

  if (kind === 'marketing') {
    const unsubBase = process.env.UNSUBSCRIBE_BASE_URL || DEFAULT_UNSUB_BASE;
    const unsubUrl = args.unsubToken
      ? `${unsubBase}?u=${encodeURIComponent(args.unsubToken)}`
      : unsubBase;
    const unsubMailto = `mailto:${replyTo}?subject=unsubscribe`;
    // RFC 2369 — list both for max client coverage. Gmail/Yahoo/Apple all honor URL form.
    headers['List-Unsubscribe'] = `<${unsubMailto}>, <${unsubUrl}>`;
    // RFC 8058 — signals one-click compliance to Gmail/Yahoo's 2024 bulk-sender rules.
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  if (Object.keys(headers).length > 0) {
    payload.headers = headers;
  }

  // Attach .ics if provided. Resend accepts `attachments: [{ filename, content }]`
  // where content is base64. Setting content-type to text/calendar so Outlook
  // and Gmail render the "Add to calendar" button inline.
  if (args.ics) {
    payload.attachments = [
      {
        filename: args.ics.filename,
        content: Buffer.from(args.ics.content, 'utf8').toString('base64'),
        content_type: 'text/calendar; method=REQUEST; charset=UTF-8',
      },
    ];
  }

  let res: Response;
  try {
    res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return { ok: false, status: 0, error: `network: ${(e as Error).message}` };
  }

  let body: unknown = null;
  try { body = await res.json(); } catch { /* non-JSON */ }

  if (!res.ok) {
    const err = (body && typeof body === 'object' && 'message' in body && typeof (body as { message?: unknown }).message === 'string')
      ? (body as { message: string }).message
      : `resend ${res.status}`;
    return { ok: false, status: res.status, error: err };
  }

  const messageId = (body && typeof body === 'object' && 'id' in body && typeof (body as { id?: unknown }).id === 'string')
    ? (body as { id: string }).id
    : '';
  return { ok: true, status: res.status, messageId };
}
