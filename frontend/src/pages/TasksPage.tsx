import { useState } from 'react';
import { Plus, ListTodo } from 'lucide-react';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskForm } from '../components/tasks/TaskForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

import type { Task, TaskCreate, TaskUpdate } from '../types/task';
import { useTasks } from '../hooks/useTasks';
import { useToast } from '../hooks/useToast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function TasksPage() {
  useDocumentTitle('Tasks');

  // All task-list data, query state, and mutations come from the hook.
  const {
    tasks,
    total,
    loading,
    error,
    page,
    pageSize,
    filter,
    priorityFilter,
    searchInput,
    setPage,
    setFilter,
    setPriorityFilter,
    setSearchInput,
    refresh,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
  } = useTasks();

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  async function handleCreate(data: TaskCreate | TaskUpdate) {
    try {
      await createTask(data as TaskCreate);
      addToast('success', 'Task created successfully');
      setFormOpen(false);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  }

  async function handleUpdate(data: TaskCreate | TaskUpdate) {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data as TaskUpdate);
      addToast('success', 'Task updated successfully');
      setFormOpen(false);
      setEditingTask(null);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      addToast('success', 'Task deleted');
      setDeleteTarget(null);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleComplete(task: Task) {
    try {
      await toggleComplete(task);
    } catch {
      addToast('error', 'Failed to update task');
    }
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
    setEditingTask(null);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Tasks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total} total task{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Error loading tasks</p>
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state when no tasks at all */}
      {!loading && total === 0 && !error ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
            <ListTodo className="h-7 w-7 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No tasks yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first task</p>
          <button
            onClick={() => setFormOpen(true)}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          total={total}
          loading={loading}
          page={page}
          pageSize={pageSize}
          filter={filter}
          priorityFilter={priorityFilter}
          search={searchInput}
          onPageChange={setPage}
          onFilterChange={setFilter}
          onPriorityFilterChange={setPriorityFilter}
          onSearchChange={setSearchInput}
          onRefresh={refresh}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onToggleComplete={handleToggleComplete}
        />
      )}

      {/* Task Form */}
      <TaskForm
        key={formOpen ? editingTask?.id ?? 'create' : 'closed'}
        open={formOpen}
        task={editingTask}
        onSubmit={editingTask ? handleUpdate : handleCreate}
        onClose={handleCloseForm}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
