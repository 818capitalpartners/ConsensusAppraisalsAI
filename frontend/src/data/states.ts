/**
 * State-level hub data. Powers /markets/[state-slug] pages.
 *
 * Only states where we have real city-level coverage in markets.ts are
 * listed here — we don't claim a state hub for somewhere we don't have
 * substantive content for. To add a state, ensure at least one city in
 * that state exists in MARKETS and add it here.
 */

import { MARKETS } from './markets';

export type StateHub = {
  /** URL slug, kebab-case state name. Used at /markets/[slug] */
  slug: string;
  /** USPS state code, e.g. 'NY' */
  code: string;
  /** Display name, e.g. 'New York' */
  displayName: string;
  /** Short positioning paragraph for the state hub page */
  positioning: string;
};

export const STATES: StateHub[] = [
  {
    slug: 'new-york',
    code: 'NY',
    displayName: 'New York',
    positioning:
      'New York is 818 Capital\'s home market. From rent-stabilized 2–4 unit buildings in Brooklyn and the Bronx to Hudson Valley STRs and Long Island flips, we underwrite NY deals with local-rule awareness — DHCR registration, J-51, NYC rent-stabilization caps — that most national lenders miss.',
  },
  {
    slug: 'new-jersey',
    code: 'NJ',
    displayName: 'New Jersey',
    positioning:
      'New Jersey investor activity has surged across Hudson, Bergen, Union, and Essex counties. We structure DSCR and fix-and-flip programs that account for NJ\'s 2026 prepayment-penalty law and high property-tax dynamics so your DSCR math holds up at closing.',
  },
  {
    slug: 'florida',
    code: 'FL',
    displayName: 'Florida',
    positioning:
      'Florida is one of the most active investor markets in the country — Miami-Dade, Tampa Bay, and the Orlando corridor each have distinct rent, insurance, and STR dynamics. We underwrite post-Surfside condo assessments, real insurance quotes, and AirDNA-verified STR revenue.',
  },
  {
    slug: 'texas',
    code: 'TX',
    displayName: 'Texas',
    positioning:
      'Texas combines no state income tax with investor-friendly property laws and one of the strongest rental-demand backdrops in the country. We bake tax-protest scenarios into our DSCR underwrite for DFW so your numbers aren\'t a moving target post-closing.',
  },
  {
    slug: 'arizona',
    code: 'AZ',
    displayName: 'Arizona',
    positioning:
      'Arizona remains a top DSCR market — Phoenix metro SFR rentals in West Phoenix, Maryvale, and Glendale pencil at 7–9%+ gross yields. STR rules in Scottsdale and Tempe remain investor-friendly relative to peer Sun Belt markets.',
  },
  {
    slug: 'georgia',
    code: 'GA',
    displayName: 'Georgia',
    positioning:
      'Georgia — especially metro Atlanta — leads the Southeast for institutional SFR portfolios and value-add multifamily. Our Atlanta portfolio DSCR program closes 5–10 properties on one loan in 25 days with a single appraisal cycle.',
  },
  {
    slug: 'tennessee',
    code: 'TN',
    displayName: 'Tennessee',
    positioning:
      'Tennessee\'s no-income-tax structure is a DSCR tailwind, and Nashville investor demand keeps outrunning inventory. We underwrite Nashville STR deals on verified AirDNA revenue — not LTR shadow rents — and finance value-add rentals across Davidson and surrounding counties.',
  },
  {
    slug: 'north-carolina',
    code: 'NC',
    displayName: 'North Carolina',
    positioning:
      'North Carolina\'s landlord-friendly eviction laws and steady population inflow keep DSCRs healthy in Charlotte, the Triangle, and Triad. We bundle fix & flip into DSCR refi exits so you\'re not scrambling at month 9.',
  },
];

export function getStateBySlug(slug: string): StateHub | undefined {
  return STATES.find((s) => s.slug === slug);
}

export function getCitiesInState(code: string) {
  return MARKETS.filter((m) => m.state === code);
}
