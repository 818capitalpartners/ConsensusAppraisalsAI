import type {
  ComparableSaleData,
  PropertyDetails,
  RehabConditionGrade,
} from './valuationTypes';

/**
 * Comp Selection — appraiser-style similarity scoring + adjustments.
 *
 * Takes a subject property and candidate comparable sales, returns ranked
 * comps with explicit per-comp adjustments and an adjusted value. This is
 * what a credible AVM does in code (and what Bricked does behind a black box).
 * The output is fully auditable: every dollar of adjustment is annotated.
 */

// ─── Tunable constants ───────────────────────────────────

// Per-line adjustment magnitudes. Conservative; v1 — replace with calibrated
// values from realized-outcome dataset once we have one.
const ADJ = {
  // Size adjustment is half of the comp's $/sqft difference, per standard
  // appraisal practice (the comp's price already reflects its size).
  sizeFactor: 0.5,
  // Age: average ~$400/year of age delta for typical condo / SFR markets.
  pricePerYearOfAge: 400,
  // Beds / baths: discrete adjustments. Half-bath worth ~half a full bath.
  pricePerBed: 8000,
  pricePerBath: 12000,
  // Condition: each tier (turnkey → cosmetic → moderate → heavy → gut)
  // is worth ~5% of comp price.
  conditionTierPctOfCompPrice: 0.05,
};

const CONDITION_RANK: Record<RehabConditionGrade, number> = {
  turnkey: 0,
  cosmetic: 1,
  moderate: 2,
  heavy: 3,
  gut: 4,
};

const TODAY = () => new Date();

// ─── Types ───────────────────────────────────────────────

export interface CompAdjustment extends Record<string, number> {
  size: number;
  age: number;
  beds: number;
  baths: number;
  condition: number;
}

export interface AdjustedComp extends Omit<ComparableSaleData, 'adjustments' | 'similarityScore' | 'adjustedValue'> {
  adjustments: CompAdjustment;
  adjustmentTotal: number;
  adjustedValue: number;
  recencyMonths: number;
  locationMatch: 'zip' | 'city' | 'county';
  similarityScore: number; // 0-100
  weight: number; // 0-1 — for weighted averaging
  reasoning: string[];
}

export interface CompSelectionInput {
  subject: PropertyDetails;
  candidates: ComparableSaleData[];
  topN?: number; // default 8
}

// ─── Helpers ─────────────────────────────────────────────

function monthsBetween(a: Date, b: Date): number {
  const ms = Math.abs(a.getTime() - b.getTime());
  return ms / (1000 * 60 * 60 * 24 * 30.4375);
}

function locationMatch(subject: PropertyDetails, comp: ComparableSaleData): 'zip' | 'city' | 'county' {
  if (subject.zip && comp.zip && subject.zip === comp.zip) return 'zip';
  if (
    subject.city && comp.city &&
    subject.city.trim().toLowerCase() === comp.city.trim().toLowerCase()
  ) return 'city';
  return 'county';
}

function locationWeight(match: 'zip' | 'city' | 'county'): number {
  switch (match) {
    case 'zip': return 1.0;
    case 'city': return 0.7;
    case 'county': return 0.4;
  }
}

function recencyWeight(months: number): number {
  if (months <= 3) return 1.0;
  if (months <= 6) return 0.85;
  if (months <= 12) return 0.65;
  if (months <= 24) return 0.40;
  return 0.20;
}

function round(n: number): number {
  return Math.round(n);
}

// ─── Per-comp adjustments ────────────────────────────────

function computeSizeAdjustment(
  subject: PropertyDetails,
  comp: ComparableSaleData,
): { value: number; reason: string | null } {
  if (!subject.squareFeet || !comp.squareFeet || comp.squareFeet <= 0) {
    return { value: 0, reason: null };
  }
  const compPpsf = comp.pricePerSqFt ?? comp.salePrice / comp.squareFeet;
  const sqftDelta = subject.squareFeet - comp.squareFeet;
  const value = round(sqftDelta * compPpsf * ADJ.sizeFactor);
  if (value === 0) return { value: 0, reason: null };
  const sign = value > 0 ? '+' : '';
  return {
    value,
    reason: `${sign}${formatMoney(value)} for ${Math.abs(sqftDelta)} sqft ${sqftDelta > 0 ? 'larger' : 'smaller'} subject`,
  };
}

function computeAgeAdjustment(
  subject: PropertyDetails,
  comp: ComparableSaleData,
): { value: number; reason: string | null } {
  // Comp's yearBuilt isn't on ComparableSaleData type — skip if not present.
  // (We pass the full DB row in; missing field falls back to 0.)
  const compYearBuilt = (comp as ComparableSaleData & { yearBuilt?: number | null }).yearBuilt;
  if (!subject.yearBuilt || !compYearBuilt) return { value: 0, reason: null };
  const yearsDelta = subject.yearBuilt - compYearBuilt;
  if (yearsDelta === 0) return { value: 0, reason: null };
  const value = round(yearsDelta * ADJ.pricePerYearOfAge);
  const sign = value > 0 ? '+' : '';
  return {
    value,
    reason: `${sign}${formatMoney(value)} for ${Math.abs(yearsDelta)}yr ${yearsDelta > 0 ? 'newer' : 'older'} subject`,
  };
}

