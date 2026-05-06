import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/str-loans' },
};

export default function StrLoansLayout({ children }: { children: ReactNode }) {
  return children;
}
