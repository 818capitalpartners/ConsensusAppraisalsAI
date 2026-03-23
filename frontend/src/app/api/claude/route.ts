import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Inject Make API key server-side when requested
  if (body.injectMakeKey) {
    body.messages = body.messages.map((m: { role: string; content: string }) => ({
      ...m,
      content: m.content.replace("__MAKE_API_KEY__", process.env.MAKE_API_KEY ?? ""),
    }));
    delete body.injectMakeKey;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "mcp-client-2025-04-04",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
