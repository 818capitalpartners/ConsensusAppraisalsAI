import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import DealForm from '@/components/DealForm';
import DSCRCalculator from '@/components/DSCRCalculator';
import AppraisalPreCheck from '@/components/AppraisalPreCheck';

export const metadata: Metadata = {
  title: 'DSCR Loans | 818 Capital',
  description: 'Qualify on rental income alone. No tax returns, no W-2s. DSCR loans for 1-4 unit investment properties, portfolios, and STR.',
};

export default function DSCRPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&h=600&fit=crop"
          alt="Single-family investment property"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-navy-900/50" />
        <div className="relative mx-auto max-w-content px-6 py-16 md:py-20">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">
            DSCR / Rental Loans
          </p>
          <h1 className="text-h1 text-white max-w-2xl">
            Qualify on Rental Income. No Tax Returns Required.
          </h1>
          <p className="mt-4 text-lg text-navy-100 font-body font-light max-w-xl leading-relaxed">
            Debt Service Coverage Ratio loans let you qualify based on the property&apos;s rental income — not your personal income. Perfect for investors scaling a portfolio.
          </p>
        </div>
      </section>

      {/* What is DSCR */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2 className="section-heading">What is a DSCR Loan?</h2>
              <p className="mt-4 text-navy-500 font-body leading-relaxed">
                DSCR = Monthly Rent &divide; Monthly PITI (Principal, Interest, Taxes, Insurance). If your DSCR is 1.0 or above, the property&apos;s rental income covers the mortgage. Most lenders target 1.0–1.25+. We work with lenders that go as low as 0.75 DSCR.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'No tax returns or W-2s',
                  'Close in an LLC or entity',
                  'Up to 80% LTV',
                  '1-4 units, condos, townhomes',
                  'Portfolio & blanket loans',
                  'STR income accepted',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-navy-700 font-body">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-navy-50 rounded-lg p-8">
              <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-4">Example Scenario</p>
              <div className="space-y-3">
                {[
                  ['Property Value', '$350,000'],
                  ['Loan Amount (75% LTV)', '$262,500'],
                  ['Monthly Rent', '$2,800'],
                  ['Monthly PITI', '$2,200'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-navy-100 last:border-0">
                    <span className="text-sm text-navy-500 font-body">{label}</span>
                    <span className="text-sm font-sans font-semibold text-navy-900">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 bg-white rounded px-4 mt-2">
                  <span className="text-sm font-sans font-semibold text-navy-900">DSCR</span>
                  <span className="text-lg font-sans font-bold text-success">1.27</span>
                </div>
                <p className="text-sm font-sans font-medium text-success mt-2">This deal works. Green light.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DSCR Rate Matrix */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">2026 Rate Intelligence</p>
            <h2 className="section-heading">DSCR Rates by Credit Score</h2>
            <p className="section-subheading mx-auto mt-3">Your credit score is the single biggest lever on your rate. Here&apos;s how lenders tier it.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              { score: '740+', range: '6.75% – 7.50%', ltv: '80%', access: 'All programs incl. I/O & no-ratio', width: '65%', accent: true },
              { score: '720–739', range: '7.00% – 7.75%', ltv: '80%', access: 'Most programs, minor bump', width: '72%', accent: true },
              { score: '700–719', range: '7.25% – 8.00%', ltv: '80%', access: 'Standard programs', width: '78%', accent: false },
              { score: '660–699', range: '7.75% – 8.50%', ltv: '75%', access: 'Limited, no sub-1.0', width: '85%', accent: false },
              { score: '620–659', range: '8.25% – 9.25%', ltv: '70%', access: 'Entry level, higher reserves', width: '95%', accent: false },
            ].map((tier) => (
              <div key={tier.score} className="flex items-center gap-4">
                <span className="text-xs font-sans font-bold text-navy-700 w-16 text-right shrink-0">{tier.score}</span>
                <div className="flex-1 bg-navy-100 rounded-full h-9 relative overflow-hidden">
                  <div className={`h-full rounded-full flex items-center justify-between px-4 ${tier.accent ? 'bg-accent' : 'bg-navy-300'}`} style={{ width: tier.width }}>
                    <span className="text-xs font-sans font-bold text-white">{tier.range}</span>
                    <span className="text-[10px] text-white/80 font-body hidden sm:inline">Max {tier.ltv} LTV</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-navy-400 font-body text-center mt-4">Based on 75% LTV, 1.25+ DSCR, 30-year fixed. Rates vary by lender and deal structure.</p>
        </div>
      </section>

      {/* DSCR Thresholds & Programs */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-10">
            <h2 className="section-heading">DSCR Programs &amp; Thresholds</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              { title: '1.25+ DSCR', desc: 'Best-in-class pricing. Full access to every program type. This is where you want to be.', tag: 'Sweet Spot', tagColor: 'bg-green-100 text-green-700' },
              { title: '1.0 – 1.24 DSCR', desc: 'Qualifies at most lenders. Slight rate premium of 12.5-37.5 bps above 1.25+ tier.', tag: 'Standard', tagColor: 'bg-blue-100 text-blue-700' },
              { title: 'Sub-1.0 (0.75+)', desc: 'Property doesn\'t fully cover PITI. Requires 25-30% down, 700+ credit, 9-12 mo reserves.', tag: 'Limited', tagColor: 'bg-yellow-100 text-yellow-700' },
              { title: 'No-Ratio', desc: 'DSCR not calculated. Qualification on credit (720+), LTV (75% max), and reserves alone.', tag: 'Specialized', tagColor: 'bg-purple-100 text-purple-700' },
            ].map((prog) => (
              <div key={prog.title} className="p-5 rounded-lg border border-navy-100 bg-white">
                <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full ${prog.tagColor}`}>{prog.tag}</span>
                <h3 className="text-sm font-sans font-bold text-navy-900 mt-3">{prog.title}</h3>
                <p className="text-xs text-navy-500 font-body mt-2 leading-relaxed">{prog.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reserve Requirements */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-heading text-center mb-8">Reserve Requirements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { months: '3 mo', when: '740+ credit, 1.25+ DSCR, ≤75% LTV', color: 'border-green-300 bg-green-50' },
                { months: '6 mo', when: 'Standard for most DSCR programs', color: 'border-accent bg-accent/5' },
                { months: '9 mo', when: '660-699 credit or 80%+ LTV', color: 'border-yellow-300 bg-yellow-50' },
                { months: '12 mo', when: 'Sub-1.0, no-ratio, or weak combos', color: 'border-red-300 bg-red-50' },
              ].map((r) => (
                <div key={r.months} className={`p-4 rounded-lg border-2 ${r.color} text-center`}>
                  <p className="text-2xl font-sans font-bold text-navy-900">{r.months}</p>
                  <p className="text-[10px] text-navy-500 font-body mt-1 leading-relaxed">{r.when}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-navy-400 font-body text-center mt-4">Reserves = liquid assets after closing (checking, savings, investments at 70-80%, retirement at 60-70%)</p>
          </div>
        </div>
      </section>

      {/* Calculator (gated lead gen) */}
      <section className="bg-navy-50/50 py-16" id="form">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-10">
            <h2 className="section-heading">DSCR Calculator</h2>
            <p className="section-subheading mx-auto mt-4">
              Run your numbers instantly. Get a full AI analysis and scenario-based pre-approval.
            </p>
          </div>
          <DSCRCalculator />
        </div>
      </section>

      {/* AI Appraisal Pre-Check */}
      <AppraisalPreCheck />

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="section-heading text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-0 divide-y divide-navy-100">
            {[
              { q: 'What DSCR do I need?', a: 'Most lenders require 1.0+. Some go as low as 0.75 with a higher down payment or rate adjustment. Our AI Scenario Desk tells you exactly where you stand.' },
              { q: 'Can I use short-term rental income?', a: 'Yes. Several of our lenders accept Airbnb and VRBO income. We normalize it using our STR Signal tool to calculate a conservative DSCR.' },
              { q: 'How fast can I close?', a: 'Most DSCR loans close in 14–21 days from clear-to-close. The full process is typically 3–4 weeks from application to funding.' },
              { q: 'Do I need reserves?', a: 'Typically 6–12 months of PITI in reserves. Some lenders accept cross-collateral or gift funds. We\'ll outline exactly what you need.' },
            ].map((faq) => (
              <div key={faq.q} className="py-6">
                <h3 className="text-h4 text-navy-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-navy-500 font-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
