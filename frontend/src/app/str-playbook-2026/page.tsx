'use client';

import { useState } from 'react';
import Link from 'next/link';

const ITEMS = [
  { icon: '📊', text: 'How lenders qualify STR income (AirDNA, actual revenue, lease comps)' },
  { icon: '💵', text: 'Revenue projection methods and seasonal normalization' },
  { icon: '🔢', text: 'DSCR calculation with STR income — worked examples' },
  { icon: '🏡', text: 'Platform optimization: Airbnb vs VRBO vs direct booking' },
  { icon: '📍', text: 'Market selection: top STR markets and what makes them work' },
  { icon: '⚖️', text: 'Regulatory landscape: where STR is safe and where it\'s risky' },
  { icon: '🛋️', text: 'Furnishing and setup: budget breakdown and ROI' },
  { icon: '✅', text: 'Real funded STR deals from 818 Capital' },
];

const STR_OPTIONS = [
  { value: '', label: 'Do you currently operate an STR?' },
  { value: 'yes', label: 'Yes — currently operating' },
  { value: 'no', label: 'No — but planning to' },
  { value: 'converting', label: 'Converting a long-term rental to STR' },
];

/* ── STR vs LTR Comparison ───────────────────── */
function STRvsLTR() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="p-6 rounded-xl border-2 border-navy-200 bg-white">
        <p className="text-xs font-sans font-semibold uppercase tracking-[0.15em] text-navy-400 mb-2">Long-Term Rental</p>
        <p className="text-3xl font-sans font-bold text-navy-900">$2,200<span className="text-lg text-navy-400">/mo</span></p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs font-body text-navy-500"><span>Occupancy</span><span className="font-semibold text-navy-700">100%</span></div>
          <div className="flex justify-between text-xs font-body text-navy-500"><span>Annual Income</span><span className="font-semibold text-navy-700">$26,400</span></div>
          <div className="flex justify-between text-xs font-body text-navy-500"><span>Management</span><span className="font-semibold text-navy-700">Low</span></div>
          <div className="flex justify-between text-xs font-body text-navy-500"><span>Turnover</span><span className="font-semibold text-navy-700">Annual</span></div>
        </div>
      </div>
      <div className="p-6 rounded-xl border-2 border-accent bg-accent/5 relative">
        <div className="absolute -top-3 right-4 bg-accent text-white text-[10px] font-sans font-bold px-3 py-1 rounded-full">+53% Income</div>
        <p className="text-xs font-sans font-semibold uppercase tracking-[0.15em] text-accent mb-2">Short-Term Rental</p>
        <p className="text-3xl font-sans font-bold text-navy-900">$3,375<span className="text-lg text-navy-400">/mo avg</span></p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs font-body text-navy-500"><span>Occupancy</span><span className="font-semibold text-accent">75%</span></div>
          <div className="flex justify-between text-xs font-body text-navy-500"><span>Annual Income</span><span className="font-semibold text-accent">$40,500</span></div>
          <div className="flex justify-between text-xs font-body text-navy-500"><span>Management</span><span className="font-semibold text-navy-700">Higher</span></div>
          <div className="flex justify-between text-xs font-body text-navy-500"><span>Turnover</span><span className="font-semibold text-navy-700">Weekly</span></div>
        </div>
      </div>
    </div>
  );
}

/* ── Revenue Waterfall ───────────────────────── */
function RevenueWaterfall() {
  const steps = [
    { label: 'Gross Booking Revenue', value: '$54,000', width: '100%', color: 'bg-accent', sign: '' },
    { label: 'Platform Fees (15%)', value: '-$8,100', width: '85%', color: 'bg-blue-400', sign: '-' },
    { label: 'Cleaning Costs', value: '-$4,800', width: '76%', color: 'bg-navy-400', sign: '-' },
    { label: 'Supplies & Maintenance', value: '-$2,400', width: '72%', color: 'bg-navy-300', sign: '-' },
    { label: 'Net STR Income', value: '$38,700', width: '72%', color: 'bg-green-500', sign: '=' },
  ];
  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="text-xs font-sans text-navy-700 w-36 text-right shrink-0">{s.label}</span>
          <div className="flex-1 bg-navy-100 rounded-full h-8 relative overflow-hidden">
            <div className={`h-full rounded-full flex items-center justify-end pr-3 ${s.color}`} style={{ width: s.width }}>
              <span className="text-xs font-sans font-bold text-white">{s.value}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="text-center mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
        <p className="text-sm font-sans font-bold text-green-700">Monthly DSCR Income: $3,225</p>
        <p className="text-xs text-green-600 font-body">This is what the lender uses for qualification</p>
      </div>
    </div>
  );
}

