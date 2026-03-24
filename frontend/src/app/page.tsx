import Image from 'next/image';
import Link from 'next/link';
import FundedDealsSection from '@/components/FundedDealsSection';
import TrustBar from '@/components/TrustBar';
import TestimonialsSection from '@/components/TestimonialsSection';
import InlineLeadCapture from '@/components/InlineLeadCapture';

const LANES = [
  {
    title: 'DSCR / Rental Loans',
    desc: 'Qualify on rental income alone. No tax returns, no W-2s. 1-4 units, portfolios, and STR properties.',
    href: '/dscr-loans',
    stats: 'Up to 80% LTV',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&h=400&fit=crop',
  },
  {
    title: 'Fix & Flip',
    desc: 'Short-term bridge financing for rehab projects. Purchase + renovation in one loan with draw schedules.',
    href: '/fix-and-flip',
    stats: 'Up to 90% LTC',
    image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&h=400&fit=crop',
  },
  {
    title: 'STR Loans',
    desc: 'Short-term rental financing using Airbnb and VRBO income. We normalize your revenue for DSCR.',
    href: '/str-loans',
    stats: 'STR income accepted',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
  },
  {
    title: 'Multifamily',
    desc: '5+ unit apartments, mixed-use, and small commercial. Full underwriting with Sponsor Brief analysis.',
    href: '/multifamily',
    stats: '$500K - $10M+',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=400&fit=crop',
  },
];

const STATS = [
  { value: '$14.5M+', label: 'Funded to Date' },
  { value: '18 Days', label: 'Avg Time to Close' },
  { value: '48 States', label: 'Lending Coverage' },
  { value: '95%+', label: 'Scenario Approval Rate' },
];

