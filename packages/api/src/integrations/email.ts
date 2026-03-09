/**
 * ESP integration — sends confirmation email to lead with triage results.
 * Supports Brevo (Sendinblue) API.
 * Falls back gracefully if not configured.
 *
 * Also supports a generic SMTP fallback via Nodemailer in the future.
 */

interface PersonData {
  firstName: string;
  lastName: string;
  email: string;
}

interface TriageData {
  lane: string;
  score: string;
  metrics?: Record<string, number>;
  narrative?: {
    headline?: string;
    analysis?: string;
    strengths?: string[];
    nextSteps?: string[];
  } | null;
  programCount?: number;
}

const LANE_NAMES: Record<string, string> = {
  dscr: 'DSCR Rental Loan',
  flip: 'Fix & Flip Bridge Loan',
  str: 'Short-Term Rental Loan',
  multifamily: 'Multifamily Commercial Loan',
};

const SCORE_COLORS: Record<string, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

const SCORE_LABELS: Record<string, string> = {
  green: 'Strong Deal',
  yellow: 'Workable — Needs Optimization',
  red: 'Needs Restructuring',
};

function formatCurrency(val: number): string {
  return `$${val.toLocaleString('en-US')}`;
}

function buildMetricsHTML(lane: string, metrics: Record<string, number>): string {
  const rows: string[] = [];

  const addRow = (label: string, value: string) => {
    rows.push(`<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;">${label}</td><td style="padding:6px 12px;font-weight:600;color:#1e293b;font-size:13px;text-align:right;">${value}</td></tr>`);
  };

  switch (lane) {
    case 'dscr':
      addRow('DSCR Ratio', `${metrics.dscr}x`);
      addRow('LTV', `${metrics.ltv}%`);
      addRow('Purchase Price', formatCurrency(metrics.purchasePrice));
      addRow('Monthly Rent', formatCurrency(metrics.monthlyRent));
      addRow('Est. PITI', formatCurrency(metrics.estimatedPITI));
      break;
    case 'flip':
      addRow('LTC', `${metrics.ltc}%`);
      addRow('Purchase Price', formatCurrency(metrics.purchasePrice));
      addRow('Rehab Budget', formatCurrency(metrics.rehabBudget));
      addRow('ARV', formatCurrency(metrics.arv));
      addRow('Total Cost', formatCurrency(metrics.totalCost));
      break;
    case 'str':
      addRow('STR-DSCR', `${metrics.strDscr}x`);
      addRow('Monthly Revenue', formatCurrency(metrics.monthlyRevenue));
      addRow('Net Monthly', formatCurrency(metrics.netMonthlyIncome));
      addRow('Cap Rate', `${metrics.capRate}%`);
      addRow('Occupancy', `${metrics.occupancyRate}%`);
      break;
    case 'multifamily':
      addRow('DSCR', `${metrics.dscr}x`);
      addRow('Cap Rate', `${metrics.capRate}%`);
      addRow('NOI', formatCurrency(metrics.noi));
      addRow('Units', `${metrics.units}`);
      addRow('Price/Unit', formatCurrency(metrics.pricePerUnit));
      break;
  }

  return `<table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;margin:16px 0;">${rows.join('')}</table>`;
}

/**
 * Send confirmation email with triage results.
 * Pass triage data to include AI analysis in the email.
 */
