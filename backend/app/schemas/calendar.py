from datetime import datetime

from pydantic import BaseModel


class CalendarEventResponse(BaseModel):
    id: str
    provider: str
    external_id: str
    title: str
    start_at: datetime
    end_at: datetime

    model_config = {"from_attributes": True}


class CalendarSyncRequest(BaseModel):
    provider: str = "google"
    access_token: str | None = None


class CalendarEventCreate(BaseModel):
    title: str
    start_at: datetime
    end_at: datetime
    provider: str = "manual"
