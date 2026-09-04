"""Task CRUD API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.enums import Priority
from app.schemas import (
    ErrorResponse,
    TaskCreate,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
)
from app.services import (
    create_task,
    delete_task,
    get_task,
    get_task_stats,
    get_tasks,
    update_task,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    responses={
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
def create_new_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """Create a new task with the provided details."""
    task = create_task(db=db, task_data=task_data)
    return TaskResponse.model_validate(task)


@router.get(
    "/",
    response_model=TaskListResponse,
    summary="List all tasks",
)
def list_tasks(
    skip: int = Query(default=0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(default=100, ge=1, le=500, description="Max tasks to return"),
    completed: bool | None = Query(
        default=None,
        description="Filter by completion status",
    ),
    priority: Priority | None = Query(
        default=None,
        description="Filter by priority (low, medium, high)",
    ),
    search: str | None = Query(
        default=None,
        description="Search tasks by title or description",
    ),
    db: Session = Depends(get_db),
) -> TaskListResponse:
    """Get a paginated list of tasks with optional filtering."""
    tasks, total = get_tasks(db=db, skip=skip, limit=limit, completed=completed, priority=priority, search=search)
    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t) for t in tasks],
        total=total,
    )


@router.get(
    "/stats",
    summary="Get task statistics",
)
def task_stats(db: Session = Depends(get_db)) -> dict:
    """Get statistics about tasks (total, completed, pending)."""
    return get_task_stats(db=db)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get a specific task",
    responses={
        404: {"model": ErrorResponse, "description": "Task not found"},
    },
)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """Retrieve a single task by its ID."""
    task = get_task(db=db, task_id=task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )
    return TaskResponse.model_validate(task)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
    responses={
        404: {"model": ErrorResponse, "description": "Task not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
def update_existing_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """Update an existing task. Only provided fields are updated."""
    task = update_task(db=db, task_id=task_id, task_data=task_data)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )
    return TaskResponse.model_validate(task)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
    responses={
        404: {"model": ErrorResponse, "description": "Task not found"},
    },
)
def delete_existing_task(
    task_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete a task by its ID."""
    deleted = delete_task(db=db, task_id=task_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )
