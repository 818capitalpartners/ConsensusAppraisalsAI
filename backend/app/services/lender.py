from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Lender


def _approx_fico(band: str) -> int:
    if band.startswith("<"):
        return 600
    mapping = {"620-659": 630, "660-699": 675, "700-739": 715, "740+": 750}
    return mapping.get(band, 650)


async def query_lenders(
    db: AsyncSession,
    *,
    product_type: str | None = None,
    dscr: float | None = None,
    fico_band: str | None = None,
    loan_amount: float | None = None,
    state: str | None = None,
) -> list[Lender]:
    stmt = select(Lender).where(Lender.is_active == True)
    if product_type:
        stmt = stmt.where(Lender.product_type == product_type)

    result = await db.execute(stmt.limit(20))
    lenders = list(result.scalars().all())

    # Post-filter on numeric criteria
    filtered = []
    for l in lenders:
        if dscr is not None and l.min_dscr and dscr < l.min_dscr:
            continue
        if fico_band and l.min_fico:
            if _approx_fico(fico_band) < l.min_fico:
                continue
        if loan_amount is not None:
            if l.min_loan and loan_amount < l.min_loan:
                continue
            if l.max_loan and loan_amount > l.max_loan:
                continue
        if state and l.geography:
            states = l.geography.get("states", [])
            if states and state not in states:
                continue
        filtered.append(l)

    return filtered[:5]
