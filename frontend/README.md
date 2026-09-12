# TaskFlow — Frontend

React 19 + TypeScript + Vite frontend for the TaskFlow task management application.

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Vite 8](https://vitejs.dev/) | Build tool and dev server |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework |
| [React Router 7](https://reactrouter.com/) | Client-side routing |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) | Unit tests |
| [Oxlint](https://oxc.rs/docs/guide/usage/linter) | Linting |

## Getting Started

```bash
# From the frontend directory
npm install
npm run dev
```

The dev server starts at **http://localhost:5173** and proxies `/api/*` and `/health` requests to the backend at `http://localhost:8000` (see `vite.config.ts`).

> **Prerequisite:** The backend must be running for API calls to succeed. See the [root README](../README.md#-running-the-application) for backend setup.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run unit tests with Vitest |
| `npm run lint` | Lint with Oxlint |

## Environment Variables

Create a `.env` file in this directory if needed:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api/v1` (same-origin, proxied by Vite) | Backend API base URL |

**Important for production:** If the frontend and backend are hosted on different domains (e.g., Vercel + Render), `VITE_API_URL` **must** be set at build time — for example `https://your-backend.onrender.com/api/v1`. Without it, every API call returns 404. See the [deployment guide](../docs/DEPLOYMENT_GUIDE.md).

## Project Structure

```
src/
├── components/
│   ├── dashboard/        # Analytics, recent tasks, stat cards
│   ├── layout/           # Sidebar, top bar, page layout
│   ├── tasks/            # Task form & task table
│   └── ui/               # Toast, theme toggle, dialogs, skeletons
├── hooks/                # useTasks, useTheme, useToast, useDebounce, ...
├── pages/                # Dashboard, Tasks, About, 404
├── services/             # api.ts — the single API client
├── test/                 # Vitest setup
├── types/                # Shared TypeScript types
├── App.tsx               # Route definitions
└── main.tsx              # React entry point
```

## Key Conventions

- **Single API client** — All backend calls go through `src/services/api.ts`. The base URL is resolved once from `VITE_API_URL` and never constructed elsewhere.
- **Dark mode** — Managed by `ThemeProvider`/`useTheme` with a persistent preference; styles use Tailwind `dark:` variants.
- **User feedback** — Toast notifications via `useToast`; destructive actions confirm through `ConfirmDialog`.
- **Keyboard support** — `useEscapeKey` closes modals/dialogs with Escape.
- **Document titles** — Each page sets its title with `useDocumentTitle`.
