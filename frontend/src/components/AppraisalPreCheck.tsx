'use client';

import { TrendingUp, Shield, AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

/**
 * AI Appraisal Pre-Check promotional card.
 * Shows on DSCR and Multifamily pages to highlight the automated
 * valuation feature that runs after deal submission.
 */
export default function AppraisalPreCheck() {
  return (
    <section className="bg-navy-50/50 py-16">
      <div className="mx-auto max-w-content px-6">
        <div className="rounded-2xl border border-navy-100 bg-white shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left – Content */}
            <div className="p-8 md:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-sans font-bold px-3 py-1.5 rounded-full mb-6">
                <TrendingUp className="w-3.5 h-3.5" />
                AI-Powered
              </div>
              <h2 className="text-h2 text-navy-900 mb-4">
                Instant Property Valuation Pre-Check
              </h2>
              <p className="text-navy-500 font-body leading-relaxed mb-6">
                When you submit a deal, our AI appraisal engine automatically runs a conservative,
                lender-grade valuation analysis. You get a value range, confidence score, and risk
                flags — before you even talk to a lender.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: TrendingUp,
                    title: 'As-Is & Stabilized Value Ranges',
                    desc: 'Low / mid / high estimates using income, sales comparison, and cost approaches.',
                  },
                  {
                    icon: Shield,
                    title: 'Confidence Score & Risk Flags',
                    desc: 'Know where your deal stands before submission. Conservative, lender-first output.',
                  },
                  {
                    icon: AlertTriangle,
                    title: 'Credit Committee Notes',
                    desc: 'Internal-grade analysis notes you can use when packaging the deal for lenders.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                      <item.icon className="w-4.5 h-4.5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-sans font-semibold text-navy-900">{item.title}</p>
                      <p className="text-sm text-navy-400 font-body">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="#form"
                className="btn-primary inline-flex items-center gap-2"
              >
                Submit a Deal for Analysis
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right – Visual */}
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 p-8 md:p-10 lg:p-12 flex items-center justify-center">
              <div className="w-full max-w-sm space-y-4">
                {/* Mock appraisal result card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10">
                  <p className="text-xs text-accent-light font-sans font-semibold uppercase tracking-wider mb-3">As-Is Value Range</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-sans font-bold text-white">$425,000</span>
                    <span className="text-sm text-navy-300 font-body">– $485,000</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-[72%] bg-accent rounded-full" />
                    </div>
                    <span className="text-xs text-navy-200 font-sans font-semibold">72% confidence</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10">
                  <p className="text-xs text-accent-light font-sans font-semibold uppercase tracking-wider mb-2">Key Metrics</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-navy-300 font-body">NOI Annual</p>
                      <p className="text-sm font-sans font-semibold text-white">$38,400</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-300 font-body">Implied Cap Rate</p>
                      <p className="text-sm font-sans font-semibold text-white">8.4%</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-300 font-body">Price / SqFt</p>
                      <p className="text-sm font-sans font-semibold text-white">$212</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-300 font-body">Methods Used</p>
                      <p className="text-sm font-sans font-semibold text-white">Income + Comps</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <p className="text-xs text-navy-200 font-sans font-semibold">Risk Flags (2)</p>
                  </div>
                  <p className="text-xs text-navy-400 font-body leading-relaxed">
                    Limited recent comps within 0.5 mi • Vacancy data from 2024 Q3
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
