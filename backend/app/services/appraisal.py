"""
818 Capital AI Appraisal Engine — Python port of aiAppraisal.ts

Conservative, lender-first valuation engine for private credit underwriting.
Uses OpenAI GPT-4.1-mini with JSON output mode. Falls back to a template-based
valuation when AI is unavailable or returns invalid data.
"""

import json
import math
import logging
from typing import Any

import httpx

from app.config import settings
from app.schemas import (
    AiAppraisalInput,
    AiAppraisalResult,
    AppraisalValueBlock,
    AppraisalMetrics,
)

logger = logging.getLogger(__name__)

# ── System prompt (exact copy from aiAppraisal.ts) ───────────────────────────

APPRAISAL_SYSTEM_PROMPT = """
You are the 818 Capital AI Appraisal Engine.

Your job is to produce a conservative, lender-first valuation opinion for private credit underwriting.
You are not writing marketing copy. You are supporting an internal credit decision.

Rules:
1. Be range-focused, not point-estimate obsessed.
2. Prioritize supportable as-is value for current collateral, then stabilized / ARV only if warranted.
3. Weigh Income, Sales Comparison, and Cost approaches as applicable to the asset and available data.
4. Be conservative when data quality is weak, comps are stale, or subject details are incomplete.
5. Flag uncertainty explicitly in riskFlags and lower confidence when appropriate.
6. Never invent certainty, inspections, legal conclusions, or appraiser licensing claims.
7. Output JSON only. No markdown. No prose outside the JSON object.

Required output shape:
{
  "asIs": {
    "valueLow": number,
    "valueMid": number,
    "valueHigh": number,
    "confidenceScore": number,
    "primaryMethods": ["Income Approach", "Sales Comparison Approach"]
  },
  "stabilized": {
    "valueLow": number,
    "valueMid": number,
    "valueHigh": number,
    "confidenceScore": number,
    "primaryMethods": ["Income Approach", "Sales Comparison Approach"]
  },
  "metrics": {
    "noiAnnual": number,
    "capRateImpliedAtValueMid": number | null,
    "pricePerSqftImpliedAtValueMid": number | null
  },
  "compsUsed": ["short comp labels only"],
  "riskFlags": ["short bullet-style risk flags"],
  "notesForCreditCommittee": "2-5 sentence internal lender note focused on support, uncertainty, and diligence needs.",
  "notesForBorrower": "2-4 sentence external-safe summary with measured language."
}

Additional instructions:
- confidenceScore must be 0 to 100.
- valueLow <= valueMid <= valueHigh.
- compsUsed should contain compact labels, not paragraphs.
- If stabilized value is not supportable, omit the stabilized field entirely.
- If the subject is income-producing, calculate and return a supportable noiAnnual.
- If data is sparse, widen the range and say so in riskFlags and notesForCreditCommittee.
""".strip()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _finite(value: Any) -> float | None:
    """Return value as a finite float, or None."""
    if isinstance(value, (int, float)) and math.isfinite(value):
        return float(value)
    if isinstance(value, str) and value.strip():
        try:
            parsed = float(value)
            return parsed if math.isfinite(parsed) else None
        except ValueError:
            return None
    return None


def _unique_comp_labels(inp: AiAppraisalInput) -> list[str]:
    labels: list[str] = []
    seen: set[str] = set()
    for comp in [*inp.market_data.sale_comps, *inp.market_data.rent_comps]:
        if comp.label and comp.label not in seen:
            seen.add(comp.label)
            labels.append(comp.label)
        if len(labels) >= 6:
            break
    return labels


def _calculate_noi_annual(inp: AiAppraisalInput) -> float:
    ie = inp.income_and_expenses
    explicit_noi = _finite(ie.noi_annual)
    if explicit_noi is not None:
        return explicit_noi

    gross_annual_rent = _finite(ie.gross_annual_rent) or ((_finite(ie.gross_monthly_rent) or 0) * 12)
    other_annual_income = _finite(ie.other_annual_income) or ((_finite(ie.other_monthly_income) or 0) * 12)
    vacancy_rate = (_finite(ie.vacancy_rate_pct) or 0) / 100
    operating_expenses = _finite(ie.operating_expenses_annual) or (
        (_finite(ie.operating_expenses_monthly) or 0) * 12
    )

    return max(0.0, gross_annual_rent + other_annual_income - gross_annual_rent * vacancy_rate - operating_expenses)


def _anchor_value(inp: AiAppraisalInput) -> float:
    dt = inp.deal_terms
    return (
        _finite(dt.contract_price)
        or _finite(dt.purchase_price)
        or _finite(dt.borrower_estimated_value)
        or _finite(dt.estimated_as_is_value)
        or _finite(inp.market_data.median_sale_price)
        or 100_000
    )


