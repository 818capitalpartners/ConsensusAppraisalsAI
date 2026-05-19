import { ImageResponse } from 'next/og';
import { MARKETS } from '@/data/markets';
import { LOAN_PROGRAMS } from '@/data/loan-programs';

export const runtime = 'edge';
export const alt = 'Loan Program — 818 Capital Partners';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: { location: string; loan: string };
}) {
  const market = MARKETS.find((m) => m.slug === params.location);
  const program = LOAN_PROGRAMS.find((p) => p.slug === params.loan);

  const headline = market && program
    ? `${program.displayName} in ${market.displayName}`
    : '818 Capital Partners';

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
          {market && (
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: '#7FB4E0',
                textTransform: 'uppercase',
              }}
            >
              {market.state} · {market.metro}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: 1040,
            }}
          >
            {headline}
          </div>
          {program && (
            <div
              style={{
                fontSize: 26,
                color: '#B8D3E8',
                fontWeight: 400,
                lineHeight: 1.4,
                maxWidth: 1000,
              }}
            >
              {program.tagline}
            </div>
          )}
          {program && (
            <div
              style={{
                display: 'flex',
                gap: 40,
                fontSize: 22,
                color: '#ffffff',
                fontWeight: 500,
              }}
            >
              <span><span style={{ color: '#7FB4E0' }}>Term:</span> {program.termSummary.split(',')[0]}</span>
              <span><span style={{ color: '#7FB4E0' }}>Close:</span> {program.closeTime}</span>
            </div>
          )}
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
          <span>NMLS #2832335</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
