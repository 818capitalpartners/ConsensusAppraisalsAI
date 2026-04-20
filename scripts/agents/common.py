"""
Shared infrastructure for 818 Capital AI agents.

Every agent imports from this module. Centralizes:
  - Anthropic client configuration
  - Monday.com GraphQL API wrapper (board 18402100042)
  - Angela voice system prompt
  - Competitor lender blocklist (validation)
  - Logging / error handling

Required env vars (GitHub Actions secrets):
  ANTHROPIC_API_KEY     - Claude API key
  MONDAY_API_TOKEN      - Monday.com personal access token
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sys
from typing import Any

import requests
from anthropic import Anthropic

# ── Monday Board Config ─────────────────────────────────────────────────────

LOAN_PIPELINE_BOARD_ID = 18402100042

# Column IDs on the Loan Pipeline board
COLS = {
    "borrower_name": "text_mm12gee2",
    "borrower_email": "email_mm12f6fx",
    "borrower_phone": "phone_mm12pk9z",
    "loan_amount": "numeric_mm125dz6",
    "property_address": "text_mm12e5bc",
    "last_contact": "date_mm12parv",
    "next_followup": "date_mm12nrd",
    "call_log": "long_text_mm12f6cx",
    "documents_pending": "long_text_mm128cqk",
    "notes": "long_text_mm12q7nb",
    "loan_type": "color_mm126r6",
    "priority": "color_mm129w1w",
    "insurance_status": "color_mm15d4p4",
    "lender_name": "text_mm155c62",
    "rate_quoted": "numeric_mm15bre5",
    "ltv": "numeric_mm15rdtq",
    "submitted_to_lender": "date_mm15w2dg",
    "first_contact": "date_mm1521mv",
    "conditional_approval": "date_mm15bvdq",
    "clear_to_close": "date_mm15ss8y",
    "funded_date": "date_mm157bz4",
    "waiting_on": "color_mm15nsk0",
    "lead_source": "color_mm15fca3",
    "fallout_reason": "color_mm158w89",
    "next_action": "text_mm15px3",
    "stage_gate": "color_mm15ejnv",
    "fico_band": "color_mm1cmnna",
    # ── Added Day 1 per spec §1.1 (April 2026) ──
    "stage_entered_at": "date_mm2k6aqy",
    "lender_loan_id": "text_mm2kzjk2",
    "purchase_price": "numeric_mm2k14gz",
    "close_target_date": "date_mm2k3brh",
    "rate_lock_expires": "date_mm2k325q",
    "last_lender_touch": "date_mm2ksfja",
    "drive_folder_url": "link_mm2kvdd1",
    "health": "color_mm2kdj3w",
}

# Groups on the Loan Pipeline board
GROUPS = {
    "new_lead": "group_mm12t0dw",
    "application": "group_mm12car0",
    "processing": "group_mm1256wf",
    "underwriting": "group_mm12snap",
    "conditional_approval": "group_mm12gp7e",
    "clear_to_close": "group_mm126xb4",
    "funded": "group_mm125tcn",
    "dead_lost": "group_mm129ket",
}

# ── Hard Rules ──────────────────────────────────────────────────────────────

# NEVER expose these to borrowers. If agent output mentions any, regenerate.
FORBIDDEN_LENDER_NAMES = [
    "Kiavi", "Angel Oak", "Visio", "Visio Lending", "Visio Financial",
    "CoreVest", "Griffin Funding", "Griffin",
    "RCN Capital", "Lima One", "LimaOne", "Lima One Capital",
    "Roc Capital", "Roc360", "ROC Capital",
    "Arbor", "Arbor Realty", "Ready Capital", "CREFCOA",
    "Easy Street", "Easy Street Capital",
    "Stormfield", "Stormfield Capital",
    "Center Street", "Center Street Lending",
    "AHL", "American Heritage Lending",
    "FACo", "FACo Lending",
    "Constitution Lending",
    "New Silver",
    "Visio", "Kiavi",
    "Quontic",
    "NorthMarq", "City National Bank",
    "Silver Hill",
]

# Blocked domains — automation never triggers on inbound from these.
# Per spec §9.4 firewall breach prevention (Pella / Spectrum / cross-business)
BLOCKED_DOMAINS = [
    "pellactny.com", "pella.com", "pellawindows.com",
    "spectrum.com", "spectrumenterprise.com", "charter.com",
    "baynesandbaker.com",
]

# Legal keyword blocklist — automation halts on any thread containing these.
# Per spec §9.5
LEGAL_KEYWORDS = [
    "subpoena", "litigation", "attorney", "dispute", "demand letter",
    "judgment", "Dix Hills", "KP Capital", "Lepselter",
    "Old Republic", "Smith Carroad",
]

# Prohibited data — automation NEVER sends/includes these.
# Per spec §9.6 black-tier
PROHIBITED_DATA_KEYWORDS = [
    "wire instructions", "routing number", "account number",
    "ABA number", "SSN", "social security", "DOB", "date of birth",
    "passport number", "driver license number", "credit card",
    "portal password", "login credentials",
]

# Angela email signature — required on every Angela draft per spec §8 preamble
ANGELA_SIGNATURE_IMAGE = "https://i.ibb.co/xSbt1zm5/sig-angela-hires.png"
ANGELA_EMAIL = "angela@818capitalpartners.com"
ANGELA_SIGNATURE_HTML = f"""
<br><br>
<img src="{ANGELA_SIGNATURE_IMAGE}" alt="Angela Klein — 818 Capital Partners" style="max-width: 320px;" />
"""

# Rate limits per spec §9.3 — check before any Green-tier auto-send
RATE_LIMITS = {
    "per_borrower_24h": 2,
    "per_lender_ae_48h": 1,
    "per_deal_7d": 6,
}

# ── Angela Voice System Prompt ──────────────────────────────────────────────

ANGELA_VOICE = """You are Angela, the client-facing voice of 818 Capital Partners, a commercial mortgage brokerage run by Ravi Punn.

