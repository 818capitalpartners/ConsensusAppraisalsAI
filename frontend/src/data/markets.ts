/**
 * Market data for programmatic SEO pages at /markets/[location]/[loan].
 * Each location generates N pages (one per loan type in /data/loan-programs).
 *
 * To add a new market: append an entry here. It will automatically be
 * picked up by generateStaticParams and sitemap.ts.
 *
 * HIGH-INTENT MARKETS are ones where 818 has deal flow, referral partners,
 * or the investor landscape is dense enough to justify dedicated SEO.
 */

export type Market = {
  /** URL slug, kebab-case. Used at /markets/[slug] */
  slug: string;
  /** Full display name used in H1s and page titles */
  displayName: string;
  /** State code, e.g. "NY" */
  state: string;
  /** State full name, e.g. "New York" */
  stateName: string;
  /** Metro / county name for richer page context */
  metro: string;
  /** Human-readable positioning paragraph (80-160 words, unique per market) */
  positioning: string;
  /** 3-4 neighborhoods / submarkets investors ask about */
  submarkets: string[];
  /** Average 2-4 unit or SFR investor price range (for DSCR qualification notes) */
  typicalPriceRange: string;
  /** Average gross rent range for DSCR math context */
  typicalRentRange: string;
  /** Local edge — why 818 wins here */
  localEdge: string;
};

