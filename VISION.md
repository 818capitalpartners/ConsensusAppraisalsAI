# Vision — Consensus Appraisals AI

**One-line:** Type an address, get a lender-grade underwrite in under 30 seconds — appraiser-style comps, ARV, and a localized line-item rehab estimate.

**Reference product:** [Bricked.ai](https://bricked.ai). Consensus targets the same workflow shape (address → comps + ARV + rehab → go/no-go) layered on top of the existing 818 Capital lender stack so the same pipe also produces a lender-ready package.

---

## Who it's for

| User | What they need |
|------|----------------|
| Investors / flippers | 15-second go/no-go before submitting an offer |
| Wholesalers | Justify spreads with comp + ARV evidence |
| Agents | List-pricing and negotiation backed by appraiser-style comps |
| Contractors / GCs | Scope + cost alignment from line-item rehab |
| **818 Capital ops (internal)** | The same engine produces the lender package + risk flags for credit committee |

The internal lender output is the differentiator versus pure consumer tools — same underwrite, two views.

---

## Core promise

1. **Single input.** Address (+ optional condition / target use). No multi-form lane intake required for the quick path.
2. **Appraiser-style comps.** Selection weighs condition, submarket boundary, and buyer behavior — not just nearest/most-recent.
3. **Two values.** As-is and stabilized (ARV) ranges, each with a confidence score and an explicit methodology list.
4. **Line-item rehab.** Localized labor + materials, not national averages. Output is line-item enough to brief a GC.
5. **Lender-grade lineage.** Every datapoint carries source, effective date, and submarket assignment (per `MARKET-DATA-READINESS.md`). Thin data → wider ranges + lower confidence + risk flags. No silent guesses.
6. **Two outputs from one run.** Borrower-facing summary + lender appraisal package (JSON + PDF tree).

---

## Surface area

### Public / borrower path
- `POST /api/appraisals/quick` — body: `{ address, propertyType?, condition?, targetUse? }` → `QuickAppraisalResult`
- `GET /underwrite` — address-first single-input UI returning ARV, comps, rehab, risk flags

### Internal / lender path (already exists)
- `POST /api/appraisals/run` — body: `{ dealId }` → full `AiAppraisalResult` stored on Deal
- Lender package mappers (`lender-output/`) → `LenderAppraisalPackage` JSON + `LenderPdfDocument` tree
- `POST /api/appraisals/ingest/comps` and `/ingest/snapshots` — vendor data ingestion

The quick path resolves an address to a lightweight property record, runs the same `marketDataService` + `aiAppraisal` + `riskGuardrails` + `rehabEstimator` pipeline as the deal path, but does not require a Person/Deal record.

---

## What "lender-grade" means here

Borrowed from `MARKET-DATA-READINESS.md` and non-negotiable:

- Every market datapoint carries source, source ID, effective date, observed timestamp, raw payload lineage, county and submarket assignment.
- Sale-comp QA: reject negative/zero prices, impossible PPSF, stale records outside lookback windows; flag thin density.
- Bands enforce `low ≤ median ≤ high`, store sample size, keep methodology version.
- When data is thin → ranges widen, confidence drops, risk flags fire automatically (already implemented in `riskGuardrails.adjustValueForDataQuality`).

---

## What's intentionally not in the Bricked-style product

- Multi-form lane intake (DSCR / Flip / STR / Multifamily) — kept as a separate inbound-leads path on `/get-quote` for 818's existing funnel.
- Lender matching from the quick path — quick path returns valuation only; lender match requires the deal record.
- Live MLS-grade comp depth in v1 — seeded county-level data is the v1 floor; vendor adapters (`marketVendors.ts`) are the upgrade path.

---

## Success criteria

1. Address-only input completes in p95 < 30s with at least one band or three comps available.
2. ARV range width tracks data quality: thin data → visibly wider ranges, lower confidence, explicit risk flags.
3. Rehab estimate is line-item (kitchen / bath / mech / roof / cosmetic / contingency) with localized cost basis, not a single number.
4. Same pipeline output, two views: borrower summary strips internal notes; lender package retains full lineage.
5. Every comp shown to the user has source + effective date.
