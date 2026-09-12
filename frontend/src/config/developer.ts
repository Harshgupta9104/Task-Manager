import type { LucideIcon } from 'lucide-react';
import {
  Atom,
  Beaker,
  BookOpen,
  Braces,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  FileCode2,
  FlaskConical,
  GitBranch,
  GitFork,
  Globe,
  Layers,
  Monitor,
  Palette,
  Rocket,
  ScrollText,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  TestTube2,
  Workflow,
  Zap,
} from 'lucide-react';

/**
 * Centralized content for the Developer page.
 *
 * Everything shown on /developer comes from this file — page components
 * should not hardcode the same facts. Only verified links/claims belong
 * here; if a link is unknown, leave it out instead of inventing a URL.
 * Planned-but-unbuilt technologies must not be listed here.
 */

// ── Developer identity ──────────────────────────────────────────────
// GitHub URL is the repository owner's profile (verified).
// LinkedIn/portfolio are intentionally absent — add them here (with real
// URLs) and they will automatically appear in the hero when provided.
export interface SocialLink {
  label: string;
  url: string;
  icon: LucideIcon;
}

export const developer = {
  name: 'Harsh Gupta',
  role: 'Full-Stack Developer',
  avatarInitials: 'HG',
  intro:
    'Developer of TaskFlow — a full-stack task management application with a FastAPI backend, a type-safe React frontend, and a production deployment pipeline.',
  about: [
    'Harsh Gupta is a full-stack developer focused on building complete products end to end — from REST API design and database modelling to polished, responsive user interfaces.',
    'TaskFlow reflects that approach: a FastAPI backend with strict input validation, a type-safe React frontend sharing types with the API, and a deployment setup that keeps both online. Interests include clean architecture, maintainable code, and the small UX details that make tools pleasant to use.',
  ],
  socialLinks: [
    {
      label: 'GitHub',
      url: 'https://github.com/Harshgupta9104',
      icon: GitFork,
    },
    // { label: 'LinkedIn', url: '<add real URL>', icon: Globe },
    // { label: 'Portfolio', url: '<add real URL>', icon: Globe },
  ] satisfies SocialLink[],
};

// ── Technology stack (verified against this repository) ─────────────
export interface TechItem {
  name: string;
  desc: string;
  icon: LucideIcon;
}

export interface TechCategory {
  name: string;
  icon: LucideIcon;
  items: TechItem[];
}

export const techStack: TechCategory[] = [
  {
    name: 'Frontend',
    icon: Monitor,
    items: [
      { name: 'React 19', desc: 'Component-based UI library', icon: Atom },
      { name: 'TypeScript', desc: 'Static type safety across the app', icon: Braces },
      { name: 'Vite 8', desc: 'Dev server & production bundler', icon: Zap },
      { name: 'Tailwind CSS v4', desc: 'Utility-first styling system', icon: Palette },
      { name: 'React Router 7', desc: 'Client-side routing', icon: Workflow },
      { name: 'Lucide React', desc: 'Icon system', icon: Sparkles },
    ],
  },
  {
    name: 'Backend',
    icon: Server,
    items: [
      { name: 'FastAPI', desc: 'Async REST API framework', icon: Rocket },
      { name: 'Pydantic', desc: 'Request & response validation', icon: ShieldCheck },
      { name: 'SQLAlchemy', desc: 'ORM and database toolkit', icon: Layers },
      { name: 'Alembic', desc: 'Versioned database migrations', icon: GitBranch },
      { name: 'Uvicorn', desc: 'ASGI server', icon: Terminal },
    ],
  },
  {
    name: 'Database',
    icon: Database,
    items: [{ name: 'SQLite', desc: 'Embedded relational database', icon: FileCode2 }],
  },
  {
    name: 'Testing',
    icon: FlaskConical,
    items: [
      { name: 'Pytest', desc: 'Backend API test suite', icon: TestTube2 },
      { name: 'Vitest + Testing Library', desc: 'Component & hook tests', icon: Beaker },
    ],
  },
  {
    name: 'Tooling & CI',
    icon: CheckCircle2,
    items: [
      { name: 'Oxlint', desc: 'Fast JavaScript/TypeScript linter', icon: Code2 },
      { name: 'GitHub Actions', desc: 'CI pipeline on every push', icon: GitFork },
    ],
  },
  {
    name: 'Deployment',
    icon: Cloud,
    items: [
      { name: 'Vercel', desc: 'Frontend hosting', icon: Globe },
      { name: 'Render', desc: 'Backend hosting', icon: Zap },
    ],
  },
];

// ── Why TaskFlow exists ─────────────────────────────────────────────
export const whyTaskFlow = {
  intro:
    'TaskFlow began as a practical exercise in shipping a complete, production-oriented web product — not isolated snippets, but an application with a real API, real persistence, and a real deployment.',
  motivations: [
    'Design a clean, versioned REST API with filtering, pagination, and search',
    'Enforce strict validation and predictable error responses at the API boundary',
    'Persist data reliably with an ORM and versioned migrations',
    'Build a responsive, accessible interface on a consistent design system',
    'Keep the whole stack healthy with automated tests and CI',
  ],
};

// ── Engineering highlights (verified features of this repository) ───
export interface Highlight {
  title: string;
  desc: string;
  icon: LucideIcon;
}

export const engineeringHighlights: Highlight[] = [
  {
    title: 'REST API',
    desc: 'FastAPI backend with versioned routes, pagination, filtering, and full-text search.',
    icon: Server,
  },
  {
    title: 'Type-Safe Frontend',
    desc: 'React + TypeScript with shared types mirroring the API schemas.',
    icon: Braces,
  },
  {
    title: 'Validation & Error Handling',
    desc: 'Pydantic schemas validate every request; strict null rejection and consistent 4xx responses.',
    icon: ShieldCheck,
  },
  {
    title: 'Database Layer',
    desc: 'SQLAlchemy ORM with Alembic-managed migrations on SQLite.',
    icon: Layers,
  },
  {
    title: 'Automated Testing',
    desc: 'Backend and frontend test suites run in CI on every push.',
    icon: FlaskConical,
  },
  {
    title: 'Responsive UI',
    desc: 'Glass-morphism interface that adapts from mobile to desktop, with dark mode.',
    icon: Monitor,
  },
];

// ── Project links (all verified live) ───────────────────────────────
export interface ProjectLink {
  label: string;
  desc: string;
  url: string;
  icon: LucideIcon;
}

export const projectLinks: ProjectLink[] = [
  {
    label: 'GitHub Repository',
    desc: 'Source code for the API and frontend',
    url: 'https://github.com/Harshgupta9104/Task-Manager',
    icon: GitFork,
  },
  {
    label: 'Live Application',
    desc: 'TaskFlow running on Vercel',
    url: 'https://task-manager-pi-gray.vercel.app',
    icon: Globe,
  },
  {
    label: 'Live API',
    desc: 'FastAPI backend hosted on Render',
    url: 'https://task-manager-y9as.onrender.com',
    icon: Cloud,
  },
  {
    label: 'Swagger UI',
    desc: 'Interactive OpenAPI documentation',
    url: 'https://task-manager-y9as.onrender.com/docs',
    icon: ScrollText,
  },
  {
    label: 'ReDoc',
    desc: 'Reference-style API documentation',
    url: 'https://task-manager-y9as.onrender.com/redoc',
    icon: BookOpen,
  },
];
