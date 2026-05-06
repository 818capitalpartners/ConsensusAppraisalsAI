import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/founders-letter' },
};

export default function FoundersLetterLayout({ children }: { children: ReactNode }) {
  return children;
}
