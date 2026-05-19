import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import FUNDED_DEALS from '@/data/fundedDeals';

type Params = { id: string };

export async function generateStaticParams() {
  return FUNDED_DEALS.map((d) => ({ id: String(d.id) }));
}

function findDeal(id: string) {
  const numeric = Number(id);
  if (!Number.isFinite(numeric)) return undefined;
  return FUNDED_DEALS.find((d) => d.id === numeric);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const deal = findDeal(id);
  if (!deal) return { title: 'Deal not found | 818 Capital' };

  const title = `${deal.propertyType} in ${deal.city}, ${deal.state} — ${deal.loanType} (${deal.dealValue})`;
  const description = `Closed by 818 Capital Partners: ${deal.dealValue} ${deal.loanType.toLowerCase()} on a ${deal.propertyType.toLowerCase()} in ${deal.city}, ${deal.state}. ${deal.program}.`;
  const url = `https://www.818capitalpartners.com/closed-deals/${deal.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [{ url: deal.image, alt: `${deal.propertyType} in ${deal.city}, ${deal.state}` }],
      siteName: '818 Capital Partners',
    },
    twitter: { card: 'summary_large_image', title, description, images: [deal.image] },
  };
}

export default async function ClosedDealPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const deal = findDeal(id);
  if (!deal) notFound();

  const url = `https://www.818capitalpartners.com/closed-deals/${deal.id}`;
  const headline = `${deal.propertyType} in ${deal.city}, ${deal.state} — ${deal.loanType}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.818capitalpartners.com/' },
      { '@type': 'ListItem', position: 2, name: 'Closed Deals', item: 'https://www.818capitalpartners.com/closed-deals' },
      { '@type': 'ListItem', position: 3, name: headline, item: url },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description: `${deal.dealValue} ${deal.loanType} closed in ${deal.city}, ${deal.state}.`,
    image: [deal.image],
    author: { '@id': 'https://www.818capitalpartners.com/about#ravipunn' },
    publisher: { '@id': 'https://www.818capitalpartners.com/#organization' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'en-US',
  };

  // Related: prefer same loan type, then same state
  const related = FUNDED_DEALS.filter(
    (d) => d.id !== deal.id && (d.loanType === deal.loanType || d.state === deal.state)
  ).slice(0, 3);

  const terms: [string, string][] = [
    ['Property type', deal.propertyType],
    ['Location', `${deal.city}, ${deal.state}`],
    ['Loan type', deal.loanType],
    ['Program', deal.program],
    ['Leverage', deal.ltv],
    ['Rate', deal.rate],
    ['Deal value', deal.dealValue],
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* Hero */}
      <section className="relative min-h-[340px] flex items-end overflow-hidden">
        <Image
          src={deal.image}
          alt={`${deal.propertyType} in ${deal.city}, ${deal.state}`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/95 via-navy-900/70 to-navy-900/30" />
        <div className="relative mx-auto max-w-content px-6 py-12 w-full">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-3">
            Closed Deal · #{deal.id}
          </p>
          <h1 className="text-h1 text-white max-w-3xl">{headline}</h1>
          <p className="mt-4 text-lg text-navy-100 font-body font-light">
            {deal.dealValue} · {deal.program}
          </p>
        </div>
      </section>

      {/* Terms */}
      <section className="bg-white py-12 border-b border-navy-100">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="section-heading mb-6">Deal terms</h2>
          <dl className="divide-y divide-navy-100 border border-navy-100 rounded-lg overflow-hidden">
            {terms.map(([label, value]) => (
              <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-5 py-3 bg-white">
                <dt className="text-sm text-navy-500 font-body">{label}</dt>
                <dd className="sm:col-span-2 text-sm font-semibold text-navy-900 font-body">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Analysis */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="section-heading mb-6">How we structured it</h2>
          {deal.analysis.split('\n\n').map((para, i) => (
            <p key={i} className="text-navy-700 font-body leading-relaxed mb-4">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-navy-50/50 py-12">
          <div className="mx-auto max-w-content px-6">
            <h2 className="section-heading mb-8">Related closed deals</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((d) => (
                <Link
                  key={d.id}
                  href={`/closed-deals/${d.id}`}
                  className="group rounded-lg border border-navy-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={d.image}
                      alt={`${d.propertyType} in ${d.city}, ${d.state}`}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-accent font-sans font-semibold uppercase tracking-wide">{d.loanType}</p>
                    <h3 className="mt-1 text-sm font-sans font-semibold text-navy-900 group-hover:text-accent transition">
                      {d.propertyType} · {d.city}, {d.state}
                    </h3>
                    <p className="mt-1 text-xs text-navy-500 font-body">{d.dealValue} · {d.program}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/closed-deals" className="text-accent font-sans font-semibold hover:underline">
                See all {FUNDED_DEALS.length} closed deals →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-navy-900 py-14">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-h2 text-white">Have a {deal.loanType} deal we should look at?</h2>
          <p className="mt-3 text-navy-200 max-w-xl mx-auto font-body">
            Submit your scenario. We&apos;ll come back with a real term sheet — not a teaser rate — within 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/dscr-loans#form" className="btn-primary">Submit a Scenario</Link>
            <a href="tel:+19179939194" className="inline-flex items-center justify-center rounded border-2 border-white/40 px-8 py-3 text-sm font-sans font-semibold text-white transition hover:bg-white/10 uppercase tracking-wide">
              Call (917) 993-9194
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
