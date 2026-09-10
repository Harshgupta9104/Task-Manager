import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks, PAGE_SIZE, SEARCH_DEBOUNCE_MS } from './useTasks';
import * as api from '../services/api';
import type { Task, TaskListResponse } from '../types/task';

vi.mock('../services/api', () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockedGetTasks = vi.mocked(api.getTasks);
const mockedCreateTask = vi.mocked(api.createTask);
const mockedUpdateTask = vi.mocked(api.updateTask);
const mockedDeleteTask = vi.mocked(api.deleteTask);

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Task 1',
    description: null,
    priority: 'medium',
    completed: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeList(tasks: Task[], total = tasks.length): TaskListResponse {
  return { tasks, total };
}

/** Params the hook should send for the current query state. */
const initialParams = {
  skip: 0,
  limit: PAGE_SIZE,
  completed: null,
  priority: null,
  search: null,
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Flush pending microtasks (promise chains) inside act. */
async function flush() {
  await act(async () => {});
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetTasks.mockResolvedValue(makeList([]));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useTasks', () => {
  it('initializes with empty state and fetches tasks with an AbortSignal on mount', async () => {
    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.error).toBeNull();

    // Initial query: first page, no filters.
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockedGetTasks).toHaveBeenCalledTimes(1);
    expect(mockedGetTasks.mock.calls[0][0]).toEqual(initialParams);
    expect(mockedGetTasks.mock.calls[0][1]).toBeInstanceOf(AbortSignal);
    expect(result.current.page).toBe(0);
    expect(result.current.filter).toBeNull();
    expect(result.current.priorityFilter).toBeNull();
    expect(result.current.search).toBe('');
    expect(result.current.searchInput).toBe('');
  });

  it('stores fetched tasks and total', async () => {
    const tasks = [makeTask(), makeTask({ id: 2, title: 'Task 2' })];
    mockedGetTasks.mockResolvedValue(makeList(tasks, 25));

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toEqual(tasks);
    expect(result.current.total).toBe(25);
    expect(result.current.error).toBeNull();
  });

  it('sets error state when the latest fetch fails', async () => {
    mockedGetTasks.mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network down');
    expect(result.current.tasks).toEqual([]);
  });

  it('passes page changes to the query', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));
    await waitFor(() => expect(mockedGetTasks).toHaveBeenCalledTimes(2));

    expect(mockedGetTasks.mock.calls[1][0]).toEqual({
      ...initialParams,
      skip: 2 * PAGE_SIZE,
    });
    expect(result.current.page).toBe(2);
  });

  it('passes completed filter to the query and resets page', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(3));
    await waitFor(() => expect(result.current.page).toBe(3));

    act(() => result.current.setFilter(true));
    await waitFor(() =>
      expect(mockedGetTasks).toHaveBeenLastCalledWith(
        expect.objectContaining({ completed: true }),
        expect.anything(),
      ),
    );
    expect(result.current.filter).toBe(true);
    expect(result.current.page).toBe(0);
  });

  it('passes priority filter to the query and resets page', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(1));
    await waitFor(() => expect(result.current.page).toBe(1));

    act(() => result.current.setPriorityFilter('high'));
    await waitFor(() =>
      expect(mockedGetTasks).toHaveBeenLastCalledWith(
        expect.objectContaining({ priority: 'high' }),
        expect.anything(),
      ),
    );
    expect(result.current.priorityFilter).toBe('high');
    expect(result.current.page).toBe(0);
  });

  it('applies the debounced search to the query and resets page', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(1));
    await waitFor(() => expect(result.current.page).toBe(1));

    act(() => result.current.setSearchInput('report'));
    await waitFor(() =>
      expect(mockedGetTasks).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'report' }),
        expect.anything(),
      ),
    );
    expect(result.current.search).toBe('report');
    expect(result.current.page).toBe(0);
  });

  it('does not refetch when a setter receives the same value', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(1));
    await waitFor(() => expect(mockedGetTasks).toHaveBeenCalledTimes(2));

    act(() => result.current.setPage(1));
    act(() => result.current.setFilter(null));
    act(() => result.current.setPriorityFilter(null));
    act(() => result.current.setSearchInput(''));

    expect(mockedGetTasks).toHaveBeenCalledTimes(2);
  });

  it('refreshes the list through the same fetch mechanism', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.refresh());
    await waitFor(() => expect(mockedGetTasks).toHaveBeenCalledTimes(2));
    // Same query, no filter/page change: identical request.
    expect(mockedGetTasks.mock.calls[1][0]).toEqual(initialParams);
  });

  it('createTask posts then refreshes the list', async () => {
    mockedCreateTask.mockResolvedValue(makeTask());
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTask({ title: 'New task' });
    });

    expect(mockedCreateTask).toHaveBeenCalledWith({ title: 'New task' });
    expect(mockedGetTasks).toHaveBeenCalledTimes(2);
  });

  it('updateTask puts then refreshes the list', async () => {
    mockedUpdateTask.mockResolvedValue(makeTask({ title: 'Updated' }));
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateTask(1, { title: 'Updated' });
    });

    expect(mockedUpdateTask).toHaveBeenCalledWith(1, { title: 'Updated' });
    expect(mockedGetTasks).toHaveBeenCalledTimes(2);
  });

  it('deleteTask removes then refreshes the list', async () => {
    mockedDeleteTask.mockResolvedValue(undefined);
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTask(7);
    });

    expect(mockedDeleteTask).toHaveBeenCalledWith(7);
    expect(mockedGetTasks).toHaveBeenCalledTimes(2);
  });

  it('toggleComplete flips the completed flag then refreshes', async () => {
    mockedUpdateTask.mockResolvedValue(makeTask({ completed: true }));
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(makeTask({ completed: false }));
    });

    expect(mockedUpdateTask).toHaveBeenCalledWith(1, { completed: true });
    expect(mockedGetTasks).toHaveBeenCalledTimes(2);
  });

  it('propagates mutation errors so callers can surface them', async () => {
    mockedCreateTask.mockRejectedValue(new Error('Title is required'));
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.createTask({ title: '' })).rejects.toThrow('Title is required');
    // Failed mutation must not trigger a refresh.
    expect(mockedGetTasks).toHaveBeenCalledTimes(1);
  });

  it('an older response cannot overwrite newer task state', async () => {
    // Two pending requests: initial mount (A) and a page change (B).
    const requestA = deferred<TaskListResponse>();
    const requestB = deferred<TaskListResponse>();
    mockedGetTasks
      .mockImplementationOnce(() => requestA.promise)
      .mockImplementationOnce(() => requestB.promise);

    const { result } = renderHook(() => useTasks());
    await flush();

    act(() => result.current.setPage(1));
    await flush();

    expect(mockedGetTasks).toHaveBeenCalledTimes(2);
    // Request A was aborted when B started.
    expect(mockedGetTasks.mock.calls[0][1]?.aborted).toBe(true);
    expect(mockedGetTasks.mock.calls[1][1]?.aborted).toBe(false);

    // A resolves *after* B started — it must be ignored entirely.
    await act(async () => {
      requestA.resolve(makeList([makeTask({ id: 99, title: 'Stale' })], 99));
    });
    expect(result.current.tasks).toEqual([]);
    expect(result.current.total).toBe(0);

    // B resolves and becomes the visible state.
    await act(async () => {
      requestB.resolve(makeList([makeTask({ id: 5, title: 'Current' })], 1));
    });
    expect(result.current.tasks).toEqual([makeTask({ id: 5, title: 'Current' })]);
    expect(result.current.total).toBe(1);
  });

  it('does not surface an error when a request is aborted by a newer one', async () => {
    const requestA = deferred<TaskListResponse>();
    const requestB = deferred<TaskListResponse>();
    mockedGetTasks
      .mockImplementationOnce(() => requestA.promise)
      .mockImplementationOnce(() => requestB.promise);

    const { result } = renderHook(() => useTasks());
    await flush();

    act(() => result.current.setPage(1));
    await flush();

    // A fails with the browser's abort error after being cancelled.
    await act(async () => {
      requestA.reject(new DOMException('The operation was aborted.', 'AbortError'));
    });
    expect(result.current.error).toBeNull();

    // B still completes normally.
    await act(async () => {
      requestB.resolve(makeList([makeTask()], 1));
    });
    expect(result.current.error).toBeNull();
    expect(result.current.tasks).toEqual([makeTask()]);
  });
});

