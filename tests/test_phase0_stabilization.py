"""Tests for Phase 0.7–0.9.

- 0.7: deterministic ordering (created_at DESC, id DESC) incl. pagination
- 0.8: task title validation (trim + reject whitespace-only/null)
- 0.9: typed /stats response contract
- Canary documenting the DB-level priority enforcement gap (no migration
  is permitted in Phase 0, so the gap is pinned by a test instead).
"""

from datetime import datetime, timedelta, timezone

import pytest

from app.models import Task
from app.schemas import TaskStatsResponse
from app.services import get_task_stats


# ─── Helpers ────────────────────────────────────────────────────────


def create_task_via_db(
    db_session,
    title: str,
    *,
    created_at: datetime | None = None,
    priority: str = "medium",
    completed: bool = False,
) -> Task:
    """Insert a task directly so tests can control created_at exactly."""
    task = Task(
        title=title,
        priority=priority,
        completed=completed,
        created_at=created_at or datetime.now(timezone.utc),
    )
    db_session.add(task)
    db_session.commit()
    return task


# ─── Phase 0.7: Deterministic ordering ──────────────────────────────


class TestDeterministicOrdering:
    """GET /api/v1/tasks/ must order by created_at DESC, id DESC."""

    def test_newest_tasks_first(self, client, db_session):
        base = datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        create_task_via_db(db_session, "Old task", created_at=base)
        create_task_via_db(db_session, "Middle task", created_at=base + timedelta(hours=1))
        create_task_via_db(db_session, "New task", created_at=base + timedelta(hours=2))

        response = client.get("/api/v1/tasks/")
        titles = [t["title"] for t in response.json()["tasks"]]
        assert titles == ["New task", "Middle task", "Old task"]

    def test_same_created_at_breaks_tie_by_higher_id(self, client, db_session):
        same_ts = datetime(2026, 3, 3, 9, 30, 0, tzinfo=timezone.utc)
        first = create_task_via_db(db_session, "First created", created_at=same_ts)
        second = create_task_via_db(db_session, "Second created", created_at=same_ts)
        assert second.id > first.id  # sanity: ids differ, timestamps tie

        response = client.get("/api/v1/tasks/")
        titles = [t["title"] for t in response.json()["tasks"]]
        assert titles == ["Second created", "First created"]

    def test_pagination_is_stable_with_ordering(self, client, db_session):
        base = datetime(2026, 5, 5, 8, 0, 0, tzinfo=timezone.utc)
        for i in range(7):
            create_task_via_db(db_session, f"Task {i}", created_at=base + timedelta(minutes=i))

        full = client.get("/api/v1/tasks/?limit=100").json()["tasks"]
        expected_ids = [t["id"] for t in full]
        # Insert order == created_at order here, so newest-first is id DESC.
        assert expected_ids == sorted(expected_ids, reverse=True)

        paged_ids: list[int] = []
        for skip in (0, 3, 6):
            data = client.get(f"/api/v1/tasks/?skip={skip}&limit=3").json()
            assert data["total"] == 7
            paged_ids.extend(t["id"] for t in data["tasks"])

        # Pages cover every task exactly once, in the same stable order.
        assert paged_ids == expected_ids

    def test_ordering_applies_to_filtered_lists(self, client, db_session):
        base = datetime(2026, 6, 6, 10, 0, 0, tzinfo=timezone.utc)
        create_task_via_db(db_session, "Low old", created_at=base, priority="low")
        create_task_via_db(
            db_session, "Low new", created_at=base + timedelta(hours=1), priority="low"
        )
        create_task_via_db(
            db_session, "Low newest", created_at=base + timedelta(hours=2), priority="low"
        )

        response = client.get("/api/v1/tasks/?priority=low")
        titles = [t["title"] for t in response.json()["tasks"]]
        assert titles == ["Low newest", "Low new", "Low old"]


# ─── Phase 0.8: Title validation ────────────────────────────────────


