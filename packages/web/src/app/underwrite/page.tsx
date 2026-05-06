'use client';

import { FormEvent, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ConditionGrade = 'turnkey' | 'cosmetic' | 'moderate' | 'heavy' | 'gut';
type TargetUse = 'flip' | 'rental' | 'str' | 'hold';

interface ValueRange {
  low: number | null;
  mid: number | null;
  high: number | null;
}

interface RehabLineItem {
  category: string;
  scope: string;
  unit: string;
  quantity: number;
  totalLow: number;
  totalHigh: number;
  notes: string | null;
}

interface RehabEstimate {
  conditionGrade: ConditionGrade;
  squareFeet: number | null;
  costBasis: 'localized' | 'national_fallback';
  laborIndex: number;
  lineItems: RehabLineItem[];
  totalLow: number;
  totalMid: number;
  totalHigh: number;
  contingencyPct: number;
  confidenceScore: number;
  methodology: string[];
  assumptions: string[];
}

interface ApproachResult {
  kind: 'sales_comparison' | 'market_band' | 'income';
  label: string;
  range: ValueRange;
  confidence: number;
  weight: number;
  reasoning: string;
  available: boolean;
}

interface AdjustedComp {
  compId: string;
  address: string;
  city: string | null;
  zip: string | null;
  salePrice: number;
  saleDate: string;
  squareFeet: number | null;
  pricePerSqFt: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  yearBuilt: number | null;
  source: string | null;
  recencyMonths: number;
  locationMatch: 'zip' | 'city' | 'county';
  adjustments: { size: number; age: number; beds: number; baths: number; condition: number };
  adjustmentTotal: number;
  adjustedValue: number;
  similarityScore: number;
  weight: number;
  reasoning: string[];
}

interface QuickAppraisalResult {
  property: {
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    county: string | null;
    propertyType: string | null;
    squareFeet: number | null;
  };
  marketContext: {
    countyName: string | null;
    medianSalePrice: number | null;
    medianPricePerSqFt: number | null;
    medianDaysOnMarket: number | null;
    yearOverYearAppreciation: number | null;
    comparableSales: Array<{
      address: string;
      salePrice: number;
      saleDate: string;
      squareFeet: number | null;
      pricePerSqFt: number | null;
      source: string | null;
    }>;
    dataQuality: { score: number; compCount: number; flags: string[] };
  };
  valueEstimate: {
    asIs: ValueRange;
    stabilized: ValueRange | null;
    confidenceScore: number;
    methodology: string[];
  };
  approaches: ApproachResult[];
  selectedComps: AdjustedComp[];
  rehab: RehabEstimate | null;
  riskAssessment: {
    overallRisk: 'low' | 'moderate' | 'high';
    flags: Array<{ code: string; severity: string; message: string; mitigant: string | null }>;
  };
  narrative: {
    headline: string;
    analysis: string;
    strengths: string[];
    risks: string[];
    notesForBorrower: string[];
  };
  confidence: number;
  generatedAt: string;
}

const fmtMoney = (n: number | null | undefined) =>
  n == null
    ? 'N/A'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const RISK_COLORS: Record<string, string> = {
  low: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  moderate: 'bg-amber-50 border-amber-200 text-amber-700',
  high: 'bg-red-50 border-red-200 text-red-700',
};

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM',
  'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA',
  'WV', 'WI', 'WY',
];

