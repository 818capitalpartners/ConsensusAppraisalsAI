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
  image: string;
  analysis: string;
}

// Map property types to badge colors
function badgeColor(loanType: string) {
  if (loanType.includes('Fix & Flip') || loanType.includes('Bridge'))
    return 'from-amber-500/15 to-orange-500/15 text-amber-700 border-amber-200/50';
  if (loanType.includes('DSCR'))
    return 'from-[#007ACC]/10 to-indigo-500/10 text-indigo-600 border-indigo-200/50';
  if (loanType.includes('Commercial'))
    return 'from-emerald-500/15 to-teal-500/15 text-emerald-700 border-emerald-200/50';
  return 'from-[#007ACC]/10 to-indigo-500/10 text-indigo-600 border-indigo-200/50';
}

export default function DealCard({ deal }: { deal: FundedDeal }) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden card-glow cursor-default"
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
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        {/* Deal number badge */}
        <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <span className="text-xs font-bold text-gray-800">#{deal.id}</span>
        </div>
        {/* Location on image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-sm font-medium drop-shadow-lg">
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
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r border ${badgeColor(deal.loanType)}`}>
            {deal.loanType}
          </span>
          {deal.rate !== 'N/A' && (
            <span className="text-sm font-bold text-gray-900">{deal.rate}</span>
          )}
        </div>
        <div className="text-sm font-semibold text-gray-900 mb-1">{deal.propertyType}</div>
        <div className="text-xs text-gray-500 mb-2">{deal.program}</div>
        {deal.ltv !== 'N/A' && (
          <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            {deal.ltv}
          </div>
        )}
      </div>

      {/* Hover AI Analysis Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/97 to-slate-900/99 backdrop-blur-sm rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
          showAnalysis ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#007ACC] to-indigo-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-indigo-300 tracking-wider uppercase">AI Deal Analysis</span>
          </div>
          <div className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-line">
            {deal.analysis}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-3">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          Analysis for informational purposes only
        </div>
      </div>
    </div>
  );
}
