'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/dscr', label: 'DSCR Loans' },
  { href: '/fix-and-flip', label: 'Fix & Flip' },
  { href: '/str', label: 'STR Loans' },
  { href: '/multifamily', label: 'Multifamily' },
  { href: '/broker-program', label: 'Broker Program' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="818 Capital Partners"
              width={40}
              height={40}
              className="rounded-lg group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-tight">818 Capital</div>
              <div className="text-slate-400 text-[10px] leading-tight tracking-wider">PARTNERS</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/get-quote"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Get a Quote
            </Link>
            <a
              href="tel:+18185551234"
              className="hidden sm:inline-flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              📞 (818) 555-1234
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-slate-800/50">
            <div className="flex flex-col gap-1 pt-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/get-quote"
                className="mx-3 mt-2 px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                Get a Quote
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
