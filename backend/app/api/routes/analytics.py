from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import ProductivityMetric, Task, TaskStatus, User

router = APIRouter()


@router.get("/productivity")
async def productivity(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> dict:
    since = datetime.now(timezone.utc) - timedelta(days=7)
    completed = await db.scalar(
        select(func.count(Task.id)).where(Task.user_id == user.id, Task.status == TaskStatus.completed, Task.updated_at >= since)
    )
    metric = await db.scalar(
        select(ProductivityMetric).where(ProductivityMetric.user_id == user.id).order_by(ProductivityMetric.recorded_at.desc()).limit(1)
    )
    energy = metric.energy_score if metric else 0.74
    return {"productivity_score": round((completed or 0) * 8 + energy * 60, 1), "completed_last_7_days": completed or 0, "peak_period": metric.peak_period if metric else "morning"}


@router.get("/insights")
async def insights(user: User = Depends(get_current_user)) -> dict:
    return {
        "insights": [
            "Your best focus window is currently morning.",
            "High-priority tasks should be split into 60-90 minute work blocks.",
            "Follow up on open dependencies at least one day before the final deadline.",
        ]
    }
