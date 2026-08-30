import { ExternalLink, Code2, Zap, GitFork } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const techStack = [
  { name: 'React 19', desc: 'UI framework' },
  { name: 'TypeScript', desc: 'Type safety' },
  { name: 'Tailwind CSS v4', desc: 'Styling' },
  { name: 'FastAPI', desc: 'Backend API' },
  { name: 'SQLAlchemy', desc: 'ORM' },
  { name: 'SQLite', desc: 'Database' },
];

const features = [
  'Create, edit, and delete tasks',
  'Priority levels (low, medium, high)',
  'Completion tracking with toggle',
  'Dashboard with analytics',
  'Search and filter capabilities',
  'Responsive design for all devices',
  'Dark mode with animated toggle',
  'Keyboard shortcuts (Escape to close)',
  'Toast notifications for feedback',
];

export function AboutPage() {
  useDocumentTitle('About');

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">About TaskFlow</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A modern task management application</p>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 shadow-lg">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">TaskFlow</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">v1.0.0</p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          TaskFlow is a full-stack task management application built with modern web technologies.
          It features a clean, intuitive interface designed to help you stay organized and productive.
          The app follows a client-server architecture with a FastAPI backend and React frontend.
        </p>
      </div>

      {/* Creator */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Creator</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-bold text-lg">
            TF
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">TaskFlow Team</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Built with passion for productivity</p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Code2 className="h-4 w-4 text-sky-600" />
          Tech Stack
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{tech.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Features</h3>
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Links */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Links</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            API Docs
          </a>
          <a
            href="/redoc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            ReDoc
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <GitFork className="h-4 w-4" />
            Source Code
          </a>
        </div>
      </div>
    </div>
  );
}
