/**
 * 818 Capital Partners — Multi-Lender Loan Pricing Engine
 * Effective: 4/13/2026
 *
 * Internal wholesale pricing. NEVER expose lender names or codes to borrowers.
 * Client sees generic program types only. Best 1-2 options surfaced.
 *
 * Internal Lender Codes:
 *   AHL-001 = AHL (Invest Star Income DSCR + RTL)
 *   ESC-001 = Easy Street Capital (Signature Series DSCR)
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface DSCRPricingInput {
  fico: number;
  ltv: number; // as decimal, e.g. 0.75
  loanAmount: number;
  purpose: 'purchase' | 'rate_term' | 'cashout';
  propertyType: 'sfr' | 'condo' | 'nw_condo' | 'condotel' | '2_4_unit' | '5_10_unit';
  interestOnly: boolean;
  isSTR: boolean;
  dscr?: number;
  prepayYears: 0 | 1 | 2 | 3 | 4 | 5;
  bankStatements: boolean;
  state?: string; // for geographic restrictions
  isRural?: boolean;
  loanStructure?: '30yr_fixed' | '5_6_arm';
}

export interface RTLPricingInput {
  fico: number;
  experience: number; // completed projects
  ltc: number; // as decimal
  arv: number;
  loanAmount: number;
  loanType: 'fix_flip' | 'bridge_purchase' | 'bridge_rate_term' | 'bridge_cashout' | 'ground_up';
  isJudicialState: boolean;
}

export interface PricingResult {
  estimatedRate: number; // annual %
  points: number;
  exitFee: number;
  maxLTV: number;
  maxLTC: number;
  fees: { name: string; amount: number }[];
  prepayPenalty: string;
  notes: string[];
  program: string; // generic name, NO lender names
  _lenderCode?: string; // INTERNAL ONLY — stripped before client response
}

// ── DSCR Rate Tables (Invest Star Income — Page 1) ──────────────────────────

// Base rate table: [noteRate, price45day]
const DSCR_BASE_RATES: [number, number][] = [
  [6.000, 97.625], [6.125, 98.125], [6.250, 98.750], [6.375, 99.375],
  [6.500, 99.875], [6.625, 100.375], [6.750, 100.875], [6.875, 101.375],
  [7.000, 101.875], [7.125, 102.375], [7.250, 102.750], [7.375, 103.250],
  [7.500, 103.625], [7.625, 104.000], [7.750, 104.375], [7.875, 104.750],
  [8.000, 105.125], [8.125, 105.500], [8.250, 105.750], [8.375, 106.125],
  [8.500, 106.375], [8.625, 106.750], [8.750, 107.000], [8.875, 107.250],
  [9.000, 107.500], [9.125, 107.750], [9.250, 108.000],
];

// LLPA grids: FICO thresholds mapped to LTV bucket adjustments
// LTV buckets: <=50, <=55, <=60, <=65, <=70, <=75, <=80, <=85, <=90
const LTV_BUCKETS = [0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90];

type LLPAGrid = { minFico: number; adj: (number | null)[] }[];

const PURCHASE_LLPA: LLPAGrid = [
  { minFico: 780, adj: [1.125, 1.125, 1.125, 1.125, 1.000, 0.750, 0.125, -0.875, null] },
  { minFico: 760, adj: [1.125, 1.125, 1.125, 1.000, 0.875, 0.625, -0.125, -1.125, null] },
  { minFico: 740, adj: [1.000, 1.000, 1.000, 0.875, 0.750, 0.500, -0.500, -1.500, null] },
  { minFico: 720, adj: [0.875, 0.875, 0.750, 0.750, 0.500, 0.125, -1.000, null, null] },
  { minFico: 700, adj: [0.500, 0.500, 0.375, 0.250, 0.000, -0.375, -1.875, null, null] },
  { minFico: 680, adj: [-0.125, -0.250, -0.250, -0.500, -0.750, -1.375, -3.000, null, null] },
  { minFico: 660, adj: [-1.025, -1.250, -1.500, -1.750, -2.000, -2.500, null, null, null] },
];

const RATE_TERM_LLPA: LLPAGrid = [
  { minFico: 780, adj: [1.125, 1.125, 1.125, 1.000, 0.875, 0.625, 0.000, null, null] },
  { minFico: 760, adj: [1.125, 1.125, 1.000, 0.875, 0.750, 0.500, -0.375, null, null] },
  { minFico: 740, adj: [1.000, 1.000, 0.875, 0.750, 0.625, 0.250, -0.750, null, null] },
  { minFico: 720, adj: [0.875, 0.750, 0.750, 0.500, 0.250, -0.250, -1.375, null, null] },
  { minFico: 700, adj: [0.500, 0.375, 0.250, 0.000, -0.500, -1.000, -2.500, null, null] },
  { minFico: 680, adj: [-0.250, -0.250, -0.500, -0.875, -1.500, -2.125, -3.875, null, null] },
  { minFico: 660, adj: [-1.025, -1.250, -1.500, -1.750, -2.000, -2.500, null, null, null] },
];

const CASHOUT_LLPA: LLPAGrid = [
  { minFico: 780, adj: [1.000, 1.000, 0.875, 0.875, 0.625, 0.500, -0.250, null, null] },
  { minFico: 760, adj: [0.875, 0.875, 0.875, 0.750, 0.500, 0.250, -0.625, null, null] },
  { minFico: 740, adj: [0.750, 0.750, 0.750, 0.500, 0.250, 0.000, -1.125, null, null] },
  { minFico: 720, adj: [0.625, 0.625, 0.500, 0.250, -0.125, -0.500, null, null, null] },
  { minFico: 700, adj: [0.250, 0.250, 0.000, -0.375, -0.875, -1.500, null, null, null] },
  { minFico: 680, adj: [-0.375, -0.500, -0.750, -1.250, -1.875, -2.750, null, null, null] },
  { minFico: 660, adj: [-1.375, -1.500, -1.750, -2.250, -3.200, null, null, null, null] },
];

// Stacking adjustments (price hits)
function getDSCRStackingAdj(input: DSCRPricingInput): number {
  let adj = 0;
  const ltvPct = input.ltv * 100;
  const ltvIdx = getLTVBucketIndex(input.ltv);

  // Bank statements
  if (input.bankStatements) {
    const bsAdj = [-0.250, -0.250, -0.375, -0.500, -0.625, -0.750, -0.875, -1.000, 0];
    adj += bsAdj[Math.min(ltvIdx, bsAdj.length - 1)] || 0;
  }

  // Interest only
  if (input.interestOnly) adj += -0.500;

  // Property type
  if (input.propertyType === 'condo') {
    const condoAdj = [-0.125, -0.125, -0.125, -0.250, -0.500, -0.750, -0.750, -0.750, 0];
    adj += condoAdj[Math.min(ltvIdx, condoAdj.length - 1)] || 0;
  } else if (input.propertyType === 'nw_condo') {
    adj += -1.375;
  } else if (input.propertyType === 'condotel') {
    adj += -1.375;
  } else if (input.propertyType === '2_4_unit') {
    const unitAdj = [-0.500, -0.500, -0.500, -0.500, -0.625, -0.750, -0.750, 0, 0];
    adj += unitAdj[Math.min(ltvIdx, unitAdj.length - 1)] || 0;
  }

  // STR
  if (input.isSTR) {
    const strAdj = [-0.500, -0.500, -0.500, -0.500, -0.625, -0.750, 0, 0, 0];
    adj += strAdj[Math.min(ltvIdx, strAdj.length - 1)] || 0;
  }

  // Loan size adjustments
  if (input.loanAmount >= 100000 && input.loanAmount <= 150000) adj += -0.750;
  else if (input.loanAmount >= 1000001 && input.loanAmount <= 1500000) adj += -0.500;
  else if (input.loanAmount >= 1500001 && input.loanAmount <= 2000000) adj += -0.625;

  // Prepayment adjustments (better rate with longer prepay)
  const prepayAdj: Record<number, number> = { 5: 0.750, 4: 0.500, 3: 0.000, 2: -0.750, 1: -1.500, 0: -2.375 };
  adj += prepayAdj[input.prepayYears] ?? 0;

  return adj;
}

// ── RTL Rate Tables (Fix & Flip — No Franchise, Lender Funded) ───────────────

interface RTLRow {
  minExperience: number;
  maxExperience: number;
  minFico: number;
  ltc: number;
  arltvNJD: number;
  arltvJD: number;
  rate: number;
  points: number;
  exitFee: number;
}

const RTL_FIX_FLIP: RTLRow[] = [
  // 10+ projects
  { minExperience: 10, maxExperience: 999, minFico: 720, ltc: 0.95, arltvNJD: 0.75, arltvJD: 0.70, rate: 9.500, points: 0.750, exitFee: 0.750 },
  { minExperience: 10, maxExperience: 999, minFico: 660, ltc: 0.93, arltvNJD: 0.75, arltvJD: 0.70, rate: 9.750, points: 0.750, exitFee: 0.750 },
  { minExperience: 10, maxExperience: 999, minFico: 700, ltc: 0.90, arltvNJD: 0.75, arltvJD: 0.70, rate: 9.250, points: 0.750, exitFee: 0.750 },
  { minExperience: 10, maxExperience: 999, minFico: 660, ltc: 0.90, arltvNJD: 0.75, arltvJD: 0.70, rate: 9.500, points: 0.750, exitFee: 0.750 },
  { minExperience: 10, maxExperience: 999, minFico: 660, ltc: 0.85, arltvNJD: 0.75, arltvJD: 0.70, rate: 9.250, points: 0.750, exitFee: 0.750 },
  // 6-9 projects
  { minExperience: 6, maxExperience: 9, minFico: 660, ltc: 0.93, arltvNJD: 0.75, arltvJD: 0.70, rate: 10.250, points: 0.750, exitFee: 0.750 },
  { minExperience: 6, maxExperience: 9, minFico: 660, ltc: 0.90, arltvNJD: 0.75, arltvJD: 0.70, rate: 10.125, points: 0.750, exitFee: 0.750 },
  { minExperience: 6, maxExperience: 9, minFico: 660, ltc: 0.85, arltvNJD: 0.75, arltvJD: 0.70, rate: 9.999, points: 0.750, exitFee: 0.750 },
  // 3-5 projects
  { minExperience: 3, maxExperience: 5, minFico: 660, ltc: 0.90, arltvNJD: 0.75, arltvJD: 0.70, rate: 10.250, points: 1.000, exitFee: 1.000 },
  { minExperience: 3, maxExperience: 5, minFico: 660, ltc: 0.85, arltvNJD: 0.75, arltvJD: 0.70, rate: 10.125, points: 1.000, exitFee: 1.000 },
  // 1-2 projects
  { minExperience: 1, maxExperience: 2, minFico: 660, ltc: 0.85, arltvNJD: 0.70, arltvJD: 0.70, rate: 10.250, points: 1.000, exitFee: 1.000 },
  { minExperience: 1, maxExperience: 2, minFico: 660, ltc: 0.80, arltvNJD: 0.70, arltvJD: 0.70, rate: 10.125, points: 1.000, exitFee: 1.000 },
  // 0 projects
  { minExperience: 0, maxExperience: 0, minFico: 700, ltc: 0.85, arltvNJD: 0.70, arltvJD: 0.65, rate: 10.750, points: 1.000, exitFee: 1.000 },
  { minExperience: 0, maxExperience: 0, minFico: 660, ltc: 0.80, arltvNJD: 0.65, arltvJD: 0.65, rate: 10.999, points: 1.000, exitFee: 1.000 },
];

const RTL_BRIDGE: { purpose: string; minFico: number; ltvNJD: number; ltvJD: number; rate: number }[] = [
  { purpose: 'purchase', minFico: 720, ltvNJD: 0.80, ltvJD: 0.70, rate: 9.999 },
  { purpose: 'purchase', minFico: 700, ltvNJD: 0.75, ltvJD: 0.70, rate: 10.250 },
  { purpose: 'purchase', minFico: 660, ltvNJD: 0.75, ltvJD: 0.70, rate: 10.500 },
  { purpose: 'rate_term', minFico: 700, ltvNJD: 0.70, ltvJD: 0.65, rate: 10.625 },
  { purpose: 'rate_term', minFico: 660, ltvNJD: 0.70, ltvJD: 0.65, rate: 10.750 },
  { purpose: 'cashout', minFico: 700, ltvNJD: 0.65, ltvJD: 0.60, rate: 10.875 },
  { purpose: 'cashout', minFico: 660, ltvNJD: 0.65, ltvJD: 0.60, rate: 11.000 },
];

// ── ESC-001 DSCR Rate Tables (Easy Street Capital — Signature Series) ──────
// Effective: 4/13/2026 | CONFIDENTIAL

// Base rates: [noteRate, premium] — Acquisition/Rate-Term
const ESC_BASE_RATES_PURCHASE: [number, number][] = [
  [10.500, 109.450], [10.375, 109.200], [10.250, 108.950], [10.125, 108.700],
  [10.000, 108.450], [9.875, 108.200], [9.750, 107.950], [9.625, 107.700],
  [9.500, 107.450], [9.375, 107.200], [9.250, 106.950], [9.125, 106.700],
  [9.000, 106.450], [8.875, 106.200], [8.750, 105.950], [8.625, 105.700],
  [8.500, 105.450], [8.375, 105.200], [8.250, 104.950], [8.125, 104.669],
  [8.000, 104.356], [7.875, 104.044], [7.750, 103.731], [7.625, 103.419],
  [7.500, 103.044], [7.375, 102.669], [7.250, 102.231], [7.125, 101.794],
  [7.000, 101.294], [6.875, 100.794], [6.750, 100.231], [6.625, 99.669],
  [6.500, 99.044], [6.375, 98.419], [6.250, 97.731], [6.125, 97.043],
  [6.000, 96.356], [5.875, 95.606], [5.750, 94.856], [5.625, 94.106],
  [5.500, 93.356],
];

// Base rates: Cash-Out Refinance (slightly lower premiums)
const ESC_BASE_RATES_CASHOUT: [number, number][] = [
  [10.500, 108.950], [10.375, 108.700], [10.250, 108.450], [10.125, 108.200],
  [10.000, 107.950], [9.875, 107.700], [9.750, 107.450], [9.625, 107.200],
  [9.500, 106.950], [9.375, 106.700], [9.250, 106.450], [9.125, 106.200],
  [9.000, 105.950], [8.875, 105.700], [8.750, 105.450], [8.625, 105.200],
  [8.500, 104.950], [8.375, 104.700], [8.250, 104.450], [8.125, 104.169],
  [8.000, 103.856], [7.875, 103.544], [7.750, 103.231], [7.625, 102.919],
  [7.500, 102.544], [7.375, 102.169], [7.250, 101.731], [7.125, 101.294],
  [7.000, 100.794], [6.875, 100.294], [6.750, 99.731], [6.625, 99.169],
  [6.500, 98.544], [6.375, 97.919], [6.250, 97.231], [6.125, 96.543],
  [6.000, 95.856],
];

// ESC LTV Buckets: <=50, 50.01-55, 55.01-60, 60.01-65, 65.01-70, 70.01-75, 75.01-80
const ESC_LTV_BUCKETS = [0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80];

// FICO LLPA — Acquisition & Rate-Term
const ESC_FICO_LLPA_PURCHASE: LLPAGrid = [
  { minFico: 780, adj: [0.875, 0.625, 0.500, 0.375, -0.125, -0.625, -2.125] },
  { minFico: 760, adj: [0.875, 0.625, 0.375, 0.000, -0.375, -0.875, -2.375] },
  { minFico: 740, adj: [0.750, 0.500, 0.250, -0.125, -0.500, -1.000, -2.500] },
  { minFico: 720, adj: [0.625, 0.375, 0.125, -0.250, -0.750, -1.125, -2.750] },
  { minFico: 700, adj: [0.500, 0.125, -0.125, -0.625, -1.250, -2.500, null] },
  { minFico: 680, adj: [0.125, -0.250, -0.750, -2.000, -3.125, -3.500, null] },
  { minFico: 660, adj: [-0.875, -1.250, -1.750, -3.000, -4.125, null, null] },
];

// FICO LLPA — Cash-Out
const ESC_FICO_LLPA_CASHOUT: LLPAGrid = [
  { minFico: 780, adj: [0.750, 0.375, 0.125, -0.250, -1.125, -2.000, null] },
  { minFico: 760, adj: [0.750, 0.375, 0.000, -0.625, -1.375, -2.250, null] },
  { minFico: 740, adj: [0.625, 0.250, -0.125, -0.750, -1.500, -2.375, null] },
  { minFico: 720, adj: [0.500, 0.125, -0.250, -0.875, -1.750, -2.500, null] },
  { minFico: 700, adj: [0.375, -0.125, -0.500, -1.250, -2.250, -3.875, null] },
  { minFico: 680, adj: [0.000, -0.500, -1.125, -2.625, -4.125, -4.875, null] },
  { minFico: 660, adj: [-1.000, -1.500, -2.125, -3.625, -5.125, null, null] },
];

// DSCR LLPA — same for purchase and cashout
const ESC_DSCR_LLPA: { min: number; max: number; adj: number[] }[] = [
  { min: 0, max: 0.749, adj: [-0.875, -1.125, -1.250, -1.750, -2.000, null!, null!] },
  { min: 0.75, max: 0.999, adj: [-0.250, -0.375, -0.500, -0.750, -0.875, -1.000, null!] },
  { min: 1.00, max: 1.149, adj: [0, 0, 0, 0, 0, 0, 0] },
  { min: 1.15, max: 1.249, adj: [0, 0, 0, 0, 0, 0, 0] },
  { min: 1.25, max: 99, adj: [0.250, 0.250, 0.250, 0.375, 0.375, 0.375, 0.375] },
];

// Loan Balance LLPA
const ESC_LOAN_BALANCE_LLPA: { min: number; max: number; adj: number[] }[] = [
  { min: 75000, max: 100000, adj: [null!, null!, null!, null!, null!, null!, null!] },
  { min: 100001, max: 125000, adj: [null!, null!, null!, null!, null!, null!, null!] },
  { min: 125001, max: 150000, adj: [-1, -1, -1, -1, -1, -1.375, -1.500] },
  { min: 150001, max: 250000, adj: [-0.750, -0.750, -0.750, -0.750, -0.750, -1.125, -1.250] },
  { min: 250001, max: 400000, adj: [0, 0, 0, 0, 0, 0, 0] },
  { min: 400001, max: 500000, adj: [0, 0, 0, 0, 0, 0, 0] },
  { min: 500001, max: 750000, adj: [0, 0, 0, 0, 0, 0, 0] },
  { min: 750001, max: 1000000, adj: [0.500, 0.500, 0.500, 0.500, 0.500, 0.500, 0.500] },
  { min: 1000001, max: 1500000, adj: [0.500, 0.500, 0.500, 0.500, 0.500, 0.500, null!] },
  { min: 1500001, max: 2000000, adj: [0.500, 0.500, 0.500, 0.500, 0.500, 0.500, null!] },
  { min: 2000001, max: 2500000, adj: [-0.750, -0.750, -0.750, -0.750, -0.750, -0.750, null!] },
  { min: 2500001, max: 3000000, adj: [-0.750, -0.750, -0.750, -0.750, -0.750, -0.750, null!] },
];

// Property Type LLPA
function getESCPropertyTypeAdj(propertyType: string, ltvIdx: number): number | null {
  const grid: Record<string, (number | null)[]> = {
    sfr:       [0, 0, 0, 0, 0, 0, 0],
    condo:     [-0.125, -0.125, -0.375, -0.500, -0.625, -0.750, null],
    nw_condo:  [-0.375, -0.375, -0.500, -0.500, -0.625, -0.750, null],
    '2_4_unit': [-0.250, -0.250, -0.500, -0.500, -0.500, -0.750, -1.000],
  };
  const row = grid[propertyType] || grid['sfr'];
  return row[Math.min(ltvIdx, row.length - 1)] ?? null;
}

// Loan Structure LLPA
function getESCStructureAdj(structure: string): number {
  if (structure === '5_6_arm') return 0.200;
  return 0; // 30yr fixed = 0
}

// Amortization / IO LLPA
function getESCAmortAdj(interestOnly: boolean, ltvIdx: number): number | null {
  if (!interestOnly) return 0;
  const ioAdj = [-0.125, -0.125, -0.250, -0.250, -0.500, -0.625, null];
  return ioAdj[Math.min(ltvIdx, ioAdj.length - 1)] ?? null;
}

// Prepayment LLPA (ESC has premium-based prepay adjustments)
function getESCPrepayAdj(years: number): number {
  const adj: Record<number, number> = {
    5: 1.375,
    4: 0.875,
    3: 0.500,
    2: -0.125,
    1: -0.625,
    0: -1.125,
  };
  return adj[years] ?? 0;
}

// Rent Qualification LLPA
function getESCRentQualAdj(isSTR: boolean): number {
  if (!isSTR) return 0.750; // LTR: In-Place/Market Rent bonus
  return 0; // STR: TTM Actuals = 0
}

// Other Adjustments
function getESCOtherAdj(input: DSCRPricingInput): number {
  let adj = 0;
  if (input.isRural) adj += 0; // Rural is 0 adj but restricted LTV
  if (input.purpose === 'purchase') adj += 0.250; // Purchase premium
  return adj;
}

// Florida LLPA (additive for FL condos)
function getESCFloridaAdj(state: string, propertyType: string, ltvIdx: number): number {
  if (state?.toUpperCase() !== 'FL') return 0;
  if (propertyType !== 'condo' && propertyType !== 'nw_condo') {
    // Non-condo FL property
    const flAdj = [0, 0, 0, -0.125, -0.250, -0.375, -0.500];
    return flAdj[Math.min(ltvIdx, flAdj.length - 1)] || 0;
  }
  // FL Condo additional LLPA
  const flCondoAdj = [0, -0.250, -0.375, -0.625, -0.750, -0.875, null!];
  return flCondoAdj[Math.min(ltvIdx, flCondoAdj.length - 1)] ?? -999;
}

// ESC Ineligible states
const ESC_INELIGIBLE_STATES = ['ND', 'SD'];
const ESC_ENTITY_ONLY_STATES = ['GA', 'FL', 'IA', 'MT', 'RI', 'VA'];

// ── Fee Schedules ───────────────────────────────────────────────────────────

// AHL-001 fees
const AHL_FEES = [
  { name: 'Underwriting Fee', amount: 1699 },
  { name: 'Processing Fee', amount: 695 },
  { name: 'Desk Review Fee', amount: 125 },
];
const AHL_ENTITY_FEE = { name: 'Entity Review Fee', amount: 450 };

// ESC-001 fees (estimated from fee sheet)
const ESC_FEES = [
  { name: 'Underwriting Fee', amount: 2190 },
  { name: 'Appraisal Fee', amount: 650 },
  { name: 'Title Fee (estimated)', amount: 2000 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLTVBucketIndex(ltv: number): number {
  for (let i = 0; i < LTV_BUCKETS.length; i++) {
    if (ltv <= LTV_BUCKETS[i]) return i;
  }
  return LTV_BUCKETS.length - 1;
}

function getESCLTVBucketIndex(ltv: number): number {
  for (let i = 0; i < ESC_LTV_BUCKETS.length; i++) {
    if (ltv <= ESC_LTV_BUCKETS[i]) return i;
  }
  return ESC_LTV_BUCKETS.length - 1;
}

function getLLPAValue(grid: LLPAGrid, fico: number, ltv: number): number | null {
  const bucketIdx = getLTVBucketIndex(ltv);
  for (const row of grid) {
    if (fico >= row.minFico) {
      const adj = row.adj[bucketIdx];
      return adj;
    }
  }
  return null;
}

function getESCLLPAValue(grid: LLPAGrid, fico: number, ltv: number): number | null {
  const bucketIdx = getESCLTVBucketIndex(ltv);
  for (const row of grid) {
    if (fico >= row.minFico) {
      const adj = row.adj[bucketIdx];
      return adj;
    }
  }
  return null;
}

function getExperienceBand(exp: number): string {
  if (exp >= 10) return '10+';
  if (exp >= 6) return '6-9';
  if (exp >= 3) return '3-5';
  if (exp >= 1) return '1-2';
  return '0';
}

// ── DSCR Pricing ─────────────────────────────────────────────────────────────

export function priceDSCR(input: DSCRPricingInput): PricingResult | null {
  // Determine max LTV by purpose
  const maxLTV: Record<string, number> = { purchase: 0.80, rate_term: 0.80, cashout: 0.75 };
  const maxAllowed = maxLTV[input.purpose] || 0.80;

  if (input.ltv > maxAllowed) {
    return null; // Over max LTV
  }

  if (input.fico < 660) {
    return null; // Below minimum FICO
  }

  // Pick LLPA grid by purpose
  const grid = input.purpose === 'purchase' ? PURCHASE_LLPA
    : input.purpose === 'rate_term' ? RATE_TERM_LLPA
    : CASHOUT_LLPA;

  const llpa = getLLPAValue(grid, input.fico, input.ltv);
  if (llpa === null) return null; // Not eligible

  // Get stacking adjustments
  const stackAdj = getDSCRStackingAdj(input);
  const totalAdj = llpa + stackAdj;

  // Find the best rate where (base_price + totalAdj) >= 100 (par)
  // A price >= 100 means borrower gets a lender credit or pays par
  // We want to find the lowest rate where total price is reasonable
  let bestRate: number | null = null;
  let bestPrice = 0;
  let bestPoints = 0;

  for (const [rate, basePrice] of DSCR_BASE_RATES) {
    const netPrice = basePrice + totalAdj;

    // We want the lowest rate where net price is at or near par (100)
    // If net price > 100, there's a lender credit (good for borrower)
    // If net price < 100, borrower pays points
    if (netPrice >= 99.5) {
      // Near-par or better — this is the best rate
      bestRate = rate;
      bestPrice = netPrice;
      bestPoints = netPrice >= 100 ? 0 : Math.round((100 - netPrice) * 100) / 100;
      break;
    }
  }

  if (!bestRate) {
    // If no par rate found, use the lowest available rate
    const [lowestRate, lowestPrice] = DSCR_BASE_RATES[0];
    bestRate = lowestRate;
    bestPrice = lowestPrice + totalAdj;
    bestPoints = Math.max(0, Math.round((100 - bestPrice) * 100) / 100);
  }

  const fees = [...AHL_FEES, AHL_ENTITY_FEE];

  const prepayDesc: Record<number, string> = {
    5: '5-Year (5/4/3/3/3% declining)',
    4: '4-Year (5/4/3/3% declining)',
    3: '3-Year (5/4/3% declining)',
    2: '2-Year (5/4% declining)',
    1: '1-Year (5% flat)',
    0: 'No prepayment penalty',
  };

  const notes: string[] = [];
  if (input.isSTR) notes.push('STR pricing adjustment applied');
  if (input.interestOnly) notes.push('Interest-only option selected');
  if (input.bankStatements) notes.push('Bank statement documentation');
  if (input.dscr && input.dscr < 1.0) notes.push('Sub-1.0 DSCR — limited program availability');
  if (bestPoints > 1.5) notes.push('Consider higher rate for lower closing costs');

  return {
    estimatedRate: bestRate,
    points: bestPoints,
    exitFee: 0,
    maxLTV: maxAllowed,
    maxLTC: 0,
    fees,
    prepayPenalty: prepayDesc[input.prepayYears] || 'None',
    notes,
    program: input.purpose === 'purchase' ? 'DSCR 30-Year Fixed — Purchase'
      : input.purpose === 'rate_term' ? 'DSCR 30-Year Fixed — Rate & Term'
      : 'DSCR 30-Year Fixed — Cash-Out Refinance',
  };
}

// ── RTL (Fix & Flip) Pricing ─────────────────────────────────────────────────

export function priceRTL(input: RTLPricingInput): PricingResult | null {
  if (input.fico < 660) return null;

  if (input.loanType === 'fix_flip') {
    const arltv = input.loanAmount / input.arv;
    const maxArltv = input.isJudicialState ? 0.65 : 0.70; // Conservative for 0 exp

    // Find best matching row
    const eligible = RTL_FIX_FLIP.filter(row => {
      if (input.experience < row.minExperience || input.experience > row.maxExperience) return false;
      if (input.fico < row.minFico) return false;
      if (input.ltc > row.ltc) return false;
      const maxAR = input.isJudicialState ? row.arltvJD : row.arltvNJD;
      if (arltv > maxAR) return false;
      return true;
    });

    if (eligible.length === 0) return null;

    // Pick the one with best (lowest) rate
    const best = eligible.reduce((a, b) => a.rate < b.rate ? a : b);

    return {
      estimatedRate: best.rate,
      points: best.points,
      exitFee: best.exitFee,
      maxLTV: 0,
      maxLTC: best.ltc,
      fees: [...AHL_FEES],
      prepayPenalty: 'None — bridge loans have no prepayment penalty',
      notes: [
        `Experience band: ${getExperienceBand(input.experience)} projects`,
        `Max LTC: ${(best.ltc * 100).toFixed(0)}%`,
        `Max ARLTV: ${((input.isJudicialState ? best.arltvJD : best.arltvNJD) * 100).toFixed(0)}%`,
        `12-month interest-only term`,
      ],
      program: '12-Month Fix & Flip Bridge — Interest Only',
    };
  }

  if (input.loanType.startsWith('bridge_')) {
    const purpose = input.loanType.replace('bridge_', '');
    const ltv = input.loanAmount / input.arv;
    const eligible = RTL_BRIDGE.filter(row => {
      if (row.purpose !== purpose) return false;
      if (input.fico < row.minFico) return false;
      const maxLtv = input.isJudicialState ? row.ltvJD : row.ltvNJD;
      if (ltv > maxLtv) return false;
      return true;
    });

    if (eligible.length === 0) return null;
    const best = eligible.reduce((a, b) => a.rate < b.rate ? a : b);

    return {
      estimatedRate: best.rate,
      points: 1.0,
      exitFee: 1.0,
      maxLTV: input.isJudicialState ? best.ltvJD : best.ltvNJD,
      maxLTC: 0,
      fees: [...AHL_FEES],
      prepayPenalty: 'None',
      notes: [`Bridge ${purpose.replace('_', ' ')} loan`, '12-month term'],
      program: `Bridge Loan — ${purpose === 'purchase' ? 'Purchase' : purpose === 'rate_term' ? 'Rate & Term' : 'Cash-Out'}`,
    };
  }

  return null;
}

// ── ESC-001 DSCR Pricing ────────────────────────────────────────────────────

export function priceESCDSCR(input: DSCRPricingInput): PricingResult | null {
  // Check state eligibility
  if (input.state && ESC_INELIGIBLE_STATES.includes(input.state.toUpperCase())) {
    return null;
  }

  // ESC max LTV: 80% purchase/R&T, 75% cashout (varies by loan size overlays)
  const maxLTV: Record<string, number> = { purchase: 0.80, rate_term: 0.80, cashout: 0.75 };
  const maxAllowed = maxLTV[input.purpose] || 0.80;

  if (input.ltv > maxAllowed) return null;
  if (input.fico < 660) return null;

  // ESC doesn't support condotels or 5-10 units in Signature Series
  if (input.propertyType === 'condotel' || input.propertyType === '5_10_unit') return null;

  const ltvIdx = getESCLTVBucketIndex(input.ltv);

  // 1. FICO LLPA
  const ficoGrid = input.purpose === 'cashout' ? ESC_FICO_LLPA_CASHOUT : ESC_FICO_LLPA_PURCHASE;
  const ficoAdj = getESCLLPAValue(ficoGrid, input.fico, input.ltv);
  if (ficoAdj === null) return null;

  // 2. DSCR LLPA
  let dscrAdj = 0;
  if (input.dscr !== undefined) {
    const dscrRow = ESC_DSCR_LLPA.find(r => input.dscr! >= r.min && input.dscr! <= r.max);
    if (dscrRow) {
      const val = dscrRow.adj[Math.min(ltvIdx, dscrRow.adj.length - 1)];
      if (val === null || val === undefined) return null; // N/A combo
      dscrAdj = val;
    }
  }

  // 3. Loan Balance LLPA
  let balanceAdj = 0;
  const balRow = ESC_LOAN_BALANCE_LLPA.find(r => input.loanAmount >= r.min && input.loanAmount <= r.max);
  if (balRow) {
    const val = balRow.adj[Math.min(ltvIdx, balRow.adj.length - 1)];
    if (val === null || val === undefined) return null;
    balanceAdj = val;
  } else if (input.loanAmount < 75000) {
    return null; // Below minimum
  }

  // 4. Property Type LLPA
  const propAdj = getESCPropertyTypeAdj(input.propertyType, ltvIdx);
  if (propAdj === null) return null;

  // 5. Structure, IO, Prepay, Rent Qual, Other
  const structAdj = getESCStructureAdj(input.loanStructure || '30yr_fixed');
  const ioAdj = getESCAmortAdj(input.interestOnly, ltvIdx);
  if (ioAdj === null) return null;
  const prepayAdj = getESCPrepayAdj(input.prepayYears);
  const rentAdj = getESCRentQualAdj(input.isSTR);
  const otherAdj = getESCOtherAdj(input);
  const floridaAdj = getESCFloridaAdj(input.state || '', input.propertyType, ltvIdx);
  if (floridaAdj <= -999) return null;

  const totalAdj = ficoAdj + dscrAdj + balanceAdj + propAdj + structAdj + ioAdj + prepayAdj + rentAdj + otherAdj + floridaAdj;

  // Pick base rate table
  const baseRates = input.purpose === 'cashout' ? ESC_BASE_RATES_CASHOUT : ESC_BASE_RATES_PURCHASE;

  // Find lowest rate where premium + totalAdj >= 100 (par)
  let bestRate: number | null = null;
  let bestPrice = 0;
  let bestPoints = 0;

  for (const [rate, premium] of baseRates) {
    const netPrice = premium + totalAdj;
    if (netPrice >= 99.5) {
      bestRate = rate;
      bestPrice = netPrice;
      bestPoints = netPrice >= 100 ? 0 : Math.round((100 - netPrice) * 100) / 100;
      break;
    }
  }

  if (!bestRate) {
    const [lowestRate, lowestPremium] = baseRates[baseRates.length - 1];
    bestRate = lowestRate;
    bestPrice = lowestPremium + totalAdj;
    bestPoints = Math.max(0, Math.round((100 - bestPrice) * 100) / 100);
  }

  // Price floor/ceiling enforcement
  if (bestPrice < 96) bestPoints = Math.max(bestPoints, Math.round((100 - 96) * 100) / 100);

  const prepayDesc: Record<number, string> = {
    5: '5-Year (5/4/3/2/1% step-down)',
    4: '4-Year (4/3/2/1% step-down)',
    3: '3-Year (3/2/1% step-down)',
    2: '2-Year (2/1% step-down)',
    1: '1-Year (1% flat)',
    0: 'No prepayment penalty',
  };

  const notes: string[] = [];
  if (input.isSTR) notes.push('STR income qualification applied');
  if (input.interestOnly) notes.push('10-Year Partial Interest-Only');
  if (input.state && ESC_ENTITY_ONLY_STATES.includes(input.state.toUpperCase())) {
    notes.push('Entity-only vesting required in this state');
  }
  if (input.isRural) notes.push('Rural property — max LTV restrictions may apply');
  if (input.dscr && input.dscr < 0.75) notes.push('Sub-0.75 DSCR — limited availability');
  if (bestPoints > 1.5) notes.push('Consider higher rate to reduce closing costs');
  if (input.loanAmount >= 750001) notes.push('Jumbo loan — premium pricing tier');

  return {
    estimatedRate: bestRate,
    points: bestPoints,
    exitFee: 0,
    maxLTV: maxAllowed,
    maxLTC: 0,
    fees: [...ESC_FEES],
    prepayPenalty: prepayDesc[input.prepayYears] || 'None',
    notes,
    program: input.purpose === 'purchase' ? 'DSCR 30-Year Fixed — Purchase'
      : input.purpose === 'rate_term' ? 'DSCR 30-Year Fixed — Rate & Term'
      : 'DSCR 30-Year Fixed — Cash-Out Refinance',
    _lenderCode: 'ESC-001',
  };
}

// ── Multi-Lender Comparison Engine ──────────────────────────────────────────

/**
 * Prices a DSCR loan across ALL lenders and returns the best 1-2 options.
 * Lender codes are stripped before client-facing output.
 */
