# Seed Data

Run with `npm run db:seed`. Idempotent — safe to re-run.

Seeds one lender-relevant county so the appraisal pipeline has comps and bands
to underwrite against:

- **County:** Miami-Dade County, Florida (`fips=12086`)
- **ZIP focus:** 33139 (Miami Beach)
- **Property type:** `condo`

## What gets seeded

| Model | Records | Dedupe key |
|---|---|---|
| `Person` (`county-seed@818capital.com`) | 1 | email (upsert) |
| `County` (Miami-Dade) | 1 | fips (upsert) |
| `Deal` (channel: `seed`) | 1 | find-or-create on (channel, propertyZip) |
| `ComparableSale` | 6 | (source, sourceId) — skip if found |
| `MarketBand` | 4 (price, price_per_sqft, cap_rate, rent) | (countyId, propertyType, bandType, asOfDate) |
| `MarketDataSnapshot` | 1 | (countyId, propertyType, snapshotDate) |

After seeding, `POST /api/appraisals/quick` with state `FL`, ZIP `33139`,
property type `condo` returns 6 comps, all four bands, the snapshot, and a
high data-quality score. Submitting any other state/ZIP combo returns empty
market data so you can verify the data-quality flags fire.
