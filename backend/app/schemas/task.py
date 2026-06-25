from datetime import datetime

from pydantic import BaseModel, Field

from app.models.task import Priority, TaskStatus


class TaskBase(BaseModel):
    title: str = Field(min_length=2, max_length=240)
    description: str | None = None
    deadline: datetime | None = None
    estimated_minutes: int = Field(default=60, ge=15, le=1440)
    priority: Priority = Priority.medium
    status: TaskStatus = TaskStatus.todo
    source_text: str | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=240)
    description: str | None = None
    deadline: datetime | None = None
    estimated_minutes: int | None = Field(default=None, ge=15, le=1440)
    priority: Priority | None = None
    status: TaskStatus | None = None


class TaskResponse(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
