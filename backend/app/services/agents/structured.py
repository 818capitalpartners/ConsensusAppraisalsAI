"""
Structured-data subagent — normalizes financial inputs into a canonical shape
the analytics subagent can consume without having to re-parse raw JSON.
"""

import math
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Deal


def _f(v: Any) -> float:
    try:
        if v is None or v == "":
            return 0.0
        x = float(v)
        return x if math.isfinite(x) else 0.0
    except (TypeError, ValueError):
        return 0.0


def _estimate_piti(loan_amount: float, value: float) -> float:
    if loan_amount <= 0 or value <= 0:
        return 0.0
    rate = 0.085 / 12
    n = 30 * 12
    pi = (loan_amount * rate) / (1 - math.pow(1 + rate, -n))
    ti = (value * 0.015) / 12
    return pi + ti


def normalize_financials(
    *,
    financials: dict[str, Any] | None = None,
    lane: str | None = None,
) -> dict[str, Any]:
    """Return a canonical financials shape for downstream analytics."""
    fin = financials or {}

    loan_amount = _f(fin.get("loan_amount"))
    value = _f(fin.get("estimated_value")) or _f(fin.get("purchase_price"))
    rent = _f(fin.get("monthly_rent"))
    piti = _f(fin.get("piti")) or _estimate_piti(loan_amount, value)
    fico_band = fin.get("fico_band") or "unknown"

    purchase = _f(fin.get("purchase_price"))
    rehab = _f(fin.get("rehab_budget"))
    arv = _f(fin.get("arv"))
    experience_band = fin.get("experience_band") or "0"

    annual_str = _f(fin.get("annual_str_income"))
    monthly_str = annual_str / 12 if annual_str else 0.0

    noi = _f(fin.get("noi"))
    units = _f(fin.get("units"))

    return {
        "lane": lane,
        "fico_band": fico_band,
        "loan_amount": loan_amount,
        "estimated_value": value,
        "monthly_rent": rent,
        "piti": piti,
        "purchase_price": purchase,
        "rehab_budget": rehab,
        "arv": arv,
        "experience_band": experience_band,
        "annual_str_income": annual_str,
        "monthly_str_income": monthly_str,
        "noi": noi,
        "units": units,
    }


async def extract_deal_financials(
    db: AsyncSession, *, deal_id: str
) -> dict[str, Any] | None:
    rows = await db.execute(select(Deal).where(Deal.id == deal_id))
    deal = rows.scalar_one_or_none()
    if not deal:
        return None
    return normalize_financials(financials=deal.financials, lane=deal.product_lane)


def _normalize_financials_tool(**kwargs: Any) -> dict[str, Any]:
    return normalize_financials(
        financials=kwargs.get("financials"),
        lane=kwargs.get("lane"),
    )


TOOLS = {
    "normalize_financials": _normalize_financials_tool,
    "extract_deal_financials": extract_deal_financials,
}

CATALOG = [
    {
        "tool": "normalize_financials",
        "description": "Normalize a raw financials dict to canonical fields. Args: financials (dict), lane (optional).",
    },
    {
        "tool": "extract_deal_financials",
        "description": "Fetch a deal by id and return its normalized financials. Args: deal_id.",
    },
]
