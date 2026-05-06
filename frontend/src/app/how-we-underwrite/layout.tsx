import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/how-we-underwrite' },
};

export default function HowWeUnderwriteLayout({ children }: { children: ReactNode }) {
  return children;
}
