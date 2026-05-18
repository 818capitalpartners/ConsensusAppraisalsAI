'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Sig {
  slug: string;
  name: string;
  title: string;
  email: string;
  headshot: string;
}

export default function SignaturePicker({ signatures }: { signatures: Sig[] }) {
  const [selected, setSelected] = useState<string>(signatures[0]?.slug || '');
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');

  const current = signatures.find((s) => s.slug === selected);

  // Copy the rich HTML from inside the iframe to the clipboard. Outlook Web
  // accepts rich-content paste; Outlook desktop is mixed (works ~80% of the
  // time). The download-HTML fallback below covers the rest.
  async function copySignatureToClipboard() {
    if (!current) return;
    setCopyState('copying');
    try {
      const iframe = document.getElementById(`sig-preview-${current.slug}`) as HTMLIFrameElement | null;
      const doc = iframe?.contentDocument;
      if (!doc) throw new Error('iframe not loaded');

      // Find the signature table — it's the first <table> inside the body
      // (the install file's <body> contains: instructions div, then the table).
      const table = doc.querySelector('table');
      if (!table) throw new Error('no signature table found');

      const html = table.outerHTML;
      const plain = (table.textContent || '').replace(/\s+/g, ' ').trim();

      // ClipboardItem with both rich + plain — Outlook prefers the HTML flavor.
      // Falls back to plain-text clipboard if the rich-clipboard API isn't available.
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([plain], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText }),
        ]);
      } else {
        await navigator.clipboard.writeText(html);
      }
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2500);
    } catch (e) {
      console.error('[signature] copy failed:', e);
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 3000);
    }
  }

  const copyLabel: Record<typeof copyState, string> = {
    idle: 'Copy signature to clipboard',
    copying: 'Copying…',
    copied: '✓ Copied — paste in Outlook Signatures',
    error: 'Couldn\'t auto-copy — use the install page link below',
  };

  return (
    <div className="space-y-8">
      {/* Person picker */}
      <div className="grid grid-cols-2 gap-3">
        {signatures.map((s) => {
          const active = s.slug === selected;
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => {
                setSelected(s.slug);
                setCopyState('idle');
              }}
              className={`flex items-center gap-4 p-4 rounded-soft border transition text-left ${
                active
                  ? 'border-gold bg-gold-soft/60'
                  : 'border-warm-ink/10 hover:border-warm-ink/30 bg-white'
              }`}
            >
              <Image
                src={s.headshot}
                alt={s.name}
                width={56}
                height={56}
                className="rounded-full border border-gold-line/60 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-sans font-semibold text-warm-ink">{s.name}</p>
                <p className="text-xs text-warm-ink/60 font-body mt-0.5">{s.title}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Preview + actions */}
      {current && (
        <div className="bg-white rounded-soft border border-gold-line/60 shadow-whisper overflow-hidden">
          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gold-line/40">
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wide1 text-warm-ink">
                Preview · {current.name}
              </p>
              <p className="text-xs text-warm-ink/60 font-body">
                Email: <span className="text-warm-ink">{current.email}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copySignatureToClipboard}
                disabled={copyState === 'copying'}
                className="inline-flex items-center justify-center rounded-soft bg-warm-ink px-5 py-2.5 text-xs font-sans font-semibold uppercase tracking-caps text-warm-bg transition hover:bg-warm-ink/90 focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-50"
              >
                {copyLabel[copyState]}
              </button>
              <a
                href={`/signature/${current.slug}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-soft border border-warm-ink/20 px-5 py-2.5 text-xs font-sans font-semibold uppercase tracking-caps text-warm-ink transition hover:border-warm-ink"
              >
                Open install page →
              </a>
            </div>
          </div>

          {/* Iframe preview — loads the canonical install file */}
          <iframe
            id={`sig-preview-${current.slug}`}
            key={current.slug /* force-remount on switch */}
            src={`/signature/${current.slug}.html`}
            title={`${current.name} signature preview`}
            className="w-full h-[560px] border-0 bg-white"
          />
        </div>
      )}

      {/* Install steps */}
      <div className="bg-gold-soft/40 rounded-soft border border-gold-line/60 p-6 md:p-8">
        <p className="text-xs font-sans font-semibold uppercase tracking-wide2 text-gold">
          Install in Outlook
        </p>
        <h2 className="mt-2 text-lg font-sans font-bold text-warm-ink">Three steps, takes ~60 seconds</h2>
        <ol className="mt-4 space-y-3 text-sm text-warm-ink/80 font-body counter-reset-list">
          <Step n="01">
            Click <strong className="text-warm-ink">Copy signature to clipboard</strong> above.
            (Or open the install page and use Ctrl+A / Ctrl+C the old way.)
          </Step>
          <Step n="02">
            In Outlook, go to <strong className="text-warm-ink">Settings → Mail → Signatures</strong>{' '}
            (Outlook Web) or <strong className="text-warm-ink">File → Options → Mail → Signatures</strong> (desktop).
            Create a new signature, paste with <strong className="text-warm-ink">Ctrl+V</strong>.
          </Step>
          <Step n="03">
            Set the new signature as default for <strong className="text-warm-ink">new messages and replies</strong>.
            Save. Send a test to yourself + reply to confirm images load on the reply.
          </Step>
        </ol>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-warm-ink text-warm-bg text-xs font-sans font-bold tabular-nums flex-shrink-0">
        {n}
      </span>
      <span className="flex-1 pt-1">{children}</span>
    </li>
  );
}
