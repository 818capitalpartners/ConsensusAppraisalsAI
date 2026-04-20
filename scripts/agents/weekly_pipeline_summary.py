"""
Weekly Pipeline Summary — replacement for Cowork Friday Sync.

Runs every Friday at 8am ET. Pulls every active deal from Monday, builds
an HTML + plaintext pipeline summary, and SENDS it via Resend (not drafts)
to ravi@818capitalpartners.com.

Why this exists: the Cowork-generated "Weekly Pipeline Summary" was landing
in Ravi's Gmail drafts folder every Friday instead of actually being sent.
This script replaces that workflow end-to-end with a deterministic send.

Required env vars (GitHub Actions secrets):
  MONDAY_API_TOKEN      — Monday.com personal access token
  RESEND_API_KEY        — Resend API key (same one used by the site)
  NOTIFICATION_EMAIL    — destination (defaults to ravi@818capitalpartners.com)
  FROM_EMAIL            — sender (defaults to onboarding@resend.dev; set to
                         notifications@818capitalpartners.com once domain is
                         verified in Resend)

After deploying, disable the Cowork Friday Sync skill so you don't get
both the draft and the send.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import sys
from collections import defaultdict
from pathlib import Path

import requests

# Make the adjacent modules importable
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import (  # type: ignore[import-not-found]
    COLS,
    GROUPS,
    LOAN_PIPELINE_BOARD_ID,
    MondayClient,
)

# ── Config ──────────────────────────────────────────────────────────────────

RESEND_URL = "https://api.resend.com/emails"

# Pipeline stages we summarize (skip closed/dead/funded)
ACTIVE_STAGES = [
    "application",
    "processing",
    "underwriting",
    "conditional_approval",
    "clear_to_close",
]

# Stage display names + ordering
STAGE_DISPLAY = {
    "application": "Application",
    "processing": "Processing",
    "underwriting": "Underwriting",
    "conditional_approval": "Conditional Approval",
    "clear_to_close": "Clear to Close",
}


# ── Data collection ────────────────────────────────────────────────────────


def collect_active_deals(monday: MondayClient) -> list[dict]:
    """Pull every active deal grouped by stage."""
    deals: list[dict] = []
    for stage_key in ACTIVE_STAGES:
        try:
            items = monday.get_items_by_group(
                LOAN_PIPELINE_BOARD_ID, GROUPS[stage_key], limit=100
            )
        except Exception as e:
            print(f"  Error fetching {stage_key}: {e}", file=sys.stderr)
            continue

        for item in items:
            cols = {cv["id"]: cv.get("text") for cv in item.get("column_values", [])}
            deals.append(
                {
                    "id": item["id"],
                    "stage": stage_key,
                    "name": item["name"],
                    "borrower_name": cols.get(COLS["borrower_name"]) or item["name"],
                    "property_address": cols.get(COLS["property_address"]),
                    "loan_type": cols.get(COLS["loan_type"]),
                    "loan_amount": cols.get(COLS["loan_amount"]),
                    "ltv": cols.get(COLS["ltv"]),
                    "lender_name": cols.get(COLS["lender_name"]),
                    "rate_quoted": cols.get(COLS["rate_quoted"]),
                    "target_close": cols.get(COLS["next_followup"]),
                    "next_action": cols.get(COLS["next_action"]),
                    "waiting_on": cols.get(COLS["waiting_on"]),
                    "docs_pending": cols.get(COLS["documents_pending"]),
                    "priority": cols.get(COLS["priority"]),
                    "last_contact": cols.get(COLS["last_contact"]),
                }
            )
    return deals


# ── Formatting ──────────────────────────────────────────────────────────────


def _fmt_amount(raw) -> str:
    if not raw:
        return "—"
    try:
        return f"${int(float(raw)):,}"
    except (TypeError, ValueError):
        return f"${raw}"


def _fmt_ltv(raw) -> str:
    if raw in (None, "", 0, "0"):
        return "—"
    try:
        return f"{float(raw):.0f}% LTV"
    except (TypeError, ValueError):
        return str(raw)


def _total_volume(deals: list[dict]) -> int:
    total = 0
    for d in deals:
        try:
            total += int(float(d.get("loan_amount") or 0))
        except (TypeError, ValueError):
            pass
    return total


def build_summary(deals: list[dict], date_str: str) -> tuple[str, str]:
    """Return (plaintext, html) pipeline summary."""

    by_stage: dict[str, list[dict]] = defaultdict(list)
    for d in deals:
        by_stage[d["stage"]].append(d)

    total_volume = _total_volume(deals)
    total_count = len(deals)

    # ── plaintext ─────────────────────────────────────────────────────────
    lines = [
        f"818 Capital — Weekly Pipeline Summary",
        f"Week ending {date_str}",
        "",
        f"{total_count} active deals · {_fmt_amount(total_volume)} total volume",
        "=" * 60,
        "",
    ]
    for stage_key in ACTIVE_STAGES:
        stage_deals = by_stage.get(stage_key, [])
        if not stage_deals:
            continue
        lines.append(f"{STAGE_DISPLAY[stage_key].upper()}  ({len(stage_deals)})")
        lines.append("-" * 60)
        for d in stage_deals:
            loc = d.get("property_address") or d["name"]
            lt = d.get("loan_type") or "TBD"
            amt = _fmt_amount(d.get("loan_amount"))
            ltv = _fmt_ltv(d.get("ltv"))
            close = d.get("target_close") or "TBD"
            lender = d.get("lender_name") or "No lender yet"
            lines.append(f"• {loc}")
            lines.append(
                f"  {lt} · {amt} · {ltv} · close {close} · {lender}"
            )
            if d.get("next_action"):
                lines.append(f"  Next: {d['next_action']}")
            if d.get("waiting_on"):
                lines.append(f"  Waiting on: {d['waiting_on']}")
            lines.append("")
        lines.append("")

    plaintext = "\n".join(lines)

    # ── HTML ──────────────────────────────────────────────────────────────
    html_rows: list[str] = []
    for stage_key in ACTIVE_STAGES:
        stage_deals = by_stage.get(stage_key, [])
        if not stage_deals:
            continue
        stage_volume = _total_volume(stage_deals)
        html_rows.append(
            f"<h3 style='margin:24px 0 8px;color:#0a2540;font-size:15px;"
            f"letter-spacing:.04em;text-transform:uppercase;"
            f"border-bottom:1px solid #e2e8f0;padding-bottom:4px;'>"
            f"{STAGE_DISPLAY[stage_key]} "
            f"<span style='color:#64748b;font-weight:400;font-size:13px;'>"
            f"· {len(stage_deals)} deals · {_fmt_amount(stage_volume)}</span></h3>"
        )
        html_rows.append("<table style='width:100%;border-collapse:collapse;"
                         "font-size:13px;'>")
        for d in stage_deals:
            loc = d.get("property_address") or d["name"]
            lt = d.get("loan_type") or "TBD"
            amt = _fmt_amount(d.get("loan_amount"))
            ltv = _fmt_ltv(d.get("ltv"))
            close = d.get("target_close") or "TBD"
            lender = d.get("lender_name") or "<em style='color:#94a3b8;'>no lender yet</em>"
            next_action = d.get("next_action") or ""
            waiting = d.get("waiting_on") or ""
            monday_url = (
                f"https://baynes-x-baker.monday.com/boards/"
                f"{LOAN_PIPELINE_BOARD_ID}/pulses/{d['id']}"
            )
            extras = []
            if next_action:
                extras.append(f"<em>Next:</em> {next_action}")
            if waiting:
                extras.append(f"<em>Waiting on:</em> {waiting}")
            extra_html = (
                f"<div style='color:#64748b;font-size:12px;margin-top:2px;'>"
                f"{' · '.join(extras)}</div>" if extras else ""
            )
            html_rows.append(
                f"<tr style='border-bottom:1px solid #f1f5f9;'>"
                f"<td style='padding:10px 8px;'>"
                f"<a href='{monday_url}' style='color:#0a2540;text-decoration:none;"
                f"font-weight:600;'>{loc}</a>"
                f"<div style='color:#334155;font-size:12px;margin-top:2px;'>"
                f"{lt} · {amt} · {ltv} · close {close} · {lender}</div>"
                f"{extra_html}"
                f"</td></tr>"
            )
        html_rows.append("</table>")

    html = f"""\
