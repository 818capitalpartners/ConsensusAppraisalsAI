'use client';

import { useState } from 'react';
import { subscribeContact } from '@/lib/api';
import { trackLeadMagnetDownload } from '@/lib/tracking';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadMagnetModal({ isOpen, onClose }: Props) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('investor');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await subscribeContact({
        first_name: firstName,
        email,
        investor_type: type,
        tags: ['lead_magnet', 'dscr_guide_2026'],
        source: 'lead_magnet_modal',
      });
      trackLeadMagnetDownload('dscr_guide_2026');
      localStorage.setItem('818_has_converted', 'true');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-navy-400 hover:text-navy-700 transition z-10">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-navy-900 px-8 py-8 text-center">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-2">Free Download</p>
          <h3 className="text-2xl font-sans font-bold text-white">The 2026 DSCR Investor Playbook</h3>
          <p className="mt-2 text-sm text-navy-300 font-body">
            Everything you need to qualify, structure, and close DSCR loans — from a direct lender.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-h4 text-navy-900 mb-2">Check your inbox!</h4>
              <p className="text-sm text-navy-500 font-body">
                We&apos;ve sent the DSCR Investor Playbook to <strong>{email}</strong>. If you don&apos;t see it, check your spam folder.
              </p>
              <button onClick={onClose} className="btn-primary mt-6">
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 mb-6 text-xs text-navy-500 font-body">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  DSCR requirements by lender
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Rate comparison charts
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Deal structuring strategies
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="input w-full"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input w-full"
                  />
                </div>
                <div>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input w-full"
                  >
                    <option value="investor">I&apos;m an Investor</option>
                    <option value="broker">I&apos;m a Broker / LO</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : 'Get the Free Playbook'}
                </button>
                {status === 'error' && (
                  <p className="text-sm text-red-600 text-center">Something went wrong. Try again.</p>
                )}
              </form>
              <p className="mt-4 text-xs text-navy-400 font-body text-center">
                No spam. Unsubscribe anytime. We respect your inbox.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
