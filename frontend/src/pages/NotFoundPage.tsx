import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page Not Found');

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto animate-fade-up">
      <div className="flex h-20 w-20 items-center justify-center rounded-full glass mb-6">
        <span className="text-4xl font-bold text-gradient">404</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page not found</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 glass-input rounded-xl hover:bg-white/70 dark:hover:bg-white/15 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
        <Link
          to="/"
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}