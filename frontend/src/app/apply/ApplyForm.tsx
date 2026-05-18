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
  smsConsent: boolean;
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
  smsConsent: false,
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

// Warm-variant primitives. Defined locally so we don't disturb global .input/.btn-primary
// classes (those stay strict navy/accent for the rest of the site).
const warmInput =
  'w-full rounded-soft border border-gold-line/70 bg-white px-4 py-3 text-sm text-warm-ink ' +
  'placeholder:text-warm-ink/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition';

const warmBtnPrimary =
  'inline-flex items-center justify-center rounded-soft bg-warm-ink px-7 py-3 text-sm font-sans ' +
  'font-semibold uppercase tracking-caps text-warm-bg transition hover:bg-warm-ink/90 ' +
  'focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-40 disabled:cursor-not-allowed';

const warmBtnGhost =
  'inline-flex items-center text-sm font-body text-warm-ink/60 hover:text-warm-ink transition disabled:opacity-40';

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

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) => setData((d) => ({ ...d, [k]: v }));

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
      consent: {
        // TCPA-compliant SMS opt-in. Required for A2P 10DLC. Unchecked = no SMS
        // (we can still call/email — SMS consent is separate from contact request).
        sms: data.smsConsent,
        // Client-side timestamp is suggestive only; the server stamps the real
        // value when writing to contacts. This is here purely for audit visibility.
        sms_consented_at_client: data.smsConsent ? new Date().toISOString() : null,
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
    const scoreLabel =
      result.score === 'green' ? 'Strong fit' :
      result.score === 'yellow' ? 'Workable — more info needed' :
      'Under review';
    const dot =
      result.score === 'green' ? 'bg-ok' :
      result.score === 'yellow' ? 'bg-gold' :
      'bg-warm-ink/40';

    return (
      <div className="bg-white rounded-soft border border-gold-line/60 shadow-whisper">
        <div className="px-8 md:px-14 pt-12 pb-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gold-soft border border-gold-line flex items-center justify-center">
            <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-6 text-xs font-sans font-semibold uppercase tracking-wide2 text-gold">Received</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-sans font-bold text-warm-ink">Got it, {data.firstName}.</h2>
          <p className="mt-4 text-warm-ink/70 font-body leading-relaxed max-w-md mx-auto">
            Your deal is in. A founder-led team member will call within <strong className="text-warm-ink">2 business hours</strong>.
          </p>

          <div className="mt-8 rounded-soft border border-gold-line/70 bg-gold-soft/40 p-5 text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
              <p className="text-xs font-sans font-bold uppercase tracking-wide1 text-warm-ink">{scoreLabel}</p>
              {typeof result.dscr === 'number' && (
                <span className="ml-auto text-sm font-sans font-semibold tabular-nums text-warm-ink">DSCR {result.dscr.toFixed(2)}</span>
              )}
            </div>
            {result.narrative && <p className="text-sm font-body leading-relaxed text-warm-ink/80">{result.narrative}</p>}
            {result.next_steps && <p className="mt-3 text-sm font-body leading-relaxed text-warm-ink/70"><strong className="text-warm-ink">Next:</strong> {result.next_steps}</p>}
          </div>

          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <a href="tel:+19179939194" className={warmBtnPrimary}>Call now (917) 993-9194</a>
            <Link href="/dscr-playbook-2026" className="inline-flex items-center justify-center rounded-soft border border-warm-ink/20 px-7 py-3 text-sm font-sans font-semibold uppercase tracking-caps text-warm-ink transition hover:border-warm-ink">Read the Playbook</Link>
          </div>
        </div>
      </div>
    );
  }

  const steps: { n: number; label: string }[] = [
    { n: 1, label: 'Deal' },
    { n: 2, label: 'Sponsor' },
    { n: 3, label: 'Contact' },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-soft border border-gold-line/60 shadow-whisper overflow-hidden">
      {/* Editorial step header — serif-feel numerals + hairline rule */}
      <div className="px-6 md:px-12 pt-8 pb-6 border-b border-gold-line/50">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => {
            const active = step === s.n;
            const done = step > s.n;
            return (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-sans font-bold tabular-nums transition ${
                      active
                        ? 'bg-warm-ink text-warm-bg'
                        : done
                          ? 'bg-gold-soft text-warm-ink border border-gold-line'
                          : 'bg-transparent text-warm-ink/40 border border-warm-ink/15'
                    }`}
                  >
                    {done ? '✓' : String(s.n).padStart(2, '0')}
                  </span>
                  <span className={`text-xs font-sans font-semibold uppercase tracking-wide1 ${active ? 'text-warm-ink' : 'text-warm-ink/40'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 mx-4 h-px ${step > s.n ? 'bg-gold' : 'bg-warm-ink/10'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 md:p-12">
        {step === 1 && (
          <div className="space-y-7">
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wide2 text-gold">01 — The deal</p>
              <h2 className="mt-2 text-xl font-sans font-bold text-warm-ink">What are you looking to fund?</h2>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {PRODUCTS.map((p) => (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => update('product', p.value)}
                    className={`text-left p-4 rounded-soft border transition ${
                      data.product === p.value
                        ? 'border-gold bg-gold-soft/60'
                        : 'border-warm-ink/10 hover:border-warm-ink/30 bg-white'
                    }`}
                  >
                    <p className="text-sm font-sans font-semibold text-warm-ink">{p.label}</p>
                    <p className="text-xs text-warm-ink/60 font-body mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <FormField label="Property address" hint="Optional — zip + state is enough to start">
              <input type="text" value={data.propertyAddress} onChange={(e) => update('propertyAddress', e.target.value)} placeholder="123 Main St" className={warmInput} />
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="State" required>
                <select value={data.propertyState} onChange={(e) => update('propertyState', e.target.value)} className={warmInput} required>
                  <option value="">Select…</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="ZIP" hint="Optional">
                <input type="text" inputMode="numeric" value={data.propertyZip} onChange={(e) => update('propertyZip', e.target.value)} placeholder="77024" className={warmInput} />
              </FormField>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Purchase price or value" required>
                <input type="text" inputMode="numeric" value={data.propertyValue} onChange={(e) => update('propertyValue', e.target.value)} placeholder="$750,000" className={warmInput} required />
              </FormField>
              <FormField label="Loan amount needed" required>
                <input type="text" inputMode="numeric" value={data.loanAmount} onChange={(e) => update('loanAmount', e.target.value)} placeholder="$562,500" className={warmInput} required />
              </FormField>
            </div>

            {(data.product === 'dscr' || data.product === 'str') && (
              <FormField label="Expected monthly rent" hint={data.product === 'str' ? 'STR income — we normalize for occupancy' : 'Optional — estimate is fine'}>
                <input type="text" inputMode="numeric" value={data.monthlyRent} onChange={(e) => update('monthlyRent', e.target.value)} placeholder="$5,400" className={warmInput} />
              </FormField>
            )}
            {data.product === 'flip' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Rehab budget" hint="Optional">
                  <input type="text" inputMode="numeric" value={data.rehabBudget} onChange={(e) => update('rehabBudget', e.target.value)} placeholder="$75,000" className={warmInput} />
                </FormField>
                <FormField label="ARV (after-repair value)" hint="Optional">
                  <input type="text" inputMode="numeric" value={data.arv} onChange={(e) => update('arv', e.target.value)} placeholder="$950,000" className={warmInput} />
                </FormField>
              </div>
            )}
            {data.product === 'multifamily' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Units" hint="Optional">
                  <input type="text" inputMode="numeric" value={data.units} onChange={(e) => update('units', e.target.value)} placeholder="12" className={warmInput} />
                </FormField>
                <FormField label="Annual NOI" hint="Optional">
                  <input type="text" inputMode="numeric" value={data.noi} onChange={(e) => update('noi', e.target.value)} placeholder="$180,000" className={warmInput} />
                </FormField>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gold-line/40 mt-8 pt-6">
              <button type="button" disabled={!step1Valid} onClick={() => setStep(2)} className={warmBtnPrimary}>Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-7">
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wide2 text-gold">02 — The sponsor</p>
              <h2 className="mt-2 text-xl font-sans font-bold text-warm-ink">Tell us who&apos;s behind the deal.</h2>
              <p className="mt-1 text-sm text-warm-ink/60 font-body">We underwrite the project <em className="not-italic font-semibold text-warm-ink">and</em> the sponsor.</p>
            </div>

            <div>
              <label className="block text-sm font-sans font-semibold text-warm-ink mb-3">I&apos;m a…</label>
              <div className="grid grid-cols-2 gap-3">
                {(['investor', 'broker'] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => update('leadType', t)}
                    className={`p-4 rounded-soft border transition text-sm font-sans font-semibold ${
                      data.leadType === t
                        ? 'border-gold bg-gold-soft/60 text-warm-ink'
                        : 'border-warm-ink/10 text-warm-ink/70 hover:border-warm-ink/30 bg-white'
                    }`}
                  >
                    {t === 'investor' ? 'Investor / Sponsor' : 'Broker / LO'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="First name" required>
                <input type="text" value={data.firstName} onChange={(e) => update('firstName', e.target.value)} className={warmInput} required />
              </FormField>
              <FormField label="Last name" required>
                <input type="text" value={data.lastName} onChange={(e) => update('lastName', e.target.value)} className={warmInput} required />
              </FormField>
            </div>

            <FormField label={data.leadType === 'broker' ? 'Completed deals (your career)' : 'Completed deals (this strategy)'} required>
              <select value={data.experience} onChange={(e) => update('experience', e.target.value)} className={warmInput} required>
                <option value="">Select…</option>
                <option value="0">First deal</option>
                <option value="3">2–5 deals</option>
                <option value="10">6–20 deals</option>
                <option value="25">20+ deals</option>
              </select>
            </FormField>

            <FormField label="Credit range" required hint="Ballpark is fine — no hard pull yet">
              <select value={data.fico} onChange={(e) => update('fico', e.target.value)} className={warmInput} required>
                <option value="">Select…</option>
                <option value="760">740+</option>
                <option value="720">700–739</option>
                <option value="680">660–699</option>
                <option value="640">620–659</option>
                <option value="600">Below 620</option>
                <option value="720">Not sure</option>
              </select>
            </FormField>

            <div className="flex items-center justify-between pt-6 mt-8 border-t border-gold-line/40">
              <button type="button" onClick={() => setStep(1)} className={warmBtnGhost}>← Back</button>
              <button type="button" disabled={!step2Valid} onClick={() => setStep(3)} className={warmBtnPrimary}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-7">
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wide2 text-gold">03 — Best way to reach you</p>
              <h2 className="mt-2 text-xl font-sans font-bold text-warm-ink">We&apos;ll call within 2 business hours.</h2>
            </div>

            <FormField label="Email" required>
              <input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" className={warmInput} required />
            </FormField>

            <FormField label="Phone" required>
              <input type="tel" value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(555) 123-4567" className={warmInput} required />
            </FormField>

            <FormField label="Best time to call" hint="Optional">
              <select value={data.bestTime} onChange={(e) => update('bestTime', e.target.value)} className={warmInput}>
                <option>Anytime</option>
                <option>Morning (8am–12pm ET)</option>
                <option>Afternoon (12pm–5pm ET)</option>
                <option>Evening (5pm–8pm ET)</option>
              </select>
            </FormField>

            <FormField label="Anything else we should know?" hint="Optional — timeline, prior rejections, partner info">
              <textarea value={data.notes} onChange={(e) => update('notes', e.target.value)} rows={3} className={`${warmInput} resize-none`} />
            </FormField>

            {/* SMS opt-in. NOT a condition of submission — required by TCPA to be separate
                from the "submit to underwriting" action. A2P 10DLC carriers want a clear
                business name, message-type description, frequency, rates, STOP/HELP, and
                a privacy-policy reference all visible at point of opt-in. */}
            <div className="rounded-soft border border-gold-line/60 bg-gold-soft/30 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.smsConsent}
                  onChange={(e) => update('smsConsent', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-flat border-warm-ink/30 text-gold focus:ring-gold/40 accent-gold"
                />
                <span className="text-xs text-warm-ink/80 font-body leading-relaxed">
                  Yes, text me loan-file updates from <strong className="text-warm-ink">818 Capital</strong>.
                  Message frequency varies (typically 1–3/week during an active file).
                  Msg &amp; data rates may apply. Reply <strong>STOP</strong> to unsubscribe,
                  <strong> HELP</strong> for help. SMS consent is not a condition of any loan or service —
                  uncheck and we&apos;ll still call/email.
                  {' '}<Link href="/privacy" className="underline decoration-gold-line underline-offset-2 hover:text-warm-ink">Privacy</Link>.
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-soft border border-err/30 bg-err/5 px-4 py-3">
                <p className="text-sm text-err font-body">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 mt-8 border-t border-gold-line/40">
              <button type="button" onClick={() => setStep(2)} disabled={submitting} className={warmBtnGhost}>← Back</button>
              <button type="submit" disabled={!step3Valid || submitting} className={warmBtnPrimary}>
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
      <label className="block text-sm font-sans font-semibold text-warm-ink mb-2">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
        {hint && <span className="ml-2 text-xs font-normal text-warm-ink/50 font-body">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
