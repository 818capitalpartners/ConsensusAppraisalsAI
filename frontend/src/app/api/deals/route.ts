import { NextRequest, NextResponse } from 'next/server';

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
  lenders: string[];
  narrative: string;
  next_steps?: string;
}

// ── AI Narrative ─────────────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return '[AI analysis unavailable — contact us for a full Sponsor Brief]';
  }
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 300,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '[Analysis pending]';
  } catch {
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

// ── Static lender programs (replaces DB query) ───────────────────────────────

const LENDER_PROGRAMS: Record<string, { name: string; minDscr?: number; minFico?: number }[]> = {
  dscr: [
    { name: 'Angel Oak', minDscr: 1.0, minFico: 660 },
    { name: 'Kiavi', minDscr: 0.75, minFico: 680 },
    { name: 'Visio Lending', minDscr: 1.0, minFico: 660 },
    { name: 'Griffin Funding', minDscr: 0.75, minFico: 620 },
    { name: 'CoreVest', minDscr: 1.0, minFico: 660 },
  ],
  flip: [
    { name: 'Kiavi' },
    { name: 'RCN Capital' },
    { name: 'Lima One Capital' },
    { name: 'CoreVest' },
  ],
  str: [
    { name: 'Angel Oak', minDscr: 1.0, minFico: 660 },
    { name: 'Visio Lending', minDscr: 1.0, minFico: 660 },
    { name: 'Griffin Funding', minDscr: 0.75, minFico: 620 },
  ],
  multifamily: [
    { name: 'Freddie Mac SBL' },
    { name: 'Fannie Mae Small Loans' },
    { name: 'Arbor Realty Trust' },
    { name: 'Ready Capital' },
    { name: 'CREFCOA' },
  ],
};

function matchLenders(
  lane: string,
  dscr?: number,
  ficoBand?: string,
): string[] {
  const programs = LENDER_PROGRAMS[lane] || [];
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

  const lenders = matchLenders('dscr', dscr, ficoBand);

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
    lane: 'dscr', dscr: Math.round(dscr * 100) / 100, score, lenders, narrative,
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
    score, lenders: matchLenders('flip'), narrative,
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

  const lenders = matchLenders('str', dscr, ficoBand);

  const narrative = await callAI(`You are an STR underwriter at 818 Capital.

Annual STR income: $${annualStr.toLocaleString()}, Monthly (gross): $${monthlyStr.toLocaleString()},
Conservative (75%): $${conservative.toLocaleString()}, PITI: $${piti.toFixed(2)}, DSCR: ${dscr.toFixed(2)},
FICO: ${ficoBand}, Loan: $${loanAmount.toLocaleString()}, Score: ${score.toUpperCase()}

Write 2-3 sentences: does this STR work for DSCR, risk factors, docs needed. Tone: direct, practical.`);

  return {
    lane: 'str', dscr: Math.round(dscr * 100) / 100, conservative_monthly: conservative,
    score, lenders, narrative,
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

  const lenders = matchLenders('multifamily');

  const narrative = await callAI(`You are a multifamily/commercial underwriter at 818 Capital.

Sponsor Brief: Units: ${units}, NOI: $${noi.toLocaleString()}, Value: $${purchase.toLocaleString()},
Loan: $${loanAmount.toLocaleString()}, Cap: ${(capRate * 100).toFixed(2)}%, DSCR: ${dscr.toFixed(2)},
LTV: ${(ltv * 100).toFixed(1)}%, Debt yield: ${(debtYield * 100).toFixed(2)}%, Score: ${score.toUpperCase()}

Write 3-4 sentences: viability, metrics summary, best financing path, required docs. Tone: professional.`);

  return {
    lane: 'multifamily', noi, cap_rate: Math.round(capRate * 10000) / 10000,
    dscr: Math.round(dscr * 100) / 100, ltv: Math.round(ltv * 1000) / 1000,
    debt_yield: Math.round(debtYield * 10000) / 10000,
    score, lenders, narrative,
  };
}

// ── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const person: PersonInput = body.person;
    const deal: DealInput = body.deal;

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

    // Generate a pseudo deal ID (no DB)
    const dealId = `WEB-${Date.now().toString(36).toUpperCase()}`;

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
