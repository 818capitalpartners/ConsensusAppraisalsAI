import { NextRequest, NextResponse } from "next/server";
import { sbInsert, sbUpsert } from "@/lib/supabase";
import { normalizePhone } from "@/lib/quo-webhook";

/**
 * Called by the borrower portal's Apps Script after a successful submit.
 *
 * Auth: shared secret in Authorization: Bearer <SUBMIT_WEBHOOK_SECRET>.
 * Body: {
 *   borrower: { name, email, phone, llc, ... full form ... },
 *   product: 'dscr' | 'flip' | 'bridge' | 'commercial',
 *   summary: [{ category, count, files: [name, ...] }],
 *   drive_folder_id, drive_folder_url
 * }
 *
 * Effects:
 *   - Upsert contact in Supabase by phone (or email if no phone)
 *   - Insert deals row
 *   - Insert deal_documents rows (one per uploaded file)
 *   - Insert initial deal_status_history (null → submitted)
 *   - Send magic-link email to borrower via Resend
 *   - Return { deal_id, portal_url } so Apps Script can include it in confirmation email
 */

type Body = {
  borrower: {
    name?: string;
    email?: string;
    phone?: string;
    llc?: string;
    productKey?: string;
    productLabel?: string;
    property?: string;
    loanAmount?: string;
    ltv?: string;
    term?: string;
    [k: string]: unknown;
  };
  product?: string;
  summary?: { category: string; count: number; files: string[] }[];
  drive_folder_id?: string;
  drive_folder_url?: string;
};

async function sendMagicLinkEmail(args: {
  to: string;
  borrowerName: string;
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
        <div style="font-size:9px;letter-spacing:0.28em;color:#EFD99A;font-weight:700;">YOUR DEAL PORTAL IS READY</div>
        <div style="font-size:22px;font-weight:700;margin-top:8px;letter-spacing:-0.01em;">Welcome, ${escapeHtml(firstName)}.</div>
      </div>
      <div style="padding:24px;border:1px solid #D9D9D9;border-top:0;font-size:14px;line-height:1.65;">
        <p style="margin:0 0 14px;">
          We've set up a secure portal for your <b style="color:#1F4E78;">${escapeHtml(args.productLabel)}</b> application
          on <b style="color:#1F4E78;">${escapeHtml(args.property)}</b>.
        </p>
        <p style="margin:0 0 14px;">
          From the portal you can:
        </p>
        <ul style="margin:0 0 18px 18px;padding:0;font-size:13px;line-height:1.7;">
          <li>See your application and the documents you've submitted</li>
          <li>Track which docs we still need from you</li>
          <li>Upload additional files as you gather them</li>
          <li>See the current status of your deal</li>
          <li>Message the underwriting team directly</li>
        </ul>
        <div style="text-align:center;margin:24px 0;">
          <a href="${args.portalUrl}" style="background:#1F4E78;color:white;padding:14px 28px;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;display:inline-block;">
            Open Your Deal Portal →
          </a>
        </div>
        <p style="margin:0 0 8px;color:#7A7A7A;font-size:12px;">
          Bookmark this email — the link is unique to your deal and how you'll log back in.
          If you ever need a fresh link, just reply and we'll send one.
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
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
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

function escapeHtml(s: string): string {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c),
  );
}

export async function POST(req: NextRequest) {
  // ---- Auth ----
  const authHeader = req.headers.get("authorization") || "";
  const expected = process.env.SUBMIT_WEBHOOK_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "SUBMIT_WEBHOOK_SECRET not configured on server" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---- Parse ----
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body.borrower || {};
  const product = body.product || b.productKey || "";
  if (!b.email || !b.name || !product) {
    return NextResponse.json({ error: "Missing required fields: borrower.email, borrower.name, product" }, { status: 400 });
  }

  const phoneE164 = normalizePhone(b.phone);

  // ---- Upsert contact (best-effort — match by phone if we have one, else email) ----
  let contactId: string | null = null;
  if (phoneE164) {
    const upsertRes = await sbUpsert<{ id: string }>(
      "contacts",
      {
        phone: phoneE164,
        email: b.email,
        full_name: b.name,
        role: "borrower",
        last_contacted_at: new Date().toISOString(),
      },
      "phone",
    );
    if (upsertRes.data?.id) contactId = upsertRes.data.id;
  }
  // (If no phone or upsert failed, deal still gets created — contact_id is nullable.)

  // ---- Insert deal ----
  const dealRes = await sbInsert<{ id: string; access_token: string }>("deals", {
    contact_id: contactId,
    borrower_email: b.email,
    borrower_name: b.name,
    borrower_phone: phoneE164,
    borrower_llc: b.llc || null,
    product: product,
    property_address: b.property || null,
    loan_amount: b.loanAmount || null,
    ltv: b.ltv || null,
    term: b.term || null,
    drive_folder_id: body.drive_folder_id || null,
    drive_folder_url: body.drive_folder_url || null,
    full_form: b,
  });

  if (dealRes.error || !dealRes.data?.id) {
    return NextResponse.json({ error: `deal_insert_failed: ${dealRes.error}` }, { status: 500 });
  }

  const dealId = dealRes.data.id;
  const accessToken = dealRes.data.access_token;

  // ---- Insert documents from the submission summary ----
  const docs: Array<Record<string, unknown>> = [];
  for (const cat of body.summary || []) {
    for (const filename of cat.files || []) {
      docs.push({
        deal_id: dealId,
        category: cat.category,
        filename,
        uploaded_via: "portal",
        uploaded_by_role: "borrower",
      });
    }
  }
  if (docs.length > 0) {
    // Insert one at a time (small N; sbInsert handles single rows)
    for (const d of docs) {
      await sbInsert("deal_documents", d);
    }
  }

  // ---- Initial status history ----
  await sbInsert("deal_status_history", {
    deal_id: dealId,
    from_status: null,
    to_status: "submitted",
    changed_by: "system",
    reason: "Initial submission via borrower portal",
  });

  // ---- Build portal URL ----
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get("host") || "818capitalpartners.com"}`).replace(/\/$/, "");
  // Make access token URL-safe
  const tokenForUrl = encodeURIComponent(accessToken);
  const portalUrl = `${baseUrl}/deal?token=${tokenForUrl}`;

  // ---- Send magic link email ----
  const productLabels: Record<string, string> = {
    dscr: "DSCR",
    flip: "Fix & Flip",
    bridge: "Bridge",
    commercial: "Commercial / Multifamily",
  };
  const emailRes = await sendMagicLinkEmail({
    to: b.email,
    borrowerName: b.name,
    property: b.property || "your property",
    productLabel: productLabels[product] || product,
    portalUrl,
  });

  return NextResponse.json({
    ok: true,
    deal_id: dealId,
    portal_url: portalUrl,
    email_sent: emailRes.ok,
    email_error: emailRes.error || null,
    documents_recorded: docs.length,
  });
}
