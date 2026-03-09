/**
 * Daily lead summary — aggregates yesterday's web leads and posts to Slack.
 * Runs at 8 AM daily.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LeadSummary {
  total: number;
  byLane: Record<string, number>;
  byScore: Record<string, number>;
  topLenders: { name: string; count: number }[];
  avgLoanAmount: number;
}

export async function generateLeadSummary(): Promise<LeadSummary> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deals = await prisma.deal.findMany({
    where: {
      createdAt: {
        gte: yesterday,
        lt: today,
      },
    },
    select: {
      productLane: true,
      dealScore: true,
      aiTriageResult: true,
      financials: true,
    },
  });

  const byLane: Record<string, number> = {};
  const byScore: Record<string, number> = {};
  const lenderCounts: Record<string, number> = {};
  let totalLoanAmount = 0;
  let loanCount = 0;

  for (const deal of deals) {
    // Count by lane
    byLane[deal.productLane] = (byLane[deal.productLane] || 0) + 1;

    // Count by score
    const score = deal.dealScore || 'pending';
    byScore[score] = (byScore[score] || 0) + 1;

    // Count lender matches
    const triage = deal.aiTriageResult as Record<string, unknown> | null;
    if (triage?.matchingLenders) {
      for (const lender of triage.matchingLenders as Array<{ name: string }>) {
        lenderCounts[lender.name] = (lenderCounts[lender.name] || 0) + 1;
      }
    }

    // Sum loan amounts
    const metrics = (triage?.metrics || {}) as Record<string, number>;
    if (metrics.loanAmount) {
      totalLoanAmount += metrics.loanAmount;
      loanCount++;
    }
  }

  const topLenders = Object.entries(lenderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    total: deals.length,
    byLane,
    byScore,
    topLenders,
    avgLoanAmount: loanCount > 0 ? Math.round(totalLoanAmount / loanCount) : 0,
  };
}

export async function postLeadSummary(): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[LeadSummary] Slack webhook not configured — skipping');
    return;
  }

  const summary = await generateLeadSummary();

  if (summary.total === 0) {
    console.log('[LeadSummary] No leads yesterday — skipping Slack post');
    return;
  }

  const scoreEmoji: Record<string, string> = { green: '\u{1F7E2}', yellow: '\u{1F7E1}', red: '\u{1F534}' };
  const laneNames: Record<string, string> = { dscr: 'DSCR', flip: 'Fix & Flip', str: 'STR', multifamily: 'Multifamily' };

  const laneBreakdown = Object.entries(summary.byLane)
    .map(([lane, count]) => `${laneNames[lane] || lane}: *${count}*`)
    .join('  |  ');

  const scoreBreakdown = Object.entries(summary.byScore)
    .map(([score, count]) => `${scoreEmoji[score] || '\u26AA'} ${score}: *${count}*`)
    .join('  |  ');

  const lenderList = summary.topLenders
    .map(l => `${l.name} (${l.count})`)
    .join(', ');

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `\u{1F4CA} Daily Lead Summary — ${summary.total} New Leads`, emoji: true },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*By Lane:* ${laneBreakdown}` },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*By Score:* ${scoreBreakdown}` },
    },
    ...(summary.avgLoanAmount > 0 ? [{
      type: 'section',
      text: { type: 'mrkdwn', text: `*Avg Loan:* $${summary.avgLoanAmount.toLocaleString()}` },
    }] : []),
    ...(lenderList ? [{
      type: 'section',
      text: { type: 'mrkdwn', text: `*Top Matched Lenders:* ${lenderList}` },
    }] : []),
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `Yesterday's leads via 818capitalpartners.com | ${new Date().toLocaleDateString('en-US')}` },
      ],
    },
  ];

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
      console.error(`[LeadSummary] Slack webhook failed: ${response.status}`);
    } else {
      console.log(`[LeadSummary] Posted summary: ${summary.total} leads`);
    }
  } catch (err) {
    console.error('[LeadSummary] Failed to post:', err);
  }
}
