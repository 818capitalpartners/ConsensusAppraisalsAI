import math

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.services.lender import query_lenders

_client: AsyncOpenAI | None = None


def _get_openai() -> AsyncOpenAI | None:
    global _client
    if not settings.OPENAI_API_KEY:
        return None
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


async def _call_ai(prompt: str) -> str:
    client = _get_openai()
    if not client:
        return "[AI triage unavailable - no API key configured]"
    try:
        resp = await client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=300,
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception as e:
        print(f"[AI Triage Error] {e}")
        return "[AI analysis temporarily unavailable]"


def _estimate_piti(loan_amount: float, value: float) -> float:
    if not loan_amount or not value:
        return 0
    rate = 0.085 / 12
    n = 30 * 12
    pi = (loan_amount * rate) / (1 - math.pow(1 + rate, -n))
    ti = (value * 0.015) / 12
    return pi + ti


# ── DSCR ───────────────────────────────────────────────────────────────────────

async def _triage_dscr(deal, fin: dict, db: AsyncSession) -> dict:
    rent = float(fin.get("monthly_rent", 0))
    piti = float(fin.get("piti", 0)) or _estimate_piti(
        float(fin.get("loan_amount", 0)), float(fin.get("estimated_value", 0))
    )
    fico_band = fin.get("fico_band", "unknown")
    loan_amount = float(fin.get("loan_amount", 0))
    dscr = rent / piti if piti > 0 else 0

    if dscr >= 1.15 and fico_band in ("700-739", "740+"):
        score = "green"
    elif dscr >= 1.0:
        score = "yellow"
    else:
        score = "red"

    lenders = await query_lenders(
        db, product_type="dscr", dscr=dscr, fico_band=fico_band,
        loan_amount=loan_amount, state=deal.property_state,
    )

    narrative = await _call_ai(f"""You are a senior DSCR underwriter at 818 Capital.

Borrower scenario:
- Rent: ${rent:,.2f}
- PITI: ${piti:,.2f}
- DSCR: {dscr:.2f}
- FICO band: {fico_band}
- Loan amount: ${loan_amount:,.0f}
- 818 score: {score.upper()}

Write 2-3 sentences explaining: 1) If this likely works for DSCR lending, 2) Rough LTV range, 3) Next steps and docs.
Tone: direct, numeric, no corporate buzzwords.""")

    return {
        "lane": "dscr", "dscr": round(dscr, 2), "score": score,
        "lenders": [l.name for l in lenders], "narrative": narrative,
        "next_steps": (
            "We'll reach out to discuss restructuring." if score == "red"
            else "We'll review docs and aim to send a term sheet within 24 hours."
        ),
    }


# ── Fix & Flip ─────────────────────────────────────────────────────────────────

async def _triage_flip(deal, fin: dict, db: AsyncSession) -> dict:
    purchase = float(fin.get("purchase_price", 0))
    rehab = float(fin.get("rehab_budget", 0))
    arv = float(fin.get("arv", 0))
    loan_amount = float(fin.get("loan_amount", 0))
    experience = fin.get("experience_band", "0")

    total_cost = purchase + rehab
    ltc = loan_amount / total_cost if total_cost > 0 else 0
    cost_factor = 0.10
    profit100 = arv - total_cost - (loan_amount * cost_factor)
    profit95 = (arv * 0.95) - total_cost - (loan_amount * cost_factor)
    profit90 = (arv * 0.90) - total_cost - (loan_amount * cost_factor)

    if profit90 > 0 and experience in ("3-5", "6-10", "11+"):
        score, max_ltc = "green", 0.9
    elif profit95 > 0:
        score, max_ltc = "yellow", 0.8
    else:
        score, max_ltc = "red", 0.0

    narrative = await _call_ai(f"""You are a fix & flip underwriter at 818 Capital.

Deal: Purchase: ${purchase:,.0f}, Rehab: ${rehab:,.0f}, ARV: ${arv:,.0f},
Total cost: ${total_cost:,.0f}, Loan: ${loan_amount:,.0f}, Experience: {experience} flips,
LTC: {ltc*100:.1f}%, Profit @100%: ${profit100:,.0f}, @95%: ${profit95:,.0f}, @90%: ${profit90:,.0f}
Score: {score.upper()}

Write 2-3 sentences: is it a good flip, max LTC we'd offer, what to adjust if thin. Tone: blunt but helpful.""")

    return {
        "lane": "flip", "ltc": round(ltc, 3), "max_ltc": max_ltc,
        "profit_scenarios": {"profit100": profit100, "profit95": profit95, "profit90": profit90},
        "score": score, "narrative": narrative,
    }


