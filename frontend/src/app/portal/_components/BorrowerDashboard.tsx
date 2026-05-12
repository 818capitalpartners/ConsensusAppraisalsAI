'use client';

import { useState, useEffect, useRef } from 'react';
import { createSupabaseBrowser } from '../../../lib/supabase/browser';

const STAGES = [
  'Application',
  'Processing',
  'Underwriting',
  'Appraisal',
  'Conditional Approval',
  'Clear to Close',
  'Closed / Funded',
];

const STAGE_DESCRIPTIONS: Record<string, string> = {
  'Application': 'Your application has been received. Our team is reviewing the initial details.',
  'Processing': 'We are gathering and verifying all required documentation for your loan.',
  'Underwriting': 'Your file is being reviewed by the underwriting team for final credit and property approval.',
  'Appraisal': 'A property appraisal has been ordered to confirm the value.',
  'Conditional Approval': 'Your loan has been conditionally approved. We are working through the remaining conditions.',
  'Clear to Close': 'All conditions have been satisfied. We are preparing your closing documents.',
  'Closed / Funded': 'Congratulations! Your loan has closed and funds have been disbursed.',
};

const LOAN_STATUS_TO_STAGE: Record<string, string> = {
  submitted: 'Application',
  reviewing: 'Processing',
  in_underwriting: 'Underwriting',
  term_sheet_sent: 'Conditional Approval',
  closing: 'Clear to Close',
  closed_funded: 'Closed / Funded',
  declined: 'Application',
  paused: 'Application',
};

type Deal = {
  id: string;
  borrower_name?: string;
  borrower_email?: string;
  borrower_llc?: string;
  property_address?: string;
  product?: string;
  loan_status?: string;
  loan_amount?: number | string;
  ltv?: string;
  term?: string;
};

type RequiredDoc = {
  id: string;
  doc_key: string;
  display_name: string;
  state: 'not_started' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';
  required: boolean;
};

type Message = {
  id: string;
  sender_role: string;
  sender_name?: string;
  body: string;
  read_by_borrower_at?: string | null;
  created_at: string;
};

