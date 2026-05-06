import { prisma } from '@818capital/db';
import { randomUUID } from 'crypto';
import type {
  AdjustedCompView,
  AiAppraisalResult,
  AppraisalRequest,
  AppraisalResponse,
  ApproachResult,
  AppraisalNarrative,
  MarketContext,
  ProductLane,
  PropertyDetails,
  QuickAppraisalRequest,
  QuickAppraisalResponse,
  QuickAppraisalResult,
  ReconciledValuation,
  RehabConditionGrade,
  RehabEstimate,
  ValueEstimate,
} from './valuationTypes';
import { appraisalRequestSchema, validateLaneInput } from './valuationValidation';
import { getMarketContext } from './marketDataService';
import { generateNarrative } from './aiAppraisal';
import { selectComps, type AdjustedComp } from './compSelection';
import {
  salesComparisonApproach,
  marketBandApproach,
  incomeApproach,
  reconcile,
} from './valuationApproaches';
import { assessRisk, adjustValueForDataQuality } from './riskGuardrails';
import { validateAndNormalize } from './dataValidation';
import { estimateRehab } from './rehabEstimator';

/**
 * Valuation Service — orchestrator for the AI Appraisal pipeline.
 *
 * Math is deterministic and auditable: pick comps, score similarity, apply
 * adjustments, run three approaches, reconcile by confidence-weighted average.
 * AI is invoked only to write narrative — never to compute values.
 *
 * Both runAppraisal (deal-based) and runQuickAppraisal (address-first) share
 * the same core via runValuationPipeline().
 */

const APPRAISAL_VERSION = '2.0.0';

const VALID_CONDITION_GRADES: RehabConditionGrade[] = ['turnkey', 'cosmetic', 'moderate', 'heavy', 'gut'];

function resolveConditionGrade(raw: unknown, lane?: ProductLane): RehabConditionGrade | null {
  if (typeof raw === 'string' && (VALID_CONDITION_GRADES as string[]).includes(raw)) {
    return raw as RehabConditionGrade;
  }
  if (lane === 'flip') return 'moderate';
  return null;
}

function laneFromTargetUse(targetUse?: string): ProductLane {
  switch (targetUse) {
    case 'flip': return 'flip';
    case 'rental': return 'dscr';
    case 'str': return 'str';
    case 'hold': return 'dscr';
    default: return 'dscr';
  }
}

function adjustedCompToView(c: AdjustedComp): AdjustedCompView {
  return {
    compId: c.compId,
    address: c.address,
    city: c.city,
    zip: c.zip,
    salePrice: c.salePrice,
    saleDate: c.saleDate,
    squareFeet: c.squareFeet,
    pricePerSqFt: c.pricePerSqFt,
    bedrooms: c.bedrooms,
    bathrooms: c.bathrooms,
    yearBuilt: c.yearBuilt,
    source: c.source,
    recencyMonths: c.recencyMonths,
    locationMatch: c.locationMatch,
    adjustments: c.adjustments,
    adjustmentTotal: c.adjustmentTotal,
    adjustedValue: c.adjustedValue,
    similarityScore: c.similarityScore,
    weight: c.weight,
    reasoning: c.reasoning,
  };
}

function reconciledToValueEstimate(reconciled: ReconciledValuation): ValueEstimate {
  return {
    asIs: reconciled.asIs,
    stabilized: reconciled.stabilized,
    confidenceScore: reconciled.confidenceScore,
    methodology: reconciled.methodology,
  };
}

// ─── Shared pipeline ─────────────────────────────────────

interface PipelineInput {
  lane: ProductLane;
  property: PropertyDetails;
  marketContext: MarketContext;
  rehab: RehabEstimate | null;
  laneMetrics: Record<string, unknown>;
}

interface PipelineOutput {
  valueEstimate: ValueEstimate;
  approaches: ApproachResult[];
  selectedComps: AdjustedCompView[];
  narrative: AppraisalNarrative;
  reconciled: ReconciledValuation;
}