function priceDSCRAllLenders(input: DSCRPricingInput): PricingResult[] {
  const results: PricingResult[] = [];

  // AHL-001
  const ahlResult = priceDSCR(input);
  if (ahlResult) {
    ahlResult._lenderCode = 'AHL-001';
    results.push(ahlResult);
  }

  // ESC-001
  const escResult = priceESCDSCR(input);
  if (escResult) {
    results.push(escResult);
  }

  // Sort by estimated rate (lowest = best)
  results.sort((a, b) => {
    // Primary: lowest rate
    if (a.estimatedRate !== b.estimatedRate) return a.estimatedRate - b.estimatedRate;
    // Secondary: lowest points
    return a.points - b.points;
  });

  // Return best 1, or 2 if they're within 0.375% of each other
  if (results.length <= 1) return results;
  if (results.length >= 2) {
    const diff = results[1].estimatedRate - results[0].estimatedRate;
    if (diff <= 0.375) return results.slice(0, 2);
    return [results[0]];
  }

  return results;
}

/**
 * Strips internal lender code from results before sending to client.
 */
function stripLenderCodes(results: PricingResult[]): PricingResult[] {
  return results.map(r => {
    const { _lenderCode, ...clean } = r;
    return clean as PricingResult;
  });
}

// ── Main Pricing Entry Point ─────────────────────────────────────────────────

