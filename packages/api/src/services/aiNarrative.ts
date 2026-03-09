import OpenAI from 'openai';

/**
 * AI Narrative Generator for 818 Capital.
 *
 * When OPENAI_API_KEY is set → uses GPT-4o for rich, contextual deal narratives.
 * When missing → generates smart template-based narratives from the math.
 *
 * Each lane gets its own prompt and template.
 */

let openai: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (openai) return openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === '') return null;
  openai = new OpenAI({ apiKey: key });
  return openai;
}

// ─── Types ──────────────────────────────────────────────

export interface NarrativeInput {
  lane: string;
  score: string; // green | yellow | red
  metrics: Record<string, unknown>;
  programCount: number;        // branded programs (client-facing count)
  scenarios?: Array<{ label: string; profit: number; roi: number }>;
  // Internal only — never exposed to client
  _internalLenderCount?: number;
  _internalLenderNames?: string[];
}

export interface NarrativeOutput {
  headline: string;     // One-line deal verdict
  analysis: string;     // 2-3 sentence deal analysis
  strengths: string[];  // What's working
  risks: string[];      // What to watch
  nextSteps: string[];  // Recommended actions
  aiGenerated: boolean; // true = GPT, false = template
}

// ─── GPT Narrative ──────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert deal analyst at 818 Capital Partners, a direct private lender specializing in DSCR, Fix & Flip, STR, and Multifamily loans for real estate investors.

IMPORTANT BRANDING RULES — you MUST follow these:
- 818 Capital Partners IS the lender. We fund deals directly through our lending programs.
- NEVER mention "lenders", "lender network", "shopping deals", "matching lenders", or any broker language.
- Use "our programs", "our lending programs", "818 Capital programs", or "financing options" instead.
- NEVER reveal or reference any third-party lender names.
- Refer to qualifying products as "programs" — e.g. "You qualify for 3 of our programs."
- When mentioning next steps, say things like "submit for pricing", "lock your rate", "our team will structure the best terms" — never "we'll shop this" or "find a lender."

Your tone is:
- Direct and confident, not salesy
- Numbers-forward — always reference the actual metrics
- Actionable — tell them what to do next
- Honest about risks — if something is tight, say so
- Positioned as a DIRECT LENDER, not a middleman

You NEVER use generic filler. Every sentence references specific deal metrics.

