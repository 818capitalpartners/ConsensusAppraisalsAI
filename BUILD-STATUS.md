# 818 Capital Partners — Full Build Status

**Last Updated:** March 9, 2026
**Project Location:** `C:\Projects\818-capital`
**Goal:** Inbound lead generation platform — 45+ leads/day, ~20 closed loans/month, ~$100M/year originations

---

## Executive Summary

We are building a **full-stack inbound lead generation platform** for 818 Capital Partners on top of the existing operational infrastructure (Monday.com pipeline, Salesforce, Make.com automations, Missive). The platform includes AI-powered deal triage, branded loan programs, automated notifications, and a content marketing site.

**Current Status:** Days 1-7 of the 8-day build are complete. All 4 loan product lanes (DSCR, Fix & Flip, STR, Multifamily) are fully functional end-to-end. QA passed on all lanes. A **major rebranding effort** is in progress to reposition from "broker with lenders" to "direct lender with branded programs."

---

## Architecture

### Tech Stack
| Layer | Technology | Port |
|-------|-----------|------|
| Database | PostgreSQL 16 + Prisma ORM | 5432 |
| Backend API | Express.js + TypeScript | 4000 |
| Frontend | Next.js 16.1.6 + Tailwind CSS | 3000 |
| DB Admin | Prisma Studio | 5555 |
| AI | OpenAI GPT-4o (with template fallback) | — |
| Email | Brevo (Sendinblue) API | — |
| Notifications | Slack Incoming Webhooks | — |
| CRM/Pipeline | Monday.com GraphQL API | — |
| Analytics | GA4, GTM, Meta Pixel, TikTok Pixel, Google Ads | — |

### Monorepo Structure (npm workspaces)
```
C:\Projects\818-capital/
├── .env
├── .gitignore
├── package.json                      # npm workspaces root
├── tsconfig.json
├── BUILD-STATUS.md                   # This file
├── .claude/
│   └── launch.json                   # Dev server configs
│
├── packages/
│   ├── db/                           # Prisma schema + migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Person, Deal, Lender models
│   │   │   └── migrations/           # Applied migration: 20260307155903_init
│   │   ├── index.ts                  # Re-exports Prisma client + types
│   │   └── package.json
│   │
│   ├── api/                          # Express backend
│   │   ├── src/
│   │   │   ├── server.ts             # Express app, port 4000
│   │   │   ├── routes/
│   │   │   │   ├── health.ts         # GET /api/health
│   │   │   │   ├── deals.ts          # POST /api/deals, POST /api/deals/triage
│   │   │   │   ├── contacts.ts       # POST /api/contacts, GET /api/contacts/stats
│   │   │   │   └── ai.ts            # POST /api/ai/content-scripts
│   │   │   ├── services/
│   │   │   │   ├── dealsService.ts   # createDeal(), triageOnly()
│   │   │   │   ├── triageService.ts  # triageDeal() → DSCR/Flip/STR/Multifamily
│   │   │   │   ├── lenderService.ts  # queryMatchingLenders() from Postgres
│   │   │   │   └── aiNarrative.ts    # generateNarrative() via GPT-4o + fallback
│   │   │   ├── integrations/
│   │   │   │   ├── monday.ts         # postToMonday() → Web Leads board
│   │   │   │   ├── slack.ts          # notifySlack() → #web-leads channel
│   │   │   │   └── email.ts          # sendConfirmationEmail() via Brevo
│   │   │   ├── cron/
│   │   │   │   ├── index.ts          # Cron job registry
│   │   │   │   ├── lenderSync.ts     # Monday → Postgres sync (2AM daily)
│   │   │   │   └── leadSummary.ts    # Daily lead digest → Slack (8AM)
│   │   │   └── scripts/
│   │   │       └── syncLendersNow.ts # Manual lender sync script
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # Next.js frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        # Root layout (dark theme, Geist fonts)
│       │   │   ├── template.tsx      # UTM capture on all pages
│       │   │   ├── page.tsx          # Homepage
│       │   │   ├── get-quote/page.tsx # Quote intake form (lane selector)
│       │   │   ├── dscr/page.tsx     # DSCR lane page
│       │   │   ├── fix-and-flip/page.tsx
│       │   │   ├── str/page.tsx
│       │   │   ├── multifamily/page.tsx
│       │   │   ├── broker-program/page.tsx
│       │   │   ├── blog/page.tsx     # Blog listing
│       │   │   ├── blog/[slug]/page.tsx # Blog post renderer
│       │   │   └── internal/         # Internal tools (match page)
│       │   │       ├── layout.tsx
│       │   │       ├── template.tsx
│       │   │       └── match/page.tsx
│       │   ├── components/
│       │   │   ├── forms/
│       │   │   │   ├── DSCRForm.tsx
│       │   │   │   ├── FlipForm.tsx
│       │   │   │   ├── STRForm.tsx
│       │   │   │   └── MultifamilyForm.tsx
│       │   │   ├── ui/
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Input.tsx
│       │   │   │   ├── Select.tsx
│       │   │   │   └── ScoreCard.tsx
│       │   │   └── layout/
│       │   │       ├── Header.tsx
│       │   │       ├── Footer.tsx
│       │   │       ├── LaneHero.tsx
│       │   │       └── TrackingScripts.tsx
│       │   ├── content/
│       │   │   └── blog/
│       │   │       ├── what-is-dscr-loan.mdx
│       │   │       ├── fix-and-flip-financing-guide.mdx
│       │   │       └── str-investing-dscr.mdx
│       │   └── lib/
│       │       ├── analytics.ts      # GA4 event tracking
│       │       ├── utm.ts            # UTM parameter capture
│       │       └── blog.ts           # MDX blog pipeline
│       ├── next.config.ts
│       ├── tailwind.config (via postcss)
│       └── package.json
```

