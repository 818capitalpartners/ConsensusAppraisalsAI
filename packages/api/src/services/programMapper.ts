/**
 * 818 Capital — Program Mapper
 *
 * Maps real lender names to deterministic 818 Capital program names.
 * Uses a hash so the SAME lender always resolves to the SAME program name
 * (unlike index-based assignment which shifts when the list changes).
 *
 * Client-facing code should ONLY reference program names.
 * Internal tools (Monday.com, Slack) still use real lender names.
 */

// ─── Program Name Pools (per lane) ─────────────────────

const PROGRAM_POOLS: Record<string, string[]> = {
  dscr: [
    '818 FlexRate DSCR',
    '818 Prime Rental',
    '818 CashFlow Plus',
    '818 Investor Advantage',
    '818 Portfolio DSCR',
    '818 Elite Rental',
    '818 Express DSCR',
    '818 SmartRent',
    '818 Capital Core',
    '818 Performance DSCR',
  ],
  flip: [
    '818 QuickFlip Bridge',
    '818 RenovateNow',
    '818 FlipFund Express',
    "818 Builder's Edge",
    '818 Rehab Capital',
    '818 BridgeLine',
    '818 RapidClose',
    '818 Value-Add Bridge',
    '818 Flip Advantage',
    '818 Construction Bridge',
  ],
  str: [
    '818 Airbnb Investor',
    '818 Vacation Rental',
    '818 STR CashFlow',
    '818 Short-Stay Plus',
    '818 Rental Income',
    '818 Revenue DSCR',
    '818 Hospitality',
    '818 SmartSTR',
    '818 FlexStay',
    '818 Nightly Revenue',
  ],
  multifamily: [
    '818 Multifamily Core',
    '818 Apartment Capital',
    '818 Portfolio Plus',
    '818 Commercial Bridge',
    '818 Value-Add Multi',
    '818 Stabilized Multi',
    '818 Scale Capital',
    '818 Sponsor Select',
    '818 Multi Advantage',
    '818 Community Capital',
  ],
};

// ─── Hash Function ──────────────────────────────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// ─── Public API ─────────────────────────────────────────

/**
 * Map a single lender name to a deterministic 818 Capital program name.
 */
export function mapLenderToProgram(lenderName: string, lane: string): string {
  const pool = PROGRAM_POOLS[lane] || PROGRAM_POOLS.dscr;
  const index = hashString(lenderName.toLowerCase()) % pool.length;
  return pool[index];
}

/**
 * Map an array of lender names to their branded program names.
 * Deduplicates — if two lenders hash to the same program, shifts the second.
 */
export function mapLendersToPrograms(lenderNames: string[], lane: string): string[] {
  const pool = PROGRAM_POOLS[lane] || PROGRAM_POOLS.dscr;
  const used = new Set<string>();
  const result: string[] = [];

  for (const name of lenderNames) {
    let index = hashString(name.toLowerCase()) % pool.length;
    let programName = pool[index];

    // If collision, find next unused name in pool
    let attempts = 0;
    while (used.has(programName) && attempts < pool.length) {
      index = (index + 1) % pool.length;
      programName = pool[index];
      attempts++;
    }

    used.add(programName);
    result.push(programName);
  }

  return result;
}

/**
 * Get all available program names for a lane.
 */
export function getProgramPool(lane: string): string[] {
  return [...(PROGRAM_POOLS[lane] || PROGRAM_POOLS.dscr)];
}
