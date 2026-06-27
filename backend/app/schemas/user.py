from pydantic import BaseModel, EmailStr, Field


class UserProfileResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    timezone: str
    workday_start: str
    workday_end: str
    notifications_enabled: bool

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    timezone: str | None = None
    workday_start: str | None = None
    workday_end: str | None = None
    notifications_enabled: bool | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