---

## Existing Systems (DO NOT REBUILD)

### Monday.com (4 boards, 317+ items)
| Board | ID | Items | Status |
|-------|----|-------|--------|
| Loan Pipeline | 18402100042 | 223 | **DO NOT TOUCH** — Salesforce sync, Make.com automations |
| Tasks & Follow-Ups | 18402147025 | 33 | Operational — Missive-linked |
| Lender Profiles | 18402739985 | 14 | **READ-ONLY source** — syncs to Postgres nightly |
| Master Operating System | 18402837357 | 47 | SOPs, prompts, specs |
| **Web Leads (NEW)** | **18403002532** | 0 | **Created by us** — inbound web leads land here |

### Make.com Automations (5, DO NOT TOUCH)
1. Doc Request Relay
2. Lender Portal Router
3. Borrower Follow-Up Escalation
4. Appraisal Tracker
5. Deal Status Sync (Monday <-> Missive)

### Other Integrations (LEAVE ALONE)
- **Missive** — Shared inbox, operational comms
- **Salesforce** — Bidirectional sync with Monday Pipeline
- **OpenPhone/Quo** — Call logging
- **ShareFile** — Document management

---

## Database Schema

### Tables
| Table | PK | Key Fields |
|-------|-----|-----------|
| `Person` | UUID | type, firstName, lastName, email (unique), phone, company |
| `Deal` | UUID | personId FK, productLane, leadType, channel, financials (JSONB), aiTriageResult (JSONB), dealScore (enum: green/yellow/red), property fields, UTM fields |
| `Lender` | UUID | mondayItemId (for sync), name, productType, minFico, minDscr, maxLtv, maxLtc, minLoan, maxLoan, maxUnits, geography (JSONB), rateRange, notes |

### Lender Sync
- **Source:** Monday.com Board 18402739985 (Lender Profiles)
- **Target:** Postgres `lenders` table
- **Schedule:** Nightly at 2AM via node-cron
- **Direction:** Monday → Postgres (READ-ONLY from Monday, never writes back)
- **Monday is the edit point** — ops team edits lenders there
- **14 lenders synced** (only Visio Lending has full numeric criteria currently)

