from datetime import datetime, time, timedelta, timezone


def generate_work_blocks(
    title: str,
    duration_minutes: int,
    deadline: datetime,
    busy_events: list[tuple[datetime, datetime]],
    workday_start_hour: int = 9,
    workday_end_hour: int = 18,
) -> list[dict[str, str]]:
    now = datetime.now(timezone.utc)
    cursor_date = now.date()
    remaining = duration_minutes
    blocks: list[dict[str, str]] = []
    busy_events = sorted(busy_events)

    while remaining > 0 and datetime.combine(cursor_date, time(workday_start_hour), tzinfo=timezone.utc) < deadline:
        cursor = max(now, datetime.combine(cursor_date, time(workday_start_hour), tzinfo=timezone.utc))
        day_end = min(datetime.combine(cursor_date, time(workday_end_hour), tzinfo=timezone.utc), deadline)

        for busy_start, busy_end in busy_events + [(day_end, day_end)]:
            if busy_end <= cursor or busy_start.date() != cursor_date:
                continue
            free_end = min(busy_start, day_end)
            free_minutes = int((free_end - cursor).total_seconds() // 60)
            if free_minutes >= 30:
                chunk = min(remaining, free_minutes, 90)
                end = cursor + timedelta(minutes=chunk)
                blocks.append({"title": title, "start_at": cursor.isoformat(), "end_at": end.isoformat()})
                remaining -= chunk
                cursor = end
                if remaining <= 0:
                    break
            cursor = max(cursor, busy_end)
        cursor_date += timedelta(days=1)

    return blocks
