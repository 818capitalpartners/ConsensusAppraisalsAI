import LaneHero from '@/components/layout/LaneHero';
import FlipForm from '@/components/forms/FlipForm';

export const metadata = {
  title: 'Fix & Flip Loans — Fast Close, Up to 90% LTC | 818 Capital Partners',
  description: 'Fix and flip financing with up to 90% LTC, 100% rehab funding, and closings in 5-10 days. Run your flip numbers instantly.',
};

export default function FlipPage() {
  return (
    <>
      <LaneHero
        title="Fix & Flip Financing"
        subtitle="Speed kills in flipping — and so does the wrong lender. We pair you with lenders who close in days, fund rehab, and don't nickel-and-dime draws."
        badge="🔨 FIX & FLIP"
        gradient="bg-gradient-to-br from-amber-900/60 via-slate-900 to-slate-950"
        features={[
          'Close in 5-10 business days',
          'Up to 90% LTC',
          'Up to 100% rehab funded',
          '12-24 month terms',
          'Draw process included',
          'Flip-to-DSCR refi available',
        ]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Run Your Flip Numbers</h2>
          <p className="text-slate-400">
            Enter the purchase price, rehab budget, and ARV. We&apos;ll run 3 profit scenarios and match you with the best flip lender.
          </p>
        </div>

        <FlipForm />
      </section>

      <section className="bg-slate-900/30 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">The 818 Flip Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Submit Deal', desc: 'Purchase price, rehab, ARV. We score it in seconds.' },
              { step: '02', title: 'Get Matched', desc: 'We match your deal with 2-3 lenders based on LTC, geography, and experience.' },
              { step: '03', title: 'Close Fast', desc: 'Pre-approval in 24hrs. Close in 5-10 business days with the right lender.' },
              { step: '04', title: 'Exit Clean', desc: 'Sell for profit or refi into a DSCR rental loan. We handle the exit too.' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="text-blue-400 font-mono text-sm font-bold mb-2">{item.step}</div>
                <h3 className="text-white font-semibold mb-1 text-sm">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
