import httpx

from app.config import settings

BREVO_API = "https://api.brevo.com/v3"


async def _brevo(path: str, method: str = "POST", body: dict | None = None):
    if not settings.BREVO_API_KEY:
        print("[Email] No Brevo key, skipping")
        return None
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.request(
                method, f"{BREVO_API}{path}",
                headers={"Content-Type": "application/json", "api-key": settings.BREVO_API_KEY},
                json=body, timeout=10.0,
            )
            if resp.status_code == 204:
                return {}
            if not resp.is_success:
                print(f"[Email] Brevo {resp.status_code}: {resp.text}")
                return None
            return resp.json()
    except Exception as e:
        print(f"[Email] Brevo error: {e}")
        return None


async def add_contact_to_esp(person, tags: list[str]) -> None:
    await _brevo("/contacts", body={
        "email": person.email,
        "attributes": {
            "FIRSTNAME": person.first_name,
            "LASTNAME": person.last_name,
            "PHONE": person.phone or "",
            "COMPANY": person.company or "",
        },
        "updateEnabled": True,
    })
    if tags:
        print(f"[Email] Tagged {person.email}: {', '.join(tags)}")


async def send_confirmation_email(person, deal) -> None:
    if not settings.BREVO_API_KEY:
        return

    lane_display = {
        "dscr": "DSCR / Rental", "flip": "Fix & Flip",
        "str": "Short-Term Rental", "multifamily": "Multifamily / Commercial",
    }.get(deal.product_lane, deal.product_lane)

    narrative = (deal.ai_triage_result or {}).get("narrative", "We are reviewing your submission.")

    await _brevo("/smtp/email", body={
        "sender": {"name": "818 Capital", "email": "deals@818capitalpartners.com"},
        "to": [{"email": person.email, "name": f"{person.first_name} {person.last_name}"}],
        "subject": f"818 Capital - Your {lane_display} Scenario Has Been Received",
        "htmlContent": f"""
            <h2>Thanks for submitting your scenario, {person.first_name}.</h2>
            <p>We've received your <strong>{lane_display}</strong> deal and our team is reviewing it now.</p>
            <h3>Initial Read</h3>
            <p>{narrative}</p>
            <p>A member of our team will follow up within 24 hours with next steps.</p>
            <br/><p>Best,<br/>818 Capital Team<br/>818 Capital<br/>(917) 993-9194</p>
        """,
    })
