import type { Metadata } from 'next';
import Image from 'next/image';
import DealForm from '@/components/DealForm';

export const metadata: Metadata = {
  title: 'Fix & Flip Loans | 818 Capital',
  description: 'Fast bridge capital for rehab projects. Up to 90% LTC, draw schedules, close in as fast as 10 days.',
};

export default function FlipPage() {
  return (
    <>
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1920&h=600&fit=crop"
          alt="Distressed residential property ready for renovation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-navy-900/50" />
        <div className="relative mx-auto max-w-content px-6 py-16 md:py-20">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">Fix &amp; Flip / Bridge</p>
          <h1 className="text-h1 text-white max-w-2xl">Short-Term Bridge Capital for Rehab Projects</h1>
          <p className="mt-4 text-lg text-navy-100 font-body font-light max-w-xl leading-relaxed">
            Purchase + renovation in one loan. Our Flip Lab analyzes your deal at three ARV scenarios before you make an offer.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2 className="section-heading">How Fix &amp; Flip Loans Work</h2>
              <p className="mt-4 text-navy-500 font-body leading-relaxed">
                We finance up to 90% of the purchase + rehab (LTC) and up to 75% of the ARV. Draws released as work completes. 12–18 month terms with interest-only payments.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Up to 90% LTC', 'Up to 75% of ARV', '12-18 month terms', 'Interest-only payments', 'Draw schedule for rehab', 'Close in 10-14 days'].map((item) => (
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
                {[['Purchase', '$200,000'], ['Rehab', '$75,000'], ['ARV', '$375,000'], ['Total Cost', '$275,000'], ['Loan (85% LTC)', '$233,750']].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center py-2 border-b border-navy-100 last:border-0">
                    <span className="text-sm text-navy-500 font-body">{l}</span>
                    <span className="text-sm font-sans font-semibold text-navy-900">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 bg-white rounded px-4 mt-2">
                  <span className="text-sm font-sans font-semibold text-navy-900">Projected Profit</span>
                  <span className="text-lg font-sans font-bold text-success">$100,000+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-50/50 py-16" id="form">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-10">
            <h2 className="section-heading">Run Your Flip Through Flip Lab</h2>
            <p className="section-subheading mx-auto mt-4">Enter your purchase, rehab, and ARV. Our AI scores the deal at three scenarios.</p>
          </div>
          <DealForm lane="flip">
            <div className="grid grid-cols-2 gap-4">
              <input name="purchase_price" type="number" placeholder="Purchase Price ($)" className="input" />
              <input name="arv" type="number" placeholder="After Repair Value ($)" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="rehab_budget" type="number" placeholder="Rehab Budget ($)" className="input" />
              <input name="loan_amount" type="number" placeholder="Requested Loan ($)" className="input" />
            </div>
            <select name="experience_band" className="input">
              <option value="">Flip Experience</option>
              <option value="0">First flip</option>
              <option value="1-2">1-2 flips</option>
              <option value="3-5">3-5 flips</option>
              <option value="6-10">6-10 flips</option>
              <option value="11+">11+ flips</option>
            </select>
            <select name="fico_band" className="input">
              <option value="">FICO Band</option>
              <option value="<620">Below 620</option>
              <option value="620-659">620-659</option>
              <option value="660-699">660-699</option>
              <option value="700-739">700-739</option>
              <option value="740+">740+</option>
            </select>
          </DealForm>
        </div>
      </section>
    </>
  );
}