# ── STR ────────────────────────────────────────────────────────────────────────

async def _triage_str(deal, fin: dict, db: AsyncSession) -> dict:
    annual_str = float(fin.get("annual_str_income", 0))
    monthly_str = annual_str / 12
    piti = float(fin.get("piti", 0)) or _estimate_piti(
        float(fin.get("loan_amount", 0)), float(fin.get("estimated_value", 0))
    )
    fico_band = fin.get("fico_band", "unknown")
    loan_amount = float(fin.get("loan_amount", 0))
    conservative = monthly_str * 0.75
    dscr = conservative / piti if piti > 0 else 0

    if dscr >= 1.25 and fico_band in ("700-739", "740+"):
        score = "green"
    elif dscr >= 1.0:
        score = "yellow"
    else:
        score = "red"

    lenders = await query_lenders(
        db, product_type="str", dscr=dscr, fico_band=fico_band,
        loan_amount=loan_amount, state=deal.property_state,
    )

    narrative = await _call_ai(f"""You are an STR underwriter at 818 Capital.

Annual STR income: ${annual_str:,.0f}, Monthly (gross): ${monthly_str:,.0f},
Conservative (75%): ${conservative:,.0f}, PITI: ${piti:,.2f}, DSCR: {dscr:.2f},
FICO: {fico_band}, Loan: ${loan_amount:,.0f}, Score: {score.upper()}

Write 2-3 sentences: does this STR work for DSCR, risk factors, docs needed. Tone: direct, practical.""")

    return {
        "lane": "str", "dscr": round(dscr, 2), "conservative_monthly": conservative,
        "score": score, "lenders": [l.name for l in lenders], "narrative": narrative,
        "next_steps": (
            "STR income may not support this loan. Consider larger down payment."
            if score == "red"
            else "We'll need Airbnb/VRBO statements and AirDNA report. Term sheet in 24-48 hours."
        ),
    }


# ── Multifamily ────────────────────────────────────────────────────────────────

async def _triage_multifamily(deal, fin: dict, db: AsyncSession) -> dict:
    noi = float(fin.get("noi", 0))
    purchase = float(fin.get("purchase_price", 0) or fin.get("estimated_value", 0))
    loan_amount = float(fin.get("loan_amount", 0))
    units = deal.units or int(fin.get("units", 0))

    cap_rate = noi / purchase if purchase > 0 else 0
    dscr = noi / (loan_amount * 0.07) if loan_amount > 0 else 0
    ltv = loan_amount / purchase if purchase > 0 else 0
    debt_yield = noi / loan_amount if loan_amount > 0 else 0

    if dscr >= 1.25 and debt_yield >= 0.08 and ltv <= 0.75:
        score = "green"
    elif dscr >= 1.1 and ltv <= 0.80:
        score = "yellow"
    else:
        score = "red"

    lenders = await query_lenders(
        db, product_type="multifamily", dscr=dscr, loan_amount=loan_amount,
        state=deal.property_state,
    )

    narrative = await _call_ai(f"""You are a multifamily/commercial underwriter at 818 Capital.

Sponsor Brief: Units: {units}, NOI: ${noi:,.0f}, Value: ${purchase:,.0f},
Loan: ${loan_amount:,.0f}, Cap: {cap_rate*100:.2f}%, DSCR: {dscr:.2f},
LTV: {ltv*100:.1f}%, Debt yield: {debt_yield*100:.2f}%, Score: {score.upper()}

Write 3-4 sentences: viability, metrics summary, best financing path, required docs. Tone: professional.""")

    return {
        "lane": "multifamily", "noi": noi, "cap_rate": round(cap_rate, 4),
        "dscr": round(dscr, 2), "ltv": round(ltv, 3),
        "debt_yield": round(debt_yield, 4), "score": score,
        "lenders": [l.name for l in lenders], "narrative": narrative,
    }


# ── Dispatcher ─────────────────────────────────────────────────────────────────

async def triage_deal(deal, db: AsyncSession) -> dict:
    fin = deal.financials or {}
    lane = deal.product_lane

    dispatchers = {
        "dscr": _triage_dscr,
        "flip": _triage_flip,
        "str": _triage_str,
        "multifamily": _triage_multifamily,
    }

    handler = dispatchers.get(lane)
    if not handler:
        raise ValueError(f"Unsupported lane: {lane}")
    return await handler(deal, fin, db)
