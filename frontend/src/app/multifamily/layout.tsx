import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/multifamily' },
};

export default function MultifamilyLayout({ children }: { children: ReactNode }) {
  return children;
}
