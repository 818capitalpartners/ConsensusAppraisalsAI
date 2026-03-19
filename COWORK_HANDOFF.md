# 818 Capital — Cowork Handoff Document
> Last updated: March 19, 2026
> For: Claude Code / Cowork AI continuation session

---

## PROJECT OVERVIEW

818 Capital is a real estate investment lending company. This is the full-stack web platform:
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS at `C:\Users\ravip\dev\818-capital\frontend\`
- **Backend**: Python FastAPI + SQLAlchemy + asyncpg at `C:\Users\ravip\dev\818-capital\backend\`
- **Database**: PostgreSQL 16 (local, running on port 5432)
- **Appraisal AI**: Separate Node.js project at `C:\Users\ravip\dev\ConsensusAppraisalsAI\`

### Running the project
```bash
# Backend (FastAPI)
cd C:\Users\ravip\dev\818-capital\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 3001 --reload

# Frontend (Next.js)
cd C:\Users\ravip\dev\818-capital\frontend
npx next dev --port 3000

# Database is PostgreSQL 16 local
# User: dev818 / Password: dev818pass / Database: capital818
```

### Key URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs (Swagger): http://localhost:3001/docs
- Backend proxied via Next.js rewrites: /api/* → localhost:3001/api/*

---

## WHAT'S BUILT AND WORKING

### Backend (FastAPI Python)
- `POST /api/deals/` — Deal creation + AI triage (DSCR, Flip, STR, Multifamily) + lender matching
- `GET /api/deals/` — List deals with filters
- `GET /api/deals/{id}` — Single deal
- `POST /api/contacts/` — Contact subscribe + ESP tagging
- `POST /api/broker-kit/generate` — AI broker kit generator (needs OPENAI_API_KEY)
- `POST /api/content/generate` — AI content generator (needs OPENAI_API_KEY)
- `GET /api/health/` — Health check
- **12 lenders seeded** in database
- **Integrations** (need API keys in `.env`): Monday.com, Slack, Brevo email, OpenAI

### Frontend Pages (all rendering, all tested)
| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ | Homepage — Easy Street-style split hero with property images + loan badges |
| `/dscr-loans` | ✅ | DSCR page with calculator, form, FAQ |
| `/fix-and-flip` | ✅ | Flip page with form |
| `/str-loans` | ✅ | STR page with property types, markets, docs needed, form |
| `/multifamily` | ✅ | Multifamily page with form |
| `/broker-program` | ✅ | Broker signup page |
| `/closed-deals` | ✅ | 6 deal cards with images + metrics |
| `/markets` | ⚠️ | **US Map is ugly — needs replacement** (see PRIORITY TASKS below) |
| `/blog` | ✅ | 6 blog posts with full content |
| `/blog/[slug]` | ✅ | Individual blog post pages |
| `/professionals` | ✅ | For Professionals page |
| `/insights` | ✅ | Industry Insights page |
| `/resources` | ✅ | Calculators & Tools page |

### Design System
- **Fonts**: Montserrat (headings), Roboto (body) — loaded via Google Fonts in globals.css
- **Colors**: Navy palette (#0A1628 through #F0F4F8), Accent blue (#1B69D4), Success green (#1A8754), Warning gold (#D4A017)
- **Tailwind config**: `frontend/tailwind.config.js` — custom colors, fonts, font sizes (display, h1-h4)
- **CSS classes**: `.input`, `.btn-primary`, `.btn-secondary`, `.btn-white`, `.card`, `.section-heading`, `.section-subheading`

---

## PRIORITY TASKS (in order)

### 1. FIX THE US MAP ON /markets
The current SVG map in `frontend/src/components/USMap.tsx` is a hand-drawn blob. It needs to be replaced with a real US map.

**Options (pick one):**
- **react-simple-maps** — `npm install react-simple-maps` + TopoJSON for US states. Best option. Render each state, color active states, add market pins with tooltips.
- **@react-jvectormap/unitedstates** — simpler but less customizable
- **Static SVG** — use a real US state SVG file (download from amcharts or similar) and add pin overlays

**Requirements:**
- Must show actual US state boundaries
- Highlight states we lend in (see COVERAGE_STATES in current USMap.tsx)
- Blue pins on 10 key markets (NY, Miami, Dallas, LA, Phoenix, Atlanta, Nashville, Chicago, Denver, Austin)
- Hover/click shows tooltip with city, description, and product lanes available
- Use 818 brand colors (accent blue #1B69D4 for pins, navy-100 for inactive states, navy-200 for active states)

### 2. IMPROVE IMAGES
Some images still don't perfectly match their context. Rules:
- **ALWAYS visually verify every image before deploying** — open the URL and look at it
- Fix & Flip should show a residential home mid-renovation or a fixer-upper SFR — NOT an apartment building or commercial construction
- Nashville should look like Nashville (Broadway neon, brick lofts) — NOT Manhattan
- Miami flip at $285K should look like a modest CBS ranch in Hialeah — NOT a luxury property
- All Unsplash URLs must return 200 (test them)

Current image IDs in use (grep for these):
```
photo-1605276374104-dee2a0ed3cd6  — suburban SFR (DSCR)
photo-1768321901750-f7b96d774456  — residential rehab interior (Fix & Flip)
photo-1600596542815-ffad4c1539a9  — luxury pool house (STR)
photo-1460317442991-0ec209397118  — apartment building (Multifamily)
photo-1588897159261-328f3f53715f  — Nashville Broadway at night
photo-1639511919308-7c3f739812ba  — Phoenix sunset skyline
photo-1534430480872-3498386e7856  — NYC skyline
photo-1533106497176-45ae19e68ba2  — Miami waterfront
photo-1545194445-dddb8f4487c6  — Dallas skyline
photo-1477959858617-67f85cf4f1df  — LA skyline
photo-1575917649705-5b59aaa12e6b  — Atlanta
```

### 3. INTEGRATE APPRAISAL AI
The appraisal AI lives at `C:\Users\ravip\dev\ConsensusAppraisalsAI\`. It's a Node.js/TypeScript project with Prisma.

**Key files:**
- `packages/api/src/services/aiAppraisal.ts` — Main AI engine (OpenAI GPT-4.1-mini, JSON output)
- `packages/api/src/services/valuationTypes.ts` — Input/output TypeScript interfaces
- `packages/api/src/services/riskGuardrails.ts` — Risk flag logic
- `packages/api/src/services/valuationService.ts` — Service wrapper
- `packages/api/src/services/valuationValidation.ts` — Validation

**What it does:**
- Takes property data, deal terms, income/expenses, market data, and comps
- Produces a conservative lender-first valuation with:
  - As-is value range (low/mid/high) + confidence score
  - Stabilized/ARV value range (optional)
  - Metrics: NOI, implied cap rate, price/sqft
  - Risk flags
  - Notes for credit committee and borrower

**Integration approach (Python port):**
1. Port the `AiAppraisalInput` and `AiAppraisalResult` types to Pydantic models in `backend/app/schemas.py`
2. Port `aiAppraisal.ts` logic to `backend/app/services/appraisal.py` — same system prompt, same sanitization, same template fallback
3. Add a new route `POST /api/appraisal/` in `backend/app/routes/appraisal.py`
4. Wire it into the deal creation flow: after triage, optionally run appraisal if enough data exists
5. Add an "AI Appraisal Pre-Check" section on the DSCR and Multifamily pages that calls this endpoint
6. Store appraisal results in the `deals` table (add `ai_appraisal_result JSONB` column via Alembic migration)

### 4. DEPLOYMENT (Vercel + Railway)
- Push to GitHub: `cd C:\Users\ravip\dev\818-capital && git add -A && git commit -m "initial" && gh repo create 818-capital --private --push`
- Frontend → Vercel: connect GitHub repo, set root to `frontend/`, add env vars `NEXT_PUBLIC_API_URL`
- Backend → Railway: connect GitHub repo, set root to `backend/`, add Dockerfile, add all env vars from `.env`
- GoDaddy DNS: add CNAME record pointing `818capitalpartners.com` to Vercel

### 5. ADD MISSING ENV KEYS
The `.env` at `backend/.env` needs these filled in:
```
OPENAI_API_KEY=          # For AI triage narratives and appraisal
MONDAY_API_TOKEN=        # For deal sync to Monday.com board 18402100042
SLACK_WEBHOOK_URL=       # For deal notifications
BREVO_API_KEY=           # For email confirmations
```

---

## DATABASE SCHEMA

3 tables in PostgreSQL (via SQLAlchemy + Alembic):
- **persons** — id, type (investor/broker), first_name, last_name, email (unique), phone, company, esp_tags[], notes
- **deals** — id, person_id (FK), product_lane, lead_type, channel, status, property fields, financials (JSONB), ai_triage_result (JSONB), deal_score, monday_item_id, salesforce_opp_id
- **lenders** — id, name (unique), product_type, min_fico, min_dscr, max_ltv, max_ltc, min_loan, max_loan, geography (JSONB), notes, is_active

12 lenders seeded: Visio, LimaOne, Kiavi, Roc, Easy Street, Tidal, New Silver, ArchWest, Stormfield, Dominion, Velocity, CoreVest.

---

## MONDAY.COM INTEGRATION

Board ID: **18402100042** (Loan Pipeline)
Column IDs:
```
borrower_name:      text_mm12gee2
borrower_email:     email_mm12f6fx
borrower_phone:     phone_mm12pk9z
loan_amount:        numeric_mm125dz6
property_address:   text_mm12e5bc
loan_type:          color_mm126r6  (labels: DSCR, Fix-and-Flip, STR, Multifamily)
priority:           color_mm129w1w (labels: Hot, Warm, Cold)
lead_source:        color_mm15fca3
recommended_lenders: text_mm169qm
next_action:        text_mm15px3
```
Group IDs:
```
NEW_LEAD:             group_mm12t0dw
APPLICATION_RECEIVED: group_mm12car0
PROCESSING:           group_mm1256wf
UNDERWRITING:         group_mm12snap
CONDITIONAL_APPROVAL: group_mm12gp7e
CLEAR_TO_CLOSE:       group_mm126xb4
FUNDED:               group_mm125tcn
DEAD_LOST:            group_mm129ket
```

---

## FILE STRUCTURE

```
818-capital/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app + CORS + routes
│   │   ├── config.py            # Pydantic Settings
│   │   ├── database.py          # SQLAlchemy async engine
│   │   ├── models.py            # Person, Deal, Lender models
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── seed.py              # Lender seed script
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── deals.py
│   │   │   ├── contacts.py
│   │   │   ├── broker_kit.py
│   │   │   └── content.py
│   │   └── services/
│   │       ├── deals.py          # Deal creation orchestrator
│   │       ├── triage.py         # AI triage engine (4 lanes)
│   │       ├── lender.py         # Lender matching
│   │       ├── monday.py         # Monday.com GraphQL API
│   │       ├── slack.py          # Slack webhooks
│   │       └── email.py          # Brevo ESP
│   ├── alembic/                  # DB migrations
│   ├── alembic.ini
│   ├── pyproject.toml
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout with nav + footer
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── globals.css       # Tailwind + brand styles
│   │   │   ├── dscr-loans/page.tsx
│   │   │   ├── fix-and-flip/page.tsx
│   │   │   ├── str-loans/page.tsx
│   │   │   ├── multifamily/page.tsx
│   │   │   ├── broker-program/page.tsx
│   │   │   ├── closed-deals/page.tsx
│   │   │   ├── markets/page.tsx
│   │   │   ├── blog/page.tsx
│   │   │   ├── blog/[slug]/page.tsx
│   │   │   ├── professionals/page.tsx
│   │   │   ├── insights/page.tsx
│   │   │   └── resources/page.tsx
│   │   ├── components/
│   │   │   ├── DealForm.tsx      # Shared form + triage result display
│   │   │   ├── DSCRCalculator.tsx
│   │   │   └── USMap.tsx         # NEEDS REPLACEMENT (see Priority #1)
│   │   └── lib/
│   │       ├── api.ts            # fetch wrappers
│   │       ├── tracking.ts       # GA4/pixel events
│   │       └── blog-data.ts      # Blog post content
│   ├── public/
│   │   └── logo.png              # 818 Capital logo
│   ├── next.config.mjs
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml            # PostgreSQL (not used — local PG running)
└── package.json                  # Root package.json
```

---

## BRAND VOICE
- Professional but approachable
- Education-first — explain everything, no jargon
- Direct and numeric — "DSCR 1.27, green light" not "this looks promising"
- No corporate buzzwords
- Ravi Punn is the founder, (917) 993-9194, deals@818capitalpartners.com

## DESIGN REFERENCE
- Northmarq.com (professional institutional feel)
- Easy Street Capital (split hero with property images + loan badges)
- White backgrounds, navy accents, blue CTAs
- Montserrat headings, Roboto body
