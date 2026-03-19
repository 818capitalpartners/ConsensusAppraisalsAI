import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For Professionals | 818 Capital',
  description: 'Tools, programs, and resources for mortgage brokers, loan officers, and real estate professionals.',
};

const TOOLS = [
  {
    title: 'AI Scenario Desk',
    desc: 'Run any DSCR, flip, STR, or multifamily deal through our AI. Get a score, lender fit, and term sheet estimate in seconds.',
    cta: 'Run a Scenario',
    href: '/dscr-loans#form',
  },
  {
    title: 'Flip Lab',
    desc: 'Analyze fix & flip profitability at three ARV scenarios. Know your max LTC and profit margins before you bid.',
    cta: 'Analyze a Flip',
    href: '/fix-and-flip#form',
  },
  {
    title: 'STR Signal',
    desc: 'Normalize Airbnb and VRBO income into lender-ready DSCR calculations. Accounts for seasonality and occupancy.',
    cta: 'Run STR Numbers',
    href: '/str-loans#form',
  },
  {
    title: 'Sponsor Brief',
    desc: 'Submit a multifamily deal and receive a full underwriting memo — NOI, DSCR, debt yield, cap rate, and best financing path.',
    cta: 'Get a Brief',
    href: '/multifamily#form',
  },
];

const BENEFITS = [
  'Dedicated point of contact for every deal',
  'Same-day scenario feedback on any submission',
  'Co-branded marketing materials and email templates',
  'Access to all four product lanes through one relationship',
  'White-label AI tools for your investor clients',
  'Transparent, competitive compensation on every deal',
  'No minimum volume requirements',
  'Priority processing on repeat submissions',
];

export default function ProfessionalsPage() {
  return (
    <>
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&h=600&fit=crop"
          alt="Professional team meeting"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-navy-900/50" />
        <div className="relative mx-auto max-w-content px-6 py-16">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">For Professionals</p>
          <h1 className="text-h1 text-white max-w-2xl">Built for Brokers, LOs, and Advisors</h1>
          <p className="mt-4 text-lg text-navy-100 font-body font-light max-w-xl leading-relaxed">
            AI-powered tools and institutional capital programs designed to help you close more deals, faster. One relationship covers DSCR, flip, STR, and multifamily.
          </p>
        </div>
      </section>

      {/* AI Tools */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-10">Your AI Toolkit</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {TOOLS.map((tool) => (
              <div key={tool.title} className="card flex flex-col justify-between">
                <div>
                  <h3 className="text-h3 text-navy-900 mb-3">{tool.title}</h3>
                  <p className="text-navy-500 font-body leading-relaxed">{tool.desc}</p>
                </div>
                <Link href={tool.href} className="mt-6 text-sm font-sans font-semibold text-accent uppercase tracking-wide hover:text-accent-dark transition">
                  {tool.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div>
              <h2 className="section-heading">Why Professionals Choose 818</h2>
              <div className="mt-8 grid grid-cols-1 gap-3">
                {BENEFITS.map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-navy-700 font-body">{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-navy-900 rounded-lg p-10 text-white">
              <p className="text-xs font-sans font-semibold uppercase tracking-widest text-accent-light mb-4">Get Started</p>
              <h3 className="text-h3 text-white mb-4">Join the Broker Program</h3>
              <p className="text-navy-200 font-body leading-relaxed mb-6">
                Apply today and get access to your AI toolkit, co-marketing materials, and dedicated support within 24 hours.
              </p>
              <Link href="/broker-program" className="btn-primary">Apply Now</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
