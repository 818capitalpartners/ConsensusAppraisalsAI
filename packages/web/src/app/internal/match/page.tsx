'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface TriageMetrics {
  [key: string]: number | string;
}

interface MatchingLender {
  name: string;
  maxLtv?: number;
  minDscr?: number;
  minFico?: number;
  rateRange?: string;
  maxUnits?: number;
  notes?: string;
  keyContact?: string;
  contactEmail?: string;
  prepayOptions?: string;
}

interface Narrative {
  headline: string;
  analysis: string;
  strengths: string[];
  risks: string[];
  nextSteps: string[];
  aiGenerated: boolean;
}

interface TriageResult {
  success: boolean;
  dealScore: 'green' | 'yellow' | 'red' | null;
  triageResult: {
    lane: string;
    metrics: TriageMetrics;
    narrative?: Narrative | null;
    scenarios?: Array<{
      label: string;
      profit: number;
      roi: number;
      salePrice: number;
      closingCosts: number;
      holdingCosts: number;
    }>;
    matchingLenders: MatchingLender[];
    lenderCount: number;
  };
  matchingLenders?: MatchingLender[];
}

const SCORE_COLORS = {
  green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  yellow: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  red: 'bg-red-500/20 text-red-400 border-red-500/50',
};

const SCORE_LABELS = {
  green: '🟢 STRONG DEAL — Route immediately',
  yellow: '🟡 WORKABLE — Needs review / conditions',
  red: '🔴 TOUGH FIT — May need restructuring',
};

export default function LenderMatchPage() {
  const [lane, setLane] = useState('dscr');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    // Contact (minimal — just for tracking)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Property
    propertyState: '',
    propertyCity: '',
    propertyType: 'SFR',
    units: '1',
    // DSCR fields
    purchasePrice: '',
    monthlyRent: '',
    estimatedFico: '700',
    loanAmount: '',
    // Flip fields
    rehabBudget: '',
    arv: '',
    timelineMonths: '6',
    // STR fields
    monthlyRevenue: '',
    occupancyRate: '70',
    managementFeePercent: '25',
    // Multifamily
    grossRent: '',
    operatingExpenseRatio: '45',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Build financials based on lane
    const financials: Record<string, unknown> = {
      purchasePrice: Number(formData.purchasePrice) || 0,
    };

    if (lane === 'dscr') {
      financials.monthlyRent = Number(formData.monthlyRent) || 0;
      financials.estimatedFico = Number(formData.estimatedFico) || 700;
      financials.loanAmount = Number(formData.loanAmount) || 0;
    } else if (lane === 'flip') {
      financials.rehabBudget = Number(formData.rehabBudget) || 0;
      financials.arv = Number(formData.arv) || 0;
      financials.timelineMonths = Number(formData.timelineMonths) || 6;
    } else if (lane === 'str') {
      financials.monthlyRevenue = Number(formData.monthlyRevenue) || 0;
      financials.occupancyRate = Number(formData.occupancyRate) || 70;
      financials.managementFeePercent = Number(formData.managementFeePercent) || 25;
    } else if (lane === 'multifamily') {
      financials.grossRent = Number(formData.grossRent) || 0;
      financials.operatingExpenseRatio = Number(formData.operatingExpenseRatio) || 45;
    }

    try {
      const res = await fetch(`${API_URL}/api/deals/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productLane: lane,
          property: {
            state: formData.propertyState,
            city: formData.propertyCity,
            type: formData.propertyType,
            units: Number(formData.units) || 1,
          },
          financials,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');

      // Normalize response — merge top-level matchingLenders into triageResult
      const lenders = (data.matchingLenders || []).map((l: Record<string, unknown>) => ({
        name: l.name,
        maxLtv: l.maxLtv,
        minDscr: l.minDscr,
        minFico: l.minFico,
        rateRange: l.rateRange,
        maxUnits: l.maxUnits,
        notes: l.notes,
        keyContact: l.keyContact,
        contactEmail: l.contactEmail,
        prepayOptions: l.prepayOptions,
      }));
      const normalized: TriageResult = {
        success: data.success,
        dealScore: data.dealScore,
        triageResult: {
          ...data.triageResult,
          matchingLenders: lenders,
          lenderCount: lenders.length,
        },
      };
      setResult(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number | string) => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">8</div>
            <h1 className="text-2xl font-bold text-white">Lender Match — Deal Router</h1>
          </div>
          <p className="text-slate-400">Punch in deal numbers from an email or text → see which lenders fit instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lane Selector */}
            <div className="flex gap-2">
              {['dscr', 'flip', 'str', 'multifamily'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLane(l)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    lane === l
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {l === 'str' ? 'STR' : l === 'multifamily' ? 'Multifamily' : l === 'flip' ? 'Fix & Flip' : 'DSCR'}
                </button>
              ))}
            </div>

            {/* Contact (collapsible) */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">CONTACT (optional for internal)</h3>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="First Name" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                <input placeholder="Last Name" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                <input placeholder="Email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                <input placeholder="Phone" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            {/* Property */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">PROPERTY</h3>
              <div className="grid grid-cols-2 gap-3">
                <select value={formData.propertyType} onChange={(e) => updateField('propertyType', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none">
                  <option value="SFR">SFR</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhome">Townhome</option>
                  <option value="2-4 Unit">2-4 Unit</option>
                  <option value="5+ Multifamily">5+ Multifamily</option>
                  <option value="Mixed-Use">Mixed-Use</option>
                  <option value="Commercial">Commercial</option>
                </select>
                <input placeholder="Units" type="number" value={formData.units} onChange={(e) => updateField('units', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                <input placeholder="State (e.g. CA)" value={formData.propertyState} onChange={(e) => updateField('propertyState', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                <input placeholder="City" value={formData.propertyCity} onChange={(e) => updateField('propertyCity', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            {/* Lane-specific financials */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">
                {lane === 'dscr' ? 'DSCR NUMBERS' : lane === 'flip' ? 'FLIP NUMBERS' : lane === 'str' ? 'STR NUMBERS' : 'MULTIFAMILY NUMBERS'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Purchase Price" type="number" value={formData.purchasePrice} onChange={(e) => updateField('purchasePrice', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />

                {lane === 'dscr' && (
                  <>
                    <input placeholder="Monthly Rent" type="number" value={formData.monthlyRent} onChange={(e) => updateField('monthlyRent', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                    <input placeholder="Loan Amount" type="number" value={formData.loanAmount} onChange={(e) => updateField('loanAmount', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                    <input placeholder="Est. FICO" type="number" value={formData.estimatedFico} onChange={(e) => updateField('estimatedFico', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                  </>
                )}

                {lane === 'flip' && (
                  <>
                    <input placeholder="Rehab Budget" type="number" value={formData.rehabBudget} onChange={(e) => updateField('rehabBudget', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                    <input placeholder="ARV (After Repair Value)" type="number" value={formData.arv} onChange={(e) => updateField('arv', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                    <input placeholder="Timeline (months)" type="number" value={formData.timelineMonths} onChange={(e) => updateField('timelineMonths', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                  </>
                )}

                {lane === 'str' && (
                  <>
                    <input placeholder="Monthly Revenue (gross)" type="number" value={formData.monthlyRevenue} onChange={(e) => updateField('monthlyRevenue', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                    <input placeholder="Occupancy Rate %" type="number" value={formData.occupancyRate} onChange={(e) => updateField('occupancyRate', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                    <input placeholder="Mgmt Fee %" type="number" value={formData.managementFeePercent} onChange={(e) => updateField('managementFeePercent', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                  </>
                )}

                {lane === 'multifamily' && (
                  <>
                    <input placeholder="Gross Monthly Rent (all units)" type="number" value={formData.grossRent} onChange={(e) => updateField('grossRent', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                    <input placeholder="Op Expense Ratio %" type="number" value={formData.operatingExpenseRatio} onChange={(e) => updateField('operatingExpenseRatio', e.target.value)} className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:border-blue-500 focus:outline-none" />
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
            >
              {loading ? 'Matching...' : '⚡ Find Matching Lenders'}
            </button>
          </form>

          {/* RIGHT: Results */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                {error}
              </div>
            )}

            {result && result.triageResult && (
              <>
                {/* Deal Score Banner */}
                <div className={`rounded-xl p-5 border ${SCORE_COLORS[result.dealScore || 'red']}`}>
                  <div className="text-2xl font-bold mb-1">
                    {SCORE_LABELS[result.dealScore || 'red']}
                  </div>
                  <div className="text-sm opacity-75">
                    {result.triageResult.lenderCount} lender{result.triageResult.lenderCount !== 1 ? 's' : ''} matched
                  </div>
                </div>

                {/* AI Narrative */}
                {result.triageResult.narrative && (
                  <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-400">AI DEAL ANALYSIS</h3>
                      {result.triageResult.narrative.aiGenerated && (
                        <span className="text-xs text-purple-400 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500" /> GPT-4o
                        </span>
                      )}
                    </div>
                    <p className="text-white font-semibold text-lg">{result.triageResult.narrative.headline}</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.triageResult.narrative.analysis}</p>

                    {result.triageResult.narrative.strengths.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-400 mb-2">✅ STRENGTHS</h4>
                        <ul className="space-y-1">
                          {result.triageResult.narrative.strengths.map((s, i) => (
                            <li key={i} className="text-slate-300 text-sm flex gap-2">
                              <span className="text-emerald-500 shrink-0">•</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.triageResult.narrative.risks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-amber-400 mb-2">⚠️ RISKS</h4>
                        <ul className="space-y-1">
                          {result.triageResult.narrative.risks.map((r, i) => (
                            <li key={i} className="text-slate-300 text-sm flex gap-2">
                              <span className="text-amber-500 shrink-0">•</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.triageResult.narrative.nextSteps.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-blue-400 mb-2">🎯 NEXT STEPS</h4>
                        <ol className="space-y-1">
                          {result.triageResult.narrative.nextSteps.map((step, i) => (
                            <li key={i} className="text-slate-300 text-sm flex gap-2">
                              <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span> {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {/* Key Metrics */}
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">KEY METRICS</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(result.triageResult.metrics).map(([key, val]) => (
                      <div key={key}>
                        <div className="text-xs text-slate-500 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div className="text-lg font-semibold text-white">
                          {typeof val === 'number'
                            ? key.toLowerCase().includes('price') || key.toLowerCase().includes('loan') || key.toLowerCase().includes('piti') || key.toLowerCase().includes('rent') || key.toLowerCase().includes('income') || key.toLowerCase().includes('noi') || key.toLowerCase().includes('expense') || key.toLowerCase().includes('fee') || key.toLowerCase().includes('cost')
                              ? formatCurrency(val)
                              : key.toLowerCase().includes('ltv') || key.toLowerCase().includes('ltc') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('roi') || key.toLowerCase().includes('ratio')
                                ? `${val}%`
                                : key.toLowerCase().includes('dscr')
                                  ? `${val}x`
                                  : val.toLocaleString()
                            : val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flip Scenarios */}
                {result.triageResult.scenarios && (
                  <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3">PROFIT SCENARIOS</h3>
                    <div className="space-y-3">
                      {result.triageResult.scenarios.map((s, i) => (
                        <div key={i} className={`flex items-center justify-between rounded-lg p-3 ${s.profit > 30000 ? 'bg-emerald-500/10 border border-emerald-500/30' : s.profit > 10000 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                          <div>
                            <div className="text-sm font-semibold text-white">{s.label}</div>
                            <div className="text-xs text-slate-400">Sale: {formatCurrency(s.salePrice)} | Costs: {formatCurrency(s.closingCosts + s.holdingCosts)}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${s.profit > 30000 ? 'text-emerald-400' : s.profit > 10000 ? 'text-amber-400' : 'text-red-400'}`}>
                              {formatCurrency(s.profit)}
                            </div>
                            <div className="text-xs text-slate-400">{s.roi}% ROI</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Lenders */}
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">
                    MATCHING LENDERS ({result.triageResult.lenderCount})
                  </h3>
                  {result.triageResult.matchingLenders.length === 0 ? (
                    <div className="text-slate-500 text-sm">No lenders matched. Try adjusting the deal parameters.</div>
                  ) : (
                    <div className="space-y-3">
                      {result.triageResult.matchingLenders.map((lender, i) => (
                        <div key={i} className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700/50 transition-colors border border-slate-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-white text-base">{lender.name}</div>
                            <div className="text-sm text-blue-400 font-medium">{lender.rateRange || '—'}</div>
                          </div>
                          <div className="text-xs text-slate-400 mb-2">
                            {[
                              lender.maxLtv && `Max LTV: ${lender.maxLtv}%`,
                              lender.minDscr && `Min DSCR: ${lender.minDscr}x`,
                              lender.minFico && `Min FICO: ${lender.minFico}`,
                              lender.maxUnits && `Max Units: ${lender.maxUnits}`,
                              lender.prepayOptions && `Prepay: ${lender.prepayOptions}`,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </div>
                          {(lender.keyContact || lender.contactEmail) && (
                            <div className="text-xs text-sky-400">
                              {lender.keyContact && <span>📞 {lender.keyContact}</span>}
                              {lender.contactEmail && <span className="ml-3">✉️ {lender.contactEmail}</span>}
                            </div>
                          )}
                          {lender.notes && (
                            <div className="text-xs text-slate-500 mt-1 truncate" title={lender.notes}>
                              💡 {lender.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {!result && !error && (
              <div className="bg-slate-900/50 rounded-xl p-12 border border-slate-800/50 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <div className="text-slate-400 text-lg">Enter deal numbers and hit match</div>
                <div className="text-slate-500 text-sm mt-2">Results show instantly — no page reload</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
