import json

from fastapi import APIRouter, HTTPException
from openai import AsyncOpenAI

from app.config import settings
from app.schemas import ContentRequest

router = APIRouter()

LANE_CONTEXT = {
    "dscr": "DSCR/rental", "flip": "fix & flip",
    "str": "short-term rental", "multifamily": "multifamily",
}


@router.post("/generate")
async def generate_content(payload: ContentRequest):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")

    lane_ctx = f"Focus on {LANE_CONTEXT.get(payload.lane, '')} lending." if payload.lane else ""

    prompts = {
        "scripts": f"""Generate {payload.count} short-form video scripts about: "{payload.topic}"
{lane_ctx}
Return JSON: {{"scripts": [{{ "hook": "...", "body": "...", "cta": "...", "visuals": "..." }}]}}
Tone: authentic, education-first. Brand: 818 Capital, Ravi Punn.""",

        "social": f"""Generate {payload.count} social media captions about "{payload.topic}" for 818 Capital.
{lane_ctx}
Return JSON: {{"captions": [{{ "platform": "instagram"|"linkedin"|"tiktok", "caption": "...", "hashtags": ["..."] }}]}}""",

        "blog": f"""Write a blog post outline about "{payload.topic}" for 818 Capital.
{lane_ctx}
Return JSON: {{"title": "...", "meta_description": "...", "sections": [{{"heading": "...", "key_points": ["..."]}}], "cta": "..."}}""",

        "email": f"""Write {payload.count} email templates about "{payload.topic}" for 818 Capital.
{lane_ctx}
Return JSON: {{"emails": [{{"subject": "...", "preview": "...", "body_outline": "..."}}]}}""",
    }

    try:
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        resp = await client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompts[payload.type]}],
            temperature=0.7, response_format={"type": "json_object"},
        )
        content = json.loads(resp.choices[0].message.content or "{}")
        return {"type": payload.type, "topic": payload.topic, "lane": payload.lane, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")
