import { prisma } from '@818capital/db';
import { randomUUID } from 'crypto';
import type {
  AiAppraisalResult,
  AppraisalRequest,
  AppraisalResponse,
  ProductLane,
  PropertyDetails,
} from './valuationTypes';
import { appraisalRequestSchema, validateLaneInput } from './valuationValidation';
import { getMarketContext } from './marketDataService';
import { generateAppraisal } from './aiAppraisal';
import { assessRisk, adjustValueForDataQuality } from './riskGuardrails';
import { validateAndNormalize } from './dataValidation';

/**
 * Valuation Service — main orchestrator for the AI Appraisal pipeline.
 *
 * Flow: Load Deal → Validate → Get Market Context → Run Valuation →
 *       AI Enhancement → Risk Guardrails → Store Result → Return
 */

const APPRAISAL_VERSION = '1.0.0';

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
    county: null, // Filled from market context
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

// ─── Lane Metrics Extraction ─────────────────────────────

function extractLaneMetrics(lane: string, financials: unknown): Record<string, unknown> {
  const fin = (financials as Record<string, unknown>) ?? {};
  // Return all financials as lane metrics — triageService already computed them
  return { ...fin };
}

// ─── Main Orchestrator ───────────────────────────────────

export async function runAppraisal(request: AppraisalRequest): Promise<AppraisalResponse> {
  const errors: string[] = [];

  // 1. Validate request
  const reqParse = appraisalRequestSchema.safeParse(request);
  if (!reqParse.success) {
    return {
      success: false,
      result: null,
      errors: reqParse.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    };
  }

  // 2. Load deal
  const deal = await prisma.deal.findUnique({ where: { id: request.dealId } });
  if (!deal) {
    return { success: false, result: null, errors: ['Deal not found.'] };
  }

  // 3. Check for existing appraisal (skip if forceRefresh)
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

  // 4. Validate lane-specific financials
  const laneValidation = validateLaneInput(lane, deal.financials);
  if (!laneValidation.success) {
    // Non-blocking — proceed with warnings
    errors.push(...(laneValidation.errors ?? []).map((e) => `Input warning: ${e}`));
  }

  // 5. Extract property details
  const property = extractProperty(deal);

  // 6. Get market context
  let marketContext;
  try {
    const purchasePrice = Number((deal.financials as Record<string, unknown>)?.purchasePrice) || undefined;
    marketContext = await getMarketContext({
      state: property.state ?? deal.propertyState ?? '',
      zip: property.zip ?? deal.propertyZip ?? undefined,
      propertyType: property.propertyType ?? undefined,
      subjectPrice: purchasePrice,
    });
  } catch (err) {
    console.error('[valuationService] Market context fetch failed:', err);
    // Proceed with empty market context
    marketContext = {
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
      dataQuality: { compCount: 0, recencyDays: 0, geographicSpread: 'wide' as const, score: 0, flags: ['Market data unavailable.'] },
    };
    errors.push('Market data could not be retrieved — valuation based on deal inputs only.');
  }

  // Fill county info from market context
  property.county = marketContext.countyName;
  property.fips = marketContext.countyFips;

  // 7. Extract lane metrics
  const laneMetrics = extractLaneMetrics(lane, deal.financials);

  // 8. Run AI-enhanced appraisal
  let valueEstimate;
  let narrative;
  try {
    const appraisalResult = await generateAppraisal(lane, property, marketContext, laneMetrics);
    valueEstimate = appraisalResult.valueEstimate;
    narrative = appraisalResult.narrative;
  } catch (err) {
    console.error('[valuationService] AI appraisal failed:', err);
    return { success: false, result: null, errors: ['AI appraisal generation failed.'] };
  }

  // 9. Apply risk guardrails
  const riskAssessment = assessRisk({ lane, marketContext, valueEstimate, laneMetrics });

  // 10. Adjust values for data quality
  const adjustedValue = adjustValueForDataQuality(valueEstimate, marketContext.dataQuality);

  // 11. Build final result
  const appraisalId = randomUUID();
  const result: AiAppraisalResult = {
    id: appraisalId,
    dealId: deal.id,
    lane,
    property,
    marketContext,
    valueEstimate: adjustedValue,
    riskAssessment,
    laneMetrics,
    narrative,
    confidence: adjustedValue.confidenceScore,
    generatedAt: new Date().toISOString(),
    version: APPRAISAL_VERSION,
  };

  // 12. Store result on deal
  try {
    await prisma.deal.update({
      where: { id: deal.id },
      data: {
        aiTriageResult: JSON.parse(JSON.stringify({
          ...(deal.aiTriageResult as Record<string, unknown> ?? {}),
          _appraisalVersion: APPRAISAL_VERSION,
          _appraisalId: appraisalId,
          valuation: {
            asIs: adjustedValue.asIs,
            stabilized: adjustedValue.stabilized,
            keyMetrics: laneMetrics,
            confidence: {
              overall: adjustedValue.confidenceScore,
              asIs: adjustedValue.confidenceScore,
              stabilized: adjustedValue.stabilized ? adjustedValue.confidenceScore * 0.9 : null,
            },
            methodsUsed: adjustedValue.methodology,
            commentary: [narrative.analysis],
          },
          comps: {
            sales: marketContext.comparableSales.slice(0, 5),
            rent: [],
          },
          riskSummary: {
            flags: riskAssessment.flags.map((f) => ({
              code: f.code,
              label: f.message.split(' \u2014 ')[0],
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
            notesForCreditCommittee: narrative.notesForCreditCommittee,
          },
          subjectProperty: property,
          notesForBorrower: narrative.notesForBorrower,
        })),
      },
    });
  } catch (err) {
    console.error('[valuationService] Failed to store appraisal result:', err);
    errors.push('Appraisal generated but failed to store on deal.');
  }

  return { success: true, result, errors };
}
