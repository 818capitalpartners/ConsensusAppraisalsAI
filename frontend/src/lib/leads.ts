/**
 * Lead capture pipeline — Monday.com + email notifications.
 *
 * Single source of truth for saving web-site leads. Used by:
 *   - /api/contacts   (lead magnets, exit intent, inline captures, chat)
 *   - /api/deals      (main scenario submission forms)
 *
 * Fail-open: if Monday or email fail, we still return success to the user
 * (we never want to block the UX on a back-office outage) — but we log
 * the failure server-side for follow-up.
 *
 * Required env vars:
 *   MONDAY_API_KEY              — Monday.com API key
 *   MONDAY_LEADS_BOARD_ID       — default 18405961545
 *   RESEND_API_KEY              — (optional) for email notifications
 *   NOTIFICATION_EMAIL          — (optional) where lead alerts go
 *   FROM_EMAIL                  — (optional) notifications@818capitalpartners.com
 *   MAKE_LEADS_WEBHOOK_URL      — (optional) if set, every lead is also
 *                                 POSTed here so Make.com can wire up
 *                                 SMS drips (S14), email sequences, or
 *                                 Salesforce sync without code changes.
 */

const MONDAY_URL = 'https://api.monday.com/v2';
const DEFAULT_LEADS_BOARD = '18405961545';
const NEW_LEADS_GROUP = 'group_mm1wnwrb'; // "New Leads" group in the board

// ── Column IDs (locked to the schema of board 18405961545) ─────────────
const COL = {
  email: 'email_mm1w7cd6',
  phone: 'phone_mm1wfckm',
  company: 'text_mm1wqpwv',
  title: 'text_mm1w7sbm',
  icpSegment: 'color_mm1w72c5',
  leadSource: 'color_mm1weayh',
  leadScore: 'color_mm1w8332',
  state: 'text_mm1w7zc',
  loanType: 'color_mm1w2d6t',
  estLoanAmount: 'numeric_mm1w2yh7',
  notes: 'long_text_mm1w9ff2',
  nextAction: 'text_mm1wsehd',
  firstContact: 'date_mm1w7jbs',
} as const;

// ── Label maps (human-readable → Monday label) ─────────────────────────

const ICP_FROM_PRODUCT: Record<string, string> = {
  dscr: 'DSCR Investor',
  flip: 'Fix & Flip',
  str: 'STR Investor',
  multifamily: 'DSCR Investor', // closest fit in current schema
};

const LOAN_TYPE_FROM_PRODUCT: Record<string, string> = {
  dscr: 'DSCR Purchase',
  flip: 'Fix & Flip',
  str: 'DSCR Purchase',
  multifamily: 'Multifamily',
  bridge: 'Bridge',
  commercial: 'Commercial',
};

// ── Public types ────────────────────────────────────────────────────────

export type LeadInput = {
  // identity
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  // intent signal
  productLane?: 'dscr' | 'flip' | 'str' | 'multifamily' | 'bridge' | 'commercial';
  estLoanAmount?: number;
  propertyState?: string;
  propertyCity?: string;
  // context
  source: // where on the site this came from
    | 'exit_intent_popup'
    | 'inline_lead_capture'
    | 'lead_magnet_modal'
    | 'dscr_playbook'
    | 'flip_playbook'
    | 'str_playbook'
    | 'chat_widget'
    | 'deal_form'
    | 'broker_program'
    | 'calculator_dscr'
    | 'unknown';
  tags?: string[]; // anything extra (e.g. "exit_intent", "dscr_guide_2026")
  leadType?: 'investor' | 'broker';
  // rich context (shown in Notes field)
  dealScore?: 'green' | 'yellow' | 'red';
  dealSummary?: string;
  pageUrl?: string;
  userAgent?: string;
};

export type LeadResult = {
  ok: boolean;
  mondayItemId?: string | null;
  notified: boolean;
  errors: string[];
};

// ── Lead scoring (simple heuristic) ────────────────────────────────────

function scoreLead(l: LeadInput): 'Hot (80+)' | 'Warm (50-79)' | 'Cold (20-49)' {
  // Loan amount is the strongest intent signal
  const amt = l.estLoanAmount ?? 0;
  const hasPhone = !!l.phone;
  const hasProperty = !!(l.propertyState || l.propertyCity);
  const greenScore = l.dealScore === 'green';

  let pts = 0;
  if (amt >= 500_000) pts += 40;
  else if (amt >= 250_000) pts += 25;
  else if (amt > 0) pts += 10;
  if (hasPhone) pts += 15;
  if (hasProperty) pts += 15;
  if (greenScore) pts += 20;
  if (l.source === 'deal_form') pts += 25;
  else if (l.source === 'chat_widget') pts += 10;
  else if (l.source === 'exit_intent_popup') pts += 5;

  if (pts >= 80) return 'Hot (80+)';
  if (pts >= 50) return 'Warm (50-79)';
  return 'Cold (20-49)';
}

