import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import DealForm from '@/components/DealForm';

export const metadata: Metadata = {
  title: 'Fix & Flip Loans | 818 Capital',
  description: 'Fast bridge capital for rehab projects. Up to 90% LTC, draw schedules, close in as fast as 10 days.',
  alternates: { canonical: 'https://www.818capitalpartners.com/fix-and-flip' },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.818capitalpartners.com/' },
    { '@type': 'ListItem', position: 2, name: 'Fix & Flip Loans', item: 'https://www.818capitalpartners.com/fix-and-flip' },
  ],
};

export default function FlipPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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

      {/* Bridge Loan Programs */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">Financing Options</p>
            <h2 className="section-heading">Bridge Loan Programs Compared</h2>
            <p className="section-subheading mx-auto mt-3">More leverage = less cash out of pocket, but higher rates.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { label: '90% LTC + 100% Rehab', rate: '9.5–11%', width: '95%', tag: 'Maximum Leverage', accent: true },
              { label: '85% LTC + 100% Rehab', rate: '9–10.5%', width: '85%', tag: 'Aggressive', accent: true },
              { label: '80% LTC + 90% Rehab', rate: '8.5–10%', width: '75%', tag: 'Standard', accent: false },
              { label: '75% LTC + 80% Rehab', rate: '8–9.5%', width: '65%', tag: 'Conservative', accent: false },
            ].map((p) => (
              <div key={p.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-sans font-semibold text-navy-700">{p.label}</span>
                  <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full ${p.accent ? 'bg-accent/10 text-accent' : 'bg-navy-100 text-navy-500'}`}>{p.tag}</span>
                </div>
                <div className="flex-1 bg-navy-100 rounded-full h-7 relative overflow-hidden">
                  <div className={`h-full rounded-full flex items-center justify-end pr-3 ${p.accent ? 'bg-accent' : 'bg-navy-300'}`} style={{ width: p.width }}>
                    <span className="text-xs font-sans font-bold text-white">{p.rate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flip Timeline */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-heading">The 6-Month Flip Lifecycle</h2>
              <p className="section-subheading mx-auto mt-3">From close to cash — every month matters.</p>
            </div>
            <div className="flex rounded-lg overflow-hidden h-12 mb-4">
              {[
                { label: 'Close', color: 'bg-accent', width: '8%' },
                { label: 'Rehab', color: 'bg-orange-500', width: '35%' },
                { label: 'List', color: 'bg-yellow-500', width: '10%' },
                { label: 'Sell', color: 'bg-green-500', width: '20%' },
                { label: 'Buffer', color: 'bg-navy-200', width: '27%' },
              ].map((phase) => (
                <div key={phase.label} className={`${phase.color} flex items-center justify-center`} style={{ width: phase.width }}>
                  <span className="text-[10px] font-sans font-bold text-white">{phase.label}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-white border border-navy-200 text-center">
              <p className="text-xs text-navy-600 font-body">Carrying costs accumulate at <span className="font-bold text-navy-900">~$3,000/month</span> — every month over budget costs you profit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rehab Budget + ROI */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-12 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* Rehab Budget */}
            <div>
              <h3 className="text-lg font-sans font-bold text-navy-900 mb-4">Where Your Rehab Budget Goes</h3>
              <p className="text-xs text-navy-500 font-body mb-4">Based on $75,000 total rehab budget</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Kitchen', pct: 28, cost: '$21,000', color: 'bg-accent' },
                  { label: 'Bathrooms', pct: 18, cost: '$13,500', color: 'bg-blue-400' },
                  { label: 'Systems', pct: 17, cost: '$12,750', color: 'bg-navy-500' },
                  { label: 'Flooring', pct: 13, cost: '$9,750', color: 'bg-navy-400' },
                  { label: 'Exterior', pct: 10, cost: '$7,500', color: 'bg-navy-300' },
                  { label: 'Contingency', pct: 14, cost: '$10,500', color: 'bg-orange-400' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-[10px] font-sans text-navy-600 w-20 text-right shrink-0">{item.label}</span>
                    <div className="flex-1 bg-navy-100 rounded-full h-5 overflow-hidden">
                      <div className={`h-full rounded-full flex items-center justify-between px-2 ${item.color}`} style={{ width: `${item.pct * 2.5}%` }}>
                        <span className="text-[9px] font-bold text-white">{item.pct}%</span>
                        <span className="text-[9px] font-bold text-white">{item.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* ROI Sensitivity */}
            <div>
              <h3 className="text-lg font-sans font-bold text-navy-900 mb-4">ROI by ARV &amp; Rehab Cost</h3>
              <p className="text-xs text-navy-500 font-body mb-4">$200K purchase. Green = strong. Yellow = caution. Red = pass.</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-900 text-white">
                    <th className="p-2 text-left text-[10px] font-sans">ARV</th>
                    <th className="p-2 text-center text-[10px] font-sans">$60K</th>
                    <th className="p-2 text-center text-[10px] font-sans">$75K</th>
                    <th className="p-2 text-center text-[10px] font-sans">$90K</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { arv: '$350K', cells: [{ v: '95%', c: 'bg-green-100 text-green-800' }, { v: '60%', c: 'bg-yellow-100 text-yellow-800' }, { v: '24%', c: 'bg-red-100 text-red-800' }] },
                    { arv: '$375K', cells: [{ v: '155%', c: 'bg-green-100 text-green-800' }, { v: '124%', c: 'bg-green-100 text-green-800' }, { v: '83%', c: 'bg-yellow-100 text-yellow-800' }] },
                    { arv: '$400K', cells: [{ v: '215%', c: 'bg-green-100 text-green-800' }, { v: '183%', c: 'bg-green-100 text-green-800' }, { v: '143%', c: 'bg-green-100 text-green-800' }] },
                  ].map((row) => (
                    <tr key={row.arv} className="border-b border-navy-100">
                      <td className="p-2 font-sans font-bold text-navy-900 text-[10px]">{row.arv}</td>
                      {row.cells.map((cell, i) => (
                        <td key={i} className="p-1.5 text-center">
                          <span className={`inline-block rounded px-2 py-1 text-[10px] font-bold ${cell.c}`}>{cell.v}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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
