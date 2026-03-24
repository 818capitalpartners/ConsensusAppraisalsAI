import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | 818 Capital Partners',
  description: 'Meet the team behind 818 Capital Partners. Experienced real estate finance professionals delivering fast, transparent lending solutions.',
};

const TEAM = [
  {
    name: 'Ravi Punn',
    title: 'Managing Partner',
    bio: 'Ravi founded 818 Capital to bring institutional-quality lending solutions to real estate investors without the bureaucracy. With over a decade in commercial real estate finance, capital markets, and deal structuring, he oversees all origination, lender relationships, and platform strategy. Licensed mortgage professional with direct relationships across 12+ capital programs.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    linkedin: 'https://www.linkedin.com/in/ravipunn',
  },
];

const VALUES = [
  {
    title: 'Speed Over Bureaucracy',
    desc: 'We respond in hours, not days. Term sheets in 24 hours. Most deals close in 14–21 days.',
  },
  {
    title: 'Transparency First',
    desc: 'Every number explained. Every fee disclosed upfront. No surprises at closing.',
  },
  {
    title: 'Technology-Enabled',
    desc: 'Proprietary scenario analysis accelerates underwriting and matches deals to the right programs instantly.',
  },
  {
    title: 'Relationship-Driven',
    desc: 'We build long-term partnerships with borrowers and brokers. Repeat clients are our best measure of success.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">About Us</p>
          <h1 className="text-h1 text-white max-w-2xl">The Team Behind 818 Capital</h1>
          <p className="mt-4 text-lg text-navy-200 font-body font-light max-w-xl leading-relaxed">
            We&apos;re a team of real estate finance professionals who believe lending should be fast, transparent, and built around the deal — not the paperwork.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-10">Leadership</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((person) => (
              <div key={person.name} className="card p-0 overflow-hidden">
                <div className="relative h-72">
                  <Image src={person.image} alt={person.name} fill className="object-cover object-top" />
                </div>
                <div className="p-6">
                  <h3 className="text-h4 text-navy-900">{person.name}</h3>
                  <p className="text-sm text-accent font-sans font-semibold mb-3">{person.title}</p>
                  <p className="text-sm text-navy-500 font-body leading-relaxed">{person.bio}</p>
                  {person.linkedin && (
                    <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-4 text-sm text-accent font-sans font-semibold hover:text-accent-dark transition">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-navy-50/50 py-16">
        <div className="mx-auto max-w-content px-6">
          <h2 className="section-heading mb-10">How We Operate</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4">
                <div className="w-1 bg-accent rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-sans font-semibold text-navy-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-navy-500 font-body leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-h3 text-navy-900 mb-3">Work With Us</h2>
          <p className="text-navy-500 font-body mb-6 max-w-lg mx-auto">
            Whether you&apos;re an investor, broker, or correspondent — we&apos;re built to move fast and communicate clearly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dscr-loans#form" className="btn-primary">Submit a Scenario</Link>
            <Link href="/broker-program" className="btn-secondary">Broker Program</Link>
          </div>
        </div>
      </section>
    </>
  );
}
