import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Task } from '../../types/task';

interface RecentTasksProps {
  tasks: Task[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  if (tasks.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Tasks</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-white/10 mb-3">
            <Clock className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No tasks yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Create your first task to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-900/5 dark:border-white/10">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Tasks</h3>
        <Link
          to="/tasks"
          className="group text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="divide-y divide-gray-900/5 dark:divide-white/10">
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className="flex items-center gap-3 px-6 py-3 hover:bg-white/50 dark:hover:bg-white/5 hover:translate-x-0.5 transition-all duration-200 animate-fade-up"
            style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
          >
            {task.completed ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                {task.title}
              </p>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{formatDate(task.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}