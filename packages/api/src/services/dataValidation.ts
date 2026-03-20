export type MarketDataQuality = 'good' | 'thin' | 'bad';

export interface RentCompRecord {
  id: string;
  askingRent: number;
  rentPerSqft?: number | null;
  buildingSqft?: number | null;
  distanceMiles?: number | null;
  effectiveDate: string;
}

export interface SaleCompRecord {
  id: string;
  salePrice: number;
  pricePerSqft?: number | null;
  capRate?: number | null;
  buildingSqft?: number | null;
  distanceMiles?: number | null;
  effectiveDate: string;
  saleDate: string;
}

export interface RangeRecord {
  low: number;
  median: number;
  high: number;
  sampleSize?: number;
}

export interface MarketDataValidationInput {
  rentComps: RentCompRecord[];
  saleComps: SaleCompRecord[];
  marketCapRateRange?: RangeRecord | null;
  marketPricePerSqftRange?: RangeRecord | null;
}

export interface MarketDataValidationResult {
  dataQuality: MarketDataQuality;
  reasons: string[];
}

function hasImpossibleCapRate(capRate?: number | null): boolean {
  if (capRate == null) {
    return false;
  }

  return capRate <= 0 || capRate > 0.25;
}

function hasBadRange(range?: RangeRecord | null): boolean {
  if (!range) {
    return false;
  }

  return range.low <= 0 || range.median <= 0 || range.high <= 0 || !(range.low <= range.median && range.median <= range.high);
}

// ─── Property Input Normalizer ──────────────────────────

interface PropertyInput {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  propertyType?: string | null;
  units?: number | null;
  squareFeet?: number;
  yearBuilt?: number;
  purchasePrice?: number;
}

interface NormalizedProperty {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  propertyType: string | null;
  units: number | null;
  squareFeet: number | null;
  yearBuilt: number | null;
}

export function validateAndNormalize(input: PropertyInput): NormalizedProperty {
  return {
    address: input.address?.trim() || null,
    city: input.city?.trim() || null,
    state: input.state?.trim().toUpperCase().slice(0, 2) || null,
    zip: input.zip?.trim().replace(/[^0-9]/g, '').slice(0, 5) || null,
    propertyType: input.propertyType?.trim() || null,
    units: input.units != null && input.units > 0 ? input.units : null,
    squareFeet: input.squareFeet != null && input.squareFeet > 0 ? input.squareFeet : null,
    yearBuilt: input.yearBuilt != null && input.yearBuilt > 1800 && input.yearBuilt <= new Date().getFullYear() + 2
      ? input.yearBuilt : null,
  };
}

// ─── Market Data Validator ──────────────────────────────

export function validateMarketData(input: MarketDataValidationInput): MarketDataValidationResult {
  const reasons: string[] = [];

  const invalidRentCompCount = input.rentComps.filter((comp) => {
    return (
      comp.askingRent <= 0 ||
      (comp.rentPerSqft != null && comp.rentPerSqft <= 0) ||
      (comp.buildingSqft != null && comp.buildingSqft <= 0) ||
      (comp.distanceMiles != null && comp.distanceMiles < 0)
    );
  }).length;

  const invalidSaleCompCount = input.saleComps.filter((comp) => {
    return (
      comp.salePrice <= 0 ||
      (comp.pricePerSqft != null && comp.pricePerSqft <= 0) ||
      hasImpossibleCapRate(comp.capRate) ||
      (comp.buildingSqft != null && comp.buildingSqft <= 0) ||
      (comp.distanceMiles != null && comp.distanceMiles < 0)
    );
  }).length;

  if (input.rentComps.length < 3) {
    reasons.push('Fewer than 3 rent comps available.');
  }

  if (input.saleComps.length < 3) {
    reasons.push('Fewer than 3 sale comps available.');
  }

  if (invalidRentCompCount > 0) {
    reasons.push(`${invalidRentCompCount} rent comp(s) contain invalid numeric values.`);
  }

  if (invalidSaleCompCount > 0) {
    reasons.push(`${invalidSaleCompCount} sale comp(s) contain invalid numeric values.`);
  }

  if (!input.marketCapRateRange) {
    reasons.push('Missing market cap-rate band.');
  } else if (hasBadRange(input.marketCapRateRange)) {
    reasons.push('Market cap-rate band contains impossible values.');
  }

  if (!input.marketPricePerSqftRange) {
    reasons.push('Missing market price-per-square-foot band.');
  } else if (hasBadRange(input.marketPricePerSqftRange)) {
    reasons.push('Market price-per-square-foot band contains impossible values.');
  }

  let dataQuality: MarketDataQuality = 'good';

  if (invalidRentCompCount > 0 || invalidSaleCompCount > 0 || reasons.length >= 3) {
    dataQuality = 'bad';
  } else if (reasons.length > 0) {
    dataQuality = 'thin';
  }

  return {
    dataQuality,
    reasons,
  };
}
