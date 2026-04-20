"""
Daily Dashboard — spec §6. Runs at 7am ET every weekday.

Nightly health calc → 7am email digest to ravi@818capitalpartners.com:
  🔴 Red deals first (ordered by days-to-close ascending), 3 actions each
  🟡 Yellow deals (ordered by stage time overdue), 1 action each
  🟢 Green deals — summary count only

Target read time: 90 seconds.

PHASE 1: Outputs to docs/daily-dashboard/YYYY-MM-DD.md (committed to repo).
Ravi opens the latest markdown file every morning. Eventually swap for
Gmail send via OAuth.
"""
from __future__ import annotations

import datetime as dt
import os
import smtplib
import sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

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

ROOT = Path(__file__).resolve().parent.parent.parent
DASHBOARD_DIR = ROOT / "docs" / "daily-dashboard"

# Stages to include in the dashboard (active pipeline)
ACTIVE_STAGES = ["application", "processing", "underwriting", "conditional_approval", "clear_to_close"]

# Target durations per spec §2 (in days) — used for stage overdue detection
TARGET_STAGE_DAYS = {
    "application": 5,
    "processing": 5,
    "underwriting": 21,
    "conditional_approval": 10,
    "clear_to_close": 7,
}


def compute_health(deal: dict, stage_key: str) -> tuple[str, list[str]]:
    """Return (Red/Yellow/Green, [list of reasons]) per spec §6.1.
    Worst-of-4 logic:
      - Stage duration vs target
      - Days to close target
      - Days since last borrower touch
      - Missing docs in status=stale
    """
    reasons = []
    health = "Green"

    def bump(to: str, reason: str):
        nonlocal health
        reasons.append(reason)
        if to == "Red" or (to == "Yellow" and health == "Green"):
            health = to

    # 1. Stage duration
    stage_days = deal.get("days_in_stage")
    target = TARGET_STAGE_DAYS.get(stage_key, 7)
    if stage_days is not None:
        if stage_days > target * 2.5:
            bump("Red", f"{stage_days}d in {stage_key} (target {target}d)")
        elif stage_days > target:
            bump("Yellow", f"{stage_days}d in {stage_key} (target {target}d)")

    # 2. Days to target close
    days_to_close = deal.get("days_to_close")
    if days_to_close is not None:
        if days_to_close < 7:
            bump("Red", f"closing in {days_to_close}d")
        elif days_to_close < 14:
            bump("Yellow", f"closing in {days_to_close}d")

    # 3. Days since last borrower touch
    days_since_borrower = deal.get("days_since_last_touch")
    if days_since_borrower is not None:
        if days_since_borrower > 7:
            bump("Red", f"no borrower contact in {days_since_borrower}d")
        elif days_since_borrower > 3:
            bump("Yellow", f"{days_since_borrower}d since borrower touch")

    # 4. Missing docs (v1 heuristic — count comma-separated items in free text)
    pending = deal.get("docs_pending")
    if pending:
        count = len([x for x in pending.replace("\n", ",").split(",") if len(x.strip()) > 2])
        if count >= 3:
            bump("Red", f"{count} docs pending")
        elif count >= 1:
            bump("Yellow", f"{count} docs pending")

    return health, reasons


ACTIONS_SYSTEM_PROMPT = ANGELA_VOICE + """

You are producing a 3-bullet action list for a deal that's flagged Red in
Ravi's morning dashboard. Each bullet is ONE concrete action Ravi (or Angela)
can take today to move the deal. Direct, specific. No preamble, no filler.

Format: three markdown bullets, one short sentence each. Examples of good
bullets:
  - Text borrower to confirm updated closing date and resend wire instructions
  - Call the processor on the lender side to push the insurance condition
  - Run the revised scenario through our pricing matrix and send updated quote

HARD RULES:
- Never name any specific lender
- Be actionable and today-specific
- Don't suggest generic activities ('review the file', 'check status')"""


def draft_actions(claude, deal: dict, reasons: list[str]) -> str:
    """Use Claude to generate 3 specific actions for a Red deal."""
    user_msg = f"""Deal flagged Red this morning.

Borrower: {deal.get('borrower_name') or 'Unknown'}
Property: {deal.get('property_address') or 'TBD'}
Loan type: {deal.get('loan_type') or 'Unknown'}
Amount: ${deal.get('loan_amount') or 'TBD'}
Stage: {deal.get('stage')}
Days in stage: {deal.get('days_in_stage')}
Days to close: {deal.get('days_to_close')}
Days since last borrower touch: {deal.get('days_since_last_touch')}
Docs pending: {deal.get('docs_pending') or 'none'}
Notes: {(deal.get('notes') or '')[:800]}

Red flags: {'; '.join(reasons)}

List 3 specific actions to take today."""

    return draft_with_retry(claude, ACTIONS_SYSTEM_PROMPT, user_msg, max_tokens=400, tier="internal")


