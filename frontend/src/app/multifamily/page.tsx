import type { Metadata } from 'next';
import Image from 'next/image';
import DealForm from '@/components/DealForm';
import AppraisalPreCheck from '@/components/AppraisalPreCheck';

export const metadata: Metadata = {
  title: 'Multifamily Loans | 818 Capital',
  description: '5+ unit apartment buildings and small commercial financing. AI-powered Sponsor Brief underwriting in 24 hours.',
};

export default function MultifamilyPage() {
  return (
    <>
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&h=600&fit=crop"
          alt="Multifamily apartment building"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-navy-900/50" />
        <div className="relative mx-auto max-w-content px-6 py-16 md:py-20">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">Multifamily / Commercial</p>
          <h1 className="text-h1 text-white max-w-2xl">Apartment &amp; Commercial Property Financing</h1>
          <p className="mt-4 text-lg text-navy-100 font-body font-light max-w-xl leading-relaxed">
            5+ unit apartment buildings, mixed-use, and small commercial. Submit your NOI and get an AI Sponsor Brief with DSCR, debt yield, and leverage analysis.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2 className="section-heading">Commercial Lending, Demystified</h2>
              <p className="mt-4 text-navy-500 font-body leading-relaxed">
                Multifamily and commercial loans are underwritten on the property&apos;s Net Operating Income. We analyze DSCR, cap rate, debt yield, and leverage to find the best financing path — agency, CMBS, bank, or bridge.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['5+ units, apartments, mixed-use', 'Agency, CMBS, bank & bridge', 'Up to 80% LTV', 'Non-recourse available', '$500K to $10M+', 'Value-add and stabilized'].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-navy-700 font-body">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-navy-50 rounded-lg p-8">
              <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-4">Example Scenario</p>
              <div className="space-y-3">
                {[['Property', '12-unit building'], ['Purchase Price', '$1,500,000'], ['NOI', '$120,000'], ['Loan (75% LTV)', '$1,125,000'], ['Cap Rate', '8.0%']].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center py-2 border-b border-navy-100 last:border-0">
                    <span className="text-sm text-navy-500 font-body">{l}</span>
                    <span className="text-sm font-sans font-semibold text-navy-900">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 bg-white rounded px-4 mt-2">
                  <span className="text-sm font-sans font-semibold text-navy-900">DSCR</span>
                  <span className="text-lg font-sans font-bold text-success">1.52</span>
                </div>
                <p className="text-sm font-sans font-medium text-success mt-2">Strong deal. Agency or bank best path.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Appraisal Pre-Check */}
      <AppraisalPreCheck />

      <section className="bg-navy-50/50 py-16" id="form">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-10">
            <h2 className="section-heading">Get Your Sponsor Brief</h2>
            <p className="section-subheading mx-auto mt-4">Submit your multifamily scenario. AI generates a Sponsor Brief in seconds.</p>
          </div>
          <DealForm lane="multifamily">
            <input name="units" type="number" placeholder="Number of Units" className="input" />
            <div className="grid grid-cols-2 gap-4">
              <input name="purchase_price" type="number" placeholder="Purchase Price / Value ($)" className="input" />
              <input name="loan_amount" type="number" placeholder="Requested Loan ($)" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="noi" type="number" placeholder="Net Operating Income ($)" className="input" />
              <input name="estimated_value" type="number" placeholder="Estimated Value ($)" className="input" />
            </div>
          </DealForm>
        </div>
      </section>
    </>
  );
}
