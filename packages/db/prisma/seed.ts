import 'dotenv/config';

import {
  CollateralPropertyType,
  CompSourceType,
  DataQuality,
  GeoRegulationType,
  OutcomeType,
  PersonType,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const person = await prisma.person.upsert({
    where: { email: 'county-seed@818capital.com' },
    update: {
      firstName: 'County',
      lastName: 'Seed',
      company: '818 Capital',
    },
    create: {
      type: PersonType.investor,
      firstName: 'County',
      lastName: 'Seed',
      email: 'county-seed@818capital.com',
      company: '818 Capital',
    },
  });

  const subjectProperty = await prisma.subjectProperty.upsert({
    where: { externalId: 'SUBJECT-MB-001' },
    update: {
      state: 'FL',
      countyFips: '12086',
      zip: '33139',
      latitude: 25.7839,
      longitude: -80.1417,
      propertyType: CollateralPropertyType.condo,
      addressLine1: '1100 West Ave Unit 1401',
      city: 'Miami Beach',
      censusTract: '12086004001',
    },
    create: {
      externalId: 'SUBJECT-MB-001',
      state: 'FL',
      countyFips: '12086',
      zip: '33139',
      latitude: 25.7839,
      longitude: -80.1417,
      propertyType: CollateralPropertyType.condo,
      addressLine1: '1100 West Ave Unit 1401',
      city: 'Miami Beach',
      censusTract: '12086004001',
    },
  });

  const existingDeal = await prisma.deal.findFirst({
    where: { channel: 'seed', propertyZip: '33139' },
  });

  const deal =
    existingDeal ??
    (await prisma.deal.create({
      data: {
        personId: person.id,
        subjectPropertyId: subjectProperty.id,
        productLane: 'dscr',
        leadType: 'investor',
        channel: 'seed',
        propertyAddress: subjectProperty.addressLine1,
        propertyCity: subjectProperty.city,
        propertyState: subjectProperty.state,
        propertyZip: subjectProperty.zip,
        propertyType: 'condo',
        units: 1,
      },
    }));

  const county = await prisma.geoCounty.upsert({
    where: { countyFips: '12086' },
    update: {
      countyName: 'Miami-Dade County',
      state: 'FL',
      isCoastal: true,
      defaultFloodRiskLevel: 'elevated',
      taxRegimeCode: 'FL-SOH',
      homesteadRuleSummary: 'Save Our Homes annual assessment growth cap may suppress taxable value drift.',
    },
    create: {
      countyFips: '12086',
      countyName: 'Miami-Dade County',
      state: 'FL',
      stateFips: '12',
      msaCode: '33100',
      timezone: 'America/New_York',
      isCoastal: true,
      defaultFloodRiskLevel: 'elevated',
      taxRegimeCode: 'FL-SOH',
      homesteadRuleSummary: 'Save Our Homes annual assessment growth cap may suppress taxable value drift.',
    },
  });

  const submarket = await prisma.geoSubmarket.upsert({
    where: {
      geoCountyId_slug: {
        geoCountyId: county.id,
        slug: 'miami-beach-south',
      },
    },
    update: {
      name: 'Miami Beach South',
      censusTract: '12086004001',
      zip: '33139',
      city: 'Miami Beach',
      neighborhood: 'South Beach',
    },
    create: {
      geoCountyId: county.id,
      countyFips: county.countyFips,
      state: county.state,
      name: 'Miami Beach South',
      slug: 'miami-beach-south',
      censusTract: '12086004001',
      zip: '33139',
      city: 'Miami Beach',
      neighborhood: 'South Beach',
    },
  });

  await prisma.geoRegulation.createMany({
    data: [
      {
        geoCountyId: county.id,
        geoSubmarketId: submarket.id,
        countyFips: county.countyFips,
        state: county.state,
        zip: '33139',
        regulationType: GeoRegulationType.flood,
        jurisdictionName: 'Miami-Dade County',
        code: 'FEMA-AE',
        title: 'Special Flood Hazard Area Review',
        summary: 'Subject may require elevation certificate and flood insurance review before final credit sign-off.',
        notes: 'Use parcel-level flood panel verification before commitment.',
        floodZone: 'AE',
        coastalRiskFlag: true,
        effectiveDate: new Date('2025-01-01'),
        sourceName: 'Local mock seed',
      },
      {
        geoCountyId: county.id,
        geoSubmarketId: submarket.id,
        countyFips: county.countyFips,
        state: county.state,
        zip: '33139',
        regulationType: GeoRegulationType.short_term_rental,
        jurisdictionName: 'Miami Beach',
        code: 'MB-STR-ORD',
        title: 'Short-Term Rental Restriction Overlay',
        summary: 'Short-term rental use is restricted in many residential zones and condo rules may be stricter than city code.',
        notes: 'Underwriting should require municipality and association verification for STR assumptions.',
        strAllowed: false,
        strMinNightStay: 30,
        effectiveDate: new Date('2025-01-01'),
        sourceName: 'Local mock seed',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.marketRentComp.createMany({
    data: [
      {
        geoCountyId: county.id,
        geoSubmarketId: submarket.id,
        countyFips: county.countyFips,
        state: county.state,
        zip: '33139',
        propertyType: CollateralPropertyType.condo,
        source: CompSourceType.internal,
        vendorListingId: 'RENT-MB-001',
        addressLine1: '1100 West Ave Unit 622',
        city: 'Miami Beach',
        latitude: 25.782551,
        longitude: -80.141853,
        beds: 1,
        baths: 1.0,
        buildingSqft: 778,
        yearBuilt: 1964,
        askingRent: 3450,
        rentPerSqft: 4.4344,
        leaseTermMonths: 12,
        daysOnMarket: 18,
        distanceMiles: 0.42,
        effectiveDate: new Date('2026-02-15'),
        sourceUrl: 'mock://rent/RENT-MB-001',
      },
      {
        geoCountyId: county.id,
        geoSubmarketId: submarket.id,
        countyFips: county.countyFips,
        state: county.state,
        zip: '33139',
        propertyType: CollateralPropertyType.condo,
        source: CompSourceType.internal,
        vendorListingId: 'RENT-MB-002',
        addressLine1: '1000 West Ave Unit 627',
        city: 'Miami Beach',
        latitude: 25.781812,
        longitude: -80.141277,
        beds: 1,
        baths: 1.0,
        buildingSqft: 852,
        yearBuilt: 1968,
        askingRent: 3600,
        rentPerSqft: 4.2254,
        leaseTermMonths: 12,
        daysOnMarket: 9,
        distanceMiles: 0.35,
        effectiveDate: new Date('2026-02-18'),
        sourceUrl: 'mock://rent/RENT-MB-002',
      },
      {
        geoCountyId: county.id,
        geoSubmarketId: submarket.id,
        countyFips: county.countyFips,
        state: county.state,
        zip: '33139',
        propertyType: CollateralPropertyType.condo,
        source: CompSourceType.vendor_a,
        vendorListingId: 'RENT-MB-003',
        addressLine1: '1500 Bay Rd Unit 726S',
        city: 'Miami Beach',
        latitude: 25.788103,
        longitude: -80.146011,
        beds: 2,
        baths: 2.0,
        buildingSqft: 1030,
        yearBuilt: 1960,
        askingRent: 4650,
        rentPerSqft: 4.5146,
        leaseTermMonths: 12,
        daysOnMarket: 14,
        distanceMiles: 0.81,
        effectiveDate: new Date('2026-02-20'),
        sourceUrl: 'mock://rent/RENT-MB-003',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.marketSaleComp.createMany({
    data: [
      {
        geoCountyId: county.id,
        geoSubmarketId: submarket.id,
        countyFips: county.countyFips,
        state: county.state,
        zip: '33139',
        propertyType: CollateralPropertyType.condo,
        source: CompSourceType.county_recorder,
        vendorSaleId: 'SALE-MB-001',
        addressLine1: '1200 West Ave Unit 1122',
        city: 'Miami Beach',
        latitude: 25.783327,
        longitude: -80.142106,
        beds: 1,
        baths: 1.0,
        buildingSqft: 837,
        yearBuilt: 1965,
        salePrice: 525000,
        pricePerSqft: 627.24,
        capRate: 0.0475,
        noi: 24937.5,
        distanceMiles: 0.38,
        saleDate: new Date('2025-12-12'),
        effectiveDate: new Date('2025-12-12'),
        sourceUrl: 'mock://sale/SALE-MB-001',
      },
      {
        geoCountyId: county.id,
        geoSubmarketId: submarket.id,
        countyFips: county.countyFips,
        state: county.state,
        zip: '33139',
        propertyType: CollateralPropertyType.condo,
        source: CompSourceType.mls,
        vendorSaleId: 'SALE-MB-002',
        addressLine1: '1330 West Ave Unit 913',
        city: 'Miami Beach',
        latitude: 25.784933,
        longitude: -80.143294,
        beds: 1,
        baths: 1.5,
        buildingSqft: 848,
        yearBuilt: 1974,
        salePrice: 548000,
        pricePerSqft: 646.23,
        capRate: 0.0462,
        noi: 25317.6,
        distanceMiles: 0.47,
        saleDate: new Date('2026-01-16'),
        effectiveDate: new Date('2026-01-16'),
        sourceUrl: 'mock://sale/SALE-MB-002',
      },
      {
        geoCountyId: county.id,
        geoSubmarketId: submarket.id,
        countyFips: county.countyFips,
        state: county.state,
        zip: '33139',
        propertyType: CollateralPropertyType.condo,
        source: CompSourceType.internal,
        vendorSaleId: 'SALE-MB-003',
        addressLine1: '100 Lincoln Rd Unit 1532',
        city: 'Miami Beach',
        latitude: 25.790845,
        longitude: -80.130099,
        beds: 2,
        baths: 2.0,
        buildingSqft: 1190,
        yearBuilt: 1965,
        salePrice: 735000,
        pricePerSqft: 617.65,
        capRate: 0.0451,
        noi: 33148.5,
        distanceMiles: 1.22,
        saleDate: new Date('2026-02-03'),
        effectiveDate: new Date('2026-02-03'),
        sourceUrl: 'mock://sale/SALE-MB-003',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.marketCapRateBand.create({
    data: {
      geoCountyId: county.id,
      geoSubmarketId: submarket.id,
      countyFips: county.countyFips,
      state: county.state,
      zip: '33139',
      propertyType: CollateralPropertyType.condo,
      effectiveDate: new Date('2026-02-01'),
      lowRate: 0.0435,
      medianRate: 0.0465,
      highRate: 0.0505,
      sampleSize: 19,
      dataQuality: DataQuality.good,
      methodology: 'Seeded from local mock comps and synthetic lender guardrails.',
    },
  }).catch(() => null);

  await prisma.marketPpsfBand.create({
    data: {
      geoCountyId: county.id,
      geoSubmarketId: submarket.id,
      countyFips: county.countyFips,
      state: county.state,
      zip: '33139',
      propertyType: CollateralPropertyType.condo,
      effectiveDate: new Date('2026-02-01'),
      lowPpsf: 590,
      medianPpsf: 628,
      highPpsf: 675,
      sampleSize: 21,
      dataQuality: DataQuality.good,
      methodology: 'Seeded from recent sale comp cluster.',
    },
  }).catch(() => null);

  await prisma.appraisalLabel.create({
    data: {
      dealId: deal.id,
      subjectPropertyId: subjectProperty.id,
      countyFips: '12086',
      state: 'FL',
      zip: '33139',
      propertyType: CollateralPropertyType.condo,
      appraiserName: 'Mock Certified Appraiser',
      appraiserLicense: 'FL-RD-000001',
      appraisedValue: 560000,
      effectiveDate: new Date('2026-02-07'),
      reportDate: new Date('2026-02-10'),
      adjustmentsJson: {
        conditionAdjustment: 5000,
        floorAdjustment: -3000,
        viewAdjustment: 12000,
      },
      sourceDocRef: 'mock://appraisal/DEAL-MB-001',
    },
  }).catch(() => null);

  await prisma.realizedOutcome.create({
    data: {
      dealId: deal.id,
      subjectPropertyId: subjectProperty.id,
      countyFips: '12086',
      state: 'FL',
      zip: '33139',
      propertyType: CollateralPropertyType.condo,
      outcomeType: OutcomeType.sale,
      amount: 552500,
      outcomeDate: new Date('2026-03-01'),
      effectiveDate: new Date('2026-03-01'),
      sourceName: 'Mock closing file',
      sourceRef: 'mock://closing/DEAL-MB-001',
      notes: 'Closed slightly below appraisal amid rising insurance concerns.',
    },
  }).catch(() => null);

  await prisma.modelCalibrationSnapshot.create({
    data: {
      geoCountyId: county.id,
      countyFips: county.countyFips,
      state: county.state,
      zip: '33139',
      propertyType: CollateralPropertyType.condo,
      productType: 'bridge',
      effectiveDate: new Date('2026-03-01'),
      sampleSize: 42,
      medianModelToHumanGapPct: -0.0125,
      medianModelToRealizedGapPct: -0.0182,
      p90AbsModelGapPct: 0.074,
      confidenceScore: 0.78,
      volatilityFlag: true,
      notes: 'Insurance and flood-cost repricing widened realized outcome dispersion.',
    },
  }).catch(() => null);
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
