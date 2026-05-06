import 'dotenv/config';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds Miami-Dade / 33139 / condo data so the appraisal pipeline has a
 * realistic floor to underwrite against. Idempotent: re-running updates the
 * county and skips comp/snapshot rows by composite identifiers.
 */
async function main() {
  // Person + a development Deal so /api/appraisals/run has something to load
  const person = await prisma.person.upsert({
    where: { email: 'county-seed@818capital.com' },
    update: { firstName: 'County', lastName: 'Seed', company: '818 Capital' },
    create: {
      type: 'investor',
      firstName: 'County',
      lastName: 'Seed',
      email: 'county-seed@818capital.com',
      company: '818 Capital',
    },
  });

  // County
  const county = await prisma.county.upsert({
    where: { fips: '12086' },
    update: {
      name: 'Miami-Dade County',
      state: 'FL',
      population: 2700000,
      medianIncome: 60000,
    },
    create: {
      fips: '12086',
      name: 'Miami-Dade County',
      state: 'FL',
      population: 2700000,
      medianIncome: 60000,
    },
  });

  // Existing seed deal — find-or-create so we don't accumulate one per run
  const existingDeal = await prisma.deal.findFirst({
    where: { channel: 'seed', propertyZip: '33139' },
  });
  const deal = existingDeal ?? (await prisma.deal.create({
    data: {
      personId: person.id,
      productLane: 'dscr',
      leadType: 'investor',
      channel: 'seed',
      propertyAddress: '1100 West Ave Unit 1401',
      propertyCity: 'Miami Beach',
      propertyState: 'FL',
      propertyZip: '33139',
      propertyType: 'condo',
      units: 1,
    },
  }));

  // Comparable sales — 6 condo sales in 33139 over the last few months.
  // Use sourceId as the dedupe key so rerunning won't insert duplicates.
  const sales: Array<{
    sourceId: string;
    address: string;
    salePrice: number;
    saleDate: Date;
    squareFeet: number;
    pricePerSqFt: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    daysOnMarket: number;
    latitude: number;
    longitude: number;
    source: string;
  }> = [
    { sourceId: 'SALE-MB-001', address: '1200 West Ave Unit 1122', salePrice: 525000, saleDate: new Date('2025-12-12'), squareFeet: 837, pricePerSqFt: 627.24, bedrooms: 1, bathrooms: 1.0, yearBuilt: 1965, daysOnMarket: 38, latitude: 25.783327, longitude: -80.142106, source: 'county_recorder' },
    { sourceId: 'SALE-MB-002', address: '1330 West Ave Unit 913', salePrice: 548000, saleDate: new Date('2026-01-16'), squareFeet: 848, pricePerSqFt: 646.23, bedrooms: 1, bathrooms: 1.5, yearBuilt: 1974, daysOnMarket: 22, latitude: 25.784933, longitude: -80.143294, source: 'mls' },
    { sourceId: 'SALE-MB-003', address: '100 Lincoln Rd Unit 1532', salePrice: 735000, saleDate: new Date('2026-02-03'), squareFeet: 1190, pricePerSqFt: 617.65, bedrooms: 2, bathrooms: 2.0, yearBuilt: 1965, daysOnMarket: 41, latitude: 25.790845, longitude: -80.130099, source: 'mls' },
    { sourceId: 'SALE-MB-004', address: '900 West Ave Unit 1014', salePrice: 489000, saleDate: new Date('2026-02-19'), squareFeet: 780, pricePerSqFt: 626.92, bedrooms: 1, bathrooms: 1.0, yearBuilt: 1962, daysOnMarket: 29, latitude: 25.781200, longitude: -80.140500, source: 'mls' },
    { sourceId: 'SALE-MB-005', address: '1500 Bay Rd Unit 802S', salePrice: 695000, saleDate: new Date('2026-03-05'), squareFeet: 1095, pricePerSqFt: 634.70, bedrooms: 2, bathrooms: 2.0, yearBuilt: 1968, daysOnMarket: 18, latitude: 25.788103, longitude: -80.146011, source: 'mls' },
    { sourceId: 'SALE-MB-006', address: '1100 West Ave Unit 622', salePrice: 540000, saleDate: new Date('2026-03-22'), squareFeet: 778, pricePerSqFt: 694.09, bedrooms: 1, bathrooms: 1.0, yearBuilt: 1964, daysOnMarket: 12, latitude: 25.782551, longitude: -80.141853, source: 'county_recorder' },
  ];

  for (const s of sales) {
    const existing = await prisma.comparableSale.findFirst({
      where: { source: s.source, sourceId: s.sourceId },
    });
    if (existing) continue;
    await prisma.comparableSale.create({
      data: {
        countyId: county.id,
        address: s.address,
        city: 'Miami Beach',
        state: 'FL',
        zip: '33139',
        propertyType: 'condo',
        units: 1,
        bedrooms: s.bedrooms,
        bathrooms: s.bathrooms,
        squareFeet: s.squareFeet,
        yearBuilt: s.yearBuilt,
        salePrice: s.salePrice,
        saleDate: s.saleDate,
        pricePerSqFt: s.pricePerSqFt,
        daysOnMarket: s.daysOnMarket,
        source: s.source,
        sourceId: s.sourceId,
        latitude: s.latitude,
        longitude: s.longitude,
      },
    });
  }

  // Market bands — price, price/sqft, cap rate, rent.
  // Find-or-create per (countyId, propertyType, bandType, asOfDate).
  const asOfDate = new Date('2026-04-01');
  const bands: Array<{ bandType: string; lowValue: number; midValue: number; highValue: number; sampleSize: number }> = [
    { bandType: 'price', lowValue: 480000, midValue: 575000, highValue: 740000, sampleSize: 24 },
    { bandType: 'price_per_sqft', lowValue: 590, midValue: 628, highValue: 695, sampleSize: 21 },
    { bandType: 'cap_rate', lowValue: 4.35, midValue: 4.65, highValue: 5.05, sampleSize: 19 },
    { bandType: 'rent', lowValue: 3300, midValue: 3850, highValue: 4650, sampleSize: 17 },
  ];

  for (const b of bands) {
    const existing = await prisma.marketBand.findFirst({
      where: { countyId: county.id, propertyType: 'condo', bandType: b.bandType, asOfDate },
    });
    if (existing) continue;
    await prisma.marketBand.create({
      data: {
        countyId: county.id,
        propertyType: 'condo',
        bandType: b.bandType,
        lowValue: b.lowValue,
        midValue: b.midValue,
        highValue: b.highValue,
        confidenceLevel: 'moderate',
        sampleSize: b.sampleSize,
        asOfDate,
        source: 'seed',
      },
    });
  }

  // Latest market snapshot for the county/condo combo
  const snapshotDate = new Date('2026-04-01');
  const existingSnapshot = await prisma.marketDataSnapshot.findFirst({
    where: { countyId: county.id, propertyType: 'condo', snapshotDate },
  });
  if (!existingSnapshot) {
    await prisma.marketDataSnapshot.create({
      data: {
        countyId: county.id,
        propertyType: 'condo',
        snapshotDate,
        medianSalePrice: 575000,
        medianPriceSqFt: 628,
        medianRent: 3850,
        medianDom: 26,
        inventoryMonths: 5.4,
        yoyAppreciation: 2.8,
        activeListings: 312,
        closedSales: 64,
        source: 'seed',
      },
    });
  }

  console.log(`[seed] county=${county.name} sales=${sales.length} bands=${bands.length} dealId=${deal.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
