# Seed Data

This repo includes a minimal offline dataset for one lender-relevant county:

- County: Miami-Dade County, Florida (`countyFips=12086`)
- Submarket: Miami Beach South (`zip=33139`)
- Property type emphasis: `condo`

## What gets seeded

- `GeoCounty`: county geography and rule metadata
- `GeoSubmarket`: one ZIP/census-tract level micro-market
- `GeoRegulation`: flood and STR notes
- `MarketRentComp`: three recent rent comps
- `MarketSaleComp`: three recent sale comps
- `MarketCapRateBand`: one submarket cap-rate range
- `MarketPpsfBand`: one submarket PPSF range
- `SubjectProperty` and `Deal`: one linked subject/deal pair for development
- `AppraisalLabel`: one human appraisal label
- `RealizedOutcome`: one realized sale outcome
- `ModelCalibrationSnapshot`: one county/product calibration snapshot
