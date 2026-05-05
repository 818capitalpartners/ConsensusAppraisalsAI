"""
Multi-agent supervisor system for 818 Capital ("Ask David"-style).

Architecture:
  supervisor (planner)
    -> retrieval / structured / analytics subagents
    -> synthesis
    -> LLM-as-judge reflection
    -> human-in-the-loop (Slack) when judge flags low confidence
"""

from app.services.agents.orchestrator import run_agent

__all__ = ["run_agent"]
