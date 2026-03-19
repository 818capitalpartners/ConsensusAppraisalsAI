from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Deal, Person
from app.schemas import CreateDealRequest
from app.services.deals import create_deal

router = APIRouter()


@router.post("/", status_code=201)
async def create_deal_endpoint(payload: CreateDealRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await create_deal(payload, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def list_deals(
    status: str | None = None,
    product_lane: str | None = None,
    limit: int = Query(default=50, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Deal).order_by(Deal.created_at.desc()).offset(offset).limit(limit)
    if status:
        stmt = stmt.where(Deal.status == status)
    if product_lane:
        stmt = stmt.where(Deal.product_lane == product_lane)

    result = await db.execute(stmt)
    deals = result.scalars().all()

    return {
        "deals": [
            {
                "id": d.id, "person_id": d.person_id, "product_lane": d.product_lane,
                "status": d.status, "deal_score": d.deal_score,
                "property_address": d.property_address, "financials": d.financials,
                "ai_triage_result": d.ai_triage_result, "created_at": d.created_at.isoformat(),
            }
            for d in deals
        ],
        "count": len(deals),
    }


@router.get("/{deal_id}")
async def get_deal(deal_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Deal).where(Deal.id == deal_id)
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    person_result = await db.execute(select(Person).where(Person.id == deal.person_id))
    person = person_result.scalar_one_or_none()

    return {
        "deal": {
            "id": deal.id, "person_id": deal.person_id, "product_lane": deal.product_lane,
            "status": deal.status, "deal_score": deal.deal_score,
            "property_address": deal.property_address, "financials": deal.financials,
            "ai_triage_result": deal.ai_triage_result,
        },
        "person": {
            "id": person.id, "first_name": person.first_name, "last_name": person.last_name,
            "email": person.email,
        } if person else None,
    }
