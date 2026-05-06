import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/str-playbook-2026' },
};

export default function StrPlaybookLayout({ children }: { children: ReactNode }) {
  return children;
}
