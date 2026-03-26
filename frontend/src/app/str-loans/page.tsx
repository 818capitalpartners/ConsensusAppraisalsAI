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

      {/* STR Playbook Highlights */}
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">Free Download</p>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-white leading-tight">
                The 2026 Short-Term Rental<br />Investor Playbook
              </h2>
              <p className="mt-4 text-navy-300 font-body leading-relaxed">
                Revenue projections, seasonal charts, occupancy impact analysis, top STR markets, setup costs, and 3 real funded deal breakdowns.
              </p>
              <Link href="/str-playbook-2026" className="btn-primary mt-6 inline-flex items-center gap-2">
                Get the Playbook
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'STR Premium', value: '+53%', sub: 'vs long-term rental income' },
                { label: 'Avg Nightly', value: '$150–350', sub: 'Across top markets' },
                { label: 'Sweet Spot', value: '75% Occ', sub: '1.25 DSCR qualification' },
                { label: 'Setup Cost', value: '$15–30K', sub: '3-6 month payback' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-lg bg-navy-800 border border-navy-700">
                  <p className="text-[10px] font-sans font-semibold text-accent-light uppercase tracking-wider">{item.label}</p>
                  <p className="text-lg font-sans font-bold text-white mt-1">{item.value}</p>
                  <p className="text-[10px] text-navy-400 font-body">{item.sub}</p>
                </div>
              ))}
            </div>
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
