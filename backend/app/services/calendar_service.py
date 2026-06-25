from datetime import datetime, timedelta, timezone


async def sync_calendar(provider: str, access_token: str | None) -> list[dict[str, object]]:
    # Production wiring point for Google Calendar and Microsoft Graph.
    # In local demo mode we return deterministic events so scheduling works immediately.
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    return [
        {
            "provider": provider,
            "external_id": f"demo-{provider}-{idx}",
            "title": title,
            "start_at": now + timedelta(hours=start),
            "end_at": now + timedelta(hours=end),
        }
        for idx, (title, start, end) in enumerate(
            [("Team standup", 2, 3), ("Deep work hold", 5, 6), ("Review meeting", 8, 9)]
        )
    ]
