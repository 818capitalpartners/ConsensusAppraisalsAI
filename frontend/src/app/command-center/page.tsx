"use client";
import { useState, useEffect, useCallback } from "react";

// ── Brand tokens ──────────────────────────────────────────────
const BRAND = {
  blue: "#0066CB",
  navy: "#1F4E78",
  lightBlue: "#E8F2FF",
  bg: "#F4F7FB",
  card: "#FFFFFF",
  border: "#D0E2F4",
  text: "#1a2a3a",
  muted: "#6b7e92",
  green: "#22c55e",
  yellow: "#f59e0b",
  red: "#ef4444",
  orange: "#f97316",
};

// ── Constants ─────────────────────────────────────────────────
const MONDAY_BOARD_ID = "18402100042";
const SCENARIO_IDS = ["4386974", "4387451", "4364165", "4364486", "4312564", "4312679"];

const MCP_SERVERS = [
  { type: "url", url: "https://mcp.monday.com/mcp", name: "monday-mcp" },
  { type: "url", url: "https://gmail.mcp.claude.com/mcp", name: "gmail-mcp" },
  { type: "url", url: "https://mcp.make.com", name: "make-mcp" },
];

// ── Shared Claude caller (all secrets stay on the server) ─────
async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  mcpServers: object[] = [],
  injectMakeKey = false,
) {
  const body: Record<string, unknown> = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  };
  if (mcpServers.length > 0) body.mcp_servers = mcpServers;
  if (injectMakeKey) body.injectMakeKey = true;
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function extractText(data: { content?: { type: string; text?: string }[] }) {
  if (!data?.content) return "";
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n");
}

const TABS = ["Pipeline", "Intake", "Outreach", "Packages", "Automations"] as const;
type Tab = (typeof TABS)[number];

