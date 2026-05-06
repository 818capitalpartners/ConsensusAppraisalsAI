import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/closed-deals' },
};

export default function ClosedDealsLayout({ children }: { children: ReactNode }) {
  return children;
}
