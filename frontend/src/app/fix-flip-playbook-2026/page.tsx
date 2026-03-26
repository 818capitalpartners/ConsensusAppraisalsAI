'use client';

import { useState } from 'react';
import Link from 'next/link';

const ITEMS = [
  { icon: '📊', text: '2026 bridge loan comparison: rates, leverage, and terms across programs' },
  { icon: '🔨', text: 'Rehab budgeting: how to estimate costs and avoid overruns' },
  { icon: '🏠', text: 'ARV analysis: how to calculate After-Repair Value accurately' },
  { icon: '💰', text: 'LTC vs LTV: understanding leverage in fix & flip financing' },
  { icon: '📋', text: 'Draw schedules: how rehab draws work and what lenders require' },
  { icon: '🚪', text: 'Exit strategies: sell vs rent vs BRRRR — when each makes sense' },
  { icon: '📍', text: 'Market selection: where flips work best in 2026' },
  { icon: '✅', text: 'Real deal breakdowns from 818 Capital\'s recent closings' },
];

const FLIP_OPTIONS = [
  { value: '', label: 'How many flips have you completed?' },
  { value: '0', label: '0 — Planning my first flip' },
  { value: '1-3', label: '1–3 flips' },
  { value: '4-10', label: '4–10 flips' },
  { value: '10+', label: '10+ flips' },
];

/* ── Flip Economics Waterfall ─────────────────── */
function FlipWaterfall() {
  const steps = [
    { label: 'Purchase', value: '$200,000', pct: 53, color: 'bg-navy-700' },
    { label: 'Rehab', value: '$75,000', pct: 20, color: 'bg-navy-500' },
    { label: 'Carrying Costs', value: '$18,000', pct: 5, color: 'bg-navy-400' },
    { label: 'Closing (Buy+Sell)', value: '$30,000', pct: 8, color: 'bg-navy-300' },
    { label: 'Total Cost', value: '$323,000', pct: 86, color: 'bg-orange-500' },
    { label: 'Sell Price (ARV)', value: '$375,000', pct: 100, color: 'bg-accent' },
    { label: 'Net Profit', value: '$52,000', pct: 14, color: 'bg-green-500' },
  ];
  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="text-xs font-sans font-semibold text-navy-700 w-28 text-right shrink-0">{s.label}</span>
          <div className="flex-1 bg-navy-100 rounded-full h-8 relative overflow-hidden">
            <div className={`h-full rounded-full flex items-center justify-end pr-3 ${s.color}`} style={{ width: `${s.pct}%` }}>
              <span className="text-xs font-sans font-bold text-white">{s.value}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="text-center mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
        <p className="text-lg font-sans font-bold text-green-700">ROI on Cash Invested: 124%</p>
        <p className="text-xs text-green-600 font-body">$42K cash in → $52K profit in 6 months</p>
      </div>
    </div>
  );
}

