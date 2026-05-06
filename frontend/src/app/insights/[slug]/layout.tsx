import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: { canonical: `https://www.818capitalpartners.com/insights/${slug}` },
  };
}

export default function InsightPostLayout({ children }: { children: ReactNode }) {
  return children;
}
