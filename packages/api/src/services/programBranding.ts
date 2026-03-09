import { Lender } from '@818capital/db';

/**
 * 818 Capital Program Branding Service
 *
 * Transforms real lender data into branded 818 Capital programs.
 * Client-facing output NEVER exposes real lender names — instead,
 * each qualifying product appears as an 818 Capital branded program.
 *
 * Internal tools (Monday.com, Slack) still use real lender names.
 */

// ─── Branded Program Name Generators ────────────────────

const DSCR_PROGRAM_NAMES = [
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
];

const FLIP_PROGRAM_NAMES = [
  '818 QuickFlip Bridge',
  '818 RenovateNow',
  '818 FlipFund Express',
  '818 Builder\'s Edge',
  '818 Rehab Capital',
  '818 BridgeLine',
  '818 RapidClose',
  '818 Value-Add Bridge',
  '818 Flip Advantage',
  '818 Construction Bridge',
];

const STR_PROGRAM_NAMES = [
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
];

const MULTIFAMILY_PROGRAM_NAMES = [
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
];

const PROGRAM_NAME_MAP: Record<string, string[]> = {
  dscr: DSCR_PROGRAM_NAMES,
  flip: FLIP_PROGRAM_NAMES,
  str: STR_PROGRAM_NAMES,
  multifamily: MULTIFAMILY_PROGRAM_NAMES,
};

// ─── Types ──────────────────────────────────────────────

export interface BrandedProgram {
  programName: string;
  highlights: string[];
}

// ─── Core Branding Functions ────────────────────────────

/**
 * Transform a list of matching lenders into branded 818 Capital programs.
 * Each real lender becomes a branded program with generic highlights
 * derived from their actual criteria (without exposing the lender name).
 */
export function brandLenders(lenders: Lender[], lane: string): BrandedProgram[] {
  const namePool = PROGRAM_NAME_MAP[lane] || DSCR_PROGRAM_NAMES;

  return lenders.map((lender, index) => {
    const programName = namePool[index % namePool.length];
    const highlights = buildHighlights(lender, lane);

    return { programName, highlights };
  });
}

function buildHighlights(lender: Lender, lane: string): string[] {
  const highlights: string[] = [];

  if (lender.maxLtv) {
    highlights.push(`Up to ${lender.maxLtv}% LTV`);
  }

  if (lender.rateRange) {
    highlights.push(`Rates from ${lender.rateRange}`);
  }

  if (lender.minDscr) {
    highlights.push(`Min DSCR: ${lender.minDscr}x`);
  }

  if (lender.maxLtc) {
    highlights.push(`Up to ${lender.maxLtc}% LTC`);
  }

  if (lender.maxUnits) {
    highlights.push(`Up to ${lender.maxUnits} units`);
  }

  if (lender.minLoan || lender.maxLoan) {
    const parts: string[] = [];
    if (lender.minLoan) parts.push(`$${(lender.minLoan / 1000).toFixed(0)}K min`);
    if (lender.maxLoan) parts.push(`$${(lender.maxLoan / 1000000).toFixed(1)}M max`);
    highlights.push(parts.join(' — '));
  }

  // Add lane-specific generic highlights if we have few
  if (highlights.length < 2) {
    switch (lane) {
      case 'dscr':
        highlights.push('No income verification required');
        break;
      case 'flip':
        highlights.push('Close in as few as 7 business days');
        break;
      case 'str':
        highlights.push('Airbnb/VRBO income accepted');
        break;
      case 'multifamily':
        highlights.push('Flexible sponsor requirements');
        break;
    }
  }

  return highlights;
}

/**
 * Get the count of qualifying programs (used for client-facing messaging).
 * Caps at a reasonable number to avoid revealing the exact lender count.
 */
export function getProgramCount(lenderCount: number): number {
  if (lenderCount === 0) return 0;
  if (lenderCount <= 3) return lenderCount;
  if (lenderCount <= 6) return Math.min(lenderCount, 4);
  return Math.min(lenderCount, 5); // Cap at 5 programs shown to client
}

/**
 * Get client-facing program summary text.
 */
export function getProgramSummary(programCount: number, lane: string): string {
  if (programCount === 0) {
    return 'Our team will review your scenario and identify the best financing path.';
  }

  const laneLabel: Record<string, string> = {
    dscr: 'DSCR rental loan',
    flip: 'fix & flip bridge',
    str: 'short-term rental',
    multifamily: 'multifamily',
  };

  const label = laneLabel[lane] || lane;

  if (programCount === 1) {
    return `You qualify for our ${label} program.`;
  }

  return `You qualify for ${programCount} of our ${label} programs. Our team will match you with the best fit.`;
}
