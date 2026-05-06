import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/insights' },
};

export default function InsightsLayout({ children }: { children: ReactNode }) {
  return children;
}
