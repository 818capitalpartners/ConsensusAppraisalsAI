import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import DealForm from '@/components/DealForm';

export const metadata: Metadata = {
  title: 'STR Loans | Short-Term Rental Financing | 818 Capital',
  description: 'Finance your Airbnb or VRBO property using STR income. Our STR Signal tool normalizes your revenue for DSCR qualification.',
};

const STR_TYPES = [
  {
    title: 'Vacation Homes',
    desc: 'Beach houses, mountain cabins, lake properties — high-season income qualifies year-round.',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&h=400&fit=crop',
  },
  {
    title: 'Urban Apartments',
    desc: 'City apartments in NYC, Miami, LA, Dallas — consistent demand from business and leisure travelers.',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
  },
  {
    title: 'Luxury Properties',
    desc: 'High-end homes with pools, views, and amenities that command premium nightly rates.',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
  },
];

const MARKETS = [
  { city: 'Miami', detail: 'Year-round demand, beach proximity, strong ADR' },
  { city: 'New York', detail: 'Business travel, tourism, high occupancy' },
  { city: 'Dallas', detail: 'Growing market, event-driven demand, low entry' },
  { city: 'Los Angeles', detail: 'Entertainment, tourism, premium nightly rates' },
  { city: 'Nashville', detail: 'Music city tourism, bachelor/ette parties' },
  { city: 'Austin', detail: 'Tech hub, SXSW, year-round events' },
];

