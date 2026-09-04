"""Business logic and CRUD operations for tasks."""

from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Task
from app.schemas import Priority, TaskCreate, TaskUpdate


def create_task(db: Session, task_data: TaskCreate) -> Task:
    """Create a new task."""
    db_task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        completed=task_data.completed,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def get_task(db: Session, task_id: int) -> Task | None:
    """Get a single task by ID."""
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    completed: bool | None = None,
    priority: Priority | None = None,
    search: str | None = None,
) -> tuple[list[Task], int]:
    """Get a list of tasks with pagination and optional filtering."""
    query = db.query(Task)

    # 1. Search
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            Task.title.ilike(term) | Task.description.ilike(term)
        )

    # 2. Completion filter
    if completed is not None:
        query = query.filter(Task.completed == completed)

    # 3. Priority filter
    if priority is not None:
        query = query.filter(Task.priority == priority)

    # 4. Total matching
    total = query.count()

    # 5. Order and paginate
    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()

    return tasks, total


def update_task(db: Session, task_id: int, task_data: TaskUpdate) -> Task | None:
    """Update an existing task. Only updates fields that are explicitly set."""
    db_task = get_task(db, task_id)
    if db_task is None:
        return None

    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    db_task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    """Delete a task by ID. Returns True if deleted, False if not found."""
    db_task = get_task(db, task_id)
    if db_task is None:
        return False

    db.delete(db_task)
    db.commit()
    return True


def get_task_stats(db: Session) -> dict:
    """Get task statistics (total, completed, pending, by priority)."""
    total = db.query(func.count(Task.id)).scalar() or 0
    completed = db.query(func.count(Task.id)).filter(Task.completed == True).scalar() or 0  # noqa: E712
    pending = total - completed
    high = db.query(func.count(Task.id)).filter(Task.priority == "high").scalar() or 0
    medium = db.query(func.count(Task.id)).filter(Task.priority == "medium").scalar() or 0
    low = db.query(func.count(Task.id)).filter(Task.priority == "low").scalar() or 0
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "high": high,
        "medium": medium,
        "low": low,
    }
