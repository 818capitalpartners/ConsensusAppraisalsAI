'use client';

import { useState } from 'react';
import Button from './Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AppraisalCardProps {
  dealId: string;
  lane: string;
}

interface ValueRange {
  low: number | null;
  mid: number | null;
  high: number | null;
}

interface RiskFlag {
  code: string;
  severity: string;
  message: string;
  requiresHumanReview: boolean;
  mitigant: string | null;
}

interface AppraisalResult {
  id: string;
  property: {
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    propertyType: string | null;
  };
  valueEstimate: {
    asIs: ValueRange;
    stabilized: ValueRange | null;
    confidenceScore: number;
    methodology: string[];
  };
  marketContext: {
    countyName: string | null;
    medianSalePrice: number | null;
    medianRent: number | null;
    medianDaysOnMarket: number | null;
    inventoryMonths: number | null;
    yearOverYearAppreciation: number | null;
    comparableSales: Array<{
      address: string;
      salePrice: number;
      saleDate: string;
      squareFeet: number | null;
      pricePerSqFt: number | null;
    }>;
    dataQuality: {
      score: number;
      compCount: number;
      flags: string[];
    };
  };
  riskAssessment: {
    overallRisk: string;
    flags: RiskFlag[];
    mitigants: string[];
  };
  narrative: {
    headline: string;
    analysis: string;
    strengths: string[];
    risks: string[];
    nextSteps: string[];
    notesForBorrower: string[];
    aiGenerated: boolean;
  };
  confidence: number;
}

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const RISK_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  low: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  moderate: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
};

