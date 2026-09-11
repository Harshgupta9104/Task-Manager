# Phase 0 — Production-Readiness Audit Report

> **Scope:** Static and dynamic audit of `Harshgupta9104/Task-Manager` @ `main` (16 commits, last 2026-09-10).
> **Method:** Every claim below was verified against actual source code, configuration, git history, and executed commands — not against documentation. Where documentation and code disagree, code is treated as truth and the discrepancy is flagged.
> **Mandate honored:** No features, no auth, no migrations, no PostgreSQL, no infrastructure were implemented during this audit. The local `DEPLOYMENT_DEBUGGING.md` (untracked) was inspected but left untouched.

---

## 1. Executive Summary

The repository is in **materially better shape than a typical pre-hardening codebase**: layered FastAPI backend (router → service → model), environment-driven configuration, an Alembic-managed schema, 111 backend + 20 frontend tests that all pass, a two-job CI pipeline, and a frontend whose data layer was recently consolidated into a single well-tested hook (`useTasks`). The engineering fundamentals — deterministic ordering, input validation, stale-request protection, CORS origin normalization — are already in place and test-pinned.

However, the application is **not production-ready**, for four concrete reasons, all verified in code:

1. **The API is an open, unauthenticated, unowned write surface.** There is no user model and no `owner_id`; any client that can reach the backend can read, modify, and delete every task (Known Issue **C** — confirmed).
2. **The intended production database (SQLite on Render) is ephemeral.** Render's filesystem is wiped on every deploy/restart, so `task_manager.db` — created by `alembic upgrade head` in the build command — loses all data each release. The deployment guide makes `DATABASE_URL` "optional, defaults to SQLite", which guarantees this outcome (Known Issue **B** — confirmed).
3. **The dashboard is broken by code, not by deployment.** `frontend/src/services/api.ts::getTaskStats()` returns hard-coded zeros and never calls the fully-implemented, fully-tested `GET /api/v1/tasks/stats` endpoint (Known Issue **A** — confirmed; introduced by commit `841aa51`). Total, Completed, Pending, Completion Rate, and the Analytics charts render as zeros permanently.
4. **The deployed frontend 404s on refresh/deep-link.** The app uses `BrowserRouter`, and the repo contains no `vercel.json` (no SPA rewrite), so directly loading `/tasks` or `/about` on Vercel returns 404.

None of these require new product features to fix; each has a small, well-defined first change (see Phase plans). Overall production readiness is assessed at **~55%**.

---

## 2. Current Architecture (verified from source)

### 2.1 Repository inventory

| Area | Files | Responsibility |
|---|---|---|
| **Backend app** | `app/main.py` | FastAPI factory (`_build_app`), lifespan logging, global 500 handler, CORS middleware, router mounting under `/api/v1`, health endpoints `/` and `/health` |
| | `app/config.py` | `pydantic-settings` `Settings`: `APP_NAME`, `APP_VERSION`, `DEBUG` (default `False`), `DATABASE_URL` (default `sqlite:///./task_manager.db`), `ALLOWED_ORIGINS` (string/CSV/JSON parsing + trailing-slash normalization); reads `.env` |
| | `app/database.py` | Engine (with `check_same_thread=False` for SQLite), `SessionLocal`, declarative `Base`, `get_db` dependency (yield/close; no explicit rollback — acceptable, `close()` discards the un-committed transaction) |
| | `app/models.py` | Single `Task` model: `id` PK, `title` String(255) NOT NULL indexed, `description` Text nullable, `priority` String(10) NOT NULL indexed default medium (**no DB-level constraint** — gap documented in a column comment), `completed` Boolean, UTC `created_at`/`updated_at` |
| | `app/schemas.py` | `TitleField` (trim + reject whitespace-only, 1–255 chars), `TaskCreate`, `TaskUpdate` (all optional, rejects explicit `null` title), `TaskResponse`, `TaskListResponse {tasks, total}`, `TaskStatsResponse` (6 fields), `ErrorResponse` |
| | `app/services.py` | All business logic: CRUD, filtered/searchable/paginated list (`created_at DESC, id DESC` before offset/limit; `COUNT` for total), single-aggregate stats query (`COUNT` + `SUM(CASE)`) |
| | `app/routers/tasks.py` | 6 task endpoints + OpenAPI metadata + 404/422 semantics |
| | `app/enums.py` | `Priority(str, Enum)`: low/medium/high — single source of truth shared by schemas, router, services, and (mirror) frontend type |
| **Migrations** | `alembic.ini`, `alembic/env.py`, `alembic/versions/44840f774604_initial_tasks_table.py` | `env.py` takes `sqlalchemy.url` from app settings (single config source). One migration; creates `tasks` with server defaults and indexes on `title`/`priority` |
| **Tests (BE)** | `tests/conftest.py`, `tests/test_tasks.py`, `tests/test_phase0_stabilization.py` | In-memory SQLite via transactional-rollback fixture; `get_db` overridden. 111 tests: health, full CRUD, validation, search/filter/pagination matrix, ordering stability, typed stats incl. OpenAPI `$ref`, CORS behavior suite, config tests, and a **canary test pinning the DB-level priority gap** |
| **Frontend** | `frontend/src/services/api.ts` | Single `API_BASE` from `VITE_API_URL` (fallback `/api/v1`), one `request<T>()` helper (JSON headers, `{detail}` error parsing, 204 handling, `AbortSignal` pass-through, 404 diagnostics), typed endpoint functions — **except `getTaskStats()`, which is a hard-coded stub** |
| | `frontend/src/hooks/useTasks.ts` | The single task-list abstraction: query state object, debounced search (300 ms), one fetch effect with `AbortController` + `active` flag, no-op setters, mutations that refresh via the same path. 20 dedicated tests |
| | `frontend/src/pages/*` | `DashboardPage` (stats + recent tasks, one effect + retry token), `TasksPage` (thin coordinator over `useTasks`), `AboutPage`, `NotFoundPage` |
| | `frontend/src/components/*` | `layout/` (Layout, Sidebar, TopBar), `tasks/` (TaskForm with client validation + diff-based update payloads; TaskTable presentational), `dashboard/` (StatCard, RecentTasks, Analytics with donut/bar charts), `ui/` (Toast module-store, ConfirmDialog, Skeleton, ThemeToggle) |
| | `frontend/src/types/task.ts` | Domain types; `Priority` union mirrors backend enum (asserted by a backend test) |
| | `vite.config.ts` | Dev proxy `/api` and `/health` → `http://localhost:8000`; vitest jsdom config with `fileParallelism: false` (documented Windows workaround) |
| **CI** | `.github/workflows/ci.yml` | `backend` job (Python 3.10, pip cache, `pytest tests/ -v`) and `frontend` job (Node 22, `npm ci` → oxlint → `tsc -b && vite build` → vitest). Triggers: all PRs + push to `main`. No `continue-on-error` |
| **Docs** | `README.md`, `docs/DEPLOYMENT_GUIDE.md`, `docs/PHASE_0_ANALYSIS.md`, `docs/CORS_FIX_TECHNICAL_NOTE.md`, `DEPLOYMENT_DEBUGGING.md` (untracked) | Deployment and debugging guides; `PHASE_0_ANALYSIS.md` is the prior stabilization record (partially stale: says 104 tests, actual 111) |
| **Env files** | `frontend/.env` (gitignored, benign), `frontend/.env.example` (tracked, good docs), `frontend/.env.production` (**tracked**, empty `VITE_API_URL`) | Root `.env` absent (never committed in history — verified) |
| **Local artifacts (gitignored)** | `task_manager.db` (stamped at head `44840f774604`, 2 rows), `frontend/frontend.log`, `.venv/` + `venv/` | Never tracked in git history — verified via `git log --all` |