async function runValuationPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const { lane, property, marketContext, rehab, laneMetrics } = input;

  // 1. Comp selection — score and adjust each candidate.
  const selected = selectComps({
    subject: property,
    candidates: marketContext.comparableSales,
    topN: 8,
  });
  const selectedComps = selected.map(adjustedCompToView);

  // 2. Run the three valuation approaches.
  const sales = salesComparisonApproach(selected);
  const band = marketBandApproach(marketContext, property);
  const income = incomeApproach(lane, marketContext, property, {
    monthlyRent: Number(laneMetrics.monthlyRent ?? laneMetrics.marketRent) || undefined,
    vacancyPct: Number(laneMetrics.vacancyPct) || undefined,
    expenseRatio: Number(laneMetrics.expenseRatio) || undefined,
  });
  const approaches: ApproachResult[] = [sales, band, income];

  // 3. Reconcile.
  const reconciledRaw = reconcile(approaches, rehab, lane);

  // 4. Apply data-quality widening on top of reconciliation.
  const dqAdjusted = adjustValueForDataQuality(
    reconciledToValueEstimate(reconciledRaw),
    marketContext.dataQuality,
  );

  const reconciled: ReconciledValuation = {
    asIs: dqAdjusted.asIs,
    stabilized: dqAdjusted.stabilized,
    confidenceScore: dqAdjusted.confidenceScore,
    approaches,
    methodology: dqAdjusted.methodology,
  };

  // 5. Narrative — AI does prose only.
  const narrative = await generateNarrative(lane, property, marketContext, reconciled, selectedComps);

  return {
    valueEstimate: reconciledToValueEstimate(reconciled),
    approaches,
    selectedComps,
    narrative,
    reconciled,
  };
}

// ─── Property Extraction ─────────────────────────────────

function extractProperty(deal: {
  propertyAddress: string | null;
  propertyCity: string | null;
  propertyState: string | null;
  propertyZip: string | null;
  propertyType: string | null;
  units: number | null;
  financials: unknown;
}): PropertyDetails {
  const fin = (deal.financials as Record<string, unknown>) ?? {};
  const validated = validateAndNormalize({
    address: deal.propertyAddress,
    city: deal.propertyCity,
    state: deal.propertyState,
    zip: deal.propertyZip,
    propertyType: deal.propertyType,
    units: deal.units,
    squareFeet: Number(fin.squareFeet) || undefined,
    yearBuilt: Number(fin.yearBuilt) || undefined,
    purchasePrice: Number(fin.purchasePrice) || undefined,
  });

  return {
    address: validated.address,
    city: validated.city ?? deal.propertyCity,
    state: validated.state,
    zip: validated.zip,
    county: null,
    fips: null,
    propertyType: validated.propertyType,
    units: validated.units,
    bedrooms: Number(fin.bedrooms) || null,
    bathrooms: Number(fin.bathrooms) || null,
    squareFeet: validated.squareFeet,
    yearBuilt: validated.yearBuilt,
    lotSize: Number(fin.lotSize) || null,
    condition: (fin.condition as string) ?? null,
  };
}

function extractLaneMetrics(_lane: string, financials: unknown): Record<string, unknown> {
  const fin = (financials as Record<string, unknown>) ?? {};
  return { ...fin };
}

function emptyMarketContext(flag: string): MarketContext {
  return {
    countyFips: null,
    countyName: null,
    medianSalePrice: null,
    medianPricePerSqFt: null,
    medianRent: null,
    medianDaysOnMarket: null,
    inventoryMonths: null,
    yearOverYearAppreciation: null,
    comparableSales: [],
    marketBands: [],
    dataQuality: { compCount: 0, recencyDays: 0, geographicSpread: 'wide', score: 0, flags: [flag] },
  };
}

// ─── runAppraisal (deal-based) ───────────────────────────

