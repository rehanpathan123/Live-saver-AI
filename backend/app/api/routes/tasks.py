from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Task, User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter()


@router.get("", response_model=list[TaskResponse])
async def list_tasks(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[Task]:
    result = await db.execute(
        select(Task).where(Task.user_id == user.id, Task.deleted_at.is_(None)).order_by(Task.deadline.asc().nulls_last())
    )
    return list(result.scalars().all())


@router.post("", response_model=TaskResponse)
async def create_task(payload: TaskCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> Task:
    task = Task(**payload.model_dump(), user_id=user.id)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == user.id, Task.deleted_at.is_(None)))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}")
async def delete_task(task_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == user.id, Task.deleted_at.is_(None)))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "deleted"}
