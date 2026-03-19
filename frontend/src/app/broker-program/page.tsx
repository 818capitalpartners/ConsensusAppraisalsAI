'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { subscribeContact } from '@/lib/api';

export default function BrokerProgramPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.target as HTMLFormElement);
    try {
      await subscribeContact({
        email: fd.get('email'),
        first_name: fd.get('first_name'),
        last_name: fd.get('last_name'),
        phone: fd.get('phone'),
        company: fd.get('company'),
        type: 'broker',
        tags: ['tag_broker', 'broker_program'],
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <>
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&h=600&fit=crop"
          alt="Professional business meeting"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-navy-900/50" />
        <div className="relative mx-auto max-w-content px-6 py-16 md:py-20">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">Partner With Us</p>
          <h1 className="text-h1 text-white max-w-2xl">Broker Partner Program</h1>
          <p className="mt-4 text-lg text-navy-100 font-body font-light max-w-xl leading-relaxed">
            Send your investor deals to 818 Capital. We close them, you earn. AI-powered tools make you the smartest broker in the room.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2 className="section-heading">Why Partner With 818 Capital</h2>
              <div className="mt-8 space-y-6">
                {[
                  { title: 'AI Scenario Desk', desc: 'Run any deal through our AI before you submit it. Know the score before the lender does.' },
                  { title: 'Speed to Term Sheet', desc: '24-hour term sheets on DSCR and flip deals. Your clients stay engaged.' },
                  { title: 'Co-Marketing Tools', desc: 'We generate email templates, social captions, and one-pagers branded for your shop.' },
                  { title: 'Transparent Compensation', desc: 'Clear broker comp on every deal. No surprises, no clawbacks.' },
                  { title: 'Four Product Lanes', desc: 'DSCR, Fix & Flip, STR, and Multifamily. One relationship covers your entire book.' },
                ].map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <div className="w-1 bg-accent rounded-full flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-sans font-semibold text-navy-900">{b.title}</h4>
                      <p className="text-sm text-navy-500 font-body mt-1">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-navy-100 shadow-sm p-8">
              {submitted ? (
                <div className="py-12 text-center">
                  <svg className="w-12 h-12 text-success mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <h3 className="mt-4 text-h3 text-navy-900">You&apos;re In</h3>
                  <p className="mt-2 text-sm text-navy-500 font-body">
                    We&apos;ll reach out within 24 hours with your broker portal access and co-marketing kit.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-h3 text-navy-900 mb-6">Apply to Join</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input name="first_name" placeholder="First Name *" required className="input" />
                      <input name="last_name" placeholder="Last Name *" required className="input" />
                    </div>
                    <input name="email" type="email" placeholder="Email *" required className="input" />
                    <input name="phone" placeholder="Phone" className="input" />
                    <input name="company" placeholder="Company / Brokerage" className="input" />
                    <button type="submit" className="btn-primary w-full py-4">Apply Now</button>
                  </form>
                  {error && <p className="mt-3 text-sm text-red-600 font-body">{error}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
