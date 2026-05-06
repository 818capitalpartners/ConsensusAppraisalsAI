import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/fix-and-flip' },
};

export default function FixAndFlipLayout({ children }: { children: ReactNode }) {
  return children;
}