export default function STRPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=600&fit=crop"
          alt="Luxury vacation rental home with pool"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-navy-900/50" />
        <div className="relative mx-auto max-w-content px-6 py-16 md:py-20">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">Short-Term Rental Financing</p>
          <h1 className="text-h1 text-white max-w-2xl">Finance Your Airbnb &amp; VRBO Properties</h1>
          <p className="mt-4 text-lg text-navy-100 font-body font-light max-w-xl leading-relaxed">
            Our STR Signal tool translates your short-term rental income into a DSCR that lenders accept. Platform statements, not tax returns.
          </p>
        </div>
      </section>

      {/* How STR Lending Works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2 className="section-heading">STR Financing, Simplified</h2>
              <p className="mt-4 text-navy-500 font-body leading-relaxed">
                Most lenders use 75% of your trailing-12-month STR income for DSCR calculation. We work with lenders that understand seasonal variation and accept platform statements directly.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Airbnb & VRBO income accepted', '75% of gross STR for DSCR', 'AirDNA market data support', 'Up to 80% LTV', 'Close in an LLC', 'Purchase and cash-out refi', 'No tax returns needed', 'T12 platform statements'].map((item) => (
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
                {[['Annual STR Income', '$72,000'], ['Conservative (75%)', '$54,000/yr'], ['Monthly (Conservative)', '$4,500'], ['Monthly PITI', '$3,200']].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center py-2 border-b border-navy-100 last:border-0">
                    <span className="text-sm text-navy-500 font-body">{l}</span>
                    <span className="text-sm font-sans font-semibold text-navy-900">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 bg-white rounded px-4 mt-2">
                  <span className="text-sm font-sans font-semibold text-navy-900">DSCR</span>
                  <span className="text-lg font-sans font-bold text-success">1.41</span>
                </div>
                <p className="text-sm font-sans font-medium text-success mt-2">Strong deal. Multiple lender options.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STR Property Types */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-12">
            <h2 className="section-heading">We Finance Every Type of STR</h2>
            <p className="section-subheading mx-auto mt-4">
              Whether it&apos;s a beachfront vacation home or a downtown apartment, we structure the loan around your STR income.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STR_TYPES.map((type) => (
              <div key={type.title} className="rounded-lg border border-navy-100 bg-white shadow-sm overflow-hidden">
                <div className="relative h-52">
                  <Image src={type.image} alt={type.title} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-h4 text-navy-900 mb-2">{type.title}</h3>
                  <p className="text-sm text-navy-500 font-body leading-relaxed">{type.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top STR Markets */}
      <section className="relative py-16 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1920&h=600&fit=crop"
          alt="Miami waterfront"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy-900/90" />
        <div className="relative mx-auto max-w-content px-6">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-white font-sans">Top STR Markets We Finance</h2>
            <p className="mt-4 text-navy-200 font-body font-light">
              Active in every major market. We understand local regulations, seasonality, and demand drivers.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MARKETS.map((m) => (
              <div key={m.city} className="rounded-lg border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="text-lg font-sans font-semibold text-white">{m.city}</h3>
                <p className="mt-1 text-sm text-navy-200 font-body">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Need */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="relative rounded-lg overflow-hidden shadow-lg h-80">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
                alt="Beautiful Airbnb property with backyard pool"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="section-heading">What You&apos;ll Need</h2>
              <p className="mt-4 text-navy-500 font-body leading-relaxed mb-6">
                STR documentation is simpler than you think. Here&apos;s what most lenders require:
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Platform Statements', desc: 'Trailing 12 months from Airbnb, VRBO, or your booking platform' },
                  { title: 'AirDNA Report', desc: 'Market data showing comparable properties and revenue potential' },
                  { title: 'Property Photos', desc: 'Current listing photos showing the property and amenities' },
                  { title: 'Operating Expenses', desc: 'Cleaning, management, supplies, insurance — we help you calculate' },
                  { title: 'Entity Docs', desc: 'LLC operating agreement and EIN (we can close in your entity)' },
                ].map((doc) => (
                  <div key={doc.title} className="flex gap-4">
                    <div className="w-1 bg-accent rounded-full flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-sans font-semibold text-navy-900">{doc.title}</h4>
                      <p className="text-sm text-navy-500 font-body mt-0.5">{doc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STR vs LTR Comparison */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">The STR Premium</p>
            <h2 className="section-heading">Short-Term vs Long-Term: The Numbers</h2>
            <p className="section-subheading mx-auto mt-3">Same property. Same market. Dramatically different income.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl border-2 border-navy-200 bg-white">
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.15em] text-navy-400 mb-2">Long-Term Rental</p>
              <p className="text-3xl font-sans font-bold text-navy-900">$2,200<span className="text-lg text-navy-400">/mo</span></p>
              <div className="mt-4 space-y-2 text-xs font-body text-navy-500">
                <div className="flex justify-between"><span>Occupancy</span><span className="font-semibold text-navy-700">100%</span></div>
                <div className="flex justify-between"><span>Annual Income</span><span className="font-semibold text-navy-700">$26,400</span></div>
                <div className="flex justify-between"><span>Management</span><span className="font-semibold text-navy-700">Low</span></div>
              </div>
            </div>
            <div className="p-6 rounded-xl border-2 border-accent bg-accent/5 relative">
              <div className="absolute -top-3 right-4 bg-accent text-white text-[10px] font-sans font-bold px-3 py-1 rounded-full">+53% Income</div>
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.15em] text-accent mb-2">Short-Term Rental</p>
              <p className="text-3xl font-sans font-bold text-navy-900">$3,375<span className="text-lg text-navy-400">/mo avg</span></p>
              <div className="mt-4 space-y-2 text-xs font-body text-navy-500">
                <div className="flex justify-between"><span>Occupancy</span><span className="font-semibold text-accent">75%</span></div>
                <div className="flex justify-between"><span>Annual Income</span><span className="font-semibold text-accent">$40,500</span></div>
                <div className="flex justify-between"><span>Management</span><span className="font-semibold text-navy-700">Higher</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Occupancy Impact on DSCR */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-10">
            <h2 className="section-heading">How Occupancy Changes Your DSCR</h2>
            <p className="section-subheading mx-auto mt-3">10% occupancy difference can mean qualifying or not.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { level: 'Conservative', pct: '65%', income: '$2,925/mo', dscr: '0.95', color: 'border-red-400 bg-red-50', dcrColor: 'text-red-600', tag: 'Needs Restructuring' },
              { level: 'Moderate', pct: '75%', income: '$3,375/mo', dscr: '1.25', color: 'border-accent bg-accent/5', dcrColor: 'text-accent', tag: 'Sweet Spot' },
              { level: 'Aggressive', pct: '85%', income: '$3,825/mo', dscr: '1.55', color: 'border-green-400 bg-green-50', dcrColor: 'text-green-600', tag: 'Strong' },
            ].map((s) => (
              <div key={s.level} className={`p-5 rounded-xl border-2 ${s.color} text-center relative`}>
                {s.level === 'Moderate' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-sans font-bold px-3 py-1 rounded-full whitespace-nowrap">Most Common</div>}
                <p className="text-xs font-sans font-semibold text-navy-500 uppercase tracking-wider">{s.level}</p>
                <p className="text-3xl font-sans font-bold text-navy-900 mt-2">{s.pct}</p>
                <p className="text-xs text-navy-500 font-body">occupancy</p>
                <div className="mt-3 pt-3 border-t border-navy-200">
                  <p className="text-sm font-sans font-semibold text-navy-700">{s.income}</p>
                  <p className={`text-2xl font-sans font-bold mt-1 ${s.dcrColor}`}>{s.dscr} DSCR</p>
                  <p className={`text-[10px] font-sans font-bold mt-1 ${s.dcrColor}`}>{s.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STR DSCR Calculation Flow */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-10">
            <h2 className="section-heading">STR DSCR Calculation — Step by Step</h2>
            <p className="section-subheading mx-auto mt-3">Four numbers. That&apos;s all the lender needs.</p>
          </div>
          <div className="flex flex-col md:flex-row items-stretch gap-4 max-w-4xl mx-auto">
            {[
              { num: 1, label: 'Annual STR Revenue', value: '$40,500', desc: '75% occupancy x $150/night x 365' },
              { num: 2, label: 'Monthly Income', value: '$3,375', desc: '$40,500 / 12 months' },
              { num: 3, label: 'Monthly PITI', value: '$2,700', desc: 'P&I + taxes + insurance' },
              { num: 4, label: 'DSCR Ratio', value: '1.25', desc: '$3,375 / $2,700 = qualifies!' },
            ].map((s, i) => (
              <div key={s.num} className="flex-1 flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-sans font-bold">{s.num}</div>
                  {i < 3 && <div className="hidden md:block w-0.5 h-full bg-accent/20" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-sans font-semibold text-navy-500">{s.label}</p>
                  <p className={`text-xl font-sans font-bold ${s.num === 4 ? 'text-green-600' : 'text-navy-900'}`}>{s.value}</p>
                  <p className="text-[10px] text-navy-400 font-body mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-navy-50/50 py-16" id="form">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-10">
            <h2 className="section-heading">Run Your STR Through STR Signal</h2>
            <p className="section-subheading mx-auto mt-4">Enter your STR income and property details. We&apos;ll normalize and score it.</p>
          </div>
          <DealForm lane="str">
            <div className="grid grid-cols-2 gap-4">
              <input name="estimated_value" type="number" placeholder="Property Value ($)" className="input" />
              <input name="loan_amount" type="number" placeholder="Loan Amount ($)" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="annual_str_income" type="number" placeholder="Annual STR Income ($)" className="input" />
              <input name="piti" type="number" placeholder="Monthly PITI ($)" className="input" />
            </div>
            <input name="occupancy_rate" type="number" step="0.01" placeholder="Average Occupancy Rate (e.g. 0.75)" className="input" />
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
