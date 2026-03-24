import type { Metadata } from 'next';
import Image from 'next/image';
import FundedDealsSection from '@/components/FundedDealsSection';

export const metadata: Metadata = {
  title: 'Closed Deals | 818 Capital',
  description: 'Recent transactions funded by 818 Capital across DSCR, Fix & Flip, STR, and Multifamily programs nationwide.',
};

const STATS = [
  { value: '27+', label: 'Deals Closed' },
  { value: '14-21', label: 'Days to Close' },
  { value: '14', label: 'States' },
  { value: '12+', label: 'Capital Programs' },
];

const HIGHLIGHTS = [
  {
    label: 'Largest Deal',
    value: '33-Unit Multifamily',
    detail: 'Fort Myers, FL — Agency Bridge at 80% of cost basis',
  },
  {
    label: 'Fastest Close',
    value: '7 Days',
    detail: 'Fix & Flip Bridge — 90% LTC with 100% rehab financing',
  },
  {
    label: 'Lowest Rate',
    value: '5.26%',
    detail: 'Commercial Retail Refi — Life Co / CMBS, White Settlement, TX',
  },
  {
    label: 'Most Active Market',
    value: 'Texas',
    detail: '6 deals across DFW, Fort Worth, Burleson, Los Fresnos',
  },
];

export default function ClosedDealsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=500&fit=crop"
          alt="Commercial real estate skyline"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/85 to-navy-900/60" />
        <div className="relative mx-auto max-w-content px-6 py-16 md:py-20">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">Track Record</p>
          <h1 className="text-h1 text-white max-w-2xl">Recently Closed Deals</h1>
          <p className="mt-4 text-lg text-navy-200 font-body font-light max-w-xl leading-relaxed">
            Real transactions funded by 818 Capital Partners across DSCR, Fix &amp; Flip, STR, and Multifamily programs. Hover any deal for an AI-powered borrower analysis.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-navy-100">
        <div className="mx-auto max-w-content px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-sans font-bold text-navy-900">{s.value}</p>
                <p className="mt-1 text-sm text-navy-500 font-body">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deal Highlights */}
      <section className="bg-white py-12 border-b border-navy-100">
        <div className="mx-auto max-w-content px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="rounded-lg border border-navy-100 bg-navy-50/50 p-5">
                <p className="text-xs font-sans font-semibold uppercase tracking-wider text-accent mb-2">{h.label}</p>
                <p className="text-lg font-sans font-bold text-navy-900 mb-1">{h.value}</p>
                <p className="text-xs text-navy-500 font-body leading-relaxed">{h.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Deals — reuses the FundedDealsSection component */}
      <FundedDealsSection showAll hideHeader />

      {/* CTA */}
      <section className="bg-white py-16 border-t border-navy-100">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-h3 text-navy-900 mb-3">Ready to Add Your Deal to the List?</h2>
          <p className="text-navy-500 font-body mb-6 max-w-lg mx-auto">
            Submit your scenario and get an AI-powered analysis with program matches in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/dscr-loans#form" className="btn-primary">Submit a Scenario</a>
            <a href="tel:+19179939194" className="btn-secondary">Call (917) 993-9194</a>
          </div>
        </div>
      </section>
    </>
  );
}
