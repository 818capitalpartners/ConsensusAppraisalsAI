import type {
  ApproachResult,
  MarketContext,
  PropertyDetails,
  ProductLane,
  ReconciledValuation,
  ValueRange,
  RehabEstimate,
} from './valuationTypes';
import type { AdjustedComp } from './compSelection';

/**
 * Valuation Approaches — three deterministic methods, then a reconciliation step.
 *
 * 1. Sales comparison: weighted average of adjusted comp values
 * 2. Market band: use the price (or PPSF × subject sqft) band for the submarket
 * 3. Income: NOI / cap rate, when income lane and inputs are available
 *
 * Each approach returns its own range, confidence, and reasoning. Reconciliation
 * blends them by their respective confidences. The whole pipeline is auditable —
 * unlike a single AI black-box call, every dollar can be traced to an input.
 */

// ─── Helpers ─────────────────────────────────────────────

function buildRange(low: number, mid: number, high: number): ValueRange {
  return {
    low: Math.round(low),
    mid: Math.round(mid),
    high: Math.round(high),
  };
}

function emptyApproach(kind: ApproachResult['kind'], label: string, reason: string): ApproachResult {
  return {
    kind,
    label,
    range: { low: null, mid: null, high: null },
    confidence: 0,
    weight: 0,
    inputs: {},
    reasoning: reason,
    available: false,
  };
}

// ─── 1. Sales comparison ─────────────────────────────────

export function salesComparisonApproach(comps: AdjustedComp[]): ApproachResult {
  if (comps.length === 0) {
    return emptyApproach('sales_comparison', 'Sales comparison', 'No comparable sales available.');
  }
  const usable = comps.filter((c) => c.weight > 0 && c.adjustedValue > 0);
  if (usable.length === 0) {
    return emptyApproach('sales_comparison', 'Sales comparison', 'No comps had positive similarity.');
  }

  const totalWeight = usable.reduce((s, c) => s + c.weight, 0);
  const weightedMid = usable.reduce((s, c) => s + c.adjustedValue * c.weight, 0) / totalWeight;

  // Range = ±1 stddev (population) of weighted adjusted values, floored at ±5%
  const variance = usable.reduce(
    (s, c) => s + c.weight * Math.pow(c.adjustedValue - weightedMid, 2),
    0,
  ) / totalWeight;
  const std = Math.sqrt(variance);
  const halfWidth = Math.max(weightedMid * 0.05, std);

  // Confidence: top comp similarity × min(N/5, 1) — caps at 5+ comps used
  const topSim = usable[0].similarityScore; // already sorted desc
  const countFactor = Math.min(usable.length / 5, 1);
  const confidence = Math.round(Math.min(95, topSim * 0.85 + countFactor * 10));

  return {
    kind: 'sales_comparison',
    label: 'Sales comparison',
    range: buildRange(weightedMid - halfWidth, weightedMid, weightedMid + halfWidth),
    confidence,
    weight: confidence / 100,
    inputs: {
      compsUsed: usable.length,
      topSimilarityScore: topSim,
      weightedMid: Math.round(weightedMid),
      stdDev: Math.round(std),
    },
    reasoning: `Weighted average of ${usable.length} adjusted comp values; top comp similarity ${topSim}/100.`,
    available: true,
  };
}

// ─── 2. Market band ──────────────────────────────────────

export function marketBandApproach(
  market: MarketContext,
  subject: PropertyDetails,
): ApproachResult {
  const priceBand = market.marketBands.find((b) => b.bandType === 'price');
  const ppsfBand = market.marketBands.find((b) => b.bandType === 'price_per_sqft');

  // Prefer price-per-sqft × subject sqft when sqft is known; else use price band directly.
  if (ppsfBand && subject.squareFeet && subject.squareFeet > 0) {
    const sqft = subject.squareFeet;
    const range = buildRange(
      ppsfBand.lowValue * sqft,
      ppsfBand.midValue * sqft,
      ppsfBand.highValue * sqft,
    );
    const confByLevel = ppsfBand.confidenceLevel === 'high' ? 75 : ppsfBand.confidenceLevel === 'moderate' ? 60 : 40;
    return {
      kind: 'market_band',
      label: 'Market band ($/sqft × subject sqft)',
      range,
      confidence: confByLevel,
      weight: confByLevel / 100,
      inputs: {
        midPpsf: ppsfBand.midValue,
        subjectSqft: sqft,
        sampleSize: ppsfBand.sampleSize,
      },
      reasoning: `Submarket median $/sqft of $${ppsfBand.midValue.toFixed(0)} applied to ${sqft.toLocaleString()} sqft subject.`,
      available: true,
    };
  }

  if (priceBand) {
    const confByLevel = priceBand.confidenceLevel === 'high' ? 65 : priceBand.confidenceLevel === 'moderate' ? 50 : 30;
    return {
      kind: 'market_band',
      label: 'Market band (submarket price range)',
      range: buildRange(priceBand.lowValue, priceBand.midValue, priceBand.highValue),
      confidence: confByLevel,
      weight: confByLevel / 100,
      inputs: {
        midPrice: priceBand.midValue,
        sampleSize: priceBand.sampleSize,
      },
      reasoning: `Submarket price band — sample size ${priceBand.sampleSize ?? 'unknown'}.`,
      available: true,
    };
  }

  return emptyApproach('market_band', 'Market band', 'No price or PPSF band available for this submarket.');
}

// ─── 3. Income approach ──────────────────────────────────

