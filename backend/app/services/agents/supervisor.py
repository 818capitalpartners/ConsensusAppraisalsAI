"""
Supervisor agent — given a question, returns a Plan: an ordered list of
subagent tool calls. The supervisor knows the catalogs of each subagent.

Falls back to a deterministic minimal plan when the LLM is unavailable.
"""

import json
from typing import Any

from app.schemas import AgentPlan, AgentToolCall
from app.services.agents import analytics, retrieval, structured
from app.services.agents.llm import json_chat

SUPERVISOR_SYSTEM = """You are the Supervisor of 818 Capital's "Ask David" multi-agent system.

You decide which specialist subagents to call to answer an internal question
about deals, borrowers, lenders, or pipeline metrics. You do not answer the
question yourself — you produce a plan that other agents will execute.

Subagents and their tools:
- retrieval: pulls records from Postgres (deals, persons, lenders).
- structured: normalizes raw financials into canonical fields.
- analytics: deterministic computations (DSCR/LTV/cap rate/aggregations).

Rules:
1. Output JSON only. No prose.
2. Steps run sequentially. Each step result is available to later steps via
   the synthesizer, but you must NOT reference prior step output in args
   templating — use literal values only.
3. Prefer 1-4 steps. Skip steps that aren't needed.
4. For pipeline-wide questions, call retrieval.search_deals, then
   analytics.aggregate_pipeline with deals=[].
   The orchestrator will substitute the prior step result if args contain
   the literal string "$prev_deals".
5. Tool args must be JSON primitives only (str/int/float/bool/list/dict).

Output shape:
{
  "rationale": "1-2 sentences",
  "steps": [
    {"agent": "retrieval", "tool": "search_deals", "args": {"deal_score": "green", "limit": 20}},
    ...
  ]
}
"""


def _catalog_text() -> str:
    sections = []
    for name, catalog in (
        ("retrieval", retrieval.CATALOG),
        ("structured", structured.CATALOG),
        ("analytics", analytics.CATALOG),
    ):
        lines = [f"## {name}"]
        for entry in catalog:
            lines.append(f"- {entry['tool']}: {entry['description']}")
        sections.append("\n".join(lines))
    return "\n\n".join(sections)


def _fallback_plan(question: str) -> AgentPlan:
    """Deterministic plan when no LLM is available."""
    q = question.lower()
    steps: list[AgentToolCall] = []
    if "lender" in q:
        steps.append(AgentToolCall(agent="retrieval", tool="search_lenders", args={}))
    else:
        steps.append(
            AgentToolCall(agent="retrieval", tool="search_deals", args={"limit": 20})
        )
        steps.append(
            AgentToolCall(
                agent="analytics", tool="aggregate_pipeline", args={"deals": "$prev_deals"}
            )
        )
    return AgentPlan(
        rationale="Fallback plan — LLM unavailable.",
        steps=steps,
    )


async def plan(question: str, context: dict[str, Any] | None = None) -> AgentPlan:
    user_payload = {
        "question": question,
        "context": context or {},
        "subagent_catalog": _catalog_text(),
    }
    raw = await json_chat(
        system=SUPERVISOR_SYSTEM,
        user=json.dumps(user_payload),
        max_tokens=800,
    )
    if not raw:
        return _fallback_plan(question)

    try:
        steps_raw = raw.get("steps") or []
        steps: list[AgentToolCall] = []
        for s in steps_raw:
            if not isinstance(s, dict):
                continue
            agent = s.get("agent")
            tool = s.get("tool")
            args = s.get("args") or {}
            if not isinstance(agent, str) or not isinstance(tool, str):
                continue
            if agent not in ("retrieval", "structured", "analytics"):
                continue
            if not isinstance(args, dict):
                args = {}
            steps.append(AgentToolCall(agent=agent, tool=tool, args=args))
        if not steps:
            return _fallback_plan(question)
        return AgentPlan(
            rationale=str(raw.get("rationale") or "")[:500],
            steps=steps,
        )
    except Exception:
        return _fallback_plan(question)
