import { NextRequest, NextResponse } from "next/server";
import { sbSelect } from "@/lib/supabase";

/**
 * Token-authenticated read of a deal.
 *
 * The borrower's magic-link email contains a URL like:
 *   /deal?token=<access_token>
 *
 * The /deal page calls this route to fetch deal data after validating
 * the token in the database. RLS keeps anon clients out — the service
 * role lookup runs server-side and only returns data when the token
 * matches an active deal.
 *
 * Returns:
 *   {
 *     deal: { id, borrower_*, product, property_address, loan_*, status, drive_folder_url, ... },
 *     documents: [{ id, category, filename, drive_file_url, uploaded_at, uploaded_via }, ...],
 *     messages:  [{ id, sender_role, sender_name, body, created_at }, ...] (only visible_to_borrower),
 *     status_history: [{ from_status, to_status, created_at, reason }, ...],
 *   }
 */

type Deal = {
  id: string;
  borrower_email: string;
  borrower_name: string | null;
  borrower_phone: string | null;
  borrower_llc: string | null;
  product: string;
  property_address: string | null;
  loan_amount: string | null;
  ltv: string | null;
  term: string | null;
  loan_status: string;
  drive_folder_url: string | null;
  full_form: unknown;
  submitted_at: string;
  status_updated_at: string;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token || token.length < 16 || token.length > 200) {
    return NextResponse.json({ error: "Invalid or missing token" }, { status: 400 });
  }

  // PostgREST's eq filter URL-encodes special chars; encodeURIComponent handles it
  const dealRes = await sbSelect<Deal>(
    "deals",
    `access_token=eq.${encodeURIComponent(token)}&select=id,borrower_email,borrower_name,borrower_phone,borrower_llc,product,property_address,loan_amount,ltv,term,loan_status,drive_folder_url,full_form,submitted_at,status_updated_at`,
  );

  if (dealRes.error) {
    return NextResponse.json({ error: dealRes.error }, { status: 500 });
  }
  const deal = dealRes.data?.[0];
  if (!deal) {
    return NextResponse.json({ error: "Deal not found. Your link may have expired or been rotated." }, { status: 404 });
  }

  // Fetch documents, messages (borrower-visible only), and status history in parallel
  const [docsRes, messagesRes, historyRes] = await Promise.all([
    sbSelect<{ id: string; category: string; filename: string; drive_file_url: string | null; uploaded_at: string; uploaded_via: string }>(
      "deal_documents",
      `deal_id=eq.${deal.id}&select=id,category,filename,drive_file_url,uploaded_at,uploaded_via&order=uploaded_at.desc`,
    ),
    sbSelect<{ id: string; sender_role: string; sender_name: string | null; body: string; created_at: string }>(
      "deal_messages",
      `deal_id=eq.${deal.id}&visible_to_borrower=eq.true&select=id,sender_role,sender_name,body,created_at&order=created_at.asc`,
    ),
    sbSelect<{ from_status: string | null; to_status: string; reason: string | null; created_at: string }>(
      "deal_status_history",
      `deal_id=eq.${deal.id}&select=from_status,to_status,reason,created_at&order=created_at.asc`,
    ),
  ]);

  return NextResponse.json({
    deal,
    documents: docsRes.data || [],
    messages: messagesRes.data || [],
    status_history: historyRes.data || [],
  });
}
