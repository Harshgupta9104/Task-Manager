import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  Filter,
} from 'lucide-react';
import type { Task, Priority } from '../../types/task';

const priorityBadge: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' },
  medium: { label: 'Medium', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' },
  high: { label: 'High', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20' },
};

interface TaskTableProps {
  tasks: Task[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  filter: boolean | null;
  priorityFilter: string | null;
  search: string;
  onPageChange: (page: number) => void;
  onFilterChange: (filter: boolean | null) => void;
  onPriorityFilterChange: (priority: string | null) => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const controlClass =
  'glass-input rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white/80 dark:focus:bg-white/10 focus:ring-2 focus:ring-sky-400/50 outline-none transition-all';

export function TaskTable({
  tasks,
  total,
  loading,
  page,
  pageSize,
  filter,
  priorityFilter,
  search,
  onPageChange,
  onFilterChange,
  onPriorityFilterChange,
  onSearchChange,
  onRefresh,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-gray-900/5 dark:border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 ${controlClass}`}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={filter === null ? 'all' : filter ? 'completed' : 'pending'}
                onChange={(e) => {
                  const val = e.target.value;
                  onFilterChange(val === 'all' ? null : val === 'completed');
                }}
                className={`pl-9 pr-9 py-2 appearance-none cursor-pointer ${controlClass}`}
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={priorityFilter ?? 'all'}
                onChange={(e) => onPriorityFilterChange(e.target.value === 'all' ? null : e.target.value)}
                className={`px-3 pr-9 py-2 appearance-none cursor-pointer ${controlClass}`}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
              aria-label="Refresh"
            >
              <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-900/5 dark:border-white/10 bg-white/40 dark:bg-white/5">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Title</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Priority</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Description</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Created</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Updated</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900/5 dark:divide-white/10">
            {              loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`}>
                  <td colSpan={7} className="px-5 py-4">
                    <div className="h-4 bg-white/60 dark:bg-white/10 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : tasks.length === 0 ? (
              <tr>                  <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-white/10 mb-3">
                      <Clock className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No tasks found</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {search || filter !== null ? 'Try adjusting your search or filter' : 'Create a task to get started'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task, i) => (
                <tr
                  key={task.id}
                  className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors duration-150 animate-row-in"
                  style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
                >
                  <td className="px-5 py-4">
                    <button
                      onClick={() => onToggleComplete(task)}
                      className="focus:outline-none focus:ring-2 focus:ring-sky-200 rounded cursor-pointer"
                      aria-label={`Mark as ${task.completed ? 'pending' : 'completed'}`}
                    >
                      {task.completed ? (
                        <CheckCircle2 key="done" className="h-5 w-5 text-emerald-500 animate-pop" />
                      ) : (
                        <div
                          key="todo"
                          className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-sky-400 hover:scale-110 transition-all duration-150 animate-pop"
                        />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                      {task.title}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadge[task.priority]?.className ?? priorityBadge.medium.className}`}>
                      {priorityBadge[task.priority]?.label ?? 'Medium'}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {task.description || '—'}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">{formatDate(task.created_at)}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">{formatDate(task.updated_at)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                        aria-label="Edit task"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(task)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-900/5 dark:border-white/10 bg-white/30 dark:bg-white/5">
          <p className="text-xs text-gray-500">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-600 px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}