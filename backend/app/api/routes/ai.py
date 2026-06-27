from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import CalendarEvent, User
from app.schemas.ai import (
    DailyScheduleRequest,
    FollowUpRequest,
    PanicButtonRequest,
    ParseTaskRequest,
    ScheduleRequest,
    WarmStartRequest,
)
from app.services.ai_service import ai_service
from app.services.scheduler import generate_work_blocks

router = APIRouter()


@router.post("/parse-task")
async def parse_task(payload: ParseTaskRequest, user: User = Depends(get_current_user)) -> dict:
    return await ai_service.parse_task(payload.text, payload.reference_time, payload.language)


@router.post("/generate-schedule")
async def generate_schedule(
    payload: ScheduleRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(CalendarEvent).where(CalendarEvent.user_id == user.id, CalendarEvent.deleted_at.is_(None))
    )
    busy = [(event.start_at, event.end_at) for event in result.scalars().all()]
    blocks = generate_work_blocks(
        payload.title,
        payload.duration_minutes,
        payload.deadline,
        busy,
        payload.workday_start_hour,
        payload.workday_end_hour,
    )
    return {
        "blocks": blocks,
        "possible": bool(blocks),
        "remaining_minutes": max(payload.duration_minutes - len(blocks) * 90, 0),
    }


@router.post("/daily-schedule")
async def daily_schedule(payload: DailyScheduleRequest, user: User = Depends(get_current_user)) -> dict:
    return await ai_service.daily_schedule(payload.description, payload.wake_up, payload.sleep, payload.language)


@router.post("/warm-start")
async def warm_start(payload: WarmStartRequest, user: User = Depends(get_current_user)) -> dict:
    return await ai_service.warm_start(payload.title, payload.context, payload.language)


@router.post("/panic-button")
async def panic_button(payload: PanicButtonRequest, user: User = Depends(get_current_user)) -> dict:
    return await ai_service.panic_button(
        payload.title, payload.blocker, payload.audience, payload.requested_extension, payload.language
    )


@router.post("/follow-up")
async def follow_up(payload: FollowUpRequest, user: User = Depends(get_current_user)) -> dict:
    return await ai_service.follow_up(
        payload.dependency, payload.person, payload.deadline, payload.tone, payload.language
    )