Output ONLY valid JSON with this exact structure:
{
  "headline": "One punchy sentence summarizing the deal verdict (max 15 words)",
  "analysis": "2-3 sentences analyzing the deal. Reference specific numbers like DSCR, LTV, cap rate, profit margins. Explain WHY the deal scores the way it does.",
  "strengths": ["3-4 specific strengths referencing actual numbers"],
  "risks": ["2-3 specific risks or watchpoints"],
  "nextSteps": ["2-3 concrete next steps for this specific deal"]
}`;

function buildUserPrompt(input: NarrativeInput): string {
  const { lane, score, metrics, programCount, scenarios } = input;

  const scoreLabel = score === 'green' ? 'STRONG (Green)' : score === 'yellow' ? 'WORKABLE (Yellow)' : 'NEEDS WORK (Red)';

  let prompt = `Analyze this ${lane.toUpperCase()} deal that scored ${scoreLabel}.\n\n`;
  prompt += `Key Metrics:\n`;

  for (const [key, value] of Object.entries(metrics)) {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    if (typeof value === 'number') {
      if (value >= 10000) {
        prompt += `- ${label}: $${value.toLocaleString()}\n`;
      } else if (value > 0 && value < 20) {
        prompt += `- ${label}: ${value.toFixed(2)}\n`;
      } else {
        prompt += `- ${label}: ${value}\n`;
      }
    } else {
      prompt += `- ${label}: ${value}\n`;
    }
  }

  if (scenarios && scenarios.length > 0) {
    prompt += `\nProfit Scenarios:\n`;
    for (const s of scenarios) {
      prompt += `- ${s.label}: $${s.profit.toLocaleString()} profit (${s.roi}% ROI)\n`;
    }
  }

  if (programCount > 0) {
    prompt += `\nQualifying Programs: ${programCount} of our lending programs fit this deal.\n`;
  }

  return prompt;
}

async function generateGPTNarrative(input: NarrativeInput): Promise<NarrativeOutput> {
  const client = getClient();
  if (!client) throw new Error('No OpenAI client');

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 600,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(input) },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty GPT response');

  const parsed = JSON.parse(content);

  return {
    headline: parsed.headline || 'Deal analysis complete.',
    analysis: parsed.analysis || '',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    risks: Array.isArray(parsed.risks) ? parsed.risks : [],
    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
    aiGenerated: true,
  };
}

// ─── Template Narratives (Fallback) ─────────────────────

function templateDSCR(input: NarrativeInput): NarrativeOutput {
  const m = input.metrics;
  const dscr = Number(m.dscr) || 0;
  const ltv = Number(m.ltv) || 0;
  const fico = Number(m.estimatedFico) || 0;
  const rent = Number(m.monthlyRent) || 0;
  const piti = Number(m.estimatedPITI) || 0;

  const headline =
    input.score === 'green'
      ? `Strong DSCR at ${dscr}x — ready to submit.`
      : input.score === 'yellow'
      ? `DSCR of ${dscr}x is workable — let's optimize the structure.`
      : `DSCR of ${dscr}x needs restructuring to qualify.`;

  const strengths: string[] = [];
  const risks: string[] = [];

  if (dscr >= 1.25) strengths.push(`DSCR of ${dscr}x exceeds the standard 1.25x threshold — strong cash flow coverage.`);
  else if (dscr >= 1.0) strengths.push(`DSCR of ${dscr}x meets minimum program requirements.`);

  if (fico >= 720) strengths.push(`Credit score of ${fico} qualifies for best-tier pricing.`);
  else if (fico >= 680) strengths.push(`Credit score of ${fico} is in the standard qualification range.`);

  if (ltv <= 75) strengths.push(`Conservative LTV at ${ltv}% — strong equity position.`);
  else if (ltv <= 80) strengths.push(`LTV at ${ltv}% is within standard guidelines.`);

  if (rent > 0 && piti > 0) strengths.push(`Monthly rent of $${rent.toLocaleString()} against $${piti.toLocaleString()} PITI shows healthy cash flow.`);

  if (input.programCount > 0) strengths.push(`Qualifies for ${input.programCount} of our lending programs.`);

  if (dscr < 1.0) risks.push(`DSCR below 1.0x means the property doesn't cash-flow at current rent — consider rate buydowns or higher down payment.`);
  if (fico < 680) risks.push(`FICO below 680 limits program options and increases rate premiums.`);
  if (ltv > 80) risks.push(`LTV above 80% narrows qualifying programs and may require reserves.`);
  if (dscr >= 1.0 && dscr < 1.15) risks.push(`DSCR is tight — rent increases, vacancy, or rate changes could push it below minimum.`);

  const nextSteps: string[] = [];
  if (input.score === 'green') {
    nextSteps.push('Submit for pricing — this deal qualifies for immediate processing.');
    nextSteps.push('Lock in your rate before market moves.');
  } else if (input.score === 'yellow') {
    nextSteps.push('Call us to discuss structuring options — a higher down payment or rate buydown could push this to green.');
    nextSteps.push('Our team can structure terms around flexible DSCR thresholds.');
  } else {
    nextSteps.push('Consider increasing down payment to lower LTV and improve DSCR.');
    nextSteps.push('Explore rent optimization — can market rent support a higher number?');
    nextSteps.push('Call us to discuss — some deals work better as a different product lane.');
  }

  const analysis =
    input.score === 'green'
      ? `This DSCR deal looks strong with a ${dscr}x coverage ratio and ${ltv}% LTV. The property cash-flows well at $${rent.toLocaleString()}/month rent against $${piti.toLocaleString()}/month estimated PITI. This deal qualifies for our best programs — we can move to pricing immediately.`
      : input.score === 'yellow'
      ? `This DSCR deal is workable but has some tight areas. The ${dscr}x coverage ratio is close to program minimums, and at ${ltv}% LTV, there's room to optimize the structure. Our team can structure the right terms to get this closed.`
      : `This DSCR deal needs restructuring. At ${dscr}x DSCR, the cash flow doesn't cover debt service by enough margin for our programs. Consider increasing down payment, optimizing rent, or exploring a different product lane.`;

  return { headline, analysis, strengths, risks, nextSteps, aiGenerated: false };
}

