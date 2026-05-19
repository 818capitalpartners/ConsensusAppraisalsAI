import { ImageResponse } from 'next/og';
import FUNDED_DEALS from '@/data/fundedDeals';

export const runtime = 'edge';
export const alt = 'Closed deal — 818 Capital Partners';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateImageMetadata({ params }: { params: { id: string } }) {
  const deal = FUNDED_DEALS.find((d) => String(d.id) === params.id);
  return [
    {
      id: 'main',
      alt: deal
        ? `${deal.propertyType} in ${deal.city}, ${deal.state} — ${deal.loanType}`
        : 'Closed deal — 818 Capital Partners',
      contentType: 'image/png',
      size,
    },
  ];
}

export default async function Image({ params }: { params: { id: string } }) {
  const deal = FUNDED_DEALS.find((d) => String(d.id) === params.id);

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
            Closed Deal {deal ? `#${deal.id}` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              fontSize: 28,
              color: '#B8D3E8',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            {deal ? deal.loanType.toUpperCase() : 'INVESTOR FINANCING'}
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: 1000,
            }}
          >
            {deal
              ? `${deal.propertyType} · ${deal.city}, ${deal.state}`
              : 'Closed deal at 818 Capital'}
          </div>
          {deal && (
            <div
              style={{
                display: 'flex',
                gap: 48,
                fontSize: 30,
                color: '#ffffff',
                fontWeight: 500,
              }}
            >
              <span style={{ fontWeight: 700 }}>{deal.dealValue}</span>
              <span style={{ color: '#B8D3E8' }}>{deal.program}</span>
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
