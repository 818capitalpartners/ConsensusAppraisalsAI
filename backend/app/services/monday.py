import json

import httpx

from app.config import settings

MONDAY_API_URL = "https://api.monday.com/v2"

COLUMN_MAP = {
    "borrower_name": "text_mm12gee2",
    "borrower_email": "email_mm12f6fx",
    "borrower_phone": "phone_mm12pk9z",
    "loan_amount": "numeric_mm125dz6",
    "property_address": "text_mm12e5bc",
    "loan_type": "color_mm126r6",
    "priority": "color_mm129w1w",
    "lead_source": "color_mm15fca3",
    "recommended_lenders": "text_mm169qm",
    "next_action": "text_mm15px3",
}

LANE_LABELS = {
    "dscr": "DSCR", "flip": "Fix-and-Flip", "str": "STR", "multifamily": "Multifamily",
}

SCORE_PRIORITY = {"green": "Hot", "yellow": "Warm", "red": "Cold"}

NEW_LEAD_GROUP = "group_mm12t0dw"


async def create_monday_item(deal, person) -> str | None:
    if not settings.MONDAY_API_TOKEN:
        print("[Monday] No API token configured, skipping")
        return None

    lane_label = LANE_LABELS.get(deal.product_lane, deal.product_lane)
    priority = SCORE_PRIORITY.get(deal.deal_score or "", "Warm")
    lenders = ""
    if deal.ai_triage_result and "lenders" in deal.ai_triage_result:
        lenders = ", ".join(deal.ai_triage_result["lenders"])

    col_vals = {
        COLUMN_MAP["borrower_name"]: f"{person.first_name} {person.last_name}",
        COLUMN_MAP["borrower_email"]: {"email": person.email, "text": person.email},
        COLUMN_MAP["loan_amount"]: str(deal.financials.get("loan_amount", "")),
        COLUMN_MAP["property_address"]: deal.property_address or "",
        COLUMN_MAP["loan_type"]: {"label": lane_label},
        COLUMN_MAP["priority"]: {"label": priority},
        COLUMN_MAP["lead_source"]: {"label": "Website"},
        COLUMN_MAP["recommended_lenders"]: lenders,
        COLUMN_MAP["next_action"]: (
            deal.ai_triage_result.get("next_steps", "Review submission")
            if deal.ai_triage_result else "Review submission"
        ),
    }

    if person.phone:
        col_vals[COLUMN_MAP["borrower_phone"]] = {"phone": person.phone, "countryShortName": "US"}

    item_name = f"{person.first_name} {person.last_name} - {lane_label}"

    query = """
    mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
      create_item(board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }
    """

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                MONDAY_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": settings.MONDAY_API_TOKEN,
                    "API-Version": "2024-10",
                },
                json={
                    "query": query,
                    "variables": {
                        "boardId": settings.MONDAY_PIPELINE_BOARD_ID,
                        "groupId": NEW_LEAD_GROUP,
                        "itemName": item_name,
                        "columnValues": json.dumps(col_vals),
                    },
                },
                timeout=15.0,
            )
            data = resp.json()
            item_id = data.get("data", {}).get("create_item", {}).get("id")
            if item_id:
                print(f"[Monday] Created item {item_id}")
            return item_id
    except Exception as e:
        print(f"[Monday] Failed: {e}")
        return None
