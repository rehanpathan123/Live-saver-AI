from sqlalchemy import JSON, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class AIRecommendation(TimestampMixin, Base):
    __tablename__ = "ai_recommendations"
    __table_args__ = (Index("ix_ai_recommendations_user_kind", "user_id", "kind"),)

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    task_id: Mapped[str | None] = mapped_column(ForeignKey("tasks.id"), nullable=True, index=True)
    kind: Mapped[str] = mapped_column(String(80))
    prompt: Mapped[str] = mapped_column(Text)
    response: Mapped[dict] = mapped_column(JSON)
    embedding: Mapped[list[float] | None] = mapped_column(JSON, nullable=True)
