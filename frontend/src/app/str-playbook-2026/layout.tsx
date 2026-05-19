import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '2026 STR Investor Playbook | 818 Capital',
  description: 'The 2026 STR Playbook for Airbnb & VRBO investors — AirDNA underwriting, occupancy and seasonality math, top investor markets, regulation watchlist. Free download.',
  alternates: { canonical: 'https://www.818capitalpartners.com/str-playbook-2026' },
};

export default function StrPlaybookLayout({ children }: { children: ReactNode }) {
  return children;
}