const STEPS = [
  { num: '01', title: 'Submit Your Scenario', desc: 'Fill out a quick form with your deal numbers. Takes under 2 minutes.' },
  { num: '02', title: 'AI-Powered Analysis', desc: 'Our Scenario Desk scores your deal, calculates DSCR, and matches lenders instantly.' },
  { num: '03', title: 'Term Sheet in 24 Hours', desc: 'We send you a term sheet or restructuring options within one business day.' },
  { num: '04', title: 'Close & Fund', desc: 'We manage the process from application through funding. Most deals close in 14-21 days.' },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero: Split layout with property images ────────── */}
      <section className="bg-white border-b border-navy-100">
        <div className="mx-auto max-w-content px-6 py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left: Copy */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-display font-sans font-bold text-navy-900 leading-tight">
                Fund your next deal<br />in 14 days.
              </h1>
              <p className="mt-6 text-lg text-navy-500 font-body leading-relaxed max-w-lg">
                818 Capital is a direct investment property lender. We fund DSCR rentals, fix-and-flip, short-term rental, and multifamily deals with speed, certainty, and AI-powered underwriting — no middlemen, no runaround.
              </p>
              <p className="mt-4 text-base text-navy-700 font-body italic leading-relaxed max-w-lg">
                The question isn&apos;t how many deals you&apos;ve done — it&apos;s how many you could do, with the right partner.
              </p>

              <p className="mt-8 text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent">
                Direct Lender. 4 Programs. One Call.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-lg font-sans font-bold text-navy-900">
                <Link href="/dscr-loans" className="hover:text-accent transition">DSCR</Link>
                <span className="text-navy-300">|</span>
                <Link href="/fix-and-flip" className="hover:text-accent transition">Fix &amp; Flip</Link>
                <span className="text-navy-300">|</span>
                <Link href="/str-loans" className="hover:text-accent transition">STR</Link>
                <span className="text-navy-300">|</span>
                <Link href="/multifamily" className="hover:text-accent transition">Multifamily</Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/dscr-loans#form" className="btn-primary">
                  Run the Calculator
                </Link>
                <Link href="/broker-program" className="btn-secondary">
                  Broker Program
                </Link>
              </div>
            </div>

            {/* Right: Property images with loan badges */}
            <div className="relative hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                {/* Top - Long Island rental */}
                <div className="relative col-span-2 h-56 rounded-2xl overflow-hidden shadow-lg">
                  <Image src="https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=700&h=400&fit=crop" alt="Long Island rental investment property" fill className="object-cover" priority />
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-full px-4 py-1.5 shadow-md">
                    <span className="text-xs font-body text-navy-500">DSCR Rental, Long Island / </span>
                    <span className="text-sm font-sans font-bold text-accent">$825,000</span>
                  </div>
                </div>
                {/* Bottom left - fixer upper */}
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                  <Image src="https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400&h=350&fit=crop" alt="Older single-family home — fix and flip candidate" fill className="object-cover" />
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-full px-3 py-1 shadow-md">
                    <span className="text-xs font-body text-navy-500">Fix &amp; Flip, Miami / </span>
                    <span className="text-sm font-sans font-bold text-accent">$285,000</span>
                  </div>
                </div>
                {/* Bottom right - STR with pool */}
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                  <Image src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=350&fit=crop" alt="Airbnb vacation rental with pool" fill className="object-cover" />
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-full px-3 py-1 shadow-md">
                    <span className="text-xs font-body text-navy-500">STR, Scottsdale / </span>
                    <span className="text-sm font-sans font-bold text-accent">$615,000</span>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-accent text-white rounded-full px-4 py-2 shadow-lg z-10">
                <span className="text-xs font-sans font-bold">Close in 14-21 Days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ──────────────────────────────────────── */}
      <TrustBar />

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <section className="bg-white border-b border-navy-100">
        <div className="mx-auto max-w-content px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-sans font-bold text-navy-900">{s.value}</p>
                <p className="mt-2 text-sm text-navy-500 font-body">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Loan Programs with images ─────────────────────── */}
      <section className="bg-navy-50/50 py-20">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading">Loan Programs</h2>
            <p className="section-subheading mx-auto mt-4">
              Four specialized programs. One relationship. We match every deal to the right product, lender, and structure.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {LANES.map((lane) => (
              <Link key={lane.href} href={lane.href} className="group rounded-lg border border-navy-100 bg-white shadow-sm transition hover:shadow-md overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={lane.image}
                    alt={lane.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-h4 text-navy-900 group-hover:text-accent transition">{lane.title}</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-navy-300 group-hover:text-accent transition group-hover:translate-x-1 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-navy-500 font-body leading-relaxed">{lane.desc}</p>
                  <p className="mt-4 text-xs font-sans font-semibold text-accent uppercase tracking-wide">{lane.stats}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading">How It Works</h2>
            <p className="section-subheading mx-auto mt-4">
              From scenario to funded — a streamlined process powered by technology.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.num} className="relative pl-16">
                <span className="absolute left-0 top-0 text-5xl font-sans font-bold text-navy-100">{s.num}</span>
                <h3 className="text-h4 text-navy-900 mb-2">{s.title}</h3>
                <p className="text-sm text-navy-500 font-body leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── Recently Funded Deals ─────────────────────────── */}
      <FundedDealsSection />

      {/* ── Why 818 with image ────────────────────────────── */}
      <section className="bg-navy-50/50 py-20">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div>
              <h2 className="section-heading">Why 818 Capital</h2>
              <p className="mt-4 text-navy-500 font-body leading-relaxed">
                We combine institutional lending relationships with AI-powered analysis to deliver faster, more certain outcomes for real estate investors and brokers.
              </p>
              <div className="mt-8 space-y-6">
                {[
                  { title: 'Speed', desc: 'AI triage means answers in minutes, not days. Most deals close in 14-21 days.' },
                  { title: 'Flexibility', desc: 'No tax returns for DSCR. No W-2s. We qualify on the property and the numbers.' },
                  { title: 'Transparency', desc: 'We explain every number, every option. No jargon. No surprises at closing.' },
                  { title: 'Technology', desc: 'Our AI Scenario Desk, Flip Lab, and STR Signal give you institutional-grade analysis instantly.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-1 bg-accent rounded-full flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-sans font-semibold text-navy-900">{item.title}</h4>
                      <p className="text-sm text-navy-500 font-body mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop"
                alt="Los Angeles downtown skyline"
                width={800}
                height={600}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-accent-light mb-2">Our Commitment</p>
                <h3 className="text-h3 text-white mb-3">Straightforward Communication</h3>
                <p className="text-sm text-navy-100 font-body leading-relaxed">
                  Every deal gets a clear, honest assessment. If it works, we move fast. If it doesn&apos;t, we tell you what to fix.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lead Magnet ─────────────────────────────────── */}
      <section className="bg-white py-4">
        <div className="mx-auto max-w-content px-6">
          <InlineLeadCapture />
        </div>
      </section>

      {/* ── CTA with background ───────────────────────────── */}
      <section className="relative py-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1920&h=600&fit=crop"
          alt="Miami skyline at dusk"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-accent/90" />
        <div className="relative mx-auto max-w-content px-6 text-center">
          <h2 className="text-h2 text-white font-sans">Ready to Run Your Numbers?</h2>
          <p className="mt-4 text-lg text-white/80 font-body font-light">
            Submit your deal scenario and get an AI-powered analysis with lender matches.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/dscr-loans#form" className="btn-white">
              Submit a Scenario
            </Link>
            <a href="tel:+19179939194" className="inline-flex items-center justify-center rounded border-2 border-white/40 px-8 py-3 text-sm font-sans font-semibold text-white transition hover:bg-white/10 uppercase tracking-wide">
              Call (917) 993-9194
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
