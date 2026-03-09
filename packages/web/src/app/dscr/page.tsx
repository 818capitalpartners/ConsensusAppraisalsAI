import LaneHero from '@/components/layout/LaneHero';
import DSCRForm from '@/components/forms/DSCRForm';

export const metadata = {
  title: 'DSCR Loans — No Tax Returns Required | 818 Capital Partners',
  description: 'Qualify based on rental income, not personal income. DSCR investor loans with fast closings, competitive rates, and no W-2s needed.',
};

export default function DSCRPage() {
  return (
    <>
      <LaneHero
        title="DSCR Loans — Qualify on Rental Income"
        subtitle="No tax returns. No W-2s. No DTI headaches. If the property cash flows, you qualify. Purpose-built for rental investors who want speed and simplicity."
        badge="📊 DSCR LOANS"
        gradient="bg-gradient-to-br from-blue-900/80 via-slate-900 to-slate-950"
        features={[
          'No personal income docs',
          'Close in 10-20 days',
          'LTV up to 80-85%',
          '1-4 unit SFR, condos, townhomes',
          'Foreign nationals OK',
          'No-ratio programs available',
        ]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Run Your DSCR Numbers</h2>
          <p className="text-slate-400">
            Enter the deal details and we&apos;ll calculate your DSCR ratio, score the deal, and match you with the right lender — instantly.
          </p>
        </div>

        <DSCRForm />
      </section>

      {/* How DSCR Works */}
      <section className="bg-slate-900/30 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How DSCR Loans Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📊', title: 'Income = Rent', desc: 'Qualification is based on the property\'s rental income divided by the mortgage payment (PITI). A DSCR of 1.25x or higher is ideal.' },
              { icon: '⚡', title: 'Fast & Simple', desc: 'No tax returns, no employment verification, no DTI calculation. Just the property numbers and a credit check.' },
              { icon: '🏠', title: 'Flexible Terms', desc: '30-year fixed, 5/6 ARM, interest-only options. Purchase or refinance. LLC or individual name. STR income accepted.' },
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
