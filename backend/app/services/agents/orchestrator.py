"""
Orchestrator — runs the full Ask David pipeline:
    plan -> execute steps -> synthesize -> judge -> HITL.
"""

import inspect
import json
import time
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import (
    AgentAskResponse,
    AgentPlan,
    AgentTraceStep,
    JudgeVerdict,
)
from app.services.agents import analytics, hitl, judge as judge_module, retrieval
from app.services.agents import structured, supervisor
from app.services.agents.llm import chat


SYNTHESIS_SYSTEM = """You are the Synthesizer for 818 Capital's "Ask David"
multi-agent system. Use ONLY the trace data to answer the question.

Rules:
- Be direct and numeric. No corporate buzzwords.
- If the trace has no relevant data, say so explicitly — do not invent.
- Cite which step a number came from (e.g. "step 2 / analytics.compute_metrics").
- Keep the answer under 250 words unless the question explicitly demands more.
- Never make binding credit promises (no "approved", "we will fund").
"""


def _resolve_args(args: dict[str, Any], trace: list[AgentTraceStep]) -> dict[str, Any]:
    """Substitute simple back-references like '$prev_deals' with prior step results."""
    if not args:
        return {}
    resolved: dict[str, Any] = {}
    for k, v in args.items():
        if isinstance(v, str) and v.startswith("$prev"):
            prev = next(
                (
                    step.result
                    for step in reversed(trace)
                    if step.error is None and step.result is not None
                ),
                None,
            )
            resolved[k] = prev if prev is not None else []
        else:
            resolved[k] = v
    return resolved


def _dispatch(agent: str, tool: str):
    table = {
        "retrieval": retrieval.TOOLS,
        "structured": structured.TOOLS,
        "analytics": analytics.TOOLS,
    }
    return table.get(agent, {}).get(tool)


_DB_REQUIRED = {
    ("retrieval", "search_deals"),
    ("retrieval", "get_deal"),
    ("retrieval", "search_persons"),
    ("retrieval", "search_lenders"),
    ("structured", "extract_deal_financials"),
}


async def _execute_step(
    *,
    agent: str,
    tool: str,
    args: dict[str, Any],
    db: AsyncSession,
) -> tuple[Any, str | None]:
    fn = _dispatch(agent, tool)
    if fn is None:
        return None, f"unknown tool: {agent}.{tool}"
    try:
        if (agent, tool) in _DB_REQUIRED:
            result = fn(db, **args)
        else:
            result = fn(**args)
        if inspect.isawaitable(result):
            result = await result
        return result, None
    except TypeError as e:
        return None, f"bad arguments for {agent}.{tool}: {e}"
    except Exception as e:
        return None, f"error in {agent}.{tool}: {e}"


def _trim_for_synthesis(value: Any, max_chars: int = 6000) -> str:
    try:
        encoded = json.dumps(value, default=str)
    except Exception:
        encoded = str(value)
    if len(encoded) > max_chars:
        return encoded[:max_chars] + "…"
    return encoded


async def _synthesize(
    *, question: str, plan: AgentPlan, trace: list[AgentTraceStep]
) -> str:
    trace_payload = [
        {
            "step": i + 1,
            "agent": step.agent,
            "tool": step.tool,
            "args": step.args,
            "result": step.result,
            "error": step.error,
        }
        for i, step in enumerate(trace)
    ]
    user = json.dumps(
        {
            "question": question,
            "plan_rationale": plan.rationale,
            "trace": json.loads(_trim_for_synthesis(trace_payload)),
        },
        default=str,
    )
    answer = await chat(
        system=SYNTHESIS_SYSTEM,
        user=user,
        temperature=0.3,
        max_tokens=600,
    )
    if not answer:
        # Deterministic fallback summary.
        non_empty = [s for s in trace if s.error is None and s.result is not None]
        if not non_empty:
            return "No data available to answer this question (LLM unavailable and no trace results)."
        return (
            "Synthesis LLM unavailable. Raw trace:\n"
            + _trim_for_synthesis([s.model_dump() for s in non_empty], 2000)
        )
    return answer


async def run_agent(
    *,
    question: str,
    db: AsyncSession,
    context: dict[str, Any] | None = None,
) -> AgentAskResponse:
    plan = await supervisor.plan(question, context=context)

    trace: list[AgentTraceStep] = []
    for step in plan.steps:
        started = time.perf_counter()
        resolved_args = _resolve_args(step.args, trace)
        result, error = await _execute_step(
            agent=step.agent, tool=step.tool, args=resolved_args, db=db
        )
        duration_ms = int((time.perf_counter() - started) * 1000)
        trace.append(
            AgentTraceStep(
                agent=step.agent,
                tool=step.tool,
                args=resolved_args,
                result=result,
                error=error,
                duration_ms=duration_ms,
            )
        )

    answer = await _synthesize(question=question, plan=plan, trace=trace)
    verdict: JudgeVerdict = await judge_module.judge(
        question=question, answer=answer, trace=trace
    )

    notified = False
    if verdict.requires_human_review:
        notified = await hitl.notify_human_review(
            question=question, answer=answer, verdict=verdict
        )

    return AgentAskResponse(
        question=question,
        answer=answer,
        plan=plan,
        trace=trace,
        judge=verdict,
        requires_human_review=verdict.requires_human_review,
        notified_slack=notified,
    )
