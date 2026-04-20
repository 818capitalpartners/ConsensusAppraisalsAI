import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "A Letter from Our Founder | 818 Capital",
  description:
    "A letter from Ravi Punn on why he built 818 Capital — and how the decade of being told no by banks, then trapped by 15%-per-annum hard money, shaped the lender he always wished existed.",
};

export default function FoundersLetterPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.25em] text-accent-light text-center">
            A Letter from Our Founder
          </p>
          <h1 className="mt-4 text-3xl md:text-4xl font-sans font-bold leading-tight text-center">
            Why I built 818 Capital.
          </h1>
        </div>
      </section>

      {/* ── Letter ────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="prose prose-lg max-w-none font-body text-navy-700 leading-relaxed">
            <p className="text-xl leading-relaxed">
              In my mid-20s I was already developing and constructing properties. Multiple deals, multiple exits, a real track record.
            </p>

            <p className="mt-6">
              The banks and credit unions I walked into rejected me. Not on the deal — on my age.
            </p>

            <p className="mt-6">
              So I did what developers do when banks won&apos;t listen: I went to hard money. And I learned fast that private loans at <strong className="text-navy-900">15% per annum</strong> can out-earn the project itself — especially when re-zoning, a municipality, or a single delay triggers default terms designed to cripple the sponsor.
            </p>

            <p className="mt-6">
              I built through that for over ten years. Grit, tenacity, and deals that made sense got me through — not a capital stack designed to help me.
            </p>

            <p className="mt-10 text-2xl font-sans font-semibold text-navy-900 leading-snug border-l-4 border-accent pl-6 italic">
              Somewhere along the way I stopped waiting for the lender I wished existed. I built it.
            </p>

            <p className="mt-10">
              That&apos;s 818 Capital. We underwrite the project <strong className="text-navy-900">and</strong> the sponsor. We close in 14–21 days. We align for the long run — the second deal, the fifth, the tenth. And we don&apos;t write terms engineered to trap a borrower when timing slips.
            </p>

            <p className="mt-6">
              If a lender has ever told you no for a reason that had nothing to do with the deal — submit yours. We&apos;ll give you a real answer.
            </p>

            <p className="mt-12 text-sm font-sans font-semibold text-navy-900 not-italic">
              — Ravi Punn<br />
              <span className="text-navy-500 font-body font-normal">Founder, 818 Capital Partners</span>
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <Link href="/apply" className="btn-primary">
              Submit a Deal →
            </Link>
            <Link href="/about" className="btn-secondary">
              About 818 Capital
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
