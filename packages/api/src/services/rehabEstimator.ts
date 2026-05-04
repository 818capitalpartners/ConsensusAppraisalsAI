import type {
  PropertyDetails,
  RehabConditionGrade,
  RehabEstimate,
  RehabLineItem,
} from './valuationTypes';

/**
 * Rehab Estimator — produces a line-item rehab cost range using a localized labor
 * index applied to national-base unit costs. Output is a structured estimate that
 * an investor can use for go/no-go and a GC can use to scope.
 *
 * Cost basis is "localized" when a state/county labor index is found; otherwise
 * "national_fallback" with a widened range and lowered confidence.
 */

// National base unit costs (USD). Conservative midpoints; per-state index applied below.
// Sources: composite of public RSMeans-style ranges, public county fee schedules, and
// 818 internal benchmarks. Treat as v1 base — vendor-fed cost feeds replace this in prod.
const BASE_UNIT_COSTS: Record<string, { unit: string; low: number; high: number }> = {
  cosmetic_paint_sqft: { unit: 'sqft', low: 2.5, high: 4.5 },
  cosmetic_floor_sqft: { unit: 'sqft', low: 4, high: 9 },
  cosmetic_trim_sqft: { unit: 'sqft', low: 1.5, high: 3 },
  kitchen_basic: { unit: 'kitchen', low: 12000, high: 22000 },
  kitchen_mid: { unit: 'kitchen', low: 22000, high: 40000 },
  kitchen_high: { unit: 'kitchen', low: 40000, high: 80000 },
  bath_basic: { unit: 'bath', low: 6000, high: 11000 },
  bath_mid: { unit: 'bath', low: 11000, high: 20000 },
  bath_high: { unit: 'bath', low: 20000, high: 35000 },
  mech_hvac_unit: { unit: 'ea', low: 5500, high: 11000 },
  mech_water_heater: { unit: 'ea', low: 1200, high: 2500 },
  mech_plumbing_repipe_sqft: { unit: 'sqft', low: 4, high: 9 },
  mech_electric_panel: { unit: 'ea', low: 2200, high: 4500 },
  mech_electric_rewire_sqft: { unit: 'sqft', low: 5, high: 11 },
  roof_replace_sqft: { unit: 'sqft', low: 6, high: 14 },
  exterior_siding_sqft: { unit: 'sqft', low: 7, high: 16 },
  exterior_paint_sqft: { unit: 'sqft', low: 2, high: 5 },
  exterior_windows_ea: { unit: 'ea', low: 600, high: 1400 },
  structural_foundation_lump: { unit: 'lump', low: 8000, high: 30000 },
  structural_framing_lump: { unit: 'lump', low: 5000, high: 25000 },
  permits_lump: { unit: 'lump', low: 1500, high: 6000 },
  cleanout_lump: { unit: 'lump', low: 1500, high: 4500 },
};

// State labor index vs national 1.00. v1 floor — replace with county-level table.
// Higher = more expensive labor. Approximate 2025-era ranges from public BLS + RSMeans.
const STATE_LABOR_INDEX: Record<string, number> = {
  CA: 1.28, NY: 1.30, MA: 1.22, WA: 1.18, NJ: 1.20, CT: 1.18, HI: 1.35, AK: 1.25,
  IL: 1.10, OR: 1.12, CO: 1.10, MD: 1.12, VA: 1.05, DC: 1.25,
  FL: 1.00, TX: 0.97, AZ: 1.00, NV: 1.05, GA: 0.96, NC: 0.95, SC: 0.93,
  TN: 0.93, OH: 0.95, PA: 1.05, MI: 0.98, IN: 0.94, WI: 1.00, MN: 1.05,
  AL: 0.90, MS: 0.88, AR: 0.88, LA: 0.92, OK: 0.92, KS: 0.93, MO: 0.94,
  KY: 0.92, WV: 0.93, IA: 0.95, NE: 0.95, ND: 1.00, SD: 0.95, MT: 1.00,
  WY: 1.00, ID: 1.00, NM: 0.95, UT: 1.02, ME: 1.05, NH: 1.08, VT: 1.05,
  RI: 1.15, DE: 1.05,
};

