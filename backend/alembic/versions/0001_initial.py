"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-25
"""

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    priority = sa.Enum("low", "medium", "high", "urgent", name="priority")
    taskstatus = sa.Enum("todo", "scheduled", "in_progress", "blocked", "completed", name="taskstatus")

    op.create_table("users", sa.Column("email", sa.String(320), nullable=False), sa.Column("name", sa.String(120), nullable=False), sa.Column("password_hash", sa.String(255), nullable=False), sa.Column("timezone", sa.String(80), nullable=False), sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True), sa.PrimaryKeyConstraint("id"))
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_deleted_at"), "users", ["deleted_at"], unique=False)
    op.create_table("tasks", sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("title", sa.String(240), nullable=False), sa.Column("description", sa.Text(), nullable=True), sa.Column("deadline", sa.DateTime(timezone=True), nullable=True), sa.Column("estimated_minutes", sa.Integer(), nullable=False), sa.Column("priority", priority, nullable=False), sa.Column("status", taskstatus, nullable=False), sa.Column("source_text", sa.Text(), nullable=True), sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True), sa.ForeignKeyConstraint(["user_id"], ["users.id"]), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_tasks_user_deadline", "tasks", ["user_id", "deadline"])
    op.create_index("ix_tasks_status_priority", "tasks", ["status", "priority"])
    op.create_index(op.f("ix_tasks_title"), "tasks", ["title"], unique=False)
    op.create_index(op.f("ix_tasks_deleted_at"), "tasks", ["deleted_at"], unique=False)
    op.create_table("calendar_events", sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("provider", sa.String(40), nullable=False), sa.Column("external_id", sa.String(255), nullable=False), sa.Column("title", sa.String(240), nullable=False), sa.Column("start_at", sa.DateTime(timezone=True), nullable=False), sa.Column("end_at", sa.DateTime(timezone=True), nullable=False), sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True), sa.ForeignKeyConstraint(["user_id"], ["users.id"]), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_calendar_events_user_window", "calendar_events", ["user_id", "start_at", "end_at"])
    op.create_index(op.f("ix_calendar_events_external_id"), "calendar_events", ["external_id"], unique=False)
    op.create_table("dependencies", sa.Column("task_id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("blocker", sa.String(160), nullable=False), sa.Column("description", sa.Text(), nullable=False), sa.Column("due_at", sa.DateTime(timezone=True), nullable=True), sa.Column("resolved", sa.Boolean(), nullable=False), sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True), sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_dependencies_task_due", "dependencies", ["task_id", "due_at"])
    op.create_table("schedules", sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("task_id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("start_at", sa.DateTime(timezone=True), nullable=False), sa.Column("end_at", sa.DateTime(timezone=True), nullable=False), sa.Column("calendar_provider", sa.String(40), nullable=False), sa.Column("external_event_id", sa.String(255), nullable=True), sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True), sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]), sa.ForeignKeyConstraint(["user_id"], ["users.id"]), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_schedules_user_window", "schedules", ["user_id", "start_at", "end_at"])
    op.create_table("productivity_metrics", sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False), sa.Column("tasks_completed", sa.Integer(), nullable=False), sa.Column("focus_minutes", sa.Integer(), nullable=False), sa.Column("energy_score", sa.Float(), nullable=False), sa.Column("peak_period", sa.String(40), nullable=False), sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True), sa.ForeignKeyConstraint(["user_id"], ["users.id"]), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_metrics_user_recorded", "productivity_metrics", ["user_id", "recorded_at"])
    op.create_table("notifications", sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("title", sa.String(180), nullable=False), sa.Column("body", sa.Text(), nullable=False), sa.Column("kind", sa.String(60), nullable=False), sa.Column("read", sa.Boolean(), nullable=False), sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True), sa.ForeignKeyConstraint(["user_id"], ["users.id"]), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_notifications_user_read", "notifications", ["user_id", "read"])
    op.create_table("ai_recommendations", sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("task_id", postgresql.UUID(as_uuid=False), nullable=True), sa.Column("kind", sa.String(80), nullable=False), sa.Column("prompt", sa.Text(), nullable=False), sa.Column("response", postgresql.JSONB(astext_type=sa.Text()), nullable=False), sa.Column("embedding", Vector(1536), nullable=True), sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True), sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]), sa.ForeignKeyConstraint(["user_id"], ["users.id"]), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_ai_recommendations_user_kind", "ai_recommendations", ["user_id", "kind"])


def downgrade() -> None:
    for table in ["ai_recommendations", "notifications", "productivity_metrics", "schedules", "dependencies", "calendar_events", "tasks", "users"]:
        op.drop_table(table)
    sa.Enum(name="taskstatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="priority").drop(op.get_bind(), checkfirst=True)
