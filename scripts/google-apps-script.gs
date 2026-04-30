/**
 * 818 CAPITAL PARTNERS — BORROWER UPLOAD BACKEND (v3)
 * Google Apps Script · deploy as "Web App"
 *
 * v3 changes vs v2:
 *   - After successful submit, also POST the deal data to our Vercel
 *     /api/deals/create route. That triggers:
 *       1) Deal record creation in Supabase (with magic-link access_token)
 *       2) Magic-link email to borrower (replaces the prior MailApp
 *          confirmation since the magic-link is more useful)
 *     Drive folder + Ravi notification email behavior unchanged.
 *
 * v2 was: 5-bucket folder structure + product tag + richer notification.
 * v1 was: original 4-bucket build.
 *
 * Folder structure (unchanged from v2):
 *   [Your Drive] /
 *     818 Borrower Packages /
 *       [DSCR] Jane Doe — 123 Main St /
 *         01_Sponsor /
 *         02_Entity /
 *         03_Property /
 *         04_Valuation /
 *         05_TitleClosing /
 *         _manifest.json
 *
 * Maintenance: when you change this file, paste back into the Apps Script
 * editor at script.google.com → Deploy → Manage deployments → Edit →
 * Version: New version → Deploy. URL stays stable.
 */

// ============================================================
// CONFIG
// ============================================================
const CONFIG = {
  ROOT_FOLDER_ID: "",
  ROOT_FOLDER_NAME: "818 Borrower Packages",
  NOTIFY_EMAIL: "ravi@818capitalpartners.com",
  TEAM_CC: "",
  FROM_NAME: "818 Capital Partners",
  MAX_FILE_SIZE: 25 * 1024 * 1024,

  // POST to Vercel after submit so the borrower gets a magic-link portal
  // and the deal is registered in Supabase. Leave SUBMIT_API_URL blank
  // to disable (Drive + Ravi notification email still happen).
  SUBMIT_API_URL: "https://818capitalpartners.com/api/deals/create",
  SUBMIT_API_SECRET: "REPLACE_WITH_SUBMIT_WEBHOOK_SECRET",  // must match Vercel SUBMIT_WEBHOOK_SECRET env var
};

// ============================================================
// CATEGORY MAP — matches keys in borrower-portal.html
// ============================================================
const CATEGORY_FOLDERS = {
  sponsor:   "01_Sponsor",
  entity:    "02_Entity",
  property:  "03_Property",
  valuation: "04_Valuation",
  title:     "05_TitleClosing",
};

const PRODUCT_LABELS = {
  dscr:       "DSCR",
  flip:       "F&F",
  bridge:     "Bridge",
  commercial: "Commercial",
};

// ============================================================
// WEB APP ENTRY POINTS
// ============================================================
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === "upload") return json(handleUpload(body));
    if (body.action === "submit") return json(handleSubmit(body));
    return json({ ok: false, error: "Unknown action" });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: err.message });
  }
}