const FLAG_SEVERITY: Record<string, { bg: string; text: string }> = {
  info: { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
  warning: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
  critical: { bg: 'bg-red-50 border-red-100', text: 'text-red-700' },
};

export default function AppraisalCard({ dealId, lane }: AppraisalCardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AppraisalResult | null>(null);
  const [error, setError] = useState('');

  const runAppraisal = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/appraisals/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, forceRefresh: false }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const errMsg = Array.isArray(data.errors) ? data.errors.join(', ') : data.error || 'Appraisal failed';
        throw new Error(errMsg);
      }
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  // Pre-appraisal: Show the trigger button
  if (!result && !loading && !error) {
    return (
      <div className="bg-gradient-to-br from-[#007ACC]/5 to-indigo-500/5 rounded-2xl p-6 border border-indigo-100 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007ACC]/10 to-indigo-500/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
        <h4 className="text-gray-900 font-bold text-lg mb-1 tracking-tight">AI Property Appraisal</h4>
        <p className="text-gray-500 text-sm mb-4 max-w-xs mx-auto">
          Get an AI-powered property valuation with market comps, risk analysis, and value ranges.
        </p>
        <Button onClick={runAppraisal} size="lg" className="w-full max-w-xs mx-auto">
          Run AI Appraisal
        </Button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#007ACC]/5 to-indigo-500/5 rounded-2xl p-8 border border-indigo-100 text-center">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-medium">Running AI Appraisal...</p>
        <p className="text-gray-500 text-sm mt-1">Analyzing market data, comps, and risk factors</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-center">
        <p className="text-red-600 font-medium mb-3">{error}</p>
        <Button onClick={runAppraisal} variant="secondary" size="sm">
          Retry Appraisal
        </Button>
      </div>
    );
  }

  if (!result) return null;

  // ─── Render full appraisal results ─────────────────
  const v = result.valueEstimate;
  const risk = result.riskAssessment;
  const market = result.marketContext;
  const riskColor = RISK_COLORS[risk.overallRisk] || RISK_COLORS.moderate;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Value Estimate Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#007ACC]/5 to-transparent rounded-bl-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#007ACC] to-indigo-500" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">AI Property Valuation</span>
            <span className="ml-auto text-xs text-gray-400">
              Confidence: {v.confidenceScore.toFixed(0)}%
            </span>
          </div>

          {/* As-Is Value */}
          {v.asIs.mid != null && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Estimated As-Is Value</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold gradient-text tracking-tight">
                  {fmtCurrency(v.asIs.mid)}
                </span>
              </div>
              <div className="flex gap-4 mt-1 text-sm text-gray-500">
                {v.asIs.low != null && <span>Low: {fmtCurrency(v.asIs.low)}</span>}
                {v.asIs.high != null && <span>High: {fmtCurrency(v.asIs.high)}</span>}
              </div>
            </div>
          )}

          {/* Stabilized Value (if present) */}
          {v.stabilized && v.stabilized.mid != null && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Stabilized Value</p>
              <span className="text-xl font-bold text-gray-900">{fmtCurrency(v.stabilized.mid)}</span>
              {v.stabilized.low != null && v.stabilized.high != null && (
                <span className="text-sm text-gray-500 ml-3">
                  ({fmtCurrency(v.stabilized.low)} &ndash; {fmtCurrency(v.stabilized.high)})
                </span>
              )}
            </div>
          )}

          {/* Methodology Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {v.methodology.map((m, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className={`rounded-2xl p-5 border ${riskColor.bg} ${riskColor.border}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${riskColor.dot}`} />
          <h4 className={`font-bold text-sm uppercase tracking-wider ${riskColor.text}`}>
            {risk.overallRisk} Risk
          </h4>
          <span className="ml-auto text-xs text-gray-500">
            {risk.flags.length} flag{risk.flags.length !== 1 ? 's' : ''}
          </span>
        </div>
        {risk.flags.length > 0 && (
          <div className="space-y-2">
            {risk.flags.slice(0, 5).map((f, i) => {
              const sev = FLAG_SEVERITY[f.severity] || FLAG_SEVERITY.info;
              return (
                <div key={i} className={`rounded-xl p-3 border text-sm ${sev.bg}`}>
                  <span className={`font-medium ${sev.text}`}>{f.message}</span>
                  {f.mitigant && (
                    <p className="text-gray-500 text-xs mt-1">Mitigant: {f.mitigant}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Market Context */}
      {market.medianSalePrice && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
            Market Data {market.countyName ? `\u2014 ${market.countyName}` : ''}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {market.medianSalePrice && (
              <div>
                <div className="text-xs text-gray-500">Median Price</div>
                <div className="text-lg font-bold text-gray-900">{fmtCurrency(market.medianSalePrice)}</div>
              </div>
            )}
            {market.medianRent && (
              <div>
                <div className="text-xs text-gray-500">Median Rent</div>
                <div className="text-lg font-bold text-gray-900">{fmtCurrency(market.medianRent)}/mo</div>
              </div>
            )}
            {market.medianDaysOnMarket && (
              <div>
                <div className="text-xs text-gray-500">Days on Market</div>
                <div className="text-lg font-bold text-gray-900">{market.medianDaysOnMarket}</div>
              </div>
            )}
            {market.inventoryMonths && (
              <div>
                <div className="text-xs text-gray-500">Inventory</div>
                <div className="text-lg font-bold text-gray-900">{market.inventoryMonths.toFixed(1)} mo</div>
              </div>
            )}
            {market.yearOverYearAppreciation != null && (
              <div>
                <div className="text-xs text-gray-500">YoY Appreciation</div>
                <div className={`text-lg font-bold ${market.yearOverYearAppreciation >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {market.yearOverYearAppreciation > 0 ? '+' : ''}{market.yearOverYearAppreciation.toFixed(1)}%
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-gray-500">Data Quality</div>
              <div className={`text-lg font-bold ${market.dataQuality.score >= 60 ? 'text-emerald-700' : market.dataQuality.score >= 30 ? 'text-amber-700' : 'text-red-700'}`}>
                {market.dataQuality.score}/100
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparable Sales */}
      {market.comparableSales.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
            {market.dataQuality.compCount} Comparable Sales
          </h4>
          <div className="space-y-2">
            {market.comparableSales.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50/50 rounded-xl p-3.5">
                <div>
                  <span className="text-sm text-gray-900 font-medium">{c.address || 'N/A'}</span>
                  {c.saleDate && <span className="text-xs text-gray-500 ml-2">{c.saleDate}</span>}
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{fmtCurrency(c.salePrice)}</span>
                  {c.pricePerSqFt && (
                    <span className="text-xs text-gray-500 ml-2">${c.pricePerSqFt.toFixed(0)}/sqft</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Narrative */}
      {result.narrative.analysis && (
        <div className="bg-gradient-to-br from-[#007ACC]/5 to-indigo-500/5 rounded-2xl p-5 border border-indigo-100">
          <h4 className="text-sm font-bold text-indigo-600 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            {result.narrative.aiGenerated ? 'AI Appraisal Narrative' : 'Appraisal Narrative'}
          </h4>
          <p className="text-gray-900 font-semibold mb-2">{result.narrative.headline}</p>
          <p className="text-gray-700 text-sm leading-relaxed">{result.narrative.analysis}</p>

          {/* Strengths */}
          {result.narrative.strengths.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">Strengths</p>
              <ul className="space-y-1">
                {result.narrative.strengths.map((s, i) => (
                  <li key={i} className="text-gray-600 text-sm flex gap-2">
                    <span className="text-emerald-400 mt-0.5 shrink-0">&bull;</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {result.narrative.risks.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Watch Points</p>
              <ul className="space-y-1">
                {result.narrative.risks.map((r, i) => (
                  <li key={i} className="text-gray-600 text-sm flex gap-2">
                    <span className="text-amber-400 mt-0.5 shrink-0">&bull;</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes for borrower */}
          {result.narrative.notesForBorrower.length > 0 && (
            <ul className="mt-3 pt-3 border-t border-indigo-100 space-y-1">
              {result.narrative.notesForBorrower.map((n, i) => (
                <li key={i} className="text-gray-600 text-sm flex gap-2">
                  <span className="text-indigo-400 mt-0.5 shrink-0">&bull;</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Next Steps */}
      {result.narrative.nextSteps.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            Recommended Next Steps
          </h4>
          <ol className="space-y-2">
            {result.narrative.nextSteps.map((step, i) => (
              <li key={i} className="text-gray-700 text-sm leading-relaxed flex gap-3">
                <span className="gradient-text font-bold shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
