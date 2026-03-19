import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Person, Deal
from app.schemas import CreateDealRequest
from app.services.triage import triage_deal
from app.services.appraisal import generate_appraisal
from app.services.monday import create_monday_item
from app.services.slack import post_slack_notification
from app.services.email import send_confirmation_email, add_contact_to_esp
from app.schemas import (
    AiAppraisalInput,
    SubjectPropertySnapshot,
    DealTermsSnapshot,
    IncomeAndExpensesSnapshot,
    MarketDataSnapshot,
)


async def create_deal(payload: CreateDealRequest, db: AsyncSession) -> dict:
    p = payload.person

    # 1. Upsert person
    result = await db.execute(select(Person).where(Person.email == p.email))
    person = result.scalar_one_or_none()

    if person:
        person.type = p.type
        if p.first_name:
            person.first_name = p.first_name
        if p.last_name:
            person.last_name = p.last_name
        if p.phone:
            person.phone = p.phone
        if p.company:
            person.company = p.company
    else:
        person = Person(
            type=p.type, first_name=p.first_name, last_name=p.last_name,
            email=p.email, phone=p.phone, company=p.company,
        )
        db.add(person)

    await db.flush()

    # 2. Create deal
    d = payload.deal
    deal = Deal(
        person_id=person.id, product_lane=d.product_lane, lead_type=d.lead_type,
        channel=d.channel, property_address=d.property_address, property_city=d.property_city,
        property_state=d.property_state, property_zip=d.property_zip,
        property_type=d.property_type, units=d.units, financials=d.financials,
    )
    db.add(deal)
    await db.flush()

    # 3. AI triage
    try:
        triage = await triage_deal(deal, db)
        deal.ai_triage_result = triage
        deal.deal_score = triage.get("score")
    except Exception as e:
        print(f"[Triage] Failed: {e}")

    # 4. AI appraisal (if enough property data exists)
    has_address = bool(d.property_address)
    fin = d.financials or {}
    has_value = any(fin.get(k) for k in ["purchase_price", "contract_price", "estimated_value", "as_is_value"])
    has_income = any(fin.get(k) for k in ["monthly_rent", "gross_monthly_rent", "noi_annual", "annual_rent"])

    if has_address and (has_value or has_income):
        try:
            appraisal_input = AiAppraisalInput(
                deal_id=deal.id,
                lane=d.product_lane,
                subject_property=SubjectPropertySnapshot(
                    address=d.property_address,
                    city=d.property_city,
                    state=d.property_state,
                    zip=d.property_zip,
                    property_type=d.property_type,
                    units=d.units,
                    square_feet=fin.get("square_feet"),
                ),
                deal_terms=DealTermsSnapshot(
                    purchase_price=fin.get("purchase_price"),
                    contract_price=fin.get("contract_price"),
                    requested_loan_amount=fin.get("loan_amount"),
                    estimated_as_is_value=fin.get("as_is_value") or fin.get("estimated_value"),
                    arv=fin.get("arv") or fin.get("after_repair_value"),
                    rehab_budget=fin.get("rehab_budget"),
                ),
                income_and_expenses=IncomeAndExpensesSnapshot(
                    gross_monthly_rent=fin.get("monthly_rent") or fin.get("gross_monthly_rent"),
                    noi_annual=fin.get("noi_annual"),
                ),
                market_data=MarketDataSnapshot(),
            )
            appraisal_result = await generate_appraisal(appraisal_input)
            deal.ai_appraisal_result = appraisal_result.model_dump()
        except Exception as e:
            print(f"[Appraisal] Failed: {e}")

    await db.commit()
    await db.refresh(person)
    await db.refresh(deal)

    # 4. Integrations (non-blocking)
    async def _run_integrations():
        results = await asyncio.gather(
            create_monday_item(deal, person),
            post_slack_notification(deal, person),
            send_confirmation_email(person, deal),
            add_contact_to_esp(person, [f"tag_{d.product_lane}_interest"]),
            return_exceptions=True,
        )
        monday_id = results[0]
        if monday_id and not isinstance(monday_id, Exception):
            deal.monday_item_id = monday_id
            await db.commit()

        for i, r in enumerate(results):
            if isinstance(r, Exception):
                names = ["Monday", "Slack", "Email", "ESP"]
                print(f"[{names[i]}] Integration failed: {r}")

    asyncio.create_task(_run_integrations())

    return {
        "person": {
            "id": person.id, "type": person.type, "first_name": person.first_name,
            "last_name": person.last_name, "email": person.email,
            "phone": person.phone, "company": person.company,
        },
        "deal": {
            "id": deal.id, "person_id": deal.person_id, "product_lane": deal.product_lane,
            "lead_type": deal.lead_type, "channel": deal.channel, "status": deal.status,
            "property_address": deal.property_address, "financials": deal.financials,
            "ai_triage_result": deal.ai_triage_result, "deal_score": deal.deal_score,
        },
    }
