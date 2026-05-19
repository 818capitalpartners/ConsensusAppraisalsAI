import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '818 Capital Partners — Investor & Commercial Real Estate Financing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'linear-gradient(135deg, #0A1628 0%, #1F4E78 60%, #2E75B6 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            818
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#7FB4E0',
            }}
          >
            Capital
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: 1000,
            }}
          >
            Investor & Commercial Real Estate Financing
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: '#B8D3E8',
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            DSCR · Fix &amp; Flip · STR · Multifamily — close in 14–21 days across 48 states.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#7FB4E0',
            fontSize: 22,
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
