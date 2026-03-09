import { CollateralPropertyType } from '@818capital/db';

export interface VendorMarketQueryInput {
  state: string;
  countyFips?: string;
  zip?: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
  propertyType: CollateralPropertyType;
  effectiveDate?: Date;
  lookbackDays?: number;
  maxResults?: number;
}

export interface VendorRentComp {
  externalId: string;
  addressLine1?: string;
  city?: string;
  state: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  propertyType: CollateralPropertyType;
  beds?: number;
  baths?: number;
  buildingSqft?: number;
  askingRent: number;
  rentPerSqft?: number;
  effectiveDate: string;
  sourceUrl?: string;
}

export interface VendorSaleComp {
  externalId: string;
  addressLine1?: string;
  city?: string;
  state: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  propertyType: CollateralPropertyType;
  buildingSqft?: number;
  salePrice: number;
  pricePerSqft?: number;
  capRate?: number;
  saleDate: string;
  effectiveDate: string;
  sourceUrl?: string;
}

export interface VendorBand {
  low: number;
  median: number;
  high: number;
  sampleSize?: number;
  asOfDate: string;
}

export async function fetchRentCompsFromVendorA(
  input: VendorMarketQueryInput,
): Promise<VendorRentComp[]> {
  // TODO: Implement external API call here.
  void input;
  return [];
}

export async function fetchSaleCompsFromVendorB(
  input: VendorMarketQueryInput,
): Promise<VendorSaleComp[]> {
  // TODO: Implement external API call here.
  void input;
  return [];
}

export async function fetchCapRateBandFromVendorC(
  input: VendorMarketQueryInput,
): Promise<VendorBand | null> {
  // TODO: Implement external API call here.
  void input;
  return null;
}

export async function fetchPpsfBandFromVendorC(
  input: VendorMarketQueryInput,
): Promise<VendorBand | null> {
  // TODO: Implement external API call here.
  void input;
  return null;
}
