import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import './globals.css';
import Script from 'next/script';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import ChatWidget from '@/components/ChatWidget';
import TrackingPixels from '@/components/TrackingPixels';
import ClickTracker from '@/components/ClickTracker';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.818capitalpartners.com'),
  title: {
    default: '818 Capital | Investor & Commercial Real Estate Financing',
    template: '%s | 818 Capital Partners',
  },
  description:
    'Fast, flexible real estate investment financing. DSCR rentals, fix & flip, short-term rental, and multifamily loans with AI-powered scenario analysis.',
  applicationName: '818 Capital Partners',
  authors: [{ name: '818 Capital Partners', url: 'https://www.818capitalpartners.com' }],
  keywords: [
    'DSCR loans', 'fix and flip financing', 'STR loans', 'short-term rental loans',
    'multifamily bridge loans', 'investor mortgage broker', 'commercial real estate financing',
    'investment property loans', 'rental property financing',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.818capitalpartners.com',
    siteName: '818 Capital Partners',
    title: '818 Capital | Investor & Commercial Real Estate Financing',
    description:
      'DSCR, fix & flip, STR, and multifamily loans with AI-powered scenario analysis. 43+ closed deals across 48 states.',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: '818 Capital Partners' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@818capital',
    creator: '@818capital',
    title: '818 Capital | Investor & Commercial Real Estate Financing',
    description:
      'DSCR, fix & flip, STR, and multifamily loans with AI-powered scenario analysis.',
  },
  alternates: { canonical: 'https://www.818capitalpartners.com' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
};

// JSON-LD structured data — makes us citable by ChatGPT, Perplexity, Google AI Overviews
const organizationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'FinancialService'],
      '@id': 'https://www.818capitalpartners.com/#organization',
      name: '818 Capital Partners',
      alternateName: '818 Capital',
      url: 'https://www.818capitalpartners.com',
      logo: 'https://www.818capitalpartners.com/logo.png',
      image: 'https://www.818capitalpartners.com/logo.png',
      description:
        'Commercial mortgage brokerage specializing in investor real estate financing — DSCR rentals, fix & flip, short-term rental, and multifamily loans across 48 states.',
      foundingDate: '2023',
      telephone: '+1-917-993-9194',
      email: 'deals@818capitalpartners.com',
      priceRange: '$$$',
      areaServed: { '@type': 'Country', name: 'United States' },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US',
        addressRegion: 'NY',
      },
      knowsAbout: [
        'DSCR loans',
        'Fix and flip financing',
        'Short-term rental loans',
        'Multifamily bridge loans',
        'Commercial real estate financing',
        'Investment property mortgages',
      ],
      sameAs: [
        'https://www.linkedin.com/company/818capital',
        'https://www.instagram.com/818capital',
        'https://www.facebook.com/818capital',
        'https://x.com/818capital',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Investment property loan programs',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'LoanOrCredit',
              name: 'DSCR Rental Loan',
              description:
                '30-year fixed investor loans qualified on property cash flow (DSCR), not personal DTI.',
              url: 'https://www.818capitalpartners.com/dscr-loans',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'LoanOrCredit',
              name: 'Fix & Flip Loan',
              description:
                'Short-term rehab financing up to 90% LTC and 75% ARV.',
              url: 'https://www.818capitalpartners.com/fix-and-flip',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'LoanOrCredit',
              name: 'Short-Term Rental (STR) Loan',
              description:
                'DSCR loans for Airbnb/VRBO properties underwritten on AirDNA revenue.',
              url: 'https://www.818capitalpartners.com/str-loans',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'LoanOrCredit',
              name: 'Multifamily Bridge & Permanent Loan',
              description:
                'Bridge and long-term financing for 5+ unit investment properties.',
              url: 'https://www.818capitalpartners.com/multifamily',
            },
          },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.818capitalpartners.com/#website',
      url: 'https://www.818capitalpartners.com',
      name: '818 Capital Partners',
      publisher: { '@id': 'https://www.818capitalpartners.com/#organization' },
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.818capitalpartners.com/blog?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

const LOAN_LINKS = [
  { href: '/dscr-loans', label: 'DSCR / Rental Loans' },
  { href: '/fix-and-flip', label: 'Fix & Flip' },
  { href: '/str-loans', label: 'STR Loans' },
  { href: '/multifamily', label: 'Multifamily' },
];

const COMPANY_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/closed-deals', label: 'Closed Deals' },
  { href: '/markets', label: 'Where We Lend' },
  { href: '/professionals', label: 'For Professionals' },
  { href: '/broker-program', label: 'Broker Program' },
];

const RESOURCE_LINKS = [
  { href: '/blog', label: 'Blog' },
  { href: '/insights', label: 'Industry Insights' },
  { href: '/resources', label: 'Calculators & Tools' },
];