const LIVE_DEALS = [
  { id: "11441511394", name: "Annie Lukach — STR Cash-Out Refi (Pigeon Forge + Nashville)", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "VFS / CoreVest / Trinity", lastUpdate: "3/18: Angela requested updated pricing from LimaOne for Lukach STR DSCR deals.", address: "The Rowan - Pigeon Forge, TN / The Ebony - Nashville, TN" },
  { id: "11441506709", name: "Sam Lukach — Royal Palms (Fort Myers, FL)", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "CoreVest / LimaOne", lastUpdate: "3/18: Sent Samuel Lukach the complete Royal Palms financing package.", address: "Royal Palms — Fort Myers, FL" },
  { id: "11441511448", name: "Mohammad Jabari — 3505 24th St NE, Washington DC", loanType: "Fix-and-Flip", status: "Appraisal", urgency: "⚠️ Needs Review", lender: "Roc Capital (#124918)", lastUpdate: "3/18: Appraisal from Tamarisk AMC overdue (ordered 3/11, due 3/16). Blocked.", address: "3505 24th St NE, Washington, DC 20018" },
  { id: "11543789225", name: "Mohammad Jabari — 13429 Fairland Park Dr, Silver Spring MD", loanType: "Fix-and-Flip", status: "Appraisal", urgency: "🔥 Hot", lender: "Center Street Lending", lastUpdate: "3/18: Ryan St. John sent appraisal payment link. Awaiting UW items list.", address: "13429 Fairland Park Dr, Silver Spring, MD 20904" },
  { id: "11441511116", name: "Mohammad Jabari — 1614 Decatur St NW (FUNDED ✅)", loanType: "Fix-and-Flip", status: "Funded", urgency: "✅ Clear to Advance", lender: "Center Street Lending", lastUpdate: "3/18: Insurance discrepancy East vs World Insurance flagged to Nick Gegen.", address: "1614 Decatur St NW, Washington, DC 20011" },
  { id: "11439799433", name: "Pascual #124339 — 220 SE Robert Street, Burleson TX", loanType: "Fix-and-Flip", status: "Title / Closing", urgency: "⚠️ Needs Review", lender: "ROC Capital (LSF #124339)", lastUpdate: "3/18: Title corrections sent. Survey missing. Closing delayed.", address: "220 SE Robert Street, Burleson, TX 76028" },
  { id: "11441479178", name: "4763 Westcreek Dr — Fort Worth TX (ROC #122951)", loanType: "Fix-and-Flip", status: "Lender Review", urgency: "🚫 BLOCKED", lender: "ROC Capital", lastUpdate: "3/18: No new activity. Jake passport/ID missing, FinCEN pending.", address: "4763 Westcreek Dr, Fort Worth, TX 76133" },
  { id: "11439798512", name: "600 S Cherry Lane — NorthMarq / ICADV", loanType: "Commercial", status: "Lender Review", urgency: "⚠️ Needs Review", lender: "Innovative Capital Advisors", lastUpdate: "3/18: Sent approved AMC inquiry to NorthMarq. Awaiting reply.", address: "600 S Cherry Lane, White Settlement, TX" },
  { id: "11441506455", name: "1713 E 69th Pl — Karim El Raddaf (Cleveland, OH) — CLF", loanType: "Commercial", status: "Lender Review", urgency: "🚫 BLOCKED", lender: "Commercial Loan Funding (CLF)", lastUpdate: "3/18: Forwarded full package to Sam Thomas/Dominion. Deal may be killed.", address: "1713 E 69th Place, Cleveland, OH 44103" },
  { id: "11441467690", name: "1631 E Maura St — Nuke Em Clean LLC (Pensacola, FL)", loanType: "Fix-and-Flip", status: "Title / Closing", urgency: "⚠️ Needs Review", lender: "Stormfield Capital", lastUpdate: "3/18: Coordinating closing docs with Riley Gousse. Moving to close.", address: "1631 E Maura St, Pensacola, FL" },
  { id: "11441495852", name: "5050 1st Ave S — Lance Woodyard (St. Pete, FL) — Visio 1522770", loanType: "DSCR", status: "Appraisal", urgency: "🔥 Hot", lender: "Visio Lending", lastUpdate: "3/18: Pressed FastApp for appraisal delivery date. Insurance issue with Taryn at Visio.", address: "5050 1st Ave S, St. Petersburg, FL" },
  { id: "11441511420", name: "Al Boyce — Maine (BLOCKED — Unpaid Appraisal AM-0340120)", loanType: "DSCR", status: "Appraisal", urgency: "🚫 BLOCKED", lender: "TBD", lastUpdate: "3/18: AmeriMac daily unpaid reminders for AM-0340120. Confirm pay or cancel.", address: "Maine (exact address TBD)" },
  { id: "11441503253", name: "Hari Yadav — Loan 262-03476 / 1521980", loanType: "DSCR", status: "Lender Review", urgency: "⚠️ Needs Review", lender: "TBD", lastUpdate: "3/18: Angela requested updated pricing from LimaOne for Yadav deal.", address: "TBD" },
  { id: "11441508313", name: "Marvin Lalin — Magnifico Investments (NJ/NY Portfolio)", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "ROC Capital (portal #124577-79)", lastUpdate: "3/18: Bridge financing decks from Freedom Trail Capital received for review.", address: "218 Fall St Seneca Falls NY / 31 Blakely Pl Garfield NJ" },
  { id: "11441516455", name: "31 Blakely — Visio (Marvin Lalin)", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "Visio", lastUpdate: "Awaiting borrower application.", address: "31 Blakely Pl, Garfield, NJ" },
  { id: "11441508641b", name: "Jon Veitch — Idaho STR DSCR", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "LimaOne", lastUpdate: "3/18: Angela requested updated pricing from LimaOne for Veitch Idaho STR DSCR.", address: "Idaho (TBD)" },
  { id: "11441500079", name: "Tiina Collins — 168 Elliman GA", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "LimaOne", lastUpdate: "3/18: Angela requested updated pricing from LimaOne for Collins deal.", address: "Ellman Dr, GA" },
  { id: "11441500032", name: "1817 Dolores — Martin Pascual (LimaOne)", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "LimaOne", lastUpdate: "Confirm borrower, address, and stage.", address: "1817 Dolores (TBD)" },
  { id: "11441504191", name: "Fink — 3580 Shipwatch", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "TBD", lastUpdate: "Confirm full address and lender.", address: "3580 Shipwatch (TBD)" },
  { id: "11441514833", name: "Franco DiRenzo — Deal (TBD)", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "TBD", lastUpdate: "Confirm property address, loan type, and lender.", address: "TBD" },
  { id: "11441514834", name: "Grigonis — Visio (DSCR)", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "Visio", lastUpdate: "Confirm property address and loan amount.", address: "TBD" },
  { id: "11441514793", name: "Gupta — Oakland, CA", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "TBD", lastUpdate: "Confirm full borrower name, lender, and stage.", address: "Oakland, CA" },
  { id: "11441515075", name: "McConnel — Tulsa, OK", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "TBD", lastUpdate: "Confirm full borrower name, lender, and stage.", address: "Tulsa, OK" },
  { id: "11441508206", name: "Nanez — Deal (TBD)", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "TBD", lastUpdate: "Confirm property address, loan type, and lender.", address: "TBD" },
  { id: "11441512297", name: "Pascual — Possible 2nd Deal (Confirm vs Fort Worth)", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "TBD", lastUpdate: "Confirm if this is separate from 4763 Westcreek deal.", address: "TBD" },
  { id: "11441508141", name: "Pete Connor — New Mexico", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "TBD", lastUpdate: "Confirm property address and loan amount.", address: "New Mexico" },
  { id: "11441500073", name: "Denorah — Los Fresnos, TX", loanType: "DSCR", status: "Borrower Docs", urgency: "⚠️ Needs Review", lender: "TBD", lastUpdate: "Confirm full borrower name and lender.", address: "Los Fresnos, TX" },
];