export async function runAppraisal(request: AppraisalRequest): Promise<AppraisalResponse> {
  const errors: string[] = [];

  const reqParse = appraisalRequestSchema.safeParse(request);
  if (!reqParse.success) {
    return {
      success: false,
      result: null,
      errors: reqParse.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    };
  }

  const deal = await prisma.deal.findUnique({ where: { id: request.dealId } });
  if (!deal) return { success: false, result: null, errors: ['Deal not found.'] };

  if (!request.forceRefresh && deal.aiTriageResult) {
    const existing = deal.aiTriageResult as Record<string, unknown>;
    if (existing._appraisalVersion === APPRAISAL_VERSION) {
      return {
        success: true,
        result: existing as unknown as AiAppraisalResult,
        errors: [],
      };
    }
  }

  const lane = deal.productLane as ProductLane;
  if (!['dscr', 'flip', 'str', 'multifamily'].includes(lane)) {
    return { success: false, result: null, errors: [`Unsupported product lane: ${lane}`] };
  }

  const laneValidation = validateLaneInput(lane, deal.financials);
  if (!laneValidation.success) {
    errors.push(...(laneValidation.errors ?? []).map((e) => `Input warning: ${e}`));
  }

  const property = extractProperty(deal);

  let marketContext: MarketContext;
  try {
    marketContext = await getMarketContext({
      state: property.state ?? deal.propertyState ?? '',
      zip: property.zip ?? deal.propertyZip ?? undefined,
      propertyType: property.propertyType ?? undefined,
      subjectPrice: Number((deal.financials as Record<string, unknown>)?.purchasePrice) || undefined,
    });
  } catch (err) {
    console.error('[valuationService] Market context fetch failed:', err);
    marketContext = emptyMarketContext('Market data unavailable.');
    errors.push('Market data could not be retrieved — valuation widened.');
  }

  property.county = marketContext.countyName;
  property.fips = marketContext.countyFips;

  const laneMetrics = extractLaneMetrics(lane, deal.financials);

  const conditionGrade = resolveConditionGrade(
    (deal.financials as Record<string, unknown> | null)?.condition,
    lane,
  );
  const rehab: RehabEstimate | null = conditionGrade ? estimateRehab({ property, conditionGrade }) : null;

  let pipeline: PipelineOutput;
  try {
    pipeline = await runValuationPipeline({ lane, property, marketContext, rehab, laneMetrics });
  } catch (err) {
    console.error('[valuationService] Pipeline failed:', err);
    return { success: false, result: null, errors: ['Valuation pipeline failed.'] };
  }

  const riskAssessment = assessRisk({ lane, marketContext, valueEstimate: pipeline.valueEstimate, laneMetrics });

  const appraisalId = randomUUID();
  const result: AiAppraisalResult = {
    id: appraisalId,
    dealId: deal.id,
    lane,
    property,
    marketContext,
    valueEstimate: pipeline.valueEstimate,
    approaches: pipeline.approaches,
    selectedComps: pipeline.selectedComps,
    riskAssessment,
    laneMetrics,
    narrative: pipeline.narrative,
    rehab,
    confidence: pipeline.valueEstimate.confidenceScore,
    generatedAt: new Date().toISOString(),
    version: APPRAISAL_VERSION,
  };

  try {
    await prisma.deal.update({
      where: { id: deal.id },
      data: {
        aiTriageResult: JSON.parse(JSON.stringify({
          ...(deal.aiTriageResult as Record<string, unknown> ?? {}),
          _appraisalVersion: APPRAISAL_VERSION,
          _appraisalId: appraisalId,
          valuation: {
            asIs: pipeline.valueEstimate.asIs,
            stabilized: pipeline.valueEstimate.stabilized,
            keyMetrics: laneMetrics,
            confidence: {
              overall: pipeline.valueEstimate.confidenceScore,
              asIs: pipeline.valueEstimate.confidenceScore,
              stabilized: pipeline.valueEstimate.stabilized
                ? pipeline.valueEstimate.confidenceScore * 0.9
                : null,
            },
            methodsUsed: pipeline.valueEstimate.methodology,
            commentary: [pipeline.narrative.analysis],
          },
          approaches: pipeline.approaches,
          selectedComps: pipeline.selectedComps,
          comps: {
            sales: pipeline.selectedComps.slice(0, 5),
            rent: [],
          },
          riskSummary: {
            flags: riskAssessment.flags.map((f) => ({
              code: f.code,
              label: f.message.split(' — ')[0],
              severity: f.severity === 'critical' ? 'high' : f.severity === 'warning' ? 'moderate' : 'low',
              description: f.message,
              requiresHumanReview: f.requiresHumanReview,
              mitigant: f.mitigant,
            })),
            suggestedMitigants: riskAssessment.mitigants,
            overallRiskLevel: riskAssessment.overallRisk,
          },
          audit: {
            modelRunId: appraisalId,
            notesForCreditCommittee: pipeline.narrative.notesForCreditCommittee,
          },
          subjectProperty: property,
          notesForBorrower: pipeline.narrative.notesForBorrower,
          rehab: rehab ?? undefined,
        })),
      },
    });
  } catch (err) {
    console.error('[valuationService] Failed to store appraisal result:', err);
    errors.push('Appraisal generated but failed to store on deal.');
  }

  return { success: true, result, errors };
}