// ── Monday.com API ─────────────────────────────────────────────────────

async function mondayCreateItem(lead: LeadInput): Promise<{ id: string | null; error?: string }> {
  const apiKey = process.env.MONDAY_API_KEY;
  const boardId = process.env.MONDAY_LEADS_BOARD_ID || DEFAULT_LEADS_BOARD;

  if (!apiKey) {
    return { id: null, error: 'MONDAY_API_KEY not set' };
  }

  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ').trim() || lead.email;
  const score = scoreLead(lead);
  const today = new Date().toISOString().slice(0, 10);

  const columnValues: Record<string, unknown> = {
    [COL.email]: { email: lead.email, text: lead.email },
    [COL.leadSource]: { label: 'Website' },
    [COL.leadScore]: { label: score },
    [COL.firstContact]: { date: today },
  };

  if (lead.phone) columnValues[COL.phone] = { phone: lead.phone, countryShortName: 'US' };
  if (lead.company) columnValues[COL.company] = lead.company;
  if (lead.propertyState) columnValues[COL.state] = lead.propertyState;
  if (lead.estLoanAmount && lead.estLoanAmount > 0) columnValues[COL.estLoanAmount] = lead.estLoanAmount;

  if (lead.productLane) {
    const icp = ICP_FROM_PRODUCT[lead.productLane];
    const loan = LOAN_TYPE_FROM_PRODUCT[lead.productLane];
    if (icp) columnValues[COL.icpSegment] = { label: icp };
    if (loan) columnValues[COL.loanType] = { label: loan };
  }

  const notesLines = [
    `Source: ${lead.source}`,
    lead.tags?.length ? `Tags: ${lead.tags.join(', ')}` : null,
    lead.leadType ? `Lead type: ${lead.leadType}` : null,
    lead.dealScore ? `Deal score: ${lead.dealScore}` : null,
    lead.dealSummary ? `\nSummary:\n${lead.dealSummary}` : null,
    lead.pageUrl ? `Page: ${lead.pageUrl}` : null,
  ].filter(Boolean);
  columnValues[COL.notes] = notesLines.join('\n');

  const query = `
    mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
      create_item (
        board_id: $boardId,
        group_id: $groupId,
        item_name: $itemName,
        column_values: $columnValues,
        create_labels_if_missing: true
      ) { id }
    }
  `;

  const variables = {
    boardId,
    groupId: NEW_LEADS_GROUP,
    itemName: name,
    columnValues: JSON.stringify(columnValues),
  };

  try {
    const res = await fetch(MONDAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
        'API-Version': '2024-01',
      },
      body: JSON.stringify({ query, variables }),
    });
    const data = await res.json();
    if (data.errors) {
      return { id: null, error: `Monday error: ${JSON.stringify(data.errors)}` };
    }
    return { id: data.data?.create_item?.id ?? null };
  } catch (e) {
    return { id: null, error: e instanceof Error ? e.message : 'monday fetch failed' };
  }
}

// ── Email notifications via Resend ─────────────────────────────────────

