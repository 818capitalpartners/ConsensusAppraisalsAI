import { prisma, type Deal } from '@818capital/db';
import type {
  AiAppraisalResult,
  BorrowerFacingSummary,
  LenderAppraisalPackage,
  LenderComparable,
  LenderRiskFlag,
  ValueRange,
} from './lenderOutputTypes';

const DEFAULT_MODEL_VERSION = process.env.LENDER_APPRAISAL_MODEL_VERSION ?? 'model-version-pending';
const DEFAULT_DATA_VERSION = process.env.LENDER_APPRAISAL_DATA_VERSION ?? 'data-version-pending';
const MAX_RENT_COMPS = 5;
const MAX_SALE_COMPS = 5;

type DealWithOptionalAppraisal = Deal & {
  aiAppraisalResult?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => readString(item))
    .filter((item): item is string => item !== null);
}

function readObject(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function readObjectArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord);
}

function pickFirstNumber(source: Record<string, unknown> | null, keys: string[]): number | null {
  if (!source) {
    return null;
  }

  for (const key of keys) {
    const value = readNumber(source[key]);
    if (value != null) {
      return value;
    }
  }

  return null;
}

function pickFirstString(source: Record<string, unknown> | null, keys: string[]): string | null {
  if (!source) {
    return null;
  }

  for (const key of keys) {
    const value = readString(source[key]);
    if (value != null) {
      return value;
    }
  }

  return null;
}

function buildValueRange(source: Record<string, unknown> | null): ValueRange {
  const pointValue = pickFirstNumber(source, ['pointValue', 'value', 'mid', 'midpoint']);
  const low = pickFirstNumber(source, ['low', 'min']) ?? pointValue;
  const high = pickFirstNumber(source, ['high', 'max']) ?? pointValue;

  return {
    low,
    high,
    pointValue,
    currency: 'USD',
  };
}

function normalizeComparable(comp: Record<string, unknown>, index: number): LenderComparable {
  return {
    compId: pickFirstString(comp, ['compId', 'id', 'sourceId']) ?? `comp-${index + 1}`,
    address: pickFirstString(comp, ['address', 'fullAddress']),
    city: pickFirstString(comp, ['city']),
    state: pickFirstString(comp, ['state']),
    zip: pickFirstString(comp, ['zip', 'postalCode']),
    county: pickFirstString(comp, ['county']),
    distanceMiles: pickFirstNumber(comp, ['distanceMiles', 'distance']),
    propertyType: pickFirstString(comp, ['propertyType', 'type']),
    units: pickFirstNumber(comp, ['units']),
    bedrooms: pickFirstNumber(comp, ['bedrooms', 'beds']),
    bathrooms: pickFirstNumber(comp, ['bathrooms', 'baths']),
    squareFeet: pickFirstNumber(comp, ['squareFeet', 'sqft']),
    yearBuilt: pickFirstNumber(comp, ['yearBuilt']),
    salePrice: pickFirstNumber(comp, ['salePrice', 'price']),
    saleDate: pickFirstString(comp, ['saleDate', 'closedAt']),
    monthlyRent: pickFirstNumber(comp, ['monthlyRent', 'rent']),
    rentPerSquareFoot: pickFirstNumber(comp, ['rentPerSquareFoot', 'rentPsf']),
    pricePerSquareFoot: pickFirstNumber(comp, ['pricePerSquareFoot', 'ppsf']),
    source: pickFirstString(comp, ['source', 'provider']),
    similarityScore: pickFirstNumber(comp, ['similarityScore', 'score']),
    notes: pickFirstString(comp, ['notes', 'commentary']),
  };
}

function normalizeRiskFlags(flags: unknown): LenderRiskFlag[] {
  return readObjectArray(flags).map((flag, index) => {
    const severity = pickFirstString(flag, ['severity']) ?? 'moderate';
    const normalizedSeverity = severity === 'low' || severity === 'moderate' || severity === 'high'
      ? severity
      : 'moderate';

    return {
      code: pickFirstString(flag, ['code']) ?? `risk-${index + 1}`,
      label: pickFirstString(flag, ['label', 'title']) ?? `Risk Flag ${index + 1}`,
      severity: normalizedSeverity,
      description: pickFirstString(flag, ['description', 'detail']) ?? 'No description provided.',
      requiresHumanReview: Boolean(flag.requiresHumanReview ?? flag.humanReview ?? false),
      mitigant: pickFirstString(flag, ['mitigant', 'suggestedMitigant']),
    };
  });
}

