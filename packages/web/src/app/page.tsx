import Link from 'next/link';
import FundedDealsSection from '@/components/sections/FundedDealsSection';

const LANES = [
  {
    href: '/dscr',
    title: 'DSCR Loans',
    desc: 'Qualify on rental income — no tax returns. Close in as few as 10 days.',
    badge: 'Most Popular',
    iconPath: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
  {
    href: '/fix-and-flip',
    title: 'Fix & Flip',
    desc: 'Up to 90% LTC, 100% rehab financing. Fast closings for experienced flippers.',
    iconPath: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085',
  },
  {
    href: '/str',
    title: 'STR Loans',
    desc: 'Airbnb & VRBO income accepted. We underwrite short-term rental cash flow.',
    iconPath: 'M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819',
  },
  {
    href: '/multifamily',
    title: 'Multifamily',
    desc: '5+ unit commercial financing. NOI-based underwriting, fast pre-approvals.',
    iconPath: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21',
  },
];

const STATS = [
  { value: '32+', label: 'Deals Funded Q1' },
  { value: '4', label: 'Lending Programs' },
  { value: '$50K–$25M', label: 'Loan Range' },
  { value: '50 States', label: 'Coverage' },
];


export default function Home() {
  return (
    <>
      {/* Hero — Mesh Gradient */}
      <section className="relative overflow-hidden mesh-gradient pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mesh-orb" />
        {/* Extra gradient blobs */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/25 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-400/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 mb-8 tracking-wider backdrop-blur-sm">
            Direct Private Lending
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight max-w-4xl mx-auto tracking-tight">
            Smart financing for{' '}
            <span className="gradient-text">
              real estate investors
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Enter your deal numbers. Get an instant score, qualifying programs, and clear next steps.
            No tax returns. No runaround. Just numbers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/dscr"
              className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white btn-gradient rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
            >
              Run a DSCR Analysis
            </Link>
            <Link
              href="/get-quote"
              className="inline-flex items-center justify-center px-7 py-3.5 text-base font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all backdrop-blur-sm"
            >
              Get a Custom Quote
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Lanes — Gradient Border Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Our Lending Programs</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Purpose-built financing for every investment strategy. Pick the program that fits your deal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {LANES.map((lane) => (
            <Link
              key={lane.href}
              href={lane.href}
              className="group relative bg-white rounded-2xl p-7 card-glow"
            >
              {lane.badge && (
                <span className="absolute top-5 right-5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-[#007ACC]/10 to-indigo-500/10 text-indigo-600 border border-indigo-200/50">
                  {lane.badge}
                </span>
              )}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007ACC]/10 to-indigo-500/10 flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={lane.iconPath} />
                </svg>
              </div>
              <h3 className="text-gray-900 text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors tracking-tight">
                {lane.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{lane.desc}</p>
              <span className="text-indigo-600 text-sm font-semibold group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1">
                Run Analysis
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Funded Deals */}
      <FundedDealsSection />

      {/* How It Works */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">How It Works</h2>
            <p className="text-gray-500">Three steps. Under two minutes. Real answers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Enter Your Numbers',
                desc: 'Pick your program (DSCR, Flip, STR, or Multifamily) and enter the deal details. No account needed.',
              },
              {
                step: '02',
                title: 'Get Scored Instantly',
                desc: 'Our underwriting engine calculates your key ratios and scores the deal in real time.',
              },
              {
                step: '03',
                title: 'See Your Options & Close',
                desc: 'See which programs fit your deal and connect directly with our team. Average response: under 2 hours.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007ACC]/10 to-indigo-500/10 mb-5 border border-indigo-100">
                  <span className="gradient-text font-extrabold text-lg">{item.step}</span>
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2 tracking-tight">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center mesh-gradient">
          <div className="mesh-orb" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">Ready to run your numbers?</h2>
            <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-lg mx-auto">
              No account needed. No commitment. Just enter the deal and see where you stand.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dscr"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg shadow-indigo-500/25"
              >
                DSCR Analysis
              </Link>
              <Link
                href="/fix-and-flip"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                Fix & Flip
              </Link>
              <Link
                href="/str"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                STR Loans
              </Link>
              <Link
                href="/multifamily"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                Multifamily
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
