import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MARKETS } from '@/data/markets';
import { LOAN_PROGRAMS } from '@/data/loan-programs';
import type { StateHub as StateHubData } from '@/data/states';
import { STATES, getStateBySlug, getCitiesInState } from '@/data/states';

type Params = { location: string };

/**
 * This route resolves to one of two page kinds based on the slug:
 *   1. A STATE hub  (e.g. /markets/new-york) — aggregates cities + programs
 *   2. A CITY hub   (e.g. /markets/brooklyn) — lists all loan programs in that city
 * Anything else 404s.
 */
export async function generateStaticParams() {
  const stateSlugs = STATES.map((s) => ({ location: s.slug }));
  const citySlugs = MARKETS.map((m) => ({ location: m.slug }));
  return [...stateSlugs, ...citySlugs];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { location } = await params;
  const state = getStateBySlug(location);
  if (state) {
    const cities = getCitiesInState(state.code);
    const title = `Investment Property Loans in ${state.displayName}`;
    const description = `818 Capital arranges DSCR, fix & flip, STR, multifamily, bridge, and construction loans across ${state.displayName} — active in ${cities.map((c) => c.displayName).join(', ')}.`;
    return {
      title,
      description,
      alternates: { canonical: `https://www.818capitalpartners.com/markets/${state.slug}` },
      openGraph: { type: 'website', url: `https://www.818capitalpartners.com/markets/${state.slug}`, title, description, siteName: '818 Capital Partners' },
    };
  }

  const market = MARKETS.find((m) => m.slug === location);
  if (market) {
    const title = `Investment Property Loans in ${market.displayName}, ${market.state}`;
    const description = `${market.positioning} Loan programs available in ${market.displayName}: DSCR, fix & flip, STR, multifamily, bridge, and construction.`;
    return {
      title,
      description,
      alternates: { canonical: `https://www.818capitalpartners.com/markets/${market.slug}` },
      openGraph: { type: 'website', url: `https://www.818capitalpartners.com/markets/${market.slug}`, title, description, siteName: '818 Capital Partners' },
    };
  }

  return { title: 'Market not found | 818 Capital' };
}

export default async function MarketHubPage({ params }: { params: Promise<Params> }) {
  const { location } = await params;
  const state = getStateBySlug(location);
  if (state) return <StateHub state={state} />;

  const market = MARKETS.find((m) => m.slug === location);
  if (market) return <CityHub marketSlug={market.slug} />;

  notFound();
}

