'use client';

import { createSupabaseBrowser } from '../../../lib/supabase/browser';

type Reason = 'not_borrower' | 'no_deal';

export default function NoDealOnFile({ email, reason }: { email: string; reason: Reason }) {
  const supabase = createSupabaseBrowser();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/portal/sign-in';
  };

  const headline = reason === 'no_deal'
    ? <>We don&apos;t have a deal on file for <strong style={{ color: '#e2e8f0' }}>{email}</strong>.</>
    : <>Your account doesn&apos;t have borrower portal access.</>;

  const subline = reason === 'no_deal'
    ? <>If you applied with a different email, sign in with that one — or contact <a href="mailto:angela@818capitalpartners.com" style={{ color: '#60a5fa' }}>angela@818capitalpartners.com</a> to link this account to your deal.</>
    : <>If you think this is a mistake, contact <a href="mailto:angela@818capitalpartners.com" style={{ color: '#60a5fa' }}>angela@818capitalpartners.com</a>.</>;

  return (
    <div style={fullCenter}>
      <div style={card}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#0066CB', textAlign: 'center' }}>818</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 18, marginBottom: 12, lineHeight: 1.6, textAlign: 'center' }}>
          {headline}
        </div>
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 18, textAlign: 'center' }}>
          {subline}
        </div>
        <button onClick={handleSignOut} style={ghostBtn}>Sign in with a different account</button>
      </div>
    </div>
  );
}

const fullCenter: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f' };
const card: React.CSSProperties = { width: 420, background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12, padding: 32, textAlign: 'center' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#64748b', border: '1px solid #1e293b', borderRadius: 6, padding: '8px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: 'pointer' };
