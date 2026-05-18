import type { FundedDeal } from '@/components/DealCard';

// Recent loan scenarios 818 Capital has quoted, underwritten, or is actively
// working in the last 90 days. Addresses, borrower names, and pipeline status
// are intentionally omitted — this is a showcase of deal *types*, markets,
// structures, and indicative terms, not a public CRM.
const RECENT_SCENARIOS: FundedDeal[] = [
  // ─── Fix & Flip ───────────────────────────────────────────
  {
    id: 101, city: 'Washington', state: 'DC', propertyType: 'SFR Rowhouse', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — 90% LTC / 100% Rehab', ltv: '90% LTC / 100% Rehab', rate: 'N/A', dealValue: '$650,000',
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
    analysis: `Mt. Pleasant / 16th Street NW corridor — three-story brick rowhouse in one of DC's most consistent appreciation submarkets. Metro-accessible inner neighborhoods inside the Diamond have run 5–8% YoY for the better part of a decade.\n\n12-month IO bridge with 90% LTC plus 100% rehab funding lets the sponsor run a tight 5–6 month renovation without parking cash. Projected ARV spread of $150K–$220K. Net profit target: $90K–$140K. Cash-on-cash ROI: 50–80%.`,
  },
  {
    id: 102, city: 'Weston', state: 'CT', propertyType: 'SFR Colonial', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — 90% LTC / 100% Rehab', ltv: '90% LTC / 100% Rehab', rate: 'N/A', dealValue: '$925,000',
    image: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80',
    analysis: `Upscale 3,000–3,500 sqft Colonial in affluent Fairfield County. Weston's NY-commuter demand and top-tier school district drive renovated home pricing $1.4M+.\n\nIO bridge keeps carry tight through a 6–8 month repositioning of the cedar-shake exterior and dated interior. Sponsor brings construction track record. Projected net profit: $150K–$220K. Cash-on-cash ROI: 40–60%.`,
  },
  {
    id: 103, city: 'New Marlborough', state: 'MA', propertyType: 'Lake Cottage SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — Heavy Rehab', ltv: '85% LTC / 100% Rehab', rate: 'N/A', dealValue: '$285,000',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
    analysis: `872 sqft Berkshires lake cottage on Lake Buel. Small footprint, large lot, waterfront access — the trifecta for restored second-home buyers and high-end STR investors out of Boston and NYC.\n\nLight structural plus full cosmetic rehab. Comp set of restored Berkshires cottages clears $550K–$700K. Projected net profit: $80K–$130K. ROI on invested capital: 60–95%.`,
  },
  {
    id: 104, city: 'Arlington', state: 'TX', propertyType: 'Estate SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — 85% LTC / 100% Rehab', ltv: '85% LTC / 100% Rehab', rate: 'N/A', dealValue: '$815,000',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    analysis: `5BR/5BA / 5,545 sqft estate on an elevated lot with canal and treetop views. Mid-1970s build in an established West Arlington subdivision — strong DFW estate-tier demand from corporate relocations.\n\nDeep cosmetic + selective structural reposition. Renovated estate-tier DFW comps run $1.1M–$1.4M. IO structure matches the 6–8 month timeline. Projected net profit: $180K–$280K. Cash-on-cash ROI: 35–55%.`,
  },
  {
    id: 105, city: 'Colleyville', state: 'TX', propertyType: 'Upscale SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — 90% LTC / 100% Rehab', ltv: '90% LTC / 100% Rehab', rate: 'N/A', dealValue: '$770,000',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    analysis: `Affluent Tarrant County DFW suburb — Colleyville's top-rated schools and proximity to DFW airport drive sustained buyer demand for renovated 4-bed homes.\n\n3,500–4,500 sqft 1990s traditional getting a modern transitional refresh. Sponsor has multiple completed DFW flips. Projected net profit: $130K–$190K. Cash-on-cash ROI: 45–70%.`,
  },
  {
    id: 106, city: 'Tucson', state: 'AZ', propertyType: 'Sonoran Desert SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge IO — 85% LTC / 100% Rehab', ltv: '85% LTC / 100% Rehab', rate: 'N/A', dealValue: '$355,000',
    image: 'https://images.unsplash.com/photo-1623298317883-6b70254edf31?w=800&q=80',
    analysis: `East Tucson SFR with Catalina Mountain backdrop. Sonoran Desert-style reposition — converting a dated 1980s stucco home into a modern Southwest contemporary with xeriscape landscaping.\n\nTucson's affordable entry vs. Phoenix plus inbound migration from California supports steady appreciation. Renovated comps in similar Tucson submarkets clear $450K–$525K. Projected net profit: $55K–$85K. Cash-on-cash ROI: 35–55%.`,
  },
  {
    id: 107, city: 'Lakefront', state: 'AZ', propertyType: 'Newer-Build SFR', loanType: 'Fix & Flip',
    program: '12-Mo Bridge — Light Cosmetic', ltv: '80% LTC', rate: 'N/A', dealValue: '$475,000',
    image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&q=80',
    analysis: `Newer-build 2010s two-story stucco home backing directly onto a small neighborhood lake. Minor garage drywall fire damage — the entire rehab is essentially cosmetic plus a single restoration line item.\n\nPremium lakefront lot in a suburban AZ market drives ARV. Fast 60–90 day project. Projected net profit: $45K–$70K. Cash-on-cash ROI: 50–75%.`,
  },

  // ─── DSCR / Rental ────────────────────────────────────────
  {
    id: 108, city: 'Raytown', state: 'MO', propertyType: 'Mid-Century SFR', loanType: 'DSCR Rental',
    program: '30-Yr DSCR — Purchase', ltv: '80%', rate: 'N/A', dealValue: '$150,000',
    image: 'https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=800&q=80',
    analysis: `Kansas City suburb brick-front ranch — the heart of the Midwest cash-flow lane. Rents of $1,200–$1,500 against $150K acquisition produce a DSCR comfortably above 1.4x.\n\nMissouri's landlord-friendly statutes reduce eviction friction. Cash-on-cash return: 10–14%. The kind of deal scaled investors stack 10–20 deep.`,
  },
  {
    id: 109, city: 'Cleveland', state: 'OH', propertyType: '2-Unit Duplex', loanType: 'DSCR Purchase',
    program: '30-Yr DSCR — Purchase', ltv: '75%', rate: 'N/A', dealValue: '$139,000',
    image: 'https://images.unsplash.com/photo-1599423300746-b62533397364?w=800&q=80',
    analysis: `Classic early-1900s Cleveland duplex — Hough/Glenville-adjacent block. One unit Section 8 leased, the other market-rate.\n\nSection 8 income stability plus market-rate upside on the other unit produces a blended DSCR near 1.6x. Cleveland's low entry basis and Section 8 floor make it one of the most defensible cash-flow markets in the country. Cash-on-cash return: 13–18%.`,
  },
  {
    id: 110, city: 'Canton', state: 'OH', propertyType: '2-Unit Duplex', loanType: 'DSCR Purchase',
    program: '30-Yr DSCR — Purchase', ltv: '75%', rate: 'N/A', dealValue: '$135,000',
    image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80',
    analysis: `Older 1920s-era two-story wood-frame duplex in working-class Canton, OH. Low cost basis with dual income streams.\n\nRust Belt duplexes pencil because the price-to-rent ratios stay favorable even as the rest of the country compresses. Blended DSCR ~1.4x. Cash-on-cash return: 10–14%. Buy-and-hold with eventual refi upside.`,
  },
  {
    id: 111, city: 'Belleville', state: 'IL', propertyType: '2-Unit Duplex', loanType: 'DSCR Cash-Out Refi',
    program: '30-Yr DSCR — Cash-Out', ltv: '75%', rate: 'N/A', dealValue: '$165,000',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    analysis: `St. Louis Metro East 2-unit collecting $2,225/mo combined. Cash-out refi at 75% LTV pulls equity for the next acquisition while keeping coverage above 1.3x.\n\nMetro East benefits from St. Louis-spillover demand without St. Louis property tax burden. Cash-on-cash post-refi: 9–13%.`,
  },
  {
    id: 112, city: 'St. Joseph', state: 'MO', propertyType: '2-Unit Duplex', loanType: 'DSCR Cash-Out Refi',
    program: '30-Yr DSCR — Cash-Out', ltv: '75%', rate: 'N/A', dealValue: '$155,000',
    image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80',
    analysis: `Historic St. Joseph MO duplex generating $1,950/mo. Refi capture of trapped equity. NW Missouri's low cost basis supports outsized rent-to-price ratios.\n\nDSCR coverage strong even at 75% LTV. Cash-on-cash return: 9–13%. Stable Section 8 tenant base in the submarket.`,
  },
  {
    id: 113, city: 'St. Joseph', state: 'MO', propertyType: '2-Unit Duplex', loanType: 'DSCR Cash-Out Refi',
    program: '30-Yr DSCR — Cash-Out (Challenging Underwrite)', ltv: '70%', rate: 'N/A', dealValue: '$140,000',
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80',
    analysis: `Companion duplex in the same St. Joseph submarket — challenging underwrite due to thin rent margins and older condition. We structured at 70% LTV instead of 75% to keep coverage above 1.2x.\n\nThe kind of deal most lenders pass on cold. Tighter LTV + a borrower with proven Section 8 management track record made this one fundable. Cash-on-cash return after refi: 8–11%.`,
  },
  {
    id: 114, city: 'Tacoma', state: 'WA', propertyType: 'Craftsman SFR + ADU', loanType: 'DSCR Cash-Out',
    program: '30-Yr DSCR — Cash-Out (Garage-to-ADU Conversion)', ltv: '70%', rate: 'N/A', dealValue: '$495,000',
    image: '/property-images/PROMPT-23_Tacoma-Craftsman.png',
    analysis: `Pacific Northwest craftsman bungalow with a garage-to-ADU conversion. Two income streams from a single lot in an established Tacoma neighborhood.\n\nADU income materially boosts DSCR — coverage well above 1.4x at 70% LTV. Tacoma's Seattle-spillover demand and WA's tight rental supply support 4–6% YoY rent growth. Cash-on-cash return: 8–11%.`,
  },
  {
    id: 115, city: 'Sedona', state: 'AZ', propertyType: 'STR SFR', loanType: 'DSCR Bridge',
    program: '24-Mo Bridge — STR-Qualified', ltv: '70%', rate: 'N/A', dealValue: '$1,052,000',
    image: 'https://images.unsplash.com/photo-1611516491426-03025e6043c8?w=800&q=80',
    analysis: `Red rock country STR — 3BR/3BA / 2,174 sqft, 1974 build, $1.052M appraised. Sedona STR market commands $400–$650/night peak season with strong year-round occupancy.\n\nBridge financing carries the asset through STR seasoning until conventional DSCR qualifies on operating history. Projected gross yield: 14–20%. Net cash-on-cash: 9–14%.`,
  },
  {
    id: 116, city: 'Village of Oak Creek', state: 'AZ', propertyType: 'Resort SFR', loanType: 'Bridge / Sale Exit',
    program: '12-Mo Bridge — Sale-Exit Strategy', ltv: '65%', rate: 'N/A', dealValue: '$1,100,000',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    analysis: `2,890 sqft SFR built 2003 in the Village of Oak Creek — golf-community-feel area with the Sedona red rock backdrop. Sponsor's exit is a market sale within 12 months.\n\nConservative 65% LTV on a sale-exit bridge accommodates seasonal Sedona market timing. Comp set supports a clear resale path at $1.3M–$1.5M. The play is patient capital plus the right listing window.`,
  },
  {
    id: 117, city: 'Naples', state: 'FL', propertyType: '2-Unit Duplex', loanType: 'DSCR Cash-Out Refi',
    program: '30-Yr DSCR — Cash-Out', ltv: '70%', rate: 'N/A', dealValue: '$1,000,000',
    image: 'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=800&q=80',
    analysis: `Naples duplex generating $5,900/mo combined — premium Southwest Florida rental income. Cash-out refi at 70% LTV unlocks equity for portfolio expansion.\n\nNaples rental demand stays sticky year-round despite hurricane and insurance pressure — second-home and seasonal-tenant economics underpin pricing. Coverage above 1.4x. Cash-on-cash post-refi: 7–10%.`,
  },
  {
    id: 118, city: 'Naples', state: 'FL', propertyType: '2-Unit Duplex', loanType: 'DSCR Cash-Out Refi',
    program: '30-Yr DSCR — Cash-Out', ltv: '70%', rate: 'N/A', dealValue: '$725,000',
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=80',
    analysis: `Suburban inland Naples duplex collecting $4,500/mo on a ~$725K basis. Steady DSCR coverage at 70% LTV in a market where most Florida lenders have tightened.\n\nPortfolio borrower scaling a Naples duplex stack — repeatable structure across three concurrent refis. Cash-on-cash post-refi: 8–11%.`,
  },
  {
    id: 119, city: 'Naples', state: 'FL', propertyType: '2-Unit Duplex', loanType: 'DSCR Cash-Out Refi',
    program: '30-Yr DSCR — Cash-Out', ltv: '70%', rate: 'N/A', dealValue: '$750,000',
    image: 'https://images.unsplash.com/photo-1574691250077-03a929faece5?w=800&q=80',
    analysis: `Older Naples rental compound generating $5,500/mo combined. Strong yield-to-basis in a submarket dominated by single-family stock — duplexes here trade at a structural premium.\n\nDSCR financing on the as-is income with a clear upside path if the sponsor decides to renovate either unit to STR-grade. Cash-on-cash post-refi: 8–11%.`,
  },

  // ─── Multifamily / Commercial ─────────────────────────────
  {
    id: 120, city: 'Silver Spring', state: 'MD', propertyType: '26-Unit Multifamily', loanType: 'Multifamily Cash-Out Refi',
    program: 'Agency / Bank Bridge — Cash-Out Refi', ltv: '70%', rate: 'N/A', dealValue: '$5,200,000',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
    analysis: `26-unit post-war brick apartment building, mixed 2BR/3BR/4BR mix, 100% occupied. Built 1949 in Montgomery County MD — one of the most supply-constrained rental markets in the DC metro.\n\nCash-out refi captures stabilized equity. Trapped-cash play for a sponsor scaling into a second multifamily acquisition. Going-in cap rate 6.5–7.0%; coverage well above 1.25x.`,
  },
  {
    id: 121, city: 'Washington', state: 'DC', propertyType: '9-Unit Multifamily', loanType: 'Multifamily Acquisition',
    program: 'Bridge — Value-Add Stabilization', ltv: '75% LTC', rate: 'N/A', dealValue: '$2,100,000',
    image: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80',
    analysis: `9-unit value-add acquisition in the Anacostia submarket. Bridge structure carries the asset through unit-by-unit reposition and rent-roll lift before a permanent agency refi.\n\nAnacostia has the strongest YoY rent growth in DC's emerging submarkets. Stabilized exit at 6.5–7.0% cap supports a 25–40% equity multiple over a 24–30 month hold.`,
  },
  {
    id: 122, city: 'Fort Worth', state: 'TX', propertyType: 'Commercial Flex / Industrial', loanType: 'Commercial Bridge',
    program: 'Small-Balance Commercial Bridge', ltv: '70%', rate: 'N/A', dealValue: '$1,450,000',
    image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80',
    analysis: `Two-suite multi-tenant industrial / flex acquisition on the south Fort Worth commercial corridor. Flex-industrial is one of the most resilient asset classes through this cycle — short-term lease structures, sticky tenants, low capex.\n\nBridge execution provides speed advantage over CMBS while the sponsor stabilizes tenancy. Going-in cap rate 8.5–9.5%; stabilized exit at 7.5–8.0% supports a clean refi path.`,
  },

  // ─── Ground-Up Construction ───────────────────────────────
  {
    id: 123, city: 'Scottsdale', state: 'AZ', propertyType: 'Luxury Ground-Up SFR', loanType: 'Construction',
    program: 'Ground-Up Construction — 80% LTC', ltv: '80% LTC', rate: 'N/A', dealValue: 'ARV $4,500,000',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    analysis: `Luxury ground-up new build near the Paradise Valley border — plans approved, permits in hand, ARV $4.5M. Scottsdale's high-end SFR market remains one of the strongest pricing tiers in the Southwest.\n\nGround-up construction at 80% LTC funds land plus vertical build draws. Experienced sponsor with multiple completed AZ luxury new builds. Projected net profit: $600K–$900K. ROI on invested capital: 30–45%.`,
  },
  {
    id: 124, city: 'Phoenix', state: 'AZ', propertyType: 'Luxury Ground-Up SFR', loanType: 'Construction',
    program: 'Ground-Up Construction — 80% LTC', ltv: '80% LTC', rate: 'N/A', dealValue: 'ARV $4,500,000',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&q=80',
    analysis: `Arcadia (Phoenix 85018) luxury ground-up — one of the most desirable Phoenix submarkets, mountain-adjacent, walkable to high-end retail and dining. Plans + permits in place, ARV $4.5M.\n\nArcadia new construction trades at the top of the Phoenix luxury comp set. Construction draw schedule matched to milestone inspections. Projected net profit: $550K–$850K. ROI on invested capital: 30–45%.`,
  },
  {
    id: 125, city: 'Fort Worth', state: 'TX', propertyType: 'Ground-Up SFR', loanType: 'Construction',
    program: 'Construction Loan — Funded, In Build', ltv: '80% LTC', rate: 'N/A', dealValue: '$325,000',
    image: 'https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=800&q=80',
    analysis: `Ground-up SFR construction in suburban Fort Worth — funded and currently vertical. Sponsor running multiple concurrent TX SFR construction loans.\n\nDFW infill new construction supports a clean exit at $425K–$475K. Construction draw structure tracks milestone completion. Projected net profit: $50K–$80K. ROI on invested capital: 35–55%.`,
  },
  {
    id: 126, city: 'Burleson', state: 'TX', propertyType: 'Ground-Up SFR', loanType: 'Construction',
    program: 'Construction Loan — Active Build', ltv: '80% LTC', rate: 'N/A', dealValue: '$295,000',
    image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&q=80',
    analysis: `Small-town Burleson TX SFR construction — DFW spillover market with steady end-buyer demand for new infill product. Construction loan structured at 80% LTC with milestone-based draws.\n\nBurleson new construction comps clear $385K–$420K. Same sponsor running the Fort Worth construction loan above. Projected net profit: $45K–$70K. ROI on invested capital: 35–55%.`,
  },
];

export default RECENT_SCENARIOS;