function templateFlip(input: NarrativeInput): NarrativeOutput {
  const m = input.metrics;
  const ltc = Number(m.ltc) || 0;
  const totalCost = Number(m.totalCost) || 0;
  const arv = Number(m.arv) || 0;
  const purchasePrice = Number(m.purchasePrice) || 0;
  const rehabBudget = Number(m.rehabBudget) || 0;
  const timeline = Number(m.timelineMonths) || 6;

  const midProfit = input.scenarios?.[1]?.profit || 0;
  const midROI = input.scenarios?.[1]?.roi || 0;

  const headline =
    input.score === 'green'
      ? `Solid flip — $${(midProfit / 1000).toFixed(0)}K profit at 95% ARV.`
      : input.score === 'yellow'
      ? `Workable flip with $${(midProfit / 1000).toFixed(0)}K projected at 95%.`
      : `Thin margins — $${(midProfit / 1000).toFixed(0)}K at 95% ARV leaves little cushion.`;

  const strengths: string[] = [];
  const risks: string[] = [];

  if (ltc < 70) strengths.push(`Low LTC of ${ltc.toFixed(1)}% — strong equity cushion.`);
  else if (ltc < 80) strengths.push(`LTC of ${ltc.toFixed(1)}% is within standard flip lending range.`);

  if (midProfit > 50000) strengths.push(`$${(midProfit / 1000).toFixed(0)}K projected profit at 95% ARV is well above our $30K minimum threshold.`);
  else if (midProfit > 30000) strengths.push(`$${(midProfit / 1000).toFixed(0)}K profit at the conservative scenario clears the $30K baseline.`);

  if (midROI > 20) strengths.push(`${midROI}% ROI in ${timeline} months is strong for a flip timeline.`);

  const spread = arv - totalCost;
  if (spread > 0) strengths.push(`$${(spread / 1000).toFixed(0)}K spread between total cost and ARV provides room for error.`);

  if (input.programCount > 0) strengths.push(`Qualifies for ${input.programCount} of our bridge/flip programs.`);

  if (ltc > 85) risks.push(`LTC above 85% is aggressive — limits leverage options and increases underwriting scrutiny.`);
  if (midProfit < 20000) risks.push(`Profit below $20K at 95% ARV leaves almost no room for cost overruns or market softening.`);
  if (rehabBudget > purchasePrice * 0.5) risks.push(`Rehab budget is ${((rehabBudget / purchasePrice) * 100).toFixed(0)}% of purchase price — scope risk is elevated.`);
  if (timeline > 9) risks.push(`${timeline}-month timeline increases holding costs — aim for 6 months or less.`);

  const nextSteps: string[] = [];
  if (input.score === 'green') {
    nextSteps.push('Submit for term sheet — we can close in 5-10 days.');
    nextSteps.push('Get your contractor SOW ready for underwriting review.');
  } else if (input.score === 'yellow') {
    nextSteps.push('Let\'s review the rehab budget — tightening scope could improve margins.');
    nextSteps.push('Consider negotiating purchase price to widen the spread.');
  } else {
    nextSteps.push('Re-evaluate ARV comps — is the after-repair value realistic?');
    nextSteps.push('Negotiate purchase price down to create more margin.');
    nextSteps.push('Consider reducing rehab scope to a lighter renovation.');
  }

  const analysis =
    input.score === 'green'
      ? `Strong flip opportunity with $${(purchasePrice / 1000).toFixed(0)}K purchase, $${(rehabBudget / 1000).toFixed(0)}K rehab, and $${(arv / 1000).toFixed(0)}K ARV. At ${ltc.toFixed(1)}% LTC, the deal offers $${(midProfit / 1000).toFixed(0)}K profit even at 95% of ARV. We can fund this in under 10 days.`
      : input.score === 'yellow'
      ? `This flip has potential but the margins are tighter than ideal. With $${(midProfit / 1000).toFixed(0)}K profit at 95% ARV and ${ltc.toFixed(1)}% LTC, it's workable but leaves less room for surprises. Structure optimization could push this into green territory.`
      : `The numbers on this flip are tight. At ${ltc.toFixed(1)}% LTC and only $${(midProfit / 1000).toFixed(0)}K projected profit at 95% ARV, there's not enough cushion for construction overruns or market shifts. Consider renegotiating or re-scoping.`;

  return { headline, analysis, strengths, risks, nextSteps, aiGenerated: false };
}

