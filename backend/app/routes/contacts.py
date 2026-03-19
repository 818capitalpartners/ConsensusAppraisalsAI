from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Person
from app.schemas import ContactSubscribe
from app.services.email import add_contact_to_esp

router = APIRouter()


@router.post("/", status_code=201)
async def subscribe_contact(payload: ContactSubscribe, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Person).where(Person.email == payload.email))
        person = result.scalar_one_or_none()

        if person:
            person.type = payload.type or person.type
            if payload.first_name:
                person.first_name = payload.first_name
            if payload.last_name:
                person.last_name = payload.last_name
            if payload.phone:
                person.phone = payload.phone
            if payload.company:
                person.company = payload.company
            person.esp_tags = list(set(person.esp_tags + payload.tags))
        else:
            person = Person(
                type=payload.type, first_name=payload.first_name or "",
                last_name=payload.last_name or "", email=payload.email,
                phone=payload.phone, company=payload.company, esp_tags=payload.tags,
            )
            db.add(person)

        await db.commit()
        await db.refresh(person)

        await add_contact_to_esp(person, payload.tags)

        return {"success": True, "id": person.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def list_contacts(
    type: str | None = None,
    limit: int = Query(default=50, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Person).order_by(Person.created_at.desc()).limit(limit)
    if type:
        stmt = stmt.where(Person.type == type)

    result = await db.execute(stmt)
    contacts = result.scalars().all()

    return {
        "contacts": [
            {
                "id": c.id, "type": c.type, "first_name": c.first_name,
                "last_name": c.last_name, "email": c.email,
                "phone": c.phone, "company": c.company, "esp_tags": c.esp_tags,
            }
            for c in contacts
        ],
        "count": len(contacts),
    }
