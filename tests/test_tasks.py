"""Tests for Task CRUD endpoints."""

import pytest


# ─── Health Endpoints ───────────────────────────────────────────────


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    def test_health_check(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "app" in data
        assert "version" in data

    def test_health_detail(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "debug" in data


# ─── POST /tasks ────────────────────────────────────────────────────


class TestCreateTask:
    """Tests for POST /api/v1/tasks/"""

    def test_create_task_success(self, client):
        payload = {
            "title": "Buy groceries",
            "description": "Milk, eggs, bread",
            "completed": False,
        }
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Buy groceries"
        assert data["description"] == "Milk, eggs, bread"
        assert data["completed"] is False
        assert data["id"] is not None
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_task_minimal(self, client):
        payload = {"title": "Simple task"}
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Simple task"
        assert data["description"] is None
        assert data["completed"] is False

    def test_create_task_completed(self, client):
        payload = {"title": "Done task", "completed": True}
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["completed"] is True

    def test_create_task_missing_title(self, client):
        payload = {"description": "No title provided"}
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 422

    def test_create_task_empty_title(self, client):
        payload = {"title": ""}
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 422

    def test_create_task_title_too_long(self, client):
        payload = {"title": "x" * 256}
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 422

    def test_create_task_priority_low(self, client):
        payload = {"title": "Low priority task", "priority": "low"}
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["priority"] == "low"

        # Verify persistence
        get_resp = client.get(f"/api/v1/tasks/{data['id']}")
        assert get_resp.status_code == 200
        assert get_resp.json()["priority"] == "low"

    def test_create_task_priority_medium(self, client):
        payload = {"title": "Medium priority task", "priority": "medium"}
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["priority"] == "medium"

        get_resp = client.get(f"/api/v1/tasks/{data['id']}")
        assert get_resp.status_code == 200
        assert get_resp.json()["priority"] == "medium"

    def test_create_task_priority_high(self, client):
        payload = {"title": "High priority task", "priority": "high"}
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["priority"] == "high"

        get_resp = client.get(f"/api/v1/tasks/{data['id']}")
        assert get_resp.status_code == 200
        assert get_resp.json()["priority"] == "high"

    def test_create_task_priority_default(self, client):
        payload = {"title": "Default priority task"}
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["priority"] == "medium"


# ─── Priority Validation ────────────────────────────────────────────


class TestPriorityValidation:
    """Tests for priority filter validation."""

    def test_invalid_priority_query_returns_422(self, client):
        response = client.get("/api/v1/tasks/?priority=urgent")
        assert response.status_code == 422

    def test_invalid_priority_critical_returns_422(self, client):
        response = client.get("/api/v1/tasks/?priority=critical")
        assert response.status_code == 422

    def test_invalid_priority_foo_returns_422(self, client):
        response = client.get("/api/v1/tasks/?priority=foo")
        assert response.status_code == 422

    def test_valid_priority_low(self, client):
        response = client.get("/api/v1/tasks/?priority=low")
        assert response.status_code == 200

    def test_valid_priority_medium(self, client):
        response = client.get("/api/v1/tasks/?priority=medium")
        assert response.status_code == 200

    def test_valid_priority_high(self, client):
        response = client.get("/api/v1/tasks/?priority=high")
        assert response.status_code == 200

    def test_invalid_priority_in_create_returns_422(self, client):
        payload = {"title": "Bad priority", "priority": "urgent"}
        response = client.post("/api/v1/tasks/", json=payload)
        assert response.status_code == 422

    def test_invalid_priority_in_update_returns_422(self, client):
        # Create a valid task first
        create_resp = client.post("/api/v1/tasks/", json={"title": "Task"})
        task_id = create_resp.json()["id"]

        response = client.put(
            f"/api/v1/tasks/{task_id}", json={"priority": "critical"}
        )
        assert response.status_code == 422


# ─── Search ─────────────────────────────────────────────────────────


class TestSearch:
    """Tests for GET /api/v1/tasks/?search=..."""

    def test_search_by_title(self, client):
        client.post("/api/v1/tasks/", json={"title": "Buy groceries"})
        client.post("/api/v1/tasks/", json={"title": "Clean house"})
        client.post("/api/v1/tasks/", json={"title": "Walk the dog"})

        response = client.get("/api/v1/tasks/?search=groceries")
        data = response.json()
        assert data["total"] == 1
        assert data["tasks"][0]["title"] == "Buy groceries"

    def test_search_by_description(self, client):
        client.post(
            "/api/v1/tasks/",
            json={"title": "Shopping", "description": "Buy milk and eggs"},
        )
        client.post(
            "/api/v1/tasks/",
            json={"title": "Cooking", "description": "Make pasta dinner"},
        )

        response = client.get("/api/v1/tasks/?search=milk")
        data = response.json()
        assert data["total"] == 1
        assert data["tasks"][0]["title"] == "Shopping"

    def test_search_case_insensitive(self, client):
        client.post("/api/v1/tasks/", json={"title": "Buy Groceries"})

        response = client.get("/api/v1/tasks/?search=groceries")
        data = response.json()
        assert data["total"] == 1

        response = client.get("/api/v1/tasks/?search=GROCERIES")
        data = response.json()
        assert data["total"] == 1

        response = client.get("/api/v1/tasks/?search=GrOcErIeS")
        data = response.json()
        assert data["total"] == 1

    def test_search_partial_match(self, client):
        client.post("/api/v1/tasks/", json={"title": "Buy groceries"})

        response = client.get("/api/v1/tasks/?search=groc")
        data = response.json()
        assert data["total"] == 1

        response = client.get("/api/v1/tasks/?search=buy")
        data = response.json()
        assert data["total"] == 1

    def test_search_no_results(self, client):
        client.post("/api/v1/tasks/", json={"title": "Buy groceries"})

        response = client.get("/api/v1/tasks/?search=nonexistent")
        data = response.json()
        assert data["total"] == 0
        assert data["tasks"] == []

    def test_search_across_multiple_pages(self, client):
        # Create 15 tasks where 5 match
        for i in range(10):
            client.post("/api/v1/tasks/", json={"title": f"Task {i}"})
        for i in range(5):
            client.post(
                "/api/v1/tasks/", json={"title": f"Important item {i}"}
            )

        # Search for "Important" — should match 5 tasks
        response = client.get("/api/v1/tasks/?search=Important&skip=0&limit=3")
        data = response.json()
        assert data["total"] == 5
        assert len(data["tasks"]) == 3

        # Get page 2
        response = client.get("/api/v1/tasks/?search=Important&skip=3&limit=3")
        data = response.json()
        assert data["total"] == 5
        assert len(data["tasks"]) == 2

    def test_search_with_priority_filter(self, client):
        client.post(
            "/api/v1/tasks/",
            json={"title": "Important high", "priority": "high"},
        )
        client.post(
            "/api/v1/tasks/",
            json={"title": "Important low", "priority": "low"},
        )
        client.post(
            "/api/v1/tasks/",
            json={"title": "Other high", "priority": "high"},
        )

        response = client.get(
            "/api/v1/tasks/?search=Important&priority=high"
        )
        data = response.json()
        assert data["total"] == 1
        assert data["tasks"][0]["title"] == "Important high"

    def test_search_with_completion_filter(self, client):
        client.post(
            "/api/v1/tasks/",
            json={"title": "Important done", "completed": True},
        )
        client.post(
            "/api/v1/tasks/",
            json={"title": "Important pending", "completed": False},
        )

        response = client.get(
            "/api/v1/tasks/?search=Important&completed=false"
        )
        data = response.json()
        assert data["total"] == 1
        assert data["tasks"][0]["title"] == "Important pending"

    def test_search_total_represents_all_matches(self, client):
        for i in range(25):
            client.post(
                "/api/v1/tasks/",
                json={"title": f"Match task {i}", "priority": "high"},
            )
        for i in range(10):
            client.post(
                "/api/v1/tasks/",
                json={"title": f"Other task {i}", "priority": "low"},
            )

        response = client.get(
            "/api/v1/tasks/?search=Match&limit=10"
        )
        data = response.json()
        assert data["total"] == 25
        assert len(data["tasks"]) == 10

    def test_empty_search_is_no_filter(self, client):
        client.post("/api/v1/tasks/", json={"title": "Task 1"})

        response = client.get("/api/v1/tasks/?search=")
        data = response.json()
        assert data["total"] == 1

        response = client.get("/api/v1/tasks/?search=   ")
        data = response.json()
        assert data["total"] == 1


# ─── GET /tasks (list) ─────────────────────────────────────────────


class TestListTasks:
    """Tests for GET /api/v1/tasks/"""

    def test_list_tasks_empty(self, client):
        response = client.get("/api/v1/tasks/")
        assert response.status_code == 200
        data = response.json()
        assert data["tasks"] == []
        assert data["total"] == 0

    def test_list_tasks_with_data(self, client):
        # Create some tasks
        client.post("/api/v1/tasks/", json={"title": "Task 1"})
        client.post("/api/v1/tasks/", json={"title": "Task 2"})
        client.post("/api/v1/tasks/", json={"title": "Task 3"})

        response = client.get("/api/v1/tasks/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 3
        assert data["total"] == 3

    def test_list_tasks_pagination(self, client):
        # Create 5 tasks
        for i in range(5):
            client.post("/api/v1/tasks/", json={"title": f"Task {i}"})

        # Get first 2
        response = client.get("/api/v1/tasks/?skip=0&limit=2")
        data = response.json()
        assert len(data["tasks"]) == 2
        assert data["total"] == 5

        # Get next 2
        response = client.get("/api/v1/tasks/?skip=2&limit=2")
        data = response.json()
        assert len(data["tasks"]) == 2
        assert data["total"] == 5

    def test_list_tasks_filter_completed(self, client):
        client.post("/api/v1/tasks/", json={"title": "Pending", "completed": False})
        client.post("/api/v1/tasks/", json={"title": "Done", "completed": True})

        response = client.get("/api/v1/tasks/?completed=true")
        data = response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["title"] == "Done"

        response = client.get("/api/v1/tasks/?completed=false")
        data = response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["title"] == "Pending"

    def test_list_tasks_filter_priority(self, client):
        client.post("/api/v1/tasks/", json={"title": "Low task", "priority": "low"})
        client.post("/api/v1/tasks/", json={"title": "Medium task", "priority": "medium"})
        client.post("/api/v1/tasks/", json={"title": "High task", "priority": "high"})

        response = client.get("/api/v1/tasks/?priority=low")
        data = response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["priority"] == "low"

        response = client.get("/api/v1/tasks/?priority=medium")
        data = response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["priority"] == "medium"

        response = client.get("/api/v1/tasks/?priority=high")
        data = response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["priority"] == "high"

    def test_list_tasks_ordering(self, client):
        client.post("/api/v1/tasks/", json={"title": "First"})
        client.post("/api/v1/tasks/", json={"title": "Second"})
        client.post("/api/v1/tasks/", json={"title": "Third"})

        response = client.get("/api/v1/tasks/")
        data = response.json()
        # Should be in descending order by created_at
        assert data["tasks"][0]["title"] == "Third"
        assert data["tasks"][1]["title"] == "Second"
        assert data["tasks"][2]["title"] == "First"

    def test_filter_before_pagination(self, client):
        """Verify that filtering happens before pagination."""
        # Create 5 low, 5 high
        for i in range(5):
            client.post(
                "/api/v1/tasks/", json={"title": f"Low {i}", "priority": "low"}
            )
        for i in range(5):
            client.post(
                "/api/v1/tasks/", json={"title": f"High {i}", "priority": "high"}
            )

        # Request limit=3 but only high priority
        response = client.get("/api/v1/tasks/?priority=high&limit=3")
        data = response.json()
        assert data["total"] == 5
        assert len(data["tasks"]) == 3


# ─── GET /tasks/{id} ───────────────────────────────────────────────


class TestGetTask:
    """Tests for GET /api/v1/tasks/{id}"""

    def test_get_task_success(self, client):
        # Create a task first
        create_resp = client.post(
            "/api/v1/tasks/", json={"title": "Get me"}
        )
        task_id = create_resp.json()["id"]

        response = client.get(f"/api/v1/tasks/{task_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Get me"
        assert data["id"] == task_id

    def test_get_task_not_found(self, client):
        response = client.get("/api/v1/tasks/9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


# ─── PUT /tasks/{id} ───────────────────────────────────────────────


class TestUpdateTask:
    """Tests for PUT /api/v1/tasks/{id}"""

    def test_update_task_success(self, client):
        # Create a task
        create_resp = client.post(
            "/api/v1/tasks/",
            json={"title": "Original", "description": "Old desc", "completed": False},
        )
        task_id = create_resp.json()["id"]

        # Update it
        update_payload = {"title": "Updated", "completed": True}
        response = client.put(f"/api/v1/tasks/{task_id}", json=update_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated"
        assert data["completed"] is True
        assert data["description"] == "Old desc"  # Unchanged field

    def test_update_task_partial(self, client):
        # Create a task
        create_resp = client.post(
            "/api/v1/tasks/",
            json={"title": "Partial", "description": "Keep me"},
        )
        task_id = create_resp.json()["id"]

        # Update only title
        response = client.put(f"/api/v1/tasks/{task_id}", json={"title": "New Title"})
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title"
        assert data["description"] == "Keep me"

    def test_update_task_not_found(self, client):
        response = client.put(
            "/api/v1/tasks/9999", json={"title": "Ghost task"}
        )
        assert response.status_code == 404

    def test_update_task_empty_body(self, client):
        # Create a task
        create_resp = client.post(
            "/api/v1/tasks/", json={"title": "No change"}
        )
        task_id = create_resp.json()["id"]

        # Update with empty body (should still succeed, no changes)
        response = client.put(f"/api/v1/tasks/{task_id}", json={})
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "No change"

    def test_update_task_priority(self, client):
        create_resp = client.post(
            "/api/v1/tasks/", json={"title": "Priority update", "priority": "low"}
        )
        task_id = create_resp.json()["id"]

        response = client.put(
            f"/api/v1/tasks/{task_id}", json={"priority": "high"}
        )
        assert response.status_code == 200
        assert response.json()["priority"] == "high"


# ─── DELETE /tasks/{id} ─────────────────────────────────────────────


class TestDeleteTask:
    """Tests for DELETE /api/v1/tasks/{id}"""

    def test_delete_task_success(self, client):
        # Create a task
        create_resp = client.post(
            "/api/v1/tasks/", json={"title": "Delete me"}
        )
        task_id = create_resp.json()["id"]

        # Delete it
        response = client.delete(f"/api/v1/tasks/{task_id}")
        assert response.status_code == 204

        # Verify it's gone
        get_resp = client.get(f"/api/v1/tasks/{task_id}")
        assert get_resp.status_code == 404

    def test_delete_task_not_found(self, client):
        response = client.delete("/api/v1/tasks/9999")
        assert response.status_code == 404

    def test_delete_task_twice(self, client):
        # Create a task
        create_resp = client.post(
            "/api/v1/tasks/", json={"title": "Double delete"}
        )
        task_id = create_resp.json()["id"]

        # First delete succeeds
        response = client.delete(f"/api/v1/tasks/{task_id}")
        assert response.status_code == 204

        # Second delete returns 404
        response = client.delete(f"/api/v1/tasks/{task_id}")
        assert response.status_code == 404


# ─── Stats ──────────────────────────────────────────────────────────


class TestTaskStats:
    """Tests for GET /api/v1/tasks/stats"""

    def test_stats_empty(self, client):
        response = client.get("/api/v1/tasks/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["completed"] == 0
        assert data["pending"] == 0

    def test_stats_with_tasks(self, client):
        client.post("/api/v1/tasks/", json={"title": "Pending 1", "completed": False})
        client.post("/api/v1/tasks/", json={"title": "Pending 2", "completed": False})
        client.post("/api/v1/tasks/", json={"title": "Done", "completed": True})

        response = client.get("/api/v1/tasks/stats")
        data = response.json()
        assert data["total"] == 3
        assert data["completed"] == 1
        assert data["pending"] == 2


# ─── Full CRUD Lifecycle ────────────────────────────────────────────


class TestFullCRUDLifecycle:
    """Integration test: full create → read → update → delete flow."""

    def test_full_lifecycle(self, client):
        # 1. Create
        create_resp = client.post(
            "/api/v1/tasks/",
            json={
                "title": "Lifecycle task",
                "description": "Test full CRUD",
                "completed": False,
            },
        )
        assert create_resp.status_code == 201
        task = create_resp.json()
        task_id = task["id"]

        # 2. Read
        read_resp = client.get(f"/api/v1/tasks/{task_id}")
        assert read_resp.status_code == 200
        assert read_resp.json()["title"] == "Lifecycle task"

        # 3. Update
        update_resp = client.put(
            f"/api/v1/tasks/{task_id}",
            json={"title": "Updated lifecycle", "completed": True},
        )
        assert update_resp.status_code == 200
        updated = update_resp.json()
        assert updated["title"] == "Updated lifecycle"
        assert updated["completed"] is True

        # 4. Verify in list
        list_resp = client.get("/api/v1/tasks/")
        assert list_resp.status_code == 200
        assert list_resp.json()["total"] == 1

        # 5. Delete
        del_resp = client.delete(f"/api/v1/tasks/{task_id}")
        assert del_resp.status_code == 204

        # 6. Confirm deletion
        get_after_del = client.get(f"/api/v1/tasks/{task_id}")
        assert get_after_del.status_code == 404

        # 7. Confirm empty list
        list_after_del = client.get("/api/v1/tasks/")
        assert list_after_del.json()["total"] == 0
