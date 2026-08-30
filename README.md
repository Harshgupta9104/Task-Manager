# 📋 Task Management API

A production-ready RESTful API for managing tasks, built with **FastAPI**, **SQLAlchemy**, and **SQLite**. Features full CRUD operations, pagination, filtering, task statistics, and auto-generated API documentation.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running the API](#-running-the-api)
  - [Development Server](#development-server)
  - [Production Server](#production-server)
- [API Endpoints](#-api-endpoints)
  - [Health Check](#health-check)
  - [Task Operations](#task-operations)
- [Request & Response Examples](#-request--response-examples)
  - [Create a Task](#create-a-task)
  - [List Tasks](#list-tasks)
  - [Get a Task](#get-a-task)
  - [Update a Task](#update-a-task)
  - [Delete a Task](#delete-a-task)
  - [Task Statistics](#task-statistics)
- [Data Models](#-data-models)
  - [Task Schema](#task-schema)
  - [Request Schemas](#request-schemas)
  - [Response Schemas](#response-schemas)
- [Testing](#-testing)
- [Architecture](#-architecture)
- [License](#-license)

---

## ✨ Features

- **Full CRUD Operations** — Create, read, update, and delete tasks with ease
- **Pagination & Filtering** — Paginate results and filter by completion status
- **Task Statistics** — Get counts of total, completed, and pending tasks
- **Request Validation** — Pydantic-powered validation with detailed error messages
- **SQLite Database** — Zero-config database; no external setup required
- **Auto-Generated Docs** — Swagger UI and ReDoc available out of the box
- **CORS Support** — Configurable cross-origin resource sharing
- **Environment Configuration** — Settings via `.env` files using Pydantic Settings
- **Comprehensive Tests** — Full test suite covering all endpoints and edge cases
- **Clean Architecture** — Separated concerns: routers, services, models, and schemas

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | Async web framework |
| [SQLAlchemy](https://www.sqlalchemy.org/) | ORM and database toolkit |
| [SQLite](https://www.sqlite.org/) | Lightweight, embedded database |
| [Pydantic](https://docs.pydantic.dev/) | Data validation and serialization |
| [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) | Environment variable management |
| [Uvicorn](https://www.uvicorn.org/) | ASGI server |
| [Pytest](https://docs.pytest.org/) | Testing framework |
| [HTTPX](https://www.python-httpx.org/) | Async HTTP client (used in tests) |

---

## 📁 Project Structure

```
.
├── app/
│   ├── __init__.py          # Package init
│   ├── main.py              # FastAPI application entry point & middleware
│   ├── config.py            # Environment variable configuration
│   ├── database.py          # SQLAlchemy engine, session, and Base class
│   ├── models.py            # SQLAlchemy ORM models (Task)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── services.py          # Business logic and CRUD operations
│   └── routers/
│       ├── __init__.py      # Package init
│       └── tasks.py         # Task API endpoint definitions
├── tests/
│   ├── __init__.py          # Package init
│   ├── conftest.py          # Pytest fixtures (test DB, client)
│   └── test_tasks.py        # Endpoint tests (health, CRUD, stats)
├── requirements.txt         # Python dependencies
└── README.md                # This file
```

### Key Files Explained

| File | Description |
|---|---|
| `app/main.py` | App initialization, CORS middleware, router registration, and health endpoints. Creates database tables on startup via lifespan. |
| `app/config.py` | Loads settings from environment variables and `.env` files using `pydantic-settings`. |
| `app/database.py` | Creates the SQLAlchemy engine and `SessionLocal` factory. Provides the `get_db` dependency for FastAPI. |
| `app/models.py` | Defines the `Task` ORM model with fields: `id`, `title`, `description`, `completed`, `created_at`, `updated_at`. |
| `app/schemas.py` | Pydantic schemas for request validation (`TaskCreate`, `TaskUpdate`) and response serialization (`TaskResponse`, `TaskListResponse`). |
| `app/services.py` | Pure business logic layer — all database interactions for tasks: create, get, list, update, delete, and stats. |
| `app/routers/tasks.py` | FastAPI router defining all `/api/v1/tasks/` endpoints with proper HTTP methods, status codes, and documentation. |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** (uses `X | Y` union syntax and `Mapped` type annotations)
- **pip** (Python package manager)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

2. **Create and activate a virtual environment:**

   ```bash
   python -m venv venv

   # On macOS/Linux
   source venv/bin/activate

   # On Windows
   venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **(Optional) Create a `.env` file for custom configuration:**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file to customize your settings (see [Environment Variables](#environment-variables)).

> **Note:** The SQLite database file (`task_manager.db`) is created automatically on first run.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | `Task Management API` | Application display name |
| `APP_VERSION` | `1.0.0` | Application version string |
| `DEBUG` | `false` | Enable debug mode |
| `DATABASE_URL` | `sqlite:///./task_manager.db` | SQLAlchemy database connection URL |
| `ALLOWED_ORIGINS` | `["*"]` | Comma-separated list of allowed CORS origins |

Example `.env` file:

```env
APP_NAME=My Task Manager
APP_VERSION=2.0.0
DEBUG=true
DATABASE_URL=sqlite:///./my_tasks.db
ALLOWED_ORIGINS=["http://localhost:3000","https://myapp.com"]
```

---

## ▶️ Running the API

### Development Server

With auto-reload enabled (recommended for development):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Once running, access the API at:

| URL | Description |
|---|---|
| http://localhost:8000 | API base URL |
| http://localhost:8000/docs | **Swagger UI** — interactive API explorer |
| http://localhost:8000/redoc | **ReDoc** — readable API documentation |
| http://localhost:8000/health | Detailed health check |

### Production Server

Run with multiple worker processes:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 📡 API Endpoints

### Health Check

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/` | Basic health check | `{"status": "healthy", "app": "...", "version": "..."}` |
| `GET` | `/health` | Detailed health check (includes `debug` flag) | `{"status": "healthy", "app": "...", "version": "...", "debug": false}` |

### Task Operations

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/v1/tasks/` | Create a new task | `201`, `422` |
| `GET` | `/api/v1/tasks/` | List tasks (paginated, filterable) | `200` |
| `GET` | `/api/v1/tasks/stats` | Get task statistics | `200` |
| `GET` | `/api/v1/tasks/{id}` | Get a specific task by ID | `200`, `404` |
| `PUT` | `/api/v1/tasks/{id}` | Update a task (partial updates supported) | `200`, `404`, `422` |
| `DELETE` | `/api/v1/tasks/{id}` | Delete a task | `204`, `404` |

#### Query Parameters for `GET /api/v1/tasks/`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `skip` | `int` | `0` | Number of tasks to skip (for pagination) |
| `limit` | `int` | `100` | Maximum number of tasks to return (max: 500) |
| `completed` | `bool \| null` | `null` | Filter by completion status (`true` or `false`) |

---

## 📨 Request & Response Examples

### Create a Task

**Request:**

```bash
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread, butter",
    "completed": false
  }'
```

**Response `201 Created`:**

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, butter",
  "completed": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Minimal Request (only title required):**

```bash
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Quick task"}'
```

---

### List Tasks

**Request:**

```bash
curl "http://localhost:8000/api/v1/tasks/?skip=0&limit=10&completed=false"
```

**Response `200 OK`:**

```json
{
  "tasks": [
    {
      "id": 2,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread, butter",
      "completed": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

> **Note:** Tasks are returned in descending order by `created_at` (newest first).

---

### Get a Task

**Request:**

```bash
curl http://localhost:8000/api/v1/tasks/1
```

**Response `200 OK`:**

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, butter",
  "completed": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Response `404 Not Found`:**

```json
{
  "detail": "Task with id 1 not found"
}
```

---

### Update a Task

**Request (partial update — only send fields you want to change):**

```bash
curl -X PUT http://localhost:8000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Response `200 OK`:**

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, butter",
  "completed": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

---

### Delete a Task

**Request:**

```bash
curl -X DELETE http://localhost:8000/api/v1/tasks/1
```

**Response `204 No Content`** — empty body on success.

**Response `404 Not Found`:**

```json
{
  "detail": "Task with id 1 not found"
}
```

---

### Task Statistics

**Request:**

```bash
curl http://localhost:8000/api/v1/tasks/stats
```

**Response `200 OK`:**

```json
{
  "total": 10,
  "completed": 4,
  "pending": 6
}
```

---

## 📐 Data Models

### Task Schema

The database `Task` model has the following fields:

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `Integer` | Primary key, auto-increment, indexed | Unique task identifier |
| `title` | `String(255)` | Not null, indexed | Task title |
| `description` | `Text` | Nullable | Optional task description |
| `completed` | `Boolean` | Not null, default `false` | Completion status |
| `created_at` | `DateTime(timezone=True)` | Not null, auto-set | Timestamp of creation (UTC) |
| `updated_at` | `DateTime(timezone=True)` | Not null, auto-set & auto-updated | Timestamp of last update (UTC) |

### Request Schemas

#### `TaskCreate`

Used when creating a new task (`POST /api/v1/tasks/`).

| Field | Type | Required | Validation |
|---|---|---|---|
| `title` | `str` | ✅ Yes | 1–255 characters |
| `description` | `str \| None` | ❌ No | Max 5000 characters |
| `completed` | `bool` | ❌ No | Default: `false` |

#### `TaskUpdate`

Used when updating an existing task (`PUT /api/v1/tasks/{id}`). All fields are optional — only provided fields are updated.

| Field | Type | Required | Validation |
|---|---|---|---|
| `title` | `str \| None` | ❌ No | 1–255 characters |
| `description` | `str \| None` | ❌ No | Max 5000 characters |
| `completed` | `bool \| None` | ❌ No | — |

### Response Schemas

#### `TaskResponse`

Returned by single-task endpoints.

| Field | Type |
|---|---|
| `id` | `int` |
| `title` | `str` |
| `description` | `str \| None` |
| `completed` | `bool` |
| `created_at` | `datetime` |
| `updated_at` | `datetime` |

#### `TaskListResponse`

Returned by the list endpoint (`GET /api/v1/tasks/`).

| Field | Type |
|---|---|
| `tasks` | `list[TaskResponse]` |
| `total` | `int` |

#### `ErrorResponse`

Returned on validation errors and not-found errors.

| Field | Type |
|---|---|
| `detail` | `str` |

---

## 🧪 Testing

The project includes a comprehensive test suite using **Pytest** with **FastAPI's TestClient**.

### Run All Tests

```bash
pytest tests/ -v
```

### Run Specific Test Classes

```bash
# Health endpoint tests
pytest tests/test_tasks.py::TestHealthEndpoints -v

# CRUD tests
pytest tests/test_tasks.py::TestCreateTask -v
pytest tests/test_tasks.py::TestListTasks -v
pytest tests/test_tasks.py::TestGetTask -v
pytest tests/test_tasks.py::TestUpdateTask -v
pytest tests/test_tasks.py::TestDeleteTask -v

# Stats tests
pytest tests/test_tasks.py::TestTaskStats -v

# Integration test (full lifecycle)
pytest tests/test_tasks.py::TestFullCRUDLifecycle -v
```

### Test Coverage

| Test Class | Tests | Description |
|---|---|---|
| `TestHealthEndpoints` | 2 | Basic and detailed health checks |
| `TestCreateTask` | 6 | Create with full data, minimal data, completed state, validation errors |
| `TestListTasks` | 5 | Empty list, multiple tasks, pagination, filtering, ordering |
| `TestGetTask` | 2 | Successful retrieval and 404 handling |
| `TestUpdateTask` | 4 | Full update, partial update, 404, empty body |
| `TestDeleteTask` | 3 | Successful deletion, 404, double-delete prevention |
| `TestTaskStats` | 2 | Stats with empty DB and with tasks |
| `TestFullCRUDLifecycle` | 1 | End-to-end create → read → update → list → delete flow |

### Test Infrastructure

- Uses a **separate SQLite database** (`test.db`) for test isolation
- Each test gets a **fresh database session** that is created and torn down automatically
- FastAPI dependency injection is **overridden** to use the test database

---

## 🏗 Architecture

The project follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                   Routers                        │
│         (app/routers/tasks.py)                   │
│   HTTP methods, status codes, request parsing    │
├─────────────────────────────────────────────────┤
│                  Services                        │
│              (app/services.py)                   │
│      Business logic, CRUD operations             │
├─────────────────────────────────────────────────┤
│                   Models                         │
│              (app/models.py)                     │
│        SQLAlchemy ORM definitions                │
├─────────────────────────────────────────────────┤
│                 Database                         │
│             (app/database.py)                    │
│       Engine, sessions, Base class               │
└─────────────────────────────────────────────────┘
```

### Design Decisions

- **Router → Service → Model pattern:** Routers handle HTTP concerns, services contain business logic, models define data structure. This makes the codebase testable and maintainable.
- **Dependency injection:** Database sessions are injected via FastAPI's `Depends()`, enabling easy testing with mock databases.
- **Partial updates:** The `TaskUpdate` schema uses `exclude_unset=True` so only explicitly provided fields are updated, preserving existing values.
- **UTC timestamps:** All timestamps use timezone-aware UTC datetimes for consistency.
- **Lifespan management:** Database tables are created on application startup using FastAPI's modern `lifespan` context manager (not the deprecated `on_event`).

---

## 📄 License

This project is licensed under the **MIT License**.

---

Built with ❤️ using FastAPI
