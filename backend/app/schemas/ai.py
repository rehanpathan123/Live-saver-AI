from datetime import datetime

from pydantic import BaseModel, Field


class ParseTaskRequest(BaseModel):
    text: str = Field(min_length=3)
    reference_time: datetime | None = None


class ScheduleRequest(BaseModel):
    task_id: str | None = None
    title: str
    duration_minutes: int = Field(ge=15, le=1440)
    deadline: datetime
    workday_start_hour: int = 9
    workday_end_hour: int = 18


class WarmStartRequest(BaseModel):
    task_id: str | None = None
    title: str
    context: str | None = None


class PanicButtonRequest(BaseModel):
    task_id: str | None = None
    title: str
    blocker: str
    audience: str = "manager"
    requested_extension: str = "one additional day"


class FollowUpRequest(BaseModel):
    dependency: str
    person: str
    deadline: str
    tone: str = "warm and direct"
