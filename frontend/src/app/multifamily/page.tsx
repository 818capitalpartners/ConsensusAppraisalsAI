import type { Metadata } from 'next';
import Image from 'next/image';
import DealForm from '@/components/DealForm';
import AppraisalPreCheck from '@/components/AppraisalPreCheck';

export const metadata: Metadata = {
  title: 'Multifamily Loans | 818 Capital',
  description: '5+ unit apartment buildings and small commercial financing. AI-powered Sponsor Brief underwriting in 24 hours.',
};

const MARKET_STATS = [
  { value: '5.8%', label: 'Avg Cap Rate', trend: 'down', detail: 'Compressed 40bps YoY' },
  { value: '$182K', label: 'Avg Price/Unit', trend: 'up', detail: 'Up 6.2% nationally' },
  { value: '94.2%', label: 'Occupancy Rate', trend: 'stable', detail: 'Stable across top 50 MSAs' },
  { value: '3.1%', label: 'Rent Growth', trend: 'up', detail: 'Trailing 12-mo avg' },
];

const PROGRAM_TIERS = [
  { name: 'Agency (Fannie/Freddie)', units: '5–500+', ltv: 'Up to 80%', term: '5–35yr', best: 'Stabilized assets with strong NOI' },
  { name: 'Bridge / Value-Add', units: '5–200+', ltv: 'Up to 80% LTC', term: '12–36mo IO', best: 'Renovation, lease-up, repositioning' },
  { name: 'CMBS / Life Company', units: '20+', ltv: 'Up to 75%', term: '5–25yr fixed', best: 'Long-term hold, institutional quality' },
  { name: 'DSCR Multifamily', units: '5–20', ltv: 'Up to 80%', term: '30yr fixed', best: 'Small multifamily, no tax returns' },
];

const TOP_MARKETS = [
  { market: 'Dallas-Fort Worth', units: '28K+', occ: '92%', growth: '+4.1%', image: 'https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=400&q=80' },
  { market: 'Phoenix', units: '22K+', occ: '94%', growth: '+3.8%', image: 'https://images.unsplash.com/photo-1558645836-e44122a743ee?w=400&q=80' },
  { market: 'Atlanta', units: '19K+', occ: '93%', growth: '+3.5%', image: 'https://images.unsplash.com/photo-1575917649111-0c4d35e0391a?w=400&q=80' },
  { market: 'Nashville', units: '12K+', occ: '91%', growth: '+4.7%', image: 'https://images.unsplash.com/photo-1545419913-775e3e0e2fc4?w=400&q=80' },
];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-success text-sm">&#9650;</span>;
  if (trend === 'down') return <span className="text-red-500 text-sm">&#9660;</span>;
  return <span className="text-navy-400 text-sm">&#9644;</span>;
}

export default function MultifamilyPage() {
  return (
    <>
      {/* Hero */}
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

      {/* National Market Snapshot */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="section-heading">National Market Snapshot</h2>
            <span className="text-[10px] font-sans font-semibold text-navy-400 bg-navy-50 px-2.5 py-1 rounded uppercase tracking-wider">Q1 2026</span>
          </div>
          <p className="text-sm text-navy-500 font-body mb-8">Source: Northmarq, CBRE, CoStar — national multifamily averages</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {MARKET_STATS.map((stat, i) => (
              <div key={i} className="card text-center p-6">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-3xl font-sans font-bold text-navy-900">{stat.value}</span>
                  <TrendIcon trend={stat.trend} />
                </div>
                <div className="text-sm font-sans font-semibold text-navy-700 mb-1">{stat.label}</div>
                <div className="text-xs text-navy-400 font-body">{stat.detail}</div>
              </div>
            ))}
          </div>

          {/* Top Markets */}
          <h3 className="text-h4 text-navy-900 mb-2">Top Performing Markets</h3>
          <p className="text-sm text-navy-500 font-body mb-6">Where we&apos;re actively funding multifamily deals</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {TOP_MARKETS.map((m, i) => (
              <div key={i} className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition h-52">
                <Image src={m.image} alt={m.market} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-white font-sans font-semibold text-sm mb-2">{m.market}</div>
                  <div className="flex gap-3 text-[11px] font-body">
                    <div><span className="text-navy-300">Units</span><div className="text-white font-semibold">{m.units}</div></div>
                    <div><span className="text-navy-300">Occ.</span><div className="text-accent-light font-semibold">{m.occ}</div></div>
                    <div><span className="text-navy-300">Rent</span><div className="text-accent-light font-semibold">{m.growth}</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Program Tiers */}
          <h3 className="text-h4 text-navy-900 mb-2">Financing Programs</h3>
          <p className="text-sm text-navy-500 font-body mb-6">Matched to your deal profile, sponsor experience, and exit strategy</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROGRAM_TIERS.map((tier, i) => (
              <div key={i} className="card p-6">
                <h4 className="text-h4 text-navy-900 mb-3">{tier.name}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-body mb-4">
                  <div><span className="text-navy-400">Units:</span> <span className="font-semibold text-navy-700">{tier.units}</span></div>
                  <div><span className="text-navy-400">LTV:</span> <span className="font-semibold text-navy-700">{tier.ltv}</span></div>
                  <div className="col-span-2"><span className="text-navy-400">Term:</span> <span className="font-semibold text-navy-700">{tier.term}</span></div>
                </div>
                <div className="text-xs text-navy-500 font-body bg-navy-50 px-3 py-2 rounded">
                  Best for: {tier.best}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Appraisal Pre-Check */}
      <AppraisalPreCheck />

      {/* Form */}
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
