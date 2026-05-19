import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Broker Program | 818 Capital',
  description: 'Earn on every deal. Submit DSCR, fix & flip, STR, and multifamily scenarios through 818 Capital — co-branded materials, dedicated processing, same-day feedback.',
  alternates: { canonical: 'https://www.818capitalpartners.com/broker-program' },
};

export default function BrokerProgramLayout({ children }: { children: ReactNode }) {
  return children;
}