async function notifyTeam(lead: LeadInput, mondayItemId: string | null): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  const from = process.env.FROM_EMAIL || 'notifications@818capitalpartners.com';

  if (!apiKey || !to) {
    return { ok: false, error: 'RESEND_API_KEY or NOTIFICATION_EMAIL not configured' };
  }

  const score = scoreLead(lead);
  const hotEmoji = score.startsWith('Hot') ? '🔥 ' : score.startsWith('Warm') ? '⚡ ' : '';
  const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || '(no name)';
  const mondayUrl = mondayItemId
    ? `https://baynes-x-baker.monday.com/boards/18405961545/pulses/${mondayItemId}`
    : 'https://baynes-x-baker.monday.com/boards/18405961545';

  const subject = `${hotEmoji}New ${score} lead: ${fullName} — ${lead.source}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #0a2540; margin: 0 0 16px;">${hotEmoji}New Lead — ${score}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #64748b;">Name</td><td style="padding: 6px 0; font-weight: 600;">${fullName}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
        ${lead.phone ? `<tr><td style="padding: 6px 0; color: #64748b;">Phone</td><td style="padding: 6px 0;"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>` : ''}
        ${lead.productLane ? `<tr><td style="padding: 6px 0; color: #64748b;">Product</td><td style="padding: 6px 0;">${lead.productLane.toUpperCase()}</td></tr>` : ''}
        ${lead.estLoanAmount ? `<tr><td style="padding: 6px 0; color: #64748b;">Loan amount</td><td style="padding: 6px 0;">$${lead.estLoanAmount.toLocaleString()}</td></tr>` : ''}
        ${lead.propertyState ? `<tr><td style="padding: 6px 0; color: #64748b;">State</td><td style="padding: 6px 0;">${lead.propertyState}</td></tr>` : ''}
        ${lead.dealScore ? `<tr><td style="padding: 6px 0; color: #64748b;">Deal light</td><td style="padding: 6px 0; text-transform: uppercase; font-weight: 600; color: ${lead.dealScore === 'green' ? '#16a34a' : lead.dealScore === 'yellow' ? '#ca8a04' : '#dc2626'};">${lead.dealScore}</td></tr>` : ''}
        <tr><td style="padding: 6px 0; color: #64748b;">Source</td><td style="padding: 6px 0;">${lead.source}${lead.tags?.length ? ' — ' + lead.tags.join(', ') : ''}</td></tr>
        ${lead.pageUrl ? `<tr><td style="padding: 6px 0; color: #64748b;">Page</td><td style="padding: 6px 0;"><a href="${lead.pageUrl}">${lead.pageUrl}</a></td></tr>` : ''}
      </table>
      ${lead.dealSummary ? `<div style="margin-top: 20px; padding: 12px 16px; background: #f8fafc; border-left: 4px solid #0a2540; border-radius: 4px;"><p style="margin: 0; white-space: pre-wrap; color: #334155; font-size: 14px;">${lead.dealSummary}</p></div>` : ''}
      <div style="margin-top: 28px;">
        <a href="${mondayUrl}" style="display: inline-block; padding: 10px 18px; background: #0a2540; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Open in Monday.com →</a>
      </div>
      <p style="margin-top: 32px; color: #94a3b8; font-size: 12px;">Automated by 818 Capital lead pipeline. Reply directly to contact the lead.</p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `818 Capital Leads <${from}>`,
        to: [to],
        reply_to: lead.email, // reply goes straight to the borrower
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: `Resend error: ${JSON.stringify(err)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'resend fetch failed' };
  }
}

// ── Make.com webhook fan-out ───────────────────────────────────────────

/**
 * Forward the lead to a Make.com scenario (if MAKE_LEADS_WEBHOOK_URL is
 * set). This is the hook Ravi uses to trigger S14 SMS nurture, email
 * drips, Salesforce sync, Quo outbound dial, etc. — all without code
 * changes. The payload matches what captureLead received plus the
 * computed lead score + Monday item id, so Make scenarios can route by
 * score or source.
 */
async function forwardToMakeWebhook(
  lead: LeadInput,
  mondayItemId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.MAKE_LEADS_WEBHOOK_URL;
  if (!url) return { ok: true }; // optional — not configured = no-op

  const payload = {
    ...lead,
    lead_score_label: scoreLead(lead),
    monday_item_id: mondayItemId,
    monday_board_id: process.env.MONDAY_LEADS_BOARD_ID || DEFAULT_LEADS_BOARD,
    captured_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false, error: `Make webhook ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'make webhook failed' };
  }
}

// ── Public entry point ─────────────────────────────────────────────────

/**
 * Save a lead to Monday.com Leads Board + notify Ravi/team via email +
 * forward to Make.com for downstream automation. Returns partial
 * success info; never throws.
 */
export async function captureLead(lead: LeadInput): Promise<LeadResult> {
  const errors: string[] = [];

  // 1. Create Monday.com item (primary store of record)
  const { id: mondayItemId, error: mondayErr } = await mondayCreateItem(lead);
  if (mondayErr) errors.push(mondayErr);

  // 2 & 3 in parallel — email + Make webhook (both best-effort)
  const [emailResult, makeResult] = await Promise.all([
    notifyTeam(lead, mondayItemId),
    forwardToMakeWebhook(lead, mondayItemId),
  ]);
  if (emailResult.error) errors.push(emailResult.error);
  if (makeResult.error) errors.push(makeResult.error);

  // Log full failure so it surfaces in Vercel logs
  if (errors.length) {
    console.error('[leads] captureLead partial failure', { email: lead.email, errors });
  }

  return {
    ok: !!mondayItemId,
    mondayItemId,
    notified: emailResult.ok,
    errors,
  };
}