function templateSTR(input: NarrativeInput): NarrativeOutput {
  const m = input.metrics;
  const strDscr = Number(m.strDscr) || 0;
  const capRate = Number(m.capRate) || 0;
  const monthlyRevenue = Number(m.monthlyRevenue) || 0;
  const netMonthlyIncome = Number(m.netMonthlyIncome) || 0;
  const occupancyRate = Number(m.occupancyRate) || 70;
  const piti = Number(m.estimatedPITI) || 0;

  const headline =
    input.score === 'green'
      ? `Strong STR — ${strDscr}x DSCR with ${capRate}% cap rate.`
      : input.score === 'yellow'
      ? `STR deal workable at ${strDscr}x DSCR — let's optimize the structure.`
      : `STR income doesn't cover debt at ${strDscr}x DSCR.`;

  const strengths: string[] = [];
  const risks: string[] = [];

  if (strDscr >= 1.25) strengths.push(`STR-adjusted DSCR of ${strDscr}x exceeds program thresholds with strong cash flow.`);
  else if (strDscr >= 1.0) strengths.push(`DSCR of ${strDscr}x meets minimum for our STR-eligible programs.`);

  if (capRate >= 7) strengths.push(`${capRate}% cap rate is excellent for a short-term rental property.`);
  else if (capRate >= 5) strengths.push(`${capRate}% cap rate is solid for the STR market.`);

  if (netMonthlyIncome > piti) strengths.push(`Net income of $${netMonthlyIncome.toLocaleString()}/mo exceeds $${piti.toLocaleString()}/mo PITI — positive cash flow.`);

  if (input.programCount > 0) strengths.push(`Qualifies for ${input.programCount} of our STR-eligible programs.`);

  if (occupancyRate > 85) risks.push(`${occupancyRate}% occupancy assumption may be aggressive — we typically haircut to 75%.`);
  if (strDscr < 1.0) risks.push(`DSCR below 1.0x means the rental income doesn't cover mortgage — won't qualify for our programs at current structure.`);
  if (capRate < 4) risks.push(`Cap rate below 4% is low even for a premium STR market — verify revenue assumptions.`);
  risks.push(`STR income is seasonal and market-dependent — lenders may apply a 25% haircut to Airbnb projections.`);

  const nextSteps: string[] = [];
  if (input.score === 'green') {
    nextSteps.push('Submit with T12 Airbnb/VRBO income statements for best pricing.');
    nextSteps.push('Our STR programs can close in 2-3 weeks.');
  } else if (input.score === 'yellow') {
    nextSteps.push('Provide actual booking data — real T12 income outperforms projections with lenders.');
    nextSteps.push('Consider increasing down payment to offset occupancy risk.');
  } else {
    nextSteps.push('Re-run numbers with actual (not projected) rental income.');
    nextSteps.push('Consider this as a traditional DSCR rental with long-term tenant income instead.');
  }

  const analysis =
    input.score === 'green'
      ? `This STR deal generates $${monthlyRevenue.toLocaleString()}/mo gross revenue at ${occupancyRate}% occupancy, netting $${netMonthlyIncome.toLocaleString()}/mo after management fees. With a ${strDscr}x DSCR and ${capRate}% cap rate, it clears our program thresholds comfortably. We can move to pricing right away.`
      : input.score === 'yellow'
      ? `The STR income produces a ${strDscr}x DSCR after adjusting for ${occupancyRate}% occupancy and management fees. This is tight but workable with the right program structure. Real booking history (T12) will strengthen the application significantly.`
      : `At ${strDscr}x DSCR, this STR property doesn't cash-flow enough to cover debt service after adjusting for occupancy and management fees. Revenue projections may need validation, or consider restructuring with more equity.`;

  return { headline, analysis, strengths, risks, nextSteps, aiGenerated: false };
}

