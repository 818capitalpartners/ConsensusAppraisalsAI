import Link from 'next/link';

const LANES = [
  {
    href: '/dscr',
    icon: '📊',
    title: 'DSCR Loans',
    desc: 'Qualify on rental income — no tax returns. Close in 10-20 days.',
    badge: 'Most Popular',
    gradient: 'from-blue-500/20 to-blue-600/5',
  },
  {
    href: '/fix-and-flip',
    icon: '🔨',
    title: 'Fix & Flip',
    desc: 'Up to 90% LTC, 100% rehab. Close in 5-10 business days.',
    gradient: 'from-amber-500/20 to-amber-600/5',
  },
  {
    href: '/str',
    icon: '🏖️',
    title: 'STR Loans',
    desc: 'Airbnb/VRBO income works. We normalize T12 into lender-ready DSCR.',
    gradient: 'from-teal-500/20 to-teal-600/5',
  },
  {
    href: '/multifamily',
    icon: '🏢',
    title: 'Multifamily',
    desc: '5+ unit commercial financing. NOI-based underwriting, fast pre-approvals.',
    gradient: 'from-purple-500/20 to-purple-600/5',
  },
];

const STATS = [
  { value: '14+', label: 'Lending Partners' },
  { value: '<2hr', label: 'Response Time' },
  { value: '4', label: 'Product Lanes' },
  { value: '$50K–$25M', label: 'Loan Range' },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDBNIDAgMjAgTCA0MCAyMCBNIDIwIDAgTCAyMCA0MCBNIDAgMzAgTCA0MCAzMCBNIDMwIDAgTCAzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
            Investor-Focused Lending Partner
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
            Smart financing for{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              real estate investors
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Enter your deal numbers. Get an instant score, matching lenders, and clear next steps.
            No tax returns. No runaround. Just numbers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/dscr"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              Run a DSCR Analysis →
            </Link>
            <Link
              href="/get-quote"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Get a Custom Quote
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Lanes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Choose Your Lane</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Each program has its own form, its own triage engine, and its own lender pool. Pick the one that fits your deal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LANES.map((lane) => (
            <Link
              key={lane.href}
              href={lane.href}
              className={`group relative bg-gradient-to-br ${lane.gradient} rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.01]`}
            >
              {lane.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {lane.badge}
                </span>
              )}
              <div className="text-4xl mb-4">{lane.icon}</div>
              <h3 className="text-white text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                {lane.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{lane.desc}</p>
              <span className="text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                Run Analysis →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-900/30 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-slate-400">Three steps. Under two minutes. Real answers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Enter Your Numbers',
                desc: 'Pick your lane (DSCR, Flip, STR, or Multifamily) and plug in the deal details. No account needed.',
              },
              {
                step: '02',
                title: 'Get Scored Instantly',
                desc: 'Our triage engine calculates your key ratios and scores the deal as green, yellow, or red.',
              },
              {
                step: '03',
                title: 'Get Matched & Close',
                desc: 'We show you which lenders fit your deal and connect you directly. Average response: under 2 hours.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 font-mono font-bold text-lg mb-4 border border-blue-500/20">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 sm:p-12 border border-blue-500/20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to run your numbers?</h2>
          <p className="text-slate-300 text-sm sm:text-base mb-6 max-w-lg mx-auto">
            No account needed. No commitment. Just enter the deal and see where you stand.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dscr"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              DSCR Analysis
            </Link>
            <Link
              href="/fix-and-flip"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Flip Lab
            </Link>
            <Link
              href="/str"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              STR Signal
            </Link>
            <Link
              href="/multifamily"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Sponsor Brief
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
