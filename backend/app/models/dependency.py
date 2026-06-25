from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Dependency(TimestampMixin, Base):
    __tablename__ = "dependencies"
    __table_args__ = (Index("ix_dependencies_task_due", "task_id", "due_at"),)

    task_id: Mapped[str] = mapped_column(ForeignKey("tasks.id"), index=True)
    blocker: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)

    task = relationship("Task", back_populates="dependencies")