describe('useTasks debounced search', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not fetch per keystroke; fetches once after the debounce interval', async () => {
    const { result } = renderHook(() => useTasks());
    await flush();
    expect(mockedGetTasks).toHaveBeenCalledTimes(1);

    // Rapid typing must not trigger requests.
    act(() => result.current.setSearchInput('m'));
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 200);
    });
    act(() => result.current.setSearchInput('me'));
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 200);
    });
    act(() => result.current.setSearchInput('mee'));
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 100);
    });
    expect(mockedGetTasks).toHaveBeenCalledTimes(1);

    // After the user pauses, exactly one request for the final value goes out.
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    expect(mockedGetTasks).toHaveBeenCalledTimes(2);
    expect(mockedGetTasks.mock.calls[1][0]).toEqual({
      ...initialParams,
      search: 'mee',
    });
    expect(result.current.search).toBe('mee');
    expect(result.current.searchInput).toBe('mee');
  });

  it('trims the debounced search before sending it to the API', async () => {
    const { result } = renderHook(() => useTasks());
    await flush();

    act(() => result.current.setSearchInput('  meeting  '));
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS + 50);
    });

    expect(mockedGetTasks).toHaveBeenCalledTimes(2);
    expect(mockedGetTasks.mock.calls[1][0]).toEqual({
      ...initialParams,
      search: 'meeting',
    });
    // The input keeps the raw text; only the applied query is trimmed.
    expect(result.current.searchInput).toBe('  meeting  ');
    expect(result.current.search).toBe('meeting');
  });

  it('treats whitespace-only input as no search and does not refetch', async () => {
    const { result } = renderHook(() => useTasks());
    await flush();

    act(() => result.current.setSearchInput('   '));
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS + 100);
    });

    // Effective search did not change ('' → ''), so no request was issued.
    expect(mockedGetTasks).toHaveBeenCalledTimes(1);
    expect(result.current.search).toBe('');
    expect(result.current.searchInput).toBe('   ');
  });

  it('resets pagination when the effective search changes', async () => {
    const { result } = renderHook(() => useTasks());
    await flush();

    // Move to page 2 (immediate, no debounce involved).
    act(() => result.current.setPage(2));
    await flush();
    expect(mockedGetTasks).toHaveBeenCalledTimes(2);
    expect(result.current.page).toBe(2);

    // Search for something: pagination restarts at the first page.
    act(() => result.current.setSearchInput('meeting'));
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS + 50);
    });

    expect(result.current.page).toBe(0);
    expect(mockedGetTasks).toHaveBeenCalledTimes(3);
    expect(mockedGetTasks.mock.calls[2][0]).toEqual({
      ...initialParams,
      search: 'meeting',
    });
  });
});
