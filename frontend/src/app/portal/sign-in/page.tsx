'use client';

/**
 * Borrower portal sign-in. OAuth providers are gated by NEXT_PUBLIC_OAUTH_PROVIDERS.
 * All four buttons are coded; env controls visibility so providers light up as
 * their consoles get wired (no code change needed when Apple/Facebook are ready).
 */

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowser, enabledOAuthProviders } from '../../../lib/supabase/browser';
import type { Provider } from '@supabase/supabase-js';

type ProviderId = 'google' | 'azure' | 'apple' | 'facebook';

const PROVIDER_META: Record<ProviderId, { label: string; bg: string; fg: string; border: string; Icon: () => JSX.Element }> = {
  google:   { label: 'Continue with Google',    bg: '#fff',    fg: '#1f2937', border: '1px solid #e5e7eb', Icon: GoogleIcon },
  azure:    { label: 'Continue with Microsoft', bg: '#fff',    fg: '#1f2937', border: '1px solid #e5e7eb', Icon: MicrosoftIcon },
  apple:    { label: 'Continue with Apple',     bg: '#000',    fg: '#fff',    border: '1px solid #000',    Icon: AppleIcon },
  facebook: { label: 'Continue with Facebook',  bg: '#1877F2', fg: '#fff',    border: '1px solid #1877F2', Icon: FacebookIcon },
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={fullCenter} />}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const params = useSearchParams();
  const initialError = params.get('error');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string>(initialError || '');

  const supabase = createSupabaseBrowser();

  const handleSignIn = async (provider: ProviderId) => {
    setError('');
    setBusy(provider);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/portal`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: { redirectTo },
      });
      if (error) throw error;
      // Browser redirects to provider; nothing else runs here.
    } catch (e) {
      setBusy(null);
      setError((e as Error).message || 'Sign-in failed. Try again.');
    }
  };

  const visible = enabledOAuthProviders().filter((p): p is ProviderId => p in PROVIDER_META);

  return (
    <div style={fullCenter}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: '#0066CB' }}>818</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#94a3b8', marginTop: 4 }}>Borrower Portal</div>
        </div>

        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
          Sign in to access your loan portal.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.length === 0 && (
            <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center', padding: 12 }}>
              No sign-in providers are enabled. Set NEXT_PUBLIC_OAUTH_PROVIDERS in Vercel.
            </div>
          )}

          {visible.map(p => {
            const m = PROVIDER_META[p];
            const Icon = m.Icon;
            const isBusy = busy === p;
            return (
              <button
                key={p}
                onClick={() => handleSignIn(p)}
                disabled={!!busy}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: m.bg, color: m.fg, border: m.border,
                  borderRadius: 6, padding: '11px 20px',
                  fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
                  cursor: busy ? 'wait' : 'pointer',
                  opacity: busy && !isBusy ? 0.5 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                <Icon />
                <span>{isBusy ? 'Redirecting…' : m.label}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div style={{ fontSize: 12, color: '#f87171', marginTop: 14, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ fontSize: 11, color: '#475569', marginTop: 24, textAlign: 'center', lineHeight: 1.6 }}>
          Use the email address we have on file for your loan.<br />
          Trouble signing in? <a href="mailto:angela@818capitalpartners.com" style={{ color: '#60a5fa' }}>angela@818capitalpartners.com</a>
        </div>
      </div>
    </div>
  );
}

// --- Icons (inline SVG, no external deps) ---

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff">
      <path d="M17.05 12.04c-.03-2.94 2.4-4.35 2.51-4.42-1.37-2-3.5-2.28-4.26-2.31-1.81-.18-3.54 1.07-4.46 1.07-.93 0-2.34-1.04-3.85-1.01-1.98.03-3.8 1.15-4.82 2.92-2.06 3.57-.53 8.85 1.48 11.75.98 1.42 2.15 3.02 3.69 2.96 1.48-.06 2.04-.96 3.83-.96 1.78 0 2.29.96 3.85.93 1.59-.03 2.6-1.45 3.57-2.88 1.13-1.65 1.59-3.25 1.61-3.34-.04-.02-3.09-1.18-3.13-4.69zM14.45 3.41c.82-1 1.37-2.39 1.22-3.77-1.18.05-2.61.79-3.46 1.78-.76.88-1.42 2.29-1.24 3.65 1.31.1 2.66-.67 3.48-1.66z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073" />
    </svg>
  );
}

const fullCenter: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f' };
const card: React.CSSProperties = { width: 380, background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12, padding: 32 };