// ── Pipeline Tab ──────────────────────────────────────────────
function PipelineTab() {
  const [deals, setDeals] = useState(LIVE_DEALS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callClaude(
        `You are a data extraction assistant. Use monday.com MCP to fetch all items from board ${MONDAY_BOARD_ID}.
Return ONLY a JSON array. Each object: { id, name, status, loanType, urgency, lastUpdate, address, lender }.
No markdown, no preamble.`,
        `Fetch all items from Monday.com board ${MONDAY_BOARD_ID} and return as JSON array.`,
        [MCP_SERVERS[0]],
      );
      const txt = extractText(data).replace(/```json|```/g, "").trim();
      const s = txt.indexOf("["),
        e = txt.lastIndexOf("]");
      if (s !== -1 && e !== -1) setDeals(JSON.parse(txt.slice(s, e + 1)));
      else setError("Live refresh failed — showing cached data.");
    } catch {
      setError("Live refresh failed — showing cached data.");
    }
    setLoading(false);
  }, []);

  const FILTERS = ["All", "Fix-and-Flip", "DSCR", "Commercial", "🔥 Hot", "🚫 BLOCKED", "✅ Funded"];

  const filtered = deals.filter((d) => {
    if (filter === "All") return true;
    if (filter === "🔥 Hot") return d.urgency?.includes("Hot");
    if (filter === "🚫 BLOCKED") return d.urgency?.includes("BLOCKED");
    if (filter === "✅ Funded") return d.status === "Funded" || d.name?.includes("FUNDED");
    return d.loanType === filter;
  });

  const urgencyColor = (u: string) => {
    if (!u) return BRAND.muted;
    if (u.includes("BLOCKED") || u.includes("🚫")) return BRAND.red;
    if (u.includes("Hot") || u.includes("🔥")) return BRAND.orange;
    if (u.includes("✅")) return BRAND.green;
    return BRAND.yellow;
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      "Title / Closing": "#7c3aed",
      Appraisal: BRAND.orange,
      "Lender Review": BRAND.blue,
      "Borrower Docs": BRAND.muted,
      Funded: BRAND.green,
    };
    return m[s] || BRAND.blue;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ color: BRAND.navy, fontSize: 18, fontWeight: 700, margin: 0 }}>
          Deal Pipeline{" "}
          <span style={{ fontSize: 13, color: BRAND.muted, fontWeight: 400 }}>({filtered.length} deals)</span>
        </h2>
        <button
          onClick={load}
          style={{ background: BRAND.blue, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
        >
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              border: `1px solid ${filter === f ? BRAND.blue : BRAND.border}`,
              background: filter === f ? BRAND.blue : "#fff",
              color: filter === f ? "#fff" : BRAND.text,
              fontSize: 12,
              cursor: "pointer",
              fontWeight: filter === f ? 600 : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>
      {error && (
        <div style={{ color: BRAND.orange, marginBottom: 10, fontSize: 12, background: "#fff7ed", padding: "6px 10px", borderRadius: 5 }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {filtered.map((d, i) => (
          <div
            key={d.id || i}
            style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 8, overflow: "hidden", borderLeft: `3px solid ${urgencyColor(d.urgency)}` }}
          >
            <div
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: BRAND.text, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {d.name}
                </div>
                <div style={{ fontSize: 11, color: BRAND.muted, marginTop: 2 }}>{d.address || ""}</div>
              </div>
              <span
                style={{ fontSize: 11, background: BRAND.lightBlue, color: statusColor(d.status), borderRadius: 4, padding: "2px 7px", fontWeight: 600, flexShrink: 0 }}
              >
                {d.status || "—"}
              </span>
              <span style={{ fontSize: 11, color: BRAND.muted, background: "#f1f5f9", borderRadius: 4, padding: "2px 7px", flexShrink: 0 }}>
                {d.loanType}
              </span>
              <span style={{ color: BRAND.muted, fontSize: 11, flexShrink: 0 }}>{expanded === i ? "▲" : "▼"}</span>
            </div>
            {expanded === i && (
              <div
                style={{
                  borderTop: `1px solid ${BRAND.border}`,
                  padding: "10px 14px",
                  background: BRAND.lightBlue,
                  fontSize: 12,
                  color: BRAND.text,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "4px 16px",
                }}
              >
                <div>
                  <b>Lender:</b> {d.lender || "—"}
                </div>
                <div>
                  <b>Status:</b> {d.status || "—"}
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <b>Last Update:</b> {d.lastUpdate || "—"}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Intake Tab ────────────────────────────────────────────────
function IntakeTab() {
  const [form, setForm] = useState({
    address: "",
    loanType: "Fix & Flip",
    purchasePrice: "",
    rehabBudget: "",
    arv: "",
    trackRecord: "",
    exitTimeline: "",
    notes: "",
  });
  const [status, setStatus] = useState<{ type: string; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const loanTypes = ["Fix & Flip", "DSCR", "Bridge", "Commercial Refi", "Cash-Out Refi"];
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.address) {
      setStatus({ type: "error", msg: "Property address is required." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const data = await callClaude(
        `You are a monday.com assistant. Create a new item in board ${MONDAY_BOARD_ID} using the provided deal details. Return ONLY JSON: { success: true, itemId: "..." } or { success: false, error: "..." }`,
        `Create a new deal item: ${JSON.stringify(form)}`,
        [MCP_SERVERS[0]],
      );
      const txt = extractText(data).replace(/```json|```/g, "").trim();
      const s = txt.indexOf("{"),
        e = txt.lastIndexOf("}");
      const result = s !== -1 ? JSON.parse(txt.slice(s, e + 1)) : { success: false, error: "No response" };
      setStatus({
        type: result.success ? "success" : "error",
        msg: result.success ? `Deal created! Item ID: ${result.itemId}` : result.error,
      });
      if (result.success)
        setForm({ address: "", loanType: "Fix & Flip", purchasePrice: "", rehabBudget: "", arv: "", trackRecord: "", exitTimeline: "", notes: "" });
    } catch (e: unknown) {
      setStatus({ type: "error", msg: String(e) });
    }
    setLoading(false);
  };

  const field = (label: string, key: string, placeholder: string) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: BRAND.navy, marginBottom: 4 }}>{label}</label>
      <input
        value={(form as Record<string, string>)[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "8px 10px", border: `1px solid ${BRAND.border}`, borderRadius: 6, fontSize: 13, color: BRAND.text, boxSizing: "border-box" }}
      />
    </div>
  );

  return (
    <div>
      <h2 style={{ color: BRAND.navy, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>New Deal Intake</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        {field("Property Address *", "address", "123 Main St, City, ST")}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: BRAND.navy, marginBottom: 4 }}>Loan Type</label>
          <select
            value={form.loanType}
            onChange={(e) => set("loanType", e.target.value)}
            style={{ width: "100%", padding: "8px 10px", border: `1px solid ${BRAND.border}`, borderRadius: 6, fontSize: 13, color: BRAND.text, boxSizing: "border-box" }}
          >
            {loanTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        {field("Purchase Price", "purchasePrice", "$000,000")}
        {field("Rehab Budget", "rehabBudget", "$000,000")}
        {field("ARV", "arv", "$000,000")}
        {field("Exit Timeline", "exitTimeline", "e.g. 6 months")}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: BRAND.navy, marginBottom: 4 }}>Borrower Track Record</label>
        <textarea
          value={form.trackRecord}
          onChange={(e) => set("trackRecord", e.target.value)}
          rows={3}
          placeholder="List completed deals by address..."
          style={{ width: "100%", padding: "8px 10px", border: `1px solid ${BRAND.border}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box", resize: "vertical" }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: BRAND.navy, marginBottom: 4 }}>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          placeholder="Any additional context..."
          style={{ width: "100%", padding: "8px 10px", border: `1px solid ${BRAND.border}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box", resize: "vertical" }}
        />
      </div>
      {status && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 14px",
            borderRadius: 6,
            background: status.type === "success" ? "#dcfce7" : "#fee2e2",
            color: status.type === "success" ? "#166534" : BRAND.red,
            fontSize: 13,
          }}
        >
          {status.msg}
        </div>
      )}
      <button
        onClick={submit}
        disabled={loading}
        style={{
          background: loading ? BRAND.muted : BRAND.blue,
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "10px 24px",
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Creating deal…" : "Create Deal in Monday.com"}
      </button>
    </div>
  );
}

// ── Outreach Tab ──────────────────────────────────────────────
function OutreachTab() {
  const [threads, setThreads] = useState<{ id?: string; from?: string; to?: string; subject?: string; snippet?: string; date?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);
  const [draft, setDraft] = useState({ to: "", subject: "", body: "" });
  const [sendStatus, setSendStatus] = useState<{ type: string; msg: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callClaude(
        `You are a Gmail assistant. Search for recent emails in ravi@818capitalpartners.com related to lender outreach, loan deals, or property addresses.
Return ONLY a JSON array of up to 10 threads: [{ id, from, to, subject, snippet, date }]. No markdown, no preamble.`,
        `Search Gmail for recent lender outreach emails from ravi@818capitalpartners.com`,
        [MCP_SERVERS[1]],
      );
      const txt = extractText(data).replace(/```json|```/g, "").trim();
      const s = txt.indexOf("["),
        e = txt.lastIndexOf("]");
      if (s !== -1 && e !== -1) setThreads(JSON.parse(txt.slice(s, e + 1)));
      else setError("Could not parse email data.");
    } catch (e: unknown) {
      setError("Failed to load emails: " + String(e));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sendDraft = async () => {
    if (!draft.to || !draft.subject) {
      setSendStatus({ type: "error", msg: "To and Subject required." });
      return;
    }
    setLoading(true);
    setSendStatus(null);
    try {
      const data = await callClaude(
        `You are a Gmail assistant for ravi@818capitalpartners.com. Create a draft email. Return ONLY JSON: { success: true, draftId: "..." } or { success: false, error: "..." }`,
        `Create a Gmail draft: To: ${draft.to}, Subject: ${draft.subject}, Body: ${draft.body}`,
        [MCP_SERVERS[1]],
      );
      const txt = extractText(data).replace(/```json|```/g, "").trim();
      const s = txt.indexOf("{"),
        e = txt.lastIndexOf("}");
      const result = s !== -1 ? JSON.parse(txt.slice(s, e + 1)) : { success: false };
      setSendStatus({
        type: result.success ? "success" : "error",
        msg: result.success ? `Draft saved (ID: ${result.draftId})` : result.error,
      });
      if (result.success) {
        setCompose(false);
        setDraft({ to: "", subject: "", body: "" });
      }
    } catch (e: unknown) {
      setSendStatus({ type: "error", msg: String(e) });
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: BRAND.navy, fontSize: 18, fontWeight: 700, margin: 0 }}>Lender Outreach</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setCompose(!compose)}
            style={{ background: compose ? BRAND.muted : BRAND.navy, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
          >
            {compose ? "✕ Cancel" : "✉ Compose"}
          </button>
          <button
            onClick={load}
            style={{ background: BRAND.blue, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
          >
            {loading ? "Loading…" : "↻ Refresh"}
          </button>
        </div>
      </div>
      {compose && (
        <div style={{ background: BRAND.lightBlue, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          {(["to", "subject"] as const).map((k) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: BRAND.navy, marginBottom: 4, textTransform: "capitalize" }}>
                {k}
              </label>
              <input
                value={draft[k]}
                onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", border: `1px solid ${BRAND.border}`, borderRadius: 5, fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: BRAND.navy, marginBottom: 4 }}>Body</label>
            <textarea
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              rows={4}
              style={{ width: "100%", padding: "7px 10px", border: `1px solid ${BRAND.border}`, borderRadius: 5, fontSize: 13, boxSizing: "border-box", resize: "vertical" }}
            />
          </div>
          {sendStatus && (
            <div style={{ marginBottom: 10, fontSize: 13, color: sendStatus.type === "success" ? "#166534" : BRAND.red }}>{sendStatus.msg}</div>
          )}
          <button
            onClick={sendDraft}
            style={{ background: BRAND.blue, color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Save Draft to Gmail
          </button>
        </div>
      )}
      {error && <div style={{ color: BRAND.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {loading && !threads.length ? (
        <div style={{ color: BRAND.muted, padding: 32, textAlign: "center" }}>Pulling from Gmail…</div>
      ) : threads.length === 0 ? (
        <div style={{ color: BRAND.muted, padding: 32, textAlign: "center" }}>No threads found. Click Refresh.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {threads.map((t, i) => (
            <div key={t.id || i} style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: BRAND.text }}>{t.subject || "(no subject)"}</div>
                  <div style={{ fontSize: 12, color: BRAND.muted, marginTop: 2 }}>{t.from || t.to || ""}</div>
                  <div style={{ fontSize: 12, color: BRAND.text, marginTop: 4 }}>{t.snippet || ""}</div>
                </div>
                <div style={{ fontSize: 11, color: BRAND.muted, flexShrink: 0, marginLeft: 12 }}>{t.date || ""}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Packages Tab ──────────────────────────────────────────────
function PackagesTab() {
  const [files, setFiles] = useState<{ id?: string; name?: string; modifiedTime?: string; webViewLink?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callClaude(
        `You are a Google Drive assistant. Search for files in a folder named "Angela Outreach" in Google Drive.
Return ONLY a JSON array: [{ id, name, modifiedTime, webViewLink }]. No markdown, no preamble.`,
        `List all files in the Google Drive folder named "Angela Outreach"`,
        [],
      );
      const txt = extractText(data).replace(/```json|```/g, "").trim();
      const s = txt.indexOf("["),
        e = txt.lastIndexOf("]");
      if (s !== -1 && e !== -1) setFiles(JSON.parse(txt.slice(s, e + 1)));
      else setError("Could not parse Drive data.");
    } catch (e: unknown) {
      setError("Failed to load packages: " + String(e));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: BRAND.navy, fontSize: 18, fontWeight: 700, margin: 0 }}>Lender Packages</h2>
        <button
          onClick={load}
          style={{ background: BRAND.blue, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>
      <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 12 }}>Google Drive → Angela Outreach folder</div>
      {error && <div style={{ color: BRAND.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {loading && !files.length ? (
        <div style={{ color: BRAND.muted, padding: 32, textAlign: "center" }}>Pulling from Google Drive…</div>
      ) : files.length === 0 ? (
        <div style={{ color: BRAND.muted, padding: 32, textAlign: "center" }}>No packages found. Click Refresh.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {files.map((f, i) => (
            <div
              key={f.id || i}
              style={{
                background: BRAND.card,
                border: `1px solid ${BRAND.border}`,
                borderRadius: 8,
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: BRAND.text }}>{f.name}</div>
                <div style={{ fontSize: 11, color: BRAND.muted, marginTop: 2 }}>
                  {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : ""}
                </div>
              </div>
              {f.webViewLink && (
                <a
                  href={f.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: BRAND.lightBlue,
                    color: BRAND.blue,
                    border: `1px solid ${BRAND.border}`,
                    borderRadius: 5,
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Open ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Automations Tab ───────────────────────────────────────────
function AutomationsTab() {
  const SCENARIOS = [
    { id: "4386974", name: "S10 — Transcript → Claude → Monday", expected: "active" },
    { id: "4387451", name: "S11 — Email Attachment Organizer", expected: "active" },
    { id: "4364165", name: "Claude AI Lead Qualifier", expected: "broken" },
    { id: "4364486", name: "Phone Name Resolver", expected: "broken" },
    { id: "4312564", name: "S01 Quo Call Logger", expected: "broken" },
    { id: "4312679", name: "S04 Morning Digest", expected: "broken" },
  ];
  const [statuses, setStatuses] = useState<Record<string, { status: string; lastRun?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callClaude(
        `You are a Make.com assistant. Check the status of scenario IDs: ${SCENARIO_IDS.join(", ")}.
Return ONLY JSON: { "scenarioId": { "status": "active|inactive|error", "lastRun": "ISO date or null" } }. No markdown.`,
        `Get status for Make.com scenarios: ${SCENARIO_IDS.join(", ")} using API key __MAKE_API_KEY__ on zone us2.make.com`,
        [{ type: "url", url: "https://mcp.make.com", name: "make-mcp" }],
        true,
      );
      const txt = extractText(data).replace(/```json|```/g, "").trim();
      const s = txt.indexOf("{"),
        e = txt.lastIndexOf("}");
      if (s !== -1 && e !== -1) setStatuses(JSON.parse(txt.slice(s, e + 1)));
      else setError("Could not parse Make.com data.");
    } catch (e: unknown) {
      setError("Failed to load automations: " + String(e));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statusDot = (id: string, expected: string) => {
    const s = statuses[id];
    if (!s) return { color: BRAND.muted, label: "Unknown" };
    if (s.status === "active") return { color: BRAND.green, label: "Active" };
    if (s.status === "inactive" && expected === "broken") return { color: BRAND.yellow, label: "Inactive" };
    if (s.status === "error") return { color: BRAND.red, label: "Error" };
    return { color: BRAND.yellow, label: s.status };
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: BRAND.navy, fontSize: 18, fontWeight: 700, margin: 0 }}>Make.com Automations</h2>
        <button
          onClick={load}
          style={{ background: BRAND.blue, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>
      {error && <div style={{ color: BRAND.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SCENARIOS.map((sc) => {
          const { color, label } = statusDot(sc.id, sc.expected);
          const info = statuses[sc.id];
          return (
            <div
              key={sc.id}
              style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}
            >
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: BRAND.text }}>{sc.name}</div>
                <div style={{ fontSize: 11, color: BRAND.muted, marginTop: 2 }}>
                  ID: {sc.id}
                  {info?.lastRun ? ` · Last run: ${new Date(info.lastRun).toLocaleString()}` : ""}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: color === BRAND.green ? "#dcfce7" : color === BRAND.red ? "#fee2e2" : "#fef3c7",
                  color: color === BRAND.green ? "#166534" : color === BRAND.red ? BRAND.red : "#92400e",
                }}
              >
                {label}
              </span>
              {sc.expected === "broken" && <span style={{ fontSize: 11, color: BRAND.orange, fontWeight: 600 }}>⚠ Needs fix</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────
export default function CommandCenter() {
  const [tab, setTab] = useState<Tab>("Pipeline");

  const ICONS: Record<Tab, React.ReactNode> = {
    Pipeline: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    Intake: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    Outreach: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    Packages: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    Automations: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: BRAND.bg, minHeight: "100vh", color: BRAND.text }}>
      <div style={{ background: BRAND.blue, padding: "0 24px", display: "flex", alignItems: "center", height: 56, gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: BRAND.blue, fontWeight: 900, fontSize: 14 }}>818</span>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Capital Partners</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginLeft: 4 }}>— Command Center</span>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </div>
      </div>
      <div style={{ background: BRAND.navy, padding: "0 24px", display: "flex", gap: 2 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: tab === t ? BRAND.blue : "transparent",
              color: tab === t ? "#fff" : "rgba(255,255,255,0.65)",
              borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent",
            }}
          >
            {ICONS[t]}
            {t}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {tab === "Pipeline" && <PipelineTab />}
        {tab === "Intake" && <IntakeTab />}
        {tab === "Outreach" && <OutreachTab />}
        {tab === "Packages" && <PackagesTab />}
        {tab === "Automations" && <AutomationsTab />}
      </div>
    </div>
  );
}
