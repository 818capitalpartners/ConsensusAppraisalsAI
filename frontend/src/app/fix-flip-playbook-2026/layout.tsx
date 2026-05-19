import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '2026 Fix & Flip Playbook | 818 Capital',
  description: 'The Fix & Flip Playbook for 2026 — ARV math, 70% rule, LTC vs LTV, draw schedules, exit strategies, and real 818-funded flip deals. Free download.',
  alternates: { canonical: 'https://www.818capitalpartners.com/fix-flip-playbook-2026' },
};

export default function FixFlipPlaybookLayout({ children }: { children: ReactNode }) {
  return children;
}
