# Task Management API

A RESTful API for managing tasks, built with FastAPI, SQLAlchemy, and SQLite.

## Features

- Full CRUD operations for tasks
- Pagination and filtering support
- Task statistics endpoint
- Request validation with Pydantic
- SQLite database (no external setup needed)
- Auto-generated API documentation
- CORS support
- Environment variable configuration

## Project Structure

```
.
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application entry point
│   ├── config.py        # Environment variable configuration
│   ├── database.py      # SQLAlchemy database setup
│   ├── models.py        # ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── services.py      # Business logic and CRUD operations
│   └── routers/
│       ├── __init__.py
│       └── tasks.py     # Task API endpoints
├── tests/
│   ├── __init__.py
│   ├── conftest.py      # Test fixtures and configuration
│   └── test_tasks.py    # CRUD endpoint tests
├── requirements.txt
└── README.md
```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. (Optional) Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to customize settings.

## Running the API

### Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Production Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | Task Management API | Application name |
| `APP_VERSION` | 1.0.0 | Application version |
| `DEBUG` | false | Enable debug mode |
| `DATABASE_URL` | sqlite:///./task_manager.db | Database connection URL |
| `ALLOWED_ORIGINS` | ["*"] | CORS allowed origins |

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/tasks/` | Create a new task |
| `GET` | `/api/v1/tasks/` | List all tasks (with pagination) |
| `GET` | `/api/v1/tasks/stats` | Get task statistics |
| `GET` | `/api/v1/tasks/{id}` | Get a specific task |
| `PUT` | `/api/v1/tasks/{id}` | Update a task |
| `DELETE` | `/api/v1/tasks/{id}` | Delete a task |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Basic health check |
| `GET` | `/health` | Detailed health check |

## Request/Response Examples

### Create a Task

```bash
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread, butter",
    "completed": false
  }'
```

**Response (201 Created):**
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

### List Tasks

```bash
curl http://localhost:8000/api/v1/tasks/?skip=0&limit=10&completed=false
```

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "id": 1,
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

### Update a Task

```bash
curl -X PUT http://localhost:8000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:8000/api/v1/tasks/1
```

## Running Tests

```bash
pytest tests/ -v
```

## License

MIT
