"use client";

import { useState } from "react";

/**
 * Borrower self-serve magic-link recovery.
 *
 *   /deal/login  →  enter email  →  we re-send the magic link to that email
 *
 * No login state, no accounts. Same generic response whether the email
 * matches a deal or not (no enumeration leak).
 */

const BRAND = {
  navy: "#1F4E78",
  navyInk: "#14344F",
  mid: "#2E75B6",
  gold: "#B08A3E",
  goldSoft: "#F7F4EA",
  goldLine: "#EFD99A",
  ink: "#1C2B3A",
  mute: "#7A7A7A",
  line: "#D9D9D9",
  bg: "#F5F3EE",
  paper: "#FFFFFF",
  ok: "#1E8449",
  err: "#C0392B",
};

export default function DealLoginPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/deals/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok && json?.error) {
        setError(json.error);
      } else {
        setSubmitted(true);
      }
    } catch (e) {
      setError(`Network error: ${(e as Error).message}`);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "Arial,sans-serif", color: BRAND.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, maxWidth: 460, width: "100%" }}>
        {/* Header */}
        <div style={{ background: BRAND.navy, color: "white", padding: "20px 24px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.28em", color: BRAND.goldLine, fontWeight: 700 }}>818 CAPITAL · DEAL PORTAL</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, letterSpacing: "-0.01em" }}>
            {submitted ? "Check your email." : "Get back to your deal."}
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={submit} style={{ padding: 28 }}>
            <p style={{ fontSize: 14, color: BRAND.ink, lineHeight: 1.6, margin: "0 0 18px" }}>
              Lost your portal link? Enter the email you used when you submitted your application and we'll send you a fresh one.
            </p>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", color: BRAND.mute, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                width: "100%",
                fontFamily: "Arial,sans-serif",
                fontSize: 14,
                padding: "12px 14px",
                border: `1px solid ${BRAND.line}`,
                background: "white",
                color: BRAND.ink,
                marginBottom: 16,
                boxSizing: "border-box",
              }}
              disabled={submitting}
            />
            {error && (
              <div style={{ color: BRAND.err, fontSize: 12, marginBottom: 12, background: "#FDEDEB", padding: "8px 12px", borderRadius: 4 }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: submitting ? BRAND.mute : BRAND.navy,
                color: "white",
                border: 0,
                padding: "14px 24px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: submitting ? "wait" : "pointer",
                fontFamily: "Arial,sans-serif",
              }}
            >
              {submitting ? "Sending…" : "Email me my portal link →"}
            </button>
            <p style={{ fontSize: 11, color: BRAND.mute, lineHeight: 1.5, margin: "18px 0 0", textAlign: "center" }}>
              Don't have an application yet?{" "}
              <a href="/borrower-portal.html" style={{ color: BRAND.mid, textDecoration: "none", fontWeight: 600 }}>
                Start one here →
              </a>
            </p>
          </form>
        ) : (
          <div style={{ padding: "32px 28px" }}>
            <div style={{ width: 64, height: 64, background: BRAND.ok, borderRadius: "50%", margin: "0 auto 22px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 36, fontWeight: 700 }}>
              ✓
            </div>
            <p style={{ fontSize: 14, color: BRAND.ink, lineHeight: 1.65, textAlign: "center", margin: "0 0 16px" }}>
              If a deal exists for <b style={{ color: BRAND.navy }}>{email}</b>, we just sent a fresh portal link to that address.
            </p>
            <p style={{ fontSize: 12, color: BRAND.mute, lineHeight: 1.6, textAlign: "center", margin: "0 0 22px" }}>
              Check your inbox in the next 30 seconds. Bookmark the email this time so you don't have to request another link in the future.
            </p>
            <button
              onClick={() => { setSubmitted(false); setEmail(""); }}
              style={{
                width: "100%",
                background: "transparent",
                color: BRAND.navy,
                border: `1px solid ${BRAND.navy}`,
                padding: "12px 22px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "Arial,sans-serif",
              }}
            >
              Use a different email
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "14px 24px", background: BRAND.bg, borderTop: `1px solid ${BRAND.line}`, fontSize: 10, color: BRAND.mid, letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 700, textAlign: "center" }}>
          The Relationship Behind the Capital
        </div>
      </div>
    </div>
  );
}
