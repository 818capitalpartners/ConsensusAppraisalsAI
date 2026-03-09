import { prisma, Lender } from '@818capital/db';

interface LenderQuery {
  productType?: string;
  loanAmount?: number;
  ltv?: number;
  dscr?: number;
  fico?: number;
  state?: string;
  units?: number;
}

/**
 * Query lenders from Postgres (synced from Monday.com Lender Profiles board).
 * Filters by product type and numeric criteria. Handles sparse data gracefully —
 * only excludes a lender if a criterion IS set and the deal doesn't meet it.
 */
export async function queryMatchingLenders(query: LenderQuery): Promise<Lender[]> {
  const allLenders = await prisma.lender.findMany();

  return allLenders.filter((lender) => {
    // Product type filter
    if (query.productType && lender.productType) {
      const lenderTypes = lender.productType.toLowerCase();
      // "All Types" matches everything
      if (lenderTypes !== 'all types') {
        const laneMap: Record<string, string[]> = {
          dscr: ['dscr'],
          flip: ['fix & flip', 'bridge', 'fix and flip'],
          str: ['dscr'], // STR uses DSCR products
          multifamily: ['multifamily', 'commercial'],
        };
        const acceptedTypes = laneMap[query.productType] || [query.productType];
        const matches = acceptedTypes.some((t) => lenderTypes.includes(t));
        if (!matches) return false;
      }
    }

    // Only filter on criteria that are SET (non-null) in lender record
    if (query.loanAmount !== undefined) {
      if (lender.minLoan && query.loanAmount < lender.minLoan) return false;
      if (lender.maxLoan && query.loanAmount > lender.maxLoan) return false;
    }

    if (query.ltv !== undefined && lender.maxLtv) {
      if (query.ltv > lender.maxLtv) return false;
    }

    if (query.dscr !== undefined && lender.minDscr) {
      if (query.dscr < lender.minDscr) return false;
    }

    if (query.fico !== undefined && lender.minFico) {
      if (query.fico < lender.minFico) return false;
    }

    if (query.units !== undefined && lender.maxUnits) {
      if (query.units > lender.maxUnits) return false;
    }

    // State/geography filter
    if (query.state && lender.geography) {
      const geo = lender.geography as { states?: string[]; nationwide?: boolean };

      // If marked nationwide, always passes
      if (geo.nationwide) {
        // pass
      } else if (geo.states && geo.states.length > 0) {
        const stateUpper = query.state.toUpperCase();
        // Check for nationwide keywords in the states array
        const isNationwide = geo.states.some((s) =>
          s.includes('NATIONWIDE') || s.includes('ALL STATES') || s === 'ALL'
        );
        if (!isNationwide && !geo.states.includes(stateUpper)) {
          return false;
        }
      }
    }

    return true;
  });
}
