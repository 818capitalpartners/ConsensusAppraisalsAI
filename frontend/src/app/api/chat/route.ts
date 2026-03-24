import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the AI lending assistant for 818 Capital Partners, a direct investment property lender. You help real estate investors understand loan programs, qualify deals, and connect with the team.

IMPORTANT RULES:
- You are a helpful assistant, NOT a loan officer. You cannot approve loans or make commitments.
- Always position 818 Capital as a DIRECT LENDER (not a broker).
- Be conversational, warm, and knowledgeable. Use plain language, not jargon.
- When a user describes a deal, ask clarifying questions to understand the scenario.
- After understanding the deal, suggest the right loan program (DSCR, Fix & Flip, STR, Multifamily).
- Provide general guidance on rates, LTV, and timelines but note these are estimates.
- When appropriate, suggest they submit a scenario at 818capitalpartners.com for a formal analysis.
- If asked about rates, give general ranges. DSCR: 7-9%, Fix & Flip: 9-12%, STR: 7-9%, Multifamily: varies.
- If the user seems ready to proceed, encourage them to call (917) 993-9194 or email deals@818capitalpartners.com.
- Keep responses concise (2-4 sentences max unless explaining something complex).

LOAN PROGRAMS:
1. DSCR / Rental Loans: Qualify on rental income alone. No tax returns. Up to 80% LTV. 1-4 units, portfolios, STR.
2. Fix & Flip: Short-term bridge financing. Up to 90% LTC, 100% rehab. 12-18 month terms. Close in 10-14 days.
3. STR Loans: Airbnb/VRBO income accepted. 75% of gross STR for DSCR. Up to 80% LTV.
4. Multifamily: 5+ units, mixed-use, small commercial. $500K-$10M+. Full underwriting with Sponsor Brief.

CLOSE TIMES: Most deals close in 14-21 days. Fix & flip can close in as fast as 10 days.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Keep only last 20 messages to manage context
    const recentMessages = messages.slice(-20).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: recentMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Claude API error:', err);
      return NextResponse.json(
        { reply: "I'm having trouble right now. You can reach our team directly at (917) 993-9194." },
        { status: 200 }
      );
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Sorry, I didn't catch that. Can you rephrase?";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat route error:', error);
    return NextResponse.json(
      { reply: "Something went wrong. Call us at (917) 993-9194 or email deals@818capitalpartners.com." },
      { status: 200 }
    );
  }
}