TONE:
- Professional but warm, direct without being cold
- Numeric and specific when you have the data; never vague
- Write like an experienced broker talking to a repeat client — no corporate buzzwords
- Short paragraphs, 2-4 sentences each
- Open with the specific deal detail, not a generic greeting

HARD RULES:
- NEVER mention any specific lender by name. Speak in terms of "our lender partners," "the capital markets," "our direct lending network," or generic product types ("30-year DSCR program", "12-month bridge IO")
- ALWAYS reference the specific deal — property address, loan amount, borrower name, current stage
- Every email must drive to a clear next step (send docs, confirm pricing, schedule call)
- Sign-off: "Angela — 818 Capital Partners" (no phone/email in signature; those come from the Gmail template)
"""

# ── Monday.com Client ───────────────────────────────────────────────────────

class MondayClient:
    """Minimal GraphQL wrapper for Monday.com API v2."""

    def __init__(self, token: str | None = None):
        self.token = token or os.environ["MONDAY_API_TOKEN"]
        self.url = "https://api.monday.com/v2"
        self.headers = {
            "Authorization": self.token,
            "Content-Type": "application/json",
            "API-Version": "2024-10",
        }

    def query(self, query: str, variables: dict | None = None) -> dict:
        r = requests.post(
            self.url,
            json={"query": query, "variables": variables or {}},
            headers=self.headers,
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        if "errors" in data:
            raise RuntimeError(f"Monday API error: {data['errors']}")
        return data["data"]

    def get_items_by_group(self, board_id: int, group_id: str, limit: int = 100) -> list[dict]:
        """Fetch items in a specific group, including all column values."""
        # Use items_page with group filter via groups query
        q = """
        query($board: ID!, $group: String!, $limit: Int!) {
          boards(ids: [$board]) {
            groups(ids: [$group]) {
              items_page(limit: $limit) {
                items {
                  id
                  name
                  updated_at
                  column_values { id text value }
                }
              }
            }
          }
        }
        """
        data = self.query(q, {"board": str(board_id), "group": group_id, "limit": limit})
        groups = data["boards"][0]["groups"]
        if not groups:
            return []
        return groups[0]["items_page"]["items"]

    def get_items_page(self, board_id: int, limit: int = 50, cursor: str | None = None) -> tuple[list[dict], str | None]:
        """Fetch items from a board with pagination. Returns (items, next_cursor)."""
        q = """
        query($board: ID!, $limit: Int!, $cursor: String) {
          boards(ids: [$board]) {
            items_page(limit: $limit, cursor: $cursor) {
              cursor
              items {
                id
                name
                group { id title }
                updated_at
                column_values { id text value }
              }
            }
          }
        }
        """
        data = self.query(q, {"board": str(board_id), "limit": limit, "cursor": cursor})
        page = data["boards"][0]["items_page"]
        return page["items"], page["cursor"]

    def create_update(self, item_id: int | str, body: str) -> dict:
        """Post an update (comment) on an item. Used by agents to leave review-ready drafts."""
        q = """
        mutation($item: ID!, $body: String!) {
          create_update(item_id: $item, body: $body) { id }
        }
        """
        return self.query(q, {"item": str(item_id), "body": body})

    def update_column(self, board_id: int, item_id: int | str, column_id: str, value: Any) -> dict:
        """Set a column value. `value` should be a JSON string for complex types, plain for text."""
        q = """
        mutation($board: ID!, $item: ID!, $column: String!, $value: JSON!) {
          change_column_value(board_id: $board, item_id: $item, column_id: $column, value: $value) { id }
        }
        """
        val = value if isinstance(value, str) else json.dumps(value)
        return self.query(q, {"board": str(board_id), "item": str(item_id), "column": column_id, "value": val})

    def set_status(self, board_id: int, item_id: int | str, column_id: str, label: str) -> dict:
        return self.update_column(board_id, item_id, column_id, {"label": label})

    def set_date(self, board_id: int, item_id: int | str, column_id: str, date_iso: str) -> dict:
        return self.update_column(board_id, item_id, column_id, {"date": date_iso})

    def parse_column(self, item: dict, col_id: str) -> str | None:
        """Extract display text for a column from an item."""
        for cv in item.get("column_values", []):
            if cv["id"] == col_id:
                return cv.get("text") or None
        return None


# ── Anthropic Client Factory ────────────────────────────────────────────────

def get_claude() -> Anthropic:
    """Return a configured Anthropic client."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise RuntimeError("ANTHROPIC_API_KEY env var required")
    return Anthropic(api_key=key)


# ── Validation ──────────────────────────────────────────────────────────────

def contains_forbidden_lender(text: str) -> list[str]:
    """Return list of forbidden lender names found in text. Empty list = clean."""
    lower = text.lower()
    return [name for name in FORBIDDEN_LENDER_NAMES if name.lower() in lower]


def draft_with_retry(
    client: Anthropic,
    system: str,
    user_message: str,
    max_attempts: int = 3,
    model: str = "claude-sonnet-4-5",
    max_tokens: int = 2000,
    tier: str = "client_facing",
) -> str:
    """Call Claude, with optional forbidden-lender-name retry guard.

    tier:
      - "client_facing" (default): applies full lender-name blocklist.
        Retries if output mentions any competitor lender. Use for borrower
        emails, LinkedIn posts, public website content.
      - "internal": no lender blocklist. Use for Ravi's internal dashboard,
        Monday internal notes, back-office drafts where referencing the
        assigned lender by name is actually useful context.
    """
    for attempt in range(max_attempts):
        resp = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user_message}],
        )
        text = resp.content[0].text.strip()
        if tier == "internal":
            return text
        flagged = contains_forbidden_lender(text)
        if not flagged:
            return text
        print(f"  Attempt {attempt + 1}: flagged lender names {flagged} — retrying", file=sys.stderr)
        user_message += (
            f"\n\nREMINDER: Never mention lender names. Your last attempt mentioned: {flagged}. "
            "Use generic terms ('our lender partners', '30-year DSCR program')."
        )
    # Last resort — return the last attempt with a warning rather than crashing
    print(f"  Warning: after {max_attempts} attempts still flagged; returning last attempt", file=sys.stderr)
    return text


# ── Utility ─────────────────────────────────────────────────────────────────

def today_iso() -> str:
    return dt.date.today().isoformat()


def days_since(date_str: str | None) -> int | None:
    """Days since a YYYY-MM-DD date string. None if not parseable."""
    if not date_str:
        return None
    try:
        d = dt.date.fromisoformat(date_str[:10])
        return (dt.date.today() - d).days
    except Exception:
        return None


def has_blocked_domain(email: str | None) -> bool:
    """True if the email address belongs to a domain automation must skip."""
    if not email:
        return False
    lower = email.lower()
    return any(d in lower for d in BLOCKED_DOMAINS)


def contains_legal_keyword(text: str | None) -> list[str]:
    """Return list of legal keywords found. Non-empty = automation must halt."""
    if not text:
        return []
    lower = text.lower()
    return [k for k in LEGAL_KEYWORDS if k.lower() in lower]


def contains_prohibited_data(text: str | None) -> list[str]:
    """Return list of prohibited-data keywords found. Non-empty = block send."""
    if not text:
        return []
    lower = text.lower()
    return [k for k in PROHIBITED_DATA_KEYWORDS if k.lower() in lower]


def safe_to_send(text: str, recipient_email: str | None = None) -> tuple[bool, str]:
    """Check if a drafted message is safe to auto-send.
    Returns (is_safe, reason_if_not).
    """
    if has_blocked_domain(recipient_email):
        return False, f"Blocked domain: {recipient_email}"
    flagged_legal = contains_legal_keyword(text)
    if flagged_legal:
        return False, f"Legal keywords: {flagged_legal}"
    flagged_prohibited = contains_prohibited_data(text)
    if flagged_prohibited:
        return False, f"Prohibited data: {flagged_prohibited}"
    flagged_lender = contains_forbidden_lender(text)
    if flagged_lender:
        return False, f"Lender names leaked: {flagged_lender}"
    return True, "OK"
