/**
 * Slack integration — posts new web leads to #web-leads channel.
 * Uses incoming webhook URL.
 *
 * Does NOT replace Missive (which handles ops comms).
 * This is web-lead-only notification with AI triage data.
 */

interface PersonData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

interface DealData {
  id: string;
  productLane: string;
  dealScore?: string | null;
  aiTriageResult?: unknown;
  propertyState?: string | null;
  propertyCity?: string | null;
}

const SCORE_EMOJI: Record<string, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

const LANE_NAMES: Record<string, string> = {
  dscr: 'DSCR Rental',
  flip: 'Fix & Flip',
  str: 'Short-Term Rental',
  multifamily: 'Multifamily',
};

function formatCurrency(val: number): string {
  return `$${val.toLocaleString('en-US')}`;
}

function buildMetricsSummary(lane: string, metrics: Record<string, number>): string {
  switch (lane) {
    case 'dscr':
      return [
        `DSCR: *${metrics.dscr}x*`,
        `LTV: ${metrics.ltv}%`,
        `Purchase: ${formatCurrency(metrics.purchasePrice)}`,
        `Rent: ${formatCurrency(metrics.monthlyRent)}/mo`,
        `PITI: ${formatCurrency(metrics.estimatedPITI)}/mo`,
      ].join('  |  ');
    case 'flip':
      return [
        `LTC: *${metrics.ltc}%*`,
        `Purchase: ${formatCurrency(metrics.purchasePrice)}`,
        `Rehab: ${formatCurrency(metrics.rehabBudget)}`,
        `ARV: ${formatCurrency(metrics.arv)}`,
      ].join('  |  ');
    case 'str':
      return [
        `STR-DSCR: *${metrics.strDscr}x*`,
        `Revenue: ${formatCurrency(metrics.monthlyRevenue)}/mo`,
        `Net: ${formatCurrency(metrics.netMonthlyIncome)}/mo`,
        `Cap Rate: ${metrics.capRate}%`,
      ].join('  |  ');
    case 'multifamily':
      return [
        `DSCR: *${metrics.dscr}x*`,
        `Cap Rate: ${metrics.capRate}%`,
        `NOI: ${formatCurrency(metrics.noi)}`,
        `Units: ${metrics.units}`,
      ].join('  |  ');
    default:
      return Object.entries(metrics).map(([k, v]) => `${k}: ${v}`).join('  |  ');
  }
}

export async function notifySlack(person: PersonData, deal: DealData, lane: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('[Slack] Webhook URL not configured — skipping');
    return;
  }

  const emoji = SCORE_EMOJI[deal.dealScore || 'red'] || '⚪';
  const laneName = LANE_NAMES[lane] || lane.toUpperCase();
  const location = [deal.propertyCity, deal.propertyState].filter(Boolean).join(', ');

  // Extract triage data
  const triage = deal.aiTriageResult as Record<string, unknown> | undefined;
  const metrics = (triage?.metrics || {}) as Record<string, number>;
  const narrative = triage?.narrative as { headline?: string; analysis?: string } | undefined;
  // Use _internalLenders (real lender data — internal only, not exposed to clients)
  const internalLenders = (triage?._internalLenders || []) as Array<{ name: string }>;
  const lenderCount = (triage?._internalLenderCount as number) || internalLenders.length;

  const blocks: unknown[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${emoji} New ${laneName} Lead`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Name:*\n${person.firstName} ${person.lastName}` },
        { type: 'mrkdwn', text: `*Email:*\n${person.email}` },
        { type: 'mrkdwn', text: `*Phone:*\n${person.phone || 'N/A'}` },
        { type: 'mrkdwn', text: `*Location:*\n${location || 'N/A'}` },
      ],
    },
    { type: 'divider' },
  ];

  // Metrics summary
  if (Object.keys(metrics).length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📊 *Metrics:* ${buildMetricsSummary(lane, metrics)}`,
      },
    });
  }

  // AI Narrative headline
  if (narrative?.headline) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🤖 *AI Take:* ${narrative.headline}`,
      },
    });
  }

  // Lender matches
  if (lenderCount > 0) {
    const lenderNames = internalLenders.map((l) => l.name).slice(0, 5).join(', ');
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🏦 *${lenderCount} Lender${lenderCount > 1 ? 's' : ''} Matched:* ${lenderNames}`,
      },
    });
  }

  // Score badge
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `${emoji} Score: *${(deal.dealScore || 'pending').toUpperCase()}*  |  Deal ID: \`${deal.id.slice(0, 8)}\`  |  via 818capitalpartners.com`,
      },
    ],
  });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Slack] Webhook failed: ${response.status} — ${errText}`);
    } else {
      console.log('[Slack] Lead notification sent');
    }
  } catch (err) {
    console.error('[Slack] Failed to send notification:', err);
  }
}
