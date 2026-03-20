import OpenAI from 'openai';
import type {
  ProductLane,
  MarketContext,
  ValueEstimate,
  AppraisalNarrative,
  PropertyDetails,
  ValueRange,
} from './valuationTypes';

/**
 * AI-Enhanced Appraisal Analysis — uses GPT-4o to generate valuation narratives,
 * comp adjustments, and confidence scoring beyond the calculator-based triage.
 * Falls back to template-based output when no API key is configured.
 */

let openai: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (openai) return openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === '') return null;
  openai = new OpenAI({ apiKey: key });
  return openai;
}

// ─── AI Valuation Enhancement ────────────────────────────

const APPRAISAL_SYSTEM_PROMPT = `You are a senior real estate appraiser and analyst at 818 Capital Partners, a direct private lender.

Your job is to analyze the provided market data, comparable sales, and property details to produce:
1. A valuation opinion with as-is and (if applicable) stabilized value ranges
2. A confidence assessment based on data quality
3. Notes for both the borrower and credit committee
4. Risk factors specific to this deal

IMPORTANT RULES:
- 818 Capital is a DIRECT LENDER. Never reference third-party lenders, brokers, or "shopping deals."
- Base your valuation on the comparable sales and market data provided.
- When data is thin (few comps, stale data), WIDEN your value range and LOWER your confidence.
- Be specific about WHY you adjusted values — reference specific comp data.
- Output ONLY valid JSON.

Output JSON structure:
{
  "asIs": { "low": number, "mid": number, "high": number },
  "stabilized": { "low": number, "mid": number, "high": number } | null,
  "confidenceScore": number (0-100),
  "methodology": ["string"],
  "narrative": {
    "headline": "One sentence valuation summary",
    "analysis": "2-3 paragraph analysis referencing specific data",
    "strengths": ["specific strength with data"],
    "risks": ["specific risk with data"],
    "nextSteps": ["actionable step"],
    "notesForBorrower": ["borrower-appropriate note"],
    "notesForCreditCommittee": ["internal credit note"]
  }
}`;

function buildAppraisalPrompt(
  lane: ProductLane,
  property: PropertyDetails,
  market: MarketContext,
  metrics: Record<string, unknown>,
): string {
  let prompt = `Analyze this ${lane.toUpperCase()} property for an AI-assisted appraisal.\n\n`;

  prompt += `## Subject Property\n`;
  prompt += `- Address: ${property.address ?? 'Not provided'}\n`;
  prompt += `- City/State/Zip: ${property.city ?? ''}, ${property.state ?? ''} ${property.zip ?? ''}\n`;
  prompt += `- Type: ${property.propertyType ?? 'Not specified'}\n`;
  prompt += `- Units: ${property.units ?? 'N/A'}\n`;
  prompt += `- Sq Ft: ${property.squareFeet ?? 'N/A'}\n`;
  prompt += `- Year Built: ${property.yearBuilt ?? 'N/A'}\n\n`;

  prompt += `## Market Data\n`;
  prompt += `- County: ${market.countyName ?? 'Unknown'} (FIPS: ${market.countyFips ?? 'N/A'})\n`;
  prompt += `- Median Sale Price: ${market.medianSalePrice ? `$${market.medianSalePrice.toLocaleString()}` : 'N/A'}\n`;
  prompt += `- Median $/SqFt: ${market.medianPricePerSqFt ? `$${market.medianPricePerSqFt.toFixed(0)}` : 'N/A'}\n`;
  prompt += `- Median Rent: ${market.medianRent ? `$${market.medianRent.toLocaleString()}/mo` : 'N/A'}\n`;
  prompt += `- YoY Appreciation: ${market.yearOverYearAppreciation != null ? `${market.yearOverYearAppreciation.toFixed(1)}%` : 'N/A'}\n`;
  prompt += `- Median DOM: ${market.medianDaysOnMarket ?? 'N/A'}\n`;
  prompt += `- Data Quality Score: ${market.dataQuality.score}/100\n`;
  if (market.dataQuality.flags.length > 0) {
    prompt += `- Data Quality Flags: ${market.dataQuality.flags.join('; ')}\n`;
  }
  prompt += `\n`;

  if (market.comparableSales.length > 0) {
    prompt += `## Comparable Sales (${market.comparableSales.length} found)\n`;
    for (const comp of market.comparableSales.slice(0, 10)) {
      prompt += `- ${comp.address}: $${comp.salePrice.toLocaleString()} (${comp.saleDate})`;
      if (comp.squareFeet) prompt += `, ${comp.squareFeet} sqft`;
      if (comp.pricePerSqFt) prompt += `, $${comp.pricePerSqFt.toFixed(0)}/sqft`;
      prompt += `\n`;
    }
    prompt += `\n`;
  }

  if (market.marketBands.length > 0) {
    prompt += `## Market Bands\n`;
    for (const band of market.marketBands) {
      prompt += `- ${band.bandType}: $${band.lowValue.toLocaleString()} - $${band.midValue.toLocaleString()} - $${band.highValue.toLocaleString()} (${band.confidenceLevel} confidence)\n`;
    }
    prompt += `\n`;
  }

  prompt += `## Deal Metrics\n`;
  for (const [key, value] of Object.entries(metrics)) {
    if (key.startsWith('_')) continue;
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    if (typeof value === 'number') {
      prompt += `- ${label}: ${value >= 10000 ? `$${value.toLocaleString()}` : value.toFixed(2)}\n`;
    } else if (value != null) {
      prompt += `- ${label}: ${value}\n`;
    }
  }

  if (lane === 'flip') {
    prompt += `\nNote: For fix & flip, provide both as-is (current) and stabilized (after-repair) value ranges.\n`;
  }

  return prompt;
}

