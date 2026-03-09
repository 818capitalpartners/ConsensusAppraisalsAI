/**
 * Monday.com integration — writes to NEW Web Leads board (18403002532).
 *
 * IMPORTANT: DO NOT write to board 18402100042 (Loan Pipeline).
 * That board has Salesforce sync, Make.com automations, and 223+ existing deals.
 * This integration creates items on the separate Web Leads board only.
 *
 * Column IDs:
 *   email_mm1727ga    → Email
 *   phone_mm17ggpz    → Phone
 *   color_mm18xgw2    → AI Score (status: Green/Yellow/Red)
 *   color_mm18y4c4    → Product Lane (status: DSCR/Flip/STR/Multifamily)
 *   color_mm181eth    → Lead Status (status: New/Contacted/Qualified/Moved to Pipeline/Dead)
 *   text_mm17dte0     → Property State
 *   text_mm171bf1     → Property City
 *   text_mm176k7s     → Channel
 *   long_text_mm17bpap → AI Narrative
 *   text_mm17mbjg     → Key Metric
 *   numeric_mm17n7z2  → Loan Amount
 *   text_mm17g5r1     → Matched Lenders
 *
 * Groups:
 *   group_mm172q4y → 🟢 Hot Leads
 *   group_mm17ts2e → 🟡 Warm Leads
 *   group_mm17vcg3 → 🔴 Needs Review
 *   group_mm17n12r → ✅ Moved to Pipeline
 */

const MONDAY_API_URL = 'https://api.monday.com/v2';

// Group routing by deal score
const SCORE_GROUPS: Record<string, string> = {
  green: 'group_mm172q4y',
  yellow: 'group_mm17ts2e',
  red: 'group_mm17vcg3',
};

interface PersonData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
}

interface DealData {
  id: string;
  productLane: string;
  dealScore?: string | null;
  aiTriageResult?: unknown;
  propertyState?: string | null;
  propertyCity?: string | null;
  channel?: string | null;
}

interface MondayCreateItemResponse {
  data?: {
    create_item?: {
      id?: string;
    };
  };
  errors?: Array<{ message?: string }>;
}

function extractKeyMetric(lane: string, metrics: Record<string, number>): string {
  switch (lane) {
    case 'dscr':
      return `DSCR: ${metrics.dscr}x | LTV: ${metrics.ltv}%`;
    case 'flip':
      return `LTC: ${metrics.ltc}% | ARV: $${(metrics.arv || 0).toLocaleString()}`;
    case 'str':
      return `STR-DSCR: ${metrics.strDscr}x | Cap: ${metrics.capRate}%`;
    case 'multifamily':
      return `DSCR: ${metrics.dscr}x | Cap: ${metrics.capRate}%`;
    default:
      return '';
  }
}

function extractLoanAmount(lane: string, metrics: Record<string, number>): number {
  if (metrics.loanAmount) return metrics.loanAmount;
  if (metrics.totalCost) return Math.round(metrics.totalCost * 0.85); // 85% LTC for flip
  if (metrics.purchasePrice) return Math.round(metrics.purchasePrice * 0.75); // 75% LTV default
  return 0;
}

export async function postToMonday(person: PersonData, deal: DealData, lane: string): Promise<string | null> {
  const apiKey = process.env.MONDAY_API_KEY;
  const boardId = process.env.MONDAY_WEB_LEADS_BOARD_ID;

  if (!apiKey || !boardId) {
    console.warn('[Monday] API key or Web Leads board ID not configured — skipping');
    return null;
  }

  const itemName = `${person.firstName} ${person.lastName} — ${lane.toUpperCase()}`;
  const groupId = SCORE_GROUPS[deal.dealScore || 'red'] || SCORE_GROUPS.red;

  // Extract triage data
  const triage = deal.aiTriageResult as Record<string, unknown> | undefined;
  const metrics = (triage?.metrics || {}) as Record<string, number>;
  const narrative = triage?.narrative as { headline?: string; analysis?: string } | undefined;
  // Use _internalLenders (real lender data — internal only, not exposed to clients)
  const internalLenders = (triage?._internalLenders || []) as Array<{ name: string }>;

  const laneLabels: Record<string, string> = {
    dscr: 'DSCR',
    flip: 'Fix & Flip',
    str: 'STR',
    multifamily: 'Multifamily',
  };

  const scoreLabels: Record<string, string> = {
    green: 'Green',
    yellow: 'Yellow',
    red: 'Red',
  };

  // Build column values
  const columnValues: Record<string, unknown> = {
    email_mm1727ga: { email: person.email, text: person.email },
    phone_mm17ggpz: { phone: (person.phone || '').replace(/\D/g, ''), countryShortName: 'US' },
    color_mm18xgw2: { label: scoreLabels[deal.dealScore || 'red'] || 'Red' },
    color_mm18y4c4: { label: laneLabels[lane] || lane },
    color_mm181eth: { label: 'New' },
    text_mm17dte0: deal.propertyState || '',
    text_mm171bf1: deal.propertyCity || '',
    text_mm176k7s: deal.channel || 'web',
    text_mm17mbjg: extractKeyMetric(lane, metrics),
    numeric_mm17n7z2: extractLoanAmount(lane, metrics),
    text_mm17g5r1: internalLenders.map((l) => l.name).join(', ') || 'No matches',
  };

  // AI Narrative as long text
  if (narrative) {
    columnValues.long_text_mm17bpap = {
      text: `${narrative.headline || ''}\n\n${narrative.analysis || ''}`,
    };
  }

  const mutation = `mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
    create_item(
      board_id: $boardId,
      group_id: $groupId,
      item_name: $itemName,
      column_values: $columnValues
    ) {
      id
    }
  }`;

  try {
    const response = await fetch(MONDAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
        'API-Version': '2024-10',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          boardId: boardId,
          groupId: groupId,
          itemName: itemName,
          columnValues: JSON.stringify(columnValues),
        },
      }),
    });

    const data = (await response.json()) as MondayCreateItemResponse;

    if (data.errors) {
      console.error('[Monday] GraphQL errors:', JSON.stringify(data.errors));
      return null;
    }

    const itemId = data?.data?.create_item?.id ?? null;
    console.log(`[Monday] Created Web Lead item: ${itemId} in group ${groupId}`);
    return itemId;
  } catch (err) {
    console.error('[Monday] Failed to create item:', err);
    return null;
  }
}