/**
 * Returns the best 1-2 pricing options across all lenders.
 * NEVER exposes lender names or codes to borrowers.
 */
export function priceLoan(lane: string, params: Record<string, any>): PricingResult[] {
  if (lane === 'dscr' || lane === 'str') {
    const input: DSCRPricingInput = {
      fico: Number(params.fico) || 720,
      ltv: Number(params.ltv) || 0.75,
      loanAmount: Number(params.loanAmount) || 300000,
      purpose: (params.purpose || 'purchase') as DSCRPricingInput['purpose'],
      propertyType: lane === 'str' ? 'sfr' : (params.propertyType || 'sfr'),
      interestOnly: Boolean(params.interestOnly),
      isSTR: lane === 'str' || Boolean(params.isSTR),
      dscr: Number(params.dscr) || undefined,
      prepayYears: (Number(params.prepayYears) || 3) as DSCRPricingInput['prepayYears'],
      bankStatements: Boolean(params.bankStatements),
      state: params.state || undefined,
      isRural: Boolean(params.isRural),
      loanStructure: params.loanStructure || '30yr_fixed',
    };

    const results = priceDSCRAllLenders(input);
    return stripLenderCodes(results);
  }

  if (lane === 'flip') {
    const rtlResult = priceRTL({
      fico: Number(params.fico) || 720,
      experience: Number(params.experience) || 0,
      ltc: Number(params.ltc) || 0.85,
      arv: Number(params.arv) || 0,
      loanAmount: Number(params.loanAmount) || 0,
      loanType: (params.loanType || 'fix_flip') as RTLPricingInput['loanType'],
      isJudicialState: Boolean(params.isJudicialState),
    });

    if (rtlResult) {
      rtlResult._lenderCode = 'AHL-001';
      return stripLenderCodes([rtlResult]);
    }
    return [];
  }

  return [];
}

