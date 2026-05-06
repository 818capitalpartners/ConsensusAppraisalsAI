"""Shared OpenAI client + JSON-mode helper for agent LLM calls."""

import json
import logging
from typing import Any

from openai import AsyncOpenAI

from app.config import settings

logger = logging.getLogger(__name__)

_client: AsyncOpenAI | None = None

DEFAULT_MODEL = "gpt-4.1-mini"


def get_client() -> AsyncOpenAI | None:
    global _client
    if not settings.OPENAI_API_KEY:
        return None
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


async def chat(
    system: str,
    user: str,
    *,
    model: str = DEFAULT_MODEL,
    temperature: float = 0.2,
    max_tokens: int = 1200,
) -> str:
    client = get_client()
    if not client:
        return ""
    try:
        resp = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception as e:
        logger.error("[Agent LLM] chat failed: %s", e)
        return ""


async def json_chat(
    system: str,
    user: str,
    *,
    model: str = DEFAULT_MODEL,
    temperature: float = 0.1,
    max_tokens: int = 1200,
) -> dict[str, Any] | None:
    """Call the LLM in JSON mode and return a parsed dict, or None on failure."""
    client = get_client()
    if not client:
        return None
    try:
        resp = await client.chat.completions.create(
            model=model,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = (resp.choices[0].message.content or "").strip()
        if not content:
            return None
        return json.loads(content)
    except Exception as e:
        logger.error("[Agent LLM] json_chat failed: %s", e)
        return None
