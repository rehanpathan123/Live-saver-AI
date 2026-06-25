import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Priority(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    urgent = "Urgent"


class TaskStatus(str, enum.Enum):
    todo = "todo"
    scheduled = "scheduled"
    in_progress = "in_progress"
    blocked = "blocked"
    completed = "completed"


class Task(TimestampMixin, Base):
    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_tasks_user_deadline", "user_id", "deadline"),
        Index("ix_tasks_status_priority", "status", "priority"),
    )

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(240), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=60)
    priority: Mapped[Priority] = mapped_column(Enum(Priority), default=Priority.medium)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus), default=TaskStatus.todo)
    source_text: Mapped[str | None] = mapped_column(Text)

    user = relationship("User", back_populates="tasks")
    dependencies = relationship("Dependency", back_populates="task", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="task", cascade="all, delete-orphan")