class TestTitleValidation:
    """Titles must be non-empty after trimming, on create and update."""

    @pytest.mark.parametrize("title", ["", " ", "    ", "\t", "\n"])
    def test_create_rejects_whitespace_only_title(self, client, title):
        response = client.post("/api/v1/tasks/", json={"title": title})
        assert response.status_code == 422

    @pytest.mark.parametrize("title", ["", " ", "    ", "\t", "\n"])
    def test_update_rejects_whitespace_only_title(self, client, title):
        task_id = client.post("/api/v1/tasks/", json={"title": "Valid"}).json()["id"]

        response = client.put(f"/api/v1/tasks/{task_id}", json={"title": title})
        assert response.status_code == 422
        # A rejected update must leave the existing task untouched.
        assert client.get(f"/api/v1/tasks/{task_id}").json()["title"] == "Valid"

    def test_update_rejects_null_title(self, client):
        task_id = client.post("/api/v1/tasks/", json={"title": "Valid"}).json()["id"]

        response = client.put(f"/api/v1/tasks/{task_id}", json={"title": None})
        assert response.status_code == 422
        assert client.get(f"/api/v1/tasks/{task_id}").json()["title"] == "Valid"

    def test_update_omitted_title_means_no_change(self, client):
        task_id = client.post("/api/v1/tasks/", json={"title": "Keep me"}).json()["id"]

        response = client.put(f"/api/v1/tasks/{task_id}", json={"completed": True})
        assert response.status_code == 200
        assert response.json()["title"] == "Keep me"

    @pytest.mark.parametrize(
        "title", ["Buy groceries", "Meeting with client", " A valid title "]
    )
    def test_valid_titles_accepted(self, client, title):
        response = client.post("/api/v1/tasks/", json={"title": title})
        assert response.status_code == 201

    def test_create_trims_surrounding_whitespace(self, client):
        response = client.post(
            "/api/v1/tasks/", json={"title": "   Buy groceries   "}
        )
        assert response.status_code == 201
        assert response.json()["title"] == "Buy groceries"

    def test_update_trims_surrounding_whitespace(self, client):
        task_id = client.post("/api/v1/tasks/", json={"title": "Before"}).json()["id"]

        response = client.put(f"/api/v1/tasks/{task_id}", json={"title": "  After  "})
        assert response.status_code == 200
        assert response.json()["title"] == "After"


# ─── Phase 0.9: Typed stats response ────────────────────────────────


class TestTypedStatsResponse:
    def test_stats_response_exact_shape(self, client):
        client.post(
            "/api/v1/tasks/",
            json={"title": "A", "priority": "high", "completed": True},
        )
        client.post("/api/v1/tasks/", json={"title": "B", "priority": "low"})

        data = client.get("/api/v1/tasks/stats").json()
        assert set(data) == {"total", "completed", "pending", "high", "medium", "low"}
        assert data == {
            "total": 2,
            "completed": 1,
            "pending": 1,
            "high": 1,
            "medium": 0,
            "low": 1,
        }

    def test_stats_openapi_declares_response_model(self, client):
        """The generated API docs must expose the typed response model."""
        openapi = client.get("/openapi.json").json()
        stats_schema = openapi["paths"]["/api/v1/tasks/stats"]["get"]["responses"]["200"][
            "content"
        ]["application/json"]["schema"]
        assert stats_schema == {"$ref": "#/components/schemas/TaskStatsResponse"}

    def test_stats_service_returns_typed_response(self, db_session):
        result = get_task_stats(db_session)
        assert isinstance(result, TaskStatsResponse)

    def test_stats_service_empty_database(self, db_session):
        result = get_task_stats(db_session)
        assert result.model_dump() == {
            "total": 0,
            "completed": 0,
            "pending": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
        }


# ─── Priority DB-level gap (documented, not fixed in Phase 0) ───────


class TestPriorityDbLevelGap:
    def test_db_accepts_invalid_priority_canary(self, db_session):
        """Canary documenting the known Phase 0 gap: no DB-level CHECK.

        Priority is enforced only at the Pydantic boundary; the column is
        a plain VARCHAR, so a direct DB write can persist an arbitrary
        value. Phase 0 forbids schema changes, so the CHECK constraint
        (or sa.Enum(Priority)) must come with future migration work.
        When that migration lands, this test will fail — replace it with
        an assertion that the database rejects the invalid value.
        """
        db_session.add(Task(title="raw insert", priority="urgent"))
        db_session.commit()

        stored = db_session.query(Task).filter(Task.title == "raw insert").one()
        assert stored.priority == "urgent"  # gap: DB accepted an invalid value
