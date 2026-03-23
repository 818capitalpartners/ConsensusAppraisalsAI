'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface FundedDeal {
  id: number;
  city: string;
  state: string;
  propertyType: string;
  loanType: string;
  program: string;
  ltv: string;
  rate: string;
  dealValue: string;
  image: string;
  analysis: string;
}

function badgeColor(loanType: string) {
  if (loanType.includes('Fix & Flip') || loanType.includes('Bridge'))
    return 'bg-warning/10 text-warning border-warning/20';
  if (loanType.includes('DSCR'))
    return 'bg-accent/10 text-accent border-accent/20';
  if (loanType.includes('Commercial'))
    return 'bg-success/10 text-success border-success/20';
  return 'bg-accent/10 text-accent border-accent/20';
}

export default function DealCard({ deal }: { deal: FundedDeal }) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div
      className="group relative rounded-lg border border-navy-100 bg-white shadow-sm overflow-hidden transition hover:shadow-md cursor-default"
      onMouseEnter={() => setShowAnalysis(true)}
      onMouseLeave={() => setShowAnalysis(false)}
    >
      {/* Property Image */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={deal.image}
          alt={`${deal.propertyType} in ${deal.city}, ${deal.state}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-navy-900/10 to-transparent" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded px-2 py-0.5">
          <span className="text-xs font-sans font-bold text-navy-800">#{deal.id}</span>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-sm font-sans font-semibold drop-shadow-lg">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {deal.city}, {deal.state}
        </div>
      </div>

      {/* Deal Info */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-sans font-semibold px-2.5 py-1 rounded border ${badgeColor(deal.loanType)}`}>
            {deal.loanType}
          </span>
          {deal.rate !== 'N/A' && (
            <span className="text-sm font-sans font-bold text-navy-900">{deal.rate}</span>
          )}
        </div>
        <div className="text-lg font-sans font-bold text-navy-900 mb-0.5">{deal.dealValue}</div>
        <div className="text-sm font-sans font-semibold text-navy-700 mb-1">{deal.propertyType}</div>
        <div className="text-xs text-navy-500 font-body mb-2">{deal.program}</div>
        {deal.ltv !== 'N/A' && (
          <div className="inline-flex items-center gap-1.5 text-xs text-navy-400 bg-navy-50 px-2.5 py-1 rounded font-body">
            {deal.ltv}
          </div>
        )}
      </div>

      {/* Hover AI Analysis Overlay */}
      <div
        className={`absolute inset-0 bg-navy-900/95 backdrop-blur-sm rounded-lg p-5 flex flex-col justify-between transition-all duration-300 ${
          showAnalysis ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <span className="text-xs font-sans font-semibold text-accent-light tracking-wider uppercase">AI Deal Analysis</span>
          </div>
          <div className="text-[13px] text-navy-200 font-body leading-relaxed whitespace-pre-line">
            {deal.analysis}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-navy-400 font-body mt-3">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          Analysis for informational purposes only
        </div>
      </div>
    </div>
  );
}
