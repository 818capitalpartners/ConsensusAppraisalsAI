"""
Appraisal AI routes:
  POST /api/appraisal/        — Run appraisal on a deal
  GET  /api/appraisal/{id}    — Fetch stored appraisal result
  GET  /api/appraisal/{id}/borrower-summary  — Borrower-facing version
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Deal
from app.schemas import (
    AiAppraisalInput,
    AiAppraisalResult,
    BorrowerFacingSummary,
)
from app.services.appraisal import generate_appraisal

router = APIRouter()


@router.post("/", response_model=AiAppraisalResult)
async def run_appraisal(payload: AiAppraisalInput, db: AsyncSession = Depends(get_db)):
    """Run the AI appraisal engine on deal data and store the result."""
    result = await generate_appraisal(payload)

    # Store result on deal if deal_id provided
    if payload.deal_id:
        stmt = select(Deal).where(Deal.id == payload.deal_id)
        row = await db.execute(stmt)
        deal = row.scalar_one_or_none()
        if deal:
            deal.ai_appraisal_result = result.model_dump()
            await db.commit()

    return result


@router.get("/{deal_id}", response_model=AiAppraisalResult)
async def get_appraisal(deal_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch stored appraisal result for a deal."""
    stmt = select(Deal).where(Deal.id == deal_id)
    row = await db.execute(stmt)
    deal = row.scalar_one_or_none()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if not deal.ai_appraisal_result:
        raise HTTPException(status_code=404, detail="No appraisal result stored for this deal")

    return AiAppraisalResult(**deal.ai_appraisal_result)


@router.get("/{deal_id}/borrower-summary", response_model=BorrowerFacingSummary)
async def get_borrower_summary(deal_id: str, db: AsyncSession = Depends(get_db)):
    """Return a borrower-safe version of the appraisal (no internal credit notes)."""
    stmt = select(Deal).where(Deal.id == deal_id)
    row = await db.execute(stmt)
    deal = row.scalar_one_or_none()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if not deal.ai_appraisal_result:
        raise HTTPException(status_code=404, detail="No appraisal result stored for this deal")

    data = deal.ai_appraisal_result
    as_is = data.get("as_is", {})
    stabilized = data.get("stabilized")

    def _format_range(block: dict) -> str:
        low = block.get("value_low", 0)
        high = block.get("value_high", 0)
        return f"${low:,.0f} – ${high:,.0f}"

    return BorrowerFacingSummary(
        deal_id=deal_id,
        as_is_value_range=_format_range(as_is),
        stabilized_value_range=_format_range(stabilized) if stabilized else None,
        confidence=as_is.get("confidence_score", 0),
        methods_used=as_is.get("primary_methods", []),
        risk_summary=[f for f in data.get("risk_flags", []) if "credit committee" not in f.lower() and "template fallback" not in f.lower()],
        notes=data.get("notes_for_borrower", ""),
    )
