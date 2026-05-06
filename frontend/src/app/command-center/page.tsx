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
    // Pipeline board has ~200 deals; each deal ~150-200 output tokens in JSON.
    // 1000 was truncating the response mid-array → "Could not parse" errors.
    max_tokens: 32000,
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

const TABS = ["Pipeline", "Intake", "Outreach", "Packages", "Automations", "Cleanup", "Ask David"] as const;
type Tab = (typeof TABS)[number];

// Deal shape returned from Monday.com (via Claude+MCP)
type Deal = {
  id: string;
  name: string;
  status: string;
  loanType: string;
  urgency: string;
  lastUpdate: string;
  address: string;
  lender: string;
};

// NOTE: Deal data is no longer baked into the source. The Pipeline tab
// fetches live from Monday.com board ${MONDAY_BOARD_ID} on mount and on
// every Refresh click. This keeps PII (sponsor names, addresses, lender
// assignments) out of the JS bundle entirely — even the auth-gated
// admin route never ships borrower data via static code.

// ── Pipeline Tab ──────────────────────────────────────────────
function PipelineTab() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);  // start in loading state — auto-fetch on mount
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Direct Monday GraphQL via our /api/monday/pipeline route.
      // Replaces the prior Claude+MCP path which blew the 200k context
      // limit on this 223-deal board and cost ~$0.45 per refresh.
      const res = await fetch("/api/monday/pipeline", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || `Monday API returned ${res.status}`);
      } else {
        setDeals(json.deals || []);
        setLastFetched(new Date());
      }
    } catch (e) {
      console.error("[command-center] Fetch error:", e);
      setError(`Network error: ${(e as Error).message || "unknown"}`);
    }
    setLoading(false);
  }, []);

  // Auto-fetch on mount — no stale data baked into the bundle
  useEffect(() => {
    load();
  }, [load]);

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
      {lastFetched && !loading && !error && (
        <div style={{ color: BRAND.muted, marginBottom: 10, fontSize: 11, fontStyle: "italic" }}>
          Last refreshed {lastFetched.toLocaleString()}
        </div>
      )}
      {loading && deals.length === 0 && (
        <div style={{ color: BRAND.muted, fontSize: 13, textAlign: "center", padding: "32px 16px", background: "#fff", border: `1px dashed ${BRAND.border}`, borderRadius: 8 }}>
          Loading pipeline from Monday.com…
        </div>
      )}
      {!loading && !error && deals.length === 0 && (
        <div style={{ color: BRAND.muted, fontSize: 13, textAlign: "center", padding: "32px 16px", background: "#fff", border: `1px dashed ${BRAND.border}`, borderRadius: 8 }}>
          No deals returned from Monday.com board {MONDAY_BOARD_ID}.
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

// ── Cleanup Tab ───────────────────────────────────────────────
type SurveyItem = {
  id: string;
  name: string;
  group: string;
  status: string;
  loanType: string;
  lender: string;
  address: string;
  phone: string;
  borrower: string;
  createdAt: string;
  updatedAt: string;
  hasUpdates: boolean;
  score: number;
  reasons: string[];
};

type SurveySummary = { total: number; likely_pollution: number; review: number; likely_real: number };

function CleanupTab() {
  const [items, setItems] = useState<SurveyItem[]>([]);
  const [summary, setSummary] = useState<SurveySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [archiving, setArchiving] = useState(false);
  const [archiveResult, setArchiveResult] = useState<{ archived: number; failed: number } | null>(null);
  const [filter, setFilter] = useState<"likely_pollution" | "review" | "all" | "likely_real">("likely_pollution");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pipeline-survey", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || `Survey failed: ${res.status}`);
      } else {
        setItems(json.items || []);
        setSummary(json.summary);
        // Auto-check items scoring >= 70 (likely pollution)
        setSelected(new Set((json.items || []).filter((i: SurveyItem) => i.score >= 70).map((i: SurveyItem) => i.id)));
      }
    } catch (e) {
      setError(`Network error: ${(e as Error).message}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = items.filter((i) => {
    if (filter === "all") return true;
    if (filter === "likely_pollution") return i.score >= 70;
    if (filter === "review") return i.score >= 40 && i.score < 70;
    return i.score < 40;
  });

  const archive = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Archive ${selected.size} item${selected.size === 1 ? "" : "s"} on Monday Pipeline? Items can be restored from Monday's archive view.`)) return;
    setArchiving(true);
    setArchiveResult(null);
    try {
      const res = await fetch("/api/admin/pipeline-archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_ids: Array.from(selected) }),
      });
      const json = await res.json();
      setArchiveResult({ archived: json.archived || 0, failed: json.failed || 0 });
      // Refresh after archive
      await load();
    } catch (e) {
      setError(`Archive failed: ${(e as Error).message}`);
    }
    setArchiving(false);
  };

  const scoreColor = (s: number) => (s >= 70 ? BRAND.red : s >= 40 ? BRAND.orange : BRAND.green);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ color: BRAND.navy, fontSize: 18, fontWeight: 700, margin: 0 }}>
          Pipeline Cleanup{" "}
          {summary && (
            <span style={{ fontSize: 13, color: BRAND.muted, fontWeight: 400 }}>
              ({summary.total} items · {summary.likely_pollution} likely pollution · {summary.review} to review)
            </span>
          )}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={load}
            style={{ background: "transparent", color: BRAND.blue, border: `1px solid ${BRAND.border}`, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
          >
            {loading ? "Loading…" : "↻ Refresh"}
          </button>
          <button
            onClick={archive}
            disabled={archiving || selected.size === 0}
            style={{
              background: selected.size === 0 ? BRAND.border : BRAND.red,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 16px",
              cursor: selected.size === 0 ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {archiving ? "Archiving…" : `Archive ${selected.size} selected`}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: BRAND.red, marginBottom: 10, fontSize: 12, background: "#fee2e2", padding: "8px 12px", borderRadius: 5 }}>
          {error}
        </div>
      )}

      {archiveResult && (
        <div style={{ color: BRAND.text, marginBottom: 10, fontSize: 12, background: "#dcfce7", padding: "8px 12px", borderRadius: 5 }}>
          ✅ Archived {archiveResult.archived} item(s){archiveResult.failed > 0 ? ` · ${archiveResult.failed} failed` : ""}.
        </div>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {(["likely_pollution", "review", "likely_real", "all"] as const).map((f) => {
          const counts = {
            likely_pollution: summary?.likely_pollution ?? 0,
            review: summary?.review ?? 0,
            likely_real: summary?.likely_real ?? 0,
            all: summary?.total ?? 0,
          };
          const labels = {
            likely_pollution: `🚫 Likely pollution (${counts.likely_pollution})`,
            review: `⚠️ Review (${counts.review})`,
            likely_real: `✅ Likely real (${counts.likely_real})`,
            all: `All (${counts.all})`,
          };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                border: `1px solid ${filter === f ? BRAND.blue : BRAND.border}`,
                background: filter === f ? BRAND.blue : "#fff",
                color: filter === f ? "#fff" : BRAND.text,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: filter === f ? 600 : 400,
              }}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      <div style={{ background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "#7c2d12", marginBottom: 12 }}>
        <b>How scoring works:</b> items scoring ≥70 are auto-checked (phone-like names, generic placeholders, all key fields empty). Items 40–69 need your eye — could go either way. &lt;40 looks like real deals. <b>Archive ≠ delete</b> — items move to Monday&apos;s archive view and can be restored.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {filtered.map((it) => (
          <label
            key={it.id}
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto 1fr auto auto",
              gap: 10,
              alignItems: "center",
              padding: "8px 12px",
              background: BRAND.card,
              border: `1px solid ${BRAND.border}`,
              borderRadius: 6,
              borderLeft: `3px solid ${scoreColor(it.score)}`,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            <input
              type="checkbox"
              checked={selected.has(it.id)}
              onChange={() => toggle(it.id)}
              style={{ cursor: "pointer", width: 16, height: 16 }}
            />
            <span
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                fontWeight: 700,
                color: scoreColor(it.score),
                minWidth: 32,
                textAlign: "right",
              }}
            >
              {it.score}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: BRAND.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {it.name}
              </div>
              <div style={{ fontSize: 10, color: BRAND.muted, marginTop: 1 }}>
                {[
                  it.address && `📍 ${it.address}`,
                  it.lender && `🏦 ${it.lender}`,
                  it.loanType && it.loanType,
                  it.phone && `📞 ${it.phone}`,
                ].filter(Boolean).join(" · ") || <span style={{ fontStyle: "italic", color: BRAND.muted }}>(empty)</span>}
              </div>
            </div>
            <span style={{ fontSize: 10, color: BRAND.muted, fontFamily: "ui-monospace, monospace" }}>
              {new Date(it.createdAt).toLocaleDateString()}
            </span>
            <span style={{ fontSize: 9, color: BRAND.muted, fontFamily: "ui-monospace, monospace", maxWidth: 280, textAlign: "right" }}>
              {it.reasons.join(", ")}
            </span>
          </label>
        ))}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: BRAND.muted, fontSize: 13 }}>
            No items in this filter.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ask David Tab (multi-agent supervisor) ───────────────────