function normalizeAppraisalPayload(
  deal: DealWithOptionalAppraisal,
): { appraisal: AiAppraisalResult | null; source: LenderAppraisalPackage['audit']['sourceValuationField'] } {
  if (isRecord(deal.aiAppraisalResult)) {
    return {
      appraisal: deal.aiAppraisalResult as AiAppraisalResult,
      source: 'aiAppraisalResult',
    };
  }

  if (isRecord(deal.aiTriageResult)) {
    return {
      appraisal: deal.aiTriageResult as AiAppraisalResult,
      source: 'aiTriageResult',
    };
  }

  return {
    appraisal: null,
    source: 'missing',
  };
}

function formatFullAddress(parts: Array<string | null>): string | null {
  const filtered = parts.filter((part): part is string => Boolean(part));
  return filtered.length > 0 ? filtered.join(', ') : null;
}

function deriveGeography(deal: Deal, appraisal: AiAppraisalResult | null) {
  const subject = readObject(appraisal?.subjectProperty);
  const audit = readObject(appraisal?.audit);
  const geo = readObject((deal.financials as Record<string, unknown> | null)?.geography);

  return {
    state: deal.propertyState ?? pickFirstString(subject, ['state']) ?? pickFirstString(geo, ['state']),
    county: pickFirstString(subject, ['county']) ?? pickFirstString(geo, ['county']),
    fips: pickFirstString(geo, ['fips']) ?? pickFirstString(audit, ['fips']),
    zip: deal.propertyZip ?? pickFirstString(subject, ['zip']) ?? pickFirstString(geo, ['zip']),
  };
}

function deriveSubjectProperty(deal: Deal, appraisal: AiAppraisalResult | null, geography: LenderAppraisalPackage['metadata']['geography']) {
  const subject = readObject(appraisal?.subjectProperty);
  const financials = readObject(deal.financials);

  const addressLine1 = deal.propertyAddress ?? pickFirstString(subject, ['addressLine1', 'address']);
  const city = deal.propertyCity ?? pickFirstString(subject, ['city']);
  const state = deal.propertyState ?? pickFirstString(subject, ['state']);
  const zip = deal.propertyZip ?? pickFirstString(subject, ['zip']);

  return {
    fullAddress: formatFullAddress([addressLine1, city, state, zip]),
    addressLine1,
    city,
    state,
    zip,
    county: geography.county,
    propertyType: deal.propertyType ?? pickFirstString(subject, ['propertyType', 'type']) ?? pickFirstString(financials, ['propertyType']),
    units: deal.units ?? pickFirstNumber(subject, ['units']) ?? pickFirstNumber(financials, ['units']),
    bedrooms: pickFirstNumber(subject, ['bedrooms', 'beds']) ?? pickFirstNumber(financials, ['bedrooms', 'beds']),
    bathrooms: pickFirstNumber(subject, ['bathrooms', 'baths']) ?? pickFirstNumber(financials, ['bathrooms', 'baths']),
    squareFeet: pickFirstNumber(subject, ['squareFeet', 'sqft']) ?? pickFirstNumber(financials, ['squareFeet', 'sqft']),
    yearBuilt: pickFirstNumber(subject, ['yearBuilt']) ?? pickFirstNumber(financials, ['yearBuilt']),
    condition: pickFirstString(subject, ['condition']) ?? pickFirstString(financials, ['condition']),
  };
}

function buildWarnings(source: LenderAppraisalPackage['audit']['sourceValuationField'], appraisal: AiAppraisalResult | null): string[] {
  const warnings: string[] = [];

  if (source === 'aiTriageResult') {
    warnings.push('Valuation package was derived from aiTriageResult because aiAppraisalResult is not yet available on Deal.');
  }

  if (source === 'missing' || appraisal == null) {
    warnings.push('No appraisal payload was found on the deal. Valuation sections were populated with placeholders for lender-file completeness.');
  }

  return warnings;
}