export default function BorrowerDashboard({
  deal,
  requiredDocuments,
  messages,
  signedInAs,
}: {
  deal: Deal;
  requiredDocuments: RequiredDoc[];
  messages: Message[];
  signedInAs: string;
}) {
  const [tab, setTab] = useState<'status' | 'documents' | 'messages'>('status');
  const msgEndRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowser();

  const stage = LOAN_STATUS_TO_STAGE[deal.loan_status || ''] || 'Application';
  const stageIdx = STAGES.indexOf(stage);

  const pendingDocs = requiredDocuments.filter(d => d.state === 'not_started' || d.state === 'in_progress').length;
  const unreadMessages = messages.filter(m => m.sender_role === 'admin' && !m.read_by_borrower_at).length;

  useEffect(() => {
    if (tab === 'messages') msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tab, messages]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/portal/sign-in';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0a0f' }}>
      {/* Header */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid #1e293b', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: '#0066CB' }}>818</div>
        <div style={{ width: 1, height: 24, background: '#1e293b' }} />
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>BORROWER PORTAL</div>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.1em' }}>
            {deal.borrower_name || deal.borrower_email}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={handleSignOut} style={ghostBtn} title={signedInAs}>Sign out</button>
        </div>
      </div>

      {/* Stage progress bar */}
      <div style={{ padding: '20px 24px', background: '#0d1117', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
          {STAGES.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
                background: i <= stageIdx ? '#0066CB' : '#1e293b',
                color: i <= stageIdx ? '#fff' : '#475569',
                border: i === stageIdx ? '2px solid #60a5fa' : '2px solid transparent',
                zIndex: 1,
              }}>{i + 1}</div>
              <div style={{
                fontSize: 9, color: i <= stageIdx ? '#94a3b8' : '#334155',
                textAlign: 'center', marginTop: 6, lineHeight: 1.3,
                fontWeight: i === stageIdx ? 600 : 400,
              }}>{s}</div>
              {i < STAGES.length - 1 && (
                <div style={{ position: 'absolute', top: 13, left: '50%', width: '100%', height: 2, background: i < stageIdx ? '#0066CB' : '#1e293b', zIndex: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', background: '#0d1117' }}>
        {([
          { id: 'status' as const, label: 'Loan Status', badge: 0 },
          { id: 'documents' as const, label: 'Documents', badge: pendingDocs },
          { id: 'messages' as const, label: 'Messages', badge: unreadMessages },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 24px', border: 'none', background: 'transparent',
            color: tab === t.id ? '#e2e8f0' : '#475569', cursor: 'pointer',
            fontFamily: "'DM Mono', monospace", fontSize: 12,
            borderBottom: tab === t.id ? '2px solid #0066CB' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {t.label}
            {t.badge > 0 && (
              <span style={{ background: '#f87171', color: '#fff', borderRadius: 999, padding: '1px 6px', fontSize: 10, fontWeight: 600 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {tab === 'status' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>
                Current Stage: {stage}
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>
                {STAGE_DESCRIPTIONS[stage] || 'Your loan is being processed.'}
              </p>
            </div>
            <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Loan Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <Detail label="Property" value={deal.property_address} />
                <Detail label="Product" value={deal.product?.toUpperCase()} />
                <Detail label="Loan Amount" value={deal.loan_amount ? formatMoney(deal.loan_amount) : '—'} />
                <Detail label="LTV" value={deal.ltv} />
                <Detail label="Term" value={deal.term} />
                <Detail label="Borrowing Entity" value={deal.borrower_llc} />
              </div>
            </div>
          </div>
        )}

        {tab === 'documents' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
              Documents required for your {deal.product?.toUpperCase()} loan.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {requiredDocuments.map(d => <DocRow key={d.id} doc={d} />)}
              {requiredDocuments.length === 0 && (
                <div style={{ fontSize: 12, color: '#64748b', padding: 24, textAlign: 'center' }}>
                  No documents requested yet.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'messages' && (
          <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 12 }}>
              {messages.length === 0 && (
                <div style={{ fontSize: 12, color: '#64748b', padding: 24, textAlign: 'center' }}>No messages yet.</div>
              )}
              {messages.map(m => (
                <div key={m.id} style={{ alignSelf: m.sender_role === 'borrower' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                  <div style={{
                    background: m.sender_role === 'borrower' ? '#0066CB22' : '#0d1117',
                    border: `1px solid ${m.sender_role === 'borrower' ? '#0066CB33' : '#1e293b'}`,
                    borderRadius: 8, padding: 12,
                  }}>
                    <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>
                      {m.sender_name || m.sender_role} · {new Date(m.created_at).toLocaleString()}
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>
                      {m.body}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={msgEndRef} />
            </div>
            <div style={{ paddingTop: 12, borderTop: '1px solid #1e293b', fontSize: 11, color: '#64748b', textAlign: 'center' }}>
              Reply functionality coming next. For urgent items, email <a href="mailto:angela@818capitalpartners.com" style={{ color: '#60a5fa' }}>angela@818capitalpartners.com</a>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DocRow({ doc }: { doc: RequiredDoc }) {
  const stateConfig: Record<RequiredDoc['state'], { color: string; label: string }> = {
    not_started: { color: '#facc15', label: '● Needed' },
    in_progress: { color: '#60a5fa', label: '◐ In progress' },
    submitted: { color: '#a78bfa', label: '↑ Submitted' },
    accepted: { color: '#4ade80', label: '✓ Accepted' },
    rejected: { color: '#f87171', label: '✗ Rejected' },
  };
  const cfg = stateConfig[doc.state] || stateConfig.not_started;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#0d1117', border: '1px solid #1e293b', borderRadius: 8, padding: '12px 16px',
    }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 13, color: '#e2e8f0' }}>
        {doc.display_name}
        {doc.required && <span style={{ fontSize: 10, color: '#64748b', marginLeft: 8 }}>required</span>}
      </div>
      <div style={{ fontSize: 10, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {cfg.label}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#e2e8f0' }}>{value || '—'}</div>
    </div>
  );
}

function formatMoney(v: number | string) {
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  if (!isFinite(n) || n === 0) return String(v || '—');
  return `$${n.toLocaleString()}`;
}

const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#64748b', border: '1px solid #1e293b', borderRadius: 6, padding: '8px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: 'pointer' };
