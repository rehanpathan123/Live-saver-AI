from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models import User
from app.schemas.user import ChangePasswordRequest, UpdateProfileRequest, UserProfileResponse

router = APIRouter()


@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserProfileResponse:
    return UserProfileResponse.model_validate(current_user)


@router.patch("/me", response_model=UserProfileResponse)
async def update_me(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfileResponse:
    if payload.name is not None:
        current_user.name = payload.name
    if payload.timezone is not None:
        current_user.timezone = payload.timezone
    if payload.workday_start is not None:
        current_user.workday_start = payload.workday_start
    if payload.workday_end is not None:
        current_user.workday_end = payload.workday_end
    if payload.notifications_enabled is not None:
        current_user.notifications_enabled = payload.notifications_enabled
    await db.commit()
    await db.refresh(current_user)
    return UserProfileResponse.model_validate(current_user)


@router.patch("/me/password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    current_user.password_hash = hash_password(payload.new_password)
    await db.commit()
    return {"status": "ok", "message": "Password updated successfully"}