export async function buildLenderAppraisalPackage(args: {
  lenderLoanId: string;
  dealId: string;
}): Promise<LenderAppraisalPackage> {
  const deal = await prisma.deal.findUnique({
    where: { id: args.dealId },
  }) as DealWithOptionalAppraisal | null;

  if (!deal) {
    throw new Error(`Deal not found for id: ${args.dealId}`);
  }

  const { appraisal, source } = normalizeAppraisalPayload(deal);
  const valuation = readObject(appraisal?.valuation);
  const keyMetrics = readObject(valuation?.keyMetrics);
  const confidence = readObject(valuation?.confidence);
  const riskSummary = readObject(appraisal?.riskSummary);
  const audit = readObject(appraisal?.audit);
  const notesForBorrower = readStringArray(appraisal?.notesForBorrower);
  const geography = deriveGeography(deal, appraisal);
  const subjectProperty = deriveSubjectProperty(deal, appraisal, geography);
  const combinedRiskFlags = normalizeRiskFlags(riskSummary?.flags);
  const humanReviewFlags = combinedRiskFlags.filter((flag) => flag.requiresHumanReview);
  const suggestedMitigants = readStringArray(riskSummary?.suggestedMitigants);

  const pkg: LenderAppraisalPackage = {
    metadata: {
      lenderLoanId: args.lenderLoanId,
      '818DealId': deal.id,
      createdAt: new Date().toISOString(),
      modelVersion: DEFAULT_MODEL_VERSION,
      dataVersion: DEFAULT_DATA_VERSION,
      geography,
    },
    subjectProperty,
    valuation: {
      status: appraisal == null ? 'missing' : source === 'aiTriageResult' ? 'partial' : 'complete',
      asIs: buildValueRange(readObject(valuation?.asIs)),
      stabilized: buildValueRange(readObject(valuation?.stabilized)),
      keyMetrics: {
        noi: pickFirstNumber(keyMetrics, ['noi', 'netOperatingIncome']),
        impliedCapRate: pickFirstNumber(keyMetrics, ['impliedCapRate', 'capRate']),
        pricePerSquareFoot: pickFirstNumber(keyMetrics, ['pricePerSquareFoot', 'ppsf']),
        debtServiceCoverageRatio: pickFirstNumber(keyMetrics, ['debtServiceCoverageRatio', 'dscr', 'strDscr']),
        occupancy: pickFirstNumber(keyMetrics, ['occupancy', 'occupancyRate']),
      },
      confidence: {
        overall: pickFirstNumber(confidence, ['overall']),
        asIs: pickFirstNumber(confidence, ['asIs']),
        stabilized: pickFirstNumber(confidence, ['stabilized']),
      },
      methodsUsed: readStringArray(valuation?.methodsUsed),
      commentary: notesForBorrower.length > 0 ? notesForBorrower : readStringArray(valuation?.commentary),
    },
    comps: {
      rent: readObjectArray(appraisal?.comps?.rent).slice(0, MAX_RENT_COMPS).map(normalizeComparable),
      sales: readObjectArray(appraisal?.comps?.sales).slice(0, MAX_SALE_COMPS).map(normalizeComparable),
    },
    riskSummary: {
      combinedRiskFlags,
      humanReviewFlags,
      suggestedMitigants: suggestedMitigants.length > 0
        ? suggestedMitigants
        : humanReviewFlags.map((flag) => flag.mitigant).filter((value): value is string => Boolean(value)),
      overallRiskLevel: (() => {
        const explicit = pickFirstString(riskSummary, ['overallRiskLevel']);
        if (explicit === 'low' || explicit === 'moderate' || explicit === 'high' || explicit === 'unknown') {
          return explicit;
        }
        if (combinedRiskFlags.some((flag) => flag.severity === 'high')) {
          return 'high';
        }
        if (combinedRiskFlags.some((flag) => flag.severity === 'moderate')) {
          return 'moderate';
        }
        if (combinedRiskFlags.some((flag) => flag.severity === 'low')) {
          return 'low';
        }
        return 'unknown';
      })(),
    },
    audit: {
      inputSnapshotIdOrHash: pickFirstString(audit, ['inputSnapshotIdOrHash', 'inputSnapshotId', 'inputHash']),
      modelRunId: pickFirstString(audit, ['modelRunId', 'runId']),
      notesForCreditCommittee: readStringArray(audit?.notesForCreditCommittee),
      warnings: buildWarnings(source, appraisal),
      sourceValuationField: source,
    },
  };

  if (pkg.valuation.commentary.length === 0 && appraisal == null) {
    pkg.valuation.commentary.push('Appraisal result is pending. Lender package generated with placeholders to preserve auditability.');
  }

  return pkg;
}

export function buildBorrowerFacingSummary(pkg: LenderAppraisalPackage): BorrowerFacingSummary {
  const borrowerNotes = pkg.valuation.commentary.filter((note) => !note.toLowerCase().includes('credit committee'));

  return {
    metadata: {
      lenderLoanId: pkg.metadata.lenderLoanId,
      '818DealId': pkg.metadata['818DealId'],
      createdAt: pkg.metadata.createdAt,
      geography: pkg.metadata.geography,
    },
    subjectProperty: pkg.subjectProperty,
    valuation: {
      asIs: pkg.valuation.asIs,
      stabilized: pkg.valuation.stabilized,
      confidence: pkg.valuation.confidence,
      methodsUsed: pkg.valuation.methodsUsed,
      commentary: borrowerNotes,
    },
    riskSummary: {
      flags: pkg.riskSummary.combinedRiskFlags.map((flag) => ({
        code: flag.code,
        label: flag.label,
        severity: flag.severity,
        description: flag.description,
      })),
      suggestedMitigants: pkg.riskSummary.suggestedMitigants,
    },
    notesForBorrower: borrowerNotes,
  };
}
