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

export function verifyQuoSignature(
  signatureHeader: string | null | undefined,
  rawBody: string,
  secret: string,
): { ok: true } | { ok: false; reason: string } {
  if (!secret) return { ok: false, reason: "no_secret_configured" };
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

  let key: Buffer;
  try {
    key = Buffer.from(secret, "base64");
  } catch {
    return { ok: false, reason: "secret_not_base64" };
  }

  const signedData = `${ts}.${rawBody}`;
  const expected = crypto.createHmac("sha256", key).update(signedData).digest("base64");

  // Constant-time compare
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature_mismatch" };
  }
  return { ok: true };
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
