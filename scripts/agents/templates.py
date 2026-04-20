"""
Angela message templates — v1 starter set per spec §8.

Every template returns (subject, body_html). Body includes the Angela
signature image at the end.

Templates are keyed to the Green/Yellow/Red taxonomy per spec:
  - GREEN = auto-send OK (after rate-limit + safe_to_send validation)
  - YELLOW = draft only, review before send
  - RED = human writes, agent never touches
"""
from __future__ import annotations

from common import ANGELA_SIGNATURE_HTML


def _wrap(body: str) -> str:
    """Wrap plain-text body with Angela signature image."""
    # Convert plain-text newlines to <br> and wrap in a simple HTML paragraph
    html_body = body.strip().replace("\n\n", "</p><p>").replace("\n", "<br>")
    return f"<p>{html_body}</p>{ANGELA_SIGNATURE_HTML}"


# ── Green — auto-send ────────────────────────────────────────────────────────

def lead_ack(first_name: str) -> tuple[str, str]:
    """§8.1 Lead acknowledgment — Green, auto-send within 2 min of inbound."""
    subject = "Got your inquiry — 818 Capital Partners"
    body = (
        f"Hi {first_name},\n\n"
        f"Thanks for reaching out to 818 Capital. I'm Angela — I help coordinate "
        f"deals for Ravi Punn.\n\n"
        f"Ravi will get back to you personally within the next business day. "
        f"If there's anything time-sensitive, the best way to reach him is a "
        f"quick text to 917-993-9194.\n\n"
        f"Talk soon,\n"
        f"Angela"
    )
    return subject, _wrap(body)


def intake_link(first_name: str, property_address: str, intake_url: str, drive_url: str) -> tuple[str, str]:
    """§8.2 Intake form link — Green, auto-send after qualification call."""
    subject = f"Intake link — {property_address}"
    body = (
        f"Hi {first_name},\n\n"
        f"Great connecting. To keep things moving on {property_address}, here's "
        f"the intake link:\n\n"
        f"{intake_url}\n\n"
        f"It takes most people about 10 minutes and captures everything we "
        f"need to get you pre-approved and quoted. If you'd rather upload "
        f"docs directly, your Drive folder is here: {drive_url}\n\n"
        f"Any questions, just reply.\n\n"
        f"Angela"
    )
    return subject, _wrap(body)


def intake_received(first_name: str, drive_url: str) -> tuple[str, str]:
    """§8.3 Intake received confirmation — Green, auto-send on form submission."""
    subject = "Got it — here's what happens next"
    body = (
        f"Hi {first_name},\n\n"
        f"Got everything — intake is in. Here's what happens next:\n\n"
        f"  1. Ravi will review the full package in the next 24 hours.\n"
        f"  2. We'll run scenarios against our lender matrix and come back "
        f"to you with 2-3 options.\n"
        f"  3. Once you pick a direction, we submit and you'll have a term "
        f"sheet within a few business days.\n\n"
        f"Your deal folder: {drive_url}\n\n"
        f"Angela"
    )
    return subject, _wrap(body)


def doc_chase_24h(first_name: str, property_address: str, missing_items: list[str], drive_url: str) -> tuple[str, str]:
    """§3.3 / §8 24-hour gentle nudge — Green, auto-send."""
    subject = f"Quick check — {property_address}"
    items_list = "\n".join(f"  • {item}" for item in missing_items)
    body = (
        f"Hi {first_name},\n\n"
        f"Quick check on {property_address} — we're still waiting on:\n\n"
        f"{items_list}\n\n"
        f"Upload link: {drive_url}\n\n"
        f"Let me know if anything is giving you trouble.\n\n"
        f"Angela"
    )
    return subject, _wrap(body)


def doc_chase_72h(first_name: str, property_address: str, missing_items: list[str], drive_url: str) -> tuple[str, str]:
    """§3.3 72-hour firmer ping — Green, auto-send."""
    subject = f"Following up — {property_address}"
    items_list = "\n".join(f"  • {item}" for item in missing_items)
    body = (
        f"Hi {first_name},\n\n"
        f"Following up on {property_address} — we're still waiting on:\n\n"
        f"{items_list}\n\n"
        f"Upload link: {drive_url}\n\n"
        f"This is the second note — if I don't hear back by end of day "
        f"tomorrow, I'll flag it to Ravi so he can check in personally.\n\n"
        f"Angela"
    )
    return subject, _wrap(body)


