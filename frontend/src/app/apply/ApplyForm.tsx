'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Product = 'dscr' | 'flip' | 'str' | 'multifamily';

type FormData = {
  product: Product | '';
  propertyAddress: string;
  propertyState: string;
  propertyZip: string;
  propertyValue: string;
  loanAmount: string;
  monthlyRent: string;
  rehabBudget: string;
  arv: string;
  noi: string;
  units: string;
  firstName: string;
  lastName: string;
  experience: string;
  fico: string;
  email: string;
  phone: string;
  bestTime: string;
  notes: string;
  leadType: 'investor' | 'broker';
};

const INITIAL: FormData = {
  product: '',
  propertyAddress: '',
  propertyState: '',
  propertyZip: '',
  propertyValue: '',
  loanAmount: '',
  monthlyRent: '',
  rehabBudget: '',
  arv: '',
  noi: '',
  units: '',
  firstName: '',
  lastName: '',
  experience: '',
  fico: '',
  email: '',
  phone: '',
  bestTime: 'Anytime',
  notes: '',
  leadType: 'investor',
};

const PRODUCTS: { value: Product; label: string; desc: string }[] = [
  { value: 'dscr', label: 'DSCR / Rental', desc: 'Long-term rental. No tax returns.' },
  { value: 'flip', label: 'Fix & Flip', desc: 'Purchase + rehab bridge.' },
  { value: 'str', label: 'STR / Airbnb', desc: 'Short-term rental income.' },
  { value: 'multifamily', label: 'Multifamily', desc: '5+ units, mixed-use.' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

type TriageResponse = {
  triage?: {
    lane: string;
    score: 'green' | 'yellow' | 'red';
    dscr?: number;
    narrative?: string;
    next_steps?: string;
  };
  error?: string;
};

const numFromCurrency = (s: string) => Number(s.replace(/[^0-9.]/g, '')) || 0;

export default function ApplyForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TriageResponse['triage'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const product = searchParams.get('product');
    const productMap: Record<string, Product> = { dscr: 'dscr', flip: 'flip', 'fix-and-flip': 'flip', str: 'str', multifamily: 'multifamily' };
    if (product && productMap[product]) {
      setData((d) => ({ ...d, product: productMap[product] }));
    }
  }, [searchParams]);

  const update = (k: keyof FormData, v: string) => setData((d) => ({ ...d, [k]: v }));

  const step1Valid = data.product && data.propertyState && data.propertyValue && data.loanAmount;
  const step2Valid = data.firstName && data.lastName && data.experience && data.fico;
  const step3Valid = data.email && data.phone;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!step3Valid) return;
    setSubmitting(true);
    setError(null);

    const financials: Record<string, number | string> = {
      estimated_value: numFromCurrency(data.propertyValue),
      purchase_price: numFromCurrency(data.propertyValue),
      loan_amount: numFromCurrency(data.loanAmount),
      fico: Number(data.fico.replace(/[^0-9]/g, '')) || 720,
      experience: Number(data.experience) || 0,
    };
    if (data.product === 'dscr' || data.product === 'str') {
      if (data.monthlyRent) financials.monthly_rent = numFromCurrency(data.monthlyRent);
    }
    if (data.product === 'flip') {
      if (data.rehabBudget) financials.rehab_budget = numFromCurrency(data.rehabBudget);
      if (data.arv) financials.arv = numFromCurrency(data.arv);
    }
    if (data.product === 'multifamily') {
      if (data.noi) financials.noi = numFromCurrency(data.noi);
      if (data.units) financials.units = Number(data.units) || 0;
    }

    const payload = {
      person: {
        type: data.leadType,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
      },
      deal: {
        product_lane: data.product,
        lead_type: data.leadType,
        channel: 'apply_page',
        property_address: data.propertyAddress || undefined,
        property_state: data.propertyState || undefined,
        property_zip: data.propertyZip || undefined,
        financials,
      },
      meta: {
        best_time: data.bestTime,
        notes: data.notes || undefined,
      },
    };

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json: TriageResponse = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || `Submit failed: ${res.status}`);
      }
      setResult(json.triage || { lane: data.product, score: 'yellow', narrative: "Thanks — we've got your deal." });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please call (917) 993-9194.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const scoreColor =
      result.score === 'green' ? 'text-green-700 bg-green-50 border-green-200' :
      result.score === 'yellow' ? 'text-amber-700 bg-amber-50 border-amber-200' :
      'text-navy-700 bg-navy-50 border-navy-200';
    const scoreLabel =
      result.score === 'green' ? 'Strong fit' :
      result.score === 'yellow' ? 'Workable — more info needed' :
      'Under review';

    return (
      <div className="bg-white rounded-xl p-10 md:p-14 shadow-md border border-navy-100">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-sans font-bold text-navy-900 text-center">Got it, {data.firstName}.</h2>
        <p className="mt-4 text-navy-500 font-body leading-relaxed text-center max-w-md mx-auto">
          Your deal is in. A founder-led team member will call within <strong className="text-navy-900">2 business hours</strong>.
        </p>

        <div className={`mt-8 rounded-lg border p-5 ${scoreColor}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${result.score === 'green' ? 'bg-green-500' : result.score === 'yellow' ? 'bg-amber-500' : 'bg-navy-400'}`} />
            <p className="text-xs font-sans font-bold uppercase tracking-wider">{scoreLabel}</p>
            {typeof result.dscr === 'number' && (
              <span className="ml-auto text-sm font-sans font-semibold tabular-nums">DSCR {result.dscr.toFixed(2)}</span>
            )}
          </div>
          {result.narrative && <p className="text-sm font-body leading-relaxed">{result.narrative}</p>}
          {result.next_steps && <p className="mt-3 text-sm font-body leading-relaxed opacity-80"><strong>Next:</strong> {result.next_steps}</p>}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <a href="tel:+19179939194" className="btn-primary">Call now (917) 993-9194</a>
          <Link href="/dscr-playbook-2026" className="btn-secondary">Read the Playbook</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-navy-100 overflow-hidden">
      <div className="px-6 md:px-10 pt-6 pb-4 border-b border-navy-100">
        <div className="flex items-center gap-2 text-xs font-sans font-semibold text-navy-500 uppercase tracking-wider">
          <span className={step >= 1 ? 'text-accent' : ''}>Deal</span>
          <span className="text-navy-200">———</span>
          <span className={step >= 2 ? 'text-accent' : ''}>You</span>
          <span className="text-navy-200">———</span>
          <span className={step >= 3 ? 'text-accent' : ''}>Contact</span>
          <span className="ml-auto text-navy-400">Step {step} of 3</span>
        </div>
        <div className="mt-3 h-1 bg-navy-100 rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      <div className="p-6 md:p-10">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-sans font-semibold text-navy-900 mb-3">What are you looking to fund?</label>
              <div className="grid grid-cols-2 gap-3">
                {PRODUCTS.map((p) => (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => update('product', p.value)}
                    className={`text-left p-4 rounded-lg border-2 transition ${
                      data.product === p.value
                        ? 'border-accent bg-accent/5 shadow-sm'
                        : 'border-navy-100 hover:border-navy-300'
                    }`}
                  >
                    <p className="text-sm font-sans font-semibold text-navy-900">{p.label}</p>
                    <p className="text-xs text-navy-500 font-body mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <FormField label="Property address" hint="Optional — zip + state is enough to start">
              <input type="text" value={data.propertyAddress} onChange={(e) => update('propertyAddress', e.target.value)} placeholder="123 Main St" className="input" />
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="State" required>
                <select value={data.propertyState} onChange={(e) => update('propertyState', e.target.value)} className="input" required>
                  <option value="">Select…</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="ZIP" hint="Optional">
                <input type="text" inputMode="numeric" value={data.propertyZip} onChange={(e) => update('propertyZip', e.target.value)} placeholder="77024" className="input" />
              </FormField>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Purchase price or value" required>
                <input type="text" inputMode="numeric" value={data.propertyValue} onChange={(e) => update('propertyValue', e.target.value)} placeholder="$750,000" className="input" required />
              </FormField>
              <FormField label="Loan amount needed" required>
                <input type="text" inputMode="numeric" value={data.loanAmount} onChange={(e) => update('loanAmount', e.target.value)} placeholder="$562,500" className="input" required />
              </FormField>
            </div>

            {(data.product === 'dscr' || data.product === 'str') && (
              <FormField label="Expected monthly rent" hint={data.product === 'str' ? 'STR income — we normalize for occupancy' : 'Optional — estimate is fine'}>
                <input type="text" inputMode="numeric" value={data.monthlyRent} onChange={(e) => update('monthlyRent', e.target.value)} placeholder="$5,400" className="input" />
              </FormField>
            )}
            {data.product === 'flip' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Rehab budget" hint="Optional">
                  <input type="text" inputMode="numeric" value={data.rehabBudget} onChange={(e) => update('rehabBudget', e.target.value)} placeholder="$75,000" className="input" />
                </FormField>
                <FormField label="ARV (after-repair value)" hint="Optional">
                  <input type="text" inputMode="numeric" value={data.arv} onChange={(e) => update('arv', e.target.value)} placeholder="$950,000" className="input" />
                </FormField>
              </div>
            )}
            {data.product === 'multifamily' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Units" hint="Optional">
                  <input type="text" inputMode="numeric" value={data.units} onChange={(e) => update('units', e.target.value)} placeholder="12" className="input" />
                </FormField>
                <FormField label="Annual NOI" hint="Optional">
                  <input type="text" inputMode="numeric" value={data.noi} onChange={(e) => update('noi', e.target.value)} placeholder="$180,000" className="input" />
                </FormField>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="button" disabled={!step1Valid} onClick={() => setStep(2)} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-sans font-semibold text-navy-900 mb-3">I&apos;m a…</label>
              <div className="grid grid-cols-2 gap-3">
                {(['investor', 'broker'] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => update('leadType', t)}
                    className={`p-4 rounded-lg border-2 transition text-sm font-sans font-semibold ${
                      data.leadType === t ? 'border-accent bg-accent/5 text-navy-900' : 'border-navy-100 text-navy-700 hover:border-navy-300'
                    }`}
                  >
                    {t === 'investor' ? 'Investor / Sponsor' : 'Broker / LO'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="First name" required>
                <input type="text" value={data.firstName} onChange={(e) => update('firstName', e.target.value)} className="input" required />
              </FormField>
              <FormField label="Last name" required>
                <input type="text" value={data.lastName} onChange={(e) => update('lastName', e.target.value)} className="input" required />
              </FormField>
            </div>

            <FormField label={data.leadType === 'broker' ? 'Completed deals (your career)' : 'Completed deals (this strategy)'} required>
              <select value={data.experience} onChange={(e) => update('experience', e.target.value)} className="input" required>
                <option value="">Select…</option>
                <option value="0">First deal</option>
                <option value="3">2–5 deals</option>
                <option value="10">6–20 deals</option>
                <option value="25">20+ deals</option>
              </select>
            </FormField>

            <FormField label="Credit range" required hint="Ballpark is fine — no hard pull yet">
              <select value={data.fico} onChange={(e) => update('fico', e.target.value)} className="input" required>
                <option value="">Select…</option>
                <option value="760">740+</option>
                <option value="720">700–739</option>
                <option value="680">660–699</option>
                <option value="640">620–659</option>
                <option value="600">Below 620</option>
                <option value="720">Not sure</option>
              </select>
            </FormField>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-navy-500 font-body hover:text-navy-900">← Back</button>
              <button type="button" disabled={!step2Valid} onClick={() => setStep(3)} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <FormField label="Email" required>
              <input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" className="input" required />
            </FormField>

            <FormField label="Phone" required>
              <input type="tel" value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(555) 123-4567" className="input" required />
            </FormField>

            <FormField label="Best time to call" hint="Optional">
              <select value={data.bestTime} onChange={(e) => update('bestTime', e.target.value)} className="input">
                <option>Anytime</option>
                <option>Morning (8am–12pm ET)</option>
                <option>Afternoon (12pm–5pm ET)</option>
                <option>Evening (5pm–8pm ET)</option>
              </select>
            </FormField>

            <FormField label="Anything else we should know?" hint="Optional — timeline, prior rejections, partner info">
              <textarea value={data.notes} onChange={(e) => update('notes', e.target.value)} rows={3} className="input resize-none" />
            </FormField>

            {error && <p className="text-sm text-red-600 font-body">{error}</p>}

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(2)} disabled={submitting} className="text-sm text-navy-500 font-body hover:text-navy-900 disabled:opacity-40">← Back</button>
              <button type="submit" disabled={!step3Valid || submitting} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? 'Submitting…' : 'Send to underwriting →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-sans font-semibold text-navy-900 mb-2">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
        {hint && <span className="ml-2 text-xs font-normal text-navy-400 font-body">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
