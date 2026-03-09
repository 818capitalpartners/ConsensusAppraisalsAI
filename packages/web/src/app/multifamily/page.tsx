import LaneHero from '@/components/layout/LaneHero';
import MultifamilyForm from '@/components/forms/MultifamilyForm';

export const metadata = {
  title: 'Multifamily Loans — 5+ Unit Commercial Financing | 818 Capital Partners',
  description: 'Commercial multifamily financing for 5+ unit properties. Competitive rates, fast pre-approvals, and experienced sponsors.',
};

export default function MultifamilyPage() {
  return (
    <>
      <LaneHero
        title="Multifamily Financing"
        subtitle="5+ unit commercial deals need commercial lenders who move fast and think like investors. We run your sponsor brief and match you in minutes."
        badge="🏢 MULTIFAMILY"
        gradient="bg-gradient-to-br from-purple-900/60 via-slate-900 to-slate-950"
        features={[
          '5-500+ units',
          'Bridge + permanent options',
          'NOI-based underwriting',
          'Value-add plays welcome',
          'Experienced sponsor programs',
          'Agency + non-agency lenders',
        ]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Run Your Sponsor Brief</h2>
          <p className="text-slate-400">
            Enter the property numbers. We&apos;ll calculate NOI, cap rate, DSCR, price per unit, and match you with commercial lenders.
          </p>
        </div>

        <MultifamilyForm />
      </section>

      <section className="bg-slate-900/30 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">What Lenders Look For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { metric: 'DSCR ≥ 1.25x', desc: 'Net operating income divided by annual debt service. The golden ratio for commercial lenders.' },
              { metric: 'Cap Rate ≥ 6%', desc: 'NOI divided by purchase price. Shows the property\'s return independent of financing.' },
              { metric: 'Price/Unit < Market', desc: 'Lenders compare your price per unit against the submarket. Below market = more equity cushion.' },
              { metric: 'Sponsor Experience', desc: 'Most commercial lenders want 3+ units managed. More experience = better terms and higher leverage.' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 flex gap-4">
                <div className="text-blue-400 font-mono text-sm font-bold whitespace-nowrap">{item.metric}</div>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
