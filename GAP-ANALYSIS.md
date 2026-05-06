# Gap Analysis — Consensus vs. Bricked.ai

Snapshot of where Consensus stands today against the [Bricked.ai](https://bricked.ai) workflow shape (address → appraiser-style comps + ARV + line-item rehab → underwrite in seconds), written as input for prioritization on `claude/bricked-ai-vision-QphL1`.

Legend: ✅ in repo · 🟡 partial · ❌ missing · 📄 spec-only (no code)

---

## 1. Data layer

| Capability | Status | Notes |
|---|---|---|
| County / FIPS reference | ✅ | `County` model + Miami-Dade seed |
| Sale comp ingestion | ✅ | `ComparableSale` + `marketVendors.genericAdapter` + `POST /api/appraisals/ingest/comps` |
| Market bands (price, PPSF, cap rate, rent) | ✅ | `MarketBand` + `MarketDataSnapshot` |
| Source / effective-date lineage | 🟡 | `source`, `sourceId`, `rawPayload` columns exist; not every ingest path enforces them |
| Submarket / ZIP-level boundaries | 🟡 | `zip` index on `ComparableSale`; no dedicated `Submarket` model yet |
| Rent comps | ❌ | `marketContext.medianRent` exists but no `RentComp` table |
| Vendor adapters (MLS / county recorder / FEMA / STR overlays) | 📄 | Generic adapter only; live vendor adapters not implemented |
| QA gates per `MARKET-DATA-READINESS.md` | 🟡 | `dataValidation.ts` covers basics; full reject/flag matrix not centralized |
| Calibration snapshots / appraisal labels / realized outcomes | ❌ | Mentioned in `SEED-DATA.md` but no Prisma models in schema |

## 2. Valuation engine

| Capability | Status | Notes |
|---|---|---|
| `valuationTypes.ts` shared types | ✅ | `AiAppraisalResult`, `MarketContext`, `ValueEstimate`, etc. |
| Lane-aware orchestration (`valuationService`) | ✅ | DSCR / Flip / STR / Multifamily |
| AI narrative + JSON valuation (`aiAppraisal`) | ✅ | GPT-4o + template fallback |
| Risk guardrails + range widening | ✅ | `riskGuardrails.assessRisk` + `adjustValueForDataQuality` |
| Comp similarity scoring + adjustments | 🟡 | Type fields exist (`similarityScore`, `adjustments`) but `marketDataService` doesn't compute either |
| Submarket / boundary weighting in comp selection | ❌ | Current pull is `countyId` + optional `zip` filter, ordered by date |
| Buyer-behavior weighting (DOM trends, list-vs-sale ratio) | ❌ | DOM stored per comp but not used in selection scoring |
| Address-first quick path (no `dealId` required) | ❌ | `runAppraisal({ dealId })` is the only entry point |
| Calibration / human-label feedback loop | ❌ | No models; no service |

## 3. Rehab / repair estimation

| Capability | Status | Notes |
|---|---|---|
| Borrower-entered `rehabBudget` | ✅ | `FlipForm.tsx` field |
| **Line-item localized rehab estimate** | ❌ | **No service exists.** This is the headline Bricked feature Consensus does not have. |
| Cost basis by county / labor index | ❌ | No labor/material cost table |
| Scope output for GCs | ❌ | — |

## 4. Lender output

| Capability | Status | Notes |
|---|---|---|
| `LenderAppraisalPackage` JSON | ✅ | `lender-output/lenderOutputTypes.ts` + `lenderOutputMapper.ts` |
| Borrower-facing summary | ✅ | `BorrowerFacingSummary` + `buildBorrowerFacingSummary` |
| `LenderPdfDocument` tree | ✅ | `lenderPdfLayout.ts` (data-only, no renderer) |
| PDF renderer wired (e.g., Puppeteer / pdf-lib) | ❌ | Tree only; not rasterized |
| Rehab block in lender package | ❌ | Schema doesn't include rehab estimate |
| `/internal/lender-package` UI | ✅ | Exists |

## 5. UX / front-end

| Capability | Status | Notes |
|---|---|---|
| Lane-specific intake forms | ✅ | DSCR, Flip, STR, Multifamily on `/get-quote` |
| `/internal/match` (lender match preview) | ✅ | — |
| `/internal/lender-package` (lender output preview) | ✅ | — |
| **Address-first underwrite page** | ❌ | The Bricked headline UX. Not built. |
| Result UI: ARV bands, comp list with lineage chips, rehab line-items, risk flags | ❌ | — |

## 6. Routes

| Route | Status |
|---|---|
| `POST /api/deals` (full intake flow) | ✅ |
| `POST /api/deals/triage` (triage-only) | ✅ |
| `POST /api/appraisals/run` (deal-based) | ✅ |
| `POST /api/appraisals/ingest/comps` | ✅ |
| `POST /api/appraisals/ingest/snapshots` | ✅ |
| `POST /api/marketData/context` | 🟡 (router exists, not mounted in `server.ts`) |
| `POST /api/chat` | 🟡 (router exists, not mounted) |
| **`POST /api/appraisals/quick`** (address-first) | ❌ |
| **`POST /api/appraisals/rehab`** (rehab-only) | ❌ |

## 7. Documentation drift

- `BUILD-STATUS.md` reads as if appraisal services don't exist yet — they do, and have for at least one cycle. Either update or delete that section.
- `AI-APPRAISAL-AGENTS.md` walks through running three Claude agents to produce code that already exists in the repo. Keep as a historical build doc or remove.
- `SEED-DATA.md` lists models (`SubjectProperty`, `AppraisalLabel`, `RealizedOutcome`, `ModelCalibrationSnapshot`, `GeoSubmarket`, `GeoRegulation`) that are **not in `schema.prisma`**. Either add the models or remove from seed doc.

---

## Priority order to close the gap

1. **Rehab estimator service** (biggest user-visible gap; nothing in repo today).
2. **Address-first quick path** — `runQuickAppraisal()` + `POST /api/appraisals/quick` reusing existing `marketDataService` / `aiAppraisal` / `riskGuardrails` / new `rehabEstimator`.
3. **Front-end `/underwrite` page** — single input, result panel showing ARV / comps / rehab / risk flags.
4. Wire rehab block into `LenderAppraisalPackage` and PDF tree.
5. Mount `marketDataRouter` and `chatRouter` in `server.ts` (one-line fixes).
6. Add `Submarket` model + buyer-behavior weighting to comp selection (closes appraiser-style comp gap).
7. Resolve documentation drift (BUILD-STATUS, AI-APPRAISAL-AGENTS, SEED-DATA).
8. Add calibration loop models when first county has realized outcomes.