### 2.2 Architecture map (data flow)

```
Browser (React 19 + Vite)
  pages (Dashboard / Tasks)            ← UI coordination only
    ├─ useTasks (tasks domain)         ← query state, debounce, abort, mutations
    └─ DashboardPage effect            ← Promise.all(getTaskStats, getTasks)
         │
         ▼
  services/api.ts  ── API_BASE = VITE_API_URL || '/api/v1'
         │
   dev:  Vite proxy /api,/health → localhost:8000
   prod: absolute URL to Render backend (build-time injected)
         │
         ▼
FastAPI  app/main.py (CORS, global 500 handler)
  └─ /api/v1/tasks router ── Pydantic validation (schemas)
        └─ services.py (queries, ordering, stats aggregate)
              └─ SQLAlchemy engine (database.py)
                    └─ SQLite file (dev &, today, intended prod)
Alembic ── schema evolution (env.py reads app settings)
GitHub Actions ── backend tests ∥ frontend lint+build+tests
Vercel (frontend static) + Render (uvicorn; build runs `alembic upgrade head`)
```

---

## 3. Backend Assessment

| Area | Rating | Evidence & rationale |
|---|---|---|
| Startup flow | **GREEN** | Modern `lifespan` (no deprecated `on_event`); logs name/version/origins; app built via `_build_app()` factory so tests can rebuild with different settings without leaking module state |
| Configuration loading | **GREEN** | `pydantic-settings`, `.env` support, explicit defaults; `DEBUG` defaults `False`; CORS parsing accepts string/CSV/JSON and normalizes origins (fixes a real production incident — trailing slash) |
| DB initialization | **YELLOW** | Schema exists only via Alembic (good), but nothing *verifies* it: a missing/failed `alembic upgrade head` surfaces as runtime 500s. `/health` does not probe the DB |
| Session lifecycle | **GREEN** | `get_db` yields and closes; service methods commit explicitly; no session leakage (DI-scoped) |
| Dependency injection | **GREEN** | `Depends(get_db)` throughout; test override path proven by the suite |
| Request validation | **GREEN** | Pydantic v2 boundary on every write; `TitleField` shared by create/update; explicit-`null` title rejected on update; enum-validated priority on body **and** query |
| Response serialization | **GREEN** | `response_model` on all endpoints; typed stats response asserted down to the OpenAPI `$ref` |
| Business-logic separation | **GREEN** | Routers never touch the ORM; services never touch HTTP; enums shared |
| Routing structure | **GREEN** | `/api/v1` prefix; `/stats` declared before `/{task_id}` (no shadowing) |
| Error handling | **GREEN** | Catch-all handler → generic 500 (no stack leakage, verified by code path); `HTTPException` details contain ids, not internals |
| Transaction handling | **GREEN** (with note) | One transaction per request via implicit commit/rollback semantics; note: `update_task` sets `updated_at` manually *and* the model has `onupdate` — redundant but harmless belt-and-braces |
| Migration strategy | **GREEN** for dev / **YELLOW** for prod | Alembic correctly wired (single URL source); but migrations are never executed or validated by tests (suite uses `create_all`), and nothing prevents model/migration drift |
| Logging | **YELLOW** | Stdlib logging with `logger.exception` in the handler (good); but no request logging, no correlation IDs, no structured format — acceptable now, needed before operating at scale |
| CORS | **GREEN** | Explicit allow-list (wildcard rejected by test), normalization, `allow_credentials=True` is harmless today (no cookies/auth) but must be revisited in the auth phase |
| Health endpoints | **RED (for ops)** | `/` and `/health` are **liveness-only** — no DB probe (Known Issue **F** confirmed). Render (or any orchestrator) can mark an instance healthy while it cannot serve a single request. `/health` also exposes the `DEBUG` flag value (minor, benign) |

