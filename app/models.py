"""SQLAlchemy ORM models."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, CheckConstraint, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.enums import Priority


class Task(Base):
    """Task model representing a task management item."""

    __tablename__ = "tasks"

    # Defense in depth: the shared Priority enum (app/enums.py) remains the
    # application-level source of truth; this constraint guards direct DB
    # writes that bypass API/Pydantic validation.
    __table_args__ = (
        CheckConstraint(
            "priority IN ('low', 'medium', 'high')",
            name="ck_tasks_priority_valid",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Stored as a plain VARCHAR guarded by the ck_tasks_priority_valid CHECK
    # constraint above — the accepted values mirror app.enums.Priority.
    priority: Mapped[Priority] = mapped_column(
        String(10),
        default=Priority.MEDIUM,
        nullable=False,
        index=True,
    )
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', completed={self.completed})>"
