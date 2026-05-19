import { ImageResponse } from 'next/og';
import { MARKETS } from '@/data/markets';
import { getStateBySlug } from '@/data/states';

export const runtime = 'edge';
export const alt = 'Market — 818 Capital Partners';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { location: string } }) {
  const state = getStateBySlug(params.location);
  const market = !state ? MARKETS.find((m) => m.slug === params.location) : null;

  const headline = state
    ? `Investment Property Loans in ${state.displayName}`
    : market
      ? `Investment Property Loans in ${market.displayName}`
      : 'Where We Lend — 818 Capital';

  const subline = state
    ? `DSCR · Fix & Flip · STR · Multifamily — active across ${state.displayName}`
    : market
      ? `${market.metro} · DSCR · Fix & Flip · STR · Multifamily`
      : 'Active across 48 states with local-market underwriting';

  const tagLabel = state ? 'STATE COVERAGE' : market ? 'CITY MARKET' : 'MARKETS';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background:
            'linear-gradient(135deg, #0A1628 0%, #1F4E78 70%, #2E75B6 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: '#ffffff' }}>818</span>
            <span style={{ fontSize: 36, fontWeight: 700, color: '#7FB4E0' }}>Capital</span>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: '#7FB4E0',
              textTransform: 'uppercase',
            }}
          >
            {tagLabel}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: 1040,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#B8D3E8',
              fontWeight: 400,
              lineHeight: 1.35,
              maxWidth: 1000,
            }}
          >
            {subline}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#7FB4E0',
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          <span>818capitalpartners.com</span>
          <span>Close in 14–21 days</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
