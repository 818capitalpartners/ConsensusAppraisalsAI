import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/markets' },
};

export default function MarketsLayout({ children }: { children: ReactNode }) {
  return children;
}
