"""
Dead Lead Revival Agent — runs weekly (Tuesdays).

Scans the Dead/Lost group on Monday Loan Pipeline. For each dead lead
where the fallout reason was something the rate environment or a new
program can now solve (e.g., "Pricing / Rate", "DSCR Too Low",
"LTV Too High"), drafts a revive outreach posted as a Monday update.

Never sends. Ravi reviews.
"""
from __future__ import annotations

import sys

from common import (
    ANGELA_VOICE,
    COLS,
    GROUPS,
    LOAN_PIPELINE_BOARD_ID,
    MondayClient,
    days_since,
    draft_with_retry,
    get_claude,
    today_iso,
)

# Fallout reasons we can potentially solve with current programs
REVIVABLE_REASONS = [
    "Pricing / Rate",
    "DSCR Too Low",
    "LTV Too High",
    "Credit Score",
]

# Don't try to revive leads that died within the last 30 days — let them cool
MIN_DAYS_SINCE_DEATH = 30

SYSTEM_PROMPT = ANGELA_VOICE + """

You are drafting a revive email for a lead that died earlier. The market has
changed — rates have compressed, new programs exist, or a policy shift opened
up what was previously blocked. Your job:

1. Acknowledge they passed before (don't pretend the earlier interaction didn't happen)
2. Reference the SPECIFIC reason their deal died
3. Explain WHAT CHANGED that now makes it viable — be concrete, numeric
4. Invite one low-friction next step (quick call, send updated scenario, re-pull credit)

Keep it short (120-150 words). No hard sell. The value is in showing you
remembered the specific file and have a real reason to reconnect."""


CURRENT_MARKET_CONTEXT = """Current 818 Capital market context (April 2026):
- DSCR par rates: 6.24% domestic / 6.875% foreign national, full range 6.0-8.0%
- Fix & Flip bridge rates: 9.25-10.5% on strong profiles, down 65 bps YoY
- Non-QM is now 15% of total mortgage volume — more capital competing
- FHFA raised Fannie/Freddie multifamily caps 20% for 2026 ($88B each)
- Sub-0.75 DSCR programs now available at select lender partners
- Ratio-free and bank-statement DSCR programs live across multiple shops
- 700-719 FICO tier pricing improved ~50 bps vs 2025
"""


def analyze_dead_lead(claude, deal: dict) -> str:
    borrower = deal.get("borrower_name") or "the borrower"
    address = deal.get("property_address") or "their property"
    loan_amount = deal.get("loan_amount") or "their deal"
    loan_type = deal.get("loan_type") or "unknown"
    fallout_reason = deal.get("fallout_reason") or "unknown"
    notes = deal.get("notes") or ""
    days_dead = deal.get("days_dead", "unknown")

    user_msg = f"""Dead lead from 818 Capital pipeline. Draft a revive email.

Borrower: {borrower}
Property: {address}
Loan request: ${loan_amount}
Loan type: {loan_type}
Died because: {fallout_reason}
Days since deal died: {days_dead}

Historical notes from file:
{notes[:1200]}

{CURRENT_MARKET_CONTEXT}

Draft the revive email. Specifically connect WHAT CHANGED in the market
to WHY their deal died. If no connection can be made, say so — don't
force it. Sign as Angela."""
    return draft_with_retry(claude, SYSTEM_PROMPT, user_msg)


def main() -> int:
    monday = MondayClient()
    claude = get_claude()

    try:
        items = monday.get_items_by_group(LOAN_PIPELINE_BOARD_ID, GROUPS["dead_lost"], limit=100)
    except Exception as e:
        print(f"Error fetching dead leads: {e}", file=sys.stderr)
        return 1

    print(f"Found {len(items)} dead/lost items")
    drafts = 0

    for item in items:
        cols = {cv["id"]: cv.get("text") for cv in item.get("column_values", [])}
        fallout_reason = cols.get(COLS["fallout_reason"])

        if fallout_reason not in REVIVABLE_REASONS:
            continue

        last_contact = cols.get(COLS["last_contact"])
        days_dead = days_since(last_contact)

        if days_dead is None or days_dead < MIN_DAYS_SINCE_DEATH:
            continue

        deal = {
            "borrower_name": cols.get(COLS["borrower_name"]),
            "property_address": cols.get(COLS["property_address"]),
            "loan_amount": cols.get(COLS["loan_amount"]),
            "loan_type": cols.get(COLS["loan_type"]),
            "fallout_reason": fallout_reason,
            "notes": cols.get(COLS["notes"]),
            "days_dead": days_dead,
        }

        try:
            draft = analyze_dead_lead(claude, deal)
        except Exception as e:
            print(f"  Error drafting for {item['id']}: {e}", file=sys.stderr)
            continue

        update_body = (
            f"🤖 **Dead Lead Revival — {today_iso()}**\n\n"
            f"*Fallout reason: {fallout_reason} | {days_dead} days since last contact*\n\n"
            f"*Automated revive draft — review, edit, send from Gmail.*\n\n"
            + draft
        )
        try:
            monday.create_update(item["id"], update_body)
            drafts += 1
            print(f"  Drafted revive for: {item['name']}")
        except Exception as e:
            print(f"  Error posting to {item['id']}: {e}", file=sys.stderr)

    print(f"\nDone. {drafts} revive drafts posted as Monday updates.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
