import type { Metadata } from 'next';
import SignaturePicker from './SignaturePicker';
import { SIGNATURES } from './signatures';

export const metadata: Metadata = {
  title: 'Email Signature Install',
  description:
    'Install the 818 Capital Partners Outlook email signature. Self-serve install for Ravi Punn and Angela Klein.',
  // Not indexable — internal team tool, no SEO value
  robots: { index: false, follow: false },
};

export default function SignaturePage() {
  return (
    <section className="bg-warm-bg min-h-screen">
      <div className="border-t-2 border-gold" />

      <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
        <header className="mb-12">
          <p className="text-xs font-sans font-semibold uppercase tracking-wide3 text-gold">
            Internal · Email signature install
          </p>
          <h1 className="mt-4 text-3xl md:text-5xl font-sans font-bold text-warm-ink leading-[1.1]">
            Install your 818 signature.
          </h1>
          <div className="mt-5 h-px w-12 bg-gold-line" />
          <p className="mt-5 text-base text-warm-ink/70 font-body max-w-xl leading-relaxed">
            Pick your name below to open the install page. Copy the signature into
            <strong className="text-warm-ink"> Outlook → Settings → Signatures</strong>.
            Send a test reply to confirm images load.
          </p>
        </header>

        <SignaturePicker signatures={SIGNATURES as unknown as { slug: string; name: string; title: string; email: string; headshot: string }[]} />

        {/* Troubleshooting */}
        <div className="mt-12 bg-white rounded-soft border border-gold-line/60 shadow-whisper p-6 md:p-8">
          <p className="text-xs font-sans font-semibold uppercase tracking-wide2 text-gold">
            Troubleshooting
          </p>
          <h2 className="mt-2 text-lg font-sans font-bold text-warm-ink">If something isn&apos;t working</h2>
          <ul className="mt-4 space-y-3 text-sm text-warm-ink/80 font-body">
            <li className="flex items-start gap-3">
              <span className="mt-2 inline-block w-1 h-1 rounded-full bg-gold flex-shrink-0" />
              <span><strong className="text-warm-ink">Images don&apos;t load on reply.</strong> Outlook strips remote images by default in some configs. Recipient needs to click &ldquo;Download images&rdquo; once — after that, future replies load fine. The signature HTML uses absolute URLs to images hosted on www.818capitalpartners.com, so the underlying setup is correct.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 inline-block w-1 h-1 rounded-full bg-gold flex-shrink-0" />
              <span><strong className="text-warm-ink">Layout looks wrong / boxes broken.</strong> Outlook desktop occasionally re-flows the table when you paste plain HTML. Use Outlook Web (outlook.office.com) to install the first time — it preserves the table layout, then syncs to desktop.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 inline-block w-1 h-1 rounded-full bg-gold flex-shrink-0" />
              <span><strong className="text-warm-ink">Schedule-a-call button goes nowhere.</strong> The button links to a Google Calendar appointment slot URL specific to each person. If yours changes, edit the canonical file at <code className="bg-gold-soft/60 px-1 rounded-flat font-mono text-xs">C:\Users\ravip\818-signatures\</code> and redeploy.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
