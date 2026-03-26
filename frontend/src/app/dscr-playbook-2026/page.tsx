'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLAYBOOK_ITEMS = [
  { icon: 'checklist', text: '2026 DSCR qualification requirements across 12+ lenders' },
  { icon: 'chart', text: 'Rate comparison matrix: how rates vary by DSCR ratio, LTV, and credit score' },
  { icon: 'unlock', text: 'No-ratio and sub-1.0 DSCR programs — who offers them and when to use them' },
  { icon: 'home', text: 'STR income normalization: how Airbnb/VRBO revenue qualifies for DSCR' },
  { icon: 'stack', text: 'Portfolio scaling strategies: 5-10-20+ property programs' },
  { icon: 'shield', text: 'Entity structuring: LLC vs trust vs personal — impact on rate and terms' },
  { icon: 'exit', text: 'Exit strategy planning: when to refi, when to sell, when to hold' },
  { icon: 'deal', text: 'Real deal examples from 818 Capital\'s recent closings' },
];

const ICONS: Record<string, JSX.Element> = {
  checklist: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  chart: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  unlock: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>,
  home: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  stack: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  shield: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  exit: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  deal: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
};

const PROPERTY_OPTIONS = [
  { value: '', label: 'How many investment properties do you own?' },
  { value: '0', label: '0 — Looking to buy my first' },
  { value: '1-4', label: '1–4 properties' },
  { value: '5-10', label: '5–10 properties' },
  { value: '10+', label: '10+ properties' },
];

/* ── Visual: DSCR Gauge ────────────────────────── */
function DSCRGauge({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`relative w-20 h-20 mx-auto rounded-full border-4 ${color} flex items-center justify-center`}>
        <span className="text-lg font-sans font-bold text-navy-900">{value}</span>
      </div>
      <p className="mt-2 text-xs text-navy-500 font-body leading-tight">{label}</p>
    </div>
  );
}

