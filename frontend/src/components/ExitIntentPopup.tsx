'use client';

import { useState, useEffect, useCallback } from 'react';
import { subscribeContact } from '@/lib/api';
import { trackExitIntentShow, trackExitIntentConvert } from '@/lib/tracking';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const dismiss = useCallback(() => {
    setIsVisible(false);
    sessionStorage.setItem('818_exit_dismissed', 'true');
    // Suppress for 7 days
    localStorage.setItem('818_exit_dismiss_ts', Date.now().toString());
  }, []);

  useEffect(() => {
    // Don't show if already converted
    if (localStorage.getItem('818_has_converted')) return;
    // Don't show if dismissed this session
    if (sessionStorage.getItem('818_exit_dismissed')) return;
    // Don't show if dismissed within 7 days
    const dismissTs = localStorage.getItem('818_exit_dismiss_ts');
    if (dismissTs && Date.now() - parseInt(dismissTs) < 7 * 24 * 60 * 60 * 1000) return;

    // Wait 10 seconds before enabling detection
    const enableTimer = setTimeout(() => {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 5) {
          setIsVisible(true);
          trackExitIntentShow();
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, 10000);

    return () => clearTimeout(enableTimer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await subscribeContact({
        first_name: name,
        email,
        tags: ['exit_intent'],
        source: 'exit_intent_popup',
      });
      trackExitIntentConvert();
      localStorage.setItem('818_has_converted', 'true');
      setStatus('success');
      setTimeout(dismiss, 3000);
    } catch {
      setStatus('error');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button onClick={dismiss} className="absolute top-4 right-4 text-navy-400 hover:text-navy-700 transition z-10">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-h4 text-navy-900">You&apos;re in!</p>
              <p className="mt-2 text-sm text-navy-500 font-body">We&apos;ll send your rate estimate shortly.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
                  </svg>
                </div>
                <h3 className="text-xl font-sans font-bold text-navy-900">
                  Before you go — get a free rate estimate
                </h3>
                <p className="mt-2 text-sm text-navy-500 font-body">
                  Drop your email and we&apos;ll send you current rates for DSCR, fix-and-flip, and STR loans.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input w-full"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input w-full"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : 'Send My Rate Estimate'}
                </button>
                {status === 'error' && (
                  <p className="text-sm text-red-600 text-center">Something went wrong. Try again.</p>
                )}
              </form>
              <button onClick={dismiss} className="w-full mt-3 text-xs text-navy-400 hover:text-navy-600 transition font-body text-center">
                No thanks, I&apos;ll figure it out myself
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
