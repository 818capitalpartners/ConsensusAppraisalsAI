import type { Metadata } from 'next';
import { Suspense } from 'react';
import ApplyForm from './ApplyForm';

export const metadata: Metadata = {
  title: 'Submit a Deal | 818 Capital',
  description:
    'Get a real answer in 90 seconds. Three steps for DSCR, fix & flip, STR, and multifamily investment property loans. Soft check only — no hit to credit, no SSN required.',
};

export default function ApplyPage() {
  return (
    <section className="bg-warm-bg min-h-screen">
      {/* Hairline letterhead-style top rule — institutional but warm */}
      <div className="border-t-2 border-gold" />

      <div className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-sans font-semibold uppercase tracking-wide3 text-gold">
            90 seconds · 3 steps · real answer
          </p>
          <h1 className="mt-4 text-3xl md:text-5xl font-sans font-bold text-warm-ink leading-[1.1]">
            Tell us about your deal.
          </h1>
          <div className="mx-auto mt-5 h-px w-12 bg-gold-line" />
          <p className="mt-5 text-base text-warm-ink/70 font-body max-w-xl mx-auto leading-relaxed">
            We underwrite the project <em className="not-italic font-semibold text-warm-ink">and</em> the sponsor.
            Soft check only — no hit to your credit, no SSN required.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-soft border border-gold-line/60 shadow-whisper p-10 text-center text-warm-ink/50 font-body">
              Loading…
            </div>
          }
        >
          <ApplyForm />
        </Suspense>

        <p className="mt-10 text-center text-xs text-warm-ink/50 font-body">
          <span className="inline-block w-1 h-1 rounded-full bg-gold mr-2 align-middle" />
          Secure · Reviewed by a founder-led team · Reply within 2 business hours
        </p>
      </div>
    </section>
  );
}
