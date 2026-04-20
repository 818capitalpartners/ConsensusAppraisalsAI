import { NextRequest, NextResponse } from 'next/server';
import { captureLead, type LeadInput } from '@/lib/leads';

/**
 * Universal contact / lead capture endpoint.
 *
 * Called by:
 *   - ExitIntentPopup.tsx       (exit intent email capture)
 *   - InlineLeadCapture.tsx     (inline playbook CTA blocks)
 *   - LeadMagnetModal.tsx       (modal gated download)
 *   - ChatWidget.tsx            (when the AI captures contact info)
 *   - playbook landing pages    (after we redirect them from placeholder webhooks)
 *
 * Shape is intentionally loose — callers pass whatever they have. We map
 * the common lib/api.ts `subscribeContact` payload shape into LeadInput.
 */

// Force Node.js runtime (not edge) — Monday GraphQL can run long; also
// avoids subtle Resend/edge incompatibility.
export const runtime = 'nodejs';

type LegacyPayload = {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  investor_type?: string;
  tags?: string[];
  source?: string;
};

function mapSourceToLeadInputSource(raw?: string): LeadInput['source'] {
  switch (raw) {
    case 'exit_intent_popup':
    case 'inline_lead_capture':
    case 'lead_magnet_modal':
    case 'chat_widget':
    case 'dscr_playbook':
    case 'flip_playbook':
    case 'str_playbook':
    case 'deal_form':
    case 'broker_program':
    case 'calculator_dscr':
      return raw;
    default:
      return 'unknown';
  }
}

export async function POST(req: NextRequest) {
  let body: LegacyPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.email || !body.email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const lead: LeadInput = {
    email: body.email.toLowerCase().trim(),
    firstName: body.first_name,
    lastName: body.last_name,
    phone: body.phone,
    company: body.company,
    tags: body.tags,
    leadType: body.investor_type === 'broker' ? 'broker' : 'investor',
    source: mapSourceToLeadInputSource(body.source),
    pageUrl: req.headers.get('referer') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  };

  const result = await captureLead(lead);

  // We return 200 even on partial failures — the user's UX shouldn't
  // break because Monday or Resend had a hiccup. Detailed error info
  // is logged to Vercel server logs via console.error inside captureLead.
  return NextResponse.json(
    {
      ok: result.ok,
      id: result.mondayItemId,
      notified: result.notified,
    },
    { status: result.ok ? 200 : 202 }, // 202 = accepted but couldn't fully process
  );
}
