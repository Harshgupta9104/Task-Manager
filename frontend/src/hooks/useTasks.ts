import { useCallback, useEffect, useState } from 'react';
import {
  getTasks as apiGetTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '../services/api';
import type { Priority, Task, TaskCreate, TaskUpdate } from '../types/task';
import { useDebounce } from './useDebounce';

export const PAGE_SIZE = 10;

/** How long typing must pause before a search request is issued. */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Applied task-list query state. This is the single source of truth the
 * fetch effect reacts to. `search` is the effective (trimmed) search term
 * actually sent to the API, not the raw text currently in the search box.
 */
export interface TaskQueryState {
  page: number;
  /** null = all, true = completed only, false = pending only. */
  filter: boolean | null;
  priority: Priority | null;
  /** Applied search term ('' = no search filter). */
  search: string;
}

const INITIAL_QUERY: TaskQueryState = {
  page: 0,
  filter: null,
  priority: null,
  search: '',
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/**
 * The single frontend abstraction for task-list data. Owns the task list,
 * its query/filter/search state, the debounced search input, the
 * authoritative fetch effect (with stale-request protection), and the task
 * mutations. Pages consume this hook instead of calling the tasks API
 * directly or running their own fetch effects.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<TaskQueryState>(INITIAL_QUERY);

  // Raw search box content: updates on every keystroke so the input feels
  // instant. Only its debounced, trimmed value reaches the applied query.
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearchInput = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);
  // Whitespace-only input is not a search filter.
  const effectiveSearch = debouncedSearchInput.trim();

  // Bumped by refresh() to re-run the fetch effect through the same single
  // mechanism (used after mutations and by the Retry/refresh buttons).
  const [reloadToken, setReloadToken] = useState(0);

  // Commit the debounced search into the applied query during render (the
  // React-documented "adjusting state when a value changes" pattern). A
  // change of the *effective* search restarts pagination; a whitespace-only
  // variation of the same search is a no-op (so it does not refetch).
  // Adjusting during render lets the very next render — the one whose effects
  // run — already see a consistent query, so exactly one request is issued
  // per effective-search change.
  const [prevEffectiveSearch, setPrevEffectiveSearch] = useState(effectiveSearch);
  if (prevEffectiveSearch !== effectiveSearch) {
    setPrevEffectiveSearch(effectiveSearch);
    setQuery((q) =>
      q.search === effectiveSearch ? q : { ...q, search: effectiveSearch, page: 0 },
    );
  }

  // Single authoritative task-list fetch. The superseded request is aborted
  // and, belt-and-braces, flagged inactive so a late response can never
  // overwrite newer task state.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      try {
        const data = await apiGetTasks(
          {
            skip: query.page * PAGE_SIZE,
            limit: PAGE_SIZE,
            completed: query.filter,
            priority: query.priority,
            search: query.search || null,
          },
          controller.signal,
        );
        // Superseded: never overwrite newer task state.
        if (!active) return;
        setTasks(data.tasks);
        setTotal(data.total);
        setError(null);
      } catch (err) {
        // A cancelled request is a normal lifecycle event, not an app error:
        // leave tasks/error exactly as the newer request left them.
        if (!active || controller.signal.aborted) return;
        setError(errorMessage(err, 'Failed to load tasks'));
      } finally {
        // Never let a stale request settle loading for the newer one.
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [query, reloadToken]);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  const setPage = useCallback((page: number) => {
    setQuery((q) => (q.page === page ? q : { ...q, page }));
  }, []);

  // Filters always restart the list at the first page, inside the hook, so
  // the behavior cannot diverge between components. Setting one to its
  // current value is a no-op (and therefore does not refetch).
  const setFilter = useCallback((filter: boolean | null) => {
    setQuery((q) => (q.filter === filter ? q : { ...q, filter, page: 0 }));
  }, []);

  const setPriorityFilter = useCallback((priority: Priority | null) => {
    setQuery((q) => (q.priority === priority ? q : { ...q, priority, page: 0 }));
  }, []);

  // --- Mutations ---
  // Each mutation delegates to the API layer and then refreshes the list via
  // the fetch mechanism above. Errors are rethrown so callers decide how to
  // surface them (e.g. toasts, keeping the form open).

  const createTask = useCallback(
    async (data: TaskCreate) => {
      await apiCreateTask(data);
      refresh();
    },
    [refresh],
  );

  const updateTask = useCallback(
    async (id: number, data: TaskUpdate) => {
      await apiUpdateTask(id, data);
      refresh();
    },
    [refresh],
  );

  const deleteTask = useCallback(
    async (id: number) => {
      await apiDeleteTask(id);
      refresh();
    },
    [refresh],
  );

  const toggleComplete = useCallback(
    async (task: Task) => {
      await apiUpdateTask(task.id, { completed: !task.completed });
      refresh();
    },
    [refresh],
  );

  return {
    // Task list data
    tasks,
    total,
    loading,
    error,
    // Query state
    page: query.page,
    filter: query.filter,
    priorityFilter: query.priority,
    /** Applied (debounced, trimmed) search term actually sent to the API. */
    search: query.search,
    pageSize: PAGE_SIZE,
    /** Raw search box content: what the user is actively typing. */
    searchInput,
    // Query operations
    setPage,
    setFilter,
    setPriorityFilter,
    setSearchInput,
    refresh,
    // Mutations
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
  };
}
