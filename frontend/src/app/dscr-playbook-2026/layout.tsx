import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/dscr-playbook-2026' },
};

export default function DscrPlaybookLayout({ children }: { children: ReactNode }) {
  return children;
}
