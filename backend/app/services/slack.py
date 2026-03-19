import httpx

from app.config import settings


async def post_slack_notification(deal, person) -> None:
    if not settings.SLACK_WEBHOOK_URL:
        print("[Slack] No webhook URL configured, skipping")
        return

    score_emoji = {
        "green": ":large_green_circle:",
        "yellow": ":large_yellow_circle:",
        "red": ":red_circle:",
    }.get(deal.deal_score or "", ":white_circle:")

    lane_display = {
        "dscr": "DSCR / Rental", "flip": "Fix & Flip",
        "str": "Short-Term Rental", "multifamily": "Multifamily / Commercial",
    }.get(deal.product_lane, deal.product_lane)

    loan_amt = f"${deal.financials.get('loan_amount', 0):,.0f}" if deal.financials.get("loan_amount") else "TBD"
    lenders = ", ".join(deal.ai_triage_result.get("lenders", [])) if deal.ai_triage_result else "N/A"

    blocks = [
        {"type": "header", "text": {"type": "plain_text", "text": "New Deal via 818capitalpartners.com"}},
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Borrower:*\n{person.first_name} {person.last_name}"},
                {"type": "mrkdwn", "text": f"*Email:*\n{person.email}"},
                {"type": "mrkdwn", "text": f"*Lane:*\n{lane_display}"},
                {"type": "mrkdwn", "text": f"*Loan:*\n{loan_amt}"},
                {"type": "mrkdwn", "text": f"*Score:*\n{score_emoji} {(deal.deal_score or 'pending').upper()}"},
                {"type": "mrkdwn", "text": f"*Lenders:*\n{lenders}"},
            ],
        },
    ]

    try:
        async with httpx.AsyncClient() as client:
            await client.post(settings.SLACK_WEBHOOK_URL, json={"blocks": blocks}, timeout=10.0)
    except Exception as e:
        print(f"[Slack] Failed: {e}")


async def send_daily_summary(deals: list) -> None:
    if not settings.SLACK_WEBHOOK_URL or not deals:
        return

    green = sum(1 for d in deals if d.deal_score == "green")
    yellow = sum(1 for d in deals if d.deal_score == "yellow")
    red = sum(1 for d in deals if d.deal_score == "red")

    lane_counts: dict[str, int] = {}
    for d in deals:
        lane_counts[d.product_lane] = lane_counts.get(d.product_lane, 0) + 1
    lane_text = " | ".join(f"{k.upper()}: {v}" for k, v in lane_counts.items())

    blocks = [
        {"type": "header", "text": {"type": "plain_text", "text": "818 Capital - Daily Lead Summary"}},
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": (
                    f"*{len(deals)} new leads in the last 24 hours*\n\n"
                    f":large_green_circle: {green} | :large_yellow_circle: {yellow} | :red_circle: {red}\n\n"
                    f"*By Lane:* {lane_text}"
                ),
            },
        },
    ]

    try:
        async with httpx.AsyncClient() as client:
            await client.post(settings.SLACK_WEBHOOK_URL, json={"blocks": blocks}, timeout=10.0)
    except Exception as e:
        print(f"[Slack] Daily summary failed: {e}")
