"""
Human-in-the-loop notifier — posts to Slack when the judge requires review.
"""

import logging

import httpx

from app.config import settings
from app.schemas import JudgeVerdict

logger = logging.getLogger(__name__)


def _truncate(text: str, n: int) -> str:
    text = text or ""
    return text if len(text) <= n else text[: n - 1] + "…"


async def notify_human_review(
    *, question: str, answer: str, verdict: JudgeVerdict
) -> bool:
    if not settings.SLACK_WEBHOOK_URL:
        logger.info("[HITL] Slack webhook not configured; skipping notification.")
        return False

    issues = "\n".join(f"• {i}" for i in verdict.issues) or "_No issues listed._"

    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": "Ask David — review needed"},
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Score:*\n{verdict.score}/100"},
                {
                    "type": "mrkdwn",
                    "text": f"*Reason:*\n{_truncate(verdict.rationale, 200)}",
                },
            ],
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Question:*\n{_truncate(question, 600)}",
            },
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Draft answer:*\n{_truncate(answer, 1200)}",
            },
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*Judge issues:*\n{_truncate(issues, 800)}"},
        },
    ]

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                settings.SLACK_WEBHOOK_URL, json={"blocks": blocks}
            )
            resp.raise_for_status()
        return True
    except Exception as e:
        logger.error("[HITL] Slack notification failed: %s", e)
        return False