<!doctype html>
<html><body style='font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",
Roboto,sans-serif;color:#1a1a1a;max-width:720px;margin:0 auto;padding:20px;
line-height:1.5;'>
<div style='border-bottom:2px solid #0a2540;padding-bottom:12px;margin-bottom:20px;'>
  <h1 style='margin:0;color:#0a2540;font-size:22px;'>818 Capital — Weekly Pipeline Summary</h1>
  <p style='margin:4px 0 0;color:#64748b;font-size:13px;'>Week ending {date_str}</p>
</div>
<div style='background:#f8fafc;border-left:4px solid #0a2540;padding:12px 16px;
border-radius:4px;margin-bottom:20px;'>
  <div style='font-size:22px;font-weight:700;color:#0a2540;'>{total_count} active deals</div>
  <div style='font-size:14px;color:#475569;'>{_fmt_amount(total_volume)} total volume</div>
</div>
{''.join(html_rows) if html_rows else '<p style="color:#64748b;">No active deals this week.</p>'}
<p style='margin-top:32px;color:#94a3b8;font-size:11px;'>
Automated by 818 Capital weekly pipeline summary. Sent via Resend.
Replaces the previous Cowork Friday Sync draft.
</p>
</body></html>
"""
    return plaintext, html


# ── Send via Resend ────────────────────────────────────────────────────────


def send_via_resend(plaintext: str, html: str, subject: str) -> bool:
    api_key = os.environ.get("RESEND_API_KEY")
    recipient = os.environ.get("NOTIFICATION_EMAIL", "ravi@818capitalpartners.com")
    from_addr = os.environ.get("FROM_EMAIL", "onboarding@resend.dev")

    if not api_key:
        print("  RESEND_API_KEY not set — skipping send", file=sys.stderr)
        return False

    # Resend sandbox rejects display names on the from-address; only label
    # once a verified domain is in play.
    is_sandbox = from_addr == "onboarding@resend.dev"
    from_field = from_addr if is_sandbox else f"818 Capital Pipeline <{from_addr}>"

    payload = {
        "from": from_field,
        "to": [recipient],
        "subject": subject,
        "text": plaintext,
        "html": html,
    }

    try:
        res = requests.post(
            RESEND_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps(payload),
            timeout=20,
        )
        if res.status_code >= 300:
            print(f"  Resend error {res.status_code}: {res.text}", file=sys.stderr)
            return False
        print(f"  Email sent to {recipient} (Resend id: {res.json().get('id')})")
        return True
    except Exception as e:
        print(f"  Resend request failed: {e}", file=sys.stderr)
        return False


# ── Main ────────────────────────────────────────────────────────────────────


def main() -> int:
    monday = MondayClient()
    deals = collect_active_deals(monday)
    print(f"Found {len(deals)} active deals across {len(ACTIVE_STAGES)} stages")

    today = dt.date.today()
    date_str = today.strftime("%B %d, %Y")

    plaintext, html = build_summary(deals, date_str)

    total_volume = _total_volume(deals)
    subject = (
        f"818 Pipeline · Week of {date_str} · "
        f"{len(deals)} deals · {_fmt_amount(total_volume)}"
    )

    ok = send_via_resend(plaintext, html, subject)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
