import { NextRequest, NextResponse } from "next/server";
import { verifyQuoSignature, normalizePhone, isShortCode } from "@/lib/quo-webhook";
import { sbInsert, sbUpsert, sbUpdate, sbSelect } from "@/lib/supabase";
import { findPipelineItemByPhone, updatePipelineItemFromCall, createLeadFromCall } from "@/lib/monday";

/**
 * Quo (OpenPhone) webhook handler.
 *
 * Replaces the multi-week broken Make scenarios. Strict rules-first design:
 *
 *   1. Verify signature → reject if invalid (no anonymous writes)
 *   2. Log every webhook to Supabase webhook_log (audit + replay)
 *   3. Apply DROP rules early (short codes, robocall patterns, no-transcript noise)
 *   4. Upsert contact in Supabase by phone
 *   5. Insert interaction row (transcript + raw payload)
 *   6. Match against Monday Pipeline by phone:
 *        - Match → update the deal + log call note (NEVER create on Pipeline)
 *        - No match + real loan inquiry detected → create on Leads board
 *        - No match + ambiguous → leave on contacts table only (no Monday write)
 *   7. Return 200 with diagnostic info (Vercel logs everything)
 *
 * Pipeline stays curated. Leads board is the inbox. Contacts are forever.
 */

type QuoEvent = {
  type: string; // 'call.completed' | 'call.recording.completed' | 'message.received' | 'message.delivered' | ...
  data?: {
    object?: {
      id?: string;
      from?: string;
      to?: string | string[];
      direction?: string;
      duration?: number;
      transcript?: string;
      transcription?: string;
      body?: string;
      content?: string;
      createdAt?: string;
      completedAt?: string;
      status?: string;
    };
  };
};

type Decision = {
  status: "received" | "processed" | "error" | "dropped";
  drop_reason?: string;
  contact_id?: string;
  interaction_id?: string;
  monday_action?: "pipeline_updated" | "lead_created" | "no_monday_action";
  error?: string;
};

const MIN_CALL_DURATION_SEC = 30;

function classifyEventType(quoType: string, direction: string | undefined, duration: number | undefined): string {
  const isCall = quoType.startsWith("call");
  const isMsg = quoType.startsWith("message");
  const dir = (direction || "").toLowerCase();
  const inbound = dir === "incoming" || dir === "inbound";
  const outbound = dir === "outgoing" || dir === "outbound";

  if (isCall) {
    if (quoType.includes("missed") || (duration !== undefined && duration === 0)) return "call_missed";
    return inbound ? "call_in" : outbound ? "call_out" : "call_in";
  }
  if (isMsg) {
    return inbound ? "sms_in" : outbound ? "sms_out" : "sms_in";
  }
  return "call_in";
}

/**
 * Decide whether to drop this event before doing any Monday writes.
 * Returns drop_reason if drop, null if proceed.
 */
function applyDropRules(args: {
  callerPhone: string;
  eventType: string;
  duration: number | undefined;
  transcript: string;
  body: string;
}): string | null {
  // 1. Short codes (carrier alerts, OTP, marketing): hard drop
  if (isShortCode(args.callerPhone)) return "short_code";

  // 2. Missed calls / very short calls: log only, no Monday write
  //    (we still log the contact + interaction; this drop_reason just blocks Monday)
  if (args.eventType.startsWith("call") && args.duration !== undefined && args.duration > 0 && args.duration < MIN_CALL_DURATION_SEC) {
    return "short_call";
  }

  // 3. SMS without body: garbage
  if (args.eventType.startsWith("sms") && !args.body.trim()) return "empty_sms";

  // 4. Calls with no transcript AND no other content: nothing to extract
  if (args.eventType.startsWith("call") && !args.transcript.trim() && args.eventType !== "call_missed") {
    return "no_transcript";
  }

  return null;
}

/**
 * Server-side Claude extraction. Uses /api/claude (already auth-injects ANTHROPIC_API_KEY).
 * Returns null if extraction fails — caller decides what to do (most paths still write
 * the contact + interaction without AI fields).
 */