---

## 4. API Contract Audit

All routes verified in `app/routers/tasks.py`; behavior cross-checked against tests and the frontend service layer.

| Method & route | Request | Response | Validation / errors | DB interaction | Auth | Perf | Tests |
|---|---|---|---|---|---|---|---|
| `POST /api/v1/tasks/` | `TaskCreate` body | `TaskResponse` **201** | 422: missing/empty/whitespace/`>255` title, `>5000` description, invalid priority, malformed JSON | INSERT + commit + refresh | ❌ none | trivial | ✅ extensive incl. whitespace variants |
| `GET /api/v1/tasks/` | query: `skip≥0`, `limit 1–500` (default 100), `completed`, `priority`, `search` | `TaskListResponse` 200 | 422: bad `skip`/`limit`/`priority` | Filtered `COUNT` + ordered `SELECT` (created_at DESC, id DESC) with offset/limit | ❌ none | `COUNT` is O(filtered set); `ILIKE %term%` scans; fine at current scale | ✅ matrix incl. empty result, filters-before-pagination, multi-page search |
| `GET /api/v1/tasks/stats` | — | `TaskStatsResponse` 200 | — | Single aggregate (`COUNT`+`SUM(CASE)`) | ❌ none | one round-trip — good | ✅ incl. empty DB and OpenAPI contract |
| `GET /api/v1/tasks/{task_id}` | int path | `TaskResponse` 200 | 404 with id in detail; 422 non-int id | SELECT by PK | ❌ none | trivial | ✅ |
| `PUT /api/v1/tasks/{task_id}` | `TaskUpdate` (all optional; explicit `null` title → 422) | `TaskResponse` 200 | 404 / 422 | SELECT, partial setattr via `exclude_unset`, commit | ❌ none | trivial | ✅ partial update, no-change body, null/whitespace title |
| `DELETE /api/v1/tasks/{task_id}` | — | **204** empty | 404 | SELECT + DELETE + commit; idempotency: second delete → 404 | ❌ none | trivial | ✅ incl. delete-twice |
| `GET /`, `GET /health` | — | 200 JSON | — | **none** | ❌ | trivial | ✅ |

**Contract-level observations**

- **CRUD correctness, 404/422 behavior, pagination, filtering, search, DELETE semantics, empty results, invalid IDs, malformed input, and partial updates are all correctly implemented and test-pinned.** No functional defects found in the backend API.
- **`PUT` is used as a partial update** (semantically `PATCH`-like). It is documented and consistent — acceptable; do not churn the contract.
- **Frontend ↔ backend consistency is exact** with one deliberate exception: the frontend type `TaskUpdate.description?: string | null` matches the backend's ability to clear description by sending `null`; `TaskForm` exploits this correctly.
- **The one real inconsistency is `getTaskStats()`**: the backend implements and tests `/stats` thoroughly; the frontend never calls it (see §5).

---

## 5. Frontend Assessment

**Routing:** `BrowserRouter` + `Layout` (Outlet), routes `/`, `/tasks`, `/about`, `*`. `Layout` remounts pages via `key={location.pathname}` — navigation replays entrance animations and remounting Dashboard refetches its data. **Gap:** no SPA rewrite exists for production hosting; deep links/refresh will 404 on Vercel (no `vercel.json` anywhere in the repo — verified).

**State management:** deliberately framework-free — `useState` + one effect per data domain, plus a module-level toast store. Correct choice at this scale; no Redux/Zustand needed and none invented.

**Data layer (verified request flow):**

```
TaskTable (input) → TasksPage (coordinator) → useTasks
  → debounced/trimmed searchInput → TaskQueryState (single source of truth)
  → single fetch effect (AbortController + active flag)
  → api.getTasks(params, signal) → request<T>()
  → `${API_BASE}/tasks/?…`   API_BASE = VITE_API_URL || '/api/v1'
  → dev: Vite proxy (/api → :8000) | prod: absolute Render URL baked at build
  → FastAPI router → services → SQLite → response
  → {tasks, total} → setState → UI
```

- **Stale-response protection is correct and tested** (late responses cannot overwrite newer state; aborts are silent lifecycle events).
- **No duplicate fetch paths remain** in TasksPage; DashboardPage has one effect + retry token (the documented exception: read-only two-call aggregate).
- **Dead/broken paths found:**
  1. **`getTaskStats()` — RED.** Hard-coded zeros; never fetches `/api/v1/tasks/stats`. Consequence chain: `DashboardPage` receives zeros → all four StatCards show 0 → `stats.total > 0` is false → `Analytics` never renders. The backend endpoint and its OpenAPI contract are fine. Introduced by commit `841aa51` ("Fix: Return default stats from getTaskStats without calling /tasks/stats endpoint") — the commit message mislabels a regression as a fix. This is the single most user-visible defect in the repo.
  2. **`getTask()` — YELLOW (dead code).** Exported, typed, never called by any page/hook. Harmless; keep (it is part of a coherent API surface) but note it is untested.
