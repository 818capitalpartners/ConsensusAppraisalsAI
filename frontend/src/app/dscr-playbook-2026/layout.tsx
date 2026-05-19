import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '2026 DSCR Investor Playbook | 818 Capital',
  description: 'The 34-page 2026 DSCR Playbook: rate matrix by credit score, LTV, and DSCR ratio; no-ratio and sub-1.0 programs; STR income rules; portfolio scaling and entity structuring. Free download.',
  alternates: { canonical: 'https://www.818capitalpartners.com/dscr-playbook-2026' },
};

export default function DscrPlaybookLayout({ children }: { children: ReactNode }) {
  return children;
}
