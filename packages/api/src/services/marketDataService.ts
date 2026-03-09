import { CollateralPropertyType, prisma } from '@818capital/db';

import { validateMarketData } from './dataValidation';

export interface MarketContextInput {
  state: string;
  countyFips?: string;
  zip?: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
  propertyType: CollateralPropertyType;
}

export interface MarketDataResponse {
  marketData: {
    county: {
      countyFips: string;
      countyName: string;
      state: string;
      isCoastal: boolean;
      defaultFloodRiskLevel?: string | null;
    } | null;
    rentComps: Array<Record<string, unknown>>;
    saleComps: Array<Record<string, unknown>>;
    marketCapRateRange: Record<string, unknown> | null;
    marketPricePerSqftRange: Record<string, unknown> | null;
    regulatoryNotes: Array<Record<string, unknown>>;
    derivedFeatures: {
      rentMedian?: number;
      saleMedian?: number;
      ppsfMedian?: number;
      capRateMedian?: number;
      rentCompCount: number;
      saleCompCount: number;
      volatilityFlag: boolean;
    };
    dataQuality: 'good' | 'thin' | 'bad';
    dataQualityReasons: string[];
  };
}

function decimalToNumber(value: unknown): number | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in value &&
    typeof (value as { toNumber: () => number }).toNumber === 'function'
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }

  const coerced = Number(value);
  return Number.isFinite(coerced) ? coerced : null;
}

function median(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(4));
  }

  return Number(sorted[middle].toFixed(4));
}

export async function getMarketContextForProperty(
  input: MarketContextInput,
): Promise<MarketDataResponse> {
  const county = input.countyFips
    ? await prisma.geoCounty.findUnique({
        where: { countyFips: input.countyFips },
      })
    : await prisma.geoCounty.findFirst({
        where: {
          state: input.state,
          ...(input.zip ? { submarkets: { some: { zip: input.zip } } } : {}),
        },
        orderBy: { countyName: 'asc' },
      });

  const countyFips = input.countyFips ?? county?.countyFips;

  const submarket = countyFips
    ? await prisma.geoSubmarket.findFirst({
        where: {
          countyFips,
          state: input.state,
          ...(input.zip ? { zip: input.zip } : {}),
        },
        orderBy: { updatedAt: 'desc' },
      })
    : null;

  const bandFilters: Array<Record<string, unknown>> = [
    { state: input.state },
    { propertyType: input.propertyType },
    ...(countyFips ? [{ countyFips }] : []),
    ...(input.zip ? [{ OR: [{ zip: input.zip }, { zip: null }] }] : []),
    ...(submarket ? [{ OR: [{ geoSubmarketId: submarket.id }, { geoSubmarketId: null }] }] : []),
  ];

  const regulationFilters: Array<Record<string, unknown>> = [
    { state: input.state },
    ...(countyFips ? [{ countyFips }] : []),
    ...(input.zip ? [{ OR: [{ zip: input.zip }, { zip: null }] }] : []),
  ];

  const rentCompRows = await prisma.marketRentComp.findMany({
    where: {
      state: input.state,
      propertyType: input.propertyType,
      ...(countyFips ? { countyFips } : {}),
      ...(input.zip ? { zip: input.zip } : {}),
    },
    orderBy: [{ effectiveDate: 'desc' }, { observedAt: 'desc' }],
    take: 12,
  });

  const saleCompRows = await prisma.marketSaleComp.findMany({
    where: {
      state: input.state,
      propertyType: input.propertyType,
      ...(countyFips ? { countyFips } : {}),
      ...(input.zip ? { zip: input.zip } : {}),
    },
    orderBy: [{ effectiveDate: 'desc' }, { saleDate: 'desc' }],
    take: 12,
  });

  const [capRateBandRow, ppsfBandRow, regulationRows, calibrationSnapshot] = await Promise.all([
    prisma.marketCapRateBand.findFirst({
      where: { AND: bandFilters },
      orderBy: [{ geoSubmarketId: 'desc' }, { effectiveDate: 'desc' }],
    }),
    prisma.marketPpsfBand.findFirst({
      where: { AND: bandFilters },
      orderBy: [{ geoSubmarketId: 'desc' }, { effectiveDate: 'desc' }],
    }),
    prisma.geoRegulation.findMany({
      where: { AND: regulationFilters },
      orderBy: [{ effectiveDate: 'desc' }, { updatedAt: 'desc' }],
      take: 20,
    }),
    countyFips
      ? prisma.modelCalibrationSnapshot.findFirst({
          where: {
            state: input.state,
            countyFips,
            propertyType: input.propertyType,
          },
          orderBy: { effectiveDate: 'desc' },
        })
      : Promise.resolve(null),
  ]);

  const rentComps = rentCompRows.map((row) => ({
    id: row.id,
    source: row.source,
    addressLine1: row.addressLine1,
    city: row.city,
    zip: row.zip,
    beds: row.beds,
    baths: decimalToNumber(row.baths),
    buildingSqft: row.buildingSqft,
    askingRent: decimalToNumber(row.askingRent) ?? 0,
    rentPerSqft: decimalToNumber(row.rentPerSqft),
    distanceMiles: decimalToNumber(row.distanceMiles),
    effectiveDate: row.effectiveDate.toISOString(),
  }));

  const saleComps = saleCompRows.map((row) => ({
    id: row.id,
    source: row.source,
    addressLine1: row.addressLine1,
    city: row.city,
    zip: row.zip,
    buildingSqft: row.buildingSqft,
    salePrice: decimalToNumber(row.salePrice) ?? 0,
    pricePerSqft: decimalToNumber(row.pricePerSqft),
    capRate: decimalToNumber(row.capRate),
    distanceMiles: decimalToNumber(row.distanceMiles),
    saleDate: row.saleDate.toISOString(),
    effectiveDate: row.effectiveDate.toISOString(),
  }));

  const marketCapRateRange = capRateBandRow
    ? {
        low: decimalToNumber(capRateBandRow.lowRate) ?? 0,
        median: decimalToNumber(capRateBandRow.medianRate) ?? 0,
        high: decimalToNumber(capRateBandRow.highRate) ?? 0,
        sampleSize: capRateBandRow.sampleSize,
        effectiveDate: capRateBandRow.effectiveDate.toISOString(),
        source: capRateBandRow.geoSubmarketId ? 'submarket' : 'county',
      }
    : null;

  const marketPricePerSqftRange = ppsfBandRow
    ? {
        low: decimalToNumber(ppsfBandRow.lowPpsf) ?? 0,
        median: decimalToNumber(ppsfBandRow.medianPpsf) ?? 0,
        high: decimalToNumber(ppsfBandRow.highPpsf) ?? 0,
        sampleSize: ppsfBandRow.sampleSize,
        effectiveDate: ppsfBandRow.effectiveDate.toISOString(),
        source: ppsfBandRow.geoSubmarketId ? 'submarket' : 'county',
      }
    : null;

  const regulatoryNotes = regulationRows.map((row) => ({
    regulationType: row.regulationType,
    jurisdictionName: row.jurisdictionName,
    title: row.title,
    summary: row.summary,
    notes: row.notes,
    effectiveDate: row.effectiveDate.toISOString(),
    zoningCategory: row.zoningCategory,
    floodZone: row.floodZone,
    coastalRiskFlag: row.coastalRiskFlag,
    strAllowed: row.strAllowed,
    strMinNightStay: row.strMinNightStay,
  }));

  const validation = validateMarketData({
    rentComps: rentComps.map((comp) => ({
      id: comp.id as string,
      askingRent: comp.askingRent as number,
      rentPerSqft: comp.rentPerSqft as number | null,
      buildingSqft: comp.buildingSqft as number | null,
      distanceMiles: comp.distanceMiles as number | null,
      effectiveDate: comp.effectiveDate as string,
    })),
    saleComps: saleComps.map((comp) => ({
      id: comp.id as string,
      salePrice: comp.salePrice as number,
      pricePerSqft: comp.pricePerSqft as number | null,
      capRate: comp.capRate as number | null,
      buildingSqft: comp.buildingSqft as number | null,
      distanceMiles: comp.distanceMiles as number | null,
      effectiveDate: comp.effectiveDate as string,
      saleDate: comp.saleDate as string,
    })),
    marketCapRateRange: marketCapRateRange
      ? {
          low: marketCapRateRange.low,
          median: marketCapRateRange.median,
          high: marketCapRateRange.high,
          sampleSize: marketCapRateRange.sampleSize,
        }
      : null,
    marketPricePerSqftRange: marketPricePerSqftRange
      ? {
          low: marketPricePerSqftRange.low,
          median: marketPricePerSqftRange.median,
          high: marketPricePerSqftRange.high,
          sampleSize: marketPricePerSqftRange.sampleSize,
        }
      : null,
  });

  const rentMedian = median(rentComps.map((comp) => comp.askingRent as number));
  const saleMedian = median(saleComps.map((comp) => comp.salePrice as number));
  const ppsfMedian = median(
    saleComps
      .map((comp) => comp.pricePerSqft)
      .filter((value): value is number => typeof value === 'number'),
  );
  const capRateMedian = median(
    saleComps
      .map((comp) => comp.capRate)
      .filter((value): value is number => typeof value === 'number'),
  );

  return {
    marketData: {
      county: county
        ? {
            countyFips: county.countyFips,
            countyName: county.countyName,
            state: county.state,
            isCoastal: county.isCoastal,
            defaultFloodRiskLevel: county.defaultFloodRiskLevel,
          }
        : null,
      rentComps,
      saleComps,
      marketCapRateRange,
      marketPricePerSqftRange,
      regulatoryNotes,
      derivedFeatures: {
        rentMedian,
        saleMedian,
        ppsfMedian: marketPricePerSqftRange?.median ?? ppsfMedian,
        capRateMedian: marketCapRateRange?.median ?? capRateMedian,
        rentCompCount: rentComps.length,
        saleCompCount: saleComps.length,
        volatilityFlag: calibrationSnapshot?.volatilityFlag ?? validation.dataQuality !== 'good',
      },
      dataQuality: validation.dataQuality,
      dataQualityReasons: [
        ...validation.reasons,
        ...(calibrationSnapshot?.volatilityFlag ? ['Latest county calibration snapshot is marked volatile.'] : []),
      ],
    },
  };
}
