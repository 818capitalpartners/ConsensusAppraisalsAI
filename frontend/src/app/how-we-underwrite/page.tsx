import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "How We Underwrite | 818 Capital",
  description:
    "818 Capital underwrites the project and the sponsor. AI-powered analysis, 12+ institutional capital programs, and founder-led decisioning on every file.",
};

const PILLARS = [
  {
    eyebrow: 'AI UNDERWRITING',
    title: 'Lender-grade analysis in 60 seconds.',
    body: 'Our proprietary Scenario Desk, Flip Lab, STR Signal, and Sponsor Brief engines score every deal on the same metrics institutional credit committees use: DSCR, LTV, LTC, ARV spread, debt yield, cap rate. No templates. No guesswork. The math is done before a human opens your file.',
    stats: [
      { v: '60s', l: 'AI triage' },
      { v: '1000s', l: 'Data points per deal' },
      { v: 'Lender-grade', l: 'Valuation output' },
    ],
  },
  {
    eyebrow: 'INSTITUTIONAL CAPITAL',
    title: '12+ capital programs. One intake.',
    body: 'Every deal is routed to the best-fit program across our institutional capital network — DSCR rentals, fix-and-flip bridges, STR loans, multifamily, ground-up, bridge, and portfolio lines. You submit once. We match to the lender, structure, and term that works for the deal — not the one that pays us most.',
    stats: [
      { v: '12+', l: 'Capital programs' },
      { v: '48', l: 'States covered' },
      { v: '$500K–$10M+', l: 'Deal size range' },
    ],
  },
  {
    eyebrow: 'FOUNDER-LED DECISIONS',
    title: 'A decision-maker on every file.',
    body: 'No LO handoffs. No voicemail chains. No "I\'ll have to check with underwriting." When judgment is required — a re-zoning delay, a comp exception, a timing call — the person making the call is the person you first talked to. This is the operational advantage of a principal-led firm.',
    stats: [
      { v: '14–21', l: 'Day close' },
      { v: '24hr', l: 'Term sheet' },
      { v: '100%', l: 'Principal-touched' },
    ],
  },
];

const PROCESS = [
  { step: '01', title: 'Submit', desc: 'Tell us about the deal — 90 seconds, no SSN, no hard pull.' },
  { step: '02', title: 'AI triage', desc: 'Scenario Desk scores the deal on DSCR, LTV, ARV, and margin. Real answer in 30 seconds.' },
  { step: '03', title: 'Program match', desc: 'We route to the best-fit capital program across our 12+ institutional relationships.' },
  { step: '04', title: 'Term sheet', desc: 'Written term sheet with rate, fees, and structure — within 24 hours.' },
  { step: '05', title: 'Close & fund', desc: 'Appraisal, title, insurance coordinated by our team. Typical close: 14–21 days.' },
];

export default function HowWeUnderwritePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-content px-6 py-20 md:py-28 text-center">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.25em] text-accent-light">
            How We Underwrite
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-sans font-bold leading-tight max-w-3xl mx-auto">
            We evaluate the project <em className="not-italic text-accent-light">and</em> the sponsor.
          </h1>
          <p className="mt-6 text-lg text-navy-300 font-body leading-relaxed max-w-2xl mx-auto">
            Not a checklist. Not a template. Institutional math plus principal judgment — on every file.
          </p>
        </div>
      </section>

      {/* ── Three Pillars ─────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-content px-6 space-y-20">
          {PILLARS.map((p, i) => (
            <div key={p.eyebrow} className={`grid gap-12 lg:grid-cols-2 items-center ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <div>
                <p className="text-xs font-sans font-semibold uppercase tracking-[0.25em] text-accent">{p.eyebrow}</p>
                <h2 className="mt-3 text-3xl md:text-4xl font-sans font-bold text-navy-900 leading-tight">{p.title}</h2>
                <p className="mt-5 text-navy-500 font-body leading-relaxed">{p.body}</p>
              </div>
              <div className="grid grid-cols-3 gap-6 border-y border-navy-100 py-8">
                {p.stats.map((s) => (
                  <div key={s.l} className="text-center">
                    <p className="text-2xl md:text-3xl font-sans font-bold text-navy-900 tabular-nums">{s.v}</p>
                    <p className="mt-2 text-xs text-navy-500 font-body uppercase tracking-wide">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────── */}
      <section className="bg-navy-50/50 py-20">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading">The process, start to fund.</h2>
            <p className="section-subheading mx-auto mt-4">
              Most deals close in 14–21 days. Here&apos;s what each stage looks like.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 max-w-5xl mx-auto">
            {PROCESS.map((s) => (
              <div key={s.step} className="rounded-lg bg-white p-6 border border-navy-100 shadow-sm">
                <span className="text-3xl font-sans font-bold text-navy-100 block mb-3">{s.step}</span>
                <h3 className="text-sm font-sans font-bold text-navy-900 mb-2">{s.title}</h3>
                <p className="text-xs text-navy-500 font-body leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-accent py-20">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-white leading-tight">
            Have a deal? We&apos;ll tell you in 30 seconds.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/apply" className="btn-white">Submit a Deal →</Link>
            <a
              href="tel:+19179939194"
              className="inline-flex items-center justify-center rounded border-2 border-white/40 px-8 py-3 text-sm font-sans font-semibold text-white transition hover:bg-white/10 uppercase tracking-wide"
            >
              Call (917) 993-9194
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