/* ── Occupancy Impact ────────────────────────── */
function OccupancyImpact() {
  const scenarios = [
    { level: 'Conservative', pct: '65%', income: '$2,925/mo', dscr: '0.95', color: 'border-red-400 bg-red-50', dcrColor: 'text-red-600', tag: 'Needs Restructuring' },
    { level: 'Moderate', pct: '75%', income: '$3,375/mo', dscr: '1.25', color: 'border-accent bg-accent/5', dcrColor: 'text-accent', tag: 'Sweet Spot' },
    { level: 'Aggressive', pct: '85%', income: '$3,825/mo', dscr: '1.55', color: 'border-green-400 bg-green-50', dcrColor: 'text-green-600', tag: 'Strong' },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {scenarios.map((s) => (
        <div key={s.level} className={`p-5 rounded-xl border-2 ${s.color} text-center relative`}>
          {s.level === 'Moderate' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-sans font-bold px-3 py-1 rounded-full whitespace-nowrap">Most Common</div>}
          <p className="text-xs font-sans font-semibold text-navy-500 uppercase tracking-wider">{s.level}</p>
          <p className="text-3xl font-sans font-bold text-navy-900 mt-2">{s.pct}</p>
          <p className="text-xs text-navy-500 font-body">occupancy</p>
          <div className="mt-3 pt-3 border-t border-navy-200">
            <p className="text-sm font-sans font-semibold text-navy-700">{s.income}</p>
            <p className={`text-2xl font-sans font-bold mt-1 ${s.dcrColor}`}>{s.dscr} DSCR</p>
            <p className={`text-[10px] font-sans font-bold mt-1 ${s.dcrColor}`}>{s.tag}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Seasonal Revenue Chart ──────────────────── */
function SeasonalChart() {
  const months = [
    { name: 'Jan', rev: 2800, height: '35%', peak: false },
    { name: 'Feb', rev: 2600, height: '32%', peak: false },
    { name: 'Mar', rev: 3400, height: '42%', peak: false },
    { name: 'Apr', rev: 4000, height: '50%', peak: false },
    { name: 'May', rev: 4800, height: '60%', peak: false },
    { name: 'Jun', rev: 6200, height: '78%', peak: true },
    { name: 'Jul', rev: 7500, height: '94%', peak: true },
    { name: 'Aug', rev: 8000, height: '100%', peak: true },
    { name: 'Sep', rev: 5200, height: '65%', peak: false },
    { name: 'Oct', rev: 4600, height: '58%', peak: false },
    { name: 'Nov', rev: 3200, height: '40%', peak: false },
    { name: 'Dec', rev: 5800, height: '73%', peak: true },
  ];
  return (
    <div>
      <div className="flex items-end gap-1.5 h-48">
        {months.map((m) => (
          <div key={m.name} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-[9px] font-sans font-bold text-navy-600 mb-1">${(m.rev / 1000).toFixed(1)}K</span>
            <div className={`w-full rounded-t-md ${m.peak ? 'bg-accent' : 'bg-navy-200'}`} style={{ height: m.height }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-2">
        {months.map((m) => (
          <div key={m.name} className="flex-1 text-center">
            <span className="text-[9px] font-sans text-navy-500">{m.name}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6 mt-4 text-xs font-body">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent" /> Peak Season</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-navy-200" /> Off-Peak</span>
      </div>
      <div className="mt-3 p-3 rounded-lg bg-navy-50 border border-navy-200 text-center">
        <p className="text-xs text-navy-600 font-body">Annual average: <span className="font-bold text-navy-900">$4,508/month</span> | Peak months drive 52% of annual revenue</p>
      </div>
    </div>
  );
}

/* ── Setup Cost Breakdown ────────────────────── */
function SetupCosts() {
  const items = [
    { label: 'Furniture', pct: 40, range: '$8K-15K', color: 'bg-accent' },
    { label: 'Kitchen/Dining', pct: 15, range: '$2K-4K', color: 'bg-blue-400' },
    { label: 'Linens/Towels', pct: 10, range: '$1.5K-2.5K', color: 'bg-blue-300' },
    { label: 'Decor/Styling', pct: 10, range: '$1K-3K', color: 'bg-navy-400' },
    { label: 'Outdoor/Patio', pct: 10, range: '$1K-3K', color: 'bg-navy-300' },
    { label: 'Smart Home/Tech', pct: 5, range: '$500-1.5K', color: 'bg-navy-200' },
    { label: 'Photography', pct: 3, range: '$300-800', color: 'bg-green-400' },
    { label: 'Contingency', pct: 7, range: '$1K-2K', color: 'bg-orange-400' },
  ];
  return (
    <div>
      {/* Stacked bar */}
      <div className="flex rounded-lg overflow-hidden h-10 mb-6">
        {items.map((item) => (
          <div key={item.label} className={`${item.color} flex items-center justify-center`} style={{ width: `${item.pct}%` }}>
            {item.pct >= 10 && <span className="text-[9px] font-bold text-white">{item.pct}%</span>}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${item.color} shrink-0`} />
            <div>
              <p className="text-[10px] font-sans font-semibold text-navy-700">{item.label}</p>
              <p className="text-[9px] text-navy-400 font-body">{item.range}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/20 text-center">
        <p className="text-sm font-sans font-bold text-navy-900">Total Setup: $15,000 – $30,000</p>
        <p className="text-xs text-navy-500 font-body">Typical payback period: 3-6 months of STR revenue</p>
      </div>
    </div>
  );
}

/* ── Top Markets Grid ────────────────────────── */
function TopMarkets() {
  const markets = [
    { name: 'Smoky Mountains', sub: 'Pigeon Forge / Gatlinburg', rate: '$250', occ: '78%', annual: '$71K', tag: 'Top Performer' },
    { name: 'Nashville, TN', sub: 'Music City', rate: '$200', occ: '72%', annual: '$52K', tag: 'Urban STR' },
    { name: 'Gulf Coast FL', sub: 'Panama City / Destin', rate: '$275', occ: '70%', annual: '$70K', tag: 'Beach Market' },
    { name: 'Scottsdale, AZ', sub: 'Phoenix Metro', rate: '$225', occ: '74%', annual: '$61K', tag: 'Desert Luxury' },
    { name: 'Joshua Tree, CA', sub: 'High Desert', rate: '$300', occ: '68%', annual: '$74K', tag: 'Unique Stays' },
    { name: 'Sandpoint, ID', sub: 'Lake Pend Oreille', rate: '$350', occ: '65%', annual: '$83K', tag: 'Lake Market' },
  ];
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {markets.map((m) => (
        <div key={m.name} className="p-5 rounded-xl border border-navy-100 bg-white hover:shadow-md transition">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-sm font-sans font-bold text-navy-900">{m.name}</h3>
              <p className="text-[10px] text-navy-400 font-body">{m.sub}</p>
            </div>
            <span className="text-[9px] font-sans font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">{m.tag}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-navy-50 rounded p-2"><p className="text-sm font-sans font-bold text-navy-900">{m.rate}</p><p className="text-[9px] text-navy-400">$/night</p></div>
            <div className="bg-navy-50 rounded p-2"><p className="text-sm font-sans font-bold text-navy-900">{m.occ}</p><p className="text-[9px] text-navy-400">occupancy</p></div>
            <div className="bg-accent/5 rounded p-2"><p className="text-sm font-sans font-bold text-accent">{m.annual}</p><p className="text-[9px] text-navy-400">annual</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── DSCR Calculation Flow ───────────────────── */
function DSCRFlow() {
  const steps = [
    { num: 1, label: 'Annual STR Revenue', value: '$40,500', desc: '75% occupancy x $150/night x 365 days' },
    { num: 2, label: 'Monthly Income', value: '$3,375', desc: '$40,500 / 12 months' },
    { num: 3, label: 'Monthly PITI', value: '$2,700', desc: 'P&I + taxes + insurance' },
    { num: 4, label: 'DSCR Ratio', value: '1.25', desc: '$3,375 / $2,700 = qualifies!' },
  ];
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-4">
      {steps.map((s, i) => (
        <div key={s.num} className="flex-1 flex items-start gap-3">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-sans font-bold">{s.num}</div>
            {i < steps.length - 1 && <div className="hidden md:block w-0.5 h-full bg-accent/20" />}
          </div>
          <div className="pb-4">
            <p className="text-xs font-sans font-semibold text-navy-500">{s.label}</p>
            <p className={`text-xl font-sans font-bold ${s.num === 4 ? 'text-green-600' : 'text-navy-900'}`}>{s.value}</p>
            <p className="text-[10px] text-navy-400 font-body mt-1">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function STRPlaybookPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', strStatus: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('https://hook.us2.make.com/placeholder-str-playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'str_playbook_2026', timestamp: new Date().toISOString() }),
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
            The 2026 Short-Term Rental<br />Investor Playbook
          </h1>
          <p className="mt-6 text-lg text-navy-300 font-body font-light max-w-2xl mx-auto">
            Revenue projections, DSCR qualification with STR income, market selection, and platform optimization — backed by real funded deals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-navy-400 font-body">
            <span>7 Chapters</span><span className="text-navy-600">|</span>
            <span>3 Funded Deals</span><span className="text-navy-600">|</span>
            <span>24 Pages</span><span className="text-navy-600">|</span>
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

      {/* Visual: STR vs LTR */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">The STR Premium</p>
            <h2 className="section-heading text-center mb-2">Short-Term vs Long-Term: The Numbers</h2>
            <p className="section-subheading text-center mb-10">Same property. Same market. Dramatically different income.</p>
            <STRvsLTR />
          </div>
        </div>
      </section>

      {/* Visual: Revenue Waterfall */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Revenue Analysis</p>
            <h2 className="section-heading text-center mb-2">STR Revenue Waterfall</h2>
            <p className="section-subheading text-center mb-10">From gross bookings to the number your lender uses.</p>
            <RevenueWaterfall />
          </div>
        </div>
      </section>

      {/* Visual: Occupancy Impact */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Qualification Impact</p>
            <h2 className="section-heading text-center mb-2">How Occupancy Changes Your DSCR</h2>
            <p className="section-subheading text-center mb-10">10% occupancy difference can mean the difference between qualifying and not.</p>
            <OccupancyImpact />
          </div>
        </div>
      </section>

      {/* Visual: Seasonal Chart */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Seasonality</p>
            <h2 className="section-heading text-center mb-2">Monthly Revenue Pattern</h2>
            <p className="section-subheading text-center mb-10">Don&apos;t annualize your peak month. Lenders use 12-month averages.</p>
            <SeasonalChart />
          </div>
        </div>
      </section>

      {/* Visual: DSCR Calculation */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Qualification</p>
            <h2 className="section-heading text-center mb-2">STR DSCR Calculation — Step by Step</h2>
            <p className="section-subheading text-center mb-10">Four numbers. That&apos;s all the lender needs.</p>
            <DSCRFlow />
          </div>
        </div>
      </section>

      {/* Visual: Top Markets */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Market Intelligence</p>
          <h2 className="section-heading text-center mb-2">Top STR Markets 2026</h2>
          <p className="section-subheading text-center mb-10">Where the numbers work — and why.</p>
          <div className="max-w-5xl mx-auto">
            <TopMarkets />
          </div>
        </div>
      </section>

      {/* Visual: Setup Costs */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Startup Investment</p>
            <h2 className="section-heading text-center mb-2">STR Setup Cost Breakdown</h2>
            <p className="section-subheading text-center mb-10">Furniture and photography are the two highest-ROI line items. Don&apos;t skimp.</p>
            <SetupCosts />
          </div>
        </div>
      </section>

      {/* Real Deal Spotlight */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3 text-center">Funded Deals</p>
          <h2 className="section-heading text-center mb-10">Real STR Deals We&apos;ve Funded</h2>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { city: 'Pigeon Forge, TN', value: '$385,000', program: '30-Yr DSCR Cash-Out', ltv: '70% LTV', desc: 'Smoky Mountains STR. 12M+ annual visitors. Projected gross yield 15-22%.' },
              { city: 'Nashville, TN', value: '$445,000', program: '30-Yr DSCR Cash-Out', ltv: '75% LTV', desc: 'Music City STR. $7B+ tourism economy. Cash-on-cash 11-16% after refi.' },
              { city: 'Sandpoint, ID', value: '$340,000', program: '30-Yr DSCR R&T', ltv: '75% LTV', desc: 'Lakeside resort condo. $150-300/night. Year-round tourism demand.' },
            ].map((deal) => (
              <div key={deal.city} className="p-5 rounded-lg border border-navy-100 bg-navy-50/30">
                <p className="text-xs font-sans font-semibold text-accent mb-1">{deal.program}</p>
                <h3 className="text-lg font-sans font-bold text-navy-900">{deal.city}</h3>
                <p className="text-2xl font-sans font-bold text-navy-900 mt-1">{deal.value}</p>
                <p className="text-xs text-navy-500 font-body mt-1">{deal.ltv}</p>
                <p className="text-xs text-navy-500 font-body mt-2 leading-relaxed">{deal.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/closed-deals" className="text-sm text-accent font-sans font-semibold hover:underline">
              See all funded STR deals &rarr;
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
                <p className="mt-2 text-sm text-navy-500 font-body">The STR Playbook is on its way.</p>
                <Link href="/blog/str-playbook-2026" className="mt-4 inline-block text-sm text-accent font-sans font-semibold hover:underline">
                  Read the full guide online &rarr;
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8">
                <h2 className="text-xl font-sans font-bold text-navy-900 text-center mb-2">Get the STR Playbook</h2>
                <p className="text-sm text-navy-500 font-body text-center mb-6">Revenue projections, market data, DSCR qualification, and 3 real deal breakdowns.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" placeholder="Full Name *" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-navy-200 px-4 py-3 text-sm font-body focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  <input type="email" placeholder="Email Address *" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border border-navy-200 px-4 py-3 text-sm font-body focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  <input type="tel" placeholder="Phone (optional)" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-lg border border-navy-200 px-4 py-3 text-sm font-body focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  <select value={formData.strStatus} onChange={(e) => setFormData({ ...formData, strStatus: e.target.value })} className="w-full rounded-lg border border-navy-200 px-4 py-3 text-sm font-body focus:ring-2 focus:ring-accent focus:border-accent outline-none text-navy-500">
                    {STR_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                  <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">{status === 'loading' ? 'Sending...' : 'Get the Playbook'}</button>
                </form>
                <p className="mt-3 text-[10px] text-navy-400 font-body text-center">We&apos;ll also send you market updates and deal opportunities. Unsubscribe anytime.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cross-Links */}
      <section className="bg-navy-50/50 py-12">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-6 text-center">More Playbooks</p>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link href="/dscr-playbook-2026" className="p-5 rounded-lg border border-navy-100 bg-white hover:shadow-md transition group">
              <p className="text-sm font-sans font-bold text-navy-900 group-hover:text-accent">DSCR Investor Playbook &rarr;</p>
              <p className="text-xs text-navy-500 font-body mt-1">Qualification requirements, rate matrices, portfolio scaling</p>
            </Link>
            <Link href="/fix-flip-playbook-2026" className="p-5 rounded-lg border border-navy-100 bg-white hover:shadow-md transition group">
              <p className="text-sm font-sans font-bold text-navy-900 group-hover:text-accent">Fix &amp; Flip Playbook &rarr;</p>
              <p className="text-xs text-navy-500 font-body mt-1">Bridge loans, rehab budgets, ROI calculators</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-sans font-bold text-white">Have an STR deal?</h2>
          <p className="mt-3 text-white/80 font-body">Submit your scenario and get STR-specific DSCR terms in 24 hours.</p>
          <Link href="/str-loans#form" className="btn-white mt-6 inline-block">Submit an STR Scenario</Link>
        </div>
      </section>
    </>
  );
}