---

## API Endpoints

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| GET | `/api/health` | Health check | WORKING |
| POST | `/api/deals` | Create deal (full flow: person + deal + triage + side effects) | WORKING |
| POST | `/api/deals/triage` | Triage-only mode (no person/deal records) | WORKING |
| POST | `/api/contacts` | ESP email capture | WORKING |
| GET | `/api/contacts/stats` | Contact statistics | WORKING |
| POST | `/api/ai/content-scripts` | AI video script generator | WORKING |

### Deal Creation Flow (`POST /api/deals`)
1. Validate product lane (dscr / flip / str / multifamily)
2. Upsert person (ON CONFLICT email)
3. Create deal with financials (JSONB)
4. Run AI triage (lane-specific calculations + GPT narrative)
5. Update deal with triage result + score
6. Fire-and-forget side effects:
   - Create Monday.com item on Web Leads board (18403002532)
   - Post Slack notification (color-coded by score)
   - Send confirmation email via Brevo ESP
7. Query matching lenders from Postgres
8. Return { person, deal, matchingLenders }

---

## AI Triage Engine

### Lane Calculators

| Lane | Key Metrics | Green | Yellow | Red |
|------|------------|-------|--------|-----|
| **DSCR** | DSCR ratio, LTV, FICO | DSCR >= 1.25, FICO >= 680, LTV <= 80% | DSCR >= 1.0, FICO >= 640 | Below thresholds |
| **Flip** | LTC, profit at 95% ARV | Profit > $30K, LTC < 75% | Profit > $10K, LTC < 85% | Below thresholds |
| **STR** | STR-DSCR, cap rate | STR-DSCR >= 1.25, cap >= 6% | STR-DSCR >= 1.0, cap >= 4% | Below thresholds |
| **Multifamily** | DSCR, cap rate, units | DSCR >= 1.25, cap >= 6%, units >= 5 | DSCR >= 1.1, cap >= 4.5% | Below thresholds |

### AI Narrative
- **Primary:** OpenAI GPT-4o system prompt (real-estate underwriting expert)
- **Fallback:** Template-based narrative when API key not configured
- **Output:** headline, analysis, strengths[], nextSteps[]

---

## Frontend Pages

| Route | Page | Status |
|-------|------|--------|
| `/` | Homepage | WORKING |
| `/get-quote` | Lane selector / intake form | WORKING |
| `/dscr` | DSCR loan product page | WORKING |
| `/fix-and-flip` | Fix & Flip product page | WORKING |
| `/str` | Short-Term Rental page | WORKING |
| `/multifamily` | Multifamily page | WORKING |
| `/broker-program` | Broker program page | WORKING |
| `/blog` | Blog listing | WORKING |
| `/blog/[slug]` | Individual blog posts | WORKING |
| `/internal/match` | Internal lender matching tool | WORKING |

### Blog Posts (MDX)
1. `what-is-dscr-loan.mdx` — What Is a DSCR Loan?
2. `fix-and-flip-financing-guide.mdx` — Fix & Flip Financing Guide
3. `str-investing-dscr.mdx` — STR Investing with DSCR

### Analytics & Tracking
- GA4 with custom events (form_start, form_submit, quote_received, etc.)
- GTM container
- UTM capture (sessionStorage) with channel attribution
- Meta Pixel, TikTok Pixel, Google Ads conversion tag
- All tracking via `TrackingScripts.tsx` component

---

## Integrations

### Monday.com — Web Leads Board (18403002532)
- Creates item on deal submission
- **Color-coded group routing:**
  - Green (Hot Leads) → `group_mm172q4y`
  - Yellow (Warm Leads) → `group_mm17ts2e`
  - Red (Needs Review) → `group_mm17vcg3`
- Columns: Lead Name, Email, Phone, Product Lane, Lead Type, AI Score, AI Narrative, Channel, Property fields, Financials, Status

