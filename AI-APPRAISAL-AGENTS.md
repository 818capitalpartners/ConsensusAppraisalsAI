# 818 AI Appraisal Agents - Dev Workflow

This doc explains how to run the three Claude Code agents in parallel to build and iterate on the AI Appraisal Cloud.

Agents (each has its own `.claude.json`):

1. Data Platform Agent - `claude-data-platform.json`
2. Valuation Engine Agent - `claude-valuation-engine.json`
3. Lender Output Agent - `claude-lender-output.json`

All agents assume the existing 818 monorepo structure with `packages/db`, `packages/api`, `packages/web` and the Prisma/Express/Next.js stack described in `BUILD-STATUS.md`.

---

## Folder and config setup

Place the configs at repo root:

- `./claude-data-platform.json`
- `./claude-valuation-engine.json`
- `./claude-lender-output.json`

Keep `BUILD-STATUS.md` at root so agents can infer current architecture and constraints.

---

## Running the agents in parallel

### 1) Data Platform Agent

Purpose: county-level data schemas + `marketDataService` for comps and market bands.

Steps:

1. Open Claude Code.
2. Select the 818 repo as the workspace root.
3. Load config: `claude-data-platform.json`.
4. In the chat, ask:

   > Generate all Prisma schema updates, TypeScript services, and seed scripts described in your system prompt.

5. Let it:
   - Propose new Prisma models.
   - Create `packages/api/src/services/marketDataService.ts`, `dataValidation.ts`, `marketVendors.ts`.
   - Add a `SEED-DATA.md` and seed script under `packages/db` or a `scripts/` folder.

Dev review:
- Check `schema.prisma` updates.
- Run `npx prisma migrate dev` after edits.
- Run any seed script it created.

---

### 2) Valuation Engine Agent

Purpose: AiAppraisal types, orchestration, AI call wiring, and risk guardrails.

Steps:

1. Open a second Claude Code window/tab.
2. Use same repo root.
3. Load config: `claude-valuation-engine.json`.
4. In the chat, ask:

   > Generate valuationTypes, valuationValidation, valuationService, aiAppraisal, and riskGuardrails as described.

5. Let it:
   - Create `packages/api/src/services/valuationTypes.ts`.
   - Create `valuationValidation.ts`, `valuationService.ts`, `aiAppraisal.ts`, `riskGuardrails.ts`.
   - Wire `valuationService` to Prisma `Deal` and `marketDataService`.

Dev review:
- Ensure imports and paths match actual repo structure.
- Plug in the real model name (Claude or OpenAI) and env var for the API key.
- Confirm `Deal` model fields it references exist and adjust names as needed.

---

## 3) Lender Output Agent

Purpose: lender-ready JSON and PDF layout on top of AiAppraisalResult.

Steps:

1. Open a third Claude Code window/tab.
2. Use same repo root.
3. Load config: `claude-lender-output.json`.
4. In the chat, ask:

   > Generate lenderOutputTypes, lenderOutputMapper, and lenderPdfLayout as described.

5. Let it:
   - Create `packages/api/src/services/lenderOutputTypes.ts`.
   - Create `lenderOutputMapper.ts` that reads `Deal` + `aiAppraisalResult`.
   - Create `lenderPdfLayout.ts` that builds a `LenderPdfDocument` tree from `LenderAppraisalPackage`.

Dev review:
- Confirm type imports from `valuationTypes.ts`.
- Decide which folder to use, for example `services/lender-output/`.
- Later, hook `LenderPdfDocument` into the PDF renderer of your choice.

---

## Integration checkpoints

After all three agents run and code is reviewed:

1. **Type-level check**

   - Run `npm run api:build` and your preferred typecheck or lint commands to catch path and type issues.
   - Fix any import paths the agents guessed wrong.

2. **Database and migrations**

   - Merge Data Platform Prisma changes.
   - Run `npx prisma migrate dev` and address issues.
   - Seed at least one county's test data as described in `SEED-DATA.md`.

3. **End-to-end test path**

   Once wired:

   - Create a test `Deal` via the existing `/api/deals` endpoint.
   - Call the new appraisal route or service with `{ dealId }`.
   - Use a dev tool or test route to fetch:
     - `Deal.aiAppraisalResult`
     - `LenderAppraisalPackage` from `lenderOutputMapper.buildLenderAppraisalPackage(...)`
     - `LenderPdfDocument` from `buildLenderPdfDocument(...)`

4. **Safety + flags**

   - Verify that when market data is thin or missing, the result:
     - Has wider value ranges.
     - Lower confidence scores.
     - Risk flags indicating data quality concerns.

---

## Recommended dev workflow

- Run all three agents in parallel, but merge code in this order:
  1. Data Platform (DB schema + marketDataService).
  2. Valuation Engine (types + services using marketDataService).
  3. Lender Output (mappers using AiAppraisalResult).

- Keep `BUILD-STATUS.md` updated with:
  - New endpoints such as `/api/appraisals`
  - New cron jobs or batch tasks for calibration
  - Any schema changes relevant to ops and lenders

Once this pipeline is stable in dev, you can start wiring real data vendors and LOS integrations knowing the types, flows, and outputs are already standardized and lender-safe.