/* ── Visual: Rate Bar ──────────────────────────── */
function RateBar({ label, rate, width, accent }: { label: string; rate: string; width: string; accent: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-sans font-semibold text-navy-700 w-16 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-navy-100 rounded-full h-7 relative overflow-hidden">
        <div
          className={`h-full rounded-full flex items-center justify-end pr-3 transition-all ${accent ? 'bg-accent' : 'bg-navy-300'}`}
          style={{ width }}
        >
          <span className="text-xs font-sans font-bold text-white">{rate}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Visual: Scaling Ladder ────────────────────── */
function ScalingStep({ step, count, label, desc }: { step: number; count: string; label: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-sans font-bold text-sm">
          {step}
        </div>
        {step < 4 && <div className="w-0.5 h-8 bg-accent/30" />}
      </div>
      <div className="pb-6">
        <p className="text-sm font-sans font-bold text-navy-900">{count} <span className="text-navy-500 font-normal">— {label}</span></p>
        <p className="text-xs text-navy-500 font-body mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function DSCRPlaybookPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', properties: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('https://hook.us2.make.com/placeholder-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'dscr_playbook_2026',
          timestamp: new Date().toISOString(),
        }),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const scrollToForm = () => {
    document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="bg-navy-900 py-20 md:py-28">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left: Copy */}
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">
                Free Download — 2026 Edition
              </p>
              <h1 className="text-h1 text-white">
                The 2026 DSCR Investor Playbook
              </h1>
              <p className="mt-5 text-lg text-navy-200 font-body font-light leading-relaxed max-w-2xl">
                DSCR requirements, rate comparisons, and deal structuring strategies — from a direct lender that closes in 14 days.
              </p>
              <button onClick={scrollToForm} className="btn-primary mt-8 inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Free Playbook
              </button>
              <div className="mt-6 flex items-center gap-6 text-navy-400 text-xs font-body">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  38-page PDF
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  12-min read
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  No spam, ever
                </span>
              </div>
            </div>

            {/* Right: Playbook mockup visual */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Stacked pages effect */}
                <div className="absolute -right-2 -bottom-2 w-full h-full bg-navy-700 rounded-xl" />
                <div className="absolute -right-1 -bottom-1 w-full h-full bg-navy-800 rounded-xl" />
                {/* Main playbook cover */}
                <div className="relative bg-white rounded-xl p-8 shadow-2xl">
                  <div className="border-2 border-navy-100 rounded-lg p-6">
                    <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-2">818 Capital Partners</p>
                    <h3 className="text-2xl font-sans font-bold text-navy-900 leading-tight">The 2026<br />DSCR Investor<br />Playbook</h3>
                    <div className="mt-4 h-px bg-navy-200" />
                    <p className="mt-4 text-xs text-navy-500 font-body">Requirements. Rates. Strategies.</p>
                    {/* Mini chart preview */}
                    <div className="mt-6 flex items-end gap-1.5 h-16">
                      {[40, 55, 35, 70, 50, 80, 65, 90, 75, 60].map((h, i) => (
                        <div key={i} className={`flex-1 rounded-t ${i === 9 ? 'bg-accent' : i >= 7 ? 'bg-accent/60' : 'bg-navy-200'}`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="bg-navy-50 rounded p-2 text-center">
                        <p className="text-xs font-sans font-bold text-navy-900">12+</p>
                        <p className="text-[10px] text-navy-400">Lenders</p>
                      </div>
                      <div className="bg-navy-50 rounded p-2 text-center">
                        <p className="text-xs font-sans font-bold text-navy-900">9</p>
                        <p className="text-[10px] text-navy-400">Chapters</p>
                      </div>
                      <div className="bg-navy-50 rounded p-2 text-center">
                        <p className="text-xs font-sans font-bold text-navy-900">4</p>
                        <p className="text-[10px] text-navy-400">Deal Studies</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What's Inside ──────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            What&apos;s Inside
          </p>
          <h2 className="section-heading">Everything You Need to Underwrite DSCR in 2026</h2>
          <p className="section-subheading mt-4 max-w-2xl">
            We analyzed rates, requirements, and programs from 12+ capital partners to build the most comprehensive DSCR reference guide for investors.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {PLAYBOOK_ITEMS.map((item) => (
              <div key={item.text} className="flex items-start gap-4 p-5 rounded-lg border border-navy-100 bg-navy-50/30 hover:border-accent/30 hover:bg-accent/5 transition">
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                  {ICONS[item.icon]}
                </div>
                <span className="text-sm text-navy-700 font-body leading-relaxed pt-1.5">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Infographic: DSCR Spectrum ─────────────────── */}
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-3">
              Visual Guide
            </p>
            <h2 className="text-h2 text-white">The DSCR Spectrum</h2>
            <p className="mt-3 text-navy-300 font-body max-w-2xl mx-auto">
              Where your deal falls on the DSCR spectrum determines your rate, LTV, and lender options.
            </p>
          </div>

          {/* DSCR Gauge Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <DSCRGauge value="N/A" label="No-Ratio — Credit + LTV only" color="border-navy-500" />
            <DSCRGauge value="0.75" label="Sub-1.0 — Higher down, fewer lenders" color="border-orange-400" />
            <DSCRGauge value="1.0" label="Break-even — Standard qualification" color="border-yellow-400" />
            <DSCRGauge value="1.25+" label="Sweet spot — Best rates & terms" color="border-green-400" />
          </div>

          {/* Rate spectrum bar */}
          <div className="mt-12 max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-navy-400 mb-4">
              Rate Impact by DSCR Ratio
            </p>
            <div className="bg-navy-800 rounded-xl p-6 space-y-3">
              <RateBar label="1.25+" rate="6.75%" width="60%" accent={true} />
              <RateBar label="1.0–1.24" rate="7.50%" width="72%" accent={true} />
              <RateBar label="0.75–0.99" rate="8.25%" width="82%" accent={false} />
              <RateBar label="No-Ratio" rate="8.75%" width="90%" accent={false} />
            </div>
            <p className="mt-3 text-xs text-navy-500 font-body text-center">
              * Rates shown for 740+ credit, 75% LTV, 30-year fixed. Actual rates vary by lender and deal structure.
            </p>
          </div>
        </div>
      </section>

      {/* ── Infographic: Credit Score → Rate + LTV Matrix ─ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Left: Visual rate table */}
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
                Credit Score Impact
              </p>
              <h3 className="text-h3 text-navy-900 mb-6">How Your Credit Moves the Needle</h3>

              <div className="space-y-3">
                {[
                  { score: '740+', rate: '6.75–7.50%', ltv: '80%', color: 'bg-green-500', w: '65%' },
                  { score: '700–739', rate: '7.25–8.00%', ltv: '80%', color: 'bg-green-400', w: '72%' },
                  { score: '660–699', rate: '7.75–8.50%', ltv: '75%', color: 'bg-yellow-400', w: '80%' },
                  { score: '620–659', rate: '8.25–9.25%', ltv: '70%', color: 'bg-orange-400', w: '88%' },
                ].map((tier) => (
                  <div key={tier.score} className="bg-navy-50 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-16 text-center">
                      <p className="text-sm font-sans font-bold text-navy-900">{tier.score}</p>
                      <p className="text-[10px] text-navy-400">FICO</p>
                    </div>
                    <div className="flex-1">
                      <div className="bg-navy-200 rounded-full h-5 overflow-hidden">
                        <div className={`h-full ${tier.color} rounded-full flex items-center justify-end pr-2`} style={{ width: tier.w }}>
                          <span className="text-[10px] font-sans font-bold text-white">{tier.rate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-14 text-center">
                      <p className="text-sm font-sans font-bold text-navy-900">{tier.ltv}</p>
                      <p className="text-[10px] text-navy-400">Max LTV</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: LTV comparison */}
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
                LTV Impact
              </p>
              <h3 className="text-h3 text-navy-900 mb-6">Less Leverage = Better Rate</h3>

              <div className="space-y-4">
                {[
                  { ltv: '65%', rate: '6.50%', savings: 'Best rate available', highlight: true },
                  { ltv: '70%', rate: '6.875%', savings: '+0.375% vs 65%', highlight: false },
                  { ltv: '75%', rate: '7.25%', savings: '+0.75% vs 65%', highlight: false },
                  { ltv: '80%', rate: '7.75%', savings: '+1.25% vs 65%', highlight: false },
                ].map((tier) => (
                  <div key={tier.ltv} className={`rounded-lg p-5 flex items-center justify-between ${tier.highlight ? 'bg-accent text-white' : 'bg-navy-50'}`}>
                    <div>
                      <p className={`text-2xl font-sans font-bold ${tier.highlight ? 'text-white' : 'text-navy-900'}`}>{tier.ltv}</p>
                      <p className={`text-xs font-body ${tier.highlight ? 'text-white/70' : 'text-navy-400'}`}>Loan-to-Value</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-sans font-bold ${tier.highlight ? 'text-white' : 'text-navy-900'}`}>{tier.rate}</p>
                      <p className={`text-xs font-body ${tier.highlight ? 'text-white/70' : 'text-navy-400'}`}>{tier.savings}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-navy-400 font-body">
                * Based on 740+ credit, 1.25+ DSCR, 30-year fixed term
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Infographic: Portfolio Scaling Ladder ───────── */}
      <section className="bg-navy-50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
                Growth Playbook
              </p>
              <h3 className="text-h3 text-navy-900 mb-2">The Portfolio Scaling Ladder</h3>
              <p className="text-navy-500 font-body mb-8 leading-relaxed">
                Top investors don&apos;t use the same loan for every property. They ladder products based on where each asset sits in the growth cycle.
              </p>

              <ScalingStep step={1} count="1–4 Properties" label="Individual DSCR Loans" desc="Standard 30-year fixed DSCR on each property. Build credit history and lender relationships." />
              <ScalingStep step={2} count="5–10 Properties" label="Blanket / Portfolio Loans" desc="Combine 5+ properties under one loan. Simpler management, potential rate discount." />
              <ScalingStep step={3} count="10–20 Properties" label="DSCR Portfolio Lines" desc="Revolving credit lines secured by your portfolio. Draw as needed for new acquisitions." />
              <ScalingStep step={4} count="20+ Properties" label="Aggregation & Securitization" desc="Institutional-grade structures. Best rates, highest leverage, most flexibility." />
            </div>

            {/* Right: Entity structuring comparison */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-navy-100">
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
                Entity Comparison
              </p>
              <h3 className="text-h4 text-navy-900 mb-6">Which Entity Structure Fits?</h3>

              <div className="space-y-4">
                {[
                  { entity: 'LLC', rating: 5, best: 'Most flexible, most accepted', note: 'Default choice for 90% of investors' },
                  { entity: 'Land Trust', rating: 3, best: 'Privacy protection', note: 'Some lenders restrict — check first' },
                  { entity: 'S-Corp', rating: 2, best: 'Tax optimization', note: 'Fewer lenders, more paperwork' },
                  { entity: 'Series LLC', rating: 4, best: 'Multi-property isolation', note: 'Only available in ~12 states' },
                  { entity: 'Personal', rating: 3, best: 'Simplest qualification', note: 'No asset protection' },
                ].map((row) => (
                  <div key={row.entity} className="flex items-center gap-4 pb-4 border-b border-navy-100 last:border-0 last:pb-0">
                    <div className="w-20 shrink-0">
                      <p className="text-sm font-sans font-bold text-navy-900">{row.entity}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-0.5 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-5 h-2 rounded-full ${i < row.rating ? 'bg-accent' : 'bg-navy-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-navy-600 font-body">{row.best}</p>
                      <p className="text-[10px] text-navy-400 font-body">{row.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Teaser: Waterfall Strategy (with fade gate) ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Advanced Strategy Preview
          </p>
          <h2 className="section-heading">The Waterfall Strategy</h2>

          <div className="mt-8 relative">
            <div className="bg-navy-50 rounded-xl p-8 border border-navy-100">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-sans font-bold text-accent">1</span>
                  </div>
                  <p className="text-sm font-sans font-bold text-navy-900 mb-1">Acquire</p>
                  <p className="text-xs text-navy-500 font-body">Use bridge or fix-and-flip financing at 85-90% LTC for acquisition + rehab</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-sans font-bold text-accent">2</span>
                  </div>
                  <p className="text-sm font-sans font-bold text-navy-900 mb-1">Stabilize</p>
                  <p className="text-xs text-navy-500 font-body">Renovate, tenant, and season for 3-6 months to establish rental income history</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-sans font-bold text-accent">3</span>
                  </div>
                  <p className="text-sm font-sans font-bold text-navy-900 mb-1">Refinance</p>
                  <p className="text-xs text-navy-500 font-body">Cash-out refi into 30-year DSCR at 75% LTV. Pull equity. Repeat.</p>
                </div>
              </div>

              {/* Arrow connector */}
              <div className="hidden md:flex items-center justify-center gap-2 -mt-2 mb-4">
                <div className="h-0.5 flex-1 bg-accent/20" />
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </div>

              <p className="text-sm text-navy-600 font-body leading-relaxed text-center max-w-xl mx-auto">
                The most effective portfolio investors don&apos;t use the same loan for every property. They ladder DSCR products based on where each asset sits in the growth cycle — starting with bridge for acquisition, then converting to long-term DSCR...
              </p>

              {/* Fade gate */}
              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white via-white/95 to-transparent rounded-b-xl flex items-end justify-center pb-6">
                <button onClick={scrollToForm} className="btn-primary inline-flex items-center gap-2 shadow-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Get the Full Playbook
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Email Capture Form ─────────────────────────── */}
      <section className="bg-navy-900 py-16" id="download">
        <div className="mx-auto max-w-xl px-6">
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-h3 text-white">Check your inbox — the playbook is on its way.</h2>
              <p className="mt-3 text-sm text-navy-300 font-body">
                While you wait, you can also{' '}
                <Link href="/blog/2026-dscr-investor-playbook" className="text-accent-light font-semibold hover:underline">
                  read the full guide online
                </Link>.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-3">
                  Download Now
                </p>
                <h2 className="text-h2 text-white">Get the 2026 DSCR Playbook</h2>
                <p className="mt-3 text-navy-300 font-body">
                  Enter your info and we&apos;ll send the full PDF straight to your inbox.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl p-8 shadow-2xl">
                <div>
                  <label htmlFor="name" className="block text-sm font-sans font-medium text-navy-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 text-sm font-body text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-sans font-medium text-navy-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 text-sm font-body text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-sans font-medium text-navy-700 mb-1">
                    Phone <span className="text-navy-400 text-xs">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 text-sm font-body text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="properties" className="block text-sm font-sans font-medium text-navy-700 mb-1">
                    Portfolio Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="properties"
                    required
                    value={formData.properties}
                    onChange={(e) => setFormData({ ...formData, properties: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 text-sm font-body text-navy-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    {PROPERTY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full py-3.5 text-sm disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Me the Playbook'}
                </button>

                {status === 'error' && (
                  <p className="text-sm text-red-500 text-center">Something went wrong. Please try again.</p>
                )}

                <p className="text-xs text-navy-400 font-body text-center leading-relaxed">
                  We&apos;ll also send you market updates and deal opportunities. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ── Why 818 Capital ────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
                Why 818 Capital
              </p>
              <h2 className="section-heading">Built by Operators, Not Just Originators</h2>
              <p className="mt-4 text-navy-500 font-body leading-relaxed">
                818 Capital was founded by a real estate developer who got tired of the broken broker experience. We built an advisory process that&apos;s relational, educational, and direct — backed by AI-powered scenario analysis that gives you answers in seconds, not days.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '12+', label: 'Capital Programs' },
                { num: '14', label: 'Day Average Close' },
                { num: '$100M+', label: 'Transaction Experience' },
                { num: 'AI', label: 'Scenario Analysis' },
              ].map((stat) => (
                <div key={stat.label} className="bg-navy-50 rounded-lg p-6 text-center border border-navy-100">
                  <p className="text-2xl font-sans font-bold text-accent">{stat.num}</p>
                  <p className="mt-1 text-xs text-navy-500 font-body">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────── */}
      <section className="bg-accent py-14">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-h3 text-white">Have a Deal Right Now?</h2>
          <p className="mt-3 text-white/80 font-body max-w-lg mx-auto">
            Skip the playbook — submit your scenario and get an AI-powered analysis with real numbers, real programs, and a real answer.
          </p>
          <Link href="/dscr-loans#form" className="btn-white mt-6 inline-flex">
            Submit Your Scenario
          </Link>
        </div>
      </section>
    </>
  );
}
