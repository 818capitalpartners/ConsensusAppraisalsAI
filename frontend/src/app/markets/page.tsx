import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import USMap from '@/components/USMap';

export const metadata: Metadata = {
  title: 'Where We Lend | 818 Capital',
  description: 'Investor real estate financing across 48 states. DSCR, fix & flip, STR, and multifamily loans in NYC, Miami, Dallas, Phoenix, Atlanta, Nashville, and more — with local-market underwriting.',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.818capitalpartners.com/' },
    { '@type': 'ListItem', position: 2, name: 'Where We Lend', item: 'https://www.818capitalpartners.com/markets' },
  ],
};

const FEATURED_MARKETS = [
  { city: 'New York', state: 'NY', desc: 'NYC metro, Long Island, Westchester, Hudson Valley. DSCR, multifamily, STR.', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=400&fit=crop' },
  { city: 'Miami', state: 'FL', desc: 'Miami-Dade, Broward, Palm Beach. STR, DSCR, fix & flip.', image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=600&h=400&fit=crop' },
  { city: 'Dallas', state: 'TX', desc: 'DFW metroplex, Fort Worth, Arlington. DSCR, multifamily, bridge.', image: 'https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=600&h=400&fit=crop' },
  { city: 'Los Angeles', state: 'CA', desc: 'LA County, Orange County, Inland Empire. All product lanes.', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=400&fit=crop' },
  { city: 'Phoenix', state: 'AZ', desc: 'Phoenix, Scottsdale, Mesa, Tempe. Strong rental demand, STR-friendly, growing multifamily.', image: 'https://images.unsplash.com/photo-1639511919308-7c3f739812ba?w=600&h=400&fit=crop' },
  { city: 'Atlanta', state: 'GA', desc: 'Metro Atlanta, Marietta, Decatur. DSCR, fix & flip, bridge.', image: 'https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=600&h=400&fit=crop' },
];

const REGIONS = [
  { name: 'Northeast', states: 'NY, NJ, CT, MA, PA, MD, VA, DC' },
  { name: 'Southeast', states: 'FL, GA, NC, SC, TN, AL' },
  { name: 'Midwest', states: 'OH, IL, IN, MI, MO, MN, WI' },
  { name: 'Southwest', states: 'TX, AZ, NM, NV, CO' },
  { name: 'West Coast', states: 'CA, OR, WA' },
  { name: 'Mountain', states: 'UT, ID, MT, WY' },
];

export default function MarketsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Hero */}
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">Where We Lend</p>
          <h1 className="text-h1 text-white max-w-2xl">Nationwide Coverage, Local Expertise</h1>
          <p className="mt-4 text-lg text-navy-200 font-body font-light max-w-xl leading-relaxed">
            We finance investment properties across 48 states through our institutional capital programs. Active in every major market.
          </p>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-10">
            <h2 className="section-heading">Our Active Markets</h2>
            <p className="section-subheading mx-auto mt-4">Hover or tap a market to see what we finance there.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <USMap />
          </div>
        </div>
      </section>

      {/* Featured Markets with images */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-10">Featured Markets</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_MARKETS.map((m) => (
              <div key={m.city} className="rounded-lg border border-navy-100 bg-white shadow-sm overflow-hidden">
                <div className="relative h-44">
                  <Image src={m.image} alt={m.city} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-h4 text-navy-900">{m.city}, {m.state}</h3>
                  <p className="mt-2 text-sm text-navy-500 font-body leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage by Region */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-4">Coverage by Region</h2>
          <p className="section-subheading mb-10">We lend in 48 states across all four product lanes.</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((r) => (
              <div key={r.name} className="card">
                <h3 className="text-h4 text-navy-900 mb-2">{r.name}</h3>
                <p className="text-sm text-navy-500 font-body">{r.states}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-h2 text-white font-sans">Don&apos;t See Your Market?</h2>
          <p className="mt-3 text-white/80 font-body">We likely still cover it. Submit your scenario and we&apos;ll confirm coverage in minutes.</p>
          <Link href="/dscr-loans#form" className="btn-white mt-6 inline-flex">Submit a Scenario</Link>
        </div>
      </section>
    </>
  );
}
