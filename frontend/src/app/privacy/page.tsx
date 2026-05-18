import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How 818 Capital Partners collects, uses, and protects information you submit through our website, loan applications, SMS messaging, and phone communications.',
  alternates: { canonical: 'https://www.818capitalpartners.com/privacy' },
  robots: { index: true, follow: true },
};

// Last updated date is rendered server-side at build time so it's consistent
// for every visitor and visible to A2P 10DLC reviewers.
const EFFECTIVE_DATE = 'May 17, 2026';

export default function PrivacyPage() {
  return (
    <section className="bg-warm-bg min-h-screen">
      {/* Editorial top rule, matches /apply */}
      <div className="border-t-2 border-gold" />

      <article className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <header className="mb-12">
          <p className="text-xs font-sans font-semibold uppercase tracking-wide3 text-gold">
            818 Capital Partners
          </p>
          <h1 className="mt-4 text-3xl md:text-5xl font-sans font-bold text-warm-ink leading-[1.1]">
            Privacy Policy
          </h1>
          <div className="mt-5 h-px w-12 bg-gold-line" />
          <p className="mt-5 text-sm text-warm-ink/60 font-body">
            Effective {EFFECTIVE_DATE}.
          </p>
        </header>

        <div className="bg-white rounded-soft border border-gold-line/60 shadow-whisper p-8 md:p-12 space-y-10">
          {/* ── 01 ── */}
          <Section number="01" title="Who we are">
            <p>
              818 Capital Partners (&ldquo;<strong className="text-warm-ink">818 Capital</strong>,&rdquo;
              &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a real estate finance brokerage,
              NMLS ID{' '}
              <a
                href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/2832335"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-gold-line underline-offset-2 hover:text-warm-ink"
              >
                #2832335
              </a>, that arranges DSCR rental, fix &amp; flip, short-term rental, and multifamily
              investment property financing across 48 states.
            </p>
            <p>
              This policy explains what we collect when you visit our website, submit a deal,
              text or call us, or work with us through closing — and what we do with it.
              It applies to information collected through{' '}
              <Link href="/" className="underline decoration-gold-line underline-offset-2 hover:text-warm-ink">www.818capitalpartners.com</Link>,
              our SMS programs, our email programs, and our loan-origination workflow.
            </p>
          </Section>

          {/* ── 02 ── */}
          <Section number="02" title="Information we collect">
            <p>
              We only collect information that&apos;s useful for evaluating, communicating about,
              or closing a real estate financing transaction.
            </p>
            <SubHead>From you, when you submit a deal or contact us</SubHead>
            <List>
              <li>Name, email, phone number, role (investor / broker), and time-zone preference.</li>
              <li>Property address, state, ZIP, value, requested loan amount.</li>
              <li>Deal-specific financials (rent, rehab budget, ARV, NOI, units, FICO range, experience level).</li>
              <li>Free-text notes you choose to share (timeline, prior rejections, partner info).</li>
            </List>
            <SubHead>Automatically, when you visit the site</SubHead>
            <List>
              <li>IP address, browser/device type, referrer, and pages viewed.</li>
              <li>Cookies and similar technologies used by Google Analytics and our paid-media partners (Meta, LinkedIn) to measure ad performance.</li>
            </List>
            <SubHead>From our service providers</SubHead>
            <List>
              <li>Call and text records (transcripts, durations, timestamps) from OpenPhone, our business phone provider.</li>
              <li>Public-record property data, credit-report data (only when you authorize a soft or hard pull), and lender-side decisions during loan shopping.</li>
            </List>
          </Section>

          {/* ── 03 ── */}
          <Section number="03" title="How we use information">
            <List>
              <li>Underwrite and triage your deal (DSCR/LTC/LTV/cap-rate analysis and program matching).</li>
              <li>Contact you about your file by phone, email, and — if you&apos;ve opted in — SMS.</li>
              <li>Shop your file to capital partners (private lenders, agency lenders, banks) who may be a fit. We share only the information necessary for those lenders to issue a term sheet.</li>
              <li>Communicate post-closing servicing handoffs (insurance, title, escrow).</li>
              <li>Improve our website, materials, and underwriting models in aggregate, non-identifiable form.</li>
              <li>Comply with applicable laws (BSA/AML/OFAC, fair-lending rules, state-licensing requirements).</li>
            </List>
            <p>
              We <strong className="text-warm-ink">do not sell your personal information</strong> to data brokers, list vendors, or
              advertising networks.
            </p>
          </Section>

          {/* ── 04 — SMS / A2P 10DLC compliance section ── */}
          <Section number="04" title="SMS messaging (text messages)">
            <p>
              We use SMS to communicate with borrowers and brokers about active loan files —
              status updates, missing-document reminders, scheduling, and replies to your inquiries.
              Participation is <strong className="text-warm-ink">always opt-in and always optional</strong>.
            </p>

            <SubHead>What you&apos;ll receive</SubHead>
            <List>
              <li><strong className="text-warm-ink">Conversational replies</strong> when you text or call us first.</li>
              <li><strong className="text-warm-ink">Transactional updates</strong> on your loan file (status changes, missing docs, appointment reminders).</li>
              <li>We do <strong className="text-warm-ink">not</strong> send unsolicited marketing or promotional SMS.</li>
            </List>

            <SubHead>How you opt in</SubHead>
            <p>
              By checking the SMS-consent box on our <Link href="/apply" className="underline decoration-gold-line underline-offset-2 hover:text-warm-ink">loan application</Link>,
              by texting us directly, or by giving us verbal consent during a call (which we
              document). Opt-in is express and is not a condition of any loan or service.
            </p>

            <SubHead>Frequency, rates, and opt-out</SubHead>
            <List>
              <li>Message frequency varies — typically <strong className="text-warm-ink">1–3 messages per week</strong> during an active loan file, lower otherwise.</li>
              <li>Message and data rates may apply, based on your mobile carrier&apos;s plan.</li>
              <li>Reply <strong className="text-warm-ink">STOP</strong> at any time to unsubscribe. We&apos;ll send a one-time confirmation and stop further messages.</li>
              <li>Reply <strong className="text-warm-ink">HELP</strong> to receive our business name and contact information.</li>
              <li>Reply <strong className="text-warm-ink">START</strong> to resume after a prior opt-out (only valid if you previously opted in).</li>
            </List>

            <SubHead>Mobile information sharing</SubHead>
            <p className="bg-gold-soft/40 border-l-2 border-gold pl-4 py-2 italic">
              No mobile information will be shared with third parties or affiliates for marketing
              or promotional purposes. Information sharing to subcontractors in support services,
              such as customer service, is permitted. All other categories exclude text messaging
              originator opt-in data and consent; this information will not be shared with any
              third parties.
            </p>

            <p>
              Carriers (T-Mobile, AT&amp;T, Verizon, etc.) are not liable for delayed or undelivered
              messages.
            </p>
          </Section>

          {/* ── 05 ── */}
          <Section number="05" title="Who we share information with">
            <List>
              <li>
                <strong className="text-warm-ink">Capital partners</strong> — when shopping your file. They receive only what&apos;s needed
                to underwrite (deal numbers, sponsor profile). We do not pre-shop your file without
                a reasonable belief you want to proceed.
              </li>
              <li>
                <strong className="text-warm-ink">Service providers</strong> — phone (OpenPhone), email (Brevo, Google Workspace),
                CRM (Monday.com, Supabase, Salesforce), analytics (Google Analytics), document
                storage (OneDrive). All are contractually bound to confidentiality.
              </li>
              <li>
                <strong className="text-warm-ink">Title, escrow, insurance, and appraisal vendors</strong> — when your file moves into closing.
              </li>
              <li>
                <strong className="text-warm-ink">Regulators and law enforcement</strong> — when required by law (subpoena, BSA/AML
                reporting, fair-lending audits).
              </li>
            </List>
          </Section>

          {/* ── 06 ── */}
          <Section number="06" title="GLBA notice (financial-privacy)">
            <p>
              As a real-estate finance broker, we are subject to the federal Gramm-Leach-Bliley
              Act (GLBA) and its Safeguards Rule. We treat your non-public personal financial
              information (NPI) as confidential, restrict internal access on a need-to-know
              basis, and maintain administrative, technical, and physical safeguards including
              encryption-in-transit (TLS 1.2+), access controls on our underwriting systems,
              and a written information-security program.
            </p>
            <p>
              If we materially change how we share NPI, we&apos;ll send you a revised GLBA notice
              and give you a chance to opt out where applicable.
            </p>
          </Section>

          {/* ── 07 ── */}
          <Section number="07" title="Cookies and analytics">
            <p>
              We use Google Analytics to understand which loan products visitors find most useful,
              and Meta and LinkedIn pixels to measure paid-ad performance. You can disable
              cookies in your browser, install the{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-gold-line underline-offset-2 hover:text-warm-ink"
              >
                Google Analytics opt-out
              </a>, or use a browser&apos;s tracking-protection mode. Functional cookies (session,
              CSRF) cannot be disabled.
            </p>
          </Section>

          {/* ── 08 ── */}
          <Section number="08" title="Your rights">
            <p>You may, at any time:</p>
            <List>
              <li>Request a copy of the personal information we hold about you.</li>
              <li>Ask us to correct inaccurate information.</li>
              <li>Ask us to delete your information (subject to record-retention obligations under federal banking and state-licensing rules — typically 36 months minimum on loan files).</li>
              <li>Withdraw consent to SMS (reply STOP) or email marketing (use the unsubscribe link).</li>
              <li>Opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information — though, as noted, we do not sell.</li>
            </List>
            <p>
              <strong className="text-warm-ink">California residents (CCPA/CPRA)</strong> have additional rights including the right to
              know the categories of information collected and to direct deletion. Submit any
              request to{' '}
              <a href="mailto:deals@818capitalpartners.com" className="underline decoration-gold-line underline-offset-2 hover:text-warm-ink">
                deals@818capitalpartners.com
              </a> with &ldquo;Privacy Request&rdquo; in the subject line. We&apos;ll respond within
              45 days.
            </p>
          </Section>

          {/* ── 09 ── */}
          <Section number="09" title="Retention">
            <p>
              We retain loan-file information for the longer of: (a) the period required by
              federal banking and state-licensing record-retention rules (typically three years
              after loan closing or last action on a declined file), and (b) the period needed
              to defend against any legal claims. Aggregated, de-identified analytics may be
              retained indefinitely.
            </p>
          </Section>

          {/* ── 10 ── */}
          <Section number="10" title="Children">
            <p>
              Our services are not directed to anyone under 18. We do not knowingly collect
              information from children. If you believe a child has submitted information,
              contact us and we&apos;ll delete it.
            </p>
          </Section>

          {/* ── 11 ── */}
          <Section number="11" title="Changes to this policy">
            <p>
              We&apos;ll update this page when our practices change. Material changes — particularly
              to how we share NPI — will be communicated by email to active clients. The
              &ldquo;Effective&rdquo; date at the top of the page reflects the most recent revision.
            </p>
          </Section>

          {/* ── 12 ── */}
          <Section number="12" title="Contact us">
            <p>
              Privacy questions, requests, or concerns:
            </p>
            <address className="not-italic bg-gold-soft/40 rounded-soft border border-gold-line/50 px-4 py-3 text-sm">
              <strong className="text-warm-ink">818 Capital Partners</strong><br />
              Email:{' '}
              <a href="mailto:deals@818capitalpartners.com" className="underline decoration-gold-line underline-offset-2 hover:text-warm-ink">
                deals@818capitalpartners.com
              </a><br />
              Phone:{' '}
              <a href="tel:+19179939194" className="underline decoration-gold-line underline-offset-2 hover:text-warm-ink">
                (917) 993-9194
              </a><br />
              NMLS{' '}
              <a
                href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/2832335"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-gold-line underline-offset-2 hover:text-warm-ink"
              >
                #2832335
              </a>
            </address>
          </Section>
        </div>

        <p className="mt-10 text-center text-xs text-warm-ink/50 font-body">
          <span className="inline-block w-1 h-1 rounded-full bg-gold mr-2 align-middle" />
          This policy is provided for transparency and does not create any contract or right of action.
        </p>
      </article>
    </section>
  );
}

// ── Local typographic primitives — warm/gold, no global side effects ──

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warm-ink text-warm-bg text-xs font-sans font-bold tabular-nums">
          {number}
        </span>
        <h2 className="text-xl font-sans font-bold text-warm-ink">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-warm-ink/80 font-body leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-xs font-sans font-semibold uppercase tracking-wide1 text-warm-ink">
      {children}
    </p>
  );
}

function List({ children }: { children: React.ReactNode }) {
  // Hairline dot bullets to match the editorial aesthetic. Callers pass plain
  // <li> elements; we re-wrap each one with a gold dot prefix.
  const items = React.Children.toArray(children).filter(
    (c): c is React.ReactElement<{ children?: React.ReactNode }> => React.isValidElement(c),
  );
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2 inline-block w-1 h-1 rounded-full bg-gold flex-shrink-0" />
          <span className="flex-1">{item.props.children}</span>
        </li>
      ))}
    </ul>
  );
}