def yellow_action(claude, deal: dict, reasons: list[str]) -> str:
    """One-line action for Yellow deal."""
    user_msg = f"""Deal flagged Yellow this morning.

Property: {deal.get('property_address')}
Stage: {deal.get('stage')}
Why flagged: {'; '.join(reasons)}

Give ONE short action (single bullet, 8-15 words). Actionable, specific, today."""
    return draft_with_retry(
        claude,
        ANGELA_VOICE + "\n\nYou produce one-line actions. No preamble, no filler.",
        user_msg,
        max_tokens=100,
        tier="internal",
    ).strip().lstrip("-").lstrip("•").strip()


def markdown_to_html(md: str) -> str:
    """Lightweight markdown-to-HTML conversion — just enough for email rendering.
    No heavy deps. Handles headings, bold, bullet lists, paragraphs."""
    import re
    lines = md.split("\n")
    html_parts = []
    in_list = False
    for line in lines:
        line = line.rstrip()
        # Headings
        if line.startswith("### "):
            if in_list:
                html_parts.append("</ul>"); in_list = False
            html_parts.append(f"<h3 style='color:#0a2540;margin-top:24px;margin-bottom:4px;'>{line[4:]}</h3>")
        elif line.startswith("## "):
            if in_list:
                html_parts.append("</ul>"); in_list = False
            html_parts.append(f"<h2 style='color:#0a2540;margin-top:32px;margin-bottom:8px;border-bottom:2px solid #e5e5e5;padding-bottom:4px;'>{line[3:]}</h2>")
        elif line.startswith("# "):
            if in_list:
                html_parts.append("</ul>"); in_list = False
            html_parts.append(f"<h1 style='color:#0a2540;margin-top:16px;'>{line[2:]}</h1>")
        # Horizontal rule
        elif line.strip() == "---":
            if in_list:
                html_parts.append("</ul>"); in_list = False
            html_parts.append("<hr style='border:none;border-top:1px solid #e5e5e5;margin:24px 0;'>")
        # Bullet items
        elif line.lstrip().startswith("- "):
            if not in_list:
                html_parts.append("<ul style='margin:8px 0;padding-left:24px;'>"); in_list = True
            content = line.lstrip()[2:]
            # Bold
            content = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", content)
            # Italic
            content = re.sub(r"\*(.+?)\*", r"<em>\1</em>", content)
            html_parts.append(f"<li style='margin-bottom:4px;'>{content}</li>")
        # Empty line — close list if any
        elif not line.strip():
            if in_list:
                html_parts.append("</ul>"); in_list = False
            html_parts.append("")
        else:
            if in_list:
                html_parts.append("</ul>"); in_list = False
            # Bold
            line = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", line)
            # Italic
            line = re.sub(r"\*(.+?)\*", r"<em>\1</em>", line)
            html_parts.append(f"<p style='margin:8px 0;'>{line}</p>")
    if in_list:
        html_parts.append("</ul>")
    body = "\n".join(html_parts)
    return (
        "<!DOCTYPE html><html><body style='font-family:-apple-system,Segoe UI,Roboto,"
        "Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#1a1a1a;"
        "max-width:760px;margin:0 auto;padding:20px;'>" + body + "</body></html>"
    )