// ─── GPT Call ────────────────────────────────────────────

interface GPTAppraisalOutput {
  asIs: ValueRange;
  stabilized: ValueRange | null;
  confidenceScore: number;
  methodology: string[];
  narrative: AppraisalNarrative;
}

async function generateGPTAppraisal(
  lane: ProductLane,
  property: PropertyDetails,
  market: MarketContext,
  metrics: Record<string, unknown>,
): Promise<GPTAppraisalOutput> {
  const client = getClient();
  if (!client) throw new Error('No OpenAI client configured');

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.4, // Lower temp for more consistent valuation opinions
    max_tokens: 1500,
    messages: [
      { role: 'system', content: APPRAISAL_SYSTEM_PROMPT },
      { role: 'user', content: buildAppraisalPrompt(lane, property, market, metrics) },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty GPT appraisal response');

  const parsed = JSON.parse(content);

  return {
    asIs: {
      low: parsed.asIs?.low ?? null,
      mid: parsed.asIs?.mid ?? null,
      high: parsed.asIs?.high ?? null,
    },
    stabilized: parsed.stabilized ? {
      low: parsed.stabilized.low ?? null,
      mid: parsed.stabilized.mid ?? null,
      high: parsed.stabilized.high ?? null,
    } : null,
    confidenceScore: Number(parsed.confidenceScore) || 50,
    methodology: Array.isArray(parsed.methodology) ? parsed.methodology : ['AI-assisted analysis'],
    narrative: {
      headline: parsed.narrative?.headline ?? 'Appraisal analysis complete.',
      analysis: parsed.narrative?.analysis ?? '',
      strengths: Array.isArray(parsed.narrative?.strengths) ? parsed.narrative.strengths : [],
      risks: Array.isArray(parsed.narrative?.risks) ? parsed.narrative.risks : [],
      nextSteps: Array.isArray(parsed.narrative?.nextSteps) ? parsed.narrative.nextSteps : [],
      notesForBorrower: Array.isArray(parsed.narrative?.notesForBorrower) ? parsed.narrative.notesForBorrower : [],
      notesForCreditCommittee: Array.isArray(parsed.narrative?.notesForCreditCommittee) ? parsed.narrative.notesForCreditCommittee : [],
      aiGenerated: true,
    },
  };
}

// ─── Template Fallback ───────────────────────────────────

function templateAppraisal(
  lane: ProductLane,
  property: PropertyDetails,
  market: MarketContext,
  metrics: Record<string, unknown>,
): GPTAppraisalOutput {
  // Build value estimate from market bands and metrics
  const priceBand = market.marketBands.find((b) => b.bandType === 'price');
  const purchasePrice = Number(metrics.purchasePrice) || 0;

  let asIs: ValueRange;
  if (priceBand) {
    asIs = { low: priceBand.lowValue, mid: priceBand.midValue, high: priceBand.highValue };
  } else if (purchasePrice > 0) {
    // Estimate +/- 10% from purchase price when no market data
    asIs = {
      low: Math.round(purchasePrice * 0.90),
      mid: purchasePrice,
      high: Math.round(purchasePrice * 1.10),
    };
  } else {
    asIs = { low: null, mid: null, high: null };
  }

  let stabilized: ValueRange | null = null;
  if (lane === 'flip') {
    const arv = Number(metrics.arv) || 0;
    if (arv > 0) {
      stabilized = {
        low: Math.round(arv * 0.90),
        mid: arv,
        high: Math.round(arv * 1.05),
      };
    }
  }

  // Confidence based on data quality
  const baseConfidence = market.dataQuality.score;
  const confidenceScore = Math.max(20, Math.min(95, baseConfidence));

  const methodology: string[] = [];
  if (market.comparableSales.length > 0) methodology.push('Sales comparison approach');
  if (priceBand) methodology.push('Market band analysis');
  if (lane === 'dscr' || lane === 'str' || lane === 'multifamily') methodology.push('Income approach');
  if (methodology.length === 0) methodology.push('Limited data — rule-of-thumb estimation');

  const stateStr = property.state ?? 'unknown state';
  const typeStr = property.propertyType ?? 'property';

  return {
    asIs,
    stabilized,
    confidenceScore,
    methodology,
    narrative: {
      headline: `${lane.toUpperCase()} appraisal for ${typeStr} in ${stateStr} — ${confidenceScore}% confidence.`,
      analysis: `Based on ${market.comparableSales.length} comparable sales and ${market.marketBands.length} market bands, this ${typeStr} in ${property.city ?? stateStr} is estimated at ${asIs.mid != null ? `$${asIs.mid.toLocaleString()}` : 'N/A'} (as-is). Data quality score: ${market.dataQuality.score}/100.`,
      strengths: market.comparableSales.length >= 5
        ? ['Adequate comparable sales data supports the valuation.']
        : ['Limited market data — valuations should be treated as preliminary.'],
      risks: market.dataQuality.flags.length > 0
        ? market.dataQuality.flags.slice(0, 3)
        : ['No specific risk flags identified.'],
      nextSteps: ['Submit for detailed review by 818 Capital underwriting team.'],
      notesForBorrower: [`This AI-assisted appraisal is based on ${market.comparableSales.length} comparable sales in your market area.`],
      notesForCreditCommittee: [
        `Data quality: ${market.dataQuality.score}/100.`,
        `Comp count: ${market.comparableSales.length}.`,
        `Market band coverage: ${market.marketBands.length} bands.`,
      ],
      aiGenerated: false,
    },
  };
}

// ─── Main Export ─────────────────────────────────────────

export async function generateAppraisal(
  lane: ProductLane,
  property: PropertyDetails,
  market: MarketContext,
  metrics: Record<string, unknown>,
): Promise<{ valueEstimate: ValueEstimate; narrative: AppraisalNarrative }> {
  let output: GPTAppraisalOutput;

  const client = getClient();
  if (client) {
    try {
      console.log(`[aiAppraisal] Generating GPT appraisal for ${lane}...`);
      output = await generateGPTAppraisal(lane, property, market, metrics);
      console.log(`[aiAppraisal] GPT appraisal generated for ${lane}`);
    } catch (err) {
      console.error('[aiAppraisal] GPT failed, falling back to template:', err);
      output = templateAppraisal(lane, property, market, metrics);
    }
  } else {
    console.log(`[aiAppraisal] No API key — using template appraisal for ${lane}`);
    output = templateAppraisal(lane, property, market, metrics);
  }

  return {
    valueEstimate: {
      asIs: output.asIs,
      stabilized: output.stabilized,
      confidenceScore: output.confidenceScore,
      methodology: output.methodology,
    },
    narrative: output.narrative,
  };
}
