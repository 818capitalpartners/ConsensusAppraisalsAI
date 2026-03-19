import json

from fastapi import APIRouter, HTTPException
from openai import AsyncOpenAI

from app.config import settings
from app.schemas import BrokerKitRequest

router = APIRouter()


@router.post("/generate")
async def generate_broker_kit(payload: BrokerKitRequest):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")

    lanes_text = ", ".join(
        {"dscr": "DSCR / Rental loans", "flip": "Fix & Flip / Bridge loans",
         "str": "Short-Term Rental loans", "multifamily": "Multifamily / Commercial loans"}
        .get(l, l) for l in payload.product_lanes
    )

    prompt = f"""You are the marketing writer for 818 Capital, a real estate investment lending company.

Create a Broker Co-Marketing Kit for {payload.broker_name}{f' at {payload.broker_company}' if payload.broker_company else ''}.

Products to promote: {lanes_text}
Target audience: {payload.target_audience or 'Real estate investors'}

Generate the following in JSON format:
{{
  "email_templates": [5 outreach email templates, each with "subject" and "body"],
  "social_captions": [10 social media captions for LinkedIn/Instagram/Facebook],
  "one_pager_outline": "A structured outline for a one-page marketing flyer",
  "talking_points": [5 key talking points for phone conversations]
}}

Tone: professional but approachable, education-first, emphasize speed/flexibility/AI-powered analysis.
Brand: 818 Capital, founded by Ravi Punn, (917) 993-9194."""

    try:
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        resp = await client.chat.completions.create(
            model="gpt-4.1-mini", messages=[{"role": "user", "content": prompt}],
            temperature=0.6, response_format={"type": "json_object"},
        )
        kit = json.loads(resp.choices[0].message.content or "{}")
        return {"broker_name": payload.broker_name, "kit": kit}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")
