import type { FundedDeal } from '@/components/DealCard';

const FUNDED_DEALS: FundedDeal[] = [
  {
    id: 1, city: 'Pensacola', state: 'FL', propertyType: 'SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO', ltv: 'N/A', rate: '10.49%', dealValue: '$195,000',
    image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&q=80',
    analysis: `12-month interest-only bridge loan for a Pensacola flip. IO structure keeps monthly carry costs low during the rehab period.\n\nAt 10.49%, the rate reflects a fast-close, low-doc execution. Pensacola's coastal market seeing 4–6% YoY appreciation. Projected ROI on invested capital: 25–40%.`,
  },
  {
    id: 2, city: 'Burleson', state: 'TX', propertyType: 'SFR', loanType: 'Fix & Flip',
    program: 'Bridge — 90% LTC / 100% Rehab', ltv: '90% LTC / 100% Rehab', rate: 'N/A', dealValue: '$265,000',
    // 220 SE Robert St — Burleson TX F&F, Martin Pascual
    image: '/property-images/PROMPT-37_220-SE-Robert-St.png',
    analysis: `Maximum leverage: 90% of acquisition plus 100% of rehab financed. Borrower brings minimal cash to close — ideal for scaling a flip portfolio.\n\nBurleson (DFW suburb) benefits from metro spillover demand. Projected net profit: $35K–$55K. ROI on cash invested: 50–80%.`,
  },
  {
    id: 3, city: 'Fort Worth', state: 'TX', propertyType: 'SFR', loanType: 'Fix & Flip',
    program: 'Bridge — 90% LTC / 100% Rehab', ltv: '90% LTC / 100% Rehab', rate: 'N/A', dealValue: '$310,000',
    // 4763 Westcreek Dr — Fort Worth TX F&F
    image: '/property-images/PROMPT-36_4763-Westcreek-Dr.png',
    analysis: `Another DFW-market flip with maximum financing. 90% LTC plus full rehab coverage means the borrower can execute multiple simultaneous projects.\n\nFort Worth's median home prices remain below DFW averages, offering larger ARV spreads. Projected ROI: 40–65% on invested capital.`,
  },
  {
    id: 4, city: 'Washington', state: 'DC', propertyType: 'SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — 90% LTC / 100% Rehab', ltv: '90% LTC / 100% Rehab', rate: '9.5%', dealValue: '$525,000',
    // 3505 24th St NE — 1925 brick bungalow, Woodridge neighborhood
    image: '/property-images/PROMPT-01_3505-24th-St_AFTER.png',
    analysis: `DC metro flip with premium ARV potential. At 9.5% IO with 90% LTC and full rehab funding, the borrower minimizes upfront cash while accessing a high-value market.\n\nDC's median home prices ($600K+) mean even modest renovations can generate $60K–$100K+ in profit. Projected ROI: 30–45%.`,
  },
  {
    id: 5, city: 'Silver Spring', state: 'MD', propertyType: 'SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — 90% LTC / 100% Rehab', ltv: '90% LTC / 100% Rehab', rate: '9.5%', dealValue: '$415,000',
    image: '/property-images/PROMPT-03_13429-Fairland_AFTER.png',
    analysis: `Silver Spring — DC suburb with strong demand from government and private-sector workers. 90% LTC with 100% rehab means the borrower deploys minimal equity.\n\nMontgomery County's high median income supports premium renovated-home pricing. Cash-on-cash ROI: 35–55%.`,
  },
  {
    id: 6, city: 'Washington', state: 'DC', propertyType: 'SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — 90% LTC / 100% Rehab', ltv: '90% LTC / 100% Rehab', rate: '9.5%', dealValue: '$490,000',
    // 6932 Chestnut Ave — DC residential, different property from #4
    image: '/property-images/PROMPT-04_6932-Chestnut_AFTER.png',
    analysis: `Second DC-area flip — repeat borrower scaling in the same market. Proven comps and contractor relationships reduce execution risk.\n\nRepeat deals improve margins. Projected profit: $55K–$90K. IO structure keeps monthly carry under $4K. Cumulative ROI across DC deals: 70–100%+.`,
  },
  {
    id: 7, city: 'St. Petersburg', state: 'FL', propertyType: '4-Unit Multifamily', loanType: 'DSCR Cash-Out',
    program: '30-Yr DSCR IO — Cash-Out Refi', ltv: '60%', rate: 'N/A', dealValue: '$720,000',
    // 5050 1st Ave S — St. Petersburg FL 4-Unit (real funded deal)
    image: '/property-images/PROMPT-12_5050-1st-Ave-S.png',
    analysis: `Cash-out refi on a 4-unit at 60% LTV — conservative leverage with strong equity retention. IO period maximizes cash flow.\n\nFour units provide income diversification. St. Pete's rental market growing 5–7% YoY. Projected cash-on-cash with IO: 10–14%.`,
  },
  {
    id: 8, city: 'Pigeon Forge', state: 'TN', propertyType: 'SFR — Short-Term Rental', loanType: 'DSCR Cash-Out',
    program: '30-Yr DSCR — 70% C/O / 75% R&T', ltv: '70%', rate: 'N/A', dealValue: '$385,000',
    image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
    analysis: `Smoky Mountains STR — one of the top vacation rental markets in the US. Pigeon Forge sees 12M+ visitors annually, driving year-round occupancy.\n\nSTR income typically 2–3x long-term rents. Projected gross yield: 15–22%. Net cash-on-cash: 10–15%.`,
  },
  {
    id: 9, city: 'Nashville', state: 'TN', propertyType: 'SFR — Short-Term Rental', loanType: 'DSCR Cash-Out',
    program: '30-Yr DSCR — 75% C/O / 80% R&T', ltv: '75%', rate: 'N/A', dealValue: '$445,000',
    // 1531 Douglas Ave — East Nashville craftsman bungalow
    image: '/property-images/PROMPT-24_Nashville-STR.png',
    analysis: `Nashville STR with cash-out refi at 75% LTV. Music City's tourism economy ($7B+ annually) creates consistent short-term rental demand.\n\nBorrower extracts equity for portfolio expansion while STR income covers debt service. Cash-on-cash return after refi: 11–16%.`,
  },
  {
    id: 10, city: 'Fort Myers', state: 'FL', propertyType: '33-Unit Multifamily', loanType: 'DSCR / Bridge',
    program: 'Agency Bridge — 80% of Cost Basis', ltv: '80% of cost basis', rate: 'N/A', dealValue: '$4,200,000',
    // 2771 Royal Palm Ave — Fort Myers 33-unit multifamily
    image: '/property-images/PROMPT-30_2771-Royal-Palm-Ave.png',
    analysis: `33-unit multifamily — institutional-grade asset at 80% of cost basis via agency bridge. Stabilize, then convert to permanent agency debt.\n\nFort Myers' population growth (top 5 nationally) drives strong rental demand. Projected stabilized NOI: $280K–$340K. Total ROI: 100–150% over 5 years.`,
  },
  {
    id: 11, city: 'White Settlement', state: 'TX', propertyType: 'Commercial / Industrial Flex', loanType: 'Commercial Refi',
    program: 'Life Co / CMBS', ltv: 'N/A', rate: '5.26–5.66%', dealValue: '$1,850,000',
    // Industrial/flex building exterior w/ overhead loading doors — White Settlement TX commercial/industrial
    image: 'https://images.unsplash.com/photo-1730215159668-1d8bb50c7c92?w=800&q=80',
    analysis: `Commercial retail refi via Life Company or CMBS — the lowest rates in commercial lending. At 5.26–5.66%, the borrower locks in institutional-grade pricing.\n\nLife Co/CMBS terms offer 10–25 year fixed-rate stability. DFW retail corridor. Projected cash-on-cash: 10–14%.`,
  },
  {
    id: 12, city: 'Cleveland', state: 'OH', propertyType: 'SFR', loanType: 'DSCR',
    program: '30-Yr DSCR', ltv: 'N/A', rate: 'N/A', dealValue: '$135,000',
    // Cleveland — white picket fence, modest neighborhood home, NO palm trees
    image: 'https://images.unsplash.com/photo-1768868949503-6226ee94bbeb?w=800&q=80',
    analysis: `Cleveland SFR — one of the top cash-flow markets in the US. Low acquisition costs relative to rental income create outsized DSCR ratios.\n\nMedian home prices under $150K with rents of $1,100–$1,400. DSCR ratios of 1.3–1.6x. Projected cash-on-cash return: 12–18%.`,
  },
  {
    id: 13, city: 'Sandpoint', state: 'ID', propertyType: 'Condo — Short-Term Rental', loanType: 'DSCR R&T',
    program: '30-Yr DSCR — Rate & Term', ltv: '75%', rate: 'N/A', dealValue: '$340,000',
    // Sandpoint — wooden lake cottages, rustic lakefront style
    image: 'https://images.unsplash.com/photo-1566065576695-cd6086cacde1?w=800&q=80',
    analysis: `Sandpoint, Idaho — premium lakeside resort market. Condo STR at 75% LTV via rate & term refi locks in long-term financing on a proven income property.\n\nLake Pend Oreille area draws year-round tourism. STR condos command $150–$300/night. Net cash-on-cash: 8–12%.`,
  },
  {
    id: 14, city: 'Seneca Falls', state: 'NY', propertyType: '2-Unit', loanType: 'DSCR Cash-Out',
    program: '30-Yr DSCR — Cash-Out Refi', ltv: '75%', rate: 'N/A', dealValue: '$185,000',
    // 218 Fall St — cozy older home surrounded by autumn foliage, upstate NY
    image: '/property-images/PROMPT-19_218-Fall-St.png',
    analysis: `2-unit duplex cash-out refi in upstate NY's Finger Lakes region. At 75% LTV, the borrower extracts equity while maintaining solid coverage.\n\nDual-unit income provides built-in vacancy protection. Projected cash-on-cash after refi: 10–15%. Classic BRRRR execution.`,
  },
  {
    id: 15, city: 'Garfield', state: 'NJ', propertyType: '2-Unit', loanType: 'DSCR Purchase',
    program: '30-Yr DSCR — Purchase', ltv: '80%', rate: 'N/A', dealValue: '$560,000',
    // Wood-frame 2-family homes w/ side-by-side porches on a wooded NJ commuter street — Garfield NJ 2-unit
    image: 'https://images.unsplash.com/photo-1716686135669-f342dc43c423?w=800&q=80',
    analysis: `North Jersey duplex purchase at 80% LTV — strong leverage in a high-rent market. Bergen County's proximity to NYC drives premium rents of $1,800–$2,400/unit.\n\nProjected cash-on-cash: 7–10%. NYC commuter demand ensures low vacancy. 5-year equity build: 35–50%.`,
  },
  {
    id: 16, city: 'Seneca Falls', state: 'NY', propertyType: '3-Unit', loanType: 'DSCR Purchase',
    program: '30-Yr DSCR — Purchase', ltv: '70%', rate: 'N/A', dealValue: '$225,000',
    // 31 Blakely Pl — Seneca Falls NY 3-unit
    image: '/property-images/PROMPT-18_31-Blakely-Pl.png',
    analysis: `3-unit triplex purchase at 70% LTV — conservative leverage with three income streams. More units per property = better expense ratios and vacancy protection.\n\nThree units at $900–$1,100/mo each provide $2,700–$3,300 gross monthly. DSCR: 1.4–1.7x. Cash-on-cash: 11–16%.`,
  },
  {
    id: 17, city: 'Grandview', state: 'MO', propertyType: 'SFR', loanType: 'DSCR R&T',
    program: '30-Yr DSCR — Rate & Term', ltv: '80%', rate: 'N/A', dealValue: '$165,000',
    // 8001 E 130th Ct — Kansas City suburb ranch
    image: '/property-images/PROMPT-13_8001-E-130th-Ct.png',
    analysis: `Kansas City metro SFR — rate & term refi at 80% LTV optimizes existing debt structure. 30-year fixed rate locked in.\n\nGrandview's affordable entry points with growing rental demand. Cash-on-cash return: 8–12%. R&T refi likely reduces monthly payments immediately.`,
  },
  {
    id: 18, city: 'Tulsa', state: 'OK', propertyType: 'SFR', loanType: 'DSCR Cash-Out',
    program: '30-Yr DSCR — Cash-Out Refi', ltv: '75%', rate: 'N/A', dealValue: '$195,000',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    analysis: `Tulsa cash-out refi at 75% LTV — harvests equity from an appreciated property while maintaining positive cash flow. Oklahoma's landlord-friendly laws add efficiency.\n\nMedian prices $180K–$220K with rents of $1,100–$1,400. Cash-on-cash after refi: 9–13%.`,
  },
  {
    id: 19, city: 'Woodstock', state: 'NY', propertyType: '2-Unit', loanType: 'DSCR Purchase',
    program: '30-Yr DSCR — Purchase', ltv: '60%', rate: 'N/A', dealValue: '$425,000',
    // Woodstock — old Cape Cod beach cottage style, modest
    // Modern black-stained wooded cabin in forest clearing at dusk — Hudson Valley / Catskills 2-unit
    image: 'https://images.unsplash.com/photo-1724931420584-d360afc3e1f8?w=800&q=80',
    analysis: `Woodstock duplex at 60% LTV — conservative leverage in a desirable Hudson Valley market. Heavy equity position means lower payments and stronger cash flow.\n\nWoodstock's tourism economy supports both long-term and STR strategies. Cash-on-cash: 6–9% traditional, or 10–15% with one STR unit.`,
  },
  {
    id: 20, city: 'Woodstock', state: 'NY', propertyType: '2-Unit', loanType: 'DSCR Purchase',
    program: '30-Yr DSCR — Purchase', ltv: '75%', rate: 'N/A', dealValue: '$390,000',
    // Woodstock — woodland house with natural surroundings
    // Blue wood-frame 2-unit w/ rear deck + exterior stairs — second Woodstock NY 2-unit
    image: 'https://images.unsplash.com/photo-1675583084392-9e7dbe30f3b6?w=800&q=80',
    analysis: `Second Woodstock duplex — higher leverage at 75% LTV preserves capital for additional deals. Combined portfolio averages ~68% LTV.\n\nScaling in the same market reduces management friction. Blended cash-on-cash: 8–12%. Hudson Valley popularity with remote workers supports rent growth.`,
  },
  {
    id: 21, city: 'Lawrenceville', state: 'GA', propertyType: 'SFR', loanType: 'DSCR Cash-Out IO',
    program: '30-Yr DSCR — Cash-Out IO', ltv: '50%', rate: 'N/A', dealValue: '$285,000',
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
    analysis: `Ultra-conservative 50% LTV cash-out with interest-only payments. IO structure maximizes cash flow while low leverage provides maximum downside protection.\n\nLawrenceville (Gwinnett County, Atlanta metro) — one of the fastest-growing Southeast suburbs. IO payments boost cash-on-cash to 12–18%.`,
  },
  {
    id: 22, city: 'Albuquerque', state: 'NM', propertyType: 'SFR', loanType: 'DSCR',
    program: '30-Yr DSCR', ltv: 'N/A', rate: 'N/A', dealValue: '$275,000',
    // NM — adobe/stucco style, earth tones, southwestern
    image: 'https://images.unsplash.com/photo-1716634873234-9339ba0547f7?w=800&q=80',
    analysis: `New Mexico SFR — an emerging cash-flow market with low entry costs and solid rental demand. Growing tech and healthcare sectors drive consistent tenant demand.\n\nMedian prices $280K–$320K with rents of $1,300–$1,700. Cash-on-cash: 8–12%. Low property taxes enhance net returns.`,
  },
  {
    id: 23, city: 'Los Fresnos', state: 'TX', propertyType: 'SFR', loanType: 'DSCR',
    program: '30-Yr DSCR', ltv: 'N/A', rate: 'N/A', dealValue: '$175,000',
    // Los Fresnos TX — small ranch house on green field, single story
    // Red-sided single-story ranch w/ white trim + split-rail fence — Los Fresnos TX small-town SFR
    image: 'https://images.unsplash.com/photo-1774655762504-5f3a07999cd7?w=800&q=80',
    analysis: `Rio Grande Valley SFR — one of the most affordable markets in Texas with strong rental demand from border trade and healthcare employment.\n\nLow acquisition costs and rents of $1,100–$1,400 create excellent rent-to-price ratios. DSCR: 1.3–1.5x. Cash-on-cash: 10–15%.`,
  },
  {
    id: 24, city: 'Oakland', state: 'CA', propertyType: '5-Unit Multifamily', loanType: 'DSCR',
    program: '30-Yr DSCR', ltv: 'N/A', rate: 'N/A', dealValue: '$1,150,000',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    analysis: `Oakland 5-unit value-add play — older building in a high-demand Bay Area rental market. DSCR financing on the as-is income with upside from unit renovations.\n\nOakland rents for renovated units run $2,200–$3,000+. Built-in value-add opportunity. Post-renovation cash-on-cash: 8–12%. Appreciation potential 6–10% YoY.`,
  },
  {
    id: 25, city: 'Portland', state: 'ME', propertyType: 'SFR', loanType: 'DSCR',
    program: '30-Yr DSCR', ltv: 'N/A', rate: 'N/A', dealValue: '$365,000',
    // Portland ME — tiny Victorian house in Maine, shot on 35mm film
    image: 'https://images.unsplash.com/photo-1579873666517-3a6620fecba4?w=800&q=80',
    analysis: `Maine SFR — Portland's tourism and food scene create dual rental strategies: long-term tenants in winter, premium STR rates in summer.\n\nBlended gross yield: 8–12%. Limited housing supply and Boston remote worker demand support 4–6% YoY appreciation. Cash-on-cash: 7–10%.`,
  },
  {
    id: 26, city: 'Linden', state: 'NJ', propertyType: 'SFR', loanType: 'DSCR',
    program: '30-Yr DSCR', ltv: 'N/A', rate: 'N/A', dealValue: '$395,000',
    image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&q=80',
    analysis: `Linden, NJ — Union County commuter town with strong rental demand from NYC/Newark workers. NJ Transit access makes this desirable despite lower acquisition costs.\n\nRents of $2,000–$2,600 on homes priced $350K–$450K create solid DSCR ratios. Cash-on-cash: 7–10%.`,
  },
  {
    id: 27, city: 'Syosset', state: 'NY', propertyType: '2-Family', loanType: 'DSCR Purchase',
    program: '30-Yr DSCR — Purchase', ltv: '60%', rate: 'N/A', dealValue: '$825,000',
    // Syosset — modest suburban house with cars in driveway, Long Island
    // Gray 2-story suburban home w/ gables + wrap porch + red maple — Syosset Long Island 2-family
    image: 'https://images.unsplash.com/photo-1762374974129-f9266d9c4efc?w=800&q=80',
    analysis: `Long Island 2-family in Nassau County — one of the most supply-constrained rental markets in the Northeast. Syosset's top-rated schools and LIRR access drive premium demand.\n\nAt 60% LTV, significant equity protection. Dual-unit income of $3,000–$4,500/mo combined. Cash-on-cash: 6–9%.`,
  },
  {
    id: 28, city: 'Washington', state: 'DC', propertyType: 'SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — Heavy Rehab', ltv: '90% LTC / 100% Rehab', rate: 'N/A', dealValue: '$978,000',
    // 1614 Decatur St NW — Federal-style red brick DC rowhouse with columned entry (Petworth/16th St Heights)
    image: '/property-images/PROMPT-02_3521-16th-St_AFTER.png',
    analysis: `Decatur Street rowhouse flip in the Petworth / 16th Street Heights corridor — one of DC's fastest-appreciating inner submarkets. Metro-accessible neighborhoods inside the Diamond have seen sustained 5–8% YoY gains.\n\nFull interest-only bridge with 90% acquisition plus 100% rehab draws lets the sponsor recycle capital across concurrent DC flips. Target ARV spread of $200K+ on a 4–6 month renovation. Projected net profit: $120K–$180K. ROI on invested capital: 55–85%.`,
  },
  {
    id: 29, city: 'Falls Church', state: 'VA', propertyType: 'SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — 90% LTC / 100% Rehab', ltv: '90% LTC / 100% Rehab', rate: 'N/A', dealValue: '$432,000',
    // Falls Church VA — classic red brick Colonial with white shutters, dormers, green lawn
    image: 'https://images.unsplash.com/photo-1631667711791-c01bcc6b153f?w=800&q=80',
    analysis: `Northern Virginia brick Colonial inside the Beltway — Falls Church consistently ranks among the top school districts in the DMV and commands a significant premium vs. comparable Fairfax County inventory.\n\nHigh-velocity buyer pool of federal contractors, DoD relocations, and dual-income professional households. Renovated 4-bed homes clear at $800K–$1.2M. IO bridge keeps monthly carry tight during a 5–7 month reposition. Projected net profit: $90K–$140K. ROI on invested capital: 45–70%.`,
  },
  {
    id: 30, city: 'Washington', state: 'DC', propertyType: 'Condo', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — Condo Reposition', ltv: '80% LTC / 100% Rehab', rate: 'N/A', dealValue: '$385,000',
    // 700 7th St SW — DC mid-rise red brick condo with ground-floor retail (Navy Yard/14th St corridor aesthetic)
    image: '/property-images/PROMPT-05_700-7th-St_AFTER.png',
    analysis: `Downtown DC condo reposition — walkable to Navy Yard, L'Enfant Plaza, and the Wharf. Institutional-grade building in one of the strongest walk-score submarkets in the metro.\n\nCondo-specific bridge underwriting accounts for HOA financials, reserve adequacy, and insurance walls. Renovated 1-bed units resell to federal workers and young professionals at $550K–$700K. 12-month IO matched to a lean cosmetic rehab (kitchens, baths, floors, paint). Projected net profit: $55K–$85K. ROI on invested capital: 40–65%.`,
  },
  {
    id: 31, city: 'Cleveland', state: 'OH', propertyType: 'Small-Balance Commercial', loanType: 'Commercial Bridge',
    program: 'Small-Balance Commercial Bridge', ltv: '70% LTV', rate: 'N/A', dealValue: '$111,200',
    // Cleveland OH — Rust Belt red brick commercial with loading bay, authentic Ohio small-balance commercial
    image: 'https://images.unsplash.com/photo-1698935139911-875aa698d77d?w=800&q=80',
    analysis: `Cleveland small-balance commercial acquisition in the E 69th / Kinsman corridor — part of the broader East Side industrial-to-mixed-use repositioning trend. Cleveland's cost basis for commercial properties remains 40–60% below Midwest peer cities.\n\nAt 70% LTV, bridge execution provides speed advantage over agency and CMBS while the sponsor stabilizes operations and tenant mix. Cap rate compression opportunity: acquire at 9–11% going-in, exit at 7.5–8.5% on stabilized NOI. 12–18 month hold to permanent financing.`,
  },
];

export default FUNDED_DEALS;
