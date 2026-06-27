from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    timezone: Mapped[str] = mapped_column(String(80), default="UTC")
    workday_start: Mapped[str] = mapped_column(String(5), default="09:00")
    workday_end: Mapped[str] = mapped_column(String(5), default="18:00")
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
