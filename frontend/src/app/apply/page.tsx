import type { Metadata } from 'next';
import { Suspense } from 'react';
import ApplyForm from './ApplyForm';

export const metadata: Metadata = {
  title: 'Submit a Deal | 818 Capital',
  description:
    'Get a real answer in 30 seconds. Universal deal intake for DSCR, fix & flip, STR, and multifamily investment property loans. Soft check only — no hit to credit, no SSN required.',
};

export default function ApplyPage() {
  return (
    <section className="bg-navy-50/40 min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <div className="text-center mb-10">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.25em] text-accent">
            90 seconds · 3 steps · real answer
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-sans font-bold text-navy-900 leading-tight">
            Tell us about your deal.
          </h1>
          <p className="mt-4 text-base text-navy-500 font-body max-w-xl mx-auto">
            We underwrite the project <em className="not-italic font-semibold text-navy-700">and</em> the sponsor. Soft check only — no hit to your credit, no SSN required.
          </p>
        </div>

        <Suspense fallback={<div className="bg-white rounded-xl p-10 shadow-sm border border-navy-100 text-center text-navy-500">Loading…</div>}>
          <ApplyForm />
        </Suspense>

        <p className="mt-8 text-center text-xs text-navy-400 font-body">
          🔒 Secure. Reviewed by a founder-led team. We&apos;ll call you within 2 business hours.
        </p>
      </div>
    </section>
  );
}