export default function UnderwritePage() {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('FL');
  const [zip, setZip] = useState('');
  const [propertyType, setPropertyType] = useState('condo');
  const [squareFeet, setSquareFeet] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [condition, setCondition] = useState<ConditionGrade>('moderate');
  const [targetUse, setTargetUse] = useState<TargetUse>('flip');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickAppraisalResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/appraisals/quick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address.trim(),
          city: city.trim() || undefined,
          state,
          zip: zip.trim() || undefined,
          propertyType,
          squareFeet: squareFeet ? Number(squareFeet) : undefined,
          bedrooms: bedrooms ? Number(bedrooms) : undefined,
          bathrooms: bathrooms ? Number(bathrooms) : undefined,
          yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
          condition,
          targetUse,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors(Array.isArray(data.errors) && data.errors.length > 0 ? data.errors : [data.error || 'Underwrite failed']);
        return;
      }
      setResult(data.result);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Connection error']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Underwrite a deal</h1>
          <p className="mt-2 text-slate-400">
            Address in. ARV, comps, line-item rehab, and risk flags out — appraiser-style, in seconds.
          </p>
        </header>

        <form onSubmit={submit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7">
            <Input
              label="Property address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
              required
            />
          </div>
          <div className="md:col-span-3">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Miami Beach" />
          </div>
          <div className="md:col-span-1">
            <Select
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              options={STATES.map((s) => ({ value: s, label: s }))}
            />
          </div>
          <div className="md:col-span-1">
            <Input label="ZIP" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="33139" maxLength={5} />
          </div>

          <div className="md:col-span-3">
            <Select
              label="Property type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              options={[
                { value: 'condo', label: 'Condo' },
                { value: 'single_family', label: 'Single family' },
                { value: 'townhouse', label: 'Townhouse' },
                { value: 'multifamily', label: 'Multifamily (2-4)' },
                { value: 'multifamily_5plus', label: 'Multifamily (5+)' },
              ]}
            />
          </div>
          <div className="md:col-span-2">
            <Input label="Sq Ft" type="number" value={squareFeet} onChange={(e) => setSquareFeet(e.target.value)} placeholder="1500" />
          </div>
          <div className="md:col-span-2">
            <Input label="Beds" type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="3" />
          </div>
          <div className="md:col-span-2">
            <Input label="Baths" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="2" step="0.5" />
          </div>
          <div className="md:col-span-3">
            <Input label="Year built" type="number" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} placeholder="1985" />
          </div>

          <div className="md:col-span-6">
            <Select
              label="Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ConditionGrade)}
              options={[
                { value: 'turnkey', label: 'Turnkey — no work' },
                { value: 'cosmetic', label: 'Cosmetic — paint, flooring, light fixtures' },
                { value: 'moderate', label: 'Moderate — kitchen + baths + mech' },
                { value: 'heavy', label: 'Heavy — roof, siding, partial systems' },
                { value: 'gut', label: 'Gut — down to studs' },
              ]}
            />
          </div>
          <div className="md:col-span-6">
            <Select
              label="Target use"
              value={targetUse}
              onChange={(e) => setTargetUse(e.target.value as TargetUse)}
              options={[
                { value: 'flip', label: 'Fix & flip' },
                { value: 'rental', label: 'Long-term rental' },
                { value: 'str', label: 'Short-term rental' },
                { value: 'hold', label: 'Buy & hold' },
              ]}
            />
          </div>

          <div className="md:col-span-12 flex items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500">
              Powered by 818 Capital&rsquo;s appraisal engine. Lender-grade lineage on every datapoint.
            </p>
            <Button type="submit" size="lg" loading={loading} disabled={loading || !address.trim()}>
              {loading ? 'Underwriting…' : 'Underwrite'}
            </Button>
          </div>
        </form>

        {errors.length > 0 && (
          <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200">
            <p className="font-semibold mb-1">Underwrite failed</p>
            <ul className="text-sm list-disc list-inside space-y-0.5">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {result && <Results result={result} />}
      </div>
    </main>
  );
}

