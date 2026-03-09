import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

export const aiRouter = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'not-set' });
const hasOpenAI = !!process.env.OPENAI_API_KEY;

/**
 * POST /api/ai/content-scripts — Generate video/podcast scripts from deal scenarios.
 */
aiRouter.post('/content-scripts', async (req: Request, res: Response) => {
  try {
    const { topic, lane, format = 'video', tone = 'educational' } = req.body;

    if (!topic) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    if (!hasOpenAI) {
      // Template fallback
      res.json({
        success: true,
        aiGenerated: false,
        script: {
          title: `${lane ? lane.toUpperCase() + ': ' : ''}${topic}`,
          hook: `Here's what most investors get wrong about ${topic}...`,
          body: [
            `Let's break down ${topic} in a way that actually makes sense.`,
            `The key thing to understand is how this affects your deal structure.`,
            `Most investors we work with ask about this — and here's the real answer.`,
            `When you run the numbers, here's what you should focus on.`,
          ],
          cta: 'Drop your deal numbers at 818capitalpartners.com and get an instant AI analysis — free.',
          format,
          estimatedDuration: format === 'video' ? '60-90 seconds' : '3-5 minutes',
        },
      });
      return;
    }

    const completion = await openai.chat.completions.create({
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

    const content = completion.choices[0]?.message?.content || '';

    res.json({
      success: true,
      aiGenerated: true,
      script: {
        title: topic,
        content,
        format,
        lane: lane || null,
        tokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (err) {
    console.error('Error generating content script:', err);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

/**
 * POST /api/ai/broker-kit — Generate broker marketing kit content.
 */
aiRouter.post('/broker-kit', async (req: Request, res: Response) => {
  try {
    const { brokerName, company, lanes = ['dscr', 'flip'], market } = req.body;

    const laneNames: Record<string, string> = {
      dscr: 'DSCR Rental Loans',
      flip: 'Fix & Flip Bridge Loans',
      str: 'Short-Term Rental Financing',
      multifamily: 'Multifamily Commercial Loans',
    };

    const selectedLanes = lanes.map((l: string) => laneNames[l] || l).join(', ');

    if (!hasOpenAI) {
      // Template fallback
      res.json({
        success: true,
        aiGenerated: false,
        kit: {
          emailTemplate: {
            subject: `Investor Lending Solutions — ${selectedLanes}`,
            body: `Hi [Client Name],\n\nI wanted to share some lending solutions for your investment property needs.\n\nThrough 818 Capital Partners, I have access to programs including:\n\n${lanes.map((l: string) => `• ${laneNames[l] || l}`).join('\n')}\n\nKey highlights:\n• No tax returns or income verification\n• Close in as fast as 10-14 days\n• LLCs and entities welcome\n• Competitive rates from 9+ lenders\n\nWould you like me to run some numbers on a specific deal? I can get you an instant analysis.\n\nBest,\n${brokerName || '[Your Name]'}${company ? `\n${company}` : ''}`,
          },
          socialPost: {
            linkedin: `Attention real estate investors! \u{1F3E0}\n\nLooking for ${selectedLanes.toLowerCase()}? Here's what we're seeing in the market:\n\n\u2705 DSCR loans from 1.0x ratio\n\u2705 Up to 90% LTC on fix & flip\n\u2705 No tax returns needed\n\u2705 Close in 10-14 days\n\nDM me or visit 818capitalpartners.com to run your numbers.`,
          },
          onePageFlyer: {
            headline: `Investor Lending Made Simple`,
            subheadline: `${selectedLanes} — Close Fast, No Tax Returns`,
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
      });
      return;
    }

    const completion = await openai.chat.completions.create({
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

    res.json({
      success: true,
      aiGenerated: true,
      kit: {
        content: completion.choices[0]?.message?.content || '',
        lanes,
        tokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (err) {
    console.error('Error generating broker kit:', err);
    res.status(500).json({ error: 'Failed to generate broker kit' });
  }
});

/**
 * POST /api/ai/competitor-monitor — Skeleton for competitor monitoring.
 */
aiRouter.post('/competitor-monitor', async (req: Request, res: Response) => {
  const { competitors = [] } = req.body;

  // Skeleton — will be enhanced with web scraping + AI analysis
  res.json({
    success: true,
    status: 'skeleton',
    message: 'Competitor monitor is a planned feature. Currently returns mock data.',
    competitors: competitors.length > 0 ? competitors : ['Lima One', 'Kiavi', 'Easy Street Capital'],
    insights: [
      { competitor: 'Market Trends', insight: 'DSCR rates trending down from Q4 2025 highs. Average 30yr DSCR now 7.0-7.5%.' },
      { competitor: 'Product Watch', insight: 'Several lenders now accepting DSCR below 1.0x for higher-credit borrowers.' },
    ],
  });
});