type AgentTraceStep = {
  agent: string;
  tool: string;
  args?: Record<string, unknown>;
  result?: unknown;
  error?: string | null;
  duration_ms?: number;
};

type AgentResponse = {
  question: string;
  answer: string;
  plan: { rationale: string; steps: { agent: string; tool: string; args: Record<string, unknown> }[] };
  trace: AgentTraceStep[];
  judge: { score: number; issues: string[]; requires_human_review: boolean; rationale: string };
  requires_human_review: boolean;
  notified_slack: boolean;
};

function AskDavidTab() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const submit = async () => {
    const q = question.trim();
    if (q.length < 3) {
      setError("Type a question first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/admin/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || json.detail || `Request failed: ${res.status}`);
      } else {
        setResponse(json as AgentResponse);
      }
    } catch (e) {
      setError(`Network error: ${(e as Error).message || "unknown"}`);
    }
    setLoading(false);
  };

  const examples = [
    "How many green deals are in the pipeline by lane?",
    "Find DSCR lenders in TX for a 720 FICO borrower asking for $450k",
    "Show me yellow flip deals from the last 30 days",
    "Which lenders take multifamily loans under $1M?",
  ];

  const judgeColor = (score: number) =>
    score >= 90 ? BRAND.green : score >= 70 ? BRAND.blue : score >= 40 ? BRAND.orange : BRAND.red;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ color: BRAND.navy, fontSize: 18, fontWeight: 700, margin: 0 }}>Ask David</h2>
        <div style={{ fontSize: 12, color: BRAND.muted, marginTop: 4 }}>
          Multi-agent supervisor over deals, lenders, and pipeline analytics. Supervisor → retrieval/structured/analytics subagents → LLM judge → human review.
        </div>
      </div>

      <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="Ask anything about the deal pipeline, borrowers, or lenders…"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${BRAND.border}`,
            borderRadius: 6,
            fontSize: 13,
            color: BRAND.text,
            boxSizing: "border-box",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, color: BRAND.muted }}>⌘/Ctrl + Enter to submit</div>
          <button
            onClick={submit}
            disabled={loading}
            style={{
              background: loading ? BRAND.muted : BRAND.blue,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Thinking…" : "Ask"}
          </button>
        </div>
      </div>

      {!response && !loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: BRAND.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Try</div>
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setQuestion(ex)}
              style={{
                textAlign: "left",
                background: BRAND.lightBlue,
                border: `1px solid ${BRAND.border}`,
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 12,
                color: BRAND.text,
                cursor: "pointer",
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ color: BRAND.red, marginBottom: 12, fontSize: 13, background: "#fee2e2", padding: "10px 14px", borderRadius: 6 }}>
          {error}
        </div>
      )}

      {response && (
        <div>
          {response.requires_human_review && (
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: 6,
                padding: "10px 14px",
                fontSize: 12,
                color: "#92400e",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div>
                <b>Pending human review.</b> The judge flagged this answer ({response.judge.score}/100). Don&apos;t use it as-is.
                {response.notified_slack ? " Slack has been notified." : ""}
              </div>
            </div>
          )}

          <div
            style={{
              background: BRAND.card,
              border: `1px solid ${BRAND.border}`,
              borderLeft: `3px solid ${judgeColor(response.judge.score)}`,
              borderRadius: 8,
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: BRAND.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Answer</div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: response.judge.score >= 70 ? "#dcfce7" : "#fef3c7",
                  color: response.judge.score >= 70 ? "#166534" : "#92400e",
                }}
              >
                Judge: {response.judge.score}/100
              </span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: BRAND.text, whiteSpace: "pre-wrap" }}>{response.answer}</div>
          </div>

          <button
            onClick={() => setShowDetails((s) => !s)}
            style={{
              background: "transparent",
              border: `1px solid ${BRAND.border}`,
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              color: BRAND.muted,
              cursor: "pointer",
              marginBottom: showDetails ? 12 : 0,
            }}
          >
            {showDetails ? "▲ Hide trace" : "▼ Show plan, trace, and judge details"}
          </button>

          {showDetails && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: BRAND.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Supervisor plan</div>
                <div style={{ fontSize: 12, color: BRAND.text, marginBottom: 8, fontStyle: "italic" }}>{response.plan.rationale || "(no rationale)"}</div>
                <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: BRAND.text }}>
                  {response.plan.steps.map((s, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      <code style={{ background: BRAND.lightBlue, padding: "1px 6px", borderRadius: 3, fontSize: 11 }}>
                        {s.agent}.{s.tool}
                      </code>{" "}
                      <span style={{ color: BRAND.muted, fontSize: 11 }}>{JSON.stringify(s.args)}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: BRAND.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Trace</div>
                {response.trace.map((step, i) => (
                  <details
                    key={i}
                    style={{
                      borderTop: i === 0 ? "none" : `1px solid ${BRAND.border}`,
                      padding: "6px 0",
                      fontSize: 12,
                    }}
                  >
                    <summary style={{ cursor: "pointer", color: step.error ? BRAND.red : BRAND.text }}>
                      <code style={{ background: BRAND.lightBlue, padding: "1px 6px", borderRadius: 3, fontSize: 11 }}>
                        {i + 1}. {step.agent}.{step.tool}
                      </code>{" "}
                      <span style={{ color: BRAND.muted, fontSize: 11 }}>
                        {step.duration_ms ? `${step.duration_ms}ms` : ""}
                        {step.error ? ` · error: ${step.error}` : ""}
                      </span>
                    </summary>
                    <pre
                      style={{
                        marginTop: 6,
                        background: "#f8fafc",
                        border: `1px solid ${BRAND.border}`,
                        borderRadius: 4,
                        padding: 8,
                        fontSize: 11,
                        overflow: "auto",
                        maxHeight: 280,
                        color: BRAND.text,
                      }}
                    >
                      {JSON.stringify({ args: step.args, result: step.result }, null, 2)}
                    </pre>
                  </details>
                ))}
              </div>

              <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: BRAND.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Judge verdict</div>
                <div style={{ fontSize: 12, color: BRAND.text, marginBottom: 6 }}>
                  <b>Score:</b> {response.judge.score}/100 ·{" "}
                  <b>Human review:</b> {response.judge.requires_human_review ? "yes" : "no"}
                </div>
                {response.judge.rationale && (
                  <div style={{ fontSize: 12, color: BRAND.text, marginBottom: 6 }}>
                    <b>Rationale:</b> {response.judge.rationale}
                  </div>
                )}
                {response.judge.issues.length > 0 && (
                  <div style={{ fontSize: 12, color: BRAND.text }}>
                    <b>Issues:</b>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: 18 }}>
                      {response.judge.issues.map((iss, idx) => (
                        <li key={idx}>{iss}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
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
    Cleanup: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a2 2 0 012-2h4a2 2 0 012 2v3" />
      </svg>
    ),
    "Ask David": (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
        {tab === "Cleanup" && <CleanupTab />}
        {tab === "Ask David" && <AskDavidTab />}
      </div>
    </div>
  );
}
