"""Run with: python -m app.seed"""
import asyncio
from sqlalchemy import select
from app.database import engine, async_session
from app.models import Base, Lender

LENDERS = [
    {"name": "Visio Lending", "product_type": "dscr", "min_fico": 660, "min_dscr": 1.0, "max_ltv": 0.80, "min_loan": 75000, "max_loan": 2000000, "geography": {"states": []}, "notes": "Primary DSCR lender. Strong for 1-4 unit rentals."},
    {"name": "LimaOne Capital", "product_type": "dscr", "min_fico": 660, "min_dscr": 0.75, "max_ltv": 0.80, "min_loan": 75000, "max_loan": 3000000, "geography": {"states": []}, "notes": "Bridge + Rental programs. Flexible on DSCR."},
    {"name": "Kiavi", "product_type": "flip", "min_fico": 640, "max_ltc": 0.90, "max_ltv": 0.75, "min_loan": 100000, "max_loan": 1500000, "geography": {"states": []}, "notes": "Fix & Flip specialist. Fast closings."},
    {"name": "Roc Capital", "product_type": "flip", "min_fico": 620, "max_ltc": 0.85, "min_loan": 75000, "max_loan": 5000000, "geography": {"states": []}, "notes": "Bridge and rental. Portfolio-friendly."},
    {"name": "Easy Street Capital", "product_type": "dscr", "min_fico": 660, "min_dscr": 1.0, "max_ltv": 0.80, "min_loan": 75000, "max_loan": 2000000, "geography": {"states": []}, "notes": "DSCR specialist. Competitive rates."},
    {"name": "Tidal Loans", "product_type": "dscr", "min_fico": 680, "min_dscr": 1.0, "max_ltv": 0.75, "min_loan": 100000, "max_loan": 1500000, "geography": {"states": []}, "notes": "DSCR residential focus."},
    {"name": "New Silver", "product_type": "flip", "min_fico": 650, "max_ltc": 0.90, "max_ltv": 0.70, "min_loan": 100000, "max_loan": 2000000, "geography": {"states": []}, "notes": "Fix & flip up to 4 units. Fast draws."},
    {"name": "ArchWest Capital", "product_type": "flip", "min_fico": 620, "max_ltc": 0.85, "min_loan": 150000, "max_loan": 5000000, "geography": {"states": []}, "notes": "Bridge lending specialist."},
    {"name": "Stormfield Capital", "product_type": "multifamily", "min_dscr": 1.2, "max_ltv": 0.75, "min_loan": 500000, "max_loan": 10000000, "geography": {"states": []}, "notes": "Commercial bridge. 5+ units, mixed-use."},
    {"name": "Dominion Financial", "product_type": "dscr", "min_fico": 640, "min_dscr": 0.75, "max_ltv": 0.80, "min_loan": 75000, "max_loan": 2000000, "geography": {"states": []}, "notes": "No-ratio and DSCR programs."},
    {"name": "Velocity Mortgage", "product_type": "multifamily", "min_dscr": 1.15, "max_ltv": 0.75, "min_loan": 250000, "max_loan": 5000000, "geography": {"states": []}, "notes": "Small balance commercial. 5+ units."},
    {"name": "CoreVest", "product_type": "dscr", "min_fico": 660, "min_dscr": 1.0, "max_ltv": 0.80, "min_loan": 75000, "max_loan": 50000000, "geography": {"states": []}, "notes": "Portfolio/blanket DSCR loans. STR-friendly."},
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        for data in LENDERS:
            result = await db.execute(select(Lender).where(Lender.name == data["name"]))
            existing = result.scalar_one_or_none()
            if existing:
                for k, v in data.items():
                    setattr(existing, k, v)
                print(f"  ~ {data['name']} (updated)")
            else:
                db.add(Lender(**data))
                print(f"  + {data['name']}")
        await db.commit()

    print(f"\nSeeded {len(LENDERS)} lenders.")


if __name__ == "__main__":
    print("Seeding lenders...")
    asyncio.run(seed())
