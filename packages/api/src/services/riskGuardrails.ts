import type {
  RiskAssessment,
  RiskFlag,
  MarketContext,
  ValueEstimate,
  ProductLane,
  DataQualityIndicator,
} from './valuationTypes';

/**
 * Risk Guardrails — flags risk conditions and produces RiskAssessment.
 * Automatically widens value ranges and lowers confidence when data quality is poor.
 */

// ─── Risk Flag Builders ──────────────────────────────────

function dataQualityFlags(dq: DataQualityIndicator): RiskFlag[] {
  const flags: RiskFlag[] = [];

  if (dq.compCount === 0) {
    flags.push({
      code: 'DQ_NO_COMPS',
      severity: 'critical',
      message: 'No comparable sales data available — value estimate is based on market bands only.',
      category: 'data_quality',
      requiresHumanReview: true,
      mitigant: 'Order a manual BPO or desktop appraisal to supplement.',
    });
  } else if (dq.compCount < 3) {
    flags.push({
      code: 'DQ_LOW_COMPS',
      severity: 'warning',
      message: `Only ${dq.compCount} comparable sale(s) found — value range widened.`,
      category: 'data_quality',
      requiresHumanReview: false,
      mitigant: 'Expand search radius or include older sales for additional support.',
    });
  }

  if (dq.recencyDays > 180) {
    flags.push({
      code: 'DQ_STALE_DATA',
      severity: 'warning',
      message: `Most recent comparable sale is ${dq.recencyDays} days old — market conditions may have changed.`,
      category: 'data_quality',
      requiresHumanReview: false,
      mitigant: 'Verify current market conditions with local MLS data.',
    });
  }

  if (dq.geographicSpread === 'wide') {
    flags.push({
      code: 'DQ_WIDE_GEO',
      severity: 'warning',
      message: 'Comparable sales span a wide geographic area — direct market comparisons may be unreliable.',
      category: 'data_quality',
      requiresHumanReview: false,
      mitigant: 'Focus on comps within the immediate submarket for tighter valuation.',
    });
  }

  if (dq.score < 30) {
    flags.push({
      code: 'DQ_VERY_LOW',
      severity: 'critical',
      message: 'Overall data quality score is very low — this appraisal requires manual review.',
      category: 'data_quality',
      requiresHumanReview: true,
      mitigant: 'Supplement with manual market research or a third-party appraisal.',
    });
  }

  return flags;
}

function marketFlags(market: MarketContext): RiskFlag[] {
  const flags: RiskFlag[] = [];

  if (market.yearOverYearAppreciation != null && market.yearOverYearAppreciation < -5) {
    flags.push({
      code: 'MKT_DECLINING',
      severity: 'warning',
      message: `Market shows ${market.yearOverYearAppreciation.toFixed(1)}% year-over-year decline.`,
      category: 'market',
      requiresHumanReview: false,
      mitigant: 'Apply conservative valuation assumptions and consider a declining market adjustment.',
    });
  }

  if (market.inventoryMonths != null && market.inventoryMonths > 8) {
    flags.push({
      code: 'MKT_OVERSUPPLY',
      severity: 'warning',
      message: `${market.inventoryMonths.toFixed(1)} months of inventory indicates a buyer's market with potential pricing pressure.`,
      category: 'market',
      requiresHumanReview: false,
      mitigant: 'Use conservative comparable selection and consider longer marketing periods.',
    });
  }

  if (market.medianDaysOnMarket != null && market.medianDaysOnMarket > 90) {
    flags.push({
      code: 'MKT_SLOW',
      severity: 'info',
      message: `Median days on market is ${market.medianDaysOnMarket} — slower-than-average absorption.`,
      category: 'market',
      requiresHumanReview: false,
      mitigant: null,
    });
  }

  return flags;
}

function financialFlags(
  lane: ProductLane,
  metrics: Record<string, unknown>,
): RiskFlag[] {
  const flags: RiskFlag[] = [];

  const dscr = Number(metrics.dscr ?? metrics.strDscr) || 0;
  const ltv = Number(metrics.ltv) || 0;
  const ltc = Number(metrics.ltc) || 0;
  const capRate = Number(metrics.capRate) || 0;

  if ((lane === 'dscr' || lane === 'str' || lane === 'multifamily') && dscr > 0 && dscr < 1.0) {
    flags.push({
      code: 'FIN_NEGATIVE_CASHFLOW',
      severity: 'critical',
      message: `DSCR of ${dscr.toFixed(2)}x indicates negative cash flow — property does not cover debt service.`,
      category: 'financial',
      requiresHumanReview: true,
      mitigant: 'Restructure with higher down payment, rate buydown, or verify income assumptions.',
    });
  } else if ((lane === 'dscr' || lane === 'str' || lane === 'multifamily') && dscr > 0 && dscr < 1.15) {
    flags.push({
      code: 'FIN_TIGHT_DSCR',
      severity: 'warning',
      message: `DSCR of ${dscr.toFixed(2)}x is tight — minimal margin for vacancy or rate increases.`,
      category: 'financial',
      requiresHumanReview: false,
      mitigant: 'Consider reserve requirements or rate lock to protect against margin erosion.',
    });
  }

  if (ltv > 80) {
    flags.push({
      code: 'FIN_HIGH_LTV',
      severity: 'warning',
      message: `LTV of ${ltv.toFixed(1)}% exceeds 80% — limited equity cushion.`,
      category: 'financial',
      requiresHumanReview: false,
      mitigant: 'Increase down payment or negotiate purchase price.',
    });
  }

  if (lane === 'flip' && ltc > 85) {
    flags.push({
      code: 'FIN_HIGH_LTC',
      severity: 'warning',
      message: `LTC of ${ltc.toFixed(1)}% is above 85% — tight leverage for a flip.`,
      category: 'financial',
      requiresHumanReview: false,
      mitigant: 'Reduce rehab scope or negotiate purchase price to lower total cost.',
    });
  }

  if ((lane === 'multifamily' || lane === 'str') && capRate > 0 && capRate < 4) {
    flags.push({
      code: 'FIN_LOW_CAP_RATE',
      severity: 'warning',
      message: `Cap rate of ${capRate.toFixed(2)}% is below 4% — verify income assumptions are realistic.`,
      category: 'financial',
      requiresHumanReview: false,
      mitigant: 'Obtain T12 financials and verify operating expenses independently.',
    });
  }

  return flags;
}

