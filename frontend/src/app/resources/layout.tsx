import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.818capitalpartners.com/resources' },
};

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return children;
}
