import OpenAI from 'openai';

import { getMarketContext } from './marketDataService';

export type ChatMode =
  | 'content-script'
  | 'broker-kit'
  | 'competitor-monitor'
  | 'market-context';

export interface ContentScriptPayload {
  topic: string;
  lane?: string;
  format?: 'video' | 'podcast' | 'email';
  tone?: 'educational' | 'direct' | 'friendly';
}

export interface BrokerKitPayload {
  brokerName?: string;
  company?: string;
  lanes?: string[];
  market?: string;
}

export interface CompetitorMonitorPayload {
  competitors?: string[];
}

export interface MarketContextPayload {
  state: string;
  countyFips?: string;
  zip?: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
  propertyType:
    | 'sfr'
    | 'condo'
    | 'townhome'
    | 'multifamily_2_4'
    | 'multifamily_5_plus'
    | 'mixed_use'
    | 'retail'
    | 'office'
    | 'industrial'
    | 'land';
}

export type UnifiedChatPayload =
  | ContentScriptPayload
  | BrokerKitPayload
  | CompetitorMonitorPayload
  | MarketContextPayload;

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (openai) {
    return openai;
  }

  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

async function handleContentScript(payload: ContentScriptPayload) {
  const { topic, lane, format = 'video', tone = 'educational' } = payload;

  if (!topic) {
    throw new Error('Topic is required');
  }

  const client = getOpenAIClient();
  if (!client) {
    return {
      success: true,
      aiGenerated: false,
      mode: 'content-script' as const,
      script: {
        title: `${lane ? lane.toUpperCase() + ': ' : ''}${topic}`,
        hook: `Here's what most investors get wrong about ${topic}...`,
        body: [
          `Let's break down ${topic} in a way that actually makes sense.`,
          `The key thing to understand is how this affects your deal structure.`,
          `Most investors we work with ask about this, and here's the real answer.`,
          `When you run the numbers, here's what you should focus on.`,
        ],
        cta: 'Drop your deal numbers at 818capitalpartners.com and get an instant AI analysis for free.',
        format,
        estimatedDuration: format === 'video' ? '60-90 seconds' : '3-5 minutes',
      },
    };
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a content writer for 818 Capital Partners, a mortgage brokerage specializing in DSCR, fix & flip, STR, and multifamily investor loans. Generate engaging ${format} scripts that educate investors. Tone: ${tone}. Always end with a CTA to visit 818capitalpartners.com.`,
      },
      {
        role: 'user',
        content: `Write a ${format} script about: ${topic}${lane ? ` (focus on ${lane} loans)` : ''}. Include: hook, 3-5 key points, and CTA.`,
      },
    ],
    temperature: 0.7,
  });

  return {
    success: true,
    aiGenerated: true,
    mode: 'content-script' as const,
    script: {
      title: topic,
      content: completion.choices[0]?.message?.content || '',
      format,
      lane: lane || null,
      tokens: completion.usage?.total_tokens || 0,
    },
  };
}

async function handleBrokerKit(payload: BrokerKitPayload) {
  const { brokerName, company, lanes = ['dscr', 'flip'], market } = payload;

  const laneNames: Record<string, string> = {
    dscr: 'DSCR Rental Loans',
    flip: 'Fix & Flip Bridge Loans',
    str: 'Short-Term Rental Financing',
    multifamily: 'Multifamily Commercial Loans',
  };

  const selectedLanes = lanes.map((lane) => laneNames[lane] || lane).join(', ');
  const client = getOpenAIClient();

  if (!client) {
    return {
      success: true,
      aiGenerated: false,
      mode: 'broker-kit' as const,
      kit: {
        emailTemplate: {
          subject: `Investor Lending Solutions - ${selectedLanes}`,
          body: `Hi [Client Name],\n\nI wanted to share some lending solutions for your investment property needs.\n\nThrough 818 Capital Partners, I have access to programs including:\n\n${lanes.map((lane) => `- ${laneNames[lane] || lane}`).join('\n')}\n\nKey highlights:\n- No tax returns or income verification\n- Close in as fast as 10-14 days\n- LLCs and entities welcome\n- Competitive rates from our lending desk\n\nWould you like me to run some numbers on a specific deal? I can get you an instant analysis.\n\nBest,\n${brokerName || '[Your Name]'}${company ? `\n${company}` : ''}`,
        },
        socialPost: {
          linkedin: `Attention real estate investors!\n\nLooking for ${selectedLanes.toLowerCase()}? Here's what we're seeing in the market:\n\n- DSCR loans from 1.0x ratio\n- Up to 90% LTC on fix & flip\n- No tax returns needed\n- Close in 10-14 days\n\nDM me or visit 818capitalpartners.com to run your numbers.`,
        },
        onePageFlyer: {
          headline: 'Investor Lending Made Simple',
          subheadline: `${selectedLanes} - Close Fast, No Tax Returns`,
          bulletPoints: [
            'DSCR loans qualifying on rental income only',
            'Fix & flip bridge loans up to 90% LTC',
            'Close in as fast as 10 business days',
            'LLCs, trusts, and foreign nationals welcome',
            'AI-powered deal analysis in seconds',
          ],
          cta: 'Get Your Free Deal Analysis at 818capitalpartners.com',
        },
      },
    };
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are generating broker marketing materials for 818 Capital Partners. The broker's name is ${brokerName || 'the broker'}${company ? ` at ${company}` : ''}. Focus on ${selectedLanes}${market ? ` in the ${market} market` : ''}. Be professional but approachable. Include specific loan parameters.`,
      },
      {
        role: 'user',
        content: `Generate a broker marketing kit with: 1) Email template to send to investor clients, 2) LinkedIn/social media post, 3) One-page flyer content with headline, bullets, and CTA. Focus on: ${selectedLanes}.`,
      },
    ],
    temperature: 0.7,
  });

  return {
    success: true,
    aiGenerated: true,
    mode: 'broker-kit' as const,
    kit: {
      content: completion.choices[0]?.message?.content || '',
      lanes,
      tokens: completion.usage?.total_tokens || 0,
    },
  };
}

