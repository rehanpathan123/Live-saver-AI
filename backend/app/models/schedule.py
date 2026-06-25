from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Schedule(TimestampMixin, Base):
    __tablename__ = "schedules"
    __table_args__ = (Index("ix_schedules_user_window", "user_id", "start_at", "end_at"),)

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    task_id: Mapped[str] = mapped_column(ForeignKey("tasks.id"), index=True)
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    calendar_provider: Mapped[str] = mapped_column(String(40), default="internal")
    external_event_id: Mapped[str | None] = mapped_column(String(255))

    task = relationship("Task", back_populates="schedules")