/* ── Bridge Loan Comparison ──────────────────── */
function BridgeComparison() {
  const programs = [
    { label: '90% LTC + 100% Rehab', rate: '9.5–11%', width: '95%', tag: 'Maximum Leverage', accent: true },
    { label: '85% LTC + 100% Rehab', rate: '9–10.5%', width: '85%', tag: 'Aggressive', accent: true },
    { label: '80% LTC + 90% Rehab', rate: '8.5–10%', width: '75%', tag: 'Standard', accent: false },
    { label: '75% LTC + 80% Rehab', rate: '8–9.5%', width: '65%', tag: 'Conservative', accent: false },
  ];
  return (
    <div className="space-y-4">
      {programs.map((p) => (
        <div key={p.label}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-sans font-semibold text-navy-700">{p.label}</span>
            <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full ${p.accent ? 'bg-accent/10 text-accent' : 'bg-navy-100 text-navy-500'}`}>{p.tag}</span>
          </div>
          <div className="flex-1 bg-navy-100 rounded-full h-7 relative overflow-hidden">
            <div className={`h-full rounded-full flex items-center justify-end pr-3 ${p.accent ? 'bg-accent' : 'bg-navy-300'}`} style={{ width: p.width }}>
              <span className="text-xs font-sans font-bold text-white">{p.rate}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Flip Timeline ───────────────────────────── */
function FlipTimeline() {
  const phases = [
    { month: 'Mo 0', label: 'Close', desc: 'Fund & acquire', color: 'bg-accent', width: '8%' },
    { month: 'Mo 1-3', label: 'Rehab', desc: 'Renovate property', color: 'bg-orange-500', width: '35%' },
    { month: 'Mo 4', label: 'List', desc: 'Stage & market', color: 'bg-yellow-500', width: '10%' },
    { month: 'Mo 5-6', label: 'Sell', desc: 'Close with buyer', color: 'bg-green-500', width: '20%' },
    { month: 'Mo 7-12', label: 'Buffer', desc: 'Safety margin', color: 'bg-navy-200', width: '27%' },
  ];
  return (
    <div>
      <div className="flex rounded-lg overflow-hidden h-12 mb-4">
        {phases.map((p) => (
          <div key={p.label} className={`${p.color} flex items-center justify-center`} style={{ width: p.width }}>
            <span className="text-[10px] font-sans font-bold text-white">{p.label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {phases.map((p) => (
          <div key={p.label} className="text-center">
            <p className="text-[10px] font-sans font-bold text-navy-700">{p.month}</p>
            <p className="text-[9px] text-navy-500 font-body">{p.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-navy-50 border border-navy-200 text-center">
        <p className="text-xs text-navy-600 font-body">Carrying costs accumulate at <span className="font-bold text-navy-900">~$3,000/month</span> — every month over budget costs you profit</p>
      </div>
    </div>
  );
}

/* ── Rehab Budget Breakdown ──────────────────── */
function RehabBudget() {
  const items = [
    { label: 'Kitchen', pct: 28, cost: '$21,000', color: 'bg-accent' },
    { label: 'Bathrooms', pct: 18, cost: '$13,500', color: 'bg-blue-400' },
    { label: 'Systems (HVAC/Plumb/Elec)', pct: 17, cost: '$12,750', color: 'bg-navy-500' },
    { label: 'Flooring', pct: 13, cost: '$9,750', color: 'bg-navy-400' },
    { label: 'Paint & Exterior', pct: 10, cost: '$7,500', color: 'bg-navy-300' },
    { label: 'Contingency', pct: 14, cost: '$10,500', color: 'bg-orange-400' },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs text-navy-500 font-body text-center mb-2">Based on $75,000 total rehab budget</p>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs font-sans text-navy-700 w-36 text-right shrink-0">{item.label}</span>
          <div className="flex-1 bg-navy-100 rounded-full h-6 relative overflow-hidden">
            <div className={`h-full rounded-full flex items-center px-3 justify-between ${item.color}`} style={{ width: `${item.pct * 2.5}%` }}>
              <span className="text-[10px] font-bold text-white">{item.pct}%</span>
              <span className="text-[10px] font-bold text-white">{item.cost}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── ROI Sensitivity Matrix ──────────────────── */
function ROIMatrix() {
  const data = [
    { arv: '$350K', results: [{ rehab: '$60K', profit: '$40K', roi: '95%', color: 'bg-green-100 text-green-800' }, { rehab: '$75K', profit: '$25K', roi: '60%', color: 'bg-yellow-100 text-yellow-800' }, { rehab: '$90K', profit: '$10K', roi: '24%', color: 'bg-red-100 text-red-800' }] },
    { arv: '$375K', results: [{ rehab: '$60K', profit: '$65K', roi: '155%', color: 'bg-green-100 text-green-800' }, { rehab: '$75K', profit: '$52K', roi: '124%', color: 'bg-green-100 text-green-800' }, { rehab: '$90K', profit: '$35K', roi: '83%', color: 'bg-yellow-100 text-yellow-800' }] },
    { arv: '$400K', results: [{ rehab: '$60K', profit: '$90K', roi: '215%', color: 'bg-green-100 text-green-800' }, { rehab: '$75K', profit: '$77K', roi: '183%', color: 'bg-green-100 text-green-800' }, { rehab: '$90K', profit: '$60K', roi: '143%', color: 'bg-green-100 text-green-800' }] },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy-900 text-white">
            <th className="p-3 text-left text-xs font-sans">ARV ↓ / Rehab →</th>
            <th className="p-3 text-center text-xs font-sans">$60K Rehab</th>
            <th className="p-3 text-center text-xs font-sans">$75K Rehab</th>
            <th className="p-3 text-center text-xs font-sans">$90K Rehab</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.arv} className="border-b border-navy-100">
              <td className="p-3 font-sans font-bold text-navy-900 text-xs">{row.arv} ARV</td>
              {row.results.map((cell) => (
                <td key={cell.rehab} className="p-2 text-center">
                  <div className={`rounded-lg p-2 ${cell.color}`}>
                    <p className="font-sans font-bold text-xs">{cell.profit}</p>
                    <p className="text-[10px]">{cell.roi} ROI</p>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-navy-400 font-body text-center mt-2">Based on $200K purchase price. Includes $18K carrying + $30K closing costs.</p>
    </div>
  );
}

export default function FixFlipPlaybookPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', flips: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('https://hook.us2.make.com/placeholder-flip-playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'fix_flip_playbook_2026', timestamp: new Date().toISOString() }),
      });
      setStatus('success');
    } catch { setStatus('error'); }
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-900 py-20 md:py-28">
        <div className="mx-auto max-w-content px-6 text-center">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-6">Free Investor Playbook</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-white leading-tight max-w-4xl mx-auto">
            The 2026 Fix &amp; Flip<br />Investor Playbook
          </h1>
          <p className="mt-6 text-lg text-navy-300 font-body font-light max-w-2xl mx-auto">
            Acquisition strategies, rehab budgeting, bridge loan structures, and exit timing — from a lender that&apos;s funded $2M+ in flips.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-navy-400 font-body">
            <span>6 Chapters</span><span className="text-navy-600">|</span>
            <span>6 Real Deals</span><span className="text-navy-600">|</span>
            <span>28 Pages</span><span className="text-navy-600">|</span>
            <span>No Spam</span>
          </div>
          <div className="mt-8">
            <a href="#download" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Free Playbook
            </a>
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading text-center mb-10">What&apos;s Inside</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {ITEMS.map((item) => (
              <div key={item.text} className="p-4 rounded-lg border border-navy-100 bg-navy-50/30 flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <p className="text-sm text-navy-600 font-body leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual: Flip Economics */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Deal Economics</p>
            <h2 className="section-heading text-center mb-2">Anatomy of a Profitable Flip</h2>
            <p className="section-subheading text-center mb-10">Every dollar in, every dollar out — visualized.</p>
            <FlipWaterfall />
          </div>
        </div>
      </section>

      {/* Visual: Bridge Loan Comparison */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Financing Options</p>
            <h2 className="section-heading text-center mb-2">Bridge Loan Programs Compared</h2>
            <p className="section-subheading text-center mb-10">More leverage = less cash out of pocket, but higher rates.</p>
            <BridgeComparison />
          </div>
        </div>
      </section>

      {/* Visual: Timeline */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Project Timeline</p>
            <h2 className="section-heading text-center mb-2">The 6-Month Flip Lifecycle</h2>
            <p className="section-subheading text-center mb-10">From close to cash — every month matters.</p>
            <FlipTimeline />
          </div>
        </div>
      </section>

      {/* Visual: Rehab Budget */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Rehab Planning</p>
            <h2 className="section-heading text-center mb-2">Where Your Rehab Budget Goes</h2>
            <p className="section-subheading text-center mb-10">Kitchen and bathrooms drive 46% of your budget — and 80% of your ARV lift.</p>
            <RehabBudget />
          </div>
        </div>
      </section>

      {/* Visual: ROI Matrix */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Sensitivity Analysis</p>
            <h2 className="section-heading text-center mb-2">ROI by ARV &amp; Rehab Cost</h2>
            <p className="section-subheading text-center mb-10">Green = strong deal. Yellow = proceed with caution. Red = restructure or pass.</p>
            <ROIMatrix />
          </div>
        </div>
      </section>

      {/* Real Deal Spotlight */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Funded Deals</p>
          <h2 className="section-heading text-center mb-10">Real Flips We&apos;ve Funded</h2>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { city: 'Washington, DC', value: '$525,000', program: '90% LTC / 100% Rehab', rate: '9.5%', desc: 'DC metro flip with premium ARV potential. 12-mo bridge IO.' },
              { city: 'Fort Worth, TX', value: '$310,000', program: '90% LTC / 100% Rehab', rate: 'Competitive', desc: 'DFW suburb with metro spillover demand. Max leverage execution.' },
              { city: 'Pensacola, FL', value: '$195,000', program: '12-Mo Bridge IO', rate: '10.49%', desc: 'Coastal market flip. 4-6% YoY appreciation. Low carry costs.' },
            ].map((deal) => (
              <div key={deal.city} className="p-5 rounded-lg border border-navy-100 bg-navy-50/30">
                <p className="text-xs font-sans font-semibold text-accent mb-1">{deal.program}</p>
                <h3 className="text-lg font-sans font-bold text-navy-900">{deal.city}</h3>
                <p className="text-2xl font-sans font-bold text-navy-900 mt-1">{deal.value}</p>
                <p className="text-xs text-navy-500 font-body mt-1">Rate: {deal.rate}</p>
                <p className="text-xs text-navy-500 font-body mt-2 leading-relaxed">{deal.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/closed-deals" className="text-sm text-accent font-sans font-semibold hover:underline">
              See all 6 funded flips &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Email Capture Form */}
      <section id="download" className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-xl mx-auto">
            {status === 'success' ? (
              <div className="text-center p-8 rounded-xl bg-white">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-sans font-bold text-navy-900">Check your inbox!</h3>
                <p className="mt-2 text-sm text-navy-500 font-body">The Fix &amp; Flip Playbook is on its way.</p>
                <Link href="/blog/fix-flip-playbook-2026" className="mt-4 inline-block text-sm text-accent font-sans font-semibold hover:underline">
                  Read the full guide online &rarr;
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8">
                <h2 className="text-xl font-sans font-bold text-navy-900 text-center mb-2">Get the Fix &amp; Flip Playbook</h2>
                <p className="text-sm text-navy-500 font-body text-center mb-6">Bridge loan comparison, rehab budgets, ROI calculators, and 6 real deal breakdowns.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" placeholder="Full Name *" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-navy-200 px-4 py-3 text-sm font-body focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  <input type="email" placeholder="Email Address *" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border border-navy-200 px-4 py-3 text-sm font-body focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  <input type="tel" placeholder="Phone (optional)" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-lg border border-navy-200 px-4 py-3 text-sm font-body focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  <select value={formData.flips} onChange={(e) => setFormData({ ...formData, flips: e.target.value })} className="w-full rounded-lg border border-navy-200 px-4 py-3 text-sm font-body focus:ring-2 focus:ring-accent focus:border-accent outline-none text-navy-500">
                    {FLIP_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                  <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">{status === 'loading' ? 'Sending...' : 'Get the Playbook'}</button>
                </form>
                <p className="mt-3 text-[10px] text-navy-400 font-body text-center">We&apos;ll also send you market updates and deal opportunities. Unsubscribe anytime.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-sans font-bold text-white">Have a flip deal right now?</h2>
          <p className="mt-3 text-white/80 font-body">Skip the playbook — submit your scenario and get terms in 24 hours.</p>
          <Link href="/fix-and-flip#form" className="btn-white mt-6 inline-block">Submit a Flip Scenario</Link>
        </div>
      </section>
    </>
  );
}