function doGet(e) {
  return json({
    ok: true,
    service: "818 Borrower Portal",
    version: "3.0",
    timestamp: new Date().toISOString()
  });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// UPLOAD HANDLER
// ============================================================
function handleUpload(body) {
  const { borrower, product, category, filename, mimeType, size, dataBase64 } = body;

  if (!borrower || !borrower.name || !borrower.email || !borrower.llc || !borrower.property) {
    return { ok: false, error: "Missing borrower info" };
  }
  if (!CATEGORY_FOLDERS[category]) {
    return { ok: false, error: "Unknown category" };
  }
  if (size > CONFIG.MAX_FILE_SIZE) {
    return { ok: false, error: "File exceeds 25 MB limit" };
  }

  const dealFolder = getOrCreateDealFolder(borrower, product);
  const catFolder = getOrCreateSubfolder(dealFolder, CATEGORY_FOLDERS[category]);

  const decoded = Utilities.base64Decode(dataBase64);
  const blob = Utilities.newBlob(decoded, mimeType, filename);
  const file = catFolder.createFile(blob);

  file.setDescription(JSON.stringify({
    uploadedBy: borrower.email,
    uploadedAt: new Date().toISOString(),
    product: product,
    category: category,
    originalName: filename
  }));

  return {
    ok: true,
    fileId: file.getId(),
    fileUrl: file.getUrl(),
    folderUrl: dealFolder.getUrl()
  };
}

// ============================================================
// SUBMIT HANDLER
// ============================================================
function handleSubmit(body) {
  const { borrower, product, summary } = body;
  const dealFolder = getOrCreateDealFolder(borrower, product);

  const manifest = {
    submittedAt: new Date().toISOString(),
    product: product,
    productLabel: borrower.productLabel || product,
    borrower: borrower,
    summary: summary,
    folderUrl: dealFolder.getUrl()
  };
  const manifestBlob = Utilities.newBlob(JSON.stringify(manifest, null, 2), "application/json", "_manifest.json");

  const existing = dealFolder.getFilesByName("_manifest.json");
  while (existing.hasNext()) existing.next().setTrashed(true);
  dealFolder.createFile(manifestBlob);

  // Send notification email to Ravi (rich, with all loan/sponsor/property fields)
  sendTeamNotification(borrower, product, summary, dealFolder.getUrl());

  // Register the deal in Supabase + send the borrower their magic-link portal email.
  // This replaces the old MailApp borrower-confirmation — the magic link IS the
  // confirmation now, with much more value (returns access to docs, status, etc.).
  let portalResult = { ok: false, error: "not_called" };
  if (CONFIG.SUBMIT_API_URL && CONFIG.SUBMIT_API_SECRET && CONFIG.SUBMIT_API_SECRET !== "REPLACE_WITH_SUBMIT_WEBHOOK_SECRET") {
    portalResult = postToDealsApi({
      borrower: borrower,
      product: product,
      summary: summary,
      drive_folder_id: dealFolder.getId(),
      drive_folder_url: dealFolder.getUrl(),
    });
    if (!portalResult.ok) {
      console.error("[deals_api] failed:", portalResult);
      // Fall back to the old confirmation email so the borrower gets SOMETHING
      sendBorrowerConfirmationFallback(borrower, dealFolder.getUrl());
    }
  } else {
    // SUBMIT_API not configured — use the v2 confirmation behavior
    sendBorrowerConfirmationFallback(borrower, dealFolder.getUrl());
  }

  return {
    ok: true,
    folderUrl: dealFolder.getUrl(),
    portalSent: portalResult.ok,
    portalError: portalResult.ok ? null : portalResult.error,
  };
}

// ============================================================
// VERCEL DEALS API
// ============================================================
function postToDealsApi(payload) {
  try {
    const res = UrlFetchApp.fetch(CONFIG.SUBMIT_API_URL, {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + CONFIG.SUBMIT_API_SECRET,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
    const code = res.getResponseCode();
    const body = res.getContentText();
    if (code >= 200 && code < 300) {
      return { ok: true, response: JSON.parse(body) };
    }
    return { ok: false, status: code, error: body.slice(0, 400) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ============================================================
// FOLDER UTILITIES
// ============================================================
function getRootFolder() {
  if (CONFIG.ROOT_FOLDER_ID) return DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
  const root = DriveApp.getRootFolder();
  const existing = root.getFoldersByName(CONFIG.ROOT_FOLDER_NAME);
  return existing.hasNext() ? existing.next() : root.createFolder(CONFIG.ROOT_FOLDER_NAME);
}

function getOrCreateDealFolder(borrower, product) {
  const root = getRootFolder();
  const productTag = product && PRODUCT_LABELS[product] ? `[${PRODUCT_LABELS[product]}] ` : "";
  const folderName = sanitize(`${productTag}${borrower.name} — ${borrower.property}`);
  const existing = root.getFoldersByName(folderName);
  if (existing.hasNext()) return existing.next();
  const folder = root.createFolder(folderName);
  Object.values(CATEGORY_FOLDERS).forEach(sub => folder.createFolder(sub));
  return folder;
}

function getOrCreateSubfolder(parent, name) {
  const existing = parent.getFoldersByName(name);
  return existing.hasNext() ? existing.next() : parent.createFolder(name);
}

function sanitize(s) {
  return s.replace(/[\/\\:*?"<>|]/g, "").replace(/\s+/g, " ").trim().substring(0, 140);
}

// ============================================================
// NOTIFICATIONS — TEAM
// ============================================================
function row(label, value) {
  if (!value || value === "") return "";
  return `<tr><td style="padding:4px 14px 4px 0;color:#7A7A7A;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;width:160px;vertical-align:top;">${label}</td><td style="padding:4px 0;color:#1F4E78;font-weight:500;font-size:13px;">${escapeHtml(value)}</td></tr>`;
}

function sendTeamNotification(borrower, product, summary, folderUrl) {
  const totalFiles = (summary || []).reduce((n, s) => n + (s.count || 0), 0);
  const productLabel = borrower.productLabel || PRODUCT_LABELS[product] || product || "—";

  const summaryRows = (summary || []).map(s => `
    <tr>
      <td style="padding:4px 14px 4px 0;color:#7A7A7A;text-transform:uppercase;font-size:11px;letter-spacing:0.06em;">${escapeHtml(s.categoryLabel || s.category)}</td>
      <td style="padding:4px 0;color:#1F4E78;font-weight:600;font-size:13px;">${s.count} file${s.count === 1 ? "" : "s"}</td>
    </tr>
  `).join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;color:#262626;">
      <div style="background:#1F4E78;color:white;padding:18px 24px;">
        <div style="font-size:9px;letter-spacing:0.28em;color:#EFD99A;font-weight:700;">NEW LOAN APPLICATION · ${escapeHtml(productLabel)}</div>
        <div style="font-size:22px;font-weight:700;margin-top:6px;">${escapeHtml(borrower.name || "—")}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:2px;">${escapeHtml(borrower.property || "—")}</div>
      </div>

      <div style="padding:22px 24px;border:1px solid #D9D9D9;border-top:0;background:white;">

        <div style="font-size:10px;letter-spacing:0.22em;color:#2E75B6;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Borrower / Sponsor</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
          ${row("Email", borrower.email)}
          ${row("Phone", borrower.phone)}
          ${row("Entity (LLC)", borrower.llc)}
          ${row("State of formation", borrower.entityState)}
          ${row("Net worth (ballpark)", borrower.netWorth)}
          ${row("Liquidity (ballpark)", borrower.liquidity)}
          ${row("Prior closings (3 yrs)", borrower.priorDeals)}
          ${row("FICO mid-score", borrower.fico)}
        </table>

        <div style="font-size:10px;letter-spacing:0.22em;color:#2E75B6;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Subject Property</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
          ${row("Address", borrower.property)}
          ${row("Asset class", borrower.assetClass)}
          ${row("Year built", borrower.yearBuilt)}
          ${row("Unit count", borrower.units)}
          ${row("NRSF", borrower.nrsf)}
          ${row("Occupancy", borrower.occupancy)}
          ${row("In-place rent /mo", borrower.inPlaceRent)}
          ${row("Estimated ARV", borrower.arv)}
          ${row("Rehab budget", borrower.rehab)}
          ${row("Exit strategy", borrower.exit)}
          ${row("Business plan", borrower.businessPlan)}
        </table>

        <div style="font-size:10px;letter-spacing:0.22em;color:#2E75B6;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Loan Request</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
          ${row("Transaction type", borrower.txnType)}
          ${row("Purchase / current basis", borrower.priceBasis)}
          ${row("Existing debt payoff", borrower.existingDebt)}
          ${row("Loan amount requested", borrower.loanAmount)}
          ${row("LTV target", borrower.ltv)}
          ${row("Term", borrower.term)}
          ${row("Rate type", borrower.rateType)}
          ${row("Target close", borrower.closeDate)}
          ${row("Use of proceeds", borrower.useProceeds)}
        </table>

        <hr style="border:0;border-top:1px solid #D9D9D9;margin:18px 0;">
        <div style="font-size:10px;letter-spacing:0.22em;color:#2E75B6;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Files Received — ${totalFiles} total</div>
        <table style="width:100%;border-collapse:collapse;">${summaryRows}</table>

        <div style="margin-top:24px;">
          <a href="${folderUrl}" style="background:#1F4E78;color:white;padding:13px 22px;text-decoration:none;font-weight:600;font-size:12px;letter-spacing:0.08em;">OPEN DEAL FOLDER →</a>
        </div>
      </div>

      <div style="padding:12px 24px;background:#F5F3EE;border:1px solid #D9D9D9;border-top:0;font-size:10px;color:#7A7A7A;letter-spacing:0.22em;text-transform:uppercase;">
        818 Capital Partners · Borrower Portal · ${new Date().toLocaleString()}
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    cc: CONFIG.TEAM_CC,
    subject: `[${productLabel}] New App: ${borrower.name} — ${borrower.property}`,
    htmlBody: html,
    name: CONFIG.FROM_NAME
  });
}

// ============================================================
// FALLBACK: only used if the new /api/deals/create call fails
// ============================================================
function sendBorrowerConfirmationFallback(borrower, folderUrl) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#262626;">
      <div style="background:#1F4E78;color:white;padding:20px 24px;">
        <div style="font-size:9px;letter-spacing:0.28em;color:#EFD99A;font-weight:700;">APPLICATION RECEIVED</div>
        <div style="font-size:22px;font-weight:700;margin-top:8px;letter-spacing:-0.01em;">Thanks, ${escapeHtml(firstName(borrower.name))}.</div>
      </div>
      <div style="padding:24px;border:1px solid #D9D9D9;border-top:0;font-size:14px;line-height:1.65;">
        <p style="margin:0 0 14px;">
          We've got your loan application for <b style="color:#1F4E78;">${escapeHtml(borrower.property)}</b>.
        </p>
        <p style="margin:0 0 14px;">
          Our underwriting team is reviewing now. Ravi or someone on the 818 team will be in touch
          within <b>24 hours</b> with a preliminary term sheet — or a quick question on anything we need to clarify.
        </p>
        <hr style="border:0;border-top:1px solid #D9D9D9;margin:22px 0;">
        <div style="font-size:13px;">
          <b style="color:#1F4E78;">Ravi Punn</b><br>
          Principal · 818 Capital Partners<br>
          <a href="mailto:deals@818capitalpartners.com" style="color:#1F4E78;">deals@818capitalpartners.com</a><br>
          (917) 993-9194
        </div>
      </div>
    </div>
  `;
  MailApp.sendEmail({
    to: borrower.email,
    subject: "818 Capital — Application received",
    htmlBody: html,
    name: CONFIG.FROM_NAME,
    replyTo: "deals@818capitalpartners.com"
  });
}

function firstName(full) {
  return (full || "").trim().split(/\s+/)[0] || "there";
}
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

// ============================================================
// TEST
// ============================================================
function testSetup() {
  const folder = getRootFolder();
  console.log("Root folder:", folder.getName(), folder.getUrl());
  const testBorrower = {
    name: "Test Borrower",
    email: CONFIG.NOTIFY_EMAIL,
    phone: "(555) 000-0000",
    llc: "Test Holdings LLC",
    property: "123 Test Ave, Brooklyn NY",
    productLabel: "DSCR"
  };
  const deal = getOrCreateDealFolder(testBorrower, "dscr");
  console.log("Test deal folder:", deal.getName(), deal.getUrl());
  console.log("✅ Setup OK. Delete the test folder from Drive when done.");
}
