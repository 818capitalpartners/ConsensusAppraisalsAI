import { prisma, Prisma } from '@818capital/db';

/**
 * Monday.com Lender Profiles Board → Postgres sync.
 *
 * Board ID: 18402739985
 * Column ID mappings (from dedup audit):
 *   color_mm15ytv7    → productType (status label)
 *   numeric_mm159c16  → minLoan
 *   numeric_mm15x2g5  → maxLoan
 *   numeric_mm15v0bq  → maxLtv
 *   numeric_mm15qemn  → minDscr
 *   numeric_mm15khc0  → maxUnits
 *   text_mm15nays     → geography (states)
 *   long_text_mm152stp → notes
 *   text_mm15jhke     → keyContact
 *   email_mm15wdk3    → contactEmail
 *   numeric_mm15e7hm  → uwFee
 *   text_mm15dhqj     → rateRange
 *   text_mm15xdwm     → prepayOptions
 */

const MONDAY_API_URL = 'https://api.monday.com/v2';
const BOARD_ID = process.env.MONDAY_LENDER_PROFILES_BOARD_ID || '18402739985';

interface MondayColumn {
  id: string;
  text: string;
  value: string | null;
}

interface MondayItem {
  id: string;
  name: string;
  column_values: MondayColumn[];
}

interface MondayBoardResponse {
  data?: {
    boards?: Array<{
      items_page?: {
        items?: MondayItem[];
      };
    }>;
  };
}

async function fetchLendersFromMonday(): Promise<MondayItem[]> {
  const apiKey = process.env.MONDAY_API_KEY;
  if (!apiKey) {
    console.warn('MONDAY_API_KEY not set — skipping lender sync');
    return [];
  }

  const query = `{
    boards(ids: [${BOARD_ID}]) {
      items_page(limit: 100) {
        items {
          id
          name
          column_values {
            id
            text
            value
          }
        }
      }
    }
  }`;

  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Monday API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as MondayBoardResponse;
  return data?.data?.boards?.[0]?.items_page?.items || [];
}

function getColumnText(item: MondayItem, columnId: string): string | null {
  const col = item.column_values.find((c) => c.id === columnId);
  return col?.text || null;
}

function getColumnNumber(item: MondayItem, columnId: string): number | null {
  const text = getColumnText(item, columnId);
  if (!text) return null;
  const num = parseFloat(text.replace(/[,$]/g, ''));
  return isNaN(num) ? null : num;
}

function parseGeography(statesText: string | null): { states: string[]; nationwide: boolean } | null {
  if (!statesText) return null;
  const upper = statesText.toUpperCase();

  // Detect nationwide patterns
  const nationwidePatterns = ['NATIONWIDE', 'ALL STATES', 'ALL 50', '49 STATES', '46 STATES', '47 STATES', '48 STATES', '37 STATES'];
  const isNationwide = nationwidePatterns.some((p) => upper.includes(p));

  if (isNationwide) {
    return { states: [upper], nationwide: true };
  }

  // Parse individual states
  const states = statesText
    .split(/[,;|\n]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0 && s.length <= 3); // state abbreviations are 2 chars
  return { states, nationwide: false };
}

export async function syncLenders(): Promise<{ synced: number; errors: number }> {
  console.log('[LenderSync] Starting sync from Monday.com board', BOARD_ID);

  let items: MondayItem[];
  try {
    items = await fetchLendersFromMonday();
  } catch (err) {
    console.error('[LenderSync] Failed to fetch from Monday:', err);
    return { synced: 0, errors: 1 };
  }

  if (items.length === 0) {
    console.warn('[LenderSync] No items returned from Monday.com');
    return { synced: 0, errors: 0 };
  }

  let synced = 0;
  let errors = 0;

  for (const item of items) {
    try {
      const lenderData = {
        name: item.name,
        productType: getColumnText(item, 'color_mm15ytv7'),
        minLoan: getColumnNumber(item, 'numeric_mm159c16'),
        maxLoan: getColumnNumber(item, 'numeric_mm15x2g5'),
        maxLtv: getColumnNumber(item, 'numeric_mm15v0bq'),
        minDscr: getColumnNumber(item, 'numeric_mm15qemn'),
        maxUnits: getColumnNumber(item, 'numeric_mm15khc0') ? Math.floor(getColumnNumber(item, 'numeric_mm15khc0')!) : null,
        geography: (parseGeography(getColumnText(item, 'text_mm15nays')) ?? Prisma.JsonNull) as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput,
        notes: getColumnText(item, 'long_text_mm152stp'),
        keyContact: getColumnText(item, 'text_mm15jhke'),
        contactEmail: getColumnText(item, 'email_mm15wdk3'),
        uwFee: getColumnNumber(item, 'numeric_mm15e7hm'),
        rateRange: getColumnText(item, 'text_mm15dhqj'),
        prepayOptions: getColumnText(item, 'text_mm15xdwm'),
        syncedAt: new Date(),
      };

      await prisma.lender.upsert({
        where: { mondayItemId: item.id },
        update: lenderData,
        create: {
          mondayItemId: item.id,
          ...lenderData,
        },
      });

      synced++;
    } catch (err) {
      console.error(`[LenderSync] Error syncing lender "${item.name}":`, err);
      errors++;
    }
  }

  console.log(`[LenderSync] Complete: ${synced} synced, ${errors} errors`);
  return { synced, errors };
}
