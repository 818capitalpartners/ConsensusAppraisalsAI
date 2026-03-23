'use client';

import { useState } from 'react';
import DealCard from '@/components/DealCard';
import FUNDED_DEALS from '@/data/fundedDeals';

const INITIAL_SHOW = 6;

export default function FundedDealsSection({ showAll: initialShowAll = false, hideHeader = false }: { showAll?: boolean; hideHeader?: boolean }) {
  const [showAll, setShowAll] = useState(initialShowAll);
  const visibleDeals = showAll ? FUNDED_DEALS : FUNDED_DEALS.slice(0, INITIAL_SHOW);

  return (
    <section className="bg-navy-50/50 py-20">
      <div className="mx-auto max-w-content px-6">
        {!hideHeader && (
          <div className="text-center mb-14">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
              {FUNDED_DEALS.length} Deals Closed
            </p>
            <h2 className="section-heading">Recently Funded</h2>
            <p className="section-subheading mx-auto mt-4">
              Real deals closed by 818 Capital Partners. Hover any deal for an AI-powered borrower ROI analysis.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {FUNDED_DEALS.length > INITIAL_SHOW && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn-secondary inline-flex items-center gap-2"
            >
              {showAll ? (
                <>
                  Show Less
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </>
              ) : (
                <>
                  View All {FUNDED_DEALS.length} Deals
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
