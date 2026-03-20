/**
 * Core types for the 818 AI Appraisal Cloud valuation engine.
 * These types flow through: marketDataService → valuationService → aiAppraisal → riskGuardrails → lenderOutput.
 */

export type ProductLane = 'dscr' | 'flip' | 'str' | 'multifamily';

// ─── Property ────────────────────────────────────────────

export interface PropertyDetails {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  county: string | null;
  fips: string | null;
  propertyType: string | null;
  units: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  yearBuilt: number | null;
  lotSize: number | null;
  condition: string | null;
}

// ─── Market Context ──────────────────────────────────────

export interface ComparableSaleData {
  compId: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  salePrice: number;
  saleDate: string;
  squareFeet: number | null;
  pricePerSqFt: number | null;
  units: number | null;
  distanceMiles: number | null;
  daysOnMarket: number | null;
  adjustedValue: number | null;
  adjustments: Record<string, number>;
  source: string | null;
  similarityScore: number | null;
}

export interface MarketBandData {
  bandType: string; // price, rent, cap_rate, price_per_sqft
  lowValue: number;
  midValue: number;
  highValue: number;
  confidenceLevel: 'high' | 'moderate' | 'low';
  sampleSize: number | null;
}

export interface DataQualityIndicator {
  compCount: number;
  recencyDays: number;
  geographicSpread: 'tight' | 'moderate' | 'wide';
  score: number; // 0-100
  flags: string[];
}

export interface MarketContext {
  countyFips: string | null;
  countyName: string | null;
  medianSalePrice: number | null;
  medianPricePerSqFt: number | null;
  medianRent: number | null;
  medianDaysOnMarket: number | null;
  inventoryMonths: number | null;
  yearOverYearAppreciation: number | null;
  comparableSales: ComparableSaleData[];
  marketBands: MarketBandData[];
  dataQuality: DataQualityIndicator;
}

// ─── Value Estimate ──────────────────────────────────────

export interface ValueRange {
  low: number | null;
  mid: number | null;
  high: number | null;
}

export interface ValueEstimate {
  asIs: ValueRange;
  stabilized: ValueRange | null; // Flip/value-add only
  confidenceScore: number; // 0-100
  methodology: string[];
}

// ─── Risk Assessment ─────────────────────────────────────

export type RiskCategory = 'market' | 'property' | 'financial' | 'data_quality';
export type RiskSeverity = 'info' | 'warning' | 'critical';

export interface RiskFlag {
  code: string;
  severity: RiskSeverity;
  message: string;
  category: RiskCategory;
  requiresHumanReview: boolean;
  mitigant: string | null;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high';
  flags: RiskFlag[];
  mitigants: string[];
}

// ─── AI Appraisal Result ────────────────────────────────

export interface AppraisalNarrative {
  headline: string;
  analysis: string;
  strengths: string[];
  risks: string[];
  nextSteps: string[];
  notesForBorrower: string[];
  notesForCreditCommittee: string[];
  aiGenerated: boolean;
}

export interface AiAppraisalResult {
  id: string;
  dealId: string;
  lane: ProductLane;
  property: PropertyDetails;
  marketContext: MarketContext;
  valueEstimate: ValueEstimate;
  riskAssessment: RiskAssessment;
  laneMetrics: Record<string, unknown>;
  narrative: AppraisalNarrative;
  confidence: number; // 0-100 overall
  generatedAt: string;
  version: string;
}

// ─── Service Interfaces ──────────────────────────────────

export interface AppraisalRequest {
  dealId: string;
  forceRefresh?: boolean;
}

export interface AppraisalResponse {
  success: boolean;
  result: AiAppraisalResult | null;
  errors: string[];
}
