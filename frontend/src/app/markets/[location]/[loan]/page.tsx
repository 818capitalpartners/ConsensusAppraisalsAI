import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MARKETS } from '@/data/markets';
import { LOAN_PROGRAMS } from '@/data/loan-programs';
import { STATES } from '@/data/states';

type Params = { location: string; loan: string };

// ── Static params — builds every (market × loan) combo at build time ──
export async function generateStaticParams() {
  const combos: Params[] = [];
  for (const m of MARKETS) {
    for (const p of LOAN_PROGRAMS) {
      combos.push({ location: m.slug, loan: p.slug });
    }
  }
  return combos;
}

// ── Per-page metadata (SEO title + description + canonical) ──
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const market = MARKETS.find((m) => m.slug === params.location);
  const program = LOAN_PROGRAMS.find((p) => p.slug === params.loan);
  if (!market || !program) return { title: 'Market not found' };

  const title = `${program.displayName} in ${market.displayName}, ${market.state}`;
  const description = `${program.tagline} 818 Capital Partners arranges ${program.shortName}s for real estate investors across ${market.displayName} and the greater ${market.metro} market. ${program.leadIn}`;
  const url = `https://www.818capitalpartners.com/markets/${market.slug}/${program.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: '818 Capital Partners',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// ── Page ──
export default function MarketLoanPage({ params }: { params: Params }) {
  const market = MARKETS.find((m) => m.slug === params.location);
  const program = LOAN_PROGRAMS.find((p) => p.slug === params.loan);
  if (!market || !program) notFound();

  const otherPrograms = LOAN_PROGRAMS.filter((p) => p.slug !== program.slug);
  const otherMarkets = MARKETS.filter((m) => m.slug !== market.slug).slice(0, 6);

  // FAQ schema — per-page JSON-LD for rich results + AI citation
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Does 818 Capital offer ${program.shortName}s in ${market.displayName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. 818 Capital Partners arranges ${program.displayName} for investor properties throughout ${market.displayName} and the greater ${market.metro} market. ${program.leadIn}`,
        },
      },
      {
        '@type': 'Question',
        name: `What are typical ${program.shortName} terms in ${market.displayName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${program.termSummary}. ${program.ltvSummary}. Minimum credit score ${program.minCredit}. Typical close time: ${program.closeTime}. Qualification: ${program.qualifies}.`,
        },
      },
      {
        '@type': 'Question',
        name: `What ${market.displayName} neighborhoods do you lend in?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `We actively finance ${program.shortName}s across ${market.submarkets.join(', ')}, and other submarkets of ${market.metro}.`,
        },
      },
      {
        '@type': 'Question',
        name: `How fast can 818 Capital close a ${program.shortName} in ${market.displayName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Our typical close time for a ${program.displayName} is ${program.closeTime}. On urgent deals we\'ve closed faster — ask for a same-day term sheet.`,
        },
      },
    ],
  };

  // LocalBusiness / service-area schema for the specific market
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `${program.displayName} — ${market.displayName}, ${market.state}`,
    provider: { '@id': 'https://www.818capitalpartners.com/#organization' },
    description: program.description,
    areaServed: {
      '@type': 'City',
      name: market.displayName,
      containedInPlace: { '@type': 'State', name: market.stateName },
    },
    feesAndCommissionsSpecification: program.termSummary,
    url: `https://www.818capitalpartners.com/markets/${market.slug}/${program.slug}`,
  };

  type BreadcrumbItem = { '@type': 'ListItem'; position: number; name: string; item: string };
  const stateHub = STATES.find((s) => s.code === market.state);
  const breadcrumbItems: BreadcrumbItem[] = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.818capitalpartners.com/' },
    { '@type': 'ListItem', position: 2, name: 'Where We Lend', item: 'https://www.818capitalpartners.com/markets' },
  ];
  if (stateHub) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: stateHub.displayName,
      item: `https://www.818capitalpartners.com/markets/${stateHub.slug}`,
    });
  }
  breadcrumbItems.push({
    '@type': 'ListItem',
    position: breadcrumbItems.length + 1,
    name: `${market.displayName}, ${market.state}`,
    item: `https://www.818capitalpartners.com/markets/${market.slug}`,
  });
  breadcrumbItems.push({
    '@type': 'ListItem',
    position: breadcrumbItems.length + 1,
    name: program.displayName,
    item: `https://www.818capitalpartners.com/markets/${market.slug}/${program.slug}`,
  });
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">
            {market.displayName}, {market.state} · {program.displayName}
          </p>
          <h1 className="text-h1 text-white max-w-3xl">
            {program.displayName} in {market.displayName}
          </h1>
          <p className="mt-4 text-xl text-navy-200 font-body font-light max-w-2xl leading-relaxed">
            {program.leadIn}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dscr-loans#form" className="btn-primary">
              Submit a {market.displayName} Scenario
            </Link>
            <a href="tel:+19179939194" className="inline-flex items-center justify-center rounded border-2 border-white/40 px-5 py-2.5 text-sm font-sans font-semibold text-white transition hover:bg-white/10 uppercase tracking-wide">
              Call (917) 993-9194
            </a>
          </div>
        </div>
      </section>

      {/* ── Market Positioning ──────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="section-heading">Why {market.displayName} investors choose 818</h2>
            <p className="mt-4 text-lg text-navy-700 font-body leading-relaxed">
              {market.positioning}
            </p>
            <p className="mt-4 text-lg text-navy-700 font-body leading-relaxed">
              <strong>Our edge here:</strong> {market.localEdge}
            </p>
          </div>
          <aside className="rounded-lg border border-navy-100 bg-navy-50/60 p-6">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400">
              {market.displayName} snapshot
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-navy-500">Typical investor price</dt>
                <dd className="font-semibold text-navy-900">{market.typicalPriceRange}</dd>
              </div>
              <div>
                <dt className="text-navy-500">Typical rent band</dt>
                <dd className="font-semibold text-navy-900">{market.typicalRentRange}</dd>
              </div>
              <div>
                <dt className="text-navy-500">Active submarkets</dt>
                <dd className="font-semibold text-navy-900">{market.submarkets.join(' · ')}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* ── Program terms ────────────────────────────────── */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-8">
            {program.displayName}: {market.displayName} terms
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['Term', program.termSummary],
              ['Leverage', program.ltvSummary],
              ['Credit minimum', program.minCredit],
              ['Close time', program.closeTime],
              ['Qualification', program.qualifies],
              ['Ideal for', program.idealFor],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-navy-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400">{label}</p>
                <p className="mt-2 text-navy-800 font-body leading-relaxed">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ (matches JSON-LD FAQPage above) ─────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6 max-w-3xl">
          <h2 className="section-heading mb-8">Common questions — {market.displayName} {program.shortName}s</h2>
          <div className="space-y-6">
            {faqSchema.mainEntity.map((q, i) => (
              <div key={i}>
                <h3 className="text-h4 text-navy-900">{q.name}</h3>
                <p className="mt-2 text-navy-700 font-body leading-relaxed">{q.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cross-sell other programs in this market ─────── */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-8">Other loan programs in {market.displayName}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherPrograms.map((p) => (
              <Link
                key={p.slug}
                href={`/markets/${market.slug}/${p.slug}`}
                className="rounded-lg border border-navy-100 bg-white p-6 shadow-sm hover:border-accent transition"
              >
                <h3 className="text-h5 text-navy-900">{p.displayName}</h3>
                <p className="mt-2 text-sm text-navy-600 font-body">{p.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other markets for this loan program ──────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-8">{program.displayName} in other markets</h2>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {otherMarkets.map((m) => (
              <Link
                key={m.slug}
                href={`/markets/${m.slug}/${program.slug}`}
                className="rounded border border-navy-100 bg-white p-4 text-sm font-semibold text-navy-800 hover:border-accent hover:text-accent transition"
              >
                {m.displayName}, {m.state}
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/markets" className="text-accent font-semibold hover:underline">
              See all 818 markets →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-h2 text-white">
            Ready to close your {market.displayName} deal?
          </h2>
          <p className="mt-4 text-navy-200 max-w-xl mx-auto">
            Submit a scenario. We\'ll come back with a real term sheet — not a teaser rate — within 24 hours.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/dscr-loans#form" className="btn-primary">Submit Scenario</Link>
            <a href="tel:+19179939194" className="inline-flex items-center justify-center rounded border-2 border-white/40 px-5 py-2.5 text-sm font-sans font-semibold text-white transition hover:bg-white/10 uppercase tracking-wide">
              Call (917) 993-9194
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
