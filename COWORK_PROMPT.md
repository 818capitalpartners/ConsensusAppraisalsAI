# PASTE THIS INTO YOUR COWORK SESSION

---

You are continuing development on the 818 Capital web platform. Read `C:\Users\ravip\dev\818-capital\COWORK_HANDOFF.md` first — it has the full project context, file structure, database schema, Monday.com column IDs, and design system.

Pre-authorized: all file writes, all bash commands (npm install, pip install, etc.), all git operations. Do not stop for approvals. Make reasonable decisions and keep going.

## YOUR TASKS (in order)

### Task 1: Replace the US Map on /markets
The current USMap.tsx component at `frontend/src/components/USMap.tsx` uses a hand-drawn SVG that looks terrible. Replace it with `react-simple-maps`:

1. `cd C:\Users\ravip\dev\818-capital\frontend && npm install react-simple-maps @types/react-simple-maps`
2. Rewrite `USMap.tsx` using `ComposableMap`, `Geographies`, `Geography`, `Marker` from react-simple-maps
3. Use TopoJSON: `https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json`
4. Color active states (see COVERAGE_STATES list in current file) with navy-200, inactive with navy-50
5. Add animated blue pins (#1B69D4) on 10 key markets: NY, Miami, Dallas, LA, Phoenix, Atlanta, Nashville, Chicago, Denver, Austin
6. Tooltip on hover showing city, description, and product lanes (DSCR/Flip/STR/Multifamily)
7. "Active in 48 States" badge below the map
8. Brand colors: accent #1B69D4, navy-900 #0A1628, navy-50 #F0F4F8

### Task 2: Integrate the Appraisal AI
There are TWO copies of the appraisal engine. Use BOTH for reference:
- **Active dev copy**: `C:\Users\ravip\dev\ConsensusAppraisalsAI\packages\api\src\services\`
- **Full clean copy with extras**: `C:\Users\ravip\OneDrive\_Archive\Documents (Old)\Documents\ConsensusAppraisalsAI-clean\packages\api\src\services\`

The clean copy has additional services not in the dev copy:
- `marketDataService.ts` — County-level market data, comps, cap rate bands
- `lenderOutputTypes.ts` — Full lender-file appraisal schema (ValueRange, ValuationKeyMetrics, LenderComparable, LenderRiskFlag, LenderAppraisalPackage, BorrowerFacingSummary)
- `lenderOutputMapper.ts` — Deal → LenderAppraisalPackage converter
- `lenderPdfLayout.ts` — PDF layout builder for lender packages
- `aiNarrative.ts` — GPT-4o narrative generation with fallback templates

**Port into the 818 Capital FastAPI backend:**

1. Read ALL service files from both locations to understand the full engine
2. Create Pydantic models in `backend/app/schemas.py` matching:
   - `AiAppraisalInput` (subject property, deal terms, income/expenses, market data, prior analysis)
   - `AiAppraisalResult` (as-is value block, stabilized value block, metrics, comps, risk flags, notes)
   - `AppraisalValueBlock` (valueLow, valueMid, valueHigh, confidenceScore, primaryMethods)
   - `LenderAppraisalPackage` (full structured output for lender files)
   - `BorrowerFacingSummary` (client-safe version — no internal notes)
3. Create `backend/app/services/appraisal.py` — port `generateAppraisal()`, `templateFallbackAppraisal()`, and the sanitization/validation logic
4. Create `backend/app/routes/appraisal.py`:
   - `POST /api/appraisal/` — Run appraisal on a deal
   - `GET /api/appraisal/{deal_id}` — Fetch stored appraisal result
   - `GET /api/appraisal/{deal_id}/borrower-summary` — Borrower-facing version
5. Register routes in `backend/app/main.py`
6. Add `ai_appraisal_result = Column(JSONB, nullable=True)` to Deal model in `models.py`
7. Run Alembic migration: `cd backend && python -m alembic revision --autogenerate -m "add_appraisal_result" && python -m alembic upgrade head`
8. Wire into deal creation: after triage completes, if enough property data exists (address + value + income), auto-run appraisal
9. Add an "AI Appraisal Pre-Check" card on `/dscr-loans` and `/multifamily` pages

**Key system prompt** is in `aiAppraisal.ts` line 7-56 — copy it exactly, it's tuned for conservative lender-first output.

### Task 3: Fix remaining images
Every image on the site must visually match what it's labeled as. Before using any Unsplash URL:
1. Open it in a browser and LOOK at it
2. Ask: does this look like a [fixer-upper in Miami / Nashville loft / apartment building]?
3. If not, find a different one

Specific fixes needed:
- Fix & Flip card image — currently shows a residential interior mid-rehab. Consider replacing with an exterior shot of an older SFR that looks like a typical flip purchase (overgrown yard, dated exterior, etc.)
- Verify all images load (no 404s) — test every URL

### Task 4: Deploy to Vercel + Railway
1. Initialize git if not done: `cd C:\Users\ravip\dev\818-capital && git init && git add -A && git commit -m "818 Capital v1"`
2. Create GitHub repo: `gh repo create 818-capital --private --source=. --push`
3. Deploy frontend to Vercel:
   - Connect the GitHub repo
   - Set root directory to `frontend`
   - Framework preset: Next.js
   - Environment variable: `NEXT_PUBLIC_API_URL` = (Railway backend URL once deployed)
4. Deploy backend to Railway:
   - Create a Dockerfile in `backend/`:
     ```dockerfile
     FROM python:3.12-slim
     WORKDIR /app
     COPY . .
     RUN pip install --no-cache-dir fastapi "uvicorn[standard]" sqlalchemy[asyncio] asyncpg alembic pydantic pydantic-settings httpx openai python-dotenv email-validator psycopg2-binary
     EXPOSE 3001
     CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001"]
     ```
   - Add Railway PostgreSQL addon
   - Set all env vars from `backend/.env`
5. Update GoDaddy DNS: CNAME record `818capitalpartners.com` → Vercel

### Task 5: UI Polish
- Make sure the entire site flows — every page transition, every hover state, every form
- Mobile responsive — test at 375px width
- Loading states on all forms
- Error states that don't break layout
- Consistent spacing between sections (py-16 or py-20)

## ENVIRONMENT INFO
- Windows 11, Node v24.14, Python 3.14, npm 11.9
- PostgreSQL 16 running locally on port 5432 (user: dev818, pass: dev818pass, db: capital818)
- PATH needs: `C:\Program Files\nodejs` and `C:\Program Files\PostgreSQL\16\bin`
- No Docker Desktop installed — use local PostgreSQL

## DO NOT
- Use placeholder images without visually verifying them
- Use the old Node.js backend files (they're deleted, everything is Python/FastAPI now)
- Change the Monday.com column IDs or group IDs
- Modify the Tailwind config colors without checking existing pages
- Break the existing deal submission flow that's working end-to-end