def _midpoint_from_comps(comps: list, fallback: float) -> float:
    prices = [p for comp in comps if (p := _finite(comp.price)) is not None]
    if not prices:
        return fallback
    return sum(prices) / len(prices)


def _create_value_block(mid: float, spread_pct: float, confidence: float, methods: list[str]) -> AppraisalValueBlock:
    value_mid = max(1000, round(mid))
    return AppraisalValueBlock(
        value_low=max(1000, round(value_mid * (1 - spread_pct))),
        value_mid=value_mid,
        value_high=max(value_mid, round(value_mid * (1 + spread_pct))),
        confidence_score=confidence,
        primary_methods=methods,
    )


# ── Sanitize AI output ───────────────────────────────────────────────────────

def _sanitize_value_block(data: dict | None) -> AppraisalValueBlock | None:
    if not data or not isinstance(data, dict):
        return None

    low = _finite(data.get("valueLow"))
    mid = _finite(data.get("valueMid"))
    high = _finite(data.get("valueHigh"))
    confidence = _finite(data.get("confidenceScore"))
    methods_raw = data.get("primaryMethods", [])
    methods = [m for m in methods_raw if isinstance(m, str) and m.strip()] if isinstance(methods_raw, list) else []

    if low is None or mid is None or high is None or confidence is None:
        return None

    return AppraisalValueBlock(
        value_low=low,
        value_mid=mid,
        value_high=high,
        confidence_score=confidence,
        primary_methods=methods if methods else ["Sales Comparison Approach"],
    )


def _sanitize_ai_result(candidate: dict | None, inp: AiAppraisalInput) -> AiAppraisalResult | None:
    if not candidate or not isinstance(candidate, dict):
        return None

    as_is = _sanitize_value_block(candidate.get("asIs"))
    if not as_is:
        return None

    metrics_raw = candidate.get("metrics") or {}
    comps_raw = candidate.get("compsUsed", [])
    risk_raw = candidate.get("riskFlags", [])

    return AiAppraisalResult(
        as_is=as_is,
        stabilized=_sanitize_value_block(candidate.get("stabilized")),
        metrics=AppraisalMetrics(
            noi_annual=_finite(metrics_raw.get("noiAnnual")) or _calculate_noi_annual(inp),
            cap_rate_implied_at_value_mid=_finite(metrics_raw.get("capRateImpliedAtValueMid")),
            price_per_sqft_implied_at_value_mid=_finite(metrics_raw.get("pricePerSqftImpliedAtValueMid")),
        ),
        comps_used=[c for c in comps_raw if isinstance(c, str) and c.strip()] if isinstance(comps_raw, list) else _unique_comp_labels(inp),
        risk_flags=[f for f in risk_raw if isinstance(f, str) and f.strip()] if isinstance(risk_raw, list) else [],
        notes_for_credit_committee=(
            candidate.get("notesForCreditCommittee", "").strip()
            or "AI output required manual review before relying on this valuation."
        ),
        notes_for_borrower=(
            candidate.get("notesForBorrower", "").strip()
            or "This preliminary value range remains subject to document and market review."
        ),
    )


# ── Risk guardrails (port of riskGuardrails.ts) ──────────────────────────────

def check_output_for_anomalies(result: AiAppraisalResult, inp: AiAppraisalInput) -> list[str]:
    flags: set[str] = set()

    as_is_mid = _finite(result.as_is.value_mid)
    as_is_low = _finite(result.as_is.value_low)
    as_is_high = _finite(result.as_is.value_high)
    stabilized_mid = _finite(result.stabilized.value_mid) if result.stabilized else None
    land_value = _finite(inp.deal_terms.land_value)
    contract_price = _finite(inp.deal_terms.contract_price) or _finite(inp.deal_terms.purchase_price)
    requested_loan = _finite(inp.deal_terms.requested_loan_amount)
    implied_cap = _finite(result.metrics.cap_rate_implied_at_value_mid)
    implied_ppsf = _finite(result.metrics.price_per_sqft_implied_at_value_mid)
    market_ppsf = _finite(inp.market_data.median_price_per_sqft)
    confidence = _finite(result.as_is.confidence_score)

    if as_is_low and as_is_mid and as_is_high:
        if as_is_low <= 0 or as_is_mid <= 0 or as_is_high <= 0:
            flags.add("Appraisal output contains non-positive value conclusions.")
        if not (as_is_low <= as_is_mid <= as_is_high):
            flags.add("Appraisal range ordering is invalid.")
        if as_is_high > as_is_low * 2.5:
            flags.add("As-is valuation range is unusually wide relative to the low value.")

    if confidence is not None and confidence < 35:
        flags.add("Confidence score is low; manual review strongly recommended.")

    if land_value and as_is_mid and as_is_mid < land_value * 0.8:
        flags.add("As-is value is materially below stated land value.")

    if contract_price and as_is_mid:
        if as_is_mid < contract_price * 0.5:
            flags.add("As-is value is materially below the contract price.")
        if as_is_mid > contract_price * 2.25:
            flags.add("As-is value is materially above the contract price.")

    if requested_loan and as_is_mid and requested_loan > as_is_mid * 0.95:
        flags.add("Requested loan amount is near or above the as-is valuation.")

    if stabilized_mid and as_is_mid and stabilized_mid < as_is_mid:
        flags.add("Stabilized value is below as-is value.")

    if implied_cap is not None and (implied_cap < 0.01 or implied_cap > 0.25):
        flags.add("Implied cap rate falls outside a plausible lender review range.")

    if market_ppsf and implied_ppsf:
        if implied_ppsf < market_ppsf * 0.35 or implied_ppsf > market_ppsf * 2.5:
            flags.add("Implied price per square foot is materially different from market context.")

    return list(flags)


