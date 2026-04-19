"""
Weekly insights generator — runs from GitHub Actions every Monday morning.

Fetches current CRE / DSCR / fix-and-flip industry signal, drafts a fresh
insight post via the Anthropic API, and appends it to
frontend/src/lib/insights-data.ts.

Requires:
  - ANTHROPIC_API_KEY env var (GitHub Actions secret)
  - No competitor lender names must appear in the output (Angela voice,
    deal-aware, 818 positioning).
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sys
from pathlib import Path

import requests
from anthropic import Anthropic

ROOT = Path(__file__).resolve().parent.parent
INSIGHTS_FILE = ROOT / "frontend" / "src" / "lib" / "insights-data.ts"

# Forbidden lender names — if the model names any of these, regenerate.
FORBIDDEN_LENDER_NAMES = [
    "Kiavi", "Angel Oak", "Visio", "CoreVest", "Griffin Funding", "Griffin",
    "RCN Capital", "Lima One", "Roc Capital", "Roc360", "Arbor", "Ready Capital",
    "CREFCOA", "Easy Street", "Stormfield", "Center Street", "AHL", "American Heritage",
    "FACo", "Constitution Lending", "New Silver",
]

SYSTEM_PROMPT = """You are a senior commercial mortgage broker writing an educational market-update post
for the 818 Capital Partners website. Your tone is direct, numeric, experienced — written for
active real estate investors who want actionable insight, not filler content.

HARD RULES:
1. NEVER mention any specific lender by name. Speak in terms of "the market," "lenders,"
   "agency programs," "private credit," or "non-QM issuers."
2. NEVER make up statistics. If you don't have a real number, speak qualitatively.
3. Write in markdown. Open with a sharp headline insight, not a throat-clearing intro.
4. Length: 500-900 words of body content.
5. Always close with a specific call to action for readers to send 818 their scenario.

Output format: strict JSON with these fields:
  slug:     kebab-case URL slug (no year suffix, max 60 chars)
  title:    under 90 chars, specific and numeric if possible
  excerpt:  1-2 sentences, under 200 chars
  category: one of "Market Update" | "Regulation" | "Fix & Flip" | "DSCR" | "Multifamily" | "Commercial"
  content:  the full markdown body
"""

USER_TEMPLATE = """Write this week's 818 Capital insight post.

Date: {date}

Current industry signal to incorporate (summarize, don't quote directly):
{news_bullets}

Pick ONE angle — the most interesting or actionable one — and write a focused post
on that theme. Do not try to cover everything.
"""

def search_news() -> list[str]:
    """Pull fresh headlines from public industry RSS-ish feeds.
    Falls back to a static list of topics if fetching fails."""
    topics = []

    # Use Google News RSS for CRE industry terms (no auth, no rate limits for reasonable use)
    queries = [
        "commercial mortgage rates this week",
        "DSCR loan rates",
        "fix and flip lending news",
        "multifamily agency lending",
        "non-QM mortgage market",
        "Fed rate decision commercial real estate",
    ]
    for q in queries:
        url = f"https://news.google.com/rss/search?q={q.replace(' ', '+')}&hl=en-US"
        try:
            r = requests.get(url, timeout=8, headers={"User-Agent": "818CapitalBot/1.0"})
            if r.status_code != 200:
                continue
            # Crude extraction — grab <title> tags, skip the first (feed title)
            titles = re.findall(r"<title>([^<]+)</title>", r.text)[1:6]
            topics.extend(titles)
        except Exception as e:
            print(f"  search failed for '{q}': {e}", file=sys.stderr)

    if not topics:
        topics = [
            "CRE rates continue to compress as non-QM market grows",
            "FHFA multifamily caps expanded for 2026",
            "Fix-and-flip bridge rates reflect competitive capital entering the space",
            "Fed paused rate cuts, DSCR pricing stabilizing",
        ]
    return topics[:20]


def existing_slugs() -> set[str]:
    text = INSIGHTS_FILE.read_text(encoding="utf-8")
    return set(re.findall(r"slug:\s*['\"]([^'\"]+)['\"]", text))


def generate_post(news_bullets: list[str]) -> dict:
    client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    used_slugs = existing_slugs()
    today = dt.date.today().strftime("%B %-d, %Y") if os.name != "nt" else dt.date.today().strftime("%B %d, %Y")

    bullet_text = "\n".join(f"- {b}" for b in news_bullets)

    for attempt in range(3):
        resp = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=3500,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": USER_TEMPLATE.format(date=today, news_bullets=bullet_text)
                + f"\n\nAvoid these existing slugs: {sorted(used_slugs)}\n\n"
                "Respond with ONLY the JSON object, no markdown fences, no prose.",
            }],
        )

        raw = resp.content[0].text.strip()
        # Strip any accidental code fences
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        try:
            post = json.loads(raw)
        except json.JSONDecodeError as e:
            print(f"Attempt {attempt + 1}: invalid JSON from model: {e}", file=sys.stderr)
            continue

        # Validate required fields
        required = {"slug", "title", "excerpt", "category", "content"}
        if not required.issubset(post):
            print(f"Attempt {attempt + 1}: missing fields {required - set(post)}", file=sys.stderr)
            continue

        # Validate no forbidden lender names
        combined_text = f"{post['title']} {post['excerpt']} {post['content']}"
        flagged = [name for name in FORBIDDEN_LENDER_NAMES if name.lower() in combined_text.lower()]
        if flagged:
            print(f"Attempt {attempt + 1}: contains forbidden lender names {flagged} — retrying", file=sys.stderr)
            continue

        # Validate slug uniqueness
        if post["slug"] in used_slugs:
            post["slug"] = f"{post['slug']}-{dt.date.today().isoformat()}"

        return post

    raise RuntimeError("Failed to generate a valid post after 3 attempts")


def append_post_to_file(post: dict) -> None:
    """Insert the new post before the closing `];` of the INSIGHTS array."""
    text = INSIGHTS_FILE.read_text(encoding="utf-8")

    # Category-appropriate image (generic architecture/finance stock)
    category_images = {
        "Market Update": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop",
        "Regulation": "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&h=500&fit=crop",
        "Fix & Flip": "https://images.unsplash.com/photo-1503594384566-461fe158e797?w=800&h=500&fit=crop",
        "DSCR": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop",
        "Multifamily": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=500&fit=crop",
        "Commercial": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=500&fit=crop",
    }
    image = category_images.get(post["category"], category_images["Market Update"])
    date_str = dt.date.today().strftime("%B %Y")

    # Escape backticks and $ in content for template literal safety
    content = post["content"].replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    excerpt = post["excerpt"].replace("'", "\\'")
    title = post["title"].replace("'", "\\'")

    new_entry = f"""  {{
    slug: '{post["slug"]}',
    title: '{title}',
    excerpt: '{excerpt}',
    category: '{post["category"]}',
    date: '{date_str}',
    image: '{image}',
    content: `{content}`,
  }},
];"""

    # Replace the final `];` (end of array)
    updated = re.sub(r"\n\s*\];", f"\n{new_entry}", text, count=1)
    if updated == text:
        raise RuntimeError("Could not locate end-of-array marker `];` in insights-data.ts")
    INSIGHTS_FILE.write_text(updated, encoding="utf-8")
    print(f"Appended post: {post['title']}")


def main() -> int:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY not set", file=sys.stderr)
        return 1

    print("Fetching industry signal...")
    bullets = search_news()
    print(f"  {len(bullets)} headlines gathered")

    print("Generating post...")
    post = generate_post(bullets)

    print("Appending to insights-data.ts...")
    append_post_to_file(post)
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
