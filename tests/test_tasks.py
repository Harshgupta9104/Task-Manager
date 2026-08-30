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
