"""
Analytics subagent — pure deterministic computations on normalized financials.

Mirrors the lane scoring logic from app.services.triage so the multi-agent
system produces consistent numbers with the existing triage pipeline.
"""

from typing import Any


def _safe_div(n: float, d: float) -> float:
    return n / d if d else 0.0


def _score_dscr(dscr: float, fico_band: str) -> str:
    if dscr >= 1.15 and fico_band in ("700-739", "740+"):
        return "green"
    if dscr >= 1.0:
        return "yellow"
    return "red"


def _score_str(dscr: float, fico_band: str) -> str:
    if dscr >= 1.25 and fico_band in ("700-739", "740+"):
        return "green"
    if dscr >= 1.0:
        return "yellow"
    return "red"


def _score_multifamily(dscr: float, debt_yield: float, ltv: float) -> str:
    if dscr >= 1.25 and debt_yield >= 0.08 and ltv <= 0.75:
        return "green"
    if dscr >= 1.10 and ltv <= 0.80:
        return "yellow"
    return "red"


def _score_flip(profit90: float, profit95: float, experience: str) -> tuple[str, float]:
    if profit90 > 0 and experience in ("3-5", "6-10", "11+"):
        return "green", 0.90
    if profit95 > 0:
        return "yellow", 0.80
    return "red", 0.0


def compute_metrics(
    *,
    financials: dict[str, Any],
    lane: str,
) -> dict[str, Any]:
    """Compute lending metrics for one deal."""
    f = financials or {}
    lane = (lane or "").lower()
    fico_band = f.get("fico_band") or "unknown"

    if lane == "dscr":
        rent = float(f.get("monthly_rent") or 0)
        piti = float(f.get("piti") or 0)
        dscr = _safe_div(rent, piti)
        return {
            "lane": "dscr",
            "dscr": round(dscr, 3),
            "score": _score_dscr(dscr, fico_band),
        }

    if lane == "str":
        monthly_str = float(f.get("monthly_str_income") or 0)
        conservative = monthly_str * 0.75
        piti = float(f.get("piti") or 0)
        dscr = _safe_div(conservative, piti)
        return {
            "lane": "str",
            "dscr": round(dscr, 3),
            "conservative_monthly": conservative,
            "score": _score_str(dscr, fico_band),
        }

    if lane == "flip":
        purchase = float(f.get("purchase_price") or 0)
        rehab = float(f.get("rehab_budget") or 0)
        arv = float(f.get("arv") or 0)
        loan_amount = float(f.get("loan_amount") or 0)
        experience = f.get("experience_band") or "0"
        total_cost = purchase + rehab
        ltc = _safe_div(loan_amount, total_cost)
        cost_factor = 0.10
        profit100 = arv - total_cost - (loan_amount * cost_factor)
        profit95 = (arv * 0.95) - total_cost - (loan_amount * cost_factor)
        profit90 = (arv * 0.90) - total_cost - (loan_amount * cost_factor)
        score, max_ltc = _score_flip(profit90, profit95, experience)
        return {
            "lane": "flip",
            "ltc": round(ltc, 3),
            "max_ltc": max_ltc,
            "profit_scenarios": {
                "profit100": round(profit100, 0),
                "profit95": round(profit95, 0),
                "profit90": round(profit90, 0),
            },
            "score": score,
        }

    if lane == "multifamily":
        noi = float(f.get("noi") or 0)
        purchase = float(f.get("purchase_price") or 0) or float(f.get("estimated_value") or 0)
        loan_amount = float(f.get("loan_amount") or 0)
        cap_rate = _safe_div(noi, purchase)
        dscr = _safe_div(noi, loan_amount * 0.07)
        ltv = _safe_div(loan_amount, purchase)
        debt_yield = _safe_div(noi, loan_amount)
        return {
            "lane": "multifamily",
            "noi": round(noi, 0),
            "cap_rate": round(cap_rate, 4),
            "dscr": round(dscr, 3),
            "ltv": round(ltv, 3),
            "debt_yield": round(debt_yield, 4),
            "score": _score_multifamily(dscr, debt_yield, ltv),
        }

    return {"lane": lane, "error": f"unsupported lane: {lane}"}


def aggregate_pipeline(*, deals: list[dict[str, Any]]) -> dict[str, Any]:
    """Aggregate pipeline-wide stats over a list of deal dicts."""
    deals = deals or []
    by_score: dict[str, int] = {"green": 0, "yellow": 0, "red": 0, "unscored": 0}
    by_lane: dict[str, int] = {}
    loan_amounts: list[float] = []
    for d in deals:
        score = (d.get("deal_score") or "unscored").lower()
        by_score[score] = by_score.get(score, 0) + 1
        lane = (d.get("product_lane") or "unknown").lower()
        by_lane[lane] = by_lane.get(lane, 0) + 1
        la = (d.get("financials") or {}).get("loan_amount")
        try:
            if la is not None:
                loan_amounts.append(float(la))
        except (TypeError, ValueError):
            pass
    total = sum(loan_amounts)
    avg = total / len(loan_amounts) if loan_amounts else 0
    return {
        "count": len(deals),
        "by_score": by_score,
        "by_lane": by_lane,
        "total_loan_amount": round(total, 0),
        "avg_loan_amount": round(avg, 0),
    }


def _compute_metrics_tool(**kwargs: Any) -> dict[str, Any]:
    return compute_metrics(
        financials=kwargs.get("financials") or {},
        lane=kwargs.get("lane") or "",
    )


def _aggregate_pipeline_tool(**kwargs: Any) -> dict[str, Any]:
    return aggregate_pipeline(deals=kwargs.get("deals") or [])


TOOLS = {
    "compute_metrics": _compute_metrics_tool,
    "aggregate_pipeline": _aggregate_pipeline_tool,
}

CATALOG = [
    {
        "tool": "compute_metrics",
        "description": "Compute lending metrics (DSCR/LTV/cap rate/debt yield/score) for one normalized financials dict + lane. Args: financials, lane.",
    },
    {
        "tool": "aggregate_pipeline",
        "description": "Aggregate stats over a list of deal dicts (counts by score/lane, loan totals). Args: deals (list).",
    },
]