const SOCIALS = [
  { href: 'https://www.linkedin.com/company/818capital', label: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { href: 'https://www.instagram.com/818capital', label: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  { href: 'https://www.facebook.com/818capital', label: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { href: 'https://x.com/818capital', label: 'X / Twitter', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="DtiQjKepeq-tW-ojomkUZFzLxQLDE6pk7jEAbKn9jCM" />
        {/* JSON-LD structured data for AI crawlers and rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7EV7DRMWJW"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7EV7DRMWJW');
          `}
        </Script>
        {/* Retargeting pixels (Meta, Google Ads, LinkedIn, TikTok) —
            each one is gated on its NEXT_PUBLIC_* env var. */}
        <TrackingPixels />
        {/* ── Utility Bar ──────────────────────────────────── */}
        <div className="bg-navy-900 text-white text-xs">
          <div className="mx-auto max-w-content flex items-center justify-between px-6 py-2">
            <div className="flex items-center gap-4">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-accent-light transition" aria-label={s.label}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                </a>
              ))}
            </div>
            <div className="flex items-center gap-6">
              <a href="tel:+19179939194" className="hover:text-navy-200 transition">(917) 993-9194</a>
              <a href="mailto:deals@818capitalpartners.com" className="hover:text-navy-200 transition hidden sm:inline">deals@818capitalpartners.com</a>
            </div>
          </div>
        </div>

        {/* ── Main Nav ─────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white border-b border-navy-100 shadow-sm">
          <nav className="mx-auto max-w-content flex items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="818 Capital" width={48} height={48} className="rounded" />
              <span className="text-2xl font-sans font-bold text-navy-900 tracking-tight hidden sm:inline">
                818<span className="text-accent"> Capital</span>
              </span>
            </Link>

            <div className="hidden items-center gap-6 lg:flex">
              {/* Direct loan program links — what people came for */}
              <Link href="/dscr-loans" className="text-sm font-sans font-semibold text-navy-700 transition hover:text-accent">DSCR</Link>
              <Link href="/fix-and-flip" className="text-sm font-sans font-semibold text-navy-700 transition hover:text-accent">Fix &amp; Flip</Link>
              <Link href="/str-loans" className="text-sm font-sans font-semibold text-navy-700 transition hover:text-accent">STR</Link>
              <Link href="/closed-deals" className="text-sm font-sans font-medium text-navy-700 transition hover:text-accent">Closed Deals</Link>

              {/* Insights dropdown — includes Where We Lend, playbooks, blog */}
              <div className="relative group">
                <button className="text-sm font-sans font-medium text-navy-700 transition hover:text-accent flex items-center gap-1">
                  Insights
                  <svg className="w-3.5 h-3.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-64 rounded-lg border border-navy-100 bg-white p-2 shadow-lg">
                    <p className="px-4 py-1.5 text-[10px] font-sans font-semibold uppercase tracking-widest text-navy-400">Playbooks</p>
                    <Link href="/dscr-playbook-2026" className="block px-4 py-2 text-sm font-medium text-navy-700 hover:text-accent hover:bg-navy-50 rounded transition">DSCR Investor Playbook</Link>
                    <Link href="/fix-flip-playbook-2026" className="block px-4 py-2 text-sm font-medium text-navy-700 hover:text-accent hover:bg-navy-50 rounded transition">Fix &amp; Flip Playbook</Link>
                    <Link href="/str-playbook-2026" className="block px-4 py-2 text-sm font-medium text-navy-700 hover:text-accent hover:bg-navy-50 rounded transition">STR Playbook</Link>
                    <hr className="my-1.5 border-navy-100" />
                    <Link href="/blog" className="block px-4 py-2 text-sm font-medium text-navy-700 hover:text-accent hover:bg-navy-50 rounded transition">Blog</Link>
                    <Link href="/insights" className="block px-4 py-2 text-sm font-medium text-navy-700 hover:text-accent hover:bg-navy-50 rounded transition">Industry Insights</Link>
                    <Link href="/markets" className="block px-4 py-2 text-sm font-medium text-navy-700 hover:text-accent hover:bg-navy-50 rounded transition">Where We Lend</Link>
                    <Link href="/resources" className="block px-4 py-2 text-sm font-medium text-navy-700 hover:text-accent hover:bg-navy-50 rounded transition">Calculators &amp; Tools</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/broker-program" className="inline-flex items-center justify-center rounded border-2 border-accent px-5 py-2 text-xs font-sans font-semibold text-accent transition hover:bg-accent hover:text-white uppercase tracking-wide">
                For Brokers
              </Link>
              <Link href="/dscr-loans#form" className="btn-primary text-xs py-2.5">
                Submit a Scenario
              </Link>
            </div>

            {/* Mobile */}
            <details className="relative lg:hidden">
              <summary className="cursor-pointer list-none p-2 text-navy-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </summary>
              <div className="absolute right-0 mt-2 w-72 rounded-lg border border-navy-100 bg-white p-4 shadow-lg z-50 max-h-[80vh] overflow-y-auto">
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-2">Loan Programs</p>
                <Link href="/dscr-loans" className="block py-2 text-sm font-semibold text-navy-700 hover:text-accent">DSCR / Rental Loans</Link>
                <Link href="/fix-and-flip" className="block py-2 text-sm font-semibold text-navy-700 hover:text-accent">Fix &amp; Flip</Link>
                <Link href="/str-loans" className="block py-2 text-sm font-semibold text-navy-700 hover:text-accent">STR Loans</Link>
                <Link href="/multifamily" className="block py-2 text-sm font-semibold text-navy-700 hover:text-accent">Multifamily</Link>
                <hr className="my-3 border-navy-100" />
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-2">Playbooks</p>
                <Link href="/dscr-playbook-2026" className="block py-2 text-sm font-medium text-navy-700 hover:text-accent">DSCR Investor Playbook</Link>
                <Link href="/fix-flip-playbook-2026" className="block py-2 text-sm font-medium text-navy-700 hover:text-accent">Fix &amp; Flip Playbook</Link>
                <Link href="/str-playbook-2026" className="block py-2 text-sm font-medium text-navy-700 hover:text-accent">STR Playbook</Link>
                <hr className="my-3 border-navy-100" />
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-2">More</p>
                <Link href="/closed-deals" className="block py-2 text-sm font-medium text-navy-700 hover:text-accent">Closed Deals</Link>
                <Link href="/blog" className="block py-2 text-sm font-medium text-navy-700 hover:text-accent">Blog</Link>
                <Link href="/markets" className="block py-2 text-sm font-medium text-navy-700 hover:text-accent">Where We Lend</Link>
                <Link href="/about" className="block py-2 text-sm font-medium text-navy-700 hover:text-accent">About Us</Link>
                <div className="flex gap-2 mt-4">
                  <Link href="/broker-program" className="flex-1 inline-flex items-center justify-center rounded border-2 border-accent px-3 py-2.5 text-xs font-sans font-semibold text-accent hover:bg-accent hover:text-white transition uppercase tracking-wide">For Brokers</Link>
                  <Link href="/dscr-loans#form" className="flex-1 btn-primary text-xs">Scenario</Link>
                </div>
              </div>
            </details>
          </nav>
        </header>

        {/* ── Main ───────────────────────────────────────── */}
        <main className="flex-1">{children}</main>
        <ExitIntentPopup />
        <ChatWidget />
        <ClickTracker />

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="bg-navy-900 text-white">
          <div className="mx-auto max-w-content px-6 py-16">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              {/* Brand */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="818 Capital" width={48} height={48} className="rounded" />
                  <p className="text-xl font-sans font-bold tracking-tight">
                    818<span className="text-accent-light"> Capital</span>
                  </p>
                </div>
                <p className="mt-4 text-sm text-navy-300 font-body leading-relaxed max-w-sm">
                  Investor &amp; commercial real estate financing built for speed and certainty. AI-powered scenario analysis across DSCR, fix &amp; flip, STR, and multifamily.
                </p>
                {/* Social */}
                <div className="mt-6 flex items-center gap-4">
                  {SOCIALS.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition" aria-label={s.label}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Loan Programs */}
              <div>
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-4">Loan Programs</p>
                <div className="flex flex-col gap-2.5">
                  {LOAN_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="text-sm text-navy-200 hover:text-white transition font-body">{l.label}</Link>
                  ))}
                </div>
              </div>

              {/* Company */}
              <div>
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-4">Company</p>
                <div className="flex flex-col gap-2.5">
                  {COMPANY_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="text-sm text-navy-200 hover:text-white transition font-body">{l.label}</Link>
                  ))}
                  {RESOURCE_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="text-sm text-navy-200 hover:text-white transition font-body">{l.label}</Link>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-4">Get In Touch</p>
                <div className="space-y-2.5 text-sm text-navy-200 font-body">
                  <a href="tel:+19179939194" className="block hover:text-white transition">(917) 993-9194</a>
                  <a href="mailto:deals@818capitalpartners.com" className="block hover:text-white transition">deals@818capitalpartners.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-navy-800">
            <div className="mx-auto max-w-content px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-xs text-navy-400 font-body">
                &copy; {new Date().getFullYear()} 818 Capital Partners. All rights reserved.
              </p>
              <div className="text-xs text-navy-500 font-body max-w-xl text-center md:text-right space-y-1">
                <p>This is not a commitment to lend. All loans subject to credit approval. Terms, conditions, and programs subject to change without notice.</p>
                <p>Equal Housing Opportunity. Corporate NMLS pending. Licensed in applicable states.</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
