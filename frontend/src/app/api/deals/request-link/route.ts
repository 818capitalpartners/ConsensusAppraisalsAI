import { NextRequest, NextResponse } from "next/server";
import { sbSelect } from "@/lib/supabase";

/**
 * Self-serve magic-link recovery.
 *
 *   POST /api/deals/request-link  { email: "borrower@example.com" }
 *
 * Looks up the most recent active deal for that email. If found, re-sends
 * the magic-link email via Resend. Always returns a generic 200 response
 * regardless of whether the email exists — prevents enumeration.
 *
 * Rate-limit-friendly: same email asking again just re-sends the same
 * existing access_token. We don't rotate the token here; that would
 * orphan any prior bookmark the borrower made.
 */

type Deal = {
  id: string;
  borrower_email: string;
  borrower_name: string | null;
  product: string;
  property_address: string | null;
  access_token: string;
  loan_status: string;
};

const PRODUCT_LABELS: Record<string, string> = {
  dscr: "DSCR (Rental)",
  flip: "Fix & Flip",
  bridge: "Bridge",
  commercial: "Commercial / Multifamily",
};

function escapeHtml(s: string): string {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c),
  );
}

async function sendRecoveryEmail(args: {
  to: string;
  borrowerName: string | null;
  property: string;
  productLabel: string;
  portalUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };

  const fromName = "818 Capital Partners";
  const fromAddr = process.env.FROM_EMAIL || "deals@818capitalpartners.com";
  const firstName = (args.borrowerName || "").trim().split(/\s+/)[0] || "there";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#262626;">
      <div style="background:#1F4E78;color:white;padding:20px 24px;">
        <div style="font-size:9px;letter-spacing:0.28em;color:#EFD99A;font-weight:700;">YOUR PORTAL LINK</div>
        <div style="font-size:22px;font-weight:700;margin-top:8px;letter-spacing:-0.01em;">Hi, ${escapeHtml(firstName)}.</div>
      </div>
      <div style="padding:24px;border:1px solid #D9D9D9;border-top:0;font-size:14px;line-height:1.65;">
        <p style="margin:0 0 14px;">
          Here's a fresh link to your <b style="color:#1F4E78;">${escapeHtml(args.productLabel)}</b> deal portal
          for <b style="color:#1F4E78;">${escapeHtml(args.property)}</b>.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${args.portalUrl}" style="background:#1F4E78;color:white;padding:14px 28px;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;display:inline-block;">
            Open Your Deal Portal →
          </a>
        </div>
        <p style="margin:0 0 8px;color:#7A7A7A;font-size:12px;">
          Bookmark this email so you don't have to request another link in the future.
          If you didn't request this, you can safely ignore — no changes were made to your deal.
        </p>
        <hr style="border:0;border-top:1px solid #D9D9D9;margin:22px 0;">
        <div style="font-size:13px;">
          <b style="color:#1F4E78;">Ravi Punn</b><br>
          Principal · 818 Capital Partners<br>
          <a href="mailto:deals@818capitalpartners.com" style="color:#1F4E78;">deals@818capitalpartners.com</a><br>
          (917) 993-9194
        </div>
      </div>
      <div style="padding:14px 24px;background:#F5F3EE;border:1px solid #D9D9D9;border-top:0;font-size:9px;color:#2E75B6;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;">
        The Relationship Behind the Capital
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${fromName} <${fromAddr}>`,
        to: [args.to],
        reply_to: "deals@818capitalpartners.com",
        subject: `Your 818 Capital portal — ${args.property}`,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `${res.status}: ${text.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Track per-IP recent requests in memory (resets on cold start; good enough)
const recentRequests = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  // Light rate limit — one request per IP per minute. Prevents accidental spam.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const last = recentRequests.get(ip);
  if (last && Date.now() - last < RATE_LIMIT_WINDOW_MS) {
    return NextResponse.json({ ok: true, message: "If a deal exists for that email, we just sent a fresh link." });
  }
  recentRequests.set(ip, Date.now());

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body?.email || "").toString().trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Look up most recent deal for this email (case-insensitive match in DB).
  // Active statuses only — don't re-send links for declined or paused deals.
  const ACTIVE = ["submitted", "reviewing", "term_sheet_sent", "in_underwriting", "closing"];
  const dealRes = await sbSelect<Deal>(
    "deals",
    `borrower_email=ilike.${encodeURIComponent(email)}&loan_status=in.(${ACTIVE.map((s) => `"${s}"`).join(",")})&order=submitted_at.desc&limit=1&select=id,borrower_email,borrower_name,product,property_address,access_token,loan_status`,
  );

  // Generic "ok" response regardless — don't leak whether the email exists.
  const genericResponse = NextResponse.json({
    ok: true,
    message: "If a deal exists for that email, we just sent a fresh link.",
  });

  if (dealRes.error || !dealRes.data || dealRes.data.length === 0) {
    return genericResponse;
  }

  const deal = dealRes.data[0];
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get("host") || "818capitalpartners.com"}`).replace(/\/$/, "");
  const portalUrl = `${baseUrl}/deal?token=${encodeURIComponent(deal.access_token)}`;

  await sendRecoveryEmail({
    to: deal.borrower_email,
    borrowerName: deal.borrower_name,
    property: deal.property_address || "your property",
    productLabel: PRODUCT_LABELS[deal.product] || deal.product,
    portalUrl,
  });

  return genericResponse;
}