- **Env-var usage:** env access is confined to `api.ts`; `vite-env.d.ts` types `VITE_API_URL`; `!PROD` console.log of the base URL is a reasonable dev aid.
- **Form handling:** `TaskForm` validates (trim, 255 cap) mirroring the backend, builds a **diff payload** on edit (only changed fields sent) — good.
- **Loading/empty/error states:** implemented at page and table level (skeletons, empty states, error banners with Retry); toasts for mutation outcomes. No missing states found.
- **TypeScript strictness: RED-adjacent.** `tsconfig.app.json` does **not** enable `strict` (verified). The build type-checks (`tsc -b`), but without null-safety checks. The code happens to be clean, but the safety net is off.
- **Dead dependency: `@playwright/test`** is installed (added by commit `943e687`) with **no e2e tests and no playwright config** — dead weight in installs.
- **Minor duplication:** `formatDate` implemented twice (`RecentTasks.tsx`, `TaskTable.tsx`) with different formats (arguably intentional; note only).
- **Lint:** oxlint — 0 errors, 1 warning (`useCountUp.ts` setState-in-effect; cosmetic, does not block CI).

---

## 6. Database Assessment

- **Current schema** (verified via model + migration + live DB inspector): single `tasks` table — `id` INTEGER PK, `title` VARCHAR(255) NOT NULL indexed, `description` TEXT NULL, `priority` VARCHAR(10) NOT NULL default 'medium' indexed, `completed` BOOLEAN NOT NULL default 0, `created_at`/`updated_at` DATETIME(timezone=True) NOT NULL. Indexes: PK, `title`, `priority`.
- **Data-integrity guarantees — verified item by item:**
  | Invariant | Enforced where | DB-level? |
  |---|---|---|
  | Title required, 1–255, non-blank | Pydantic `TitleField` (create+update) | NOT NULL only (blank-string rejection is app-level; adequate) |
  | Priority ∈ {low, medium, high} | Pydantic enum + query param | ❌ **NO** — plain VARCHAR. **Confirmed by canary test `test_db_accepts_invalid_priority_canary`, which inserts `'urgent'` successfully.** (Known Issue **D** confirmed.) |
  | Completion state | Boolean NOT NULL, server default 0 | ✅ |
  | Required fields | NOT NULL columns | ✅ |
  | Relationships / ownership | **none exist** | ❌ no `owner_id`, no FK (by Phase 0 scope) |
  | Uniqueness | none required by the domain | n/a |