function templateMultifamily(input: NarrativeInput): NarrativeOutput {
  const m = input.metrics;
  const noi = Number(m.noi) || 0;
  const capRate = Number(m.capRate) || 0;
  const dscr = Number(m.dscr) || 0;
  const units = Number(m.units) || 0;
  const pricePerUnit = Number(m.pricePerUnit) || 0;
  const purchasePrice = Number(m.purchasePrice) || 0;
  const expenseRatio = Number(m.expenseRatio) || 45;

  const headline =
    input.score === 'green'
      ? `Strong ${units}-unit deal — ${capRate}% cap, ${dscr}x DSCR.`
      : input.score === 'yellow'
      ? `${units}-unit deal workable at ${dscr}x DSCR — needs right structure.`
      : `${units}-unit deal tight at ${dscr}x DSCR and ${capRate}% cap.`;

  const strengths: string[] = [];
  const risks: string[] = [];

  if (dscr >= 1.25) strengths.push(`DSCR of ${dscr}x exceeds standard commercial program thresholds.`);
  else if (dscr >= 1.1) strengths.push(`DSCR of ${dscr}x meets minimum for our experienced sponsor programs.`);

  if (capRate >= 7) strengths.push(`${capRate}% cap rate is strong for multifamily — solid return on investment.`);
  else if (capRate >= 5.5) strengths.push(`${capRate}% cap rate is market-rate for stabilized multifamily.`);

  if (noi > 0) strengths.push(`$${(noi / 1000).toFixed(0)}K annual NOI on a ${units}-unit property.`);

  if (units >= 10) strengths.push(`${units} units provides scale and diversified income risk.`);

  if (input.programCount > 0) strengths.push(`Qualifies for ${input.programCount} of our multifamily programs.`);

  if (dscr < 1.1) risks.push(`DSCR below 1.1x is tight — our multifamily programs typically require 1.20x+.`);
  if (capRate < 5) risks.push(`Cap rate below 5% requires strong sponsor experience and market thesis to get funded.`);
  if (expenseRatio > 55) risks.push(`${expenseRatio}% expense ratio is above the ${units > 20 ? '40-45%' : '45-50%'} norm — validate OpEx assumptions.`);
  if (pricePerUnit > 200000) risks.push(`$${(pricePerUnit / 1000).toFixed(0)}K/unit is elevated — verify comp support for this pricing.`);
  if (units < 5) risks.push(`Under 5 units may not qualify for commercial multifamily programs — DSCR may be better.`);

  const nextSteps: string[] = [];
  if (input.score === 'green') {
    nextSteps.push('Submit with T12 rent roll and P&L for term sheet.');
    nextSteps.push('We can provide preliminary quotes within 48 hours.');
  } else if (input.score === 'yellow') {
    nextSteps.push('Value-add opportunity? If NOI can increase post-reno, submit with a business plan.');
    nextSteps.push('Share rent roll and expense breakdown — our team will structure the best terms.');
  } else {
    nextSteps.push('Review expense ratio — can operating costs be reduced?');
    nextSteps.push('Explore value-add bridge financing if NOI is expected to improve.');
    nextSteps.push('Consider negotiating purchase price to improve cap rate and DSCR.');
  }

  const analysis =
    input.score === 'green'
      ? `This ${units}-unit multifamily at $${(purchasePrice / 1000000).toFixed(2)}M ($${(pricePerUnit / 1000).toFixed(0)}K/unit) generates $${(noi / 1000).toFixed(0)}K NOI with a ${capRate}% cap rate and ${dscr}x DSCR. The fundamentals are strong for both bridge and permanent financing. We can move to term sheet immediately.`
      : input.score === 'yellow'
      ? `This ${units}-unit deal produces a ${capRate}% cap rate and ${dscr}x DSCR. The numbers are workable but would benefit from NOI improvement or purchase price negotiation. Our value-add bridge programs may be the best fit if you have a business plan.`
      : `At ${capRate}% cap rate and ${dscr}x DSCR, this ${units}-unit deal is below most program thresholds. The $${(pricePerUnit / 1000).toFixed(0)}K/unit pricing relative to the NOI doesn't produce enough debt service coverage. Renegotiation or value-add repositioning needed.`;

  return { headline, analysis, strengths, risks, nextSteps, aiGenerated: false };
}

// ─── Main Export ─────────────────────────────────────────

export async function generateNarrative(input: NarrativeInput): Promise<NarrativeOutput> {
  const client = getClient();

  // Try GPT first
  if (client) {
    try {
      console.log(`🤖 Generating GPT narrative for ${input.lane} deal...`);
      const narrative = await generateGPTNarrative(input);
      console.log(`✅ GPT narrative generated for ${input.lane}`);
      return narrative;
    } catch (err) {
      console.error('GPT narrative failed, falling back to template:', err);
    }
  }

  // Fallback to template
  console.log(`📝 Using template narrative for ${input.lane} deal (no API key or GPT failed)`);
  switch (input.lane) {
    case 'dscr':
      return templateDSCR(input);
    case 'flip':
      return templateFlip(input);
    case 'str':
      return templateSTR(input);
    case 'multifamily':
      return templateMultifamily(input);
    default:
      return {
        headline: 'Deal analysis complete.',
        analysis: `This ${input.lane} deal scored ${input.score}. Our team will review and identify the best program.`,
        strengths: [],
        risks: [],
        nextSteps: ['Submit for a detailed analysis from our team.'],
        aiGenerated: false,
      };
  }
}
