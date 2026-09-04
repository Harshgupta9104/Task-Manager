import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Task, TaskCreate, TaskUpdate, Priority } from '../../types/task';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface TaskFormProps {
  open: boolean;
  task?: Task | null;
  onSubmit: (data: TaskCreate | TaskUpdate) => Promise<void>;
  onClose: () => void;
}

const priorityOptions: { value: Priority; label: string; selected: string }[] = [
  {
    value: 'low',
    label: 'Low',
    selected: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
  },
  {
    value: 'medium',
    label: 'Medium',
    selected: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40',
  },
  {
    value: 'high',
    label: 'High',
    selected: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40',
  },
];

const inputClass =
  'glass-input w-full px-4 py-2.5 text-sm rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all';

export function TaskForm({ open, task, onSubmit, onClose }: TaskFormProps) {
  // State is initialized from the task prop. The parent remounts this
  // component (via a changing `key`) whenever the task or open state
  // changes, so these initializers always run with fresh values.
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [completed, setCompleted] = useState(task?.completed ?? false);
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!task;

  useEscapeKey(onClose, open && !loading);

  function validate() {
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length > 255) {
      newErrors.title = 'Title must be 255 characters or less';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        const data: TaskUpdate = {};
        if (title.trim() !== task!.title) data.title = title.trim();
        if (description !== (task!.description || '')) data.description = description.trim() || null;
        if (priority !== (task!.priority || 'medium')) data.priority = priority;
        if (completed !== task!.completed) data.completed = completed;
        await onSubmit(data);
      } else {
        await onSubmit({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          completed,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl w-full max-w-lg animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-900/5 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-900/5 dark:hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
              placeholder="e.g., Buy groceries"
              className={`${inputClass} ${
                errors.title
                  ? 'border-red-400! focus:ring-red-300/50!'
                  : 'focus:border-sky-300'
              }`}
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
            <div className="flex gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-xl border transition-all ${
                    priority === opt.value
                      ? opt.selected + ' shadow-sm'
                      : 'glass-input text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Completed */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={completed}
              onClick={() => setCompleted(!completed)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                completed
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  completed ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <label className="text-sm text-gray-700 dark:text-gray-300">Mark as completed</label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-900/5 dark:bg-white/10 rounded-xl hover:bg-gray-900/10 dark:hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-5 py-2.5 text-sm font-medium rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}