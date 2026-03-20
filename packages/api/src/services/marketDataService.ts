import { prisma } from '@818capital/db';
import type {
  MarketContext,
  ComparableSaleData,
  MarketBandData,
  DataQualityIndicator,
} from './valuationTypes';

/**
 * Market Data Service — fetches county-level market context for the AI Appraisal pipeline.
 * Uses County, ComparableSale, MarketBand, and MarketDataSnapshot Prisma models.
 */

interface GetMarketContextInput {
  state: string;
  zip?: string;
  propertyType?: string;
  subjectPrice?: number;
}

export async function getMarketContext(input: GetMarketContextInput): Promise<MarketContext> {
  // 1. Find county by state (and optionally zip via comparable sales)
  const county = await prisma.county.findFirst({
    where: { state: input.state.toUpperCase() },
    orderBy: { name: 'asc' },
  });

  if (!county) {
    return emptyMarketContext(['No county data found for state: ' + input.state]);
  }

  // 2. Fetch comparable sales
  const compWhere: Record<string, unknown> = {
    countyId: county.id,
  };
  if (input.propertyType) compWhere.propertyType = input.propertyType;
  if (input.zip) compWhere.zip = input.zip;

  let rawComps = await prisma.comparableSale.findMany({
    where: compWhere,
    orderBy: { saleDate: 'desc' },
    take: 15,
  });

  // If zip filter yielded too few, broaden to county-level
  if (rawComps.length < 3 && input.zip) {
    const broader: Record<string, unknown> = { countyId: county.id };
    if (input.propertyType) broader.propertyType = input.propertyType;
    rawComps = await prisma.comparableSale.findMany({
      where: broader,
      orderBy: { saleDate: 'desc' },
      take: 15,
    });
  }

  const comparableSales: ComparableSaleData[] = rawComps.map((c) => ({
    compId: c.id,
    address: c.address,
    city: c.city,
    state: c.state,
    zip: c.zip,
    salePrice: c.salePrice,
    saleDate: c.saleDate.toISOString().split('T')[0],
    squareFeet: c.squareFeet,
    pricePerSqFt: c.pricePerSqFt,
    units: c.units,
    distanceMiles: null,
    daysOnMarket: c.daysOnMarket,
    adjustedValue: null,
    adjustments: {},
    source: c.source,
    similarityScore: null,
  }));

  // 3. Fetch market bands
  const rawBands = await prisma.marketBand.findMany({
    where: {
      countyId: county.id,
      ...(input.propertyType ? { propertyType: input.propertyType } : {}),
    },
    orderBy: { asOfDate: 'desc' },
  });

  // Deduplicate by bandType (keep most recent)
  const seenBandTypes = new Set<string>();
  const marketBands: MarketBandData[] = [];
  for (const b of rawBands) {
    if (seenBandTypes.has(b.bandType)) continue;
    seenBandTypes.add(b.bandType);
    marketBands.push({
      bandType: b.bandType,
      lowValue: b.lowValue,
      midValue: b.midValue,
      highValue: b.highValue,
      confidenceLevel: b.confidenceLevel as 'high' | 'moderate' | 'low',
      sampleSize: b.sampleSize,
    });
  }

  // 4. Fetch latest market snapshot for aggregate metrics
  const snapshot = await prisma.marketDataSnapshot.findFirst({
    where: {
      countyId: county.id,
      ...(input.propertyType ? { propertyType: input.propertyType } : {}),
    },
    orderBy: { snapshotDate: 'desc' },
  });

  // 5. Calculate data quality
  const now = Date.now();
  const mostRecentCompDate = rawComps.length > 0
    ? rawComps[0].saleDate.getTime()
    : 0;
  const recencyDays = mostRecentCompDate > 0
    ? Math.floor((now - mostRecentCompDate) / (1000 * 60 * 60 * 24))
    : 999;

  const flags: string[] = [];
  if (rawComps.length === 0) flags.push('No comparable sales found.');
  if (rawComps.length > 0 && rawComps.length < 3) flags.push(`Only ${rawComps.length} comparable sale(s) found.`);
  if (recencyDays > 180) flags.push(`Most recent comp is ${recencyDays} days old.`);
  if (marketBands.length === 0) flags.push('No market band data available.');

  const baseScore = Math.min(100,
    (rawComps.length >= 5 ? 40 : rawComps.length * 8) +
    (recencyDays < 90 ? 25 : recencyDays < 180 ? 15 : 5) +
    (marketBands.length > 0 ? 20 : 0) +
    (snapshot ? 15 : 0),
  );

  const geographicSpread: 'tight' | 'moderate' | 'wide' =
    input.zip && rawComps.some((c) => c.zip === input.zip) ? 'tight' :
    rawComps.length > 0 ? 'moderate' : 'wide';

  const dataQuality: DataQualityIndicator = {
    compCount: rawComps.length,
    recencyDays,
    geographicSpread,
    score: baseScore,
    flags,
  };

  return {
    countyFips: county.fips,
    countyName: county.name,
    medianSalePrice: snapshot?.medianSalePrice ?? null,
    medianPricePerSqFt: snapshot?.medianPriceSqFt ?? null,
    medianRent: snapshot?.medianRent ?? null,
    medianDaysOnMarket: snapshot?.medianDom ?? null,
    inventoryMonths: snapshot?.inventoryMonths ?? null,
    yearOverYearAppreciation: snapshot?.yoyAppreciation ?? null,
    comparableSales,
    marketBands,
    dataQuality,
  };
}

function emptyMarketContext(flags: string[]): MarketContext {
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
    dataQuality: {
      compCount: 0,
      recencyDays: 0,
      geographicSpread: 'wide',
      score: 0,
      flags,
    },
  };
}
