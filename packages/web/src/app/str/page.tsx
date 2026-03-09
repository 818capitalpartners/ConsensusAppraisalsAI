import LaneHero from '@/components/layout/LaneHero';
import STRForm from '@/components/forms/STRForm';

export const metadata = {
  title: 'Short-Term Rental Loans — STR DSCR Financing | 818 Capital Partners',
  description: 'Finance your Airbnb or VRBO property. We normalize STR income into lender-ready DSCR. No tax returns, fast closings.',
};

export default function STRPage() {
  return (
    <>
      <LaneHero
        title="Short-Term Rental Loans"
        subtitle="Airbnb and VRBO income works — you just need a lender who knows how to underwrite it. We normalize your T12 revenue into lender-ready DSCR."
        badge="🏖️ STR LOANS"
        gradient="bg-gradient-to-br from-teal-900/60 via-slate-900 to-slate-950"
        features={[
          'Airbnb/VRBO income accepted',
          'DSCR-based qualification',
          'No personal income docs',
          'STR management fee factored in',
          'Occupancy-adjusted numbers',
          'Vacation/cabin eligible',
        ]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Run Your STR Numbers</h2>
          <p className="text-slate-400">
            Enter your gross monthly revenue, occupancy rate, and management fee. We&apos;ll calculate the lender-ready DSCR and match you.
          </p>
        </div>

        <STRForm />
      </section>

      <section className="bg-slate-900/30 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How We Underwrite STR Income</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📅', title: 'T12 Revenue', desc: 'We use your trailing 12-month gross revenue from Airbnb/VRBO as the starting point. Lenders need consistency, not peak months.' },
              { icon: '📉', title: 'Occupancy + Mgmt', desc: 'We adjust for occupancy rate and management fees to get the effective net income the lender sees. This is your real DSCR.' },
              { icon: '✅', title: 'STR-Ready DSCR', desc: 'The adjusted income divided by PITI gives your STR-DSCR. Above 1.25x = green light. We match you with STR-friendly lenders.' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
