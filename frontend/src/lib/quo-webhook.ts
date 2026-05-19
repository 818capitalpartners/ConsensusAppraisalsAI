/**
 * Quo (OpenPhone) webhook signature verification.
 *
 * Ports backend/app/services/openphone.py:verify_webhook to TypeScript.
 *
 * Header `openphone-signature` format: "hmac;1;<ms_timestamp>;<base64_sig>"
 * HMAC-SHA256 over `<timestamp>.<raw_body>`, key = base64-decoded webhook secret.
 *
 * Docs: https://www.openphone.com/docs/webhooks#signing
 */

import crypto from "crypto";

const MAX_SKEW_SEC = 600; // 10 min replay window

/**
 * Verify a Quo webhook signature against one or more candidate secrets.
 * Returns { ok: true } on first match; on failure returns the most-informative
 * reason from the candidate list (so secret_not_base64 wins over signature_mismatch
 * which wins over no_secret_configured).
 *
 * Pass an array of secrets when rotating: the new secret first, the old one as
 * a fallback. Both are tried until one matches.
 */
export function verifyQuoSignature(
  signatureHeader: string | null | undefined,
  rawBody: string,
  secret: string | string[],
): { ok: true; matchedSecretIndex: number } | { ok: false; reason: string } {
  const secrets = (Array.isArray(secret) ? secret : [secret]).filter((s) => !!s);
  if (secrets.length === 0) return { ok: false, reason: "no_secret_configured" };
  if (!signatureHeader) return { ok: false, reason: "no_signature_header" };

  const parts = signatureHeader.split(";");
  if (parts.length !== 4) return { ok: false, reason: "malformed_header" };
  const [scheme, version, ts, sig] = parts;
  if (scheme !== "hmac" || version !== "1") return { ok: false, reason: "unsupported_scheme" };

  const tsMs = Number.parseInt(ts, 10);
  if (!Number.isFinite(tsMs)) return { ok: false, reason: "bad_timestamp" };
  if (Math.abs(Date.now() - tsMs) > MAX_SKEW_SEC * 1000) {
    return { ok: false, reason: "timestamp_skew_exceeded" };
  }

  let lastReason = "signature_mismatch";
  for (let i = 0; i < secrets.length; i++) {
    let key: Buffer;
    try {
      key = Buffer.from(secrets[i], "base64");
    } catch {
      lastReason = "secret_not_base64";
      continue;
    }

    const signedData = `${ts}.${rawBody}`;
    const expected = crypto.createHmac("sha256", key).update(signedData).digest("base64");
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return { ok: true, matchedSecretIndex: i };
    }
  }
  return { ok: false, reason: lastReason };
}

/** Normalize phone numbers to E.164 (+1XXXXXXXXXX). Returns null if input is unparseable. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9+]/g, "");
  if (!digits) return null;
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits.length >= 4 ? `+${digits}` : null;
}

/** True if the number looks like a 5-6 digit short code (carrier alerts, OTP, marketing). */
export function isShortCode(phone: string): boolean {
  const stripped = phone.replace(/^\+/, "");
  return /^\d{5,6}$/.test(stripped);
}