### Slack
- Webhook POST to `#web-leads` channel
- Color-coded deal summary (green/yellow/red)
- Includes: person name, lane, score, key metrics, lender count
- **INTERNAL — shows real lender names**

### Email (Brevo/Sendinblue)
- Sends confirmation email to lead with triage results
- HTML template with score banner, metrics table, AI narrative
- Tags: lane, score, web_lead, confirmation
- **CLIENT-FACING — needs rebranding (see below)**

### Cron Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| Lender Sync | 2:00 AM daily | Monday Board 18402739985 → Postgres `lenders` table |
| Lead Summary | 8:00 AM daily | Daily digest of new leads → Slack `#web-leads` |

---

## QA Results (Day 7-8)

### All 4 Lane Flows Tested

| Lane | Status | Score | Lenders | Key Metrics |
|------|--------|-------|---------|-------------|
| DSCR | PASS (201) | yellow | 9 | DSCR: 1.16x, LTV: 75%, PITI: $3,664 |
| Flip | PASS (201) | green | 6 | LTC: 70%, Profit@95%: $47,050, ROI: 13.44% |
| STR | PASS (201) | yellow | 9 | STR-DSCR: 1.1x, Cap Rate: 9.56% |
| Multifamily | PASS (201) | red | 9 | DSCR: 0.84x, Cap Rate: 7.5%, NOI: $165K |

### Bug Fixes During QA

**Multifamily Bug (FIXED):**
- **Symptom:** units=1 (sent 12), noi=0 (sent $165K), dscr=0, capRate=0
- **Root Cause 1:** `triageMultifamily()` didn't accept `noi` as direct input — only supported `grossRent`-based calculation
- **Root Cause 2:** `dealsService.ts` had `units: input.units` which overwrote `units: 12` from financials with `undefined`
- **Fix 1:** Added `noi`, `estimatedFico`, `downPaymentPercent` to MultifamilyInput interface; when `input.noi > 0` uses it directly
- **Fix 2:** Changed to conditional spread `...(input.units != null ? { units: input.units } : {})` in both `createDeal` and `triageOnly`
- **After fix:** units=12, noi=$165K, capRate=7.5%, DSCR=0.84x, pricePerUnit=$183K

### Other Verifications
- Monday.com Web Leads board creates items correctly with group routing
- Contacts endpoint: 200, returns stats (20 contacts synced)
- AI content-scripts: 200, returns template-based video script
- Blog listing + individual posts: HTTP 200
- All 3 servers stable (API 4000, Web 3000, Prisma Studio 5555)
- Monday.com test items cleaned up (9 items deleted after QA)

---

## CRITICAL: Rebranding Requirement (IN PROGRESS)

### User Direction
> "We are not acting as a broker, so when you say 14 lenders that's not what I want it to say. I want it to be branded for us, we can even call them all different programs or creative outward facing names. And inwards we know what lender to send a deal to. The issue is many of our 'lenders' deal DTC so if the client knows who it is we can easily get bypassed. We are positioning ourselves as lenders."

### What This Means
1. **Remove ALL real lender names** from client-facing output (API responses, emails, narratives)
2. **Create branded 818 Capital program names** for each lender/product (e.g., "818 FlexRate DSCR" instead of "LimaOne Capital")
3. **Keep real lender names ONLY in internal tools** (Monday.com board, Slack alerts)
4. **Remove lender counts** from client-facing content ("9 lenders match" → "You qualify for 3 programs")
5. **Reframe ALL language** from broker positioning to direct lender positioning
6. **Match the feel** of existing website www.818capitalpartners.com

### Files That Need Changes

| File | What Changes | Internal/Client |
|------|-------------|-----------------|
| `aiNarrative.ts` | GPT system prompt says "brokerage" → "direct lender". Templates reference "X lenders", "our lenders", "shop to lenders" | CLIENT-FACING |
| `dealsService.ts` | Returns `matchingLenders` with real names in API response | CLIENT-FACING |
| `deals.ts` (route) | Passes `matchingLenders` to 201 response | CLIENT-FACING |
| `triageService.ts` | Passes lenderCount + lenderNames to narrative generator | CLIENT-FACING |
| `email.ts` | Shows "X lenders match your deal profile" | CLIENT-FACING |
| `monday.ts` | Shows lender names on Web Leads board | INTERNAL — KEEP AS IS |
| `slack.ts` | Shows lender names in notifications | INTERNAL — KEEP AS IS |

