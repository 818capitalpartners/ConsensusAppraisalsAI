import type { Metadata } from 'next';
import Image from 'next/image';
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
