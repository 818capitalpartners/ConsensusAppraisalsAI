'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StickyMobileCTA() {
  const pathname = usePathname();
  // Hide on /apply (form page) and internal dashboard
  if (pathname?.startsWith('/apply') || pathname?.startsWith('/command-center')) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-navy-100 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-2 divide-x divide-navy-100">
        <a
          href="tel:+19179939194"
          className="flex items-center justify-center gap-2 py-4 text-sm font-sans font-semibold text-navy-900 active:bg-navy-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call
        </a>
        <Link
          href="/apply"
          className="flex items-center justify-center gap-2 py-4 text-sm font-sans font-bold bg-accent text-white active:bg-accent/90"
        >
          Submit a Deal
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