// ─── runQuickAppraisal (address-first) ───────────────────

export async function runQuickAppraisal(request: QuickAppraisalRequest): Promise<QuickAppraisalResponse> {
  const errors: string[] = [];

  if (!request.address || !request.state) {
    return { success: false, result: null, errors: ['address and state are required'] };
  }

  const lane = laneFromTargetUse(request.targetUse);

  const validated = validateAndNormalize({
    address: request.address,
    city: request.city,
    state: request.state,
    zip: request.zip,
    propertyType: request.propertyType,
    units: request.units,
    squareFeet: request.squareFeet,
    yearBuilt: request.yearBuilt,
  });

  const property: PropertyDetails = {
    address: validated.address,
    city: validated.city ?? request.city ?? null,
    state: validated.state,
    zip: validated.zip,
    county: null,
    fips: null,
    propertyType: validated.propertyType,
    units: validated.units,
    bedrooms: request.bedrooms ?? null,
    bathrooms: request.bathrooms ?? null,
    squareFeet: validated.squareFeet,
    yearBuilt: validated.yearBuilt,
    lotSize: null,
    condition: request.condition ?? null,
  };

  let marketContext: MarketContext;
  try {
    marketContext = await getMarketContext({
      state: property.state ?? request.state,
      zip: property.zip ?? undefined,
      propertyType: property.propertyType ?? undefined,
    });
  } catch (err) {
    console.error('[valuationService] Quick: market context failed:', err);
    return { success: false, result: null, errors: ['Market data lookup failed.'] };
  }
  property.county = marketContext.countyName;
  property.fips = marketContext.countyFips;

  const conditionGrade = resolveConditionGrade(request.condition, lane);
  const rehab = conditionGrade ? estimateRehab({ property, conditionGrade }) : null;

  let pipeline: PipelineOutput;
  try {
    pipeline = await runValuationPipeline({
      lane,
      property,
      marketContext,
      rehab,
      laneMetrics: {},
    });
  } catch (err) {
    console.error('[valuationService] Quick: pipeline failed:', err);
    return { success: false, result: null, errors: ['Valuation pipeline failed.'] };
  }

  const riskAssessment = assessRisk({
    lane,
    marketContext,
    valueEstimate: pipeline.valueEstimate,
    laneMetrics: {},
  });

  const result: QuickAppraisalResult = {
    property,
    marketContext,
    valueEstimate: pipeline.valueEstimate,
    approaches: pipeline.approaches,
    selectedComps: pipeline.selectedComps,
    rehab,
    riskAssessment,
    narrative: pipeline.narrative,
    confidence: pipeline.valueEstimate.confidenceScore,
    generatedAt: new Date().toISOString(),
    version: APPRAISAL_VERSION,
  };

  return { success: true, result, errors };
}
