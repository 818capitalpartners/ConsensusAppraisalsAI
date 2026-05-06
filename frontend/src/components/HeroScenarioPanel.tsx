const SCENARIOS = [
  {
    type: 'DSCR Rental',
    market: '1-4 unit rental property',
    amount: '$825K',
    detail: '75% LTV | rent-based qualification',
  },
  {
    type: 'Fix & Flip',
    market: 'Purchase + rehab bridge',
    amount: '$285K',
    detail: '85% LTC | draw schedule included',
  },
  {
    type: 'STR Loan',
    market: 'Short-term rental refinance',
    amount: '$615K',
    detail: 'Platform income | DSCR normalized',
  },
];

export default function HeroScenarioPanel() {
  return (
    <div className="relative hidden md:block">
      <div className="rounded-lg border border-navy-100 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-navy-100 pb-4">
          <div>
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.18em] text-accent">Scenario Desk</p>
            <h2 className="mt-1 text-2xl font-sans font-bold text-navy-900">Deals We Structure</h2>
          </div>
          <div className="rounded-full bg-accent px-4 py-2 text-xs font-sans font-bold text-white">
            14-21 Days
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {SCENARIOS.map((scenario) => (
            <div key={scenario.type} className="rounded-lg border border-navy-100 bg-navy-50/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-sans font-bold text-navy-900">{scenario.type}</p>
                  <p className="mt-1 text-xs font-body text-navy-500">{scenario.market}</p>
                </div>
                <p className="text-xl font-sans font-bold text-accent">{scenario.amount}</p>
              </div>
              <p className="mt-3 border-t border-navy-100 pt-3 text-xs font-body text-navy-500">{scenario.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-navy-100 pt-5">
          <div>
            <p className="text-lg font-sans font-bold text-navy-900">48</p>
            <p className="text-[10px] font-body uppercase tracking-wide text-navy-400">States</p>
          </div>
          <div>
            <p className="text-lg font-sans font-bold text-navy-900">12+</p>
            <p className="text-[10px] font-body uppercase tracking-wide text-navy-400">Programs</p>
          </div>
          <div>
            <p className="text-lg font-sans font-bold text-navy-900">24h</p>
            <p className="text-[10px] font-body uppercase tracking-wide text-navy-400">Terms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