/**
 * Internal-only: returns results WITH lender codes for 818 Capital back-office use.
 * NEVER call this from client-facing routes.
 */
export function priceLoanInternal(lane: string, params: Record<string, any>): PricingResult[] {
  if (lane === 'dscr' || lane === 'str') {
    const input: DSCRPricingInput = {
      fico: Number(params.fico) || 720,
      ltv: Number(params.ltv) || 0.75,
      loanAmount: Number(params.loanAmount) || 300000,
      purpose: (params.purpose || 'purchase') as DSCRPricingInput['purpose'],
      propertyType: lane === 'str' ? 'sfr' : (params.propertyType || 'sfr'),
      interestOnly: Boolean(params.interestOnly),
      isSTR: lane === 'str' || Boolean(params.isSTR),
      dscr: Number(params.dscr) || undefined,
      prepayYears: (Number(params.prepayYears) || 3) as DSCRPricingInput['prepayYears'],
      bankStatements: Boolean(params.bankStatements),
      state: params.state || undefined,
      isRural: Boolean(params.isRural),
      loanStructure: params.loanStructure || '30yr_fixed',
    };
    return priceDSCRAllLenders(input);
  }

  if (lane === 'flip') {
    const rtlResult = priceRTL({
      fico: Number(params.fico) || 720,
      experience: Number(params.experience) || 0,
      ltc: Number(params.ltc) || 0.85,
      arv: Number(params.arv) || 0,
      loanAmount: Number(params.loanAmount) || 0,
      loanType: (params.loanType || 'fix_flip') as RTLPricingInput['loanType'],
      isJudicialState: Boolean(params.isJudicialState),
    });
    if (rtlResult) {
      rtlResult._lenderCode = 'AHL-001';
      return [rtlResult];
    }
    return [];
  }

  return [];
}
