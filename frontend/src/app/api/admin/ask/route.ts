import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy to the FastAPI multi-agent supervisor at /api/agent/ask.
 *
 * Why a proxy instead of calling the backend directly from the browser:
 *   - Hides the BACKEND_URL from the bundle
 *   - Inherits the Basic Auth gate from middleware.ts (matcher includes /api/admin/*)
 *   - Lets us swap the backend host without redeploying the page
 *
 * Required env: BACKEND_URL (e.g. https://818-capital-backend.up.railway.app)
 */

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const backend = (process.env.BACKEND_URL || "").replace(/\/$/, "");
  if (!backend) {
    return NextResponse.json(
      { error: "BACKEND_URL not configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const question =
    typeof (body as { question?: unknown })?.question === "string"
      ? ((body as { question: string }).question || "").trim()
      : "";
  if (question.length < 3) {
    return NextResponse.json(
      { error: "question must be at least 3 characters" },
      { status: 400 },
    );
  }

  const ctxRaw = (body as { context?: unknown })?.context;
  const payload: Record<string, unknown> = { question };
  if (ctxRaw && typeof ctxRaw === "object" && !Array.isArray(ctxRaw)) {
    payload.context = ctxRaw;
  }

  try {
    const upstream = await fetch(`${backend}/api/agent/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Upstream error: ${(e as Error).message || "unknown"}` },
      { status: 502 },
    );
  }
}
