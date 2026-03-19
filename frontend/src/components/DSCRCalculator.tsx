'use client';

import { useState } from 'react';
import { submitDeal } from '@/lib/api';
import { trackFormSubmit } from '@/lib/tracking';

type Step = 'calculator' | 'capture' | 'result';

export default function DSCRCalculator() {
  const [step, setStep] = useState<Step>('calculator');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculator values
  const [propertyValue, setPropertyValue] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [rate, setRate] = useState('8.0');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [annualTaxes, setAnnualTaxes] = useState('');
  const [annualInsurance, setAnnualInsurance] = useState('');
  const [monthlyHOA, setMonthlyHOA] = useState('');

  // Calculated values
  const loan = Number(loanAmount) || 0;
  const monthlyRate = (Number(rate) / 100) / 12;
  const n = 30 * 12;
  const pi = loan > 0 && monthlyRate > 0
    ? (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
    : 0;
  const monthlyTaxes = (Number(annualTaxes) || 0) / 12;
  const monthlyInsurance = (Number(annualInsurance) || 0) / 12;
  const hoa = Number(monthlyHOA) || 0;
  const piti = pi + monthlyTaxes + monthlyInsurance + hoa;
  const rent = Number(monthlyRent) || 0;
  const dscr = piti > 0 ? rent / piti : 0;
  const ltv = Number(propertyValue) > 0 ? (loan / Number(propertyValue)) * 100 : 0;
  const cashFlow = rent - piti;

  const dscrColor = dscr >= 1.25 ? 'text-success' : dscr >= 1.0 ? 'text-amber-600' : 'text-red-600';
  const dscrLabel = dscr >= 1.25 ? 'Strong' : dscr >= 1.0 ? 'Passing' : 'Below Threshold';
  const hasNumbers = rent > 0 && piti > 0;

  async function handleCapture(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.target as HTMLFormElement);

    const payload = {
      person: {
        type: 'investor',
        first_name: fd.get('first_name')?.toString() || '',
        last_name: fd.get('last_name')?.toString() || '',
        email: fd.get('email')?.toString() || '',
        phone: fd.get('phone')?.toString() || undefined,
      },
      deal: {
        product_lane: 'dscr' as const,
        lead_type: 'investor',
        channel: 'calculator',
        financials: {
          monthly_rent: rent,
          piti: piti,
          loan_amount: loan,
          estimated_value: Number(propertyValue) || 0,
          fico_band: fd.get('fico_band')?.toString() || '',
          interest_rate: Number(rate),
          investment_markets: fd.get('markets')?.toString() || '',
          sms_opt_in: fd.get('sms_opt_in') === 'on',
          email_opt_in: fd.get('email_opt_in') === 'on',
        },
      },
    };

    try {
      const data = await submitDeal(payload);
      trackFormSubmit('dscr_calculator', loan);
      setResult(data.deal?.ai_triage_result || { dscr: dscr, score: dscr >= 1.25 ? 'green' : dscr >= 1.0 ? 'yellow' : 'red' });
      setStep('result');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-navy-100 shadow-sm overflow-hidden">
      {/* Step indicators - friendly, non-threatening */}
      <div className="bg-navy-50 px-6 py-4 flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-widest">
        <span className={step === 'calculator' ? 'text-accent' : step !== 'calculator' ? 'text-success' : 'text-navy-400'}>
          {step !== 'calculator' ? '✓ ' : ''}Calculate
        </span>
        <span className="text-navy-300">→</span>
        <span className={step === 'capture' ? 'text-accent' : step === 'result' ? 'text-success' : 'text-navy-400'}>
          {step === 'result' ? '✓ ' : ''}Unlock Report
        </span>
        <span className="text-navy-300">→</span>
        <span className={step === 'result' ? 'text-accent' : 'text-navy-400'}>Your Analysis</span>
      </div>

      <div className="p-8">
        {/* ── Step 1: Calculator ──────────────────────────── */}
        {step === 'calculator' && (
          <>
            <h3 className="text-h3 text-navy-900 mb-6">DSCR Calculator</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-sans font-semibold text-navy-500 uppercase tracking-wide mb-1">Property Value</label>
                <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)} placeholder="$350,000" className="input" />
              </div>
              <div>
                <label className="block text-xs font-sans font-semibold text-navy-500 uppercase tracking-wide mb-1">Loan Amount</label>
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="$262,500" className="input" />
              </div>
              <div>
                <label className="block text-xs font-sans font-semibold text-navy-500 uppercase tracking-wide mb-1">Interest Rate (%)</label>
                <input type="number" step="0.125" value={rate} onChange={(e) => setRate(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-xs font-sans font-semibold text-navy-500 uppercase tracking-wide mb-1">Monthly Rent</label>
                <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="$2,800" className="input" />
              </div>
              <div>
                <label className="block text-xs font-sans font-semibold text-navy-500 uppercase tracking-wide mb-1">Annual Taxes</label>
                <input type="number" value={annualTaxes} onChange={(e) => setAnnualTaxes(e.target.value)} placeholder="$4,200" className="input" />
              </div>
              <div>
                <label className="block text-xs font-sans font-semibold text-navy-500 uppercase tracking-wide mb-1">Annual Insurance</label>
                <input type="number" value={annualInsurance} onChange={(e) => setAnnualInsurance(e.target.value)} placeholder="$1,800" className="input" />
              </div>
              <div>
                <label className="block text-xs font-sans font-semibold text-navy-500 uppercase tracking-wide mb-1">Monthly HOA</label>
                <input type="number" value={monthlyHOA} onChange={(e) => setMonthlyHOA(e.target.value)} placeholder="$0" className="input" />
              </div>
            </div>

            {/* Live results */}
            {hasNumbers && (
              <div className="mt-8 rounded-lg bg-navy-50 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-navy-400 font-body">Monthly P&amp;I</p>
                    <p className="text-lg font-sans font-bold text-navy-900">${pi.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 font-body">Total PITI</p>
                    <p className="text-lg font-sans font-bold text-navy-900">${piti.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 font-body">DSCR</p>
                    <p className={`text-2xl font-sans font-bold ${dscrColor}`}>{dscr.toFixed(2)}</p>
                    <p className={`text-xs font-sans font-semibold ${dscrColor}`}>{dscrLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 font-body">Monthly Cash Flow</p>
                    <p className={`text-lg font-sans font-bold ${cashFlow >= 0 ? 'text-success' : 'text-red-600'}`}>
                      ${cashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                {ltv > 0 && (
                  <p className="mt-3 text-xs text-navy-500 font-body">LTV: {ltv.toFixed(1)}%</p>
                )}
              </div>
            )}

            <button
              onClick={() => setStep('capture')}
              disabled={!hasNumbers}
              className="btn-primary w-full mt-6 py-4"
            >
              {hasNumbers ? 'See Which Programs Match Your Deal →' : 'Enter Your Numbers to Get Started'}
            </button>
            {hasNumbers && (
              <p className="text-xs text-navy-400 font-body text-center mt-3">
                Free. Takes 30 seconds. No commitment.
              </p>
            )}
          </>
        )}

        {/* ── Step 2: Lead capture ───────────────────────── */}
        {step === 'capture' && (
          <>
            <button onClick={() => setStep('calculator')} className="text-sm text-accent font-sans font-medium mb-4 hover:underline">
              ← Back to Calculator
            </button>

            <div className="rounded-lg bg-navy-50 p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-700 font-body">Your DSCR</span>
                <span className={`text-xl font-sans font-bold ${dscrColor}`}>{dscr.toFixed(2)}</span>
              </div>
            </div>

            <h3 className="text-h3 text-navy-900 mb-2">Your Analysis Is Ready</h3>
            <p className="text-sm text-navy-500 font-body mb-6">
              We&apos;ll match your deal to the right programs and send you a scenario-based pre-approval — just need to know where to send it.
            </p>

            <form onSubmit={handleCapture} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input name="first_name" placeholder="First Name *" required className="input" />
                <input name="last_name" placeholder="Last Name *" required className="input" />
              </div>
              <input name="email" type="email" placeholder="Email *" required className="input" />
              <input name="phone" type="tel" placeholder="Phone Number *" required className="input" />

              <select name="markets" className="input">
                <option value="">Investment Markets of Interest</option>
                <option value="NYC Metro">NYC Metro</option>
                <option value="South Florida">South Florida (Miami / Fort Lauderdale)</option>
                <option value="Dallas-Fort Worth">Dallas-Fort Worth</option>
                <option value="Houston">Houston</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Atlanta">Atlanta</option>
                <option value="Nashville">Nashville</option>
                <option value="Austin">Austin</option>
                <option value="Phoenix">Phoenix</option>
                <option value="Charlotte">Charlotte</option>
                <option value="Multiple Markets">Multiple Markets</option>
                <option value="Nationwide">Nationwide</option>
              </select>

              <select name="fico_band" className="input">
                <option value="">FICO Score Range</option>
                <option value="740+">740+</option>
                <option value="700-739">700-739</option>
                <option value="660-699">660-699</option>
                <option value="620-659">620-659</option>
                <option value="<620">Below 620</option>
              </select>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="sms_opt_in" className="mt-1 rounded border-navy-300" />
                  <span className="text-sm text-navy-600 font-body">
                    I agree to receive text messages from 818 Capital with deal updates and rate alerts. Msg &amp; data rates may apply. Reply STOP to unsubscribe.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="email_opt_in" defaultChecked className="mt-1 rounded border-navy-300" />
                  <span className="text-sm text-navy-600 font-body">
                    Send me rate updates, market insights, and investment opportunities via email.
                  </span>
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                {loading ? 'Building Your Report...' : 'Send Me My Analysis →'}
              </button>
              <p className="text-xs text-navy-400 font-body text-center mt-2">No credit check. No obligation. Just data.</p>
              {error && <p className="text-sm text-red-600 font-body">{error}</p>}
            </form>
          </>
        )}

        {/* ── Step 3: Results ────────────────────────────── */}
        {step === 'result' && result && (
          <>
            <div className="text-center mb-6">
              <svg className="w-12 h-12 text-success mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <h3 className="text-h3 text-navy-900 mt-3">Your Deal Analysis</h3>
            </div>

            <div className={`rounded-lg border p-6 ${
              result.score === 'green' ? 'bg-green-50 border-green-200' :
              result.score === 'yellow' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-sans font-semibold text-navy-700">Score</span>
                <span className={`text-lg font-sans font-bold uppercase ${
                  result.score === 'green' ? 'text-success' : result.score === 'yellow' ? 'text-amber-600' : 'text-red-600'
                }`}>{result.score} Light</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-navy-400 font-body">DSCR</p>
                  <p className="font-sans font-bold text-navy-900">{(result.dscr || dscr).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-400 font-body">LTV</p>
                  <p className="font-sans font-bold text-navy-900">{ltv.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-navy-400 font-body">Cash Flow</p>
                  <p className={`font-sans font-bold ${cashFlow >= 0 ? 'text-success' : 'text-red-600'}`}>${cashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p>
                </div>
              </div>

              {result.narrative && (
                <p className="text-sm text-navy-700 font-body leading-relaxed whitespace-pre-line">{result.narrative}</p>
              )}

              {result.lenders && result.lenders.length > 0 && (
                <div className="mt-4 pt-4 border-t border-navy-200/50">
                  <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-2">Available Programs</p>
                  <p className="text-sm font-body text-navy-600">{result.lenders.join('  •  ')}</p>
                </div>
              )}

              {result.next_steps && (
                <p className="mt-4 text-sm font-sans font-medium text-accent">{result.next_steps}</p>
              )}
            </div>

            <p className="mt-6 text-sm text-navy-500 font-body text-center">
              A member of our team will follow up within 24 hours with your scenario-based pre-approval and next steps.
            </p>

            <button onClick={() => { setStep('calculator'); setResult(null); }} className="btn-secondary w-full mt-4">
              Run Another Scenario
            </button>
          </>
        )}
      </div>
    </div>
  );
}
