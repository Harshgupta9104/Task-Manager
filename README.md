# 📋 Task Management Application

A full-stack task management application with a **FastAPI** backend and **React** frontend. Features full CRUD operations, priority levels, filtering, pagination, task statistics, and a modern dashboard UI.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Running the Application](#-running-the-application)
  - [Run Backend Only](#run-backend-only)
  - [Run Frontend Only](#run-frontend-only)
  - [Run Both Together](#run-both-together)
- [Database Schema](#-database-schema)
  - [Tasks Table](#tasks-table)
  - [Entity Relationship](#entity-relationship)
  - [Database Flow](#database-flow)
- [Application Flow](#-application-flow)
  - [Data Flow Diagram](#data-flow-diagram)
  - [User Journey](#user-journey)
- [API Endpoints](#-api-endpoints)
- [Frontend Pages](#-frontend-pages)
- [Testing](#-testing)
- [Architecture](#-architecture)
- [License](#-license)

---

## ✨ Features

- **Full CRUD Operations** — Create, read, update, and delete tasks
- **Priority Levels** — Set tasks as low, medium, or high priority
- **Filtering & Pagination** — Filter by completion status and priority
- **Task Statistics** — Dashboard with total, completed, pending, and priority counts
- **Modern UI** — React dashboard with responsive design
- **SQLite Database** — Zero-config database, no external setup required
- **Auto-Generated Docs** — Swagger UI and ReDoc for API exploration
- **CORS Support** — Configurable cross-origin resource sharing
- **Comprehensive Tests** — Full test suite for backend API

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | Async web framework |
| [SQLAlchemy](https://www.sqlalchemy.org/) | ORM and database toolkit |
| [Alembic](https://alembic.sqlalchemy.org/) | Database migrations |
| [SQLite](https://www.sqlite.org/) | Lightweight, embedded database |
| [Pydantic](https://docs.pydantic.dev/) | Data validation and serialization |
| [Uvicorn](https://www.uvicorn.org/) | ASGI server |
| [Pytest](https://docs.pytest.org/) | Testing framework |

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Vite](https://vitejs.dev/) | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| [React Router](https://reactrouter.com/) | Client-side routing |
| [Lucide React](https://lucide.dev/) | Icon library |

---

## 📁 Project Structure

```
.
├── alembic/                      # Database migrations
│   ├── versions/                 # Migration scripts
│   ├── env.py                    # Alembic environment config
│   └── script.py.mako            # Migration template
├── alembic.ini                   # Alembic configuration
├── app/                          # Backend (FastAPI)
│   ├── __init__.py
│   ├── main.py                   # App entry point & middleware
│   ├── config.py                 # Environment configuration
│   ├── database.py               # SQLAlchemy engine & session
│   ├── enums.py                  # Shared enums (Priority)
│   ├── models.py                 # ORM models (Task)
│   ├── schemas.py                # Pydantic request/response schemas
│   ├── services.py               # Business logic & CRUD operations
│   └── routers/
│       ├── __init__.py
│       └── tasks.py              # Task API endpoints
├── frontend/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.tsx               # Router configuration
│   │   ├── main.tsx              # React entry point
│   │   ├── components/
│   │   │   ├── layout/           # Layout components
│   │   │   ├── tasks/            # Task form & table
│   │   │   ├── dashboard/        # Dashboard widgets
│   │   │   └── ui/               # Reusable UI components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API client
│   │   ├── hooks/                # Custom React hooks
│   │   └── types/                # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── tests/                        # Backend tests
│   ├── conftest.py
│   └── test_tasks.py
├── requirements.txt              # Python dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** (uses modern type hints)
- **Node.js 18+** (for frontend)
- **npm** (Node package manager)

### Backend Setup

1. **Navigate to project root and create a virtual environment:**

   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment:**

   ```bash
   # On macOS/Linux
   source venv/bin/activate

   # On Windows
   venv\Scripts\activate
   ```

3. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **(Optional) Create a `.env` file for custom configuration:**

   ```bash
   # In the project root
   echo "APP_NAME=Task Manager" > .env
   echo "DEBUG=true" >> .env
   ```

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

3. **(Optional) Create a `.env` file:**

   ```bash
   # In the frontend directory
   echo "VITE_API_URL=http://localhost:8000" > .env
   ```

### Environment Variables

#### Backend (.env in project root)

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | `Task Management API` | Application display name |
| `APP_VERSION` | `1.0.0` | Application version |
| `DEBUG` | `false` | Enable debug mode |
| `DATABASE_URL` | `sqlite:///./task_manager.db` | Database connection URL |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS allowed origins (comma-separated or JSON array) |

#### Frontend (frontend/.env)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |

---

## ▶️ Running the Application

### Run Backend Only

From the **project root** directory:

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- **API:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

### Run Frontend Only

From the **frontend** directory:

```bash
cd frontend
npm run dev
```

The frontend will be available at: http://localhost:5173

### Run Both Together

**Terminal 1 - Backend:**
```bash
# From project root
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
# From project root
cd frontend
npm run dev
```

> **Note:** The frontend is configured to proxy API requests to the backend automatically via Vite's proxy settings.

### Database Migrations

The application uses **Alembic** for database schema management. Never use `Base.metadata.create_all()` to create tables in production.

**Initialize the database:**

```bash
# Apply all migrations to bring the database to the latest schema
alembic upgrade head
```

**Create a new migration:**

```bash
# Auto-generate a migration from model changes
alembic revision --autogenerate -m "description of changes"

# Or create an empty migration template
alembic revision -m "description of changes"
```

**Other commands:**

```bash
alembic current          # Show current migration version
alembic history          # Show migration history
alembic downgrade -1     # Roll back one migration
```

---

## 🗄️ Database Schema

### Tasks Table

The application uses a single SQLite database with one table:

```
┌─────────────────────────────────────────────────────────────┐
│                        tasks                                 │
├─────────────────────────────────────────────────────────────┤
│ id          INTEGER       PRIMARY KEY, AUTOINCREMENT        │
│ title       VARCHAR(255)  NOT NULL, INDEXED                 │
│ description TEXT          NULLABLE                          │
│ priority    VARCHAR(10)   NOT NULL, DEFAULT 'medium', INDEXED│
│ completed   BOOLEAN       NOT NULL, DEFAULT false           │
│ created_at  DATETIME      NOT NULL, AUTO-SET (UTC)          │
│ updated_at  DATETIME      NOT NULL, AUTO-SET/UPDATE (UTC)   │
└─────────────────────────────────────────────────────────────┘
```

### Field Details

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | Primary key, auto-increment | Unique task identifier |
| `title` | `VARCHAR(255)` | Not null, indexed | Task title (1-255 chars) |
| `description` | `TEXT` | Nullable | Optional task description (max 5000 chars) |
| `priority` | `VARCHAR(10)` | Not null, indexed | Priority level: `low`, `medium`, or `high` |
| `completed` | `BOOLEAN` | Not null, default `false` | Completion status |
| `created_at` | `DATETIME` | Not null, auto-set | Creation timestamp (UTC) |
| `updated_at` | `DATETIME` | Not null, auto-set on update | Last update timestamp (UTC) |

### Entity Relationship

```
┌──────────────────────────────────────────┐
│              tasks (TABLE)                │
├──────────────────────────────────────────┤
│  PK  id ─────────────────────────────┐   │
│      title                           │   │
│      description                     │   │
│      priority                        │   │
│      completed                       │   │
│      created_at                      │   │
│      updated_at                      │   │
└──────────────────────────────────────┼───┘
                                       │
                              ┌────────┴────────┐
                              │   INDEXES        │
                              ├─────────────────┤
                              │ idx_tasks_id    │
                              │ idx_tasks_title │
                              │ idx_tasks_prio  │
                              └─────────────────┘
```

### Database Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE OPERATIONS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │   CREATE    │      │    READ     │      │   UPDATE    │     │
│  │             │      │             │      │             │     │
│  │ INSERT INTO │      │ SELECT *    │      │ UPDATE      │     │
│  │ tasks (...) │      │ FROM tasks  │      │ tasks SET   │     │
│  │ VALUES (...)│      │ WHERE ...   │      │ ... WHERE   │     │
│  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘     │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    SQLite Database                       │   │
│  │                   task_manager.db                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│         ▲                    ▲                    ▲             │
│         │                    │                    │             │
│  ┌──────┴──────┐      ┌─────┴──────┐      ┌─────┴──────┐     │
│  │   DELETE    │      │   STATS    │      │  FILTER    │     │
│  │             │      │            │      │            │     │
│  │ DELETE FROM │      │ COUNT(*)   │      │ SELECT *   │     │
│  │ tasks WHERE │      │ GROUP BY   │      │ WHERE      │     │
│  │ id = ...    │      │ priority   │      │ completed  │     │
│  └─────────────┘      └────────────┘      │ priority   │     │
│                                           └────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Application Flow

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     FULL APPLICATION FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    USER (Browser)                        │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  REACT FRONTEND                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │    │
│  │  │Dashboard │  │  Tasks   │  │  About   │              │    │
│  │  │  Page    │  │  Page    │  │  Page    │              │    │
│  │  └────┬─────┘  └────┬─────┘  └──────────┘              │    │
│  │       │              │                                   │    │
│  │       ▼              ▼                                   │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │            API Service (api.ts)                  │    │    │
│  │  │  getTasks() | createTask() | updateTask()       │    │    │
│  │  │  deleteTask() | getTaskStats()                  │    │    │
│  │  └─────────────────────┬───────────────────────────┘    │    │
│  └────────────────────────┼────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              HTTP PROXY (Vite Dev Server)                │    │
│  │         /api/* → http://localhost:8000                   │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  FASTAPI BACKEND                         │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              Router Layer                        │    │    │
│  │  │        /api/v1/tasks/* endpoints                 │    │    │
│  │  └─────────────────────┬───────────────────────────┘    │    │
│  │                        │                                 │    │
│  │                        ▼                                 │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              Service Layer                       │    │    │
│  │  │     Business logic & CRUD operations             │    │    │
│  │  └─────────────────────┬───────────────────────────┘    │    │
│  │                        │                                 │    │
│  │                        ▼                                 │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              Model Layer (SQLAlchemy)             │    │    │
│  │  │            Task ORM Model                        │    │    │
│  │  └─────────────────────┬───────────────────────────┘    │    │
│  └────────────────────────┼────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               SQLite DATABASE                            │    │
│  │              task_manager.db                              │    │
│  │            ┌─────────────────┐                           │    │
│  │            │     tasks       │                           │    │
│  │            └─────────────────┘                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER JOURNEY FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. USER OPENS APP                                              │
│     │                                                           │
│     ▼                                                           │
│  ┌─────────────────┐                                            │
│  │  Dashboard Page  │ ◄── GET /api/v1/tasks/stats                │
│  │  (Stats View)    │     Shows: total, completed, pending,     │
│  └────────┬────────┘     priority breakdown                     │
│           │                                                     │
│           ▼                                                     │
│  2. NAVIGATES TO TASKS                                          │
│     │                                                           │
│     ▼                                                           │
│  ┌─────────────────┐                                            │
│  │   Tasks Page     │ ◄── GET /api/v1/tasks/                    │
│  │  (Task List)     │     Lists all tasks with filters          │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ├──────────────────┬──────────────────┐               │
│           ▼                  ▼                  ▼               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  CREATE TASK    │ │  EDIT TASK      │ │  DELETE TASK    │   │
│  │                 │ │                 │ │                 │   │
│  │ POST /tasks/    │ │ PUT /tasks/{id} │ │ DELETE /tasks/  │   │
│  │                 │ │                 │ │     {id}        │   │
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘   │
│           │                  │                  │               │
│           └──────────────────┴──────────────────┘               │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              REFRESH TASK LIST                           │    │
│  │         GET /api/v1/tasks/ (updated data)                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Basic health check |
| `GET` | `/health` | Detailed health check |

### Task Operations

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/v1/tasks/` | Create a new task | `201`, `422` |
| `GET` | `/api/v1/tasks/` | List tasks (paginated, filterable) | `200` |
| `GET` | `/api/v1/tasks/stats` | Get task statistics | `200` |
| `GET` | `/api/v1/tasks/{id}` | Get a specific task | `200`, `404` |
| `PUT` | `/api/v1/tasks/{id}` | Update a task | `200`, `404`, `422` |
| `DELETE` | `/api/v1/tasks/{id}` | Delete a task | `204`, `404` |

### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `skip` | `int` | `0` | Number of tasks to skip |
| `limit` | `int` | `100` | Max tasks to return (max: 500) |
| `completed` | `bool` | `null` | Filter by completion status |
| `priority` | `string` | `null` | Filter by priority (low/medium/high) |

---

## 🖥️ Frontend Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Overview with task statistics |
| Tasks | `/tasks` | Full task list with CRUD operations |
| About | `/about` | Application information |
| 404 | `*` | Not found page |

---

## 🧪 Testing

### Run Backend Tests

```bash
# From project root with venv activated
pytest tests/ -v
```

### Run Specific Test Classes

```bash
pytest tests/test_tasks.py::TestHealthEndpoints -v
pytest tests/test_tasks.py::TestCreateTask -v
pytest tests/test_tasks.py::TestListTasks -v
pytest tests/test_tasks.py::TestGetTask -v
pytest tests/test_tasks.py::TestUpdateTask -v
pytest tests/test_tasks.py::TestDeleteTask -v
pytest tests/test_tasks.py::TestTaskStats -v
pytest tests/test_tasks.py::TestFullCRUDLifecycle -v
```

---

## 🏗 Architecture

### Backend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Client Request                                         │
│       │                                                 │
│       ▼                                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Router (app/routers/tasks.py)                   │   │
│  │  - Parse HTTP request                            │   │
│  │  - Validate query params                         │   │
│  │  - Return HTTP response                          │   │
│  └─────────────────────┬───────────────────────────┘   │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Service (app/services.py)                       │   │
│  │  - Business logic                                │   │
│  │  - Database queries                              │   │
│  │  - Data transformation                           │   │
│  └─────────────────────┬───────────────────────────┘   │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Model (app/models.py)                           │   │
│  │  - SQLAlchemy ORM                                │   │
│  │  - Table definitions                             │   │
│  └─────────────────────┬───────────────────────────┘   │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Database (SQLite)                               │   │
│  │  - task_manager.db                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Design Decisions

- **Router → Service → Model pattern:** Clear separation of concerns
- **Dependency injection:** Database sessions via FastAPI's `Depends()`
- **Partial updates:** `TaskUpdate` uses `exclude_unset=True` for selective field updates
- **UTC timestamps:** All times in timezone-aware UTC
- **Lifespan management:** Modern `lifespan` context manager
- **Database migrations:** Alembic for schema management
- **Shared Priority enum:** Single source of truth for priority values
- **Global error handling:** Catches unexpected errors without leaking internals

---

## 📄 License

This project is licensed under the **MIT License**.

---

Built with ❤️ using FastAPI + React
