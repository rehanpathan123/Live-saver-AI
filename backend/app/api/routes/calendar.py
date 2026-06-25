from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import CalendarEvent, User
from app.schemas.calendar import CalendarEventResponse, CalendarSyncRequest
from app.services.calendar_service import sync_calendar

router = APIRouter()


@router.get("/events", response_model=list[CalendarEventResponse])
async def events(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[CalendarEvent]:
    result = await db.execute(
        select(CalendarEvent).where(CalendarEvent.user_id == user.id, CalendarEvent.deleted_at.is_(None)).order_by(CalendarEvent.start_at)
    )
    return list(result.scalars().all())


@router.post("/sync", response_model=list[CalendarEventResponse])
async def sync(payload: CalendarSyncRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[CalendarEvent]:
    incoming = await sync_calendar(payload.provider, payload.access_token)
    events = [CalendarEvent(user_id=user.id, **item) for item in incoming]
    db.add_all(events)
    await db.commit()
    for event in events:
        await db.refresh(event)
    return events
