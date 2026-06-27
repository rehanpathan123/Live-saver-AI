from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import CalendarEvent, User
from app.schemas.calendar import CalendarEventCreate, CalendarEventResponse, CalendarSyncRequest
from app.services.calendar_service import sync_calendar

router = APIRouter()


@router.get("/events", response_model=list[CalendarEventResponse])
async def list_events(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[CalendarEvent]:
    result = await db.execute(
        select(CalendarEvent).where(CalendarEvent.user_id == user.id, CalendarEvent.deleted_at.is_(None)).order_by(CalendarEvent.start_at)
    )
    return list(result.scalars().all())


@router.post("/events", response_model=CalendarEventResponse)
async def create_event(
    payload: CalendarEventCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CalendarEvent:
    event = CalendarEvent(
        user_id=user.id,
        provider=payload.provider,
        external_id=f"manual-{uuid4()}",
        title=payload.title,
        start_at=payload.start_at,
        end_at=payload.end_at,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.post("/sync", response_model=list[CalendarEventResponse])
async def sync(payload: CalendarSyncRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[CalendarEvent]:
    incoming = await sync_calendar(payload.provider, payload.access_token)
    events = [CalendarEvent(user_id=user.id, **item) for item in incoming]
    db.add_all(events)
    await db.commit()
    for event in events:
        await db.refresh(event)
    return events


@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    result = await db.execute(
        select(CalendarEvent).where(
            CalendarEvent.id == event_id,
            CalendarEvent.user_id == user.id,
            CalendarEvent.deleted_at.is_(None),
        )
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    event.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "deleted"}
