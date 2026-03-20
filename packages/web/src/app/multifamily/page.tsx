import LaneHero from '@/components/layout/LaneHero';
import MultifamilyForm from '@/components/forms/MultifamilyForm';
import Image from 'next/image';

export const metadata = {
  title: 'Multifamily Loans — 5+ Unit Commercial Financing | 818 Capital Partners',
  description: 'Commercial multifamily financing for 5+ unit properties. Competitive rates, fast pre-approvals, and experienced sponsors.',
};

const MARKET_STATS = [
  { value: '5.8%', label: 'Avg Cap Rate', trend: 'down', detail: 'Compressed 40bps YoY' },
  { value: '$182K', label: 'Avg Price/Unit', trend: 'up', detail: 'Up 6.2% nationally' },
  { value: '94.2%', label: 'Occupancy Rate', trend: 'stable', detail: 'Stable across top 50 MSAs' },
  { value: '3.1%', label: 'Rent Growth', trend: 'up', detail: 'Trailing 12-mo avg' },
];

const PROGRAM_TIERS = [
  {
    name: 'Agency (Fannie/Freddie)',
    units: '5–500+ units',
    ltv: 'Up to 80% LTV',
    rate: 'Lowest rates',
    term: '5–35 year terms',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    color: 'from-blue-500/15 to-indigo-500/15 text-blue-700 border-blue-200/50',
    best: 'Stabilized assets with strong NOI',
  },
  {
    name: 'Bridge / Value-Add',
    units: '5–200+ units',
    ltv: 'Up to 80% LTC',
    rate: 'Market rates',
    term: '12–36 month IO',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
      </svg>
    ),
    color: 'from-amber-500/15 to-orange-500/15 text-amber-700 border-amber-200/50',
    best: 'Renovation, lease-up, repositioning',
  },
  {
    name: 'CMBS / Life Company',
    units: '20+ units',
    ltv: 'Up to 75% LTV',
    rate: 'Fixed 5–10yr',
    term: '5–25 year fixed',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
      </svg>
    ),
    color: 'from-emerald-500/15 to-teal-500/15 text-emerald-700 border-emerald-200/50',
    best: 'Long-term hold, institutional quality',
  },
  {
    name: 'DSCR Multifamily',
    units: '5–20 units',
    ltv: 'Up to 80% LTV',
    rate: '30-yr fixed',
    term: '30 year amortized',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: 'from-purple-500/15 to-fuchsia-500/15 text-purple-700 border-purple-200/50',
    best: 'Small multifamily, no tax returns',
  },
];

const TOP_MARKETS = [
  { market: 'Dallas-Fort Worth', units: '28K+', absorption: '92%', growth: '+4.1%', image: 'https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=400&q=80' },
  { market: 'Phoenix', units: '22K+', absorption: '94%', growth: '+3.8%', image: 'https://images.unsplash.com/photo-1558645836-e44122a743ee?w=400&q=80' },
  { market: 'Atlanta', units: '19K+', absorption: '93%', growth: '+3.5%', image: 'https://images.unsplash.com/photo-1575917649111-0c4d35e0391a?w=400&q=80' },
  { market: 'Nashville', units: '12K+', absorption: '91%', growth: '+4.7%', image: 'https://images.unsplash.com/photo-1545419913-775e3e0e2fc4?w=400&q=80' },
];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-emerald-500 text-sm">&#9650;</span>;
  if (trend === 'down') return <span className="text-red-400 text-sm">&#9660;</span>;
  return <span className="text-gray-400 text-sm">&#9644;</span>;
}

export default function MultifamilyPage() {
  return (
    <>
      <LaneHero
        title="Multifamily Financing"
        subtitle="5+ unit commercial deals need commercial-grade underwriting that moves fast and thinks like an investor. We run your sponsor brief and identify programs in minutes."
        badge="MULTIFAMILY"
        gradient="bg-gradient-to-br from-purple-900/60 via-slate-900 to-slate-950"
        features={[
          '5-500+ units',
          'Bridge + permanent options',
          'NOI-based underwriting',
          'Value-add plays welcome',
          'Experienced sponsor programs',
          'Agency + non-agency options',
        ]}
      />

      {/* National Market Snapshot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">National Market Snapshot</h2>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Q1 2026</span>
          </div>
          <p className="text-sm text-gray-500">Source: Northmarq, CBRE, CoStar — national multifamily averages</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {MARKET_STATS.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 card-glow text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</span>
                <TrendIcon trend={stat.trend} />
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-400">{stat.detail}</div>
            </div>
          ))}
        </div>

        {/* Top Markets Visual Grid */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">Top Performing Markets</h3>
          <p className="text-sm text-gray-500">Where we&apos;re actively funding multifamily deals</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {TOP_MARKETS.map((m, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden card-glow h-52">
              <Image
                src={m.image}
                alt={m.market}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-white font-bold text-sm mb-2">{m.market}</div>
                <div className="flex gap-3 text-[11px]">
                  <div>
                    <span className="text-gray-400">Units</span>
                    <div className="text-white font-semibold">{m.units}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Occ.</span>
                    <div className="text-emerald-400 font-semibold">{m.absorption}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Rent</span>
                    <div className="text-emerald-400 font-semibold">{m.growth}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Program Tiers */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">Financing Programs</h3>
          <p className="text-sm text-gray-500">Matched to your deal profile, sponsor experience, and exit strategy</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {PROGRAM_TIERS.map((tier, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 card-glow">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tier.color.split(' ').slice(0, 2).join(' ')} flex items-center justify-center flex-shrink-0`}>
                  <div className={tier.color.split(' ')[2]}>{tier.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 mb-2">{tier.name}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
                    <div><span className="text-gray-400">Units:</span> <span className="font-medium text-gray-700">{tier.units}</span></div>
                    <div><span className="text-gray-400">LTV:</span> <span className="font-medium text-gray-700">{tier.ltv}</span></div>
                    <div><span className="text-gray-400">Rate:</span> <span className="font-medium text-gray-700">{tier.rate}</span></div>
                    <div><span className="text-gray-400">Term:</span> <span className="font-medium text-gray-700">{tier.term}</span></div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                    Best for: {tier.best}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sponsor Brief Form */}
        <div className="mb-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Run Your Sponsor Brief</h2>
          <p className="text-gray-500">
            Enter the property numbers. We&apos;ll calculate NOI, cap rate, DSCR, price per unit, and identify qualifying commercial programs.
          </p>
        </div>

        <MultifamilyForm />
      </section>
    </>
  );
}
