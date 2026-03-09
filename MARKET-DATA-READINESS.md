# Market Data Readiness

## COO Directive

The platform is not market-ready until rent and sale data can be defended in front of credit, capital markets, and outside diligence. "Scraping" alone is not an acceptable production strategy for lender-grade valuation.

## Source hierarchy

Use sources in this order:

1. County recorder / assessor / tax collector records for sale transfers and tax facts
2. MLS or licensed listing feed for on-market and closed sale comp detail
3. Contracted rental and AVM vendors for rent comp density and normalization
4. Municipality and FEMA/state datasets for flood, zoning, STR, and coastal overlays
5. Internal appraisal labels and realized outcomes for calibration

## Production rule

Every market datapoint must carry:

- source name
- source record identifier
- effective date
- observed timestamp
- raw payload snapshot or lineage reference
- county and submarket assignment

If any of the above is missing, the record is incomplete and must not be treated as lender-grade.

## Scraping policy

Allowed:

- scraping public government datasets where terms permit automated collection
- scheduled extraction from county public records portals where legal and operationally stable
- capture of public zoning and STR ordinance pages for change detection

Not sufficient by itself:

- consumer listing site scraping as the primary truth source
- one-off browser scraping without source lineage
- using scraped rent estimates without effective dates, filters, and validation rules

## QA gates before valuation use

Sale comp QA:

- reject negative or zero sale price
- reject impossible price-per-square-foot
- reject stale records outside configured lookback windows
- flag comp clusters with insufficient density for county/product type

Rent comp QA:

- reject negative or zero asking rent
- reject impossible rent-per-square-foot
- require enough local comp count before using as primary basis
- flag listings that are too old, duplicated, or geographically weak

Band QA:

- cap-rate and PPSF bands must have low <= median <= high
- require sample size storage
- keep methodology and derivation version with each band snapshot

## Operating model

- ingest raw records into county-level tables first
- normalize into valuation-facing schemas second
- validate and score data quality third
- expose only validated records to the valuation engine
- preserve raw lineage for audit and reprocessing

## Release standard

Before going live in a county:

1. Seed and validate one county end to end
2. Backfill at least 6-12 months of sale and rent history
3. Compare model outputs against human appraisal labels
4. Measure realized-outcome error by county and product type
5. Downgrade confidence automatically when data is thin or volatile
