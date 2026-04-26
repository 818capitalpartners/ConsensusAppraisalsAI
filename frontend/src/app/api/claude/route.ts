import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy from /api/claude → Anthropic Messages API.
 *
 * Auth tokens for MCP servers are injected SERVER-SIDE so they never
 * appear in the client bundle. The browser sends a config with the
 * server URL and name only; this route looks up the matching token
 * from env vars and adds it before forwarding.
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY   — Anthropic API key (always required)
 *   MONDAY_API_TOKEN    — for monday.com MCP queries
 *   MAKE_API_KEY        — for Make.com automations (used via __MAKE_API_KEY__ placeholder)
 *
 * Optional env vars (add when corresponding MCP is wired up):
 *   GMAIL_OAUTH_TOKEN   — for gmail MCP
 */

type McpServer = {
  type?: string;
  url?: string;
  name?: string;
  authorization_token?: string;
};

function injectMcpAuth(servers: McpServer[]): McpServer[] {
  return servers.map((s) => {
    const url = s.url || "";
    const name = s.name || "";

    // Monday.com MCP
    if (name === "monday-mcp" || url.includes("mcp.monday.com")) {
      const token = process.env.MONDAY_API_TOKEN;
      if (token) return { ...s, authorization_token: token };
    }

    // Gmail MCP (placeholder — wire up if/when needed)
    if (name === "gmail-mcp" || url.includes("gmail.mcp.claude.com")) {
      const token = process.env.GMAIL_OAUTH_TOKEN;
      if (token) return { ...s, authorization_token: token };
    }

    // Make.com MCP — uses URL-based auth, not header tokens (handled via injectMakeKey path)

    return s;
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Inject Make API key into message content when requested
  if (body.injectMakeKey) {
    body.messages = body.messages.map((m: { role: string; content: string }) => ({
      ...m,
      content: m.content.replace("__MAKE_API_KEY__", process.env.MAKE_API_KEY ?? ""),
    }));
    delete body.injectMakeKey;
  }

  // Inject MCP server auth tokens (Monday, Gmail, etc.) server-side
  if (Array.isArray(body.mcp_servers) && body.mcp_servers.length > 0) {
    body.mcp_servers = injectMcpAuth(body.mcp_servers);
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
