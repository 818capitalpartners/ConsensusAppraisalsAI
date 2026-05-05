"""
LLM-as-judge reflection node.

Given the question, draft answer, and trace, returns a JudgeVerdict scoring
accuracy + completeness and flagging when human review is required.
"""

import json
from typing import Any

from app.schemas import AgentTraceStep, JudgeVerdict
from app.services.agents.llm import json_chat

JUDGE_SYSTEM = """You are the Judge node in 818 Capital's "Ask David" multi-agent system.

Your job: critically review whether the draft answer is supported by the
trace data, and whether it can be released without a human reviewing it.

Score 0-100:
- 90-100: directly supported by trace, numerically consistent, no claims unsupported
- 70-89: mostly supported, minor wording issues
- 40-69: partial support, missing context, or over-claims certainty
- 0-39: unsupported, contradicts trace, hallucinated, or contains material errors

Always require human review when:
- Score < 70
- The trace contains errors in any step
- Loan amounts, DSCR/LTV/cap rate numbers in the answer contradict the trace
- The answer makes binding credit-decision statements ("we will fund", "approved")
- The trace is empty but the answer makes specific factual claims

Return JSON only, shape:
{
  "score": int,
  "issues": [string, ...],
  "requires_human_review": bool,
  "rationale": "1-3 sentences"
}
"""


def _trim_trace(trace: list[AgentTraceStep], max_chars: int = 4000) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    used = 0
    for step in trace:
        record = {
            "agent": step.agent,
            "tool": step.tool,
            "args": step.args,
            "result": step.result,
            "error": step.error,
        }
        encoded = json.dumps(record, default=str)
        if used + len(encoded) > max_chars:
            out.append({"agent": step.agent, "tool": step.tool, "result_truncated": True})
        else:
            out.append(record)
            used += len(encoded)
    return out


async def judge(
    *, question: str, answer: str, trace: list[AgentTraceStep]
) -> JudgeVerdict:
    payload = {
        "question": question,
        "draft_answer": answer,
        "trace": _trim_trace(trace),
    }
    raw = await json_chat(
        system=JUDGE_SYSTEM,
        user=json.dumps(payload, default=str),
        max_tokens=400,
    )
    if not raw:
        # No LLM — be conservative and require review.
        return JudgeVerdict(
            score=50,
            issues=["Judge LLM unavailable; defaulting to human review."],
            requires_human_review=True,
            rationale="No model configured for the judge node.",
        )

    try:
        score = int(raw.get("score", 0) or 0)
    except (TypeError, ValueError):
        score = 0
    score = max(0, min(100, score))

    issues_raw = raw.get("issues") or []
    issues = [str(x) for x in issues_raw if isinstance(x, str)]

    rhr = bool(raw.get("requires_human_review", False))
    rationale = str(raw.get("rationale") or "")[:1000]

    has_trace_error = any(step.error for step in trace)
    if score < 70 or has_trace_error:
        rhr = True

    return JudgeVerdict(
        score=score,
        issues=issues,
        requires_human_review=rhr,
        rationale=rationale,
    )
