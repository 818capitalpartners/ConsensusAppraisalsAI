/**
 * Loan program data — pairs with /data/markets.ts to generate
 * programmatic SEO pages at /markets/[location]/[loan].
 */

export type LoanProgram = {
  slug: string;
  displayName: string;
  shortName: string;
  tagline: string;
  description: string;
  /** Term ranges (years or months) */
  termSummary: string;
  /** Loan-to-cost / loan-to-value summary */
  ltvSummary: string;
  /** Minimum credit score */
  minCredit: string;
  /** Typical close time */
  closeTime: string;
  /** Qualification method — DSCR, ARV, NOI, etc. */
  qualifies: string;
  /** The sentence that appears below the H1 on the landing page */
  leadIn: string;
  /** 3-4 sentence "ideal for" paragraph that cites investor use cases */
  idealFor: string;
};

export const LOAN_PROGRAMS: LoanProgram[] = [
  {
    slug: 'dscr-loans',
    displayName: 'DSCR Rental Loans',
    shortName: 'DSCR loan',
    tagline: '30-year fixed. No personal DTI. Closes on property cash flow.',
    description:
      'Debt Service Coverage Ratio loans for rental investors. Qualification is based on the property\'s rental income, not your tax returns or W-2. 30-year fixed, 5/1 ARM, and interest-only options available.',
    termSummary: '30-year fixed, 5/1 and 7/1 ARM, interest-only available',
    ltvSummary: 'Up to 80% LTV purchase, 75% LTV refi',
    minCredit: '660 (best pricing at 720+)',
    closeTime: '21–30 days',
    qualifies: 'Property DSCR ≥ 1.0 (some programs allow 0.75)',
    leadIn:
      'Qualify your rental on the property, not your tax returns. Close in 21 days.',
    idealFor:
      'Buy-and-hold investors, self-employed borrowers whose tax returns hide income, LLCs holding multiple rentals, 1031 exchange buyers who need speed, and investors building a portfolio beyond the 10-loan Fannie cap.',
  },
  {
    slug: 'fix-and-flip',
    displayName: 'Fix & Flip Loans',
    shortName: 'fix & flip loan',
    tagline: 'Up to 90% LTC. 75% ARV. 12-month terms.',
    description:
      'Short-term rehab financing for investors flipping SFR, 2–4 unit, and small multifamily. Interest-only payments. Draw schedule tied to scope-of-work milestones. No income documentation required.',
    termSummary: '6–18 month terms, interest-only',
    ltvSummary: 'Up to 90% LTC, 75% ARV',
    minCredit: '660',
    closeTime: '10–21 days',
    qualifies: 'ARV and scope-of-work; liquidity ≥ 10% of loan',
    leadIn:
      'Fund the purchase and rehab in one loan. 90% LTC, 75% ARV, close in 10–21 days.',
    idealFor:
      'Active flippers running 1–10 projects a year, new flippers with one successful deal under their belt, investors rehabbing to refi into a DSCR (we pre-approve the exit), and BRRRR investors stacking flips into rentals.',
  },
  {
    slug: 'str-loans',
    displayName: 'Short-Term Rental (STR) Loans',
    shortName: 'STR loan',
    tagline: 'Underwritten on AirDNA revenue, not LTR shadow rents.',
    description:
      'DSCR-style loans specifically underwritten on short-term rental (Airbnb, VRBO) revenue. We verify revenue via AirDNA, Rabbu, or actual 12-month operating statements. Available for SFR and 2–4 unit STR properties.',
    termSummary: '30-year fixed, 10-year I/O, 5/1 ARM',
    ltvSummary: 'Up to 75% LTV purchase',
    minCredit: '680',
    closeTime: '25–35 days',
    qualifies: 'STR DSCR ≥ 1.0 on AirDNA or verified operating history',
    leadIn:
      'Get the DSCR math you actually have — based on real short-term rental revenue.',
    idealFor:
      'STR investors tired of lenders using LTR rent comps that kill the deal, Airbnb hosts buying their 2nd–10th property, investors in regulated STR markets (Nashville, Austin, Orlando) who need a lender that understands the rule set.',
  },
  {
    slug: 'multifamily',
    displayName: 'Multifamily Bridge & Permanent',
    shortName: 'multifamily loan',
    tagline: '5+ unit properties. Bridge, value-add, and long-term.',
    description:
      'Financing for 5+ unit multifamily properties from $1M to $50M. Agency, CMBS, bridge, and value-add construction-to-perm options. We lead you through the right product based on hold strategy and business plan.',
    termSummary: '2-year bridge through 30-year permanent',
    ltvSummary: 'Up to 80% LTV (agency), 75% LTC (bridge)',
    minCredit: 'Sponsor experience-driven, 680+ typical',
    closeTime: '45–75 days',
    qualifies: 'Property NOI + sponsor track record',
    leadIn:
      '5+ unit deals need a broker who\'s closed them. We have.',
    idealFor:
      'Small multifamily investors stepping up from 2–4 unit, syndicators raising capital who need a reliable debt quote, 1031 exchange buyers targeting multifamily, and bridge-to-perm rehab plays.',
  },
  {
    slug: 'bridge-loans',
    displayName: 'Bridge Loans',
    shortName: 'bridge loan',
    tagline: 'Fast, flexible capital for time-sensitive acquisitions.',
    description:
      'Short-term bridge financing to acquire, stabilize, or reposition an asset before permanent refinance. Common uses: auction purchases, value-add acquisitions, 1031 exchange deadlines, cash-out refis for new acquisitions.',
    termSummary: '6–24 month terms, interest-only',
    ltvSummary: 'Up to 75% LTV, 80% LTC on value-add',
    minCredit: '660',
    closeTime: '10–21 days',
    qualifies: 'Asset-based underwriting + exit strategy',
    leadIn:
      'Move fast when the deal demands it. Bridge in 10 days.',
    idealFor:
      'Auction buyers, 1031 investors on a clock, value-add sponsors needing to close before starting the business plan, and investors whose equity is tied up in a pending sale.',
  },
  {
    slug: 'construction-loans',
    displayName: 'Ground-Up Construction Loans',
    shortName: 'construction loan',
    tagline: 'Fund the build. Refinance into a DSCR on stabilization.',
    description:
      'Ground-up construction financing for SFR, 2–4 unit, and small multifamily. Covers land, horizontal, and vertical costs with staged draws. Automatic conversion options into DSCR permanent financing on C/O.',
    termSummary: '12–24 month construction, converts to 30-year DSCR',
    ltvSummary: 'Up to 85% LTC, 70% LTV on completion',
    minCredit: '680',
    closeTime: '30–45 days',
    qualifies: 'Pro-forma DSCR + sponsor build experience',
    leadIn:
      'Fund land, build, and long-term refi in one seamless loan.',
    idealFor:
      'Developers building 1–20 unit ground-up spec, BRRRR investors building instead of buying existing stock, and infill builders with approved permits.',
  },
];
