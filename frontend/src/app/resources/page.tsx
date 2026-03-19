import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resources | 818 Capital',
  description: 'Calculators, guides, and tools for real estate investors. DSCR calculator, flip analyzer, STR income tools.',
};

const CALCULATORS = [
  {
    title: 'DSCR Calculator',
    desc: 'Calculate your Debt Service Coverage Ratio instantly. Enter rent, PITI, and see if your deal qualifies.',
    href: '/dscr-loans#form',
    icon: '📊',
  },
  {
    title: 'Flip Lab Analyzer',
    desc: 'Run your fix & flip numbers at 100%, 95%, and 90% ARV. Know your profit margin before you offer.',
    href: '/fix-and-flip#form',
    icon: '🔨',
  },
  {
    title: 'STR Signal Tool',
    desc: 'Normalize your Airbnb/VRBO income into a conservative DSCR that lenders accept.',
    href: '/str-loans#form',
    icon: '🏖️',
  },
  {
    title: 'Sponsor Brief Generator',
    desc: 'Submit multifamily deal numbers and get an AI-generated underwriting memo in seconds.',
    href: '/multifamily#form',
    icon: '🏢',
  },
];

const GUIDES = [
  { title: 'DSCR Loans Explained', desc: 'Everything you need to know about qualifying on rental income.', href: '/dscr-loans', category: 'DSCR' },
  { title: 'Fix & Flip Financing Guide', desc: 'LTC, ARV, draw schedules, and how to structure a profitable flip.', href: '/fix-and-flip', category: 'Fix & Flip' },
  { title: 'STR Income Qualification', desc: 'How lenders evaluate Airbnb and VRBO income for mortgage qualification.', href: '/str-loans', category: 'STR' },
  { title: 'Multifamily Underwriting 101', desc: 'NOI, cap rate, DSCR, and debt yield — the metrics that matter.', href: '/multifamily', category: 'Multifamily' },
  { title: 'Where We Lend', desc: 'Our coverage map across 48 states and major metro markets.', href: '/markets', category: 'General' },
  { title: 'Broker Program Overview', desc: 'How to partner with 818 Capital and access our AI toolkit.', href: '/broker-program', category: 'Brokers' },
];

export default function ResourcesPage() {
  return (
    <>
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6">
          <h1 className="text-h1 text-white">Resources</h1>
          <p className="mt-4 text-lg text-navy-200 font-body font-light max-w-xl">
            Calculators, tools, and educational guides to help you make smarter investment decisions.
          </p>
        </div>
      </section>

      {/* Calculators */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-10">AI-Powered Calculators</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CALCULATORS.map((calc) => (
              <Link key={calc.title} href={calc.href} className="card group text-center">
                <span className="text-4xl block mb-4">{calc.icon}</span>
                <h3 className="text-h4 text-navy-900 group-hover:text-accent transition mb-2">{calc.title}</h3>
                <p className="text-sm text-navy-500 font-body leading-relaxed">{calc.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-10">Educational Guides</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((guide) => (
              <Link key={guide.title} href={guide.href} className="flex items-start gap-4 p-6 rounded-lg border border-navy-100 bg-white hover:shadow-md transition group">
                <div className="flex-1">
                  <span className="text-xs font-sans font-semibold text-accent uppercase tracking-wide">{guide.category}</span>
                  <h3 className="text-sm font-sans font-semibold text-navy-900 mt-1 group-hover:text-accent transition">{guide.title}</h3>
                  <p className="text-sm text-navy-500 font-body mt-1">{guide.desc}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-navy-300 group-hover:text-accent transition flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="section-heading">Need Help With a Specific Deal?</h2>
          <p className="section-subheading mx-auto mt-4">Submit your scenario and get a personalized analysis from our team.</p>
          <Link href="/dscr-loans#form" className="btn-primary mt-8 inline-flex">Submit a Scenario</Link>
        </div>
      </section>
    </>
  );
}