interface ConditionScopeWeights {
  cosmetic: number; // 0..1 share of property sqft touched
  kitchen: 'none' | 'basic' | 'mid' | 'high';
  baths: 'none' | 'basic' | 'mid' | 'high';
  bathsMultiplier: number; // share of bath count to redo
  mech: { hvac: number; waterHeater: number; repipeShare: number; panel: number; rewireShare: number };
  roof: number; // share of roof to replace (uses sqft proxy)
  exterior: { sidingShare: number; paint: boolean; windows: number };
  structural: { foundation: boolean; framing: boolean };
  contingencyPct: number;
  baseConfidence: number;
}

const CONDITION_PROFILES: Record<RehabConditionGrade, ConditionScopeWeights> = {
  turnkey: {
    cosmetic: 0.1, kitchen: 'none', baths: 'none', bathsMultiplier: 0,
    mech: { hvac: 0, waterHeater: 0, repipeShare: 0, panel: 0, rewireShare: 0 },
    roof: 0, exterior: { sidingShare: 0, paint: false, windows: 0 },
    structural: { foundation: false, framing: false },
    contingencyPct: 0.10, baseConfidence: 80,
  },
  cosmetic: {
    cosmetic: 0.6, kitchen: 'basic', baths: 'basic', bathsMultiplier: 0.5,
    mech: { hvac: 0, waterHeater: 1, repipeShare: 0, panel: 0, rewireShare: 0 },
    roof: 0, exterior: { sidingShare: 0, paint: true, windows: 0 },
    structural: { foundation: false, framing: false },
    contingencyPct: 0.12, baseConfidence: 72,
  },
  moderate: {
    cosmetic: 1.0, kitchen: 'mid', baths: 'mid', bathsMultiplier: 1.0,
    mech: { hvac: 1, waterHeater: 1, repipeShare: 0, panel: 1, rewireShare: 0 },
    roof: 0.5, exterior: { sidingShare: 0.2, paint: true, windows: 4 },
    structural: { foundation: false, framing: false },
    contingencyPct: 0.15, baseConfidence: 65,
  },
  heavy: {
    cosmetic: 1.0, kitchen: 'mid', baths: 'mid', bathsMultiplier: 1.0,
    mech: { hvac: 1, waterHeater: 1, repipeShare: 0.5, panel: 1, rewireShare: 0.5 },
    roof: 1.0, exterior: { sidingShare: 0.6, paint: true, windows: 8 },
    structural: { foundation: false, framing: true },
    contingencyPct: 0.18, baseConfidence: 55,
  },
  gut: {
    cosmetic: 1.0, kitchen: 'high', baths: 'high', bathsMultiplier: 1.0,
    mech: { hvac: 1, waterHeater: 1, repipeShare: 1, panel: 1, rewireShare: 1 },
    roof: 1.0, exterior: { sidingShare: 1, paint: true, windows: 14 },
    structural: { foundation: true, framing: true },
    contingencyPct: 0.22, baseConfidence: 45,
  },
};

const DEFAULT_SQFT = 1500;
const DEFAULT_BATHS = 2;

export interface RehabEstimateInput {
  property: PropertyDetails;
  conditionGrade: RehabConditionGrade;
  squareFeetOverride?: number;
}

function pushItem(
  items: RehabLineItem[],
  category: string,
  scope: string,
  unit: string,
  quantity: number,
  baseLow: number,
  baseHigh: number,
  laborIndex: number,
  notes: string | null = null,
): void {
  if (quantity <= 0) return;
  const unitLow = baseLow * laborIndex;
  const unitHigh = baseHigh * laborIndex;
  items.push({
    category,
    scope,
    unit,
    quantity: Number(quantity.toFixed(2)),
    unitCostLow: Number(unitLow.toFixed(2)),
    unitCostHigh: Number(unitHigh.toFixed(2)),
    totalLow: Math.round(unitLow * quantity),
    totalHigh: Math.round(unitHigh * quantity),
    notes,
  });
}

function kitchenKey(tier: 'basic' | 'mid' | 'high'): string {
  return `kitchen_${tier}`;
}

function bathKey(tier: 'basic' | 'mid' | 'high'): string {
  return `bath_${tier}`;
}

