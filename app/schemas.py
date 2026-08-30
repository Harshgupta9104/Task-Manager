"""Pydantic schemas for request validation and response serialization."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="The title of the task",
        examples=["Buy groceries"],
    )
    description: str | None = Field(
        default=None,
        max_length=5000,
        description="Optional description of the task",
        examples=["Milk, eggs, bread, butter"],
    )
    completed: bool = Field(
        default=False,
        description="Whether the task is completed",
    )


class TaskUpdate(BaseModel):
    """Schema for updating an existing task. All fields are optional."""

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="The title of the task",
        examples=["Buy groceries"],
    )
    description: str | None = Field(
        default=None,
        max_length=5000,
        description="Optional description of the task",
        examples=["Milk, eggs, bread, butter"],
    )
    completed: bool | None = Field(
        default=None,
        description="Whether the task is completed",
    )


class TaskResponse(BaseModel):
    """Schema for task responses."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    """Schema for paginated task list responses."""

    tasks: list[TaskResponse]
    total: int


class ErrorResponse(BaseModel):
    """Schema for error responses."""

    detail: str