function computeBedsAdjustment(
  subject: PropertyDetails,
  comp: ComparableSaleData,
): { value: number; reason: string | null } {
  const compBeds = (comp as ComparableSaleData & { bedrooms?: number | null }).bedrooms;
  if (subject.bedrooms == null || compBeds == null) return { value: 0, reason: null };
  const delta = subject.bedrooms - compBeds;
  if (delta === 0) return { value: 0, reason: null };
  const value = round(delta * ADJ.pricePerBed);
  const sign = value > 0 ? '+' : '';
  return {
    value,
    reason: `${sign}${formatMoney(value)} for ${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'bed' : 'beds'} ${delta > 0 ? 'more' : 'fewer'}`,
  };
}

function computeBathsAdjustment(
  subject: PropertyDetails,
  comp: ComparableSaleData,
): { value: number; reason: string | null } {
  const compBaths = (comp as ComparableSaleData & { bathrooms?: number | null }).bathrooms;
  if (subject.bathrooms == null || compBaths == null) return { value: 0, reason: null };
  const delta = subject.bathrooms - compBaths;
  if (delta === 0) return { value: 0, reason: null };
  const value = round(delta * ADJ.pricePerBath);
  const sign = value > 0 ? '+' : '';
  return {
    value,
    reason: `${sign}${formatMoney(value)} for ${Math.abs(delta).toFixed(1)} ${Math.abs(delta) === 1 ? 'bath' : 'baths'} ${delta > 0 ? 'more' : 'fewer'}`,
  };
}

function computeConditionAdjustment(
  subject: PropertyDetails,
  comp: ComparableSaleData,
): { value: number; reason: string | null } {
  const subjectCondition = subject.condition as RehabConditionGrade | null;
  if (!subjectCondition || !(subjectCondition in CONDITION_RANK)) return { value: 0, reason: null };
  // Comp condition isn't typically known — assume "moderate" baseline for sold properties.
  // This is a conservative default: a comp that sold likely wasn't a gut.
  const compCondition: RehabConditionGrade = 'moderate';
  const tierDelta = CONDITION_RANK[compCondition] - CONDITION_RANK[subjectCondition];
  if (tierDelta === 0) return { value: 0, reason: null };
  const value = round(comp.salePrice * ADJ.conditionTierPctOfCompPrice * tierDelta);
  const sign = value > 0 ? '+' : '';
  // Positive tierDelta means subject is in worse condition (higher grade rank
  // for subject), so subject is worth less than comp → negative adjustment.
  // We've already encoded that sign via tierDelta direction.
  return {
    value,
    reason: `${sign}${formatMoney(value)} for ${subjectCondition} subject vs assumed ${compCondition} comp`,
  };
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ─── Main scoring ────────────────────────────────────────

export function selectComps(input: CompSelectionInput): AdjustedComp[] {
  const { subject, candidates, topN = 8 } = input;
  const today = TODAY();

  const adjusted: AdjustedComp[] = candidates.map((comp) => {
    const reasoning: string[] = [];

    const size = computeSizeAdjustment(subject, comp);
    if (size.reason) reasoning.push(size.reason);
    const age = computeAgeAdjustment(subject, comp);
    if (age.reason) reasoning.push(age.reason);
    const beds = computeBedsAdjustment(subject, comp);
    if (beds.reason) reasoning.push(beds.reason);
    const baths = computeBathsAdjustment(subject, comp);
    if (baths.reason) reasoning.push(baths.reason);
    const condition = computeConditionAdjustment(subject, comp);
    if (condition.reason) reasoning.push(condition.reason);

    const adjustments: CompAdjustment = {
      size: size.value,
      age: age.value,
      beds: beds.value,
      baths: baths.value,
      condition: condition.value,
    };
    const adjustmentTotal = size.value + age.value + beds.value + baths.value + condition.value;
    const adjustedValue = comp.salePrice + adjustmentTotal;

    const recencyMonths = monthsBetween(today, new Date(comp.saleDate));
    const locMatch = locationMatch(subject, comp);
    const recencyW = recencyWeight(recencyMonths);
    const locationW = locationWeight(locMatch);

    // Net adjustment % (gross adjustments / sale price) — appraisers prefer comps
    // with net <10%. We penalize as % grows.
    const netAdjPct = comp.salePrice > 0 ? Math.abs(adjustmentTotal) / comp.salePrice : 1;
    const adjPenalty = Math.min(1, netAdjPct / 0.25); // 25% net adj → 0 score floor

    // Similarity score: blend recency, location, and adjustment tightness.
    const similarityScore = round(
      100 *
      (0.40 * locationW + 0.35 * recencyW + 0.25 * (1 - adjPenalty)),
    );

    // Weight for averaging: square the score so high-similarity comps dominate.
    const weight = Math.pow(similarityScore / 100, 2);

    return {
      ...comp,
      adjustments,
      adjustmentTotal,
      adjustedValue,
      recencyMonths: Number(recencyMonths.toFixed(1)),
      locationMatch: locMatch,
      similarityScore,
      weight,
      reasoning,
    };
  });

  // Sort by similarity desc, take top N
  adjusted.sort((a, b) => b.similarityScore - a.similarityScore);
  return adjusted.slice(0, topN);
}