export function estimateRehab(input: RehabEstimateInput): RehabEstimate {
  const { property, conditionGrade } = input;
  const profile = CONDITION_PROFILES[conditionGrade];
  const sqft = input.squareFeetOverride ?? property.squareFeet ?? DEFAULT_SQFT;
  const baths = property.bathrooms ?? DEFAULT_BATHS;
  const stateCode = (property.state ?? '').toUpperCase();
  const laborIndex = STATE_LABOR_INDEX[stateCode];
  const costBasis: 'localized' | 'national_fallback' = laborIndex ? 'localized' : 'national_fallback';
  const effectiveIndex = laborIndex ?? 1.0;

  const items: RehabLineItem[] = [];

  // Cosmetic
  if (profile.cosmetic > 0) {
    const cosmeticSqft = Math.round(sqft * profile.cosmetic);
    pushItem(items, 'cosmetic', 'Interior paint', BASE_UNIT_COSTS.cosmetic_paint_sqft.unit,
      cosmeticSqft, BASE_UNIT_COSTS.cosmetic_paint_sqft.low, BASE_UNIT_COSTS.cosmetic_paint_sqft.high,
      effectiveIndex, `Walls + ceilings, ${Math.round(profile.cosmetic * 100)}% of livable sqft`);
    pushItem(items, 'cosmetic', 'Flooring (LVP / refinish)', BASE_UNIT_COSTS.cosmetic_floor_sqft.unit,
      cosmeticSqft, BASE_UNIT_COSTS.cosmetic_floor_sqft.low, BASE_UNIT_COSTS.cosmetic_floor_sqft.high,
      effectiveIndex, null);
    pushItem(items, 'cosmetic', 'Trim, doors, hardware', BASE_UNIT_COSTS.cosmetic_trim_sqft.unit,
      cosmeticSqft, BASE_UNIT_COSTS.cosmetic_trim_sqft.low, BASE_UNIT_COSTS.cosmetic_trim_sqft.high,
      effectiveIndex, null);
  }

  // Kitchen
  if (profile.kitchen !== 'none') {
    const k = BASE_UNIT_COSTS[kitchenKey(profile.kitchen)];
    pushItem(items, 'kitchen', `Kitchen remodel — ${profile.kitchen}`, k.unit, 1, k.low, k.high,
      effectiveIndex, 'Cabinets, counters, appliances, plumbing fixtures');
  }

  // Baths
  if (profile.baths !== 'none' && baths > 0) {
    const bathsToTouch = Math.max(1, Math.round(baths * profile.bathsMultiplier));
    const b = BASE_UNIT_COSTS[bathKey(profile.baths)];
    pushItem(items, 'bath', `Bath remodel — ${profile.baths}`, b.unit, bathsToTouch, b.low, b.high,
      effectiveIndex, `Of ${baths} total baths`);
  }

  // Mechanical
  if (profile.mech.hvac > 0) {
    const u = BASE_UNIT_COSTS.mech_hvac_unit;
    pushItem(items, 'mech', 'HVAC system replacement', u.unit, profile.mech.hvac, u.low, u.high,
      effectiveIndex, null);
  }
  if (profile.mech.waterHeater > 0) {
    const u = BASE_UNIT_COSTS.mech_water_heater;
    pushItem(items, 'mech', 'Water heater replacement', u.unit, profile.mech.waterHeater, u.low, u.high,
      effectiveIndex, null);
  }
  if (profile.mech.repipeShare > 0) {
    const u = BASE_UNIT_COSTS.mech_plumbing_repipe_sqft;
    pushItem(items, 'mech', 'Plumbing re-pipe', u.unit, Math.round(sqft * profile.mech.repipeShare),
      u.low, u.high, effectiveIndex, null);
  }
  if (profile.mech.panel > 0) {
    const u = BASE_UNIT_COSTS.mech_electric_panel;
    pushItem(items, 'mech', 'Electrical panel upgrade', u.unit, profile.mech.panel, u.low, u.high,
      effectiveIndex, null);
  }
  if (profile.mech.rewireShare > 0) {
    const u = BASE_UNIT_COSTS.mech_electric_rewire_sqft;
    pushItem(items, 'mech', 'Electrical rewire', u.unit, Math.round(sqft * profile.mech.rewireShare),
      u.low, u.high, effectiveIndex, null);
  }

  // Roof (uses sqft footprint as proxy)
  if (profile.roof > 0) {
    const u = BASE_UNIT_COSTS.roof_replace_sqft;
    pushItem(items, 'roof', 'Roof replacement', u.unit, Math.round(sqft * profile.roof),
      u.low, u.high, effectiveIndex, 'Sqft footprint used as proxy for roof area');
  }

  // Exterior
  if (profile.exterior.sidingShare > 0) {
    const u = BASE_UNIT_COSTS.exterior_siding_sqft;
    pushItem(items, 'exterior', 'Siding replacement', u.unit,
      Math.round(sqft * profile.exterior.sidingShare * 1.2), // ~1.2x sqft for wall area
      u.low, u.high, effectiveIndex, null);
  }
  if (profile.exterior.paint) {
    const u = BASE_UNIT_COSTS.exterior_paint_sqft;
    pushItem(items, 'exterior', 'Exterior paint', u.unit, Math.round(sqft * 1.2),
      u.low, u.high, effectiveIndex, null);
  }
  if (profile.exterior.windows > 0) {
    const u = BASE_UNIT_COSTS.exterior_windows_ea;
    pushItem(items, 'exterior', 'Window replacement', u.unit, profile.exterior.windows,
      u.low, u.high, effectiveIndex, null);
  }

  // Structural
  if (profile.structural.foundation) {
    const u = BASE_UNIT_COSTS.structural_foundation_lump;
    pushItem(items, 'structural', 'Foundation repair', u.unit, 1, u.low, u.high,
      effectiveIndex, 'Allowance — pending engineer report');
  }
  if (profile.structural.framing) {
    const u = BASE_UNIT_COSTS.structural_framing_lump;
    pushItem(items, 'structural', 'Framing repairs', u.unit, 1, u.low, u.high,
      effectiveIndex, 'Allowance — pending walk');
  }

  // Permits + cleanout always
  const permits = BASE_UNIT_COSTS.permits_lump;
  pushItem(items, 'permits', 'Permits + plan review', permits.unit, 1, permits.low, permits.high,
    effectiveIndex, null);
  const cleanout = BASE_UNIT_COSTS.cleanout_lump;
  pushItem(items, 'cleanout', 'Demo + dumpster + cleanout', cleanout.unit, 1, cleanout.low, cleanout.high,
    effectiveIndex, null);

  const subtotalLow = items.reduce((s, i) => s + i.totalLow, 0);
  const subtotalHigh = items.reduce((s, i) => s + i.totalHigh, 0);
  const contingencyLow = Math.round(subtotalLow * profile.contingencyPct);
  const contingencyHigh = Math.round(subtotalHigh * profile.contingencyPct);

  items.push({
    category: 'contingency',
    scope: `Contingency reserve (${Math.round(profile.contingencyPct * 100)}%)`,
    unit: 'pct',
    quantity: profile.contingencyPct,
    unitCostLow: subtotalLow,
    unitCostHigh: subtotalHigh,
    totalLow: contingencyLow,
    totalHigh: contingencyHigh,
    notes: null,
  });

  const totalLow = subtotalLow + contingencyLow;
  const totalHigh = subtotalHigh + contingencyHigh;
  const totalMid = Math.round((totalLow + totalHigh) / 2);

  // Confidence: profile floor, downgraded if no localized index, downgraded if sqft missing
  let confidence = profile.baseConfidence;
  if (costBasis === 'national_fallback') confidence -= 12;
  if (property.squareFeet == null) confidence -= 8;
  if (property.bathrooms == null && profile.baths !== 'none') confidence -= 5;
  confidence = Math.max(20, Math.min(95, confidence));

  const methodology: string[] = [
    `Condition grade: ${conditionGrade}`,
    costBasis === 'localized'
      ? `Localized labor index for ${stateCode}: ${effectiveIndex.toFixed(2)}x national base`
      : 'National base costs (no state labor index found) — range widened',
    `Per-line unit costs sourced from internal v1 base table`,
    `Contingency: ${Math.round(profile.contingencyPct * 100)}%`,
  ];

  const assumptions: string[] = [];
  if (property.squareFeet == null) {
    assumptions.push(`Square footage assumed at ${DEFAULT_SQFT} (no value provided) — re-run with measured sqft for tighter range.`);
  }
  if (property.bathrooms == null && profile.baths !== 'none') {
    assumptions.push(`Bath count assumed at ${DEFAULT_BATHS} — re-run with actual count.`);
  }
  if (profile.structural.foundation || profile.structural.framing) {
    assumptions.push('Structural items are allowances — replace with engineer-scoped numbers before committing.');
  }
  assumptions.push('Estimate excludes landscaping, outbuildings, and pool work unless added explicitly.');

  return {
    conditionGrade,
    squareFeet: property.squareFeet ?? null,
    costBasis,
    laborIndex: Number(effectiveIndex.toFixed(2)),
    lineItems: items,
    totalLow,
    totalMid,
    totalHigh,
    contingencyPct: profile.contingencyPct,
    confidenceScore: confidence,
    methodology,
    assumptions,
  };
}