function valueOutlierFlags(
  value: ValueEstimate,
  market: MarketContext,
): RiskFlag[] {
  const flags: RiskFlag[] = [];

  const priceBand = market.marketBands.find((b) => b.bandType === 'price');
  if (priceBand && value.asIs.mid != null) {
    if (value.asIs.mid > priceBand.highValue * 1.3) {
      flags.push({
        code: 'VAL_ABOVE_BAND',
        severity: 'warning',
        message: 'Estimated value significantly exceeds the market band high — may indicate optimistic valuation.',
        category: 'property',
        requiresHumanReview: true,
        mitigant: 'Review comparable selection and adjustment methodology.',
      });
    }
    if (value.asIs.mid < priceBand.lowValue * 0.7) {
      flags.push({
        code: 'VAL_BELOW_BAND',
        severity: 'info',
        message: 'Estimated value is well below the market band — potential value-add opportunity or data quality issue.',
        category: 'property',
        requiresHumanReview: false,
        mitigant: 'Verify property condition and comparable adjustments.',
      });
    }
  }

  return flags;
}

// ─── Main Assessment Builder ─────────────────────────────

export interface GuardrailInput {
  lane: ProductLane;
  marketContext: MarketContext;
  valueEstimate: ValueEstimate;
  laneMetrics: Record<string, unknown>;
}

export function assessRisk(input: GuardrailInput): RiskAssessment {
  const allFlags: RiskFlag[] = [
    ...dataQualityFlags(input.marketContext.dataQuality),
    ...marketFlags(input.marketContext),
    ...financialFlags(input.lane, input.laneMetrics),
    ...valueOutlierFlags(input.valueEstimate, input.marketContext),
  ];

  // Determine overall risk
  let overallRisk: 'low' | 'moderate' | 'high' = 'low';
  if (allFlags.some((f) => f.severity === 'critical')) {
    overallRisk = 'high';
  } else if (allFlags.some((f) => f.severity === 'warning')) {
    overallRisk = 'moderate';
  }

  // Collect unique mitigants
  const mitigants = [...new Set(allFlags.map((f) => f.mitigant).filter((m): m is string => m != null))];

  return { overallRisk, flags: allFlags, mitigants };
}

// ─── Value Range Adjustment ──────────────────────────────

export function adjustValueForDataQuality(
  value: ValueEstimate,
  dataQuality: DataQualityIndicator,
): ValueEstimate {
  const adjusted = { ...value, asIs: { ...value.asIs }, stabilized: value.stabilized ? { ...value.stabilized } : null };

  // Widen ranges for poor data quality
  if (dataQuality.score < 50 && adjusted.asIs.mid != null) {
    const widthMultiplier = dataQuality.score < 30 ? 0.20 : 0.12; // +/- 20% or 12%
    const currentLow = adjusted.asIs.low ?? adjusted.asIs.mid;
    const currentHigh = adjusted.asIs.high ?? adjusted.asIs.mid;
    const spread = adjusted.asIs.mid * widthMultiplier;

    adjusted.asIs.low = Math.min(currentLow, adjusted.asIs.mid - spread);
    adjusted.asIs.high = Math.max(currentHigh, adjusted.asIs.mid + spread);

    // Same for stabilized if present
    if (adjusted.stabilized?.mid != null) {
      const sLow = adjusted.stabilized.low ?? adjusted.stabilized.mid;
      const sHigh = adjusted.stabilized.high ?? adjusted.stabilized.mid;
      const sSpread = adjusted.stabilized.mid * widthMultiplier;
      adjusted.stabilized.low = Math.min(sLow, adjusted.stabilized.mid - sSpread);
      adjusted.stabilized.high = Math.max(sHigh, adjusted.stabilized.mid + sSpread);
    }
  }

  // Lower confidence based on data quality
  const confidenceReduction = Math.max(0, (100 - dataQuality.score) * 0.5);
  adjusted.confidenceScore = Math.max(10, value.confidenceScore - confidenceReduction);

  return adjusted;
}