export const MARKETS: Market[] = [
  // ── NYC + Long Island (Ravi's home turf) ─────────────────────
  {
    slug: 'brooklyn',
    displayName: 'Brooklyn',
    state: 'NY',
    stateName: 'New York',
    metro: 'Kings County',
    positioning:
      'Brooklyn investors face the highest-priced 2–4 unit stock in the country outside Manhattan, paired with strong rent growth across Bed-Stuy, Crown Heights, East New York, and Bushwick. Getting the right loan structure — especially on a DSCR that actually cash-flows under NYC rent-stabilization rules — is the difference between a 10% cash-on-cash deal and a stranded asset.',
    submarkets: ['Bed-Stuy', 'Crown Heights', 'East New York', 'Bushwick', 'Sunset Park'],
    typicalPriceRange: '$900K – $2.4M',
    typicalRentRange: '$2,200 – $4,800 per unit',
    localEdge:
      'We\'ve closed DSCR loans on rent-stabilized Brooklyn buildings where national lenders auto-declined. Local DHCR registration and rent-roll underwriting expertise matters.',
  },
  {
    slug: 'queens',
    displayName: 'Queens',
    state: 'NY',
    stateName: 'New York',
    metro: 'Queens County',
    positioning:
      'Queens remains the last NYC borough where 2–4 unit investor deals pencil at scale — Astoria, Jackson Heights, Elmhurst, and Flushing all show 5.5–7%+ gross yields. The catch: mixed-use properties (storefront + residential) require a lender who underwrites both the commercial NOI and the residential DSCR correctly.',
    submarkets: ['Astoria', 'Jackson Heights', 'Flushing', 'Ridgewood', 'Forest Hills'],
    typicalPriceRange: '$750K – $1.8M',
    typicalRentRange: '$1,900 – $3,400 per unit',
    localEdge:
      'Queens mixed-use and 5–9 unit deals are our sweet spot. We blend DSCR and small-balance multifamily products when traditional lenders can\'t.',
  },
  {
    slug: 'bronx',
    displayName: 'The Bronx',
    state: 'NY',
    stateName: 'New York',
    metro: 'Bronx County',
    positioning:
      'Bronx investor activity is concentrated in 5+ unit multifamily and 2–4 unit value-add. The borough\'s gross yields lead NYC at 6.5–9%+, but rent-stabilization ratios are high and most national DSCR lenders won\'t touch the product without local comps and a real underwrite.',
    submarkets: ['Mott Haven', 'Fordham', 'Pelham Bay', 'Soundview', 'Williamsbridge'],
    typicalPriceRange: '$550K – $1.4M',
    typicalRentRange: '$1,500 – $2,600 per unit',
    localEdge:
      'We structure 5–20 unit Bronx multifamily through bridge + perm takeout. Rent-stab aware, J-51 aware, DHCR-fluent.',
  },
  {
    slug: 'long-island',
    displayName: 'Long Island',
    state: 'NY',
    stateName: 'New York',
    metro: 'Nassau & Suffolk Counties',
    positioning:
      'Long Island investor demand is concentrated in North Shore SFR flips, Nassau County 2–4 unit rentals, and growing STR pockets on the South Shore and East End. LI is where we have the deepest referral network — contractors, realtors, and attorneys who bring us 818 clients weekly.',
    submarkets: ['Glen Cove', 'Hempstead', 'Huntington', 'Babylon', 'Riverhead', 'Montauk'],
    typicalPriceRange: '$500K – $1.5M',
    typicalRentRange: '$2,400 – $4,500 per unit',
    localEdge:
      'We\'re based on Long Island. Our inspectors, attorneys, and title teams are local. Close in 21 days on Nassau/Suffolk deals is our norm, not our ceiling.',
  },
  {
    slug: 'westchester',
    displayName: 'Westchester County',
    state: 'NY',
    stateName: 'New York',
    metro: 'Westchester County',
    positioning:
      'Westchester 2–4 unit and small multifamily is where NYC investors cash in appreciation and redeploy into cash-flow. Yonkers, New Rochelle, Mount Vernon, and White Plains each have distinct rent and price dynamics requiring tailored DSCR structures.',
    submarkets: ['Yonkers', 'New Rochelle', 'Mount Vernon', 'White Plains', 'Port Chester'],
    typicalPriceRange: '$600K – $1.6M',
    typicalRentRange: '$2,100 – $3,800 per unit',
    localEdge:
      'Our Westchester DSCR underwriting uses actual Zillow rent-comp data and municipal-specific tax snapshots — not national black-box averages.',
  },
  // ── Northeast metro ────────────────────────────────────────
  {
    slug: 'jersey-city',
    displayName: 'Jersey City',
    state: 'NJ',
    stateName: 'New Jersey',
    metro: 'Hudson County',
    positioning:
      'Jersey City and the Hudson County waterfront rival Brooklyn on price but beat it on yield in the Journal Square and Greenville submarkets. Investor activity is surging in 2–4 unit value-add and condo-to-rent conversions near Path stations.',
    submarkets: ['Journal Square', 'Greenville', 'The Heights', 'Bergen-Lafayette'],
    typicalPriceRange: '$650K – $1.5M',
    typicalRentRange: '$2,200 – $3,900 per unit',
    localEdge:
      'NJ prepayment-penalty law (2026) changes the math on most DSCR loans — we structure around it and get borrowers the flexibility to refinance.',
  },
  // ── Major national investor markets ────────────────────────
  {
    slug: 'miami',
    displayName: 'Miami',
    state: 'FL',
    stateName: 'Florida',
    metro: 'Miami-Dade County',
    positioning:
      'Miami-Dade investor activity spans luxury STR in Brickell and Miami Beach, 2–4 unit rentals in Little Havana and Liberty City, and condo cash-flow plays across Aventura and Doral. Insurance and HOA-assessment costs have reshaped DSCR underwriting — national lenders are mispricing deals.',
    submarkets: ['Brickell', 'Miami Beach', 'Little Havana', 'Liberty City', 'Aventura'],
    typicalPriceRange: '$450K – $1.8M',
    typicalRentRange: '$2,400 – $5,800 per unit',
    localEdge:
      'We underwrite with post-Surfside condo assessment reality built in. Miami STR deals underwritten on AirDNA, not guesswork.',
  },
  {
    slug: 'tampa',
    displayName: 'Tampa',
    state: 'FL',
    stateName: 'Florida',
    metro: 'Hillsborough County',
    positioning:
      'Tampa has become the #1 Florida investor market for DSCR and fix-and-flip — strong rent growth, no state income tax, and population inflow that hasn\'t slowed. Seminole Heights, Ybor, and West Tampa lead value-add opportunity.',
    submarkets: ['Seminole Heights', 'Ybor City', 'West Tampa', 'East Tampa', 'Riverview'],
    typicalPriceRange: '$280K – $650K',
    typicalRentRange: '$1,600 – $2,800 per unit',
    localEdge:
      'Our Tampa DSCR program closes in 18 days. Insurance quotes built into the underwrite up-front so you don\'t get surprised at closing.',
  },
  {
    slug: 'phoenix',
    displayName: 'Phoenix',
    state: 'AZ',
    stateName: 'Arizona',
    metro: 'Maricopa County',
    positioning:
      'Phoenix remains one of the strongest DSCR markets in the country — SFR rentals in West Phoenix, Maryvale, and Glendale pencil at 7–9%+ gross yields, and STR regulation is relatively investor-friendly in Scottsdale and Tempe.',
    submarkets: ['Maryvale', 'Glendale', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler'],
    typicalPriceRange: '$320K – $550K',
    typicalRentRange: '$1,800 – $2,800 per unit',
    localEdge:
      'Fix-and-flip in Phoenix: 90% LTC, 75% ARV, 12-month terms, no income docs.',
  },
  {
    slug: 'dallas',
    displayName: 'Dallas',
    state: 'TX',
    stateName: 'Texas',
    metro: 'Dallas-Fort Worth',
    positioning:
      'DFW investor activity is concentrated in build-to-rent pipelines, Dallas County SFR flips, and Tarrant County small-multifamily. Texas has no state income tax and investor-friendly property laws, but rising property taxes and insurance make DSCR math unforgiving.',
    submarkets: ['Oak Cliff', 'East Dallas', 'Arlington', 'Fort Worth', 'Mesquite', 'Garland'],
    typicalPriceRange: '$260K – $520K',
    typicalRentRange: '$1,700 – $2,600 per unit',
    localEdge:
      'Texas tax-protest-aware underwriting. We run property tax scenarios both current and post-protest so your DSCR isn\'t a moving target.',
  },
  {
    slug: 'atlanta',
    displayName: 'Atlanta',
    state: 'GA',
    stateName: 'Georgia',
    metro: 'Metro Atlanta',
    positioning:
      'Atlanta leads the Southeast for institutional SFR portfolios and value-add multifamily. South Atlanta, East Point, and College Park continue to show the strongest cash-flow; Decatur and Marietta drive appreciation plays.',
    submarkets: ['East Point', 'College Park', 'South Atlanta', 'Decatur', 'Marietta'],
    typicalPriceRange: '$220K – $480K',
    typicalRentRange: '$1,500 – $2,400 per unit',
    localEdge:
      'ATL portfolio DSCR (5–10 properties on one loan) is a specialty — closes in 25 days with one appraisal cycle.',
  },
  {
    slug: 'nashville',
    displayName: 'Nashville',
    state: 'TN',
    stateName: 'Tennessee',
    metro: 'Davidson County',
    positioning:
      'Nashville investor demand keeps outrunning inventory — STR in East Nashville and Germantown, DSCR rentals in Madison and Antioch, and rehab-to-rent across Donelson. Tennessee\'s non-income-tax structure is a DSCR tailwind.',
    submarkets: ['East Nashville', 'Germantown', 'Madison', 'Antioch', 'Donelson'],
    typicalPriceRange: '$350K – $700K',
    typicalRentRange: '$1,900 – $3,200 per unit',
    localEdge:
      'Nashville STR underwriting on verified AirDNA revenue — not LTR shadow rents. Investor-grade DSCR, not a LendingTree estimate.',
  },
  {
    slug: 'charlotte',
    displayName: 'Charlotte',
    state: 'NC',
    stateName: 'North Carolina',
    metro: 'Mecklenburg County',
    positioning:
      'Charlotte investor activity is split between East and North Charlotte SFR rehabs, Fort Mill build-to-rent, and multifamily value-add near the University area. NC\'s landlord-friendly eviction laws and steady population inflow keep DSCRs healthy.',
    submarkets: ['East Charlotte', 'NoDa', 'Plaza Midwood', 'University', 'Fort Mill'],
    typicalPriceRange: '$280K – $540K',
    typicalRentRange: '$1,700 – $2,600 per unit',
    localEdge:
      'Fix & flip + DSCR refi bundled — we pre-approve the exit strategy so you\'re not scrambling at month 9.',
  },
  {
    slug: 'orlando',
    displayName: 'Orlando',
    state: 'FL',
    stateName: 'Florida',
    metro: 'Orange County',
    positioning:
      'Orlando is the #1 STR market in the country — Davenport, Kissimmee, and Windermere are saturated with investor demand but still produce strong numbers if you buy right. Traditional DSCR rentals in East Orlando and Apopka also cash-flow well.',
    submarkets: ['Davenport', 'Kissimmee', 'Windermere', 'East Orlando', 'Apopka'],
    typicalPriceRange: '$300K – $680K',
    typicalRentRange: '$1,800 – $4,200 per unit (STR avg higher)',
    localEdge:
      'Orlando STR-specific DSCR — underwritten on AirDNA revenue, not imaginary LTR shadow rents.',
  },
];