def send_dashboard_email(dashboard_md: str, date_str: str, red_count: int, yellow_count: int, green_count: int) -> bool:
    """Send the dashboard via Gmail SMTP. Returns True on success, False if skipped or failed."""
    sender = os.environ.get("GMAIL_SENDER")
    password = os.environ.get("GMAIL_APP_PASSWORD")
    recipient = os.environ.get("DASHBOARD_RECIPIENT", sender)

    if not sender or not password:
        print("  GMAIL_SENDER or GMAIL_APP_PASSWORD not set — skipping email send")
        return False
    if not recipient:
        print("  No recipient — skipping email send")
        return False

    subject = f"818 Dashboard · {date_str} · 🔴 {red_count} · 🟡 {yellow_count} · 🟢 {green_count}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"818 Capital Dashboard <{sender}>"
    msg["To"] = recipient
    msg["Reply-To"] = "ravi@818capitalpartners.com"

    msg.attach(MIMEText(dashboard_md, "plain", "utf-8"))
    msg.attach(MIMEText(markdown_to_html(dashboard_md), "html", "utf-8"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=30) as server:
            server.login(sender, password)
            server.send_message(msg)
        print(f"  Email sent to {recipient}")
        return True
    except Exception as e:
        print(f"  Email send failed: {e}", file=sys.stderr)
        return False


def main() -> int:
    monday = MondayClient()
    claude = get_claude()
    today = dt.date.today()
    today_str = today.strftime("%A, %B %d, %Y")

    red = []
    yellow = []
    green_count = 0

    for stage_key in ACTIVE_STAGES:
        try:
            items = monday.get_items_by_group(LOAN_PIPELINE_BOARD_ID, GROUPS[stage_key], limit=100)
        except Exception as e:
            print(f"  Error fetching {stage_key}: {e}", file=sys.stderr)
            continue

        for item in items:
            cols = {cv["id"]: cv.get("text") for cv in item.get("column_values", [])}
            last_contact = cols.get(COLS["last_contact"])
            first_contact = cols.get(COLS["first_contact"])
            target_close = cols.get(COLS["next_followup"])

            deal = {
                "id": item["id"],
                "name": item["name"],
                "borrower_name": cols.get(COLS["borrower_name"]),
                "property_address": cols.get(COLS["property_address"]),
                "loan_type": cols.get(COLS["loan_type"]),
                "loan_amount": cols.get(COLS["loan_amount"]),
                "stage": stage_key.replace("_", " ").title(),
                "days_in_stage": days_since(first_contact),
                "days_to_close": days_since(target_close) and -days_since(target_close),
                "days_since_last_touch": days_since(last_contact),
                "docs_pending": cols.get(COLS["documents_pending"]),
                "notes": cols.get(COLS["notes"]),
            }
            if deal["days_to_close"] is not None:
                deal["days_to_close"] = -deal["days_to_close"]  # flip sign

            health, reasons = compute_health(deal, stage_key)
            if health == "Red":
                red.append((deal, reasons))
            elif health == "Yellow":
                yellow.append((deal, reasons))
            else:
                green_count += 1

    # Sort
    red.sort(key=lambda x: x[0].get("days_to_close") or 999)
    yellow.sort(key=lambda x: -(x[0].get("days_in_stage") or 0))

    # Build dashboard
    lines = [f"# 818 Capital — Daily Dashboard · {today_str}", ""]

    if red:
        lines.append(f"## 🔴 Red — {len(red)} deal(s) need attention today\n")
        for deal, reasons in red:
            lines.append(f"### {deal['property_address'] or deal['name']}")
            lines.append(f"*{deal.get('borrower_name') or 'Unknown borrower'} · "
                         f"{deal.get('loan_type') or 'TBD'} · "
                         f"${deal.get('loan_amount') or 'TBD'} · {deal['stage']}*")
            lines.append(f"**Flagged:** {'; '.join(reasons)}\n")
            try:
                actions = draft_actions(claude, deal, reasons)
                lines.append(actions)
            except Exception as e:
                lines.append(f"_(action generation failed: {e})_")
            lines.append("")

    if yellow:
        lines.append(f"\n## 🟡 Yellow — {len(yellow)} deal(s) overdue\n")
        for deal, reasons in yellow:
            try:
                action = yellow_action(claude, deal, reasons)
            except Exception:
                action = "Review next action and re-commit to a date."
            lines.append(
                f"- **{deal['property_address'] or deal['name']}** "
                f"({deal['stage']}, {'; '.join(reasons)}) — {action}"
            )

    lines.append(f"\n## 🟢 Green — {green_count} deal(s) on track")
    lines.append("\n---\n")
    lines.append(f"*Generated {dt.datetime.now().strftime('%Y-%m-%d %H:%M')} · 818 Capital Dashboard Bot*")

    DASHBOARD_DIR.mkdir(parents=True, exist_ok=True)
    out = DASHBOARD_DIR / f"{today.isoformat()}.md"
    dashboard_md = "\n".join(lines)
    out.write_text(dashboard_md, encoding="utf-8")

    # Also write latest.md pointer
    (DASHBOARD_DIR / "latest.md").write_text(dashboard_md, encoding="utf-8")

    print(f"Dashboard written: {out}")
    print(f"  🔴 {len(red)} Red | 🟡 {len(yellow)} Yellow | 🟢 {green_count} Green")

    # Email the dashboard to Ravi
    send_dashboard_email(dashboard_md, today_str, len(red), len(yellow), green_count)

    return 0


if __name__ == "__main__":
    sys.exit(main())
