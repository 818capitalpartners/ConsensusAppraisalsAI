'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLAYBOOK_ITEMS = [
  '2026 DSCR qualification requirements across 12+ lenders',
  'Rate comparison matrix: how rates vary by DSCR ratio, LTV, and credit score',
  'No-ratio and sub-1.0 DSCR programs — who offers them and when to use them',
  'STR income normalization: how Airbnb/VRBO revenue qualifies for DSCR',
  'Portfolio scaling strategies: 5-10-20+ property programs',
  'Entity structuring: LLC vs trust vs personal — impact on rate and terms',
  'Exit strategy planning: when to refi, when to sell, when to hold',
  'Real deal examples from 818 Capital\'s recent closings',
];

const PROPERTY_OPTIONS = [
  { value: '', label: 'How many investment properties do you own?' },
  { value: '0', label: '0 — Looking to buy my first' },
  { value: '1-4', label: '1–4 properties' },
  { value: '5-10', label: '5–10 properties' },
  { value: '10+', label: '10+ properties' },
];

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
          <div className="max-w-3xl">
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
              <div key={item} className="flex items-start gap-3 p-4 rounded-lg border border-navy-100 bg-navy-50/30">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-navy-700 font-body leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Teaser Content ─────────────────────────────── */}
      <section className="bg-navy-50 py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Preview
          </p>
          <h2 className="section-heading">A Taste of What&apos;s Inside</h2>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {/* Teaser 1: DSCR Requirements */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-navy-100">
              <h3 className="text-h4 text-navy-900 mb-4">What DSCR Do You Need in 2026?</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-900 text-white">
                      <th className="px-4 py-2.5 text-left font-sans font-semibold text-xs uppercase tracking-wide">DSCR Range</th>
                      <th className="px-4 py-2.5 text-left font-sans font-semibold text-xs uppercase tracking-wide">What It Unlocks</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-navy-600">
                    <tr className="border-b border-navy-100">
                      <td className="px-4 py-3 font-sans font-semibold text-navy-900">1.25+</td>
                      <td className="px-4 py-3">Best rates, highest LTV, most lender options</td>
                    </tr>
                    <tr className="border-b border-navy-100">
                      <td className="px-4 py-3 font-sans font-semibold text-navy-900">1.0 – 1.24</td>
                      <td className="px-4 py-3">Standard qualification, slight rate premium</td>
                    </tr>
                    <tr className="border-b border-navy-100">
                      <td className="px-4 py-3 font-sans font-semibold text-navy-900">0.75 – 0.99</td>
                      <td className="px-4 py-3">Sub-1.0 programs, higher down payment required</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-sans font-semibold text-navy-900">No-Ratio</td>
                      <td className="px-4 py-3">DSCR not calculated — qualification by credit + LTV</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teaser 2: Rate Impact */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-navy-100">
              <h3 className="text-h4 text-navy-900 mb-4">How Credit Score Impacts Your Rate</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-900 text-white">
                      <th className="px-4 py-2.5 text-left font-sans font-semibold text-xs uppercase tracking-wide">Credit Score</th>
                      <th className="px-4 py-2.5 text-left font-sans font-semibold text-xs uppercase tracking-wide">Rate Range</th>
                      <th className="px-4 py-2.5 text-left font-sans font-semibold text-xs uppercase tracking-wide">Max LTV</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-navy-600">
                    <tr className="border-b border-navy-100">
                      <td className="px-4 py-3 font-sans font-semibold text-navy-900">740+</td>
                      <td className="px-4 py-3">6.75% – 7.50%</td>
                      <td className="px-4 py-3">80% LTV</td>
                    </tr>
                    <tr className="border-b border-navy-100">
                      <td className="px-4 py-3 font-sans font-semibold text-navy-900">700–739</td>
                      <td className="px-4 py-3">7.25% – 8.00%</td>
                      <td className="px-4 py-3">80% LTV</td>
                    </tr>
                    <tr className="border-b border-navy-100">
                      <td className="px-4 py-3 font-sans font-semibold text-navy-900">660–699</td>
                      <td className="px-4 py-3">7.75% – 8.50%</td>
                      <td className="px-4 py-3">75% LTV</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-sans font-semibold text-navy-900">620–659</td>
                      <td className="px-4 py-3">8.25% – 9.25%</td>
                      <td className="px-4 py-3">70% LTV</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Fade overlay CTA */}
          <div className="mt-10 relative">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-navy-100">
              <h3 className="text-h4 text-navy-900 mb-3">Portfolio Scaling: The Waterfall Strategy</h3>
              <p className="text-sm text-navy-600 font-body leading-relaxed">
                The most effective portfolio investors don&apos;t use the same loan for every property. They ladder DSCR products based on where each asset sits in the growth cycle — starting with individual DSCR loans for properties 1–4, then moving to blanket loans for 5–10...
              </p>
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent rounded-b-lg flex items-end justify-center pb-6">
                <button onClick={scrollToForm} className="btn-primary inline-flex items-center gap-2">
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
      <section className="bg-white py-16" id="download">
        <div className="mx-auto max-w-xl px-6">
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-h3 text-navy-900">Check your inbox — the playbook is on its way.</h2>
              <p className="mt-3 text-sm text-navy-500 font-body">
                While you wait, you can also{' '}
                <Link href="/blog/2026-dscr-investor-playbook" className="text-accent font-semibold hover:underline">
                  read the full guide online
                </Link>.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">
                  Download Now
                </p>
                <h2 className="section-heading">Get the 2026 DSCR Playbook</h2>
                <p className="section-subheading mt-3">
                  Enter your info and we&apos;ll send the full PDF straight to your inbox.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
      <section className="bg-navy-50 py-16">
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
                <div key={stat.label} className="bg-white rounded-lg p-6 text-center shadow-sm border border-navy-100">
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