function Results({ result }: { result: QuickAppraisalResult }) {
  const v = result.valueEstimate;
  const market = result.marketContext;
  const rehab = result.rehab;
  const risk = result.riskAssessment;
  const approaches = result.approaches ?? [];
  const selectedComps = result.selectedComps ?? [];

  return (
    <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Valuation + Risk */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm uppercase tracking-wider text-slate-400">As-is value</h2>
            <span className="text-xs text-slate-500">Confidence {v.confidenceScore.toFixed(0)}%</span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-white">{fmtMoney(v.asIs.mid)}</span>
            <span className="text-slate-400 text-sm">
              {fmtMoney(v.asIs.low)} – {fmtMoney(v.asIs.high)}
            </span>
          </div>
          {v.stabilized && v.stabilized.mid != null && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm uppercase tracking-wider text-slate-400">Stabilized (ARV)</h3>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-emerald-300">{fmtMoney(v.stabilized.mid)}</span>
                <span className="text-slate-400 text-sm">
                  {fmtMoney(v.stabilized.low)} – {fmtMoney(v.stabilized.high)}
                </span>
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {v.methodology.slice(0, 4).map((m, i) => (
              <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">{m}</span>
            ))}
          </div>
        </div>

        {approaches.length > 0 && <ApproachesPanel approaches={approaches} />}

        {rehab && <RehabPanel rehab={rehab} />}

        <div className={`rounded-2xl border p-6 ${RISK_COLORS[risk.overallRisk] || RISK_COLORS.moderate}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider">{risk.overallRisk} risk</h2>
            <span className="text-xs">{risk.flags.length} flag{risk.flags.length !== 1 ? 's' : ''}</span>
          </div>
          {risk.flags.length === 0 ? (
            <p className="text-sm">No risk flags fired.</p>
          ) : (
            <ul className="space-y-2">
              {risk.flags.slice(0, 6).map((f) => (
                <li key={f.code} className="text-sm">
                  <span className="font-medium">{f.message}</span>
                  {f.mitigant && <p className="text-xs opacity-75 mt-0.5">Mitigant: {f.mitigant}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
          <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-2">Analysis</h2>
          <p className="text-white font-semibold mb-2">{result.narrative.headline}</p>
          <p className="text-slate-300 text-sm leading-relaxed">{result.narrative.analysis}</p>
          {result.narrative.notesForBorrower.length > 0 && (
            <ul className="mt-4 pt-4 border-t border-slate-800 space-y-1">
              {result.narrative.notesForBorrower.map((n, i) => (
                <li key={i} className="text-slate-400 text-sm">• {n}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right column: Market + Comps */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
          <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
            Market {market.countyName && `— ${market.countyName}`}
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500 text-xs">Median price</dt>
              <dd className="text-white font-semibold">{fmtMoney(market.medianSalePrice)}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs">$/sqft</dt>
              <dd className="text-white font-semibold">
                {market.medianPricePerSqFt != null ? `$${market.medianPricePerSqFt.toFixed(0)}` : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs">Median DOM</dt>
              <dd className="text-white font-semibold">{market.medianDaysOnMarket ?? 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs">YoY appreciation</dt>
              <dd className={`font-semibold ${market.yearOverYearAppreciation != null && market.yearOverYearAppreciation < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {market.yearOverYearAppreciation != null ? `${market.yearOverYearAppreciation > 0 ? '+' : ''}${market.yearOverYearAppreciation.toFixed(1)}%` : 'N/A'}
              </dd>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-800">
              <dt className="text-slate-500 text-xs">Data quality</dt>
              <dd className="text-white font-semibold">{market.dataQuality.score}/100 · {market.dataQuality.compCount} comps</dd>
            </div>
          </dl>
          {market.dataQuality.flags.length > 0 && (
            <ul className="mt-3 text-xs text-amber-300/80 space-y-0.5">
              {market.dataQuality.flags.map((f, i) => <li key={i}>• {f}</li>)}
            </ul>
          )}
        </div>

        <AdjustedCompsPanel comps={selectedComps} fallback={market.comparableSales} />
      </div>
    </section>
  );
}

function ApproachesPanel({ approaches }: { approaches: ApproachResult[] }) {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
      <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-3">Valuation methods</h2>
      <p className="text-xs text-slate-500 mb-4">
        Each method runs deterministically. Reconciled value above is a confidence-weighted blend.
      </p>
      <ul className="space-y-3">
        {approaches.map((a) => (
          <li
            key={a.kind}
            className={`rounded-lg border p-3 ${a.available ? 'border-slate-800 bg-slate-950/40' : 'border-slate-800/50 bg-slate-950/20 opacity-60'}`}
          >
            <div className="flex justify-between items-baseline gap-3">
              <span className="text-sm font-medium text-white">{a.label}</span>
              {a.available ? (
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {a.confidence.toFixed(0)}% conf · weight {(a.weight * 100).toFixed(0)}%
                </span>
              ) : (
                <span className="text-xs text-slate-500 whitespace-nowrap">unavailable</span>
              )}
            </div>
            {a.available && (
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold text-emerald-300">{fmtMoney(a.range.mid)}</span>
                <span className="text-xs text-slate-500">
                  {fmtMoney(a.range.low)} – {fmtMoney(a.range.high)}
                </span>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">{a.reasoning}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdjustedCompsPanel({
  comps,
  fallback,
}: {
  comps: AdjustedComp[];
  fallback: QuickAppraisalResult['marketContext']['comparableSales'];
}) {
  if (comps.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
          Comps ({fallback.length})
        </h2>
        {fallback.length === 0 ? (
          <p className="text-sm text-slate-500">No comps in range. Range widened, confidence reduced.</p>
        ) : (
          <ul className="space-y-3">
            {fallback.slice(0, 6).map((c, i) => (
              <li key={i} className="text-sm border-b border-slate-800 last:border-b-0 pb-2 last:pb-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-white truncate pr-2">{c.address}</span>
                  <span className="text-emerald-300 font-semibold whitespace-nowrap">{fmtMoney(c.salePrice)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-0.5">
                  <span>{c.saleDate}{c.squareFeet ? ` · ${c.squareFeet} sqft` : ''}{c.pricePerSqFt ? ` · $${c.pricePerSqFt.toFixed(0)}/sf` : ''}</span>
                  {c.source && <span>{c.source}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
      <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
        Adjusted comps ({comps.length})
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Ranked by similarity score. Each comp is adjusted for size, age, beds, baths, and condition before averaging.
      </p>
      <ul className="space-y-2">
        {comps.map((c) => (
          <details key={c.compId} className="bg-slate-950/40 rounded-lg border border-slate-800">
            <summary className="cursor-pointer px-3 py-2 list-none">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-sm text-white truncate pr-2">{c.address}</span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  sim {c.similarityScore}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-0.5">
                <span className="text-slate-500">
                  Sold {fmtMoney(c.salePrice)} on {c.saleDate}
                </span>
                <span className="text-emerald-300 font-medium whitespace-nowrap">
                  Adj → {fmtMoney(c.adjustedValue)}
                </span>
              </div>
            </summary>
            <div className="px-3 pb-3 text-xs text-slate-400 space-y-1.5 border-t border-slate-800 pt-2 mt-1">
              <div className="flex justify-between">
                <span>Match</span>
                <span className="text-slate-300">{c.locationMatch} · {c.recencyMonths.toFixed(1)}mo ago</span>
              </div>
              {c.squareFeet != null && (
                <div className="flex justify-between">
                  <span>Comp</span>
                  <span className="text-slate-300">
                    {c.squareFeet} sqft{c.bedrooms != null ? ` · ${c.bedrooms}bd` : ''}
                    {c.bathrooms != null ? `/${c.bathrooms.toFixed(1)}ba` : ''}
                    {c.yearBuilt != null ? ` · ${c.yearBuilt}` : ''}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Net adjustment</span>
                <span className={c.adjustmentTotal >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                  {c.adjustmentTotal >= 0 ? '+' : ''}{fmtMoney(c.adjustmentTotal)}
                </span>
              </div>
              {c.reasoning.length > 0 && (
                <ul className="pt-1 space-y-0.5">
                  {c.reasoning.map((r, i) => (
                    <li key={i} className="text-slate-500">• {r}</li>
                  ))}
                </ul>
              )}
              {c.source && <div className="text-slate-600 pt-1">Source: {c.source}</div>}
            </div>
          </details>
        ))}
      </ul>
    </div>
  );
}

function RehabPanel({ rehab }: { rehab: RehabEstimate }) {
  const grouped = rehab.lineItems.reduce<Record<string, RehabLineItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm uppercase tracking-wider text-slate-400">Rehab estimate</h2>
        <span className="text-xs text-slate-500">
          Confidence {rehab.confidenceScore.toFixed(0)}% ·{' '}
          {rehab.costBasis === 'localized' ? `${rehab.laborIndex.toFixed(2)}x labor` : 'national fallback'}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-white">{fmtMoney(rehab.totalMid)}</span>
        <span className="text-slate-400 text-sm">
          {fmtMoney(rehab.totalLow)} – {fmtMoney(rehab.totalHigh)}
        </span>
        <span className="text-xs text-slate-500 ml-auto">
          incl. {(rehab.contingencyPct * 100).toFixed(0)}% contingency
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {Object.entries(grouped).map(([category, items]) => (
          <details key={category} className="bg-slate-950/40 rounded-lg border border-slate-800">
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-200 flex justify-between items-center">
              <span className="capitalize">{category}</span>
              <span className="text-xs text-slate-400">
                {fmtMoney(items.reduce((s, i) => s + i.totalLow, 0))} – {fmtMoney(items.reduce((s, i) => s + i.totalHigh, 0))}
              </span>
            </summary>
            <ul className="px-3 pb-3 text-xs text-slate-400 space-y-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span>
                    {item.scope}
                    {item.quantity > 1 || item.unit !== 'lump' ? ` · ${item.quantity} ${item.unit}` : ''}
                    {item.notes && <span className="block text-slate-600">{item.notes}</span>}
                  </span>
                  <span className="whitespace-nowrap text-slate-300">
                    {fmtMoney(item.totalLow)} – {fmtMoney(item.totalHigh)}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      {rehab.assumptions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Assumptions</p>
          <ul className="text-xs text-slate-400 space-y-0.5">
            {rehab.assumptions.map((a, i) => <li key={i}>• {a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
