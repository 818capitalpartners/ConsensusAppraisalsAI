import { prisma } from '@818capital/db';

/**
 * Market Vendor Adapters — vendor-agnostic interface for ingesting external data.
 * Each vendor maps their raw payload into the internal ComparableSale / MarketDataSnapshot shapes.
 */

// ─── Vendor Interface ────────────────────────────────────

export interface VendorCompRecord {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  propertyType: string;
  units?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  lotSize?: number;
  salePrice: number;
  saleDate: string; // YYYY-MM-DD
  pricePerSqFt?: number;
  daysOnMarket?: number;
  listPrice?: number;
  sourceId?: string;
  latitude?: number;
  longitude?: number;
}

export interface VendorSnapshotRecord {
  propertyType: string;
  snapshotDate: string; // YYYY-MM-DD
  medianSalePrice?: number;
  medianPriceSqFt?: number;
  medianRent?: number;
  medianDom?: number;
  inventoryMonths?: number;
  yoyAppreciation?: number;
  activeListings?: number;
  closedSales?: number;
}

export interface VendorAdapter {
  name: string;
  parseComps(rawPayload: unknown): VendorCompRecord[];
  parseSnapshots(rawPayload: unknown): VendorSnapshotRecord[];
}

// ─── Generic / Manual Adapter ────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export const genericAdapter: VendorAdapter = {
  name: 'generic',

  parseComps(rawPayload: unknown): VendorCompRecord[] {
    if (!Array.isArray(rawPayload)) return [];
    return rawPayload.filter(isRecord).map((r) => ({
      address: String(r.address ?? ''),
      city: r.city ? String(r.city) : undefined,
      state: r.state ? String(r.state) : undefined,
      zip: r.zip ? String(r.zip) : undefined,
      propertyType: String(r.propertyType ?? r.property_type ?? 'SFR'),
      units: r.units ? Number(r.units) : undefined,
      bedrooms: r.bedrooms ? Number(r.bedrooms) : undefined,
      bathrooms: r.bathrooms ? Number(r.bathrooms) : undefined,
      squareFeet: Number(r.squareFeet ?? r.square_feet ?? r.sqft) || undefined,
      yearBuilt: r.yearBuilt ? Number(r.yearBuilt) : undefined,
      lotSize: r.lotSize ? Number(r.lotSize) : undefined,
      salePrice: Number(r.salePrice ?? r.sale_price ?? r.price) || 0,
      saleDate: String(r.saleDate ?? r.sale_date ?? r.closedDate ?? new Date().toISOString().split('T')[0]),
      pricePerSqFt: r.pricePerSqFt ? Number(r.pricePerSqFt) : undefined,
      daysOnMarket: r.daysOnMarket ? Number(r.daysOnMarket) : undefined,
      listPrice: r.listPrice ? Number(r.listPrice) : undefined,
      sourceId: r.sourceId ? String(r.sourceId) : undefined,
      latitude: r.latitude ? Number(r.latitude) : undefined,
      longitude: r.longitude ? Number(r.longitude) : undefined,
    }));
  },

  parseSnapshots(rawPayload: unknown): VendorSnapshotRecord[] {
    if (!Array.isArray(rawPayload)) return [];
    return rawPayload.filter(isRecord).map((r) => ({
      propertyType: String(r.propertyType ?? r.property_type ?? 'SFR'),
      snapshotDate: String(r.snapshotDate ?? r.snapshot_date ?? new Date().toISOString().split('T')[0]),
      medianSalePrice: r.medianSalePrice ? Number(r.medianSalePrice) : undefined,
      medianPriceSqFt: r.medianPriceSqFt ? Number(r.medianPriceSqFt) : undefined,
      medianRent: r.medianRent ? Number(r.medianRent) : undefined,
      medianDom: r.medianDom ? Number(r.medianDom) : undefined,
      inventoryMonths: r.inventoryMonths ? Number(r.inventoryMonths) : undefined,
      yoyAppreciation: r.yoyAppreciation ? Number(r.yoyAppreciation) : undefined,
      activeListings: r.activeListings ? Number(r.activeListings) : undefined,
      closedSales: r.closedSales ? Number(r.closedSales) : undefined,
    }));
  },
};

