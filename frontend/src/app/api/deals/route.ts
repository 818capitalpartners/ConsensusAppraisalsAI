import { NextRequest, NextResponse } from 'next/server';
import { priceLoan, PricingResult } from '@/lib/pricing-engine';
import { captureLead, type LeadInput } from '@/lib/leads';
import { sbUpsert } from '@/lib/supabase';
import { normalizePhone } from '@/lib/quo-webhook';

export const runtime = 'nodejs';

/**
 * Persist SMS opt-in consent against the contacts table. Best-effort —
 * failures here must NEVER block the deal submission. TCPA audit requires
 * a timestamp + source + IP at the moment of opt-in.
 */
async function recordSmsConsent(args: {
  phone: string | undefined;
  ip: string | undefined;
  source: string;
}): Promise<void> {
  const phone = normalizePhone(args.phone);
  if (!phone) return;
  try {
    await sbUpsert(
      'contacts',
      {
        phone,
        sms_opted_in_at: new Date().toISOString(),
        sms_opt_in_source: args.source,
        sms_opt_in_ip: args.ip || null,
        // Clear any prior opt-out — express re-consent overrides STOP history.
        sms_opt_out_at: null,
        sms_opt_out_keyword: null,
      },
      'phone',
    );
  } catch (e) {
    console.error('[deals] recordSmsConsent failed:', (e as Error).message);
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

interface PersonInput {
  type?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface DealInput {
  product_lane: 'dscr' | 'flip' | 'str' | 'multifamily';
  lead_type?: string;
  channel?: string;
  property_address?: string;
  property_city?: string;
  property_state?: string;
  property_zip?: string;
  property_type?: string;
  units?: number;
  financials?: Record<string, number | string>;
}

// ── Document Checklists by Lane ─────────────────────────────────────────────

const DOCUMENTS_NEEDED: Record<string, string[]> = {
  dscr: [
    'Credit report',
    'Entity docs (Articles of Organization, Operating Agreement, EIN letter)',
    'Purchase contract or payoff statement (refinance)',
    'Lease agreements (current)',
    'Insurance quote (dwelling coverage)',
    'Bank statements (2 months, all accounts)',
  ],
  flip: [
    'Credit report',
    'Entity docs (Articles of Organization, Operating Agreement, EIN letter)',
    'Purchase contract',
    'Rehab budget / Scope of Work (SOW)',
    'Contractor bids (minimum 2)',
    'Insurance quote (builder\'s risk policy)',
    'Experience resume (completed projects with addresses)',
  ],
  str: [
    'Credit report',
    'Entity docs (Articles of Organization, Operating Agreement, EIN letter)',
    'Purchase contract or payoff statement (refinance)',
    'AirDNA report or Airbnb/VRBO statements (trailing 12 months)',
    'Insurance quote (STR-specific dwelling coverage)',
  ],
  multifamily: [
    'Credit report',
    'Entity docs (Articles of Organization, Operating Agreement, EIN letter)',
    'T-12 operating statement (trailing 12-month P&L)',
    'Current rent roll',
    'Purchase contract or payoff statement (refinance)',
    'Phase 1 environmental report (if >4 units)',
  ],
};

interface TriageResult {
  lane: string;
  score: 'green' | 'yellow' | 'red';
  dscr?: number;
  ltc?: number;
  max_ltc?: number;
  noi?: number;
  cap_rate?: number;
  ltv?: number;
  debt_yield?: number;
  conservative_monthly?: number;
  profit_scenarios?: { profit100: number; profit95: number; profit90: number };
  // CRITICAL: NEVER expose lender names. Only generic program types.
  programs_available: string[];
  narrative: string;
  next_steps?: string;
}

// ── AI Narrative ─────────────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return '[AI analysis unavailable — contact us for a full Sponsor Brief]';
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        // Haiku is fast + cheap for short underwriter summaries (~$0.001/call).
        // Bump to claude-sonnet-4-5 if narratives need more nuance.
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    // Anthropic response shape: { content: [{ type: 'text', text: '...' }], ... }
    const text = data?.content?.[0]?.text?.trim();
    if (text) return text;
    // Surface the real error to Vercel logs instead of silently returning a stub
    if (data?.error) {
      console.error('[deals.callAI] Anthropic error:', data.error);
    }
    return '[Analysis pending]';
  } catch (e) {
    console.error('[deals.callAI] fetch failed:', e);
    return '[AI analysis temporarily unavailable]';
  }
}

// ── Utility ──────────────────────────────────────────────────────────────────

function estimatePITI(loanAmount: number, value: number): number {
  if (!loanAmount || !value) return 0;
  const rate = 0.085 / 12;
  const n = 30 * 12;
  const pi = (loanAmount * rate) / (1 - Math.pow(1 + rate, -n));
  const ti = (value * 0.015) / 12;
  return pi + ti;
}

function num(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

// ── Generic Program Catalog (NEVER exposes lender names) ────────────────────
// Client sees only product types. Lender identity is internal-only and
// lives in pricing-engine.ts under private lender codes (AHL-001, ESC-001, etc.)

const PROGRAM_CATALOG: Record<string, { name: string; minDscr?: number; minFico?: number }[]> = {
  dscr: [
    { name: 'DSCR 30-Year Fixed', minDscr: 1.0, minFico: 660 },
    { name: 'DSCR 30-Year Fixed — Reduced Ratio', minDscr: 0.75, minFico: 680 },
    { name: 'DSCR 5/6 ARM', minDscr: 1.0, minFico: 680 },
    { name: 'DSCR 10-Year Interest-Only', minDscr: 1.0, minFico: 700 },
    { name: 'DSCR Bank-Statement Program', minDscr: 0.75, minFico: 660 },
  ],
  flip: [
    { name: '12-Month Bridge — Fix & Flip' },
    { name: '18-Month Bridge — Heavy Rehab' },
    { name: 'Ground-Up Construction' },
    { name: 'Bridge-to-DSCR Rollover' },
  ],
  str: [
    { name: 'STR DSCR 30-Year Fixed', minDscr: 1.0, minFico: 660 },
    { name: 'STR 10-Year Interest-Only', minDscr: 1.0, minFico: 700 },
    { name: 'STR Bank-Statement Program', minDscr: 0.75, minFico: 660 },
  ],
  multifamily: [
    { name: 'Agency Small-Balance (5-50 units)' },
    { name: 'Non-Recourse Bridge (Multifamily)' },
    { name: 'CMBS / Conduit (Permanent)' },
    { name: 'Mixed-Use Bridge' },
  ],
};

function matchPrograms(
  lane: string,
  dscr?: number,
  ficoBand?: string,
): string[] {
  const programs = PROGRAM_CATALOG[lane] || [];
  const ficoMap: Record<string, number> = {
    '<620': 600, '620-659': 630, '660-699': 675, '700-739': 715, '740+': 750,
  };
  const ficoNum = ficoMap[ficoBand || ''] || 700;

  return programs
    .filter((p) => {
      if (dscr !== undefined && p.minDscr && dscr < p.minDscr) return false;
      if (p.minFico && ficoNum < p.minFico) return false;
      return true;
    })
    .map((p) => p.name);
}

// ── Triage: DSCR ─────────────────────────────────────────────────────────────

async function triageDSCR(deal: DealInput): Promise<TriageResult> {
  const fin = deal.financials || {};
  const rent = num(fin.monthly_rent);
  const piti = num(fin.piti) || estimatePITI(num(fin.loan_amount), num(fin.estimated_value));
  const ficoBand = String(fin.fico_band || 'unknown');
  const loanAmount = num(fin.loan_amount);
  const dscr = piti > 0 ? rent / piti : 0;

  let score: 'green' | 'yellow' | 'red';
  if (dscr >= 1.15 && ['700-739', '740+'].includes(ficoBand)) score = 'green';
  else if (dscr >= 1.0) score = 'yellow';
  else score = 'red';

  const programs_available = matchPrograms('dscr', dscr, ficoBand);

  const narrative = await callAI(`You are a senior DSCR underwriter at 818 Capital.

Borrower scenario:
- Rent: $${rent.toFixed(2)}
- PITI: $${piti.toFixed(2)}
- DSCR: ${dscr.toFixed(2)}
- FICO band: ${ficoBand}
- Loan amount: $${loanAmount.toLocaleString()}
- 818 score: ${score.toUpperCase()}

Write 2-3 sentences explaining: 1) If this likely works for DSCR lending, 2) Rough LTV range, 3) Next steps and docs.
Tone: direct, numeric, no corporate buzzwords.`);

  return {
    lane: 'dscr', dscr: Math.round(dscr * 100) / 100, score, programs_available, narrative,
    next_steps: score === 'red'
      ? "We'll reach out to discuss restructuring."
      : "We'll review docs and aim to send a term sheet within 24 hours.",
  };
}

// ── Triage: Fix & Flip ───────────────────────────────────────────────────────

async function triageFlip(deal: DealInput): Promise<TriageResult> {
  const fin = deal.financials || {};
  const purchase = num(fin.purchase_price);
  const rehab = num(fin.rehab_budget);
  const arv = num(fin.arv);
  const loanAmount = num(fin.loan_amount);
  const experience = String(fin.experience_band || '0');

  const totalCost = purchase + rehab;
  const ltc = totalCost > 0 ? loanAmount / totalCost : 0;
  const costFactor = 0.10;
  const profit100 = arv - totalCost - (loanAmount * costFactor);
  const profit95 = (arv * 0.95) - totalCost - (loanAmount * costFactor);
  const profit90 = (arv * 0.90) - totalCost - (loanAmount * costFactor);

  let score: 'green' | 'yellow' | 'red';
  let maxLtc: number;
  if (profit90 > 0 && ['3-5', '6-10', '11+'].includes(experience)) {
    score = 'green'; maxLtc = 0.9;
  } else if (profit95 > 0) {
    score = 'yellow'; maxLtc = 0.8;
  } else {
    score = 'red'; maxLtc = 0.0;
  }

  const narrative = await callAI(`You are a fix & flip underwriter at 818 Capital.

Deal: Purchase: $${purchase.toLocaleString()}, Rehab: $${rehab.toLocaleString()}, ARV: $${arv.toLocaleString()},
Total cost: $${totalCost.toLocaleString()}, Loan: $${loanAmount.toLocaleString()}, Experience: ${experience} flips,
LTC: ${(ltc * 100).toFixed(1)}%, Profit @100%: $${profit100.toLocaleString()}, @95%: $${profit95.toLocaleString()}, @90%: $${profit90.toLocaleString()}
Score: ${score.toUpperCase()}

Write 2-3 sentences: is it a good flip, max LTC we'd offer, what to adjust if thin. Tone: blunt but helpful.`);

  return {
    lane: 'flip', ltc: Math.round(ltc * 1000) / 1000, max_ltc: maxLtc,
    profit_scenarios: { profit100, profit95, profit90 },
    score, programs_available: matchPrograms('flip'), narrative,
  };
}

// ── Triage: STR ──────────────────────────────────────────────────────────────

async function triageSTR(deal: DealInput): Promise<TriageResult> {
  const fin = deal.financials || {};
  const annualStr = num(fin.annual_str_income);
  const monthlyStr = annualStr / 12;
  const piti = num(fin.piti) || estimatePITI(num(fin.loan_amount), num(fin.estimated_value));
  const ficoBand = String(fin.fico_band || 'unknown');
  const loanAmount = num(fin.loan_amount);
  const conservative = monthlyStr * 0.75;
  const dscr = piti > 0 ? conservative / piti : 0;

  let score: 'green' | 'yellow' | 'red';
  if (dscr >= 1.25 && ['700-739', '740+'].includes(ficoBand)) score = 'green';
  else if (dscr >= 1.0) score = 'yellow';
  else score = 'red';

  const programs_available = matchPrograms('str', dscr, ficoBand);

  const narrative = await callAI(`You are an STR underwriter at 818 Capital.

Annual STR income: $${annualStr.toLocaleString()}, Monthly (gross): $${monthlyStr.toLocaleString()},
Conservative (75%): $${conservative.toLocaleString()}, PITI: $${piti.toFixed(2)}, DSCR: ${dscr.toFixed(2)},
FICO: ${ficoBand}, Loan: $${loanAmount.toLocaleString()}, Score: ${score.toUpperCase()}

Write 2-3 sentences: does this STR work for DSCR, risk factors, docs needed. Tone: direct, practical.`);

  return {
    lane: 'str', dscr: Math.round(dscr * 100) / 100, conservative_monthly: conservative,
    score, programs_available, narrative,
    next_steps: score === 'red'
      ? 'STR income may not support this loan. Consider larger down payment.'
      : "We'll need Airbnb/VRBO statements and AirDNA report. Term sheet in 24-48 hours.",
  };
}

// ── Triage: Multifamily ──────────────────────────────────────────────────────

async function triageMultifamily(deal: DealInput): Promise<TriageResult> {
  const fin = deal.financials || {};
  const noi = num(fin.noi);
  const purchase = num(fin.purchase_price) || num(fin.estimated_value);
  const loanAmount = num(fin.loan_amount);
  const units = deal.units || num(fin.units);

  const capRate = purchase > 0 ? noi / purchase : 0;
  const dscr = loanAmount > 0 ? noi / (loanAmount * 0.07) : 0;
  const ltv = purchase > 0 ? loanAmount / purchase : 0;
  const debtYield = loanAmount > 0 ? noi / loanAmount : 0;

  let score: 'green' | 'yellow' | 'red';
  if (dscr >= 1.25 && debtYield >= 0.08 && ltv <= 0.75) score = 'green';
  else if (dscr >= 1.1 && ltv <= 0.80) score = 'yellow';
  else score = 'red';

  const programs_available = matchPrograms('multifamily');

  const narrative = await callAI(`You are a multifamily/commercial underwriter at 818 Capital.

Sponsor Brief: Units: ${units}, NOI: $${noi.toLocaleString()}, Value: $${purchase.toLocaleString()},
Loan: $${loanAmount.toLocaleString()}, Cap: ${(capRate * 100).toFixed(2)}%, DSCR: ${dscr.toFixed(2)},
LTV: ${(ltv * 100).toFixed(1)}%, Debt yield: ${(debtYield * 100).toFixed(2)}%, Score: ${score.toUpperCase()}

Write 3-4 sentences: viability, metrics summary, best financing path, required docs. Tone: professional.`);

  return {
    lane: 'multifamily', noi, cap_rate: Math.round(capRate * 10000) / 10000,
    dscr: Math.round(dscr * 100) / 100, ltv: Math.round(ltv * 1000) / 1000,
    debt_yield: Math.round(debtYield * 10000) / 10000,
    score, programs_available, narrative,
  };
}

// ── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const person: PersonInput = body.person;
    const deal: DealInput = body.deal;
    const consent: { sms?: boolean } | undefined = body.consent;

    if (!person?.first_name || !person?.last_name || !person?.email) {
      return NextResponse.json(
        { error: 'Missing required fields: first_name, last_name, email' },
        { status: 400 },
      );
    }

    if (!deal?.product_lane) {
      return NextResponse.json(
        { error: 'Missing required field: product_lane' },
        { status: 400 },
      );
    }

    const dispatchers: Record<string, (d: DealInput) => Promise<TriageResult>> = {
      dscr: triageDSCR,
      flip: triageFlip,
      str: triageSTR,
      multifamily: triageMultifamily,
    };

    const handler = dispatchers[deal.product_lane];
    if (!handler) {
      return NextResponse.json(
        { error: `Unsupported product lane: ${deal.product_lane}` },
        { status: 400 },
      );
    }

    const triageResult = await handler(deal);

    // ── Pricing Engine ────────────────────────────────────────────────────
    const fin = deal.financials || {};
    let pricingParams: Record<string, any> = {};

    if (deal.product_lane === 'dscr' || deal.product_lane === 'str') {
      pricingParams = {
        fico: Number(fin.fico_band?.toString().replace(/[^0-9]/g, '')) || Number(fin.fico) || 720,
        ltv: Number(fin.ltv) || (Number(fin.loan_amount) && Number(fin.estimated_value)
          ? Number(fin.loan_amount) / Number(fin.estimated_value) : 0.75),
        loanAmount: Number(fin.loan_amount) || 300000,
        purpose: fin.purpose || 'purchase',
        propertyType: fin.property_type || deal.property_type || 'sfr',
        interestOnly: Boolean(fin.interest_only),
        isSTR: deal.product_lane === 'str' || Boolean(fin.is_str),
        dscr: triageResult.dscr || Number(fin.dscr) || undefined,
        prepayYears: Number(fin.prepay_years) ?? 3,
        bankStatements: Boolean(fin.bank_statements),
        state: deal.property_state || fin.state || undefined,
      };
    } else if (deal.product_lane === 'flip') {
      pricingParams = {
        fico: Number(fin.fico) || 720,
        experience: Number(fin.experience) || 0,
        ltc: Number(fin.ltc) || (Number(fin.loan_amount) && (Number(fin.purchase_price) + Number(fin.rehab_budget))
          ? Number(fin.loan_amount) / (Number(fin.purchase_price) + Number(fin.rehab_budget)) : 0.85),
        arv: Number(fin.arv) || 0,
        loanAmount: Number(fin.loan_amount) || 0,
        loanType: fin.loan_type || 'fix_flip',
        isJudicialState: Boolean(fin.is_judicial_state),
      };
    }

    // Run pricing (returns [] for multifamily or if no match)
    const pricingOptions: PricingResult[] = (deal.product_lane !== 'multifamily' && Object.keys(pricingParams).length > 0)
      ? priceLoan(deal.product_lane, pricingParams)
      : [];

    // Document checklist for this lane
    const documentsNeeded = DOCUMENTS_NEEDED[deal.product_lane] || [];

    // Generate a pseudo deal ID (no DB on the Next.js side — leads are
    // persisted to Monday.com Leads Board + emailed to Ravi via captureLead)
    const dealId = `WEB-${Date.now().toString(36).toUpperCase()}`;

    // ── Save the lead to Monday + email Ravi (fire-and-forget friendly) ──
    // We await to get the Monday item id so it can appear in the email CTA,
    // but any failure is logged inside captureLead — it never blocks the UX.
    const leadFin = (deal.financials || {}) as Record<string, unknown>;
    const estLoanAmount = Number(leadFin.loan_amount) || 0;

    // Strip lender identity before dropping into "Notes" per the hard rule
    // established in the prior "Scrub lender names from API" commit.
    const safeLenders = (triageResult.programs_available || []).join(', ');
    const summaryLines = [
      `DSCR: ${triageResult.dscr ?? '—'}`,
      triageResult.ltc !== undefined ? `LTC: ${(triageResult.ltc * 100).toFixed(1)}%` : null,
      triageResult.ltv !== undefined ? `LTV: ${(triageResult.ltv * 100).toFixed(1)}%` : null,
      triageResult.debt_yield !== undefined ? `Debt yield: ${(triageResult.debt_yield * 100).toFixed(2)}%` : null,
      '',
      `AI analysis: ${triageResult.narrative}`,
      '',
      `Programs matched: ${safeLenders || '(none)'}`,
      `Deal ID: ${dealId}`,
    ].filter(Boolean).join('\n');

    const leadInput: LeadInput = {
      email: person.email.toLowerCase().trim(),
      firstName: person.first_name,
      lastName: person.last_name,
      phone: person.phone,
      productLane: deal.product_lane,
      estLoanAmount,
      propertyState: deal.property_state,
      propertyCity: deal.property_city,
      source: 'deal_form',
      tags: [deal.product_lane, deal.lead_type === 'broker' ? 'broker' : 'investor'],
      leadType: deal.lead_type === 'broker' ? 'broker' : 'investor',
      dealScore: triageResult.score,
      dealSummary: summaryLines,
      pageUrl: req.headers.get('referer') || undefined,
    };

    // Intentionally not awaited — we don't want to slow the user-visible
    // response. Vercel lambdas keep the async context alive long enough
    // for the Monday + Resend calls to finish (~500ms typical).
    captureLead(leadInput).catch((err) =>
      console.error('[deals] captureLead failed', err),
    );

    // Record SMS opt-in if the borrower checked the box. Also fire-and-forget —
    // a Supabase outage must not block deal submission. The IP comes from
    // x-forwarded-for (Vercel populates this) for audit-grade consent proof.
    if (consent?.sms === true) {
      const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() ||
                 req.headers.get('x-real-ip') || undefined;
      recordSmsConsent({
        phone: person.phone,
        ip,
        source: deal.channel === 'apply_page' ? 'apply_form' : (deal.channel || 'apply_form'),
      }).catch(() => { /* already logged inside */ });
    }

    return NextResponse.json(
      {
        person: {
          id: null,
          type: person.type || 'investor',
          first_name: person.first_name,
          last_name: person.last_name,
          email: person.email,
        },
        deal: {
          id: dealId,
          product_lane: deal.product_lane,
          lead_type: deal.lead_type || 'investor',
          channel: deal.channel || 'web',
          status: 'new',
          property_address: deal.property_address,
          financials: deal.financials,
          ai_triage_result: triageResult,
          deal_score: triageResult.score,
          pricing_options: pricingOptions,
          documents_needed: documentsNeeded,
          next_steps: triageResult.next_steps || 'We\'ll review your submission and reach out within 24 hours.',
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Deal creation error:', err);
    return NextResponse.json(
      { error: 'Internal server error', detail: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
