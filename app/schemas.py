"""Pydantic schemas for request validation and response serialization."""

from datetime import datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, field_validator

from app.enums import Priority


def _normalize_title(value: str) -> str:
    """Trim surrounding whitespace; reject titles that are empty after trimming."""
    title = value.strip()
    if not title:
        raise ValueError("Title must not be empty or whitespace-only")
    return title


# Shared task-title definition so create and update enforce identical rules.
TitleField = Annotated[
    str,
    Field(
        min_length=1,
        max_length=255,
        description="The title of the task",
        examples=["Buy groceries"],
    ),
    AfterValidator(_normalize_title),
]


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: TitleField
    description: str | None = Field(
        default=None,
        max_length=5000,
        description="Optional description of the task",
        examples=["Milk, eggs, bread, butter"],
    )
    priority: Priority = Field(
        default=Priority.MEDIUM,
        description="Task priority: low, medium, or high",
        examples=["medium"],
    )
    completed: bool = Field(
        default=False,
        description="Whether the task is completed",
    )


class TaskUpdate(BaseModel):
    """Schema for updating an existing task. All fields are optional."""

    title: TitleField | None = None

    @field_validator("title")
    @classmethod
    def reject_null_title(cls, value: str | None) -> str | None:
        """Reject an explicit JSON null title.

        Omitting `title` means "no change"; an explicit null would blank a
        required, non-nullable column, so it is rejected at the schema
        boundary instead of failing later in the database layer.
        """
        if value is None:
            raise ValueError("Title must not be null")
        return value

    description: str | None = Field(
        default=None,
        max_length=5000,
        description="Optional description of the task",
        examples=["Milk, eggs, bread, butter"],
    )
    priority: Priority | None = Field(
        default=None,
        description="Task priority: low, medium, or high",
        examples=["medium"],
    )
    completed: bool | None = Field(
        default=None,
        description="Whether the task is completed",
    )

    @field_validator("priority", "completed")
    @classmethod
    def reject_null_non_nullable_fields(cls, value, info):
        """Reject explicit JSON null for priority/completed.

        Both map to NOT NULL columns. Omitting the field means "no change";
        an explicit null passes the ``X | None`` annotation but would fail
        at the database layer as an unhandled 500, so it is rejected here
        as a 422 — the same rule ``title`` already follows.
        """
        if value is None:
            raise ValueError(f"{info.field_name} must not be null")
        return value


class TaskResponse(BaseModel):
    """Schema for task responses."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    priority: Priority
    completed: bool
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    """Schema for paginated task list responses."""

    tasks: list[TaskResponse]
    total: int


class TaskStatsResponse(BaseModel):
    """Schema for task statistics responses."""

    total: int
    completed: int
    pending: int
    high: int
    medium: int
    low: int


class ErrorResponse(BaseModel):
    """Schema for error responses."""

    detail: str
