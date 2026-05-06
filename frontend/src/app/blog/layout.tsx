import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/blog' },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
