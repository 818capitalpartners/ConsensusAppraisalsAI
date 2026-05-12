'use client';

import { createSupabaseBrowser } from '../../../../lib/supabase/browser';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
};

type DealRow = {
  id: string;
  borrower_name?: string | null;
  borrower_email?: string | null;
  product?: string | null;
  loan_status?: string | null;
  loan_amount?: number | string | null;
  property_address?: string | null;
  created_at: string;
};

export default function AdminLanding({ profile, deals }: { profile: Profile; deals: DealRow[] }) {
  const supabase = createSupabaseBrowser();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/portal/sign-in';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <div style={{ background: '#0d1117', borderBottom: '1px solid #1e293b', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: '#0066CB' }}>818</div>
        <div style={{ width: 1, height: 24, background: '#1e293b' }} />
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>ADMIN PORTAL</div>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.1em' }}>{profile.full_name || profile.email}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={handleSignOut} style={ghostBtn}>Sign out</button>
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Recent deals
        </div>
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#e2e8f0' }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid #1e293b' }}>
                <Th>Borrower</Th>
                <Th>Property</Th>
                <Th>Product</Th>
                <Th>Status</Th>
                <Th align="right">Amount</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No deals yet.</td></tr>
              )}
              {deals.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <Td>
                    <div>{d.borrower_name || '—'}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{d.borrower_email}</div>
                  </Td>
                  <Td>{d.property_address || '—'}</Td>
                  <Td>{d.product?.toUpperCase() || '—'}</Td>
                  <Td>{d.loan_status || '—'}</Td>
                  <Td align="right">{d.loan_amount ? formatMoney(d.loan_amount) : '—'}</Td>
                  <Td>{new Date(d.created_at).toLocaleDateString()}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 20, padding: 16, background: '#0d1117', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          Full admin tools (edit deals, manage documents, message threads) are still in the Vite admin portal running locally. This page is the Next.js entry point and will gain features incrementally.
        </div>
      </div>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return <th style={{ padding: '10px 16px', textAlign: align, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{children}</th>;
}
function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return <td style={{ padding: '12px 16px', textAlign: align, verticalAlign: 'top' }}>{children}</td>;
}
function formatMoney(v: number | string) {
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  if (!isFinite(n) || n === 0) return String(v || '—');
  return `$${n.toLocaleString()}`;
}
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#64748b', border: '1px solid #1e293b', borderRadius: 6, padding: '8px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: 'pointer' };
