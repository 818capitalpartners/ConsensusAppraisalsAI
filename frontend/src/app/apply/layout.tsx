import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/apply' },
};

export default function ApplyLayout({ children }: { children: ReactNode }) {
  return children;
}
