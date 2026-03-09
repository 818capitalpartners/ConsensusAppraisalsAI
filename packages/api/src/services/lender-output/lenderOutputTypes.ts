export interface ValueRange {
  low: number | null;
  high: number | null;
  pointValue: number | null;
  currency: 'USD';
}

export interface ValuationKeyMetrics {
  noi: number | null;
  impliedCapRate: number | null;
  pricePerSquareFoot: number | null;
  debtServiceCoverageRatio: number | null;
  occupancy: number | null;
}

export interface ValuationConfidence {
  overall: number | null;
  asIs: number | null;
  stabilized: number | null;
}

export interface LenderComparable {
  compId: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  county: string | null;
  distanceMiles: number | null;
  propertyType: string | null;
  units: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  yearBuilt: number | null;
  salePrice: number | null;
  saleDate: string | null;
  monthlyRent: number | null;
  rentPerSquareFoot: number | null;
  pricePerSquareFoot: number | null;
  source: string | null;
  similarityScore: number | null;
  notes: string | null;
}

export interface LenderRiskFlag {
  code: string;
  label: string;
  severity: 'low' | 'moderate' | 'high';
  description: string;
  requiresHumanReview: boolean;
  mitigant: string | null;
}

export interface LenderAppraisalPackage {
  metadata: {
    lenderLoanId: string;
    '818DealId': string;
    createdAt: string;
    modelVersion: string;
    dataVersion: string;
    geography: {
      state: string | null;
      county: string | null;
      fips: string | null;
      zip: string | null;
    };
  };
  subjectProperty: {
    fullAddress: string | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    county: string | null;
    propertyType: string | null;
    units: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    squareFeet: number | null;
    yearBuilt: number | null;
    condition: string | null;
  };
  valuation: {
    status: 'complete' | 'partial' | 'missing';
    asIs: ValueRange;
    stabilized: ValueRange;
    keyMetrics: ValuationKeyMetrics;
    confidence: ValuationConfidence;
    methodsUsed: string[];
    commentary: string[];
  };
  comps: {
    rent: LenderComparable[];
    sales: LenderComparable[];
  };
  riskSummary: {
    combinedRiskFlags: LenderRiskFlag[];
    humanReviewFlags: LenderRiskFlag[];
    suggestedMitigants: string[];
    overallRiskLevel: 'low' | 'moderate' | 'high' | 'unknown';
  };
  audit: {
    inputSnapshotIdOrHash: string | null;
    modelRunId: string | null;
    notesForCreditCommittee: string[];
    warnings: string[];
    sourceValuationField: 'aiAppraisalResult' | 'aiTriageResult' | 'missing';
  };
}

export interface BorrowerFacingSummary {
  metadata: Pick<LenderAppraisalPackage['metadata'], 'lenderLoanId' | '818DealId' | 'createdAt' | 'geography'>;
  subjectProperty: LenderAppraisalPackage['subjectProperty'];
  valuation: {
    asIs: ValueRange;
    stabilized: ValueRange;
    confidence: ValuationConfidence;
    methodsUsed: string[];
    commentary: string[];
  };
  riskSummary: {
    flags: Array<Pick<LenderRiskFlag, 'code' | 'label' | 'severity' | 'description'>>;
    suggestedMitigants: string[];
  };
  notesForBorrower: string[];
}

export interface AiAppraisalResult {
  valuation?: {
    asIs?: Partial<ValueRange> & { value?: number | null };
    stabilized?: Partial<ValueRange> & { value?: number | null };
    keyMetrics?: Partial<ValuationKeyMetrics>;
    confidence?: Partial<ValuationConfidence>;
    methodsUsed?: string[];
    commentary?: string[];
  };
  comps?: {
    rent?: unknown[];
    sales?: unknown[];
  };
  riskSummary?: {
    flags?: unknown[];
    suggestedMitigants?: string[];
    overallRiskLevel?: 'low' | 'moderate' | 'high' | 'unknown';
  };
  audit?: {
    inputSnapshotIdOrHash?: string | null;
    modelRunId?: string | null;
    notesForCreditCommittee?: string[];
  };
  subjectProperty?: Partial<LenderAppraisalPackage['subjectProperty']>;
  notesForBorrower?: string[];
}