function handleCompetitorMonitor(payload: CompetitorMonitorPayload) {
  const { competitors = [] } = payload;

  return {
    success: true,
    mode: 'competitor-monitor' as const,
    status: 'skeleton',
    message: 'Competitor monitor is a planned feature. Currently returns mock data.',
    competitors: competitors.length > 0 ? competitors : ['Lima One', 'Kiavi', 'Easy Street Capital'],
    insights: [
      {
        competitor: 'Market Trends',
        insight: 'DSCR rates trending down from Q4 2025 highs. Average 30-year DSCR now 7.0-7.5%.',
      },
      {
        competitor: 'Product Watch',
        insight: 'Several lenders now accept DSCR below 1.0x for higher-credit borrowers.',
      },
    ],
  };
}

async function handleMarketContext(payload: MarketContextPayload) {
  const result = await getMarketContext({
    state: payload.state,
    zip: payload.zip,
    propertyType: payload.propertyType,
  });
  return {
    success: true,
    mode: 'market-context' as const,
    ...result,
  };
}

export async function handleUnifiedChat(mode: ChatMode, payload: UnifiedChatPayload) {
  switch (mode) {
    case 'content-script':
      return handleContentScript(payload as ContentScriptPayload);
    case 'broker-kit':
      return handleBrokerKit(payload as BrokerKitPayload);
    case 'competitor-monitor':
      return handleCompetitorMonitor(payload as CompetitorMonitorPayload);
    case 'market-context':
      return handleMarketContext(payload as MarketContextPayload);
    default:
      throw new Error(`Unsupported chat mode: ${mode satisfies never}`);
  }
}