# ── Template fallback ─────────────────────────────────────────────────────────

def template_fallback_appraisal(inp: AiAppraisalInput) -> AiAppraisalResult:
    anchor = _anchor_value(inp)
    comp_mid = _midpoint_from_comps(inp.market_data.sale_comps, anchor)
    base_mid = round((anchor * 0.65 + comp_mid * 0.35) / 1000) * 1000
    noi_annual = _calculate_noi_annual(inp)
    sq_ft = _finite(inp.subject_property.square_feet)
    stabilized_anchor = _finite(inp.deal_terms.estimated_stabilized_value) or _finite(inp.deal_terms.arv)

    return AiAppraisalResult(
        as_is=_create_value_block(base_mid, 0.2, 28, ["Sales Comparison Approach", "Income Approach"]),
        stabilized=(
            _create_value_block(stabilized_anchor, 0.18, 32, ["Sales Comparison Approach", "Income Approach"])
            if stabilized_anchor
            else None
        ),
        metrics=AppraisalMetrics(
            noi_annual=noi_annual,
            cap_rate_implied_at_value_mid=(noi_annual / base_mid if noi_annual > 0 and base_mid > 0 else None),
            price_per_sqft_implied_at_value_mid=(base_mid / sq_ft if sq_ft and sq_ft > 0 else None),
        ),
        comps_used=_unique_comp_labels(inp),
        risk_flags=[
            "Template fallback used; do not use for binding credit decisions.",
            "AI valuation unavailable or invalid at runtime.",
            *(inp.market_data.data_issues or []),
        ],
        notes_for_credit_committee=(
            "Template fallback used because AI output was unavailable or invalid. "
            "Value opinion is conservative, range-based, and intended for internal "
            "screening only until a full lender review is complete."
        ),
        notes_for_borrower=(
            "We prepared a preliminary internal value range using available deal and "
            "market data. This is not a formal appraisal and may change after additional review."
        ),
    )


# ── AI appraisal (OpenAI call) ────────────────────────────────────────────────

def _input_to_camel_case_dict(inp: AiAppraisalInput) -> dict:
    """Convert snake_case Pydantic model to camelCase dict for the AI prompt."""
    def _to_camel(snake: str) -> str:
        parts = snake.split("_")
        return parts[0] + "".join(p.capitalize() for p in parts[1:])

    def _convert(obj: Any) -> Any:
        if isinstance(obj, dict):
            return {_to_camel(k): _convert(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [_convert(item) for item in obj]
        return obj

    return _convert(inp.model_dump(exclude_none=True))


async def generate_appraisal(inp: AiAppraisalInput) -> AiAppraisalResult:
    """Run the AI appraisal engine. Falls back to template if AI is unavailable."""
    if not settings.OPENAI_API_KEY:
        return template_fallback_appraisal(inp)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4.1-mini",
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1,
                    "max_tokens": 1800,
                    "messages": [
                        {"role": "system", "content": APPRAISAL_SYSTEM_PROMPT},
                        {
                            "role": "user",
                            "content": json.dumps({
                                "appraisalRequest": _input_to_camel_case_dict(inp),
                                "instructions": {
                                    "output": "Return only the JSON object. Do not wrap in markdown.",
                                    "emphasis": "Conservative lender-first valuation with explicit uncertainty handling.",
                                },
                            }),
                        },
                    ],
                },
            )
            response.raise_for_status()

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        if not content:
            raise ValueError("AI returned empty content.")

        parsed = json.loads(content)
        sanitized = _sanitize_ai_result(parsed, inp)
        if not sanitized:
            raise ValueError("AI returned an invalid appraisal payload.")

        # Run guardrails
        anomalies = check_output_for_anomalies(sanitized, inp)
        if anomalies:
            sanitized.risk_flags = list(set(sanitized.risk_flags + anomalies))

        return sanitized

    except Exception as e:
        logger.error("[AI Appraisal] Falling back to template appraisal: %s", e)
        return template_fallback_appraisal(inp)
