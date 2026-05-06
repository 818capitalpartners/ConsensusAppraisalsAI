"""
Retrieval subagent — DB-backed search over deals, persons, lenders.

All tools return JSON-serializable dicts so they can flow through trace logs
and into LLM synthesis prompts.
"""

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Deal, Lender, Person
from app.services.lender import query_lenders


def _deal_to_dict(d: Deal) -> dict[str, Any]:
    return {
        "id": d.id,
        "person_id": d.person_id,
        "product_lane": d.product_lane,
        "status": d.status,
        "deal_score": d.deal_score,
        "property_address": d.property_address,
        "property_city": d.property_city,
        "property_state": d.property_state,
        "property_zip": d.property_zip,
        "property_type": d.property_type,
        "units": d.units,
        "financials": d.financials or {},
        "ai_triage_result": d.ai_triage_result,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    }


def _person_to_dict(p: Person) -> dict[str, Any]:
    return {
        "id": p.id,
        "type": p.type,
        "first_name": p.first_name,
        "last_name": p.last_name,
        "email": p.email,
        "phone": p.phone,
        "company": p.company,
    }


def _lender_to_dict(l: Lender) -> dict[str, Any]:
    return {
        "id": l.id,
        "name": l.name,
        "product_type": l.product_type,
        "min_fico": l.min_fico,
        "min_dscr": l.min_dscr,
        "max_ltv": l.max_ltv,
        "max_ltc": l.max_ltc,
        "min_loan": l.min_loan,
        "max_loan": l.max_loan,
        "geography": l.geography,
    }


async def search_deals(
    db: AsyncSession,
    *,
    product_lane: str | None = None,
    deal_score: str | None = None,
    status: str | None = None,
    state: str | None = None,
    limit: int = 10,
) -> list[dict[str, Any]]:
    stmt = select(Deal).order_by(Deal.created_at.desc()).limit(min(max(limit, 1), 50))
    if product_lane:
        stmt = stmt.where(Deal.product_lane == product_lane)
    if deal_score:
        stmt = stmt.where(Deal.deal_score == deal_score)
    if status:
        stmt = stmt.where(Deal.status == status)
    if state:
        stmt = stmt.where(Deal.property_state == state.upper())
    rows = await db.execute(stmt)
    return [_deal_to_dict(d) for d in rows.scalars().all()]


async def get_deal(db: AsyncSession, *, deal_id: str) -> dict[str, Any] | None:
    rows = await db.execute(select(Deal).where(Deal.id == deal_id))
    deal = rows.scalar_one_or_none()
    return _deal_to_dict(deal) if deal else None


async def search_persons(
    db: AsyncSession,
    *,
    email: str | None = None,
    last_name: str | None = None,
    limit: int = 10,
) -> list[dict[str, Any]]:
    stmt = select(Person).order_by(Person.created_at.desc()).limit(min(max(limit, 1), 50))
    if email:
        stmt = stmt.where(Person.email == email.lower())
    if last_name:
        stmt = stmt.where(Person.last_name.ilike(last_name))
    rows = await db.execute(stmt)
    return [_person_to_dict(p) for p in rows.scalars().all()]


async def search_lenders(
    db: AsyncSession,
    *,
    product_type: str | None = None,
    state: str | None = None,
    dscr: float | None = None,
    fico_band: str | None = None,
    loan_amount: float | None = None,
) -> list[dict[str, Any]]:
    lenders = await query_lenders(
        db,
        product_type=product_type,
        dscr=dscr,
        fico_band=fico_band,
        loan_amount=loan_amount,
        state=state,
    )
    return [_lender_to_dict(l) for l in lenders]


TOOLS = {
    "search_deals": search_deals,
    "get_deal": get_deal,
    "search_persons": search_persons,
    "search_lenders": search_lenders,
}


CATALOG = [
    {
        "tool": "search_deals",
        "description": "Search recent deals. Filters: product_lane (dscr|flip|str|multifamily), deal_score (green|yellow|red), status, state (2-letter), limit.",
    },
    {
        "tool": "get_deal",
        "description": "Fetch a single deal by id (UUID string). Required: deal_id.",
    },
    {
        "tool": "search_persons",
        "description": "Search persons (borrowers/brokers). Filters: email, last_name, limit.",
    },
    {
        "tool": "search_lenders",
        "description": "Search active lenders matching product_type, dscr, fico_band (e.g. '700-739'), loan_amount, and state.",
    },
]
