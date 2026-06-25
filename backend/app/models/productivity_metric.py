from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class ProductivityMetric(TimestampMixin, Base):
    __tablename__ = "productivity_metrics"
    __table_args__ = (Index("ix_metrics_user_recorded", "user_id", "recorded_at"),)

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    tasks_completed: Mapped[int] = mapped_column(Integer, default=0)
    focus_minutes: Mapped[int] = mapped_column(Integer, default=0)
    energy_score: Mapped[float] = mapped_column(Float, default=0.7)
    peak_period: Mapped[str] = mapped_column(String(40), default="morning")
