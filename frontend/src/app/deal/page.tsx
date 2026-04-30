"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Borrower-facing deal portal.
 *
 *   /deal?token=<access_token>  →  validates token, shows deal page
 *
 * No login required — the magic-link email IS the auth. Same pattern
 * as Stripe receipt links, Calendly bookings, etc. Token can be
 * rotated server-side if compromised.
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
  full_form: Record<string, unknown> | null;
  submitted_at: string;
  status_updated_at: string;
};

type DocRow = {
  id: string;
  category: string;
  filename: string;
  drive_file_url: string | null;
  uploaded_at: string;
  uploaded_via: string;
};

type MessageRow = {
  id: string;
  sender_role: string;
  sender_name: string | null;
  body: string;
  created_at: string;
};

type StatusHistoryRow = {
  from_status: string | null;
  to_status: string;
  reason: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  reviewing: "Under review",
  term_sheet_sent: "Term sheet sent",
  in_underwriting: "In underwriting",
  closing: "Closing",
  closed_funded: "Funded ✅",
  declined: "Declined",
  paused: "Paused",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: BRAND.mid,
  reviewing: BRAND.gold,
  term_sheet_sent: BRAND.navy,
  in_underwriting: BRAND.navy,
  closing: BRAND.gold,
  closed_funded: BRAND.ok,
  declined: BRAND.err,
  paused: BRAND.mute,
};

const PRODUCT_LABELS: Record<string, string> = {
  dscr: "DSCR (Rental)",
  flip: "Fix & Flip",
  bridge: "Bridge",
  commercial: "Commercial / Multifamily",
};

const CATEGORY_LABELS: Record<string, string> = {
  sponsor: "Sponsor / Guarantor",
  entity: "Borrowing Entity",
  property: "Property",
  valuation: "Valuation",
  title: "Title / Closing",
  unsorted: "Pending sort",
};

const CATEGORY_ORDER = ["sponsor", "entity", "property", "valuation", "title", "unsorted"];

// What's REQUIRED per product. Used to compute "still need from you".
// (Compact subset of the full matrix — only the items a borrower can supply.)
const REQUIRED_BY_PRODUCT: Record<string, Record<string, string[]>> = {
  dscr: {
    sponsor: ["Driver's license (front + back)", "Personal Financial Statement (signed, <90 days)", "Schedule of Real Estate Owned", "Two months personal bank statements", "Loan application"],
    entity: ["Articles of Organization", "Operating Agreement", "EIN letter (CP-575) or W-9", "Certificate of Good Standing"],
    property: ["Purchase contract OR existing mortgage payoff", "Current rent roll signed/dated", "Executed leases for occupied units", "Property insurance binder", "Current property tax bill", "Property photos"],
    valuation: ["AMC appraisal"],
    title: [],
  },
  flip: {
    sponsor: ["Driver's license", "PFS (<90 days)", "SREO (must tie to PFS)", "Two months bank statements", "Resume / sponsor bio", "Track record (last 5–10 flips)", "Loan application"],
    entity: ["Articles of Organization", "Operating Agreement", "EIN letter / W-9", "Certificate of Good Standing"],
    property: ["Executed purchase contract", "Earnest money deposit receipt", "Detailed rehab budget (line items)", "Scope of work narrative", "GC name + license + insurance", "Builder's risk policy + vacant rider", "Exit strategy memo"],
    valuation: ["As-Is appraisal", "ARV value with comps"],
    title: [],
  },
  bridge: {
    sponsor: ["Driver's license", "PFS + SREO (must tie)", "Two months bank statements", "Resume / sponsor bio", "Loan application"],
    entity: ["Articles of Organization", "Operating Agreement", "EIN letter / W-9", "Certificate of Good Standing"],
    property: ["Purchase contract OR existing mortgage payoff", "Current rent roll", "Property insurance binder", "Pro forma — path to stabilization", "Market rent comps", "Exit strategy memo"],
    valuation: ["Lender-ordered appraisal"],
    title: [],
  },
  commercial: {
    sponsor: ["Sponsor names + ownership %", "Net worth & liquidity (ballpark)", "Bio / track record"],
    entity: ["Borrower entity name + state of formation", "Org chart"],
    property: ["Address, year built, units, asset class", "Current rent roll (within 30 days)", "Trailing 12 (T-12)", "Trailing 3 (T-3) collections", "Photos (5-10)", "Purchase price OR current basis", "Loan request details", "Use of proceeds"],
    valuation: [],
    title: [],
  },
};

