"""
Borrower Doc Chase Agent — spec §3.3 (the highest-leverage Week 1 automation).

Runs every 6 hours via GitHub Actions. For each deal with missing_docs
tagged as status=requested older than 24 hours, drafts the Angela §8
template pinging the borrower. Escalates:
  - 24 hours stale → gentle nudge (Green, auto-send candidate)
  - 72 hours stale → firmer ping (Green, auto-send candidate)
  - 7 days stale → escalation to Ravi (Yellow, draft only)

PHASE 1 BEHAVIOR (until Gmail OAuth configured):
  All drafts are posted as Monday updates on the deal item. Ravi reviews
  the update, copies the HTML body, sends from Gmail manually.

PHASE 2 (future):
  Swap monday.create_update() calls for Gmail draft creation via OAuth.
  Respect rate limits (§9.3) and safe_to_send checks before hitting send.
"""
from __future__ import annotations

import re
import sys

from common import (
    ANGELA_EMAIL,
    COLS,
    LOAN_PIPELINE_BOARD_ID,
    MondayClient,
    days_since,
    has_blocked_domain,
    safe_to_send,
    today_iso,
)
from templates import doc_chase_24h, doc_chase_72h, day_7_escalation_draft

# Stale thresholds — when a deal becomes eligible for each escalation
THRESHOLDS = [
    (7, "day7"),       # 7+ days → Ravi escalation draft
    (3, "h72"),        # 3-7 days → Angela 72h firmer
    (1, "h24"),        # 1-3 days → Angela 24h gentle
]


def parse_missing_docs(raw: str | None) -> list[str]:
    """Extract the list of missing items from the free-text Documents Pending
    field. V1 is heuristic — v2 should move this to a structured tag column
    per spec §1.3. For now we split on commas / newlines / bullets."""
    if not raw:
        return []
    lines = re.split(r"[\n,•·*]+", raw)
    items = [l.strip(" -\t") for l in lines if l.strip()]
    # Filter noise
    return [i for i in items if 2 < len(i) < 120][:10]


def pick_template(days_stale: int, first_name: str, address: str, items: list[str], drive_url: str):
    """Return (tier, subject, body, template_name) for the given stale age."""
    if days_stale >= 7:
        subject, body = day_7_escalation_draft(first_name, address, items)
        return "YELLOW — Ravi escalation (draft only)", subject, body, "day_7_escalation_draft"
    if days_stale >= 3:
        subject, body = doc_chase_72h(first_name, address, items, drive_url)
        return "GREEN — 72h firmer ping", subject, body, "doc_chase_72h"
    # 24-72h
    subject, body = doc_chase_24h(first_name, address, items, drive_url)
    return "GREEN — 24h gentle nudge", subject, body, "doc_chase_24h"


def first_name_of(full_name: str | None) -> str:
    if not full_name:
        return "there"
    return full_name.strip().split()[0] if full_name.strip() else "there"


def main() -> int:
    monday = MondayClient()

    # Scan Processing / Underwriting / Conditional Approval groups — these are
    # the stages where doc chase happens most. Spec §3.3 says trigger whenever
    # any missing_docs item is status=requested >24h old, regardless of stage.
    from common import GROUPS
    stages_to_scan = ["application", "processing", "underwriting", "conditional_approval", "clear_to_close"]

    total_drafts = 0
    for stage_key in stages_to_scan:
        try:
            items = monday.get_items_by_group(LOAN_PIPELINE_BOARD_ID, GROUPS[stage_key], limit=50)
        except Exception as e:
            print(f"  Error fetching {stage_key}: {e}", file=sys.stderr)
            continue

        for item in items:
            cols = {cv["id"]: cv.get("text") for cv in item.get("column_values", [])}

            # Safety checks — skip blocked domains and halt on legal keywords
            borrower_email = cols.get(COLS["borrower_email"])
            if has_blocked_domain(borrower_email):
                continue

            notes_text = (cols.get(COLS["notes"]) or "") + " " + (cols.get(COLS["call_log"]) or "")
            # Legal keyword check handled by safe_to_send on the draft itself

            missing_raw = cols.get(COLS["documents_pending"])
            missing_items = parse_missing_docs(missing_raw)
            if not missing_items:
                continue

            last_contact = cols.get(COLS["last_contact"])
            days = days_since(last_contact)
            if days is None or days < 1:
                continue

            # Pick the right template based on staleness
            tier, subject, body_html, template_name = pick_template(
                days,
                first_name_of(cols.get(COLS["borrower_name"])),
                cols.get(COLS["property_address"]) or "your property",
                missing_items,
                cols.get("link_mm15g502") or "[Drive folder link TBD]",
            )

            # Safety gate
            is_safe, reason = safe_to_send(body_html, borrower_email)
            if not is_safe:
                tier = f"RED — BLOCKED: {reason}"

            # Post as Monday update (Phase 1 — no auto-send)
            update_body = (
                f"🤖 **Doc Chase — {today_iso()}**\n\n"
                f"**Tier:** {tier}\n"
                f"**Template:** `{template_name}`\n"
                f"**Recipient:** {borrower_email or '(no email on file)'}\n"
                f"**Days stale:** {days}\n"
                f"**Missing items detected:** {', '.join(missing_items)}\n\n"
                f"---\n\n"
                f"**Subject:** {subject}\n\n"
                f"{body_html}\n\n"
                f"---\n\n"
                f"*Phase 1: review + send from {ANGELA_EMAIL} (Angela) or ravi@ (Day-7 escalation). "
                f"Phase 2 will auto-send Green-tier after rate-limit check.*"
            )
            try:
                monday.create_update(item["id"], update_body)
                total_drafts += 1
                print(f"  Drafted [{tier}] for {item['name']} ({days}d stale)")
            except Exception as e:
                print(f"  Error posting to {item['id']}: {e}", file=sys.stderr)

    print(f"\nDone. {total_drafts} doc-chase drafts posted.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
