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
- [Visual Structure](#-visual-structure)
  - [Layout Shell](#layout-shell)
  - [Page Map](#page-map)
  - [Design System](#design-system)
  - [Navigation Flow](#navigation-flow)
- [Application Flow](#-application-flow)
  - [Data Flow Diagram](#data-flow-diagram)
  - [User Journey](#user-journey)
- [API Endpoints](#-api-endpoints)
- [Frontend Pages](#-frontend-pages)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Architecture](#-architecture)
- [License](#-license)

---

## ✨ Features

- **Full CRUD Operations** — Create, read, update, and delete tasks
- **Priority Levels** — Set tasks as low, medium, or high priority
- **Filtering & Pagination** — Filter by completion status and priority
- **Full-Text Search** — Case-insensitive search across task titles and descriptions
- **Task Statistics** — Dashboard with total, completed, pending, and priority counts
- **Modern UI** — React dashboard with responsive design, glass-morphism styling, and dark mode
- **Search & Filters** — Instant debounced search plus completion/priority filters
- **Dashboard Analytics** — Stat cards, priority breakdown chart, and recent tasks widgets
- **Developer Page** — In-app page detailing the developer, tech stack, and project links
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
| [React Router 7](https://reactrouter.com/) | Client-side routing |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) | Frontend unit tests |
| [Oxlint](https://oxc.rs/docs/guide/usage/linter) | Linting |

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
│   │   ├── pages/                # Page components (Dashboard, Tasks, About, Developer, 404)
│   │   ├── config/               # Static page content (developer profile & project data)
│   │   ├── services/             # API client
│   │   ├── hooks/                # Custom React hooks
│   │   └── types/                # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── tests/                        # Backend tests
│   ├── conftest.py
│   └── test_tasks.py
├── requirements.txt              # Pinned runtime dependencies
├── requirements-dev.txt          # Dev/test dependencies (includes runtime)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10** — the supported version used in CI; newer 3.x interpreters (e.g. 3.14) also work
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
   # Development / running tests (runtime deps + pytest, httpx)
   pip install -r requirements-dev.txt

   # Or runtime only (e.g. deployment) — no test tooling
   pip install -r requirements.txt
   ```

   All dependencies are pinned to exact versions so the same commit
   installs the same environment locally, in CI, and in deployment.

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

## 🎨 Visual Structure

### Layout Shell

Every page renders inside one shared layout (`frontend/src/components/layout/Layout.tsx`):

```
┌────────────────────────────────────────────────────────────────────┐
│ AMBIENT BACKGROUND (fixed, behind everything)                      │
│  aurora spin · drifting orbs · dot grid · noise · pointer glow     │
│ ┌──────────┐ ┌──────────────────────────────────────────────────┐ │
│ │ SIDEBAR  │ │ TOPBAR (title + theme toggle)                    │ │
│ │ w-64     │ ├──────────────────────────────────────────────────┤ │
│ │ glass    │ │ MAIN (scrollable, page-enter animation on route  │ │
│ │          │ │ change)                                          │ │
│ │ Dashboard│ │   <Route content />                              │ │
│ │ Tasks    │ │                                                  │ │
│ │ About    │ │   Toasts appear bottom-right (global)            │ │
│ │ Developer│ │                                                  │ │
│ │          │ │                                                  │ │
│ │ v1.0     │ │                                                  │ │
│ └──────────┘ └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

  < lg (mobile/tablet): sidebar slides over content behind a blurred
  overlay, toggled from the topbar menu button; auto-closes on navigate.
```

### Page Map

```
App.tsx (BrowserRouter)
└── Layout (shared shell above)
    ├── /           → DashboardPage
    │                 • 4 stat cards (total / completed / pending / high)
    │                 • priority breakdown (bars + donut)
    │                 • recent tasks list
    ├── /tasks      → TasksPage
    │                 • search input (debounced)
    │                 • status & priority filter chips
    │                 • paginated task table (row stagger, confirm dialogs)
    │                 • create/edit modal form
    ├── /about      → AboutPage        (product overview, tech grid, links)
    ├── /developer  → DeveloperPage    (hero + metrics, stack, journey, highlights, links)
    └── *           → NotFoundPage
```

### Design System

Defined in `frontend/src/index.css` on top of Tailwind CSS v4 —
components consume these utilities instead of re-defining styles:

| Utility / Class | Role |
|---|---|
| `.glass`, `.glass-strong`, `.glass-input`, `.glass-hover` | Frosted panel surfaces (blur + border + shadow, light & dark variants) |
| `.ambient-bg`, `.aurora-spin`, `.ambient-blob`, `.bg-grid`, `.bg-noise`, `.pointer-glow` | Layered ambient background system |
| `.text-gradient` | Sky→indigo gradient text accents |
| `.accent-orb-*`, `.ghost-icon` (via `HeaderDecor`) | Quiet decorative fills for empty page areas (aria-hidden, reduced-motion safe) |
| `.btn-primary` | Gradient CTA button with shine sweep |
| `.animate-fade-up`, `.animate-zoom-in`, `.page-enter`, ... | Entrance motion utilities (staggered via `animation-delay`) |
| `.shimmer` | Skeleton loading surfaces |
| `.theme-transition` | Smooth light/dark switch |
| `:focus-visible` outline | Global keyboard focus ring |
| `prefers-reduced-motion` media query | Disables animation/transition movement app-wide |

Typography: **Manrope** (headings) + **Inter** (body) via `@fontsource-variable`.

### Navigation Flow

```
        ┌───────────┐  task CRUD   ┌───────────┐
        │ Dashboard │─────────────▶│   Tasks   │
        └─────┬─────┘              └─────┬─────┘
              │        SIDEBAR           │
              ├──────────────┬───────────┴─┐
              ▼              ▼             ▼
          ┌───────┐    ┌───────────┐  ┌──────┐
          │ About │    │ Developer │  │ 404  │
          └───────┘    └───────────┘  └──────┘

  • Sidebar highlights the active route (gradient bar + tinted icon)
  • Unknown URLs land on the 404 page with a way back
  • Theme toggle in the topbar persists across visits
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
| `search` | `string` | `null` | Case-insensitive search across title and description |

---

## 🖥️ Frontend Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Overview with task statistics |
| Tasks | `/tasks` | Full task list with CRUD operations |
| About | `/about` | Application information |
| Developer | `/developer` | Developer, tech stack, and project information |
| 404 | `*` | Not found page |

---

## 🚀 Deployment

### Quick Start

For detailed deployment instructions, see [**DEPLOYMENT_GUIDE.md**](docs/DEPLOYMENT_GUIDE.md).

### Key Points

**Frontend on Vercel + Backend on Render:**

1. **Set `VITE_API_URL` in Vercel environment variables**
   - Without this, 404 errors on every API call
   - Example: `https://task-manager-y9as.onrender.com/api/v1`

2. **Set `ALLOWED_ORIGINS` in Render environment variables**
   - Must match your Vercel frontend URL exactly
   - Example: `https://task-manager-pi-gray.vercel.app`

3. **Ensure migrations run on Render**
   - Build command should include: `alembic upgrade head`
   - This creates the database tables

**Common Issue: 404 Errors After Deployment**

This typically means `VITE_API_URL` is not set during the Vercel build. The frontend doesn't know where the backend is located.

**Fix:**
1. Add `VITE_API_URL` to Vercel environment variables
2. Redeploy on Vercel
3. Check browser Network tab to verify API calls go to correct URL

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for complete setup.

---

## 🧪 Testing

### Run Backend Tests

```bash
# From project root with venv activated
# (requires the dev dependency set: pip install -r requirements-dev.txt)
pytest tests/ -v
```

### Run Frontend Tests

```bash
# From the frontend directory
cd frontend
npm test
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
- **Strict null validation:** `PUT /tasks/{id}` rejects explicit JSON `null` for `title`, `priority`, and `completed` with a `422`, since all three map to `NOT NULL` columns (omitting a field simply means "no change")
- **Robust title normalization:** Titles are trimmed and empty/whitespace-only titles are rejected on both create and update
- **Global error handling:** Catches unexpected errors without leaking internals

---

## 📄 License

This project is licensed under the **MIT License**.

---

Built with ❤️ using FastAPI + React