function DealPageInner() {
  const params = useSearchParams();
  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [history, setHistory] = useState<StatusHistoryRow[]>([]);

  const load = useCallback(async () => {
    if (!token) {
      setError("No access token in URL. The magic link from your email is required.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deals/by-token?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || `Server returned ${res.status}`);
      } else {
        setDeal(json.deal);
        setDocs(json.documents || []);
        setMessages(json.messages || []);
        setHistory(json.status_history || []);
      }
    } catch (e) {
      setError(`Network error: ${(e as Error).message}`);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <CenteredMessage>Loading your deal portal…</CenteredMessage>;
  }
  if (error) {
    return (
      <CenteredMessage>
        <div style={{ color: BRAND.err, fontWeight: 600, marginBottom: 6 }}>Couldn&apos;t load this portal</div>
        <div style={{ color: BRAND.mute, fontSize: 13 }}>{error}</div>
        <div style={{ color: BRAND.mute, fontSize: 12, marginTop: 16 }}>
          If you need a fresh link, reply to your most recent 818 Capital email and we&apos;ll send one.
        </div>
      </CenteredMessage>
    );
  }
  if (!deal) return <CenteredMessage>No deal found.</CenteredMessage>;

  // Compute uploaded counts per category
  const uploadedByCategory: Record<string, DocRow[]> = {};
  for (const c of CATEGORY_ORDER) uploadedByCategory[c] = [];
  for (const d of docs) {
    const k = d.category || "unsorted";
    (uploadedByCategory[k] || (uploadedByCategory[k] = [])).push(d);
  }

  // Compute "still missing" per category (best-effort heuristic — count required vs uploaded)
  const required = REQUIRED_BY_PRODUCT[deal.product] || {};

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "Arial,sans-serif", color: BRAND.ink }}>
      {/* Header */}
      <div style={{ background: BRAND.navy, color: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.28em", color: BRAND.goldLine, fontWeight: 700 }}>818 CAPITAL · DEAL PORTAL</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{deal.borrower_name || deal.borrower_email}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
            {deal.property_address || "Property TBD"} · {PRODUCT_LABELS[deal.product] || deal.product}
          </div>
        </div>
        <span
          style={{
            background: STATUS_COLORS[deal.loan_status] || BRAND.mid,
            color: "#fff",
            padding: "6px 14px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {STATUS_LABELS[deal.loan_status] || deal.loan_status}
        </span>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: 28 }}>
        {/* Deal info card */}
        <Card title="Your application">
          <DataRow label="Submitted" value={new Date(deal.submitted_at).toLocaleString()} />
          <DataRow label="Borrower" value={deal.borrower_name} />
          <DataRow label="Email" value={deal.borrower_email} />
          <DataRow label="Phone" value={deal.borrower_phone} />
          <DataRow label="Entity" value={deal.borrower_llc} />
          <DataRow label="Property" value={deal.property_address} />
          <DataRow label="Loan amount" value={deal.loan_amount} />
          <DataRow label="LTV target" value={deal.ltv} />
          <DataRow label="Term" value={deal.term} />
        </Card>

        {/* Documents */}
        <Card title={`Your documents (${docs.length})`}>
          {CATEGORY_ORDER.map((cat) => {
            const reqList = required[cat] || [];
            const uploaded = uploadedByCategory[cat] || [];
            if (reqList.length === 0 && uploaded.length === 0) return null;
            const stillNeeded = Math.max(0, reqList.length - uploaded.length);
            return (
              <div key={cat} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.18em", color: BRAND.mid, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
                  {CATEGORY_LABELS[cat] || cat}
                  {reqList.length > 0 && (
                    <span style={{ color: stillNeeded > 0 ? BRAND.err : BRAND.ok, marginLeft: 10, fontSize: 11 }}>
                      {uploaded.length} of {reqList.length} {stillNeeded === 0 ? "✓" : `· ${stillNeeded} still needed`}
                    </span>
                  )}
                </div>
                {uploaded.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {uploaded.map((d) => (
                      <div key={d.id} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, padding: "8px 12px", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 500, color: BRAND.navy }}>{d.filename}</span>
                        <span style={{ fontSize: 10, color: BRAND.mute }}>
                          {new Date(d.uploaded_at).toLocaleDateString()} · {d.uploaded_via}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: BRAND.mute, fontStyle: "italic", padding: "6px 0" }}>
                    Nothing uploaded yet for this category.
                  </div>
                )}
                {reqList.length > 0 && stillNeeded > 0 && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ fontSize: 11, color: BRAND.mid, cursor: "pointer" }}>What's still needed</summary>
                    <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: 11, color: BRAND.ink, lineHeight: 1.6 }}>
                      {reqList.slice(uploaded.length).map((item, i) => (
                        <li key={i} style={{ listStyle: "disc" }}>{item}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })}
          {docs.length === 0 && (
            <div style={{ color: BRAND.mute, fontSize: 13, fontStyle: "italic" }}>
              No documents recorded yet.
            </div>
          )}
        </Card>

        {/* Upload more */}
        <Card title="Submit additional files">
          <div style={{ fontSize: 13, color: BRAND.ink, lineHeight: 1.6 }}>
            <p style={{ marginTop: 0 }}>
              You can upload more documents through the original portal — or reply to any email from us with attachments and we&apos;ll add them for you.
            </p>
            <div style={{ marginTop: 14 }}>
              <a
                href="/borrower-portal.html"
                style={{
                  background: BRAND.navy,
                  color: "white",
                  padding: "10px 20px",
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "inline-block",
                  marginRight: 10,
                }}
              >
                Upload More Files →
              </a>
              <a
                href="mailto:deals@818capitalpartners.com?subject=Additional%20docs%20for%20my%20deal"
                style={{
                  background: "transparent",
                  color: BRAND.navy,
                  border: `1px solid ${BRAND.navy}`,
                  padding: "10px 20px",
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "inline-block",
                }}
              >
                Reply with Files
              </a>
            </div>
          </div>
        </Card>

        {/* Messages */}
        {messages.length > 0 && (
          <Card title="Messages from your deal team">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: m.sender_role === "borrower" ? BRAND.goldSoft : BRAND.paper,
                    border: `1px solid ${BRAND.line}`,
                    borderLeft: `3px solid ${m.sender_role === "admin" ? BRAND.navy : m.sender_role === "borrower" ? BRAND.gold : BRAND.mid}`,
                    padding: 12,
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontSize: 11, color: BRAND.mute, marginBottom: 4 }}>
                    <b>{m.sender_name || (m.sender_role === "admin" ? "818 Capital team" : m.sender_role === "borrower" ? "You" : "System")}</b> · {new Date(m.created_at).toLocaleString()}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Status timeline */}
        {history.length > 0 && (
          <Card title="Status history">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 12 }}>
                  <span style={{ color: BRAND.mute, fontFamily: "ui-monospace,monospace", fontSize: 11, minWidth: 110 }}>
                    {new Date(h.created_at).toLocaleDateString()}
                  </span>
                  <span style={{ color: BRAND.navy, fontWeight: 600 }}>
                    {STATUS_LABELS[h.to_status] || h.to_status}
                  </span>
                  {h.reason && <span style={{ color: BRAND.mute, fontSize: 11 }}>· {h.reason}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Footer */}
        <div style={{ marginTop: 32, borderTop: `2px solid ${BRAND.navy}`, paddingTop: 16, textAlign: "center", fontSize: 11, color: BRAND.mute }}>
          <b style={{ color: BRAND.navy }}>818 Capital Partners</b> ·{" "}
          <a href="mailto:deals@818capitalpartners.com" style={{ color: BRAND.mid, textDecoration: "none" }}>
            deals@818capitalpartners.com
          </a>{" "}
          · (917) 993-9194
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, padding: 22, marginBottom: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.navyInk, letterSpacing: "-0.01em", marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${BRAND.mid}` }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, padding: "5px 0", fontSize: 13, borderBottom: `1px dotted ${BRAND.line}` }}>
      <span style={{ color: BRAND.mute, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ color: BRAND.navy, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial,sans-serif" }}>
      <div style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, padding: 36, textAlign: "center", maxWidth: 480 }}>
        {children}
      </div>
    </div>
  );
}

export default function DealPage() {
  return (
    <Suspense fallback={<CenteredMessage>Loading…</CenteredMessage>}>
      <DealPageInner />
    </Suspense>
  );
}
