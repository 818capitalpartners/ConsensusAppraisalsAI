"""
Lender Weekly Sync Draft Generator — spec §4.1.

Runs every Friday at 8am ET. Pulls every active deal from Monday, groups
by lane (DSCR / Fix & Flip / Commercial / Multifamily / Bridge), then
generates one draft email per pipeline-sync lender from Ravi's voice.

Drafts are posted as a single consolidated markdown file in
docs/lender-sync-drafts/YYYY-MM-DD.md for Ravi to copy into Missive/Gmail.

Lender routing logic — which deals go to which lender weekly sync:
  - Fix & Flip → NQM + AHL + ABL
  - DSCR → NQM + AHL
  - Commercial / Multifamily → Crebrid
  - Bridge → ABL + Crebrid

Internal lender labels (these go in the subject line of the DRAFT, not in
the body. The draft is TO the lender, so their name is OK in the salutation.
The blocklist applies to BORROWER-facing content only.)
"""
from __future__ import annotations

import datetime as dt
import sys
from pathlib import Path

from common import (
    COLS,
    GROUPS,
    LOAN_PIPELINE_BOARD_ID,
    MondayClient,
)
from templates import lender_weekly_sync_draft

ROOT = Path(__file__).resolve().parent.parent.parent
DRAFTS_DIR = ROOT / "docs" / "lender-sync-drafts"

# v1 target lenders — per spec Week 1 Day 4
# Each: (internal_label, ae_first_name, ae_email, lanes_covered)
LENDERS = [
    ("NQM", "Tammy", "tammy@nqmfunding.com", ["dscr", "flip"]),
    ("AHL", "Daniel", "daniel.norris@ahlend.com", ["dscr", "flip"]),
    ("ABL", "Eden", "eden@abl1.net", ["flip", "bridge"]),
    ("Crebrid", "Joel", "jdyke@crebrid.com", ["commercial", "multifamily", "bridge"]),
]

# Map Monday loan_type status labels → lane buckets used above
LOAN_TYPE_TO_LANE = {
    "DSCR": "dscr",
    "Fix-and-Flip": "flip",
    "Bridge": "bridge",
    "Commercial": "commercial",
    "Multifamily": "multifamily",
}

# Pipeline stages we include in the weekly sync (not dead, not funded)
ACTIVE_STAGES = ["application", "processing", "underwriting", "conditional_approval", "clear_to_close"]


def collect_active_deals(monday: MondayClient) -> list[dict]:
    all_deals = []
    for stage_key in ACTIVE_STAGES:
        try:
            items = monday.get_items_by_group(LOAN_PIPELINE_BOARD_ID, GROUPS[stage_key], limit=100)
        except Exception as e:
            print(f"  Error fetching {stage_key}: {e}", file=sys.stderr)
            continue

        for item in items:
            cols = {cv["id"]: cv.get("text") for cv in item.get("column_values", [])}
            loan_amount = cols.get(COLS["loan_amount"])
            if not loan_amount:
                continue  # skip deals without a loan size
            all_deals.append({
                "id": item["id"],
                "name": item["name"],
                "property": cols.get(COLS["property_address"]) or item["name"],
                "loan_type": cols.get(COLS["loan_type"]),
                "loan_amount": loan_amount,
                "ltv": cols.get(COLS["ltv"]),
                "stage": stage_key.replace("_", " ").title(),
                "target_close": cols.get(COLS["next_followup"]),
            })
    return all_deals


def format_pipeline_row(deal: dict) -> str:
    amt = deal["loan_amount"]
    try:
        amt_fmt = f"${int(float(amt)):,}"
    except (ValueError, TypeError):
        amt_fmt = f"${amt}"
    ltv = f"{deal['ltv']}% LTV" if deal.get("ltv") else "LTV TBD"
    close = deal.get("target_close") or "TBD"
    return f"• {deal['property']} | {deal['loan_type'] or 'TBD'} | {amt_fmt} | {ltv} | close {close} | {deal['stage']}"


def main() -> int:
    monday = MondayClient()
    deals = collect_active_deals(monday)
    print(f"Found {len(deals)} active deals across {len(ACTIVE_STAGES)} stages")

    if not deals:
        print("No active deals — no drafts to generate")
        return 0

    today = dt.date.today()
    date_str = today.strftime("%B %-d, %Y") if sys.platform != "win32" else today.strftime("%B %d, %Y")
    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    out_file = DRAFTS_DIR / f"{today.isoformat()}.md"

    sections = [
        f"# Lender Weekly Sync Drafts — {date_str}",
        f"\n*Auto-generated. Review each draft, then send manually from Missive or Gmail. No auto-send.*\n",
    ]

    for label, ae_first, ae_email, lanes in LENDERS:
        relevant = [d for d in deals if LOAN_TYPE_TO_LANE.get(d.get("loan_type") or "") in lanes]
        if not relevant:
            sections.append(f"\n## {label} — {ae_first} ({ae_email})\n\n*No deals match this lender's lanes this week. Draft skipped.*\n")
            continue

        rows = [format_pipeline_row(d) for d in relevant]
        subject, body_html = lender_weekly_sync_draft(ae_first, label, date_str, rows)

        sections.append(
            f"\n## {label} — {ae_first} ({ae_email})\n\n"
            f"**Subject:** {subject}\n\n"
            f"{body_html}\n\n"
            f"*{len(relevant)} deal(s) on this list.*\n"
        )

    out_file.write_text("\n".join(sections), encoding="utf-8")
    print(f"Drafts written to: {out_file}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