export async function sendConfirmationEmail(
  person: PersonData,
  lane: string,
  triage?: TriageData | null
): Promise<void> {
  const apiKey = process.env.ESP_API_KEY;
  const fromEmail = process.env.ESP_FROM_EMAIL || 'team@818capitalpartners.com';

  if (!apiKey) {
    console.warn('[Email] ESP API key not configured — skipping confirmation email');
    return;
  }

  const laneName = LANE_NAMES[lane] || lane;
  const score = triage?.score || 'pending';
  const scoreColor = SCORE_COLORS[score] || '#94a3b8';
  const scoreLabel = SCORE_LABELS[score] || 'Analysis Complete';

  // Build metrics table
  const metricsHTML = triage?.metrics ? buildMetricsHTML(lane, triage.metrics) : '';

  // Build narrative section
  let narrativeHTML = '';
  if (triage?.narrative) {
    const n = triage.narrative;
    narrativeHTML = `
      <div style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:16px;margin:16px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px 0;font-weight:600;color:#1e40af;font-size:14px;">🤖 AI Analysis</p>
        <p style="margin:0 0 8px 0;font-weight:700;color:#1e293b;">${n.headline || ''}</p>
        <p style="margin:0;color:#475569;font-size:13px;line-height:1.6;">${n.analysis || ''}</p>
      </div>
    `;

    if (n.strengths && n.strengths.length > 0) {
      narrativeHTML += `
        <div style="margin:12px 0;">
          <p style="font-weight:600;color:#16a34a;font-size:13px;margin:0 0 6px 0;">✅ Strengths</p>
          <ul style="margin:0;padding:0 0 0 20px;color:#475569;font-size:13px;line-height:1.8;">
            ${n.strengths.map((s) => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (n.nextSteps && n.nextSteps.length > 0) {
      narrativeHTML += `
        <div style="margin:12px 0;">
          <p style="font-weight:600;color:#2563eb;font-size:13px;margin:0 0 6px 0;">🎯 Recommended Next Steps</p>
          <ol style="margin:0;padding:0 0 0 20px;color:#475569;font-size:13px;line-height:1.8;">
            ${n.nextSteps.map((s) => `<li>${s}</li>`).join('')}
          </ol>
        </div>
      `;
    }
  }

  // Program count
  const programHTML = triage?.programCount && triage.programCount > 0
    ? `<p style="color:#475569;font-size:13px;">✅ You qualify for <strong>${triage.programCount}</strong> of our lending program${triage.programCount > 1 ? 's' : ''}. Our team will match you with the best fit.</p>`
    : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#ffffff;">
      <div style="padding:32px 24px;">
        <!-- Score Banner -->
        <div style="background:${scoreColor};color:white;padding:16px 20px;border-radius:10px;margin-bottom:24px;text-align:center;">
          <p style="margin:0;font-size:18px;font-weight:700;">${laneName} — ${scoreLabel}</p>
        </div>

        <h2 style="color:#1e293b;margin:0 0 16px 0;">Hey ${person.firstName},</h2>

        <p style="color:#475569;line-height:1.6;">Thanks for submitting your <strong>${laneName}</strong> scenario to 818 Capital Partners. Here's your instant analysis:</p>

        <!-- Metrics Table -->
        ${metricsHTML}

        <!-- AI Narrative -->
        ${narrativeHTML}

        <!-- Program Info -->
        ${programHTML}

        <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />

        <p style="color:#475569;line-height:1.6;font-size:14px;">
          Our team is reviewing your scenario now. You'll hear back within a few hours with personalized financing options and next steps.
        </p>

        <p style="color:#475569;line-height:1.6;font-size:14px;">
          <strong>Reply to this email anytime</strong> — it goes directly to our team.
        </p>

        <div style="margin-top:24px;">
          <p style="margin:0;color:#1e293b;font-weight:600;">The 818 Capital Team</p>
          <p style="margin:4px 0 0 0;color:#94a3b8;font-size:12px;">818 Capital Partners | Direct Private Lending</p>
          <p style="margin:2px 0 0 0;color:#94a3b8;font-size:12px;">📞 (818) 555-1234 | ✉️ team@818capitalpartners.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailPayload = {
    sender: { name: '818 Capital Partners', email: fromEmail },
    to: [{ email: person.email, name: `${person.firstName} ${person.lastName}` }],
    subject: `Your ${laneName} Analysis — ${scoreLabel}`,
    htmlContent,
    tags: [`lane_${lane}`, `score_${score}`, 'web_lead', 'confirmation'],
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Email] Brevo API error: ${response.status} — ${errText}`);
    } else {
      console.log(`[Email] Confirmation sent to ${person.email} (${laneName}, ${score})`);
    }
  } catch (err) {
    console.error('[Email] Failed to send:', err);
  }
}