// ─── Ingestion Functions ─────────────────────────────────

export async function ingestComps(
  countyFips: string,
  adapter: VendorAdapter,
  rawPayload: unknown,
): Promise<{ inserted: number; skipped: number }> {
  const county = await prisma.county.findUnique({ where: { fips: countyFips } });
  if (!county) throw new Error(`County not found for FIPS: ${countyFips}`);

  const records = adapter.parseComps(rawPayload);
  let inserted = 0;
  let skipped = 0;

  for (const r of records) {
    if (!r.address || r.salePrice <= 0) {
      skipped++;
      continue;
    }

    const pricePerSqFt = r.pricePerSqFt ?? (r.squareFeet && r.squareFeet > 0 ? r.salePrice / r.squareFeet : null);

    await prisma.comparableSale.create({
      data: {
        countyId: county.id,
        address: r.address,
        city: r.city ?? null,
        state: r.state ?? county.state,
        zip: r.zip ?? null,
        propertyType: r.propertyType,
        units: r.units ?? null,
        bedrooms: r.bedrooms ?? null,
        bathrooms: r.bathrooms ?? null,
        squareFeet: r.squareFeet ?? null,
        yearBuilt: r.yearBuilt ?? null,
        lotSize: r.lotSize ?? null,
        salePrice: r.salePrice,
        saleDate: new Date(r.saleDate),
        pricePerSqFt: pricePerSqFt ?? null,
        daysOnMarket: r.daysOnMarket ?? null,
        listPrice: r.listPrice ?? null,
        source: adapter.name,
        sourceId: r.sourceId ?? null,
        latitude: r.latitude ?? null,
        longitude: r.longitude ?? null,
        rawPayload: r as unknown as Record<string, unknown>,
      },
    });
    inserted++;
  }

  return { inserted, skipped };
}

export async function ingestSnapshots(
  countyFips: string,
  adapter: VendorAdapter,
  rawPayload: unknown,
): Promise<{ inserted: number }> {
  const county = await prisma.county.findUnique({ where: { fips: countyFips } });
  if (!county) throw new Error(`County not found for FIPS: ${countyFips}`);

  const records = adapter.parseSnapshots(rawPayload);
  let inserted = 0;

  for (const r of records) {
    await prisma.marketDataSnapshot.create({
      data: {
        countyId: county.id,
        propertyType: r.propertyType,
        snapshotDate: new Date(r.snapshotDate),
        medianSalePrice: r.medianSalePrice ?? null,
        medianPriceSqFt: r.medianPriceSqFt ?? null,
        medianRent: r.medianRent ?? null,
        medianDom: r.medianDom ?? null,
        inventoryMonths: r.inventoryMonths ?? null,
        yoyAppreciation: r.yoyAppreciation ?? null,
        activeListings: r.activeListings ?? null,
        closedSales: r.closedSales ?? null,
        rawPayload: r as unknown as Record<string, unknown>,
        source: adapter.name,
      },
    });
    inserted++;
  }

  return { inserted };
}

// ─── Vendor Registry ─────────────────────────────────────

const vendorRegistry: Record<string, VendorAdapter> = {
  generic: genericAdapter,
};

export function registerVendor(adapter: VendorAdapter): void {
  vendorRegistry[adapter.name] = adapter;
}

export function getVendor(name: string): VendorAdapter {
  const adapter = vendorRegistry[name];
  if (!adapter) throw new Error(`Vendor adapter not found: ${name}. Available: ${Object.keys(vendorRegistry).join(', ')}`);
  return adapter;
}
