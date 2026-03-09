import Link from 'next/link';

export const metadata = {
  title: 'Broker Program | 818 Capital Partners',
  description: 'Partner with 818 Capital. Access our 14+ lender network, AI-powered deal triage, and fast closings for your investor clients.',
};

export default function BrokerProgramPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 py-16 sm:py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-white/80 border border-white/20 mb-4">
              🤝 BROKER PROGRAM
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Your Investor Clients. Our Lender Network.
            </h1>
            <p className="text-lg text-white/70 mb-6 leading-relaxed">
              Focus on origination. We handle the lender matching, triage, and back-end so you close more deals, faster.
            </p>
            <Link
              href="/get-quote"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Submit a Deal →
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Why Brokers Partner with 818</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🎯',
              title: '14+ Lenders, One Submission',
              desc: 'Submit once. Our engine matches the deal to the right lender based on product type, geography, LTV, DSCR, and FICO.',
            },
            {
              icon: '⚡',
              title: 'AI-Powered Triage',
              desc: 'Every deal gets scored (green/yellow/red) with key metrics calculated instantly. Know where you stand before you pick up the phone.',
            },
            {
              icon: '💰',
              title: 'Protected Compensation',
              desc: 'Your YSP is locked. We never go around you. Transparent fee structures on every deal.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900/30 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Programs You Can Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'DSCR Loans', specs: 'No tax returns, 1-4 units, 30yr fixed, up to 85% LTV, min 0.75x DSCR' },
              { title: 'Fix & Flip', specs: 'Up to 90% LTC, 100% rehab, 5-10 day close, 12-24mo terms' },
              { title: 'STR / Airbnb', specs: 'Airbnb income accepted, DSCR-based, occupancy-adjusted underwriting' },
              { title: 'Multifamily 5+', specs: 'NOI-based, bridge + perm, value-add plays, experienced sponsor programs' },
            ].map((p, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <h3 className="text-white font-semibold mb-1">{p.title}</h3>
                <p className="text-slate-400 text-sm">{p.specs}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to Partner?</h2>
        <p className="text-slate-400 mb-6">
          Email us your first deal or call to get set up. No paperwork to become a partner — just send us a scenario.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:team@818capitalpartners.com?subject=Broker%20Partnership"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            ✉️ Email a Deal
          </a>
          <a
            href="tel:+18185551234"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            📞 (818) 555-1234
          </a>
        </div>
      </section>
    </>
  );
}