async function extractWithClaude(transcript: string, fromPhone: string, baseUrl: string): Promise<{
  borrower_name?: string;
  property_address?: string;
  loan_type?: string;
  loan_amount?: string;
  lender_name?: string;
  urgency?: string;
  next_action?: string;
  summary?: string;
  is_real_inquiry?: boolean;
} | null> {
  const prompt = `You analyze 818 Capital Partners call transcripts to extract structured CRM data.

Transcript (from ${fromPhone}):
${transcript}

Return ONLY valid JSON with these fields. Set fields to null if not mentioned:
{
  "borrower_name": "",
  "property_address": "",
  "loan_type": "DSCR | Fix & Flip | Bridge | Multifamily | Commercial | null",
  "loan_amount": "",
  "lender_name": "",
  "urgency": "Hot | Warm | Cold",
  "next_action": "",
  "summary": "1-2 sentences",
  "is_real_inquiry": true | false
}

Set is_real_inquiry=true ONLY if the caller is genuinely inquiring about a real estate loan with at least one of: a real property address, a real loan amount, a real borrower name, or a clear deal context. Set is_real_inquiry=false for: spam, robocalls, wrong numbers, social calls, vague "I'm calling back" with no deal context.`;

  try {
    const res = await fetch(`${baseUrl}/api/claude`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const json = await res.json();
    const text = (json?.content || []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
    const cleaned = text.replace(/```json|```/g, "").trim();
    const s = cleaned.indexOf("{");
    const e = cleaned.lastIndexOf("}");
    if (s === -1 || e === -1) return null;
    return JSON.parse(cleaned.slice(s, e + 1));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("openphone-signature");
  const baseUrl = req.nextUrl.origin;

  // ---- 1. Signature verification ----
  const verifyResult = verifyQuoSignature(signatureHeader, rawBody, process.env.OPENPHONE_WEBHOOK_SECRET || "");
  if (!verifyResult.ok) {
    // Log rejected signatures so we can spot tampering / misconfiguration
    await sbInsert("webhook_log", {
      source: "quo",
      event_type: "signature_rejected",
      status: "error",
      error: `signature_failed: ${verifyResult.reason}`,
      payload: { headers: { signature: signatureHeader }, body_preview: rawBody.slice(0, 500) },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // ---- 2. Parse + log every webhook FIRST (audit before processing) ----
  let event: QuoEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    await sbInsert("webhook_log", {
      source: "quo",
      event_type: "parse_error",
      status: "error",
      error: "body_not_json",
      payload: { body_preview: rawBody.slice(0, 1000) },
    });
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const logResp = await sbInsert<{ id: string }>("webhook_log", {
    source: "quo",
    event_type: event.type,
    status: "received",
    payload: event,
  });
  const logId = logResp.data?.id;

  // ---- 3. Pull fields ----
  const obj = event.data?.object || {};
  const direction = obj.direction;
  const duration = obj.duration;
  const transcript = obj.transcript || obj.transcription || "";
  const body = obj.body || obj.content || "";
  const eventType = classifyEventType(event.type, direction, duration);
  const inbound = eventType.endsWith("_in") || eventType === "call_missed";
  const callerRaw = inbound ? obj.from : Array.isArray(obj.to) ? obj.to[0] : obj.to;
  const callerPhone = normalizePhone(callerRaw || "");

  if (!callerPhone) {
    await sbUpdate("webhook_log", `id=eq.${logId}`, { status: "dropped", drop_reason: "no_phone" });
    return NextResponse.json({ ok: true, dropped: "no_phone" });
  }

  // ---- 4. Apply drop rules ----
  const dropReason = applyDropRules({ callerPhone, eventType, duration, transcript, body });
  if (dropReason === "short_code") {
    // Hard drop: don't even create a contact for short codes
    await sbUpdate("webhook_log", `id=eq.${logId}`, { status: "dropped", drop_reason: dropReason });
    return NextResponse.json({ ok: true, dropped: dropReason });
  }

  // ---- 5. Upsert contact (always — we want a record of every real number that contacts us) ----
  const now = new Date().toISOString();
  const counterCol = eventType.startsWith("call") ? "call_count" : "sms_count";

  // Check if contact exists to know whether to set first_contacted_at
  const existingResp = await sbSelect<{ id: string; first_contacted_at: string | null; call_count: number; sms_count: number; role: string }>("contacts", `phone=eq.${encodeURIComponent(callerPhone)}&select=id,first_contacted_at,call_count,sms_count,role`);
  const existing = existingResp.data?.[0];

  const contactPayload: Record<string, unknown> = {
    phone: callerPhone,
    last_contacted_at: now,
    [counterCol]: (existing?.[counterCol as "call_count" | "sms_count"] || 0) + 1,
  };
  if (!existing) {
    contactPayload.first_contacted_at = now;
    contactPayload.role = "unknown";
    contactPayload.status = "active";
  }

  const upsertResp = await sbUpsert<{ id: string; role: string }>("contacts", contactPayload, "phone");
  if (upsertResp.error || !upsertResp.data?.id) {
    await sbUpdate("webhook_log", `id=eq.${logId}`, { status: "error", error: `contact_upsert_failed: ${upsertResp.error}` });
    return NextResponse.json({ ok: false, error: "contact_upsert_failed" }, { status: 500 });
  }
  const contactId = upsertResp.data.id;

  // ---- 6. Run Claude extraction (only for events with usable content) ----
  let aiExtracted: Awaited<ReturnType<typeof extractWithClaude>> = null;
  const contentForAi = transcript || body;
  if (contentForAi.length > 20 && dropReason !== "short_call" && eventType !== "call_missed") {
    aiExtracted = await extractWithClaude(contentForAi, callerPhone, baseUrl);
  }

  // ---- 7. Log the interaction ----
  const interactionResp = await sbInsert<{ id: string }>("interactions", {
    contact_id: contactId,
    type: eventType,
    direction: inbound ? "inbound" : "outbound",
    duration_sec: duration,
    transcript: transcript || body || null,
    ai_summary: aiExtracted?.summary || null,
    ai_extracted: aiExtracted || null,
    occurred_at: obj.completedAt || obj.createdAt || now,
    raw_payload: event,
  });
  const interactionId = interactionResp.data?.id;

  // ---- 8. Monday writes — only if not dropped ----
  const decision: Decision = { status: "processed", contact_id: contactId, interaction_id: interactionId };

  if (dropReason) {
    // Soft drop: contact + interaction logged, but no Monday write.
    decision.status = "dropped";
    decision.drop_reason = dropReason;
    decision.monday_action = "no_monday_action";
  } else {
    // Try to match an existing Pipeline deal by phone
    const pipelineMatch = await findPipelineItemByPhone(callerPhone);

    if (pipelineMatch) {
      // KNOWN deal — update it
      const callNote = [
        `📞 ${eventType.replace("_", " ")} · ${new Date().toLocaleString()}`,
        callerPhone ? `Phone: ${callerPhone}` : null,
        duration ? `Duration: ${Math.round(duration)}s` : null,
        aiExtracted?.urgency ? `Urgency: ${aiExtracted.urgency}` : null,
        aiExtracted?.next_action ? `Next action: ${aiExtracted.next_action}` : null,
        aiExtracted?.summary ? `Summary: ${aiExtracted.summary}` : (transcript || body).slice(0, 400),
      ].filter(Boolean).join("\n");

      const updateResp = await updatePipelineItemFromCall(pipelineMatch.id, {
        summary: aiExtracted?.summary,
        nextAction: aiExtracted?.next_action,
        lender: aiExtracted?.lender_name,
        lastUpdate: callNote,
      });

      if (updateResp.ok) {
        decision.monday_action = "pipeline_updated";
        // Backfill the contact row with monday_pipeline_id
        await sbUpdate("contacts", `id=eq.${contactId}`, { monday_pipeline_id: pipelineMatch.id });
      } else {
        decision.error = `pipeline_update_failed: ${updateResp.error}`;
      }
    } else if (aiExtracted?.is_real_inquiry === true) {
      // UNKNOWN caller, but real inquiry → create on Leads board (NOT Pipeline)
      const leadResp = await createLeadFromCall({
        borrowerName: aiExtracted.borrower_name,
        phone: callerPhone,
        property: aiExtracted.property_address,
        loanType: aiExtracted.loan_type,
        summary: aiExtracted.summary,
        source: eventType,
      });
      if (leadResp.ok) {
        decision.monday_action = "lead_created";
        if (leadResp.itemId) await sbUpdate("contacts", `id=eq.${contactId}`, { monday_leads_id: leadResp.itemId });
      } else {
        decision.error = `lead_create_failed: ${leadResp.error}`;
      }
    } else {
      // UNKNOWN caller, ambiguous OR no AI extraction → contact + interaction logged, no Monday write
      decision.monday_action = "no_monday_action";
    }
  }

  // ---- 9. Update audit log with final decision ----
  await sbUpdate("webhook_log", `id=eq.${logId}`, {
    status: decision.error ? "error" : decision.status,
    drop_reason: decision.drop_reason || null,
    error: decision.error || null,
    contact_id: contactId,
    interaction_id: interactionId || null,
  });

  return NextResponse.json({
    ok: true,
    contact_id: contactId,
    interaction_id: interactionId,
    monday_action: decision.monday_action,
    drop_reason: decision.drop_reason,
  });
}

// Allow GET for healthcheck / Quo's webhook validation ping
export async function GET() {
  return NextResponse.json({ ok: true, service: "quo-webhook", version: "1.0" });
}