### Specific Lines to Change

**`aiNarrative.ts`:**
- Line ~44: System prompt says "private lending brokerage" → should say "direct lender"
- Line ~93-96: Passes real lender names to GPT prompt
- Line ~185: "We have X lenders ready to compete for this deal"
- Line ~226: "X bridge/flip lenders available for this deal"
- Line ~283: "X STR-friendly lenders match this deal"
- Line ~342: "X commercial/multifamily lenders match this profile"
- All template strengths arrays reference lender counts

**`email.ts`:**
- Line ~153-154: "X lender(s) match your deal profile"
- Line ~183: "personalized lender options"

**`dealsService.ts` / `deals.ts`:**
- Returns full lender objects with name, maxLtv, minDscr, rateRange, notes
- Should return branded program names instead

### Rebranding Status: NOT YET IMPLEMENTED
- Need to create a program name mapping service
- Need to update all client-facing files listed above
- Internal tools (Monday.com, Slack) should remain unchanged

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/818capital

# OpenAI (EMPTY — using template fallback)
OPENAI_API_KEY=

# Monday.com
MONDAY_API_KEY=eyJhbGciOi... (workspace 14516450)
MONDAY_WEB_LEADS_BOARD_ID=18403002532
MONDAY_LENDER_PROFILES_BOARD_ID=18402739985

# Slack (NOT YET CONFIGURED)
SLACK_WEBHOOK_URL=

# ESP (NOT YET CONFIGURED)
ESP_API_KEY=
ESP_FROM_EMAIL=team@818capitalpartners.com