// ─────────────────────────────────────────────────────────────────
// State hub
// ─────────────────────────────────────────────────────────────────
function StateHub({ state }: { state: StateHubData }) {
  const cities = getCitiesInState(state.code);
  const url = `https://www.818capitalpartners.com/markets/${state.slug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.818capitalpartners.com/' },
      { '@type': 'ListItem', position: 2, name: 'Where We Lend', item: 'https://www.818capitalpartners.com/markets' },
      { '@type': 'ListItem', position: 3, name: state.displayName, item: url },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `Investment Property Loans — ${state.displayName}`,
    provider: { '@id': 'https://www.818capitalpartners.com/#organization' },
    description: state.positioning,
    areaServed: { '@type': 'State', name: state.displayName, identifier: state.code },
    url,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">
            Where We Lend · {state.displayName}
          </p>
          <h1 className="text-h1 text-white max-w-3xl">
            Investment Property Loans in {state.displayName}
          </h1>
          <p className="mt-4 text-xl text-navy-200 font-body font-light max-w-3xl leading-relaxed">
            {state.positioning}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dscr-loans#form" className="btn-primary">Submit a {state.displayName} Scenario</Link>
            <a href="tel:+19179939194" className="inline-flex items-center justify-center rounded border-2 border-white/40 px-5 py-2.5 text-sm font-sans font-semibold text-white transition hover:bg-white/10 uppercase tracking-wide">
              Call (917) 993-9194
            </a>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-8">{state.displayName} markets we cover</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/markets/${c.slug}`}
                className="rounded-lg border border-navy-100 bg-white p-6 shadow-sm hover:border-accent transition"
              >
                <h3 className="text-h5 text-navy-900">{c.displayName}</h3>
                <p className="text-xs text-navy-400 font-body mt-1">{c.metro}</p>
                <p className="mt-3 text-sm text-navy-600 font-body leading-relaxed">
                  Typical investor price: <strong>{c.typicalPriceRange}</strong>
                </p>
                <p className="text-sm text-navy-600 font-body">
                  Rent band: <strong>{c.typicalRentRange}</strong>
                </p>
                <p className="text-xs text-accent font-sans font-semibold mt-3">Submarkets: {c.submarkets.join(', ')}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-8">Loan programs available across {state.displayName}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {LOAN_PROGRAMS.map((p) => (
              <div key={p.slug} className="rounded-lg border border-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-h5 text-navy-900">{p.displayName}</h3>
                <p className="mt-2 text-sm text-navy-500 font-body">{p.tagline}</p>
                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-navy-500">
                  <span>Term</span><span className="text-navy-800 font-medium">{p.termSummary}</span>
                  <span>Leverage</span><span className="text-navy-800 font-medium">{p.ltvSummary}</span>
                  <span>Credit</span><span className="text-navy-800 font-medium">{p.minCredit}</span>
                  <span>Close</span><span className="text-navy-800 font-medium">{p.closeTime}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {cities.slice(0, 3).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/markets/${c.slug}/${p.slug}`}
                      className="text-[11px] font-sans font-semibold text-accent hover:underline"
                    >
                      {c.displayName} →
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-h2 text-white">Ready to close your {state.displayName} deal?</h2>
          <p className="mt-4 text-navy-200 max-w-xl mx-auto">
            Submit a scenario. Real term sheet within 24 hours.
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

// ─────────────────────────────────────────────────────────────────
// City hub — fills the missing /markets/[city] level
// ─────────────────────────────────────────────────────────────────
function CityHub({ marketSlug }: { marketSlug: string }) {
  const market = MARKETS.find((m) => m.slug === marketSlug)!;
  const url = `https://www.818capitalpartners.com/markets/${market.slug}`;
  const state = STATES.find((s) => s.code === market.state);

  type BreadcrumbItem = { '@type': 'ListItem'; position: number; name: string; item: string };
  const breadcrumbItems: BreadcrumbItem[] = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.818capitalpartners.com/' },
    { '@type': 'ListItem', position: 2, name: 'Where We Lend', item: 'https://www.818capitalpartners.com/markets' },
  ];
  if (state) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: state.displayName,
      item: `https://www.818capitalpartners.com/markets/${state.slug}`,
    });
  }
  breadcrumbItems.push({
    '@type': 'ListItem',
    position: breadcrumbItems.length + 1,
    name: `${market.displayName}, ${market.state}`,
    item: url,
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `Investment Property Loans — ${market.displayName}, ${market.state}`,
    provider: { '@id': 'https://www.818capitalpartners.com/#organization' },
    description: market.positioning,
    areaServed: { '@type': 'City', name: market.displayName, containedInPlace: { '@type': 'State', name: market.stateName } },
    url,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">
            {market.metro} · {market.displayName}, {market.state}
          </p>
          <h1 className="text-h1 text-white max-w-3xl">
            Investment Property Loans in {market.displayName}
          </h1>
          <p className="mt-4 text-xl text-navy-200 font-body font-light max-w-3xl leading-relaxed">
            {market.positioning}
          </p>
          <p className="mt-4 text-navy-200 font-body max-w-3xl">
            <strong>Our edge here:</strong> {market.localEdge}
          </p>
        </div>
      </section>

      {/* Programs in this city */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-8">Loan programs available in {market.displayName}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {LOAN_PROGRAMS.map((p) => (
              <Link
                key={p.slug}
                href={`/markets/${market.slug}/${p.slug}`}
                className="rounded-lg border border-navy-100 bg-white p-6 shadow-sm hover:border-accent transition"
              >
                <h3 className="text-h5 text-navy-900">{p.displayName}</h3>
                <p className="mt-2 text-sm text-navy-500 font-body">{p.tagline}</p>
                <p className="mt-4 text-sm text-accent font-sans font-semibold">See {market.displayName} terms →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <aside className="bg-navy-50/50 py-12">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-6">{market.displayName} market snapshot</h2>
          <dl className="grid gap-6 md:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-navy-400 font-sans font-semibold">Typical investor price</dt>
              <dd className="mt-2 text-lg font-semibold text-navy-900">{market.typicalPriceRange}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-navy-400 font-sans font-semibold">Typical rent band</dt>
              <dd className="mt-2 text-lg font-semibold text-navy-900">{market.typicalRentRange}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-navy-400 font-sans font-semibold">Active submarkets</dt>
              <dd className="mt-2 text-lg font-semibold text-navy-900">{market.submarkets.join(' · ')}</dd>
            </div>
          </dl>
        </div>
      </aside>

      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-h2 text-white">Ready to close your {market.displayName} deal?</h2>
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
