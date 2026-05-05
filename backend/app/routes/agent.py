"""
Multi-agent supervisor route ("Ask David").

  POST /api/agent/ask  — run the supervisor pipeline against a natural-language question
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import AgentAskRequest, AgentAskResponse
from app.services.agents import run_agent

router = APIRouter()


@router.post("/ask", response_model=AgentAskResponse)
async def ask(payload: AgentAskRequest, db: AsyncSession = Depends(get_db)):
    try:
        return await run_agent(
            question=payload.question, db=db, context=payload.context
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"agent run failed: {e}")