# Analytics (configured in TrackingScripts.tsx, values in .env)
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_GOOGLE_ADS_ID=
```

### Keys Still Needed
- [ ] `OPENAI_API_KEY` — For GPT-4o narratives (currently using template fallback)
- [ ] `SLACK_WEBHOOK_URL` — For web lead notifications
- [ ] `ESP_API_KEY` — For Brevo confirmation emails
- [ ] `NEXT_PUBLIC_GA4_ID` — Google Analytics
- [ ] `NEXT_PUBLIC_GTM_ID` — Google Tag Manager
- [ ] Ad platform pixel IDs

---

## Day-by-Day Execution Log

### Day 1: Foundation (COMPLETE)
- Installed Node.js 20 LTS + PostgreSQL 16
- Created project at `C:\Projects\818-capital`, git init
- Set up npm workspaces monorepo
- Created Prisma schema (Person, Deal, Lender models)
- Ran migration: `20260307155903_init`
- Built lender sync job, ran initial sync — 14 lenders from Monday
- Created Express API skeleton on port 4000
- Implemented `/api/deals` endpoint

### Day 2: Triage + Integrations (COMPLETE)
- Implemented DSCR triage (PITI calculation, scoring, lender matching)
- Implemented Flip triage (LTC, 3 profit scenarios, scoring)
- Created NEW Web Leads board (18403002532) in Monday.com workspace 14516450
- Implemented Monday.com integration (group routing by score color)
- Added Slack webhook integration
- Added Brevo email integration
- Built AI narrative engine (GPT-4o + template fallback)

### Day 3: Frontend + DSCR/Flip Forms (COMPLETE)
- Created Next.js app with App Router
- Tailwind dark theme (slate-950 background)
- Shared UI components (Button, Input, Select, ScoreCard)
- DSCRForm + FlipForm components
- DSCR + Flip lane pages
- API proxy route to Express

### Day 4: STR/Multifamily + Content (COMPLETE)
- STR triage (occupancy-adjusted DSCR, cap rate)
- Multifamily triage (NOI/DSCR/cap rate/price-per-unit)
- STRForm + MultifamilyForm components
- STR + Multifamily lane pages
- MDX blog pipeline (zero-dependency markdown renderer)
- Homepage, blog listing, blog post pages
- 3 initial blog posts

### Day 5: Analytics + ESP (COMPLETE)
- GA4 event tracking (form_start, form_submit, quote_received, etc.)
- GTM container setup
- UTM capture (sessionStorage with channel attribution)
- `/api/contacts` ESP endpoint with lane tags
- Contact stats endpoint

### Day 6: Retargeting + Broker Page (COMPLETE)
- Meta Pixel, TikTok Pixel, Google Ads conversion tag (TrackingScripts.tsx)
- Broker program page
- Get-quote intake page (lane selector)
- Internal match tool page

### Day 7: AI Agent + QA (COMPLETE)
- Content script generator (`/api/ai/content-scripts`)
- Daily lead summary cron → Slack (8AM)
- Lender sync cron (2AM)
- Full QA on all 4 lane flows — ALL PASSING
- Fixed multifamily triage bug (two-part fix)
- Cleaned up 9 test items from Monday.com Web Leads board

### Day 8: Rebranding + Polish (IN PROGRESS)
- User requested major rebranding: position as direct lender, not broker
- Identified all files needing changes (see Rebranding section above)
- Implementation not yet started

---

## Remaining Tasks

### Priority 1: Rebranding (BLOCKING)
- [ ] Create branded program name mapping (lender → 818 Capital program)
- [ ] Update `aiNarrative.ts` — GPT prompt + all templates
- [ ] Update `dealsService.ts` / `deals.ts` — strip lender names from API response
- [ ] Update `email.ts` — replace lender count language
- [ ] Update `triageService.ts` — use program names in narratives
- [ ] Verify Monday.com + Slack still show real lender names

### Priority 2: Configuration
- [ ] Add OpenAI API key (for GPT-4o narratives)
- [ ] Create Slack webhook and add to .env
- [ ] Set up Brevo account and add API key
- [ ] Configure GA4 property and add measurement ID
- [ ] Set up GTM container
- [ ] Configure ad platform pixels

### Priority 3: Polish
- [ ] Match website look/feel to www.818capitalpartners.com
- [ ] ESP email sequences (4 lanes x 5 emails each)
- [ ] Broker kit generator endpoint
- [ ] Competitor monitor skeleton
- [ ] Production deployment configuration
- [ ] Runbook for CMO/ops team

---

## Dev Server Configuration

**File:** `C:\Projects\818-capital\.claude\launch.json`

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "api",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["tsx", "watch", "packages/api/src/server.ts"],
      "port": 4000
    },
    {
      "name": "web",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["next", "dev", "--dir", "packages/web"],
      "port": 3000
    },
    {
      "name": "db-studio",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["prisma", "studio", "--schema", "packages/db/prisma/schema.prisma"],
      "port": 5555
    }
  ]
}
```

**Note:** `preview_start` tool does NOT work on Windows due to spawn issues with npx/.bat. Start servers manually:
```bash
# API
cd /c/Projects/818-capital && npx tsx watch packages/api/src/server.ts &

# Web (must run from packages/web — --dir flag not supported in Next.js 16)
cd /c/Projects/818-capital/packages/web && npx next dev &

# DB Studio
cd /c/Projects/818-capital && npx prisma studio --schema packages/db/prisma/schema.prisma &
```

---

## Key Safety Rules

1. **NEVER write to Pipeline board** (18402100042) — has Salesforce sync + 223 active deals
2. **NEVER write back to Lender Profiles board** (18402739985) — read-only sync source
3. **NEVER touch Make.com automations** — our system is additive, theirs is operational
4. **NEVER interact with Missive** — Slack used for web lead notifications only
5. **Web Leads board** (18403002532) is the ONLY Monday.com board we write to
6. **Monday.com is the edit point for lenders** — Postgres is the query point