def uw_status_check(processor_first_name: str, property_address: str, loan_id: str) -> tuple[str, str]:
    """§8.5 UW status check to lender processor — Green, auto-send at 5 biz days silence."""
    subject = f"Checking in on {property_address} — loan #{loan_id}"
    body = (
        f"Hi {processor_first_name},\n\n"
        f"Checking in on {property_address} — loan #{loan_id}.\n\n"
        f"Any outstanding conditions on your side? Happy to run anything "
        f"down with the borrower — flag it and I'll turn it around today.\n\n"
        f"Angela"
    )
    return subject, _wrap(body)


def closing_day_confirmation(
    property_address: str, lender_name: str, close_datetime: str, open_items: list[str]
) -> tuple[str, str]:
    """§8.6 Closing day confirmation — Green, auto-send day-of to all parties.
    Note: lender_name used internally only — NEVER include in client-facing body."""
    subject = f"Closing confirmation — {property_address}"
    open_items_block = (
        "\n".join(f"  • {item}" for item in open_items)
        if open_items
        else "  • none"
    )
    body = (
        f"All,\n\n"
        f"Confirming closing for {property_address} — {close_datetime}.\n\n"
        f"Last open items from our side:\n\n"
        f"{open_items_block}\n\n"
        f"Reach out to Ravi directly at 917-993-9194 with anything "
        f"day-of.\n\n"
        f"Angela"
    )
    return subject, _wrap(body)


def funded_thank_you(first_name: str, property_address: str, review_url: str) -> tuple[str, str]:
    """§8.7 Funded thank-you + review request — Green, auto-send on funded."""
    subject = f"{property_address} is funded — congratulations"
    body = (
        f"Hi {first_name},\n\n"
        f"{property_address} is funded — congratulations.\n\n"
        f"A few closing items:\n\n"
        f"  • Your final package is archived in your Drive folder.\n"
        f"  • If you'd leave us a quick Google review, it genuinely "
        f"helps: {review_url}\n"
        f"  • We'll check in at 30/60/90 days to see how the property is "
        f"performing — or sooner if the next deal is moving.\n\n"
        f"Thank you for trusting us on this one.\n\n"
        f"Ravi and Angela"
    )
    return subject, _wrap(body)


# ── Yellow — draft only ──────────────────────────────────────────────────────

def lender_weekly_sync_draft(
    ae_first_name: str, lender_label: str, date_str: str, pipeline_rows: list[str]
) -> tuple[str, str]:
    """§8.4 Weekly lender sync — Yellow, draft only.
    `lender_label` appears in subject line (internal) — OK since this is TO the lender."""
    subject = f"818 Pipeline — {lender_label} — Week of {date_str}"
    rows = "\n".join(f"  {row}" for row in pipeline_rows)
    body = (
        f"Hi {ae_first_name},\n\n"
        f"Weekly update from our side — here's what's moving at 818:\n\n"
        f"{rows}\n\n"
        f"Let me know which of these fit your current box and I'll send "
        f"full packages. Anything we should be looking out for this week on "
        f"your end — pricing moves, new programs, exceptions?\n\n"
        f"Ravi"
    )
    return subject, _wrap(body)


def day_7_escalation_draft(
    first_name: str, property_address: str, missing_items: list[str]
) -> tuple[str, str]:
    """§3.3 Day-7 escalation — Yellow, draft only, for Ravi to send personally."""
    subject = f"Personal note — {property_address}"
    items_list = "\n".join(f"  • {item}" for item in missing_items)
    body = (
        f"Hi {first_name},\n\n"
        f"Wanted to reach out directly. We've been trying to track down a few "
        f"items on {property_address} for about a week:\n\n"
        f"{items_list}\n\n"
        f"Let me know where you're at — if something's changed or this isn't "
        f"the right time, no hard feelings. But if you want to keep moving, "
        f"I'll block time this week to walk through any of these items "
        f"with you directly.\n\n"
        f"Ravi"
    )
    # Note: signed as Ravi — Day 7 escalation is Ravi's personal voice, not Angela
    return subject, f"<p>{body.replace(chr(10) + chr(10), '</p><p>').replace(chr(10), '<br>')}</p>"
