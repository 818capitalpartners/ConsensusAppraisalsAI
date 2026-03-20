'use client';

import { useState } from 'react';
import DealCard from '@/components/ui/DealCard';
import FUNDED_DEALS from '@/data/fundedDeals';

const INITIAL_SHOW = 6;

export default function FundedDealsSection() {
  const [showAll, setShowAll] = useState(false);
  const visibleDeals = showAll ? FUNDED_DEALS : FUNDED_DEALS.slice(0, INITIAL_SHOW);

  return (
    <section className="py-16 sm:py-24 dot-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 mb-4 tracking-wider">
            {FUNDED_DEALS.length} Deals Closed
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Recently Funded</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Real deals closed by 818 Capital Partners. Hover any deal for an AI-powered borrower ROI analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {FUNDED_DEALS.length > INITIAL_SHOW && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200/50"
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
