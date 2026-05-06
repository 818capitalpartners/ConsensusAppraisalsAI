import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/about' },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