- **Timestamps:** Python-side `default`/`onupdate` lambdas (UTC) + migration server defaults — consistent, timezone-aware.
- **Migration safety:** one reversible migration with server defaults; `downgrade` drops the table. Tests never run migrations (they use `create_all`) — **model↔migration drift is possible today**; the canary + schema-inspection tests partially mitigate.
- **SQLite-specific assumptions:** `check_same_thread=False` (fine for FastAPI's threadpool with per-request sessions); no WAL enabled; single-writer concurrency ceiling; file lives on the app server's disk.
- **Production DB risks (the big one):** on Render, the container filesystem is **ephemeral** — `task_manager.db` created during `alembic upgrade head` in the build command is destroyed on every deploy and restart. **All user data is lost on every release.** This is the single largest operational risk in the repo. (Known Issue **B** confirmed; the deployment guide even documents `DATABASE_URL` as "optional".)
- **Query scalability:** `COUNT` per list request, `ILIKE '%term%'` scans, offset pagination — all fine to hundreds/thousands of rows; all become the first bottlenecks beyond that. A composite `(created_at DESC, id DESC)` index would serve the default ordering; not warranted yet.
- **No schema changes were made during this audit**, per the Phase 0 mandate.

---

## 7. Security Assessment

Legend: ✅ CURRENTLY SAFE · ⚠️ ACCEPTABLE NOW, SHOULD IMPROVE · ❌ PRODUCTION BLOCKER

| Area | Rating | Finding (verified) |
|---|---|---|
| Authentication | ❌ | **None exists.** Every endpoint is anonymous. Accepted Phase 0 posture, but the app must not face the public internet in this state (Phase 1 in the roadmap owns it) |
| Authorization / ownership | ❌ | **No user/ownership model** — any client can read/modify/delete *all* tasks (Known Issue **C** confirmed). Same phase |
| Password handling | n/a | No auth yet |
| CORS | ✅/⚠️ | Explicit allow-list, wildcard rejected by test, origin normalization, credentials flag harmless today. **Risk is operational:** if `ALLOWED_ORIGINS` is unset in prod, only `localhost:5173` is allowed → total CORS failure (this actually happened before; the docs now cover it). Tighten methods/headers when auth lands (Known Issue **E** — acceptable *if* configured) |
| Secrets & env handling | ✅ | No secrets in repo or history (verified via `git log --all` on `.env`/`*.db`/`*.log`; historical `backend.log`/`frontend.log` commits contained only local paths/IPs — benign, since removed). `.env` gitignored both at root and frontend |
| Debug configuration | ⚠️ | `DEBUG` defaults `False`; only surfaced in `/health`. `/docs` and `/redoc` are **open in production** — gate them behind `DEBUG` or accept the information disclosure |
| Error leakage | ✅ | Global handler returns a generic 500; `logger.exception` keeps detail server-side; 404 details contain only ids |
| Request validation | ✅ | Pydantic on every write; lengths capped (title 255, description 5000); enum-validated priority |
| Oversized requests | ⚠️ | No explicit body-size limit (uvicorn default has none). Length caps in schemas cap *stored* size; a request-size limit belongs in the Phase 4 hardening pass |
| SQL injection | ✅ | All queries go through SQLAlchemy expressions/params; the only string interpolation into `ILIKE` is a parameterized pattern. (Wildcard characters in search terms are not escaped — cosmetic, not exploitable) |
| Unsafe DB operations | ✅ | No raw SQL anywhere (verified); Alembic is the only DDL path |
| XSS (frontend) | ✅ | No `dangerouslySetInnerHTML`/`innerHTML`/`document.write`/`eval` (verified by search); React escaping everywhere |
| CSRF | n/a→⚠️ | No cookies/auth today; becomes relevant in the auth phase together with `allow_credentials` |
| Dependency vulnerabilities | ⚠️ | No known-vulnerable pins identified by inspection, **but** `requirements.txt` uses floor-only pins (`>=`) with no lockfile → CI builds are not reproducible and can silently upgrade majors (a new Starlette deprecation warning already appeared in local runs). Python lint/typecheck and dependency scanning absent from CI |
| Rate limiting | ❌ (pre-launch) | None. Combined with no auth, the write surface is unlimited. Implement with/after auth (Phase 3) |
| Security headers | ⚠️ | None set by the app (HSTS/CSP etc. partially provided by Vercel/Render edges); add middleware in Phase 4 |
| Logging of sensitive info | ✅ | Startup logs origins/name/version only; no request bodies or credentials logged |

---

## 8. Testing Assessment

**Backend (111 tests, all passing, ~2.9 s):** `tests/test_tasks.py` (health, CRUD, priority validation, search matrix, pagination/filter interaction, 404/422 paths, full lifecycle, enum, schema inspection, stats breakdown, config, CORS suite incl. preflight + trailing-slash + evil-origin rejection) and `tests/test_phase0_stabilization.py` (deterministic ordering with explicit timestamps, title validation parametrized on whitespace variants, typed stats + OpenAPI `$ref`, and the priority-gap canary). Test isolation is excellent: in-memory SQLite, transactional rollback, `get_db` override — the production DB is provably unreachable from tests.

**Frontend (20 tests, all passing):** `useTasks.test.tsx` — mount fetch with signal, error/empty states, page/filter/priority/search propagation with page resets, no-op setters, mutation→refresh, error propagation, stale-response rejection, abort-error silence, and fake-timer debounce tests (no per-keystroke fetch, trim, whitespace-only no-op, pagination reset). High-quality behavioral coverage of the data layer.

**Test strategy gaps (missing-test matrix):**

| Feature | Existing test | Missing test | Priority |
|---|---|---|---|
| `getTaskStats()` consumes `/api/v1/tasks/stats` | ❌ none (function is a stub) | `api.ts` contract test with mocked `fetch` asserting the real call | **P0** |
| Dashboard shows real stats | ❌ none | Component test mocking `api` (stats + recent tasks render) | **P0** |
| `request<T>()` behaviors (404 message parse, 204, network TypeError, signal pass-through) | ❌ none | Unit tests with stubbed `fetch` | P1 |
| Alembic migration chain on a fresh DB | ❌ (suite uses `create_all`) | CI step: `alembic upgrade head` against empty SQLite + schema assert | P1 |
| DB rejects invalid priority | Canary asserts the **opposite** (gap pinned) | Flip canary when CHECK-constraint migration lands | P1 |
| `/health` with DB down | ❌ none | Test with a broken engine override | P1 |
| `TaskTable`/`TaskForm` component behavior (filter UI, diff payload) | ❌ none (hook layer covered) | Component tests | P2 |
| `limit=500` boundary, `skip` beyond total, duplicate-title, very long search terms | ❌ none | API edge tests | P3 |
| Concurrent SQLite writes | ❌ n/a (dev-only concern) | Skip until Postgres | P3 |
| Cross-user access denial | ❌ n/a (no users) | Phase 3 |

**Reliability notes:** suite is deterministic and fast; frontend suite takes ~49 s wall-clock due to `fileParallelism: false` (Windows workaround) — a CI-time cost, not a correctness issue.

---

## 9. CI/CD Assessment

Verified `.github/workflows/ci.yml`:

- **Triggers:** all `pull_request`s + pushes to `main`. Two independent jobs, no `continue-on-error`.
- **Backend:** Python **3.10**, pip cache, `pip install -r requirements.txt`, `pytest tests/ -v`.
- **Frontend:** Node **22** (with an accurate comment: Vite 8/Vitest 5 need ≥ 20.19), `npm ci` (lockfile-cached), oxlint, `tsc -b && vite build` (typecheck included), vitest.
- **Does CI prove "safe to merge"?** It proves the *existing behavioral contract* (backend API behavior, frontend data-layer logic, types, style). It does **not** prove: migrations apply cleanly (`create_all` ≠ Alembic), Python lint/type health (no ruff/mypy job), dependency health (no audit), or end-to-end integration (no e2e; Playwright is installed but unused). **Known Issue G answered: CI tests the currently implemented suite only.**
- **No deployment jobs** — deploys are hosting-side (Vercel/Render auto-deploy on push); CI is merge-gating only.
- Missing niceties: `concurrency` group (wasted runs on rapid pushes), Python lint/typecheck, dependency scanning.

---

## 10. Deployment Assessment

Intended topology: **Vercel (frontend) + Render (backend) + SQLite (today)**. Verified against docs *and* code.

- **Frontend build:** `cd frontend && npm run build` → `tsc -b && vite build`. `VITE_API_URL` is a **build-time** variable (baked into the bundle) — Vercel env var must be set before build; redeploy required after changes. Correctly documented in `DEPLOYMENT_GUIDE.md`.
- **Backend start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT` — correct for Render. Single process (no `--workers`), acceptable pre-scale.
- **Migrations:** `pip install -r requirements.txt && alembic upgrade head` in the Render build command — correct mechanism, **but combined with SQLite it recreates an empty DB on every deploy** (see §6). Also: two deploy instances would race on the SQLite file (not applicable yet).
- **CORS:** must set `ALLOWED_ORIGINS` on Render to the exact Vercel origin; normalization now tolerates the trailing-slash mistake (previously a real incident — the CORS test suite pins the fix).
- **Production DEBUG:** must be set `false` on Render (default is `false` — safe by default). `/docs`/`/redoc` remain open regardless.
- **Frontend routing:** ❌ **No `vercel.json` / SPA rewrite exists.** `BrowserRouter` deep links (`/tasks`, `/about`) and refreshes 404 on Vercel. Small fix, real user impact.
- **API routing:** frontend on Vercel cannot proxy `/api` (static hosting) — the absolute `VITE_API_URL` is mandatory, and the 404 diagnostics in `api.ts` correctly call this out.
- **Failure modes identified:** (1) `VITE_API_URL` unset at build → all calls 404 (documented + has runtime diagnostics); (2) `ALLOWED_ORIGINS` mismatch → CORS failure (documented + normalized + test-pinned); (3) migration failure in build → backend up but DB empty (no health check catches this); (4) SQLite data loss on every deploy (**guaranteed**, not a failure mode — a design property).
- **Environment variables required:**

  | Var | Local dev | Staging | Production |
  |---|---|---|---|
  | `DATABASE_URL` | unset → SQLite default | **required** (managed DB URL) | **required** (managed DB URL) |
  | `ALLOWED_ORIGINS` | unset → `localhost:5173` | staging frontend origin | production frontend origin (exact, or trailing-slash-tolerant) |
  | `DEBUG` | `true` (optional) | `false` | `false` |
  | `VITE_API_URL` (build-time, frontend) | unset → `/api/v1` via proxy | staging backend `/api/v1` URL | production Render `/api/v1` URL |
  | `APP_NAME` / `APP_VERSION` | optional defaults | optional | optional |

---

## 11. Configuration & Environment Audit

- **Root `.env`:** absent (fine); `app/config.py` reads one if present. No secrets anywhere in history (verified).
- **`frontend/.env`:** present on disk, gitignored, contains only comments + empty `VITE_API_URL` — safe.
- **`frontend/.env.example`:** tracked, well-documented — good.
- **`frontend/.env.production`:** **tracked** with empty `VITE_API_URL`. Vercel's real env var overrides it, so it works — but any value accidentally committed here would silently override nothing and confuse a local production build. Footgun; replace with documentation (it duplicates `.env.example` today).
- **`.gitignore` (root):** covers `__pycache__`, `*.db`, `.env`, logs, venvs, IDE/OS files. Frontend `.gitignore` covers `node_modules`, `dist`, `.env*local`, logs. **Gaps:** root `.gitignore` lacks `frontend/dist/` (covered by frontend's own) and `dist/`; `DEPLOYMENT_DEBUGGING.md` sits untracked — either commit it as docs or remove it.
- **Hard-coded URLs:** Vercel/Render project URLs appear throughout docs (`task-manager-pi-gray.vercel.app`, `task-manager-y9as.onrender.com`) — not secrets, but project-specific docs should be parameterized. **No hard-coded URLs in application code** (verified — the only URL in code is the Vite proxy target).
- **Hard-coded credentials:** none (verified).
- **Debug flags:** `DEBUG=False` default; frontend logs base URL only in dev.
- **Production defaults:** safe (`DEBUG=false`, CORS = localhost only — the app *fails closed* on CORS, which is correct).
- **Misc:** two virtualenvs on disk (`.venv`, `venv`) — dev hygiene only; Windows-only `start_*.cmd` scripts are dev conveniences.

---

## 12. Code Quality Assessment

Only materially significant items are flagged (no stylistic nitpicks):

1. **`getTaskStats()` stub** — the only *broken* code found; everything else is structure/quality. (P0, Phase 1)
2. **Unused/dead code:** `@playwright/test` devDependency with no tests or config; `api.getTask()` exported but unused; `frontend/src/assets/vite.svg` leftover. Low-cost cleanups.
3. **Duplication:** `formatDate` in two components; `DashboardPage` and `useTasks` share the reload-token pattern (acceptable duplication of a 3-line idiom — documented deliberately).
4. **Hard-coded values:** none in code paths; `PAGE_SIZE=10` and debounce 300 ms are named constants — good.
5. **Misleading docs (not code):** README claims `VITE_API_URL` default is `http://localhost:8000` (actual: `/api/v1` via proxy) and "Node.js 18+" (CI correctly requires ≥ 20.19); `docs/PHASE_0_ANALYSIS.md` says 104 backend tests (now 111). Minor doc drift.
6. **Typing:** backend fully typed; frontend TypeScript clean but **non-strict** (see §5).
7. **Function size / coupling:** all functions small; layering respected; no inappropriate abstraction found.
8. **Error handling consistency:** backend uniform (`HTTPException` + generic 500); frontend uniform (`request<T>` throws `Error` with `detail`); toasts surface mutation errors, banners surface load errors — consistent.
9. **Minor:** `useCountUp` triggers the one oxlint warning (setState-in-effect; works, cosmetic); `services.py` mixes `db.query()` (legacy) style with `Mapped` (2.0) models — internally consistent, not worth churning; `requirements.txt` mixes runtime and test deps (pytest/httpx) — split when convenient.

---

## 13. Performance Assessment

**Current state is sound for the target scale.** Verified: stats = one aggregate query; list = single filtered+ordered+paginated SQL with a separate `COUNT`; frontend debounces search, aborts superseded requests, no-op-refetches on same-value setters, and parallelizes dashboard calls (`Promise.all`). Bundle: **284 kB JS / 87 kB gzip** — healthy.

| Scale | Expected behavior | First bottleneck |
|---|---|---|
| 10 users | None — trivial load | — |
| 100 users | Fine (SQLite handles this read-heavy profile) | None material |
| 1,000 users | Degradation begins under concurrent writes (SQLite single-writer; file on one host) | DB write contention; `COUNT` per list request |
| 10,000+ users | Not viable on SQLite/Render-free single instance | Requires managed Postgres, connection pooling, composite `(created_at DESC, id DESC)` index, FTS to replace `ILIKE '%term%'`, keyset pagination, multiple uvicorn workers |

No premature optimization recommended; the Phase 2 Postgres move addresses the real cliff.

---

## 14. Production Blockers (P0)

| ID | Problem | Evidence | Minimal fix direction |
|---|---|---|---|
| **P0-1** | **No authentication/authorization/ownership** — anonymous global read/write/delete of all tasks | No user model, no auth middleware; every route public | Phase 3 (users, tokens, `owner_id`) — must gate any public launch |
| **P0-2** | **SQLite on Render is ephemeral** — all data lost on every deploy/restart | `DATABASE_URL` default `sqlite:///./task_manager.db`; Render build runs `alembic upgrade head` per deploy; docs make `DATABASE_URL` "optional" | Phase 2 (managed Postgres; keep SQLite for local dev) |
| **P0-3** | **Dashboard statistics are hard-coded zeros** — `getTaskStats()` never calls the implemented, tested `/stats` endpoint | `api.ts` stub; commit `841aa51`; backend endpoint + OpenAPI contract fully tested | Phase 1 first change (one function + one test) |
| **P0-4** | **SPA routing 404s on refresh/deep-link** in production | `BrowserRouter` + no `vercel.json` rewrite anywhere in repo | Phase 1 (add `vercel.json` rewrites) |

## 15. High-Priority Improvements (P1)

1. **DB-level priority enforcement:** add a CHECK constraint (or `sa.Enum`) via migration + data cleanup for any invalid rows + **flip the canary test**.
2. **`/health` must verify DB readiness** (execute `SELECT 1`), not just liveness — otherwise orchestrators route traffic to instances that cannot serve.
3. **Reproducible Python builds:** pin dependencies (lock file or exact pins), split dev deps out of `requirements.txt`.
4. **CI Python quality gate:** add ruff (lint) — and ideally mypy — to the backend job.
5. **TypeScript `strict: true`** + fix any fallout; add `api.ts` unit tests and dashboard component test (guards the P0-3 fix).
6. **Configuration hygiene:** correct README env-var table (`VITE_API_URL` default) and Node version; decide the fate of tracked `.env.production` and untracked `DEPLOYMENT_DEBUGGING.md`; gate `/docs`/`/redoc` behind `DEBUG`.

## 16. Medium-Priority Improvements (P2)

1. Rate limiting (with/after auth — Phase 3).
2. Composite ordering index migration when data grows; monitor `COUNT` cost.
3. Search scaling plan (SQLite FTS5 → Postgres `tsvector` in Phase 2+).
4. Coverage tooling with gates (backend + frontend).
5. Structured logging + request correlation IDs; request-size limits; security-headers middleware.
6. Dependency vulnerability scanning in CI (`pip-audit`, `npm audit`).
7. CI `concurrency` groups; reduce vitest wall-time if it becomes painful.

## 17. Low-Priority Improvements (P3)

1. Remove unused `@playwright/test` (or add the actual e2e suite it was installed for).
2. Deduplicate `formatDate`; fix the `useCountUp` lint warning.
3. URL-persisted query state (shareable filtered views).
4. `sort_by`/`sort_order` API (user-selectable sorting).
5. Edge-case API tests (limit boundary, skip-beyond-end, long search terms).

## 18. Missing Tests

Consolidated from §8 — ordered by priority: **P0:** `getTaskStats()` real-fetch contract test; Dashboard stats integration test. **P1:** `request<T>()` unit tests; Alembic-on-fresh-DB CI check; flipped priority canary; `/health` DB-down test. **P2:** `TaskTable`/`TaskForm` component tests. **P3:** API edge cases; concurrency; cross-user denial (Phase 3).

## 19. Recommended Architecture After Hardening

Keep the current architecture — it is correct at this scale and needs **additions, not rewrites**:

- **Backend:** FastAPI layered (router → service → model) unchanged; add `app/auth/` (Phase 3), `app/dependencies.py` for auth-scoped DB sessions; Postgres replaces SQLite as the deployment DB (Phase 2) with SQLite retained for local dev via `DATABASE_URL`.
- **Database:** managed Postgres (Render) + Alembic chain: `…44840f774604` → priority CHECK (Phase 1) → `users` + `tasks.owner_id` FK (Phase 3) → performance indexes (Phase 4).
- **Frontend:** unchanged structure; `api.ts` gains an auth-header injection point; `useTasks` gains ownership-transparently (server scopes by user).
- **No new infrastructure** beyond a managed DB: no Docker/K8s/Redis/Kafka — nothing in this codebase requires them.

## 20. Detailed Phase 1 Plan — Correctness Stabilization (no new features)

1. **Fix `getTaskStats()`** (`frontend/src/services/api.ts`): call `request<TaskStats>('/tasks/stats')`. Files: `api.ts`. Tests: new `api.ts` contract test (mocked fetch asserting the endpoint), dashboard integration test.
2. **Add `vercel.json`** with `rewrites: [{ source: '/(.*)', destination: '/index.html' }]` (scope to static assets properly) or use Vercel project rewrites. Verify deep-link/refresh on a preview deploy.
3. **Priority CHECK migration:** cleanup migration for any invalid rows → `CHECK (priority IN ('low','medium','high'))` → update model comment → **replace canary** with an assertion that SQLite rejects invalid values (batch-alter handling for SQLite via batch mode).
4. **`/health` DB readiness:** execute `SELECT 1` in `/health`; return `503` + `status: "unhealthy"` on failure. Tests: healthy path, broken-engine path.
5. **Python tooling in CI:** ruff job step; pin `requirements.txt` (exact or lock); move pytest/httpx to `requirements-dev.txt`.
6. **`strict: true`** in `tsconfig.app.json`; fix fallout.
7. **Docs/env hygiene:** README corrections; `.env.production` policy; commit or remove `DEPLOYMENT_DEBUGGING.md`; gate `/docs` behind `DEBUG`.

**PHASE 1 EXIT CRITERIA:** all existing tests green + new tests green locally and in CI; dashboard displays live numbers matching `/stats`; Vercel preview deep-link/refresh returns the app (not 404); direct DB insert of an invalid priority fails; `/health` returns 503 with DB down; `pip install` reproducible; `tsc` strict passes.

## 21. Detailed Phase 2 Plan — Production Data Layer

1. Provision managed Postgres (Render); set `DATABASE_URL` in Render env (staging + production); add `psycopg[binary]` dependency.
2. Run `alembic upgrade head` against a fresh Postgres in **CI** (service container) to prove migration validity on the real target DB.
3. Configure engine for Postgres (pool size/recycle); keep `check_same_thread` SQLite-only.
4. Enable Render PG backups; document restore drill.
5. Local dev remains SQLite (documented) — one env var difference, nothing else.

**PHASE 2 EXIT CRITERIA:** app runs on Postgres in staging with data surviving a redeploy; CI proves migrations apply to empty Postgres; backup restore rehearsed once; no SQLite-only code paths in prod config.

## 22. Detailed Phase 3 Plan — Authentication & Ownership

1. `users` table migration (id, email unique, password_hash, timestamps).
2. Registration/login endpoints (bcrypt/argon2 hashing), JWT (or server-session) tokens; token handling in `api.ts` (single injection point).
3. `tasks.owner_id` FK migration + backfill strategy; **every** task query scoped by owner (service layer); 401/403 semantics; `GET /tasks/...` and stats scoped per user.
4. Rate limiting on auth + write endpoints.
5. CORS revisit: explicit methods/headers; decide on `allow_credentials`.
6. Tests: registration/login happy+edge, token expiry/invalid, **cross-user access denial on every route**, ownership-scoped list/stats.

**PHASE 3 EXIT CRITERIA:** unauthenticated requests get 401 on all task routes; users cannot read/modify/delete other users' tasks (proven by tests); rate limits active; CORS tightened without breaking the deployed frontend.

## 23. Detailed Phase 4 Plan — Hardening

1. Security-headers middleware (HSTS, X-Content-Type-Options, frame options, CSP for the SPA).
2. Dependency scanning in CI (`pip-audit`, `npm audit` — non-blocking first, then gating).
3. Structured logging + request IDs; error tracking (hosting-native or Sentry-class).
4. Coverage gates (backend ≥ 80%, frontend ≥ 70%); component tests for `TaskTable`/`TaskForm`.
5. Performance pass: composite `(created_at DESC, id DESC)` index migration; FTS (`tsvector`) for search; frontend mutation-driven cache updates instead of full refetch.

**PHASE 4 EXIT CRITERIA:** headers present on responses; scanners green/gating; logs carry request IDs; coverage gates enforced in CI; index migration applied; search p95 latency acceptable at seeded data volumes.

## 24. Detailed Phase 5 Plan — Operational Maturity

1. Staging environment (separate Render + Vercel projects, own DB) + PR preview deploys.
2. Migration runbook (forward/rollback, backup-before-migrate policy).
3. Monitoring/alerting: uptime checks on `/health` (now DB-aware), error-rate alerts, Render metric alerts.
4. Backup restore verification (scheduled drill, not just enabled backups).
5. Load test at target scale; capacity notes; final sign-off against the checklist below.

**PHASE 5 EXIT CRITERIA:** production readiness checklist fully checked with evidence; staging mirrors production config; a full deploy + rollback + restore drill executed successfully.

## 25. Final Production Readiness Checklist

| # | Item | Status |
|---|---|---|
| 1 | Backend tests green | ✅ 111/111 (2.85 s) |
| 2 | Frontend tests green | ✅ 20/20 |
| 3 | Frontend lint/build green | ✅ 0 errors / build 284 kB (87 kB gz) |
| 4 | CI gates all PRs | ✅ (scope limits noted in §9) |
| 5 | Dashboard consumes real `/stats` | ❌ P0-3 |
| 6 | Data survives deploys | ❌ P0-2 (SQLite ephemeral) |
| 7 | Authentication | ❌ P0-1 |
| 8 | Authorization/ownership | ❌ P0-1 |
| 9 | DB enforces priority | ❌ P1 (canary pins gap) |
| 10 | SPA deep links work in prod | ❌ P0-4 |
| 11 | Health endpoint verifies DB | ❌ P1 |
| 12 | CORS configured for production origin | ⚠️ mechanism ready; ops-dependent |
| 13 | Reproducible backend builds | ❌ P1 (floor-only pins) |
| 14 | Secrets free repo & history | ✅ verified |
| 15 | Error responses leak nothing | ✅ verified |
| 16 | Migrations valid on target prod DB | ❌ P2 plan (unproven on Postgres) |
| 17 | Rate limiting | ❌ Phase 3 |
| 18 | Security headers / scanning | ❌ Phase 4 |
| 19 | Staging environment | ❌ Phase 5 |
| 20 | Backup + restore verified | ❌ Phase 5 |

---

*Report generated as the Phase 0 deliverable. Facts above are traceable to files, commits, and executed commands; recommendations are explicitly separated from observations. No Phase 1 implementation was performed during this audit.*
