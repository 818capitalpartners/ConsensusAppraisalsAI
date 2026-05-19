import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About 818 Capital Partners | Built by Operators, for Operators',
  description:
    'Ravi Punn founded 818 Capital Partners after 20+ years as a real estate operator. We specialize in Fix & Flip, DSCR, Bridge, and Commercial financing with an advisory-first approach.',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.818capitalpartners.com/' },
    { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.818capitalpartners.com/about' },
  ],
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: 'https://www.818capitalpartners.com/about',
  about: { '@id': 'https://www.818capitalpartners.com/#organization' },
  mainEntity: { '@id': 'https://www.818capitalpartners.com/about#ravipunn' },
};

const TOOLS = [
  {
    name: 'Scenario Desk',
    desc: 'Submit any deal and get an AI-scored analysis with DSCR calculation, lender fit, and term sheet estimate in seconds.',
  },
  {
    name: 'Flip Lab',
    desc: 'Analyze fix-and-flip profitability across three ARV scenarios. Know your max offer and projected profit before you bid.',
  },
  {
    name: 'STR Signal',
    desc: 'Normalize Airbnb and VRBO income into lender-ready DSCR calculations. Accounts for seasonality and occupancy.',
  },
  {
    name: 'Sponsor Brief',
    desc: 'Submit multifamily deals and receive a full underwriting memo: NOI, DSCR, debt yield, cap rate, and financing recommendations.',
  },
];

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }} />
      {/* Hero */}
      <section className="bg-navy-900 py-20 md:py-28">
        <div className="mx-auto max-w-content px-6 text-center">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-6">About 818 Capital Partners</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-white leading-tight max-w-4xl mx-auto italic">
            &ldquo;How many deals could you do, with the right partner?&rdquo;
          </h1>
          <p className="mt-8 text-lg text-navy-300 font-body font-light max-w-xl mx-auto">
            Built by operators. Built for operators.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-lg text-navy-600 font-body leading-relaxed">
              818 Capital Partners was built with a clear conviction — and a clear purpose.
            </p>
            <p className="text-lg text-navy-600 font-body leading-relaxed">
              For too long, private lending has operated as a gatekeeping exercise rather than a growth engine. Capable operators — the ones developing homes, rezoning parcels, building apartment buildings, and revitalizing neighborhoods — were routinely handed capital structured to extract value, not create it. High rates. Punishing terms. Rigid qualification boxes that disqualify good deals and good people.
            </p>
            <p className="text-lg text-navy-700 font-body leading-relaxed font-semibold">
              818 Capital Partners exists to change that equation.
            </p>
            <p className="text-lg text-navy-600 font-body leading-relaxed">
              We leverage technology to streamline what was once a slow, opaque, relationship-dependent process — while restoring the human element that institutional lending lost somewhere along the way. Our platform connects serious operators with capital that understands their projects, respects their experience, and is structured to see deals to the finish line.
            </p>

            {/* Pullquote */}
            <div className="my-10 border-l-4 border-accent pl-8 py-4">
              <p className="text-xl md:text-2xl font-sans font-bold text-navy-900 leading-snug italic">
                The question we ask is not &ldquo;How many deals have you done?&rdquo; — it is &ldquo;How many deals could you do, with the right partner?&rdquo;
              </p>
            </div>

            <p className="text-lg text-navy-600 font-body leading-relaxed">
              We specialize in Fix &amp; Flip, DSCR, Bridge, and Commercial financing — with an advisory-first approach that prioritizes your project&apos;s success over transaction volume. Whether you&apos;re a seasoned developer expanding your portfolio or an emerging operator making your first move, we&apos;re here to get you across the finish line.
            </p>
            <p className="text-lg text-navy-700 font-body leading-relaxed font-semibold">
              818 Capital Partners. Built by operators. Built for operators.
            </p>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-navy-50/50 py-20">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-5 items-start">
              {/* Photo Column */}
              <div className="lg:col-span-2">
                <div className="relative rounded-xl overflow-hidden shadow-lg aspect-[2/3]">
                  <Image
                    src="/team/ravi-punn-opt.jpg"
                    alt="Ravi Punn, Founder & Principal of 818 Capital Partners"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-top"
                    priority
                  />
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <a
                    href="https://www.linkedin.com/in/ravipunn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent font-sans font-semibold hover:underline"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    Connect on LinkedIn
                  </a>
                </div>
              </div>

              {/* Bio Column */}
              <div className="lg:col-span-3 space-y-5">
                <div>
                  <h2 className="text-3xl font-sans font-bold text-navy-900">Ravi Punn</h2>
                  <p className="text-accent font-sans font-semibold mt-1">Founder &amp; Principal, 818 Capital Partners</p>
                </div>

                <p className="text-navy-600 font-body leading-relaxed">
                  Ravi Punn is a serial entrepreneur and real estate developer with over 20 years of hands-on experience across the full development lifecycle. Since 2006, he has been directly involved in more than $100 million in real estate transactions — not as a spectator, but as an operator, builder, and investor who has navigated the complexity of the market from the ground up.
                </p>
                <p className="text-navy-600 font-body leading-relaxed">
                  His career spans single-family development, rezoning, ground-up construction, investment syndication, and multifamily acquisitions. He has sourced deals, structured capital, managed contractors, worked with municipal bodies, and delivered projects — the kind of experience that can only be earned by doing the work, not reading about it.
                </p>
                <p className="text-navy-600 font-body leading-relaxed">
                  Ravi founded 818 Capital Partners after spending years on the borrower side of the table — watching capable developers get turned away by lenders who couldn&apos;t see past a credit score, or get funded on terms that quietly undermined the deal they were trying to build. He knew there was a better way. Not just a cheaper way. A smarter way.
                </p>
                <p className="text-navy-600 font-body leading-relaxed">
                  That path wasn&apos;t without turbulence. Developing at volume means navigating joint ventures, partner dynamics, regulatory complexity, and market cycles that don&apos;t always cooperate. Real estate at scale is a contact sport — and the operators who pretend otherwise are usually the ones you should be most cautious of. Those experiences, the hard ones, are precisely what shaped Ravi&apos;s conviction that operators deserve capital partners who understand what it actually takes to build.
                </p>
                <p className="text-navy-600 font-body leading-relaxed">
                  At 818 Capital, Ravi applies an operator&apos;s lens to every deal he touches. He evaluates projects the way a developer would — scrutinizing the economics, the exit, the market, and the person executing. His advisory process is relational, educational, and direct. He doesn&apos;t pitch — he problem-solves.
                </p>
                <p className="text-navy-600 font-body leading-relaxed">
                  Beyond real estate, Ravi has built and operated businesses across multiple industries — from enterprise technology sales to luxury custom menswear. Every one of them was built the same way: by showing up, earning trust, and solving real problems for real people.
                </p>
                <p className="text-navy-600 font-body leading-relaxed">
                  He is based in the New York metro area, where he is actively building a lending and advisory platform designed to do one thing: get the right operators the right capital, so they can go build something.
                </p>
                <p className="text-navy-700 font-body leading-relaxed font-semibold italic mt-8">
                  If you have a deal worth building, let&apos;s talk.
                </p>

                {/* Highlights */}
                <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-navy-200">
                  <div>
                    <p className="text-2xl font-sans font-bold text-navy-900">20+</p>
                    <p className="text-xs text-navy-500 font-body">Years in Real Estate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-sans font-bold text-navy-900">$100M+</p>
                    <p className="text-xs text-navy-500 font-body">Transaction Experience</p>
                  </div>
                  <div>
                    <p className="text-2xl font-sans font-bold text-navy-900">Operator</p>
                    <p className="text-xs text-navy-500 font-body">Developer, Builder, Investor</p>
                  </div>
                  <div>
                    <p className="text-2xl font-sans font-bold text-navy-900">NY Metro</p>
                    <p className="text-xs text-navy-500 font-body">Based &amp; Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Edge */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent mb-3">Our Technology Edge</p>
            <h2 className="section-heading">AI-Powered Underwriting Tools</h2>
            <p className="section-subheading mx-auto mt-4">
              Institutional-grade analysis, available to every operator. These tools power our speed advantage.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {TOOLS.map((tool) => (
              <div key={tool.name} className="p-6 rounded-lg border border-navy-100 bg-navy-50/30">
                <h3 className="text-h4 text-navy-900 mb-2">{tool.name}</h3>
                <p className="text-sm text-navy-500 font-body leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1920&h=600&fit=crop"
          alt="City skyline"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-accent/90" />
        <div className="relative mx-auto max-w-content px-6 text-center">
          <h2 className="text-h2 text-white font-sans">How Many Deals Could You Do With the Right Partner?</h2>
          <p className="mt-4 text-lg text-white/80 font-body font-light">
            Submit your deal scenario and find out.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/dscr-loans#form" className="btn-white">Submit a Scenario</Link>
            <a href="tel:+19179939194" className="inline-flex items-center justify-center rounded border-2 border-white/40 px-8 py-3 text-sm font-sans font-semibold text-white transition hover:bg-white/10 uppercase tracking-wide">
              Call (917) 993-9194
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
