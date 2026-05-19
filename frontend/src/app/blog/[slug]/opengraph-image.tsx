import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog-data';

export const runtime = 'edge';
export const alt = 'Article — 818 Capital Partners';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

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
          {post && (
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: '#7FB4E0',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(127, 180, 224, 0.15)',
                padding: '8px 16px',
                borderRadius: 6,
              }}
            >
              {post.category}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: 1040,
            }}
          >
            {post ? post.title : '818 Capital Blog'}
          </div>
          {post && (
            <div
              style={{
                fontSize: 24,
                color: '#B8D3E8',
                fontWeight: 400,
                lineHeight: 1.4,
                maxWidth: 1000,
              }}
            >
              {post.excerpt.length > 180 ? post.excerpt.slice(0, 177) + '…' : post.excerpt}
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
          <span>By Ravi Punn · 818capitalpartners.com</span>
          {post && <span>{post.readTime}</span>}
        </div>
      </div>
    ),
    { ...size },
  );
}
