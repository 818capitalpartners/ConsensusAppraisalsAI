'use client';

import { useState } from 'react';
import { subscribeContact } from '@/lib/api';
import { trackLeadMagnetDownload } from '@/lib/tracking';

export default function InlineLeadCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await subscribeContact({
        email,
        tags: ['lead_magnet', 'dscr_guide_2026'],
        source: 'inline_lead_capture',
      });
      trackLeadMagnetDownload('dscr_guide_2026');
      localStorage.setItem('818_has_converted', 'true');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section className="bg-green-50 border border-green-200 rounded-xl py-8 px-6 text-center my-12">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-sans font-semibold text-green-800">Check your inbox — the playbook is on its way.</p>
      </section>
    );
  }

  return (
    <section className="bg-navy-900 rounded-xl py-10 px-6 md:px-12 my-12">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-2">
          Free Download
        </p>
        <h3 className="text-2xl font-sans font-bold text-white">
          The 2026 DSCR Investor Playbook
        </h3>
        <p className="mt-3 text-sm text-navy-300 font-body max-w-md mx-auto">
          DSCR requirements, rate comparisons, and deal structuring strategies — from a direct lender that closes in 14 days.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-lg text-sm font-body bg-white text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary whitespace-nowrap disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending...' : 'Get It Free'}
          </button>
        </form>

        {status === 'error' && (
          <p className="mt-3 text-sm text-red-400">Something went wrong. Try again.</p>
        )}

        <p className="mt-4 text-xs text-navy-500 font-body">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
