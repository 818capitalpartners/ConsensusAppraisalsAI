'use client';

import { useState, FormEvent } from 'react';
import { submitDeal } from '@/lib/api';
import { trackFormSubmit } from '@/lib/tracking';

interface TriageResult {
  lane: string;
  score: string;
  dscr?: number;
  ltc?: number;
  narrative: string;
  lenders?: string[];
  next_steps?: string;
  profit_scenarios?: { profit100: number; profit95: number; profit90: number };
}

interface Props {
  lane: 'dscr' | 'flip' | 'str' | 'multifamily';
  children: React.ReactNode;
}

export default function DealForm({ lane, children }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const fd = new FormData(e.target as HTMLFormElement);
    const getStr = (k: string) => fd.get(k)?.toString() || '';

    const financials: Record<string, any> = {};
    fd.forEach((v, k) => {
      if (['first_name', 'last_name', 'email', 'phone', 'lead_type', 'property_address', 'property_city', 'property_state', 'property_zip', 'property_type', 'units', 'channel'].includes(k)) return;
      const num = Number(v);
      financials[k] = isNaN(num) || v === '' ? v.toString() : num;
    });

    const payload = {
      person: {
        type: getStr('lead_type') === 'broker' ? 'broker' : 'investor',
        first_name: getStr('first_name'),
        last_name: getStr('last_name'),
        email: getStr('email'),
        phone: getStr('phone') || undefined,
      },
      deal: {
        product_lane: lane,
        lead_type: getStr('lead_type') === 'broker' ? 'broker' : 'investor',
        channel: 'web',
        property_address: getStr('property_address') || undefined,
        property_city: getStr('property_city') || undefined,
        property_state: getStr('property_state') || undefined,
        property_zip: getStr('property_zip') || undefined,
        property_type: getStr('property_type') || undefined,
        units: Number(fd.get('units')) || undefined,
        financials,
      },
    };

    try {
      const data = await submitDeal(payload);
      trackFormSubmit(lane, Number(fd.get('loan_amount')) || 0);
      setResult(data.deal?.ai_triage_result || null);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result?.score === 'green' ? 'text-success' : result?.score === 'yellow' ? 'text-warning' : 'text-red-600';
  const scoreBg = result?.score === 'green' ? 'bg-green-50 border-green-200' : result?.score === 'yellow' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="bg-white rounded-lg border border-navy-100 shadow-sm p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contact */}
        <fieldset>
          <legend className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-3">Contact Information</legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input name="first_name" placeholder="First Name *" required className="input" />
            <input name="last_name" placeholder="Last Name *" required className="input" />
            <input name="email" type="email" placeholder="Email *" required className="input" />
            <input name="phone" placeholder="Phone" className="input" />
          </div>
        </fieldset>

        {/* Property */}
        <fieldset>
          <legend className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-3">Property Details</legend>
          <input name="property_address" placeholder="Property Address" className="input mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input name="property_city" placeholder="City" className="input" />
            <input name="property_state" placeholder="State" maxLength={2} className="input" />
            <input name="property_zip" placeholder="ZIP" className="input" />
          </div>
          <select name="property_type" className="input">
            <option value="">Property Type</option>
            <option value="Single-family">Single-family</option>
            <option value="2-unit">2-unit</option>
            <option value="3-4 unit">3-4 unit</option>
            <option value="5+ unit">5+ unit</option>
            <option value="Condo">Condo</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Mixed-use">Mixed-use</option>
          </select>
        </fieldset>

        {/* Lane-specific fields */}
        <fieldset>
          <legend className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-3">Deal Numbers</legend>
          {children}
        </fieldset>

        {/* Lead type */}
        <select name="lead_type" className="input">
          <option value="investor">I&apos;m an Investor</option>
          <option value="broker">I&apos;m a Broker / Loan Officer</option>
        </select>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing Your Deal...
            </span>
          ) : (
            'Get My Analysis'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700 font-body">{error}</p>
        </div>
      )}

      {result && (
        <div className={`mt-6 rounded-lg border p-6 ${scoreBg}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h4 text-navy-900">Deal Analysis</h3>
            <span className={`text-sm font-sans font-bold uppercase tracking-wide ${scoreColor}`}>
              {result.score} Light
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm font-body text-navy-700 mb-4">
            {result.dscr !== undefined && <span>DSCR: <strong className="font-sans">{result.dscr.toFixed(2)}</strong></span>}
            {result.ltc !== undefined && <span>LTC: <strong className="font-sans">{(result.ltc * 100).toFixed(1)}%</strong></span>}
          </div>

          {result.profit_scenarios && (
            <div className="text-sm font-body text-navy-600 mb-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-navy-400">@100% ARV</p>
                <p className="font-sans font-semibold">${result.profit_scenarios.profit100.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">@95% ARV</p>
                <p className="font-sans font-semibold">${result.profit_scenarios.profit95.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">@90% ARV</p>
                <p className="font-sans font-semibold">${result.profit_scenarios.profit90.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          )}

          <p className="text-sm font-body text-navy-700 leading-relaxed whitespace-pre-line">{result.narrative}</p>

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
      )}
    </div>
  );
}