interface IncomeInputs {
  monthlyRent?: number; // observed or assumed
  vacancyPct?: number;  // 0-1
  expenseRatio?: number; // 0-1 of EGI
}

export function incomeApproach(
  lane: ProductLane,
  market: MarketContext,
  subject: PropertyDetails,
  income: IncomeInputs,
): ApproachResult {
  const isIncomeLane = lane === 'dscr' || lane === 'str' || lane === 'multifamily';
  if (!isIncomeLane) {
    return emptyApproach('income', 'Income approach', 'Not an income-producing lane.');
  }

  const monthlyRent = income.monthlyRent ?? market.medianRent ?? null;
  if (!monthlyRent || monthlyRent <= 0) {
    return emptyApproach('income', 'Income approach', 'No rent input or market rent available.');
  }

  const capBand = market.marketBands.find((b) => b.bandType === 'cap_rate');
  if (!capBand) {
    return emptyApproach('income', 'Income approach', 'No cap-rate band available for this submarket.');
  }

  const vacancy = income.vacancyPct ?? (lane === 'str' ? 0.30 : 0.06);
  const expenseRatio = income.expenseRatio ?? (lane === 'str' ? 0.45 : 0.35);

  const annualGross = monthlyRent * 12;
  const egi = annualGross * (1 - vacancy);
  const noi = egi * (1 - expenseRatio);

  // Cap rates in our DB are stored as percentages (e.g., 4.65 for 4.65%).
  // Coerce to decimal for division.
  const capLow = capBand.lowValue / 100;
  const capMid = capBand.midValue / 100;
  const capHigh = capBand.highValue / 100;

  // Inverse: lower cap rate → higher value, so swap.
  const range = buildRange(noi / capHigh, noi / capMid, noi / capLow);

  const confByLevel = capBand.confidenceLevel === 'high' ? 70 : capBand.confidenceLevel === 'moderate' ? 55 : 35;

  return {
    kind: 'income',
    label: 'Income approach (NOI / cap)',
    range,
    confidence: confByLevel,
    weight: confByLevel / 100,
    inputs: {
      monthlyRent,
      vacancyPct: vacancy,
      expenseRatio,
      noi: Math.round(noi),
      capRateMidPct: capBand.midValue,
    },
    reasoning: `Capitalized $${Math.round(noi).toLocaleString()} NOI at submarket cap-rate band (${capBand.lowValue.toFixed(2)}–${capBand.highValue.toFixed(2)}%).`,
    available: true,
  };
}

// ─── Reconciliation ──────────────────────────────────────

export function reconcile(
  approaches: ApproachResult[],
  rehab: RehabEstimate | null,
  lane: ProductLane,
): ReconciledValuation {
  const usable = approaches.filter((a) => a.available && a.range.mid != null);

  if (usable.length === 0) {
    return {
      asIs: { low: null, mid: null, high: null },
      stabilized: null,
      confidenceScore: 0,
      approaches,
      methodology: ['No valuation approaches produced a value — insufficient market data.'],
    };
  }

  const totalWeight = usable.reduce((s, a) => s + a.weight, 0);
  const mid = usable.reduce((s, a) => s + (a.range.mid ?? 0) * a.weight, 0) / totalWeight;

  // For low/high, take the weighted average of each (each approach already
  // produced a low/high). This naturally widens the range when approaches
  // disagree.
  const low = usable.reduce((s, a) => s + (a.range.low ?? a.range.mid ?? 0) * a.weight, 0) / totalWeight;
  const high = usable.reduce((s, a) => s + (a.range.high ?? a.range.mid ?? 0) * a.weight, 0) / totalWeight;

  // Confidence: weighted avg of each approach's confidence, with a small
  // bonus when ≥2 approaches agree (mids within 10% of each other).
  let confidenceScore = usable.reduce((s, a) => s + a.confidence * a.weight, 0) / totalWeight;
  if (usable.length >= 2) {
    const mids = usable.map((a) => a.range.mid ?? 0);
    const min = Math.min(...mids);
    const max = Math.max(...mids);
    const spread = max > 0 ? (max - min) / max : 1;
    if (spread < 0.10) confidenceScore = Math.min(95, confidenceScore + 5);
    if (spread > 0.25) confidenceScore = Math.max(10, confidenceScore - 5);
  }

  // Stabilized (ARV) — only meaningful for flip lane and only when we have a rehab
  // estimate. As-is + rehab cost ≈ stabilized minimum-investment basis; for ARV
  // proper we let the sales-comparison approach define the upside (it's already
  // adjusted for condition assumed-as-moderate; flippers target turnkey).
  let stabilized: ValueRange | null = null;
  if (lane === 'flip' && rehab) {
    // Bricked-style: ARV = as-is + rehab + uplift, where uplift comes from
    // comp adjustment for condition delta (turnkey vs moderate ≈ +5%).
    const upliftPct = 0.05;
    const stabMid = mid + rehab.totalMid + mid * upliftPct;
    const stabLow = low + rehab.totalLow;
    const stabHigh = high + rehab.totalHigh + high * upliftPct;
    stabilized = buildRange(stabLow, stabMid, stabHigh);
  }

  const methodology = [
    `Reconciled ${usable.length} of ${approaches.length} approach(es) by confidence-weighted average.`,
    ...usable.map((a) => `${a.label}: ${a.reasoning}`),
  ];

  return {
    asIs: buildRange(low, mid, high),
    stabilized,
    confidenceScore: Math.round(confidenceScore),
    approaches,
    methodology,
  };
}
