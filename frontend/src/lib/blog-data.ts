export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
}

export const POSTS: BlogPost[] = [
  {
    slug: 'what-is-dscr-loan',
    title: 'What Is a DSCR Loan and How Does It Work?',
    excerpt: 'DSCR loans let investors qualify based on rental income, not personal income. Here\'s everything you need to know about how they work, who qualifies, and when to use one.',
    category: 'DSCR',
    date: 'March 15, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=600&fit=crop',
    content: `## What Is a DSCR Loan?

A DSCR (Debt Service Coverage Ratio) loan is a type of investment property mortgage where **the property's rental income is used to qualify** instead of the borrower's personal income. No tax returns. No W-2s. No pay stubs. The lender looks at one thing: does the property generate enough rent to cover the mortgage?

This makes DSCR loans the go-to product for real estate investors who:

- Own multiple properties and have complex tax returns
- Are self-employed or have variable income
- Want to close in an LLC or business entity
- Need to scale a portfolio quickly without income documentation bottlenecks

## How DSCR Is Calculated

The formula is simple:

**DSCR = Monthly Rental Income / Monthly PITI**

PITI stands for Principal, Interest, Taxes, and Insurance — your total monthly housing cost. If your DSCR is 1.0, the rent exactly covers the mortgage. Above 1.0 means the property cash flows. Below 1.0 means you're covering part of the mortgage out of pocket.

**Example:**
- Monthly rent: $2,800
- Monthly PITI: $2,200
- DSCR = $2,800 / $2,200 = **1.27**

A 1.27 DSCR means the property generates 27% more income than the debt costs. Most lenders want a minimum of 1.0 to 1.25. Some programs go as low as 0.75 DSCR with compensating factors like higher down payment or strong credit.

## What DSCR Do You Need?

The minimum DSCR depends on the lender and your borrower profile:

- **1.25+ DSCR:** Best rates, most lender options. This is the sweet spot.
- **1.0 - 1.24 DSCR:** Qualifies with most lenders but may see slightly higher rates.
- **0.75 - 0.99 DSCR:** Some lenders offer "no-ratio" or sub-1.0 programs. Expect higher down payment requirements (25-30%) and higher rates.
- **Below 0.75:** Most lenders will pass. Consider restructuring — lower loan amount, higher rent, or a different property.

## Who Qualifies for a DSCR Loan?

DSCR loans are designed for **investment properties only** — you cannot use them for a primary residence. Beyond that, requirements are straightforward:

- **Credit score:** Most lenders require 660+. Some go to 620 with compensating factors.
- **Down payment:** Typically 20-25%. Some programs offer 15% down for strong DSCR and credit.
- **Reserves:** 6-12 months of PITI in liquid assets.
- **Property types:** Single-family, 2-4 unit, condo, townhouse. Some lenders do 5+ units under DSCR.
- **Entity closing:** Most lenders allow (and prefer) closing in an LLC.
- **Experience:** Not always required. First-time investors can qualify, though experienced investors may get better terms.

## DSCR Loan Rates and Terms

DSCR loan rates are typically 1-2% higher than conventional owner-occupied rates. As of early 2026, expect:

- **Rates:** 7.0% - 8.5% depending on DSCR, credit, and LTV
- **LTV:** Up to 80% (purchase or rate-term refi), 75% cash-out
- **Terms:** 30-year fixed, 5/1 ARM, 7/1 ARM, interest-only options
- **Prepayment:** Some loans have 3-5 year prepay penalties (step-down structure)
- **Closing time:** 14-21 days from clear-to-close

## When Should You Use a DSCR Loan?

DSCR loans make sense when:

1. **You have complex income** that's hard to document (self-employed, multiple businesses, K-1 income)
2. **You're scaling a portfolio** and don't want each property to require full income documentation
3. **You want to close in an LLC** for asset protection
4. **Speed matters** — DSCR loans typically close faster than conventional investment property loans
5. **Your DTI is maxed** on conventional loans but the property itself cash flows

## The 818 Capital Difference

Our AI Scenario Desk analyzes your deal in seconds — calculating DSCR, estimating PITI, and matching you with the right capital program. Submit your numbers and get a score before you even talk to anyone.

No guessing. No waiting for a loan officer to run numbers. Just data.`,
  },
  {
    slug: 'fix-flip-profit-guide',
    title: 'How to Calculate Fix & Flip Profit (And Not Lose Your Shirt)',
    excerpt: 'ARV, rehab costs, holding costs, and the 70% rule. A real-world breakdown of how to analyze a flip deal before you make an offer.',
    category: 'Fix & Flip',
    date: 'March 10, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200&h=600&fit=crop',
    content: `## The Numbers That Matter in Every Flip

Every fix and flip deal comes down to four numbers: what you buy it for, what you put into it, what it costs to hold it, and what you sell it for. Get any one of those wrong and a profitable flip turns into a loss.

Here's how to run the math before you make an offer.

## Step 1: Estimate Your ARV (After Repair Value)

ARV is what the property will be worth after renovations are complete. This is the most important number in your analysis — and the one most investors get wrong.

**How to estimate ARV:**
- Pull 3-5 comparable sales within 0.5 miles, sold in the last 6 months
- Adjust for size, condition, lot, and features
- Be conservative — use the middle of the range, not the top
- Get a broker opinion or preliminary appraisal if the deal is large

**Common mistake:** Using the highest comp as your ARV. Appraisers rarely hit the top of the range. Budget for 5-10% below your best case.

## Step 2: Calculate Total Project Cost

Your total cost includes everything — not just purchase and rehab:

- **Purchase price** — what you're paying for the property
- **Closing costs (buy side)** — title, transfer tax, attorney, typically 2-3% of purchase
- **Rehab budget** — materials, labor, permits, contingency (always add 10-15% buffer)
- **Holding costs** — loan interest, taxes, insurance, utilities during the hold period
- **Selling costs** — agent commissions (5-6%), transfer tax, title, staging
- **Loan costs** — origination fees (1-2 points), appraisal, draw inspection fees

## Step 3: The Profit Formula

**Profit = ARV - Total Project Cost**

Or more specifically:

**Profit = ARV - (Purchase + Rehab + Holding Costs + Buy Closing + Sell Closing + Loan Costs)**

## A Real-World Example

Let's walk through a deal:

| Line Item | Amount |
|-----------|--------|
| Purchase Price | $200,000 |
| Rehab Budget | $75,000 |
| Closing Costs (Buy) | $6,000 |
| Loan Origination (2 pts) | $5,500 |
| Holding Costs (6 months) | $14,000 |
| Selling Costs (6%) | $22,500 |
| **Total Cost** | **$323,000** |
| **ARV** | **$375,000** |
| **Profit** | **$52,000** |

That's a 16% return on total cost over a 6-month hold. Not bad — but what if your ARV comes in 5% low?

**At 95% ARV ($356,250):** Profit drops to $33,250
**At 90% ARV ($337,500):** Profit drops to $14,500

This is why we run three scenarios in Flip Lab. You need to know if a deal still works when things don't go perfectly.

## The 70% Rule (And Why It's Not Enough)

The classic rule of thumb: **Maximum Purchase = (ARV x 70%) - Rehab Cost**

Using our example: ($375,000 x 0.70) - $75,000 = $187,500 max purchase

The 70% rule was designed for a world with lower interest rates and lower carrying costs. In 2026, with bridge loans at 10-12% and holding periods stretching, you may need to use 65% or even 60% depending on your market.

**The 70% rule doesn't account for:**
- Your actual cost of capital
- Hold period (a 4-month flip is very different from a 10-month flip)
- Selling costs that vary by market
- Your specific rehab scope and contingency

Use it as a quick filter, not a decision tool.

## How Much Experience Do You Need?

Most bridge lenders tier their terms by experience:

- **0-2 flips:** Lower LTC (80%), higher rates, may need larger reserves
- **3-5 flips:** Standard terms, 85% LTC available
- **6-10 flips:** Better rates, 90% LTC, faster approvals
- **11+ flips:** Best terms, relationship pricing, higher leverage

If this is your first flip, don't let that stop you. It just means you need stronger numbers on the deal itself.

## Run Your Numbers Through Flip Lab

Our Flip Lab analyzer runs your deal at three ARV scenarios instantly — 100%, 95%, and 90% of your projected ARV. You'll see profit margins, max LTC, and whether the deal has enough cushion to survive a market adjustment.

Submit your numbers. Know your risk before you sign.`,
  },
  {
    slug: 'str-income-qualification',
    title: 'Using Airbnb Income to Qualify for a Mortgage',
    excerpt: 'Most lenders use 75% of your STR income for DSCR. We break down how to document, normalize, and present your short-term rental revenue to lenders.',
    category: 'STR',
    date: 'March 5, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=600&fit=crop',
    content: `## The STR Income Problem

You've got an Airbnb pulling in $6,000 a month. You want to buy another one — or refinance this one. You go to a traditional lender and they say: "We need two years of tax returns showing rental income."

But your Schedule E shows a loss because of depreciation. Or you just started hosting 8 months ago. Or your income is seasonal and the monthly average doesn't tell the real story.

This is the gap DSCR loans with STR income solve.

## How Lenders Evaluate STR Income

Most DSCR lenders that accept short-term rental income use a **conservative haircut** — typically 75% of your gross STR revenue.

**Why 75%?** Lenders discount STR income because:
- It's variable month-to-month
- Occupancy isn't guaranteed
- Platform fees, cleaning, and management eat into gross revenue
- Seasonal markets can see 40-60% income swings

**The formula:**
Conservative Monthly Income = (Annual Gross STR Income x 0.75) / 12

**Then:** DSCR = Conservative Monthly Income / Monthly PITI

## Example: Beach House in Fort Lauderdale

| Metric | Amount |
|--------|--------|
| Annual Airbnb Gross Revenue | $72,000 |
| Conservative (75%) | $54,000/year |
| Monthly (Conservative) | $4,500 |
| Monthly PITI | $3,200 |
| **DSCR** | **1.41** |

That's a strong deal. The property qualifies easily even with the 25% haircut.

## What Documentation Do Lenders Need?

This varies by lender, but here's the standard package:

**Required:**
- **Trailing 12-month platform statements** — Airbnb, VRBO, or your booking platform's income summary
- **Current lease or booking schedule** — shows upcoming reservations
- **Property photos** — current listing photos showing the property's condition and amenities

**Often requested:**
- **AirDNA market report** — third-party data showing comparable properties, ADR (Average Daily Rate), occupancy rates, and revenue potential in your market
- **Profit & loss statement** — even informal, showing revenue minus expenses
- **Operating expense breakdown** — cleaning, management fees, supplies, insurance, utilities

**Good to have:**
- **Superhost or Premier Host status** — signals track record
- **Guest reviews** — lenders like seeing 4.5+ ratings
- **Year-over-year growth** — if income is trending up, document it

## What About New STR Properties?

If you're buying a property to operate as a short-term rental and don't have income history, lenders typically accept:

1. **AirDNA projections** — third-party market data estimating revenue for comparable properties in the same zip code
2. **Comparable STR listings** — screenshot active listings in the area showing nightly rates and occupancy
3. **1007 Rent Schedule** — a standard appraisal form that estimates market rent (some lenders will accept this as a baseline)

Not all lenders accept projected income — some require 3-6 months of actual operating history. This is where having multiple capital programs matters. We know which ones work for acquisitions vs. refinances.

## Markets Where STR Lending Is Strongest

STR-friendly DSCR loans work best in markets with:

- **Year-round demand** (Miami, LA, Hawaii)
- **Strong tourism** (Nashville, Austin, Scottsdale)
- **Business travel** (NYC, Dallas, Chicago)
- **Event-driven markets** (Las Vegas, Orlando, New Orleans)

Watch out for markets with restrictive STR regulations. Some cities limit short-term rentals by zone, require permits, or cap the number of days you can rent. Lenders may discount or reject properties in heavily regulated markets.

## Common Mistakes

1. **Using gross income without the haircut.** Lenders will apply 75% automatically — don't assume your full Airbnb revenue qualifies.
2. **Ignoring seasonality.** If 60% of your income comes in 4 summer months, lenders will average it across 12 months. Make sure the average still works.
3. **Not having AirDNA data.** This is cheap ($20-30 per report) and dramatically strengthens your file. Get it before you apply.
4. **Forgetting platform fees.** Airbnb takes 3%. VRBO takes up to 8%. Your gross booking revenue is not your gross income.

## Run Your STR Numbers

Our STR Signal tool takes your annual STR income, applies the conservative 75% calculation, and tells you exactly where your DSCR lands. You'll know in seconds whether your property qualifies — and which programs fit.`,
  },
  {
    slug: 'multifamily-underwriting-101',
    title: 'Multifamily Underwriting 101: NOI, Cap Rate, and DSCR',
    excerpt: 'The three numbers that matter most in multifamily lending. Learn how lenders evaluate 5+ unit apartment deals and what makes a strong submission.',
    category: 'Multifamily',
    date: 'February 28, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=600&fit=crop',
    content: `## How Multifamily Loans Are Different

When you move from 1-4 unit residential into 5+ unit multifamily, the underwriting changes fundamentally. Lenders stop looking at you and start looking at the property as a business.

The three numbers that drive every multifamily underwriting decision: **NOI, Cap Rate, and DSCR.**

## Net Operating Income (NOI)

NOI is the property's annual income after operating expenses but before debt service (mortgage payments).

**NOI = Gross Rental Income - Vacancy - Operating Expenses**

**Gross Rental Income** includes:
- All unit rents (at market or actual, depending on the lender)
- Laundry income, parking fees, storage fees
- Any other recurring income from the property

**Vacancy allowance** is typically 5-10% of gross income, depending on the market and historical occupancy.

**Operating expenses** include:
- Property taxes
- Insurance
- Property management (typically 5-10% of gross income)
- Repairs and maintenance
- Utilities (if landlord-paid)
- Common area maintenance
- Legal and accounting
- Reserves for capital expenditures (CapEx)

**What's NOT in operating expenses:** Mortgage payments, depreciation, capital improvements. These are separate.

## Cap Rate (Capitalization Rate)

Cap rate tells you what return the property generates relative to its value, independent of financing.

**Cap Rate = NOI / Purchase Price (or Value)**

A 12-unit building with $120,000 NOI purchased at $1,500,000 has a cap rate of 8.0%.

**What cap rates mean:**
- **4-5%:** Class A, prime location, very stable. Common in NYC, LA, SF.
- **5-7%:** Class B, solid neighborhoods, most institutional targets.
- **7-9%:** Class C or value-add opportunities. Higher returns, more risk.
- **9%+:** Distressed, tertiary markets, or heavy value-add.

Cap rates vary dramatically by market. An 8% cap in Dallas is normal; an 8% cap in Manhattan means something is very wrong.

## DSCR for Multifamily

Multifamily DSCR works the same as residential — but the numbers are bigger and the threshold is stricter.

**DSCR = NOI / Annual Debt Service**

Most commercial and multifamily lenders require:
- **Agency (Fannie/Freddie):** 1.20-1.25 DSCR minimum
- **CMBS:** 1.25+ DSCR
- **Bank/credit union:** 1.20-1.30 DSCR
- **Bridge:** 1.0-1.10 DSCR (more flexible, higher rates)

## Debt Yield

Debt yield is a metric that's gaining importance, especially with CMBS lenders.

**Debt Yield = NOI / Loan Amount**

It measures the lender's return if they had to foreclose. Most lenders want 8-10%+ debt yield.

**Example:**
- NOI: $120,000
- Loan: $1,125,000
- Debt Yield = $120,000 / $1,125,000 = **10.7%**

This is a strong debt yield. The lender feels protected.

## Putting It Together: Sponsor Brief

When you submit a multifamily deal, lenders evaluate:

| Metric | Target | Our Example |
|--------|--------|-------------|
| NOI | Stable or growing | $120,000 |
| Cap Rate | Market appropriate | 8.0% |
| DSCR | 1.20+ | 1.52 |
| Debt Yield | 8%+ | 10.7% |
| LTV | Under 75% | 75% |
| Occupancy | 90%+ | 95% |

When all these metrics are green, you have lenders competing for your deal. When one or more is yellow, you need to know which programs are flexible on which metric.

## Financing Paths

**Agency (Fannie Mae / Freddie Mac):**
Best rates, longest terms, non-recourse. Requires stabilized property (90%+ occupancy), 1.25+ DSCR, clean sponsorship. 5+ units only.

**CMBS (Commercial Mortgage-Backed Securities):**
Non-recourse, good rates, less flexible. Works for stabilized assets. Higher debt yield requirements.

**Bank / Credit Union:**
Recourse, flexible terms, relationship-driven. Great for local operators and value-add deals.

**Bridge:**
Short-term (12-36 months), higher rates, maximum flexibility. Ideal for value-add, lease-up, or repositioning. Transition to permanent financing when stabilized.

## What We Do With Your Numbers

Our Sponsor Brief tool takes your NOI, purchase price, and loan request and generates a complete underwriting memo — DSCR, debt yield, cap rate, leverage analysis, and the best financing path for your deal.

You'll know in seconds whether your deal is a green light, yellow light, or needs restructuring.`,
  },
  {
    slug: 'miami-str-market-2026',
    title: 'Miami STR Market in 2026: What Investors Need to Know',
    excerpt: 'Occupancy rates, ADR trends, new regulations, and the best neighborhoods for short-term rental investments in Miami-Dade County.',
    category: 'Market Analysis',
    date: 'February 20, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1200&h=600&fit=crop',
    content: `## Miami's STR Market: The Numbers

Miami remains one of the strongest short-term rental markets in the country. Year-round warm weather, international tourism, business travel, and a thriving events calendar create consistent demand across all seasons.

**Key metrics for Miami-Dade County (2025-2026):**

- **Average Daily Rate (ADR):** $225-$350 depending on location and property type
- **Occupancy rate:** 68-78% annual average (higher in Miami Beach, lower in suburbs)
- **Average annual revenue:** $55,000-$95,000 for a well-positioned 1-2 bedroom
- **Revenue per available room (RevPAR):** $155-$250

These numbers make Miami one of the few markets where STR properties comfortably achieve 1.25+ DSCR on a DSCR loan — even with the conservative 75% income haircut.

## Best Neighborhoods for STR Investment

**Miami Beach / South Beach:**
Highest ADR ($300-500+), strong year-round occupancy. However: highest purchase prices, most competitive, and increasing regulation. Best for luxury units with ocean views.

**Wynwood / Design District:**
Art-driven tourism, young demographics, strong weekend demand. Lower entry price than Miami Beach. 1-bedrooms and studios perform well.

**Brickell / Downtown:**
Business travel + tourism. Consistent weekday demand from corporate travelers. Condo buildings with flexible rental policies are key — check HOA rules.

**Coconut Grove:**
Family-friendly, waterfront, slightly lower occupancy but higher ADR on larger properties. Good for 3+ bedroom houses targeting families.

**North Miami / Aventura:**
Lower entry prices, growing demand, less regulatory pressure. Value play for investors who want cash flow over premium ADR.

## Regulations to Watch

Miami-Dade County has a patchwork of STR regulations:

- **Miami Beach** has some of the strictest rules in the country. Short-term rentals under 6 months are prohibited in most residential zones. Single-family homes cannot be used as STRs. Condo buildings may allow it but check the association.
- **City of Miami** requires a Certificate of Use and resort tax registration. 30-day minimums in some zones.
- **Unincorporated Miami-Dade** is generally more permissive but still requires registration and resort tax collection.

**The trend:** Regulation is tightening across South Florida. Properties with existing STR permits and track records are becoming more valuable. Factor regulatory risk into your underwriting.

## Financing Your Miami STR

For DSCR loans on Miami STR properties, lenders want to see:

1. **Trailing 12-month Airbnb/VRBO statements** (or AirDNA projections for acquisitions)
2. **Conservative income calculation** (75% of gross)
3. **Flood insurance** (many Miami properties are in flood zones — this affects your PITI)
4. **Condo approval** (if applicable — some lenders have restricted condo lists)
5. **Wind mitigation report** (can significantly reduce insurance costs)

Insurance costs in South Florida have risen sharply. A property that looks great on rent-to-PITI may be borderline once you factor in $8,000-$15,000 annual insurance. Always get insurance quotes before you underwrite.

## The Bottom Line

Miami STR is still one of the best markets in the country for cash-flowing short-term rental investments. But it requires careful analysis — the right neighborhood, the right building, the right insurance, and the right financing structure.

Our STR Signal tool normalizes your Miami STR income and matches you with capital programs that understand the South Florida market. Run your numbers before you offer.`,
  },
  {
    slug: 'broker-partnership-benefits',
    title: 'Why Brokers Are Partnering With Correspondent Lenders in 2026',
    excerpt: 'Speed, product breadth, and AI tools are changing how mortgage brokers serve their investor clients. Here\'s how the model works.',
    category: 'Industry',
    date: 'February 15, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=600&fit=crop',
    content: `## The Broker's Dilemma

You're a mortgage broker. An investor calls with a 4-unit DSCR deal, a flip in another state, and a question about STR financing for a vacation property. Three different products, potentially three different wholesale channels, three different submission processes.

By the time you've sourced and submitted across three platforms, your investor has already gotten a term sheet from someone faster.

This is why the correspondent lending model is growing.

## What Is a Correspondent Lender?

A correspondent lender originates and funds loans using institutional capital programs. Unlike wholesale lenders who require you to submit through their specific portal, a correspondent partner gives you access to multiple programs through a single relationship.

**For brokers, this means:**
- **One submission** covers DSCR, fix & flip, STR, and multifamily
- **One point of contact** who knows your deals and your borrowers
- **Faster feedback** because the correspondent is underwriting alongside you, not just passing paper

## Why Speed Matters More Than Ever

Investor borrowers are the most demanding segment in mortgage. They're running numbers on multiple deals simultaneously. They expect same-day feedback on scenarios. They'll go with whoever gives them certainty first.

The old model — broker gets a scenario, calls three wholesale reps, waits for pricing, goes back to the borrower — is too slow for the current market.

**The new model:**
1. Broker submits scenario to correspondent partner
2. AI analysis returns a score, program match, and estimated terms in minutes
3. Broker sends the analysis to their investor client immediately
4. If the client wants to proceed, formal submission happens same day
5. Term sheet in 24 hours

The broker looks fast, informed, and in control. The investor gets certainty.

## AI Tools Change the Game

The biggest shift in correspondent lending isn't just speed — it's intelligence. AI-powered tools let brokers do things that used to require a seasoned underwriter:

- **DSCR calculation and scoring** before submission
- **Flip profitability analysis** at three ARV scenarios
- **STR income normalization** using conservative DSCR methodology
- **Multifamily Sponsor Briefs** with NOI, cap rate, and debt yield analysis

When you can send an investor a professional deal analysis within minutes of them sharing numbers, you're not just a broker — you're a strategic advisor.

## What to Look For in a Correspondent Partner

Not all correspondent relationships are equal. Here's what separates a good partner from a vendor:

1. **Product breadth.** Can they handle DSCR, bridge, STR, and commercial from one desk? Or do you need multiple relationships for different products?

2. **Speed to feedback.** Do you get same-day scenario responses? Or does it take 2-3 business days to hear back on a simple DSCR question?

3. **Technology.** Do they have tools you can use to run numbers yourself? Or are you always waiting on a human?

4. **Transparency.** Is compensation clear and consistent? Or does it change deal-to-deal?

5. **Support.** When a deal gets complicated, do they work it with you? Or do they just pass you to a voicemail?

## The Compensation Model

Broker compensation on correspondent deals is typically:

- **DSCR loans:** 1-2% of loan amount (varies by program and rate)
- **Bridge/flip:** 0.5-1.5% depending on deal size and complexity
- **Commercial/multifamily:** Negotiated per deal, typically 0.5-1%

The key is transparency. You should know your comp before the borrower is committed. No surprises at closing.

## Getting Started

The easiest way to evaluate a correspondent partner is to submit a real deal and see how the process works. Speed of response, quality of feedback, and ease of communication will tell you everything you need to know.

Our broker program gives you access to the AI Scenario Desk, Flip Lab, STR Signal, and Sponsor Brief tools — plus a dedicated point of contact for every deal. Apply and get access within 24 hours.`,
  },
  {
    slug: 'dscr-loan-requirements-2026',
    title: 'DSCR Loan Requirements in 2026: The Complete Investor Guide',
    excerpt: 'Everything you need to know about qualifying for a DSCR loan in 2026 — minimum credit scores, down payment tiers, DSCR ratio thresholds, and which properties are eligible.',
    category: 'DSCR',
    date: 'March 20, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop',
    content: `## DSCR Loan Requirements in 2026

DSCR loans have become the most popular financing tool for real estate investors who want to qualify on property income rather than personal income. But the requirements vary significantly between lenders. This guide breaks down exactly what you need to qualify in 2026 — from a direct lender that closes these deals every week.

## Minimum Credit Score

Most DSCR lenders require a **minimum credit score of 660**. However, the score you bring directly impacts your terms:

- **740+**: Best rates, lowest down payment (20%), most flexible terms
- **700-739**: Competitive rates, 25% down typical
- **660-699**: Higher rates, 25-30% down, may require higher DSCR
- **Below 660**: Limited options. Some lenders go to 620 with 30%+ down and DSCR above 1.25

**Pro tip:** If your credit is below 700, focus on improving it before applying. Even 20 points can save you 0.5-1% on your rate, which translates to thousands per year on a rental property.

## DSCR Ratio Requirements

The Debt Service Coverage Ratio is the single most important qualification metric. The formula is straightforward:

**DSCR = Monthly Rental Income / Monthly PITI**

Here is what most lenders require in 2026:

- **1.25+ DSCR**: Preferred tier. Best rates, most lender options, fastest approvals.
- **1.0-1.24 DSCR**: Standard tier. Most lenders will approve at this level.
- **0.75-0.99 DSCR**: Some lenders allow "no-ratio" or sub-1.0 DSCR. Expect higher rates and larger down payments.
- **Below 0.75**: Very limited options. The property likely does not generate enough income to support the debt.

At 818 Capital, we work with capital programs that accept DSCR as low as 0.75, but we always recommend structuring deals at 1.0+ for the best terms.

## Down Payment and LTV

DSCR loans typically require more equity than conventional mortgages:

- **Purchase**: 20-25% down payment (75-80% LTV)
- **Rate & Term Refinance**: Up to 80% LTV
- **Cash-Out Refinance**: Up to 75% LTV (some lenders allow 80%)

The down payment requirement is directly tied to your credit score, DSCR ratio, and property type. Higher-risk profiles require more equity.

## Eligible Property Types

DSCR loans cover a wide range of investment property types:

- Single-family residences (SFR)
- 2-4 unit properties (duplexes, triplexes, quads)
- Condos and townhomes (warrantable and non-warrantable)
- Short-term rental properties (Airbnb, VRBO)
- Portfolio loans (5+ properties in one loan)

**Not eligible:** Owner-occupied properties, raw land, or ground-up construction.

## Documentation Required

One of the biggest advantages of DSCR loans is the streamlined documentation:

**What you DO need:**
- Rental income documentation (lease agreement, rent roll, or STR platform statements)
- Property appraisal (ordered by the lender)
- Entity documents (LLC operating agreement, EIN)
- Insurance binder
- Title commitment
- 2-3 months bank statements (for reserves verification)

**What you DON'T need:**
- Tax returns
- W-2s or pay stubs
- Employment verification
- Debt-to-income ratio calculation

## Reserve Requirements

Most lenders require **6-12 months of PITI in liquid reserves** after closing. This ensures you can cover the mortgage even if the property is temporarily vacant.

Acceptable reserve sources include:
- Checking and savings accounts
- Retirement accounts (typically counted at 60-70% of value)
- Other real estate equity (in some cases)
- Gift funds (some lenders accept)

## Interest Rates in 2026

DSCR loan rates in 2026 typically range from **7.0% to 9.5%**, depending on:

- Credit score (higher score = lower rate)
- LTV (more equity = lower rate)
- DSCR ratio (higher ratio = lower rate)
- Property type (SFR is cheapest, multi-unit costs more)
- Loan amount (higher amounts often get better pricing)
- Prepayment penalty (accepting a prepay can reduce rate by 0.25-0.50%)

## How to Improve Your DSCR

If your deal is close but does not quite hit the DSCR threshold, here are strategies to improve it:

1. **Increase rent**: Research market rents and adjust if below market
2. **Reduce expenses**: Shop insurance, challenge tax assessments
3. **Increase down payment**: A larger down payment reduces your monthly PITI
4. **Buy down the rate**: Pay points to reduce the interest rate
5. **Choose interest-only**: Some DSCR products offer IO periods that improve the ratio

## Next Steps

Ready to run the numbers on your deal? Use our [DSCR Calculator](/dscr-loans#form) for an instant analysis, or call us at (917) 993-9194. As a direct lender, we can give you a term sheet within 24 hours and close in 14-21 days.`,
  },
  {
    slug: 'fix-flip-loan-calculator-2026',
    title: 'Fix and Flip Loan Calculator: How to Estimate Your Profit Before You Buy',
    excerpt: 'Learn how to calculate fix-and-flip profitability before you make an offer. Includes a step-by-step guide to estimating ARV, holding costs, and ROI.',
    category: 'Fix & Flip',
    date: 'March 18, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200&h=600&fit=crop',
    content: `## How to Calculate Fix and Flip Profit

Every successful flip starts with the numbers. Before you make an offer on a property, you need to know three things: what it will cost, what it will be worth after renovation, and how much profit is left after all expenses. This guide walks you through the math, step by step.

## The Core Formula

**Flip Profit = ARV - Purchase Price - Rehab Costs - Holding Costs - Selling Costs - Loan Costs**

Let us break down each component with a real-world example.

## Step 1: Estimate the After Repair Value (ARV)

ARV is what the property will sell for after your renovation is complete. This is the most important number in any flip analysis.

**How to estimate ARV:**
- Pull 3-5 comparable sales (comps) within 0.5 miles, sold in the last 6 months
- Adjust for differences in square footage, bedrooms, bathrooms, lot size, and finishes
- Use the average as your baseline
- Be conservative — overestimating ARV is the most common flip mistake

**Example:** You find a distressed 3/2 SFR listed at $200,000. Comparable renovated homes in the area are selling for $340,000-$380,000. You estimate a conservative ARV of $350,000.

## Step 2: Estimate Rehab Costs

Create a detailed scope of work for the renovation. Common rehab costs include:

| Item | Typical Cost Range |
|------|-------------------|
| Kitchen remodel | $15,000-$40,000 |
| Bathroom remodel (each) | $5,000-$15,000 |
| Flooring (whole house) | $5,000-$15,000 |
| Painting (interior/exterior) | $3,000-$8,000 |
| HVAC replacement | $5,000-$10,000 |
| Roof replacement | $8,000-$20,000 |
| Plumbing/electrical updates | $3,000-$10,000 |
| Landscaping | $2,000-$5,000 |

**Example:** Your property needs a full interior renovation. You estimate $65,000 in total rehab costs.

## Step 3: Calculate Holding Costs

Holding costs are the monthly expenses you pay while the property is being renovated and marketed for sale. Typical holding period: 4-8 months.

Monthly holding costs include:
- Loan interest payment
- Property taxes (monthly equivalent)
- Insurance
- Utilities
- HOA fees (if applicable)

**Example:** With a $233,000 loan at 10% interest-only, your monthly carry is approximately $1,940 in interest alone. Add $300/month for taxes and insurance, and $150 for utilities. Over a 6-month hold period: **$14,340 in holding costs.**

## Step 4: Estimate Selling Costs

When you sell the flipped property, expect to pay:
- Real estate agent commissions: 5-6% of sale price
- Closing costs (title, escrow, transfer taxes): 1-2%
- Staging and marketing: $2,000-$5,000

**Example:** At a $350,000 sale price with 6% commission and 1.5% closing costs: **$26,250 in selling costs.**

## Step 5: Calculate Loan Costs

Fix-and-flip loans come with upfront costs:
- Origination fee: 1-3 points (1-3% of loan amount)
- Processing and underwriting fees: $1,000-$2,500
- Appraisal: $500-$1,000

**Example:** On a $233,000 loan with 2 points origination: **$4,660 plus $1,500 in fees = $6,160 in loan costs.**

## Putting It All Together

Using our example:

| Component | Amount |
|-----------|--------|
| ARV (Sale Price) | $350,000 |
| - Purchase Price | $200,000 |
| - Rehab Costs | $65,000 |
| - Holding Costs (6 months) | $14,340 |
| - Selling Costs | $26,250 |
| - Loan Costs | $6,160 |
| **= Net Profit** | **$38,250** |

**Cash invested:** With a 90% LTC loan, you bring approximately $26,500 to close (10% of total cost plus loan fees). Your return on invested capital: **144%**.

## The 70% Rule

A quick screening tool: never pay more than **70% of ARV minus rehab costs**.

**Max Offer = (ARV x 0.70) - Rehab Costs**

In our example: ($350,000 x 0.70) - $65,000 = $180,000 max offer. Since the property is listed at $200,000, you would need to negotiate down or accept slimmer margins.

## How 818 Capital Finances Your Flip

As a direct lender, 818 Capital offers fix-and-flip loans with:
- Up to 90% of purchase + rehab (LTC)
- Up to 75% of ARV
- 12-18 month terms
- Interest-only payments
- Draw schedules released as work completes
- Close in as fast as 10 days

Our [Flip Lab](/fix-and-flip) tool analyzes your deal at three ARV scenarios so you can see your profit range before making an offer. Submit your deal at (917) 993-9194 or through our [scenario form](/dscr-loans#form).`,
  },
  {
    slug: 'no-tax-return-mortgage-investors',
    title: 'No Tax Return Mortgage for Investors: DSCR Loans Explained',
    excerpt: 'If your tax returns do not reflect your true income, you are not alone. DSCR loans let real estate investors qualify without tax returns, W-2s, or income verification.',
    category: 'DSCR',
    date: 'March 16, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop',
    content: `## Why Tax Returns Kill Investment Property Loans

If you are a real estate investor, you have probably experienced this frustrating cycle: you find a great rental property, apply for a loan, and get denied because your tax returns show low income. Why? Because you are doing exactly what your CPA told you to do — writing off depreciation, repairs, interest, and other deductions to minimize your tax bill.

The result: your tax returns show $40,000 in income while your actual cash flow is $150,000+. Traditional lenders only see the $40,000.

**This is the exact problem DSCR loans solve.**

## What Is a No Tax Return Mortgage?

A DSCR (Debt Service Coverage Ratio) loan is a type of investment property mortgage that qualifies you based on the **property's rental income** rather than your personal income. No tax returns. No W-2s. No pay stubs. No employment verification.

The lender evaluates one question: does this property generate enough rent to cover the mortgage payment?

If the answer is yes, you qualify. Your personal income, tax situation, and employment status are irrelevant.

## Who Benefits Most from DSCR Loans?

DSCR loans are ideal for investors who:

**Self-employed business owners** — Your tax returns are optimized for deductions, not mortgage qualification. DSCR bypasses this entirely.

**Full-time investors** — If real estate IS your job, traditional lenders often struggle to categorize your income. DSCR removes that friction.

**High-write-off professionals** — Doctors, attorneys, and consultants who aggressively deduct expenses often show low adjusted gross income despite high earnings.

**Foreign nationals** — Many DSCR programs accept foreign national borrowers who cannot provide US tax returns at all.

**Entity-based investors** — If you hold properties in LLCs, DSCR loans close directly in the entity name without requiring personal income qualification.

## How DSCR Qualification Works

The qualification process is straightforward:

1. **Property identification**: You identify a rental property (or refinance an existing one)
2. **Rental income verification**: The lender reviews the lease, rent roll, or short-term rental platform statements
3. **DSCR calculation**: Monthly rent is divided by monthly PITI (principal, interest, taxes, insurance)
4. **Ratio threshold**: If the DSCR meets the minimum (typically 1.0+), the deal qualifies
5. **Credit and reserves**: The lender checks your credit score (660+ minimum) and verifies reserves (6-12 months PITI)

**That is it.** No income calculation. No debt-to-income ratio. No tax return analysis.

## DSCR vs. Traditional Mortgage: Key Differences

| Feature | DSCR Loan | Traditional Mortgage |
|---------|-----------|---------------------|
| Income verification | Property income only | Full personal income docs |
| Tax returns required | No | Yes (2 years) |
| W-2s required | No | Yes |
| Employment verification | No | Yes |
| Debt-to-income ratio | Not applicable | Required (43-50% max) |
| Entity (LLC) closing | Yes | Rarely |
| Minimum credit score | 660 | 620 |
| Down payment | 20-25% | 15-25% |
| Close timeline | 14-21 days | 30-45 days |
| Interest rates | 7-9.5% | 6.5-8% |

The trade-off: DSCR loans have slightly higher rates than conventional mortgages, but the speed, flexibility, and qualification simplicity more than compensate for most investors.

## What About Short-Term Rental Income?

Yes — many DSCR lenders accept Airbnb and VRBO income. However, the income calculation is different:

- **Long-term rentals**: Use the lease amount as gross rent
- **Short-term rentals**: Use 75% of trailing 12-month gross STR income

This conservative calculation accounts for seasonality, vacancy, and operating expenses unique to short-term rentals. At 818 Capital, our STR Signal tool normalizes your Airbnb income into a lender-ready DSCR calculation automatically.

## Common Misconceptions

**"No doc means no paperwork."** False. DSCR loans still require an appraisal, title work, insurance, entity documents, and bank statements for reserves. "No doc" refers specifically to income documentation.

**"DSCR loans are only for experienced investors."** False. First-time investors qualify, though some lenders may require a slightly higher credit score or down payment.

**"The rates are too high."** Context matters. If a traditional loan takes 45 days and requires you to restructure your tax strategy, the "cheaper" rate costs you time and opportunity. A DSCR loan that closes in 14 days lets you capture deals faster.

## How 818 Capital Handles DSCR Loans

As a direct investment property lender, we fund DSCR loans across 48 states with:

- No tax returns or W-2s required
- Minimum 660 credit score
- Up to 80% LTV on purchase and refinance
- 1-4 unit properties, condos, STR properties
- Close in LLC or entity structure
- 14-21 day close timeline
- AI-powered scenario analysis for instant qualification

Submit your deal through our [scenario form](/dscr-loans#form) or call (917) 993-9194. We will give you an honest assessment within 24 hours — and if the numbers work, a term sheet the same day.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}
