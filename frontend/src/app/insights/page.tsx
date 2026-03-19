import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Industry Insights | 818 Capital',
  description: 'Market trends, rate updates, and real estate investment analysis from 818 Capital.',
};

const INSIGHTS = [
  {
    title: 'DSCR Rates Are Tightening — Here\'s What That Means for Investors',
    excerpt: 'With rates moving in Q1 2026, DSCR investors need to adjust their buy box. We break down current pricing and where deals still pencil.',
    category: 'Rates & Markets',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
  },
  {
    title: 'STR Regulation Tracker: What Changed in Miami, Nashville, and Austin',
    excerpt: 'Short-term rental regulations are evolving fast. Here\'s a snapshot of what passed, what\'s pending, and what it means for your portfolio.',
    category: 'Regulation',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&h=500&fit=crop',
  },
  {
    title: 'The 70% Rule Is Dead: How to Actually Analyze a Flip in 2026',
    excerpt: 'The classic rule of thumb doesn\'t account for today\'s carrying costs and market volatility. Here\'s a better framework.',
    category: 'Fix & Flip',
    date: 'February 2026',
    image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=500&fit=crop',
  },
  {
    title: 'Multifamily Cap Rates by Market: Q1 2026 Snapshot',
    excerpt: 'Cap rate compression is slowing in some markets and expanding in others. Here\'s where the value is for apartment investors.',
    category: 'Multifamily',
    date: 'February 2026',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop',
  },
];

export default function InsightsPage() {
  return (
    <>
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6">
          <h1 className="text-h1 text-white">Industry Insights</h1>
          <p className="mt-4 text-lg text-navy-200 font-body font-light max-w-xl">
            Market trends, rate updates, regulatory changes, and investment analysis.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {INSIGHTS.map((insight) => (
              <article key={insight.title} className="group rounded-lg border border-navy-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="relative h-56 overflow-hidden">
                  <Image src={insight.image} alt={insight.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-navy-900/80 text-white text-xs font-sans font-semibold uppercase tracking-wide px-3 py-1 rounded">{insight.category}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs text-navy-400 font-body mb-2">{insight.date}</p>
                  <h2 className="text-h4 text-navy-900 group-hover:text-accent transition mb-3">{insight.title}</h2>
                  <p className="text-sm text-navy-500 font-body leading-relaxed">{insight.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="section-heading">Stay Informed</h2>
          <p className="section-subheading mx-auto mt-4">
            Get weekly market updates, rate alerts, and investment insights delivered to your inbox.
          </p>
          <div className="mt-8 flex gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Your email address" className="input flex-1" />
            <button className="btn-primary whitespace-nowrap">Subscribe</button>
          </div>
          <p className="mt-3 text-xs text-navy-400 font-body">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </>
  );
}
