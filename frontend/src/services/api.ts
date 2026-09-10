import type { Task, TaskListResponse, TaskStats, TaskCreate, TaskUpdate, Priority } from '../types/task';

/**
 * Single authoritative location for API URL construction.
 *
 * The base URL comes from VITE_API_URL (set in frontend/.env). When unset
 * (e.g. local dev without an .env), falls back to the same-origin path that
 * the Vite dev server proxies to the backend.
 */
const API_BASE: string = import.meta.env.VITE_API_URL || '/api/v1';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  // `options` may carry an AbortSignal; headers default to JSON but can be
  // overridden by the caller.
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An unexpected error occurred' }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Tasks
export async function getTasks(
  params?: {
    skip?: number;
    limit?: number;
    completed?: boolean | null;
    priority?: Priority | null;
    search?: string | null;
  },
  signal?: AbortSignal,
): Promise<TaskListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.skip !== undefined) searchParams.set('skip', String(params.skip));
  if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params?.completed !== null && params?.completed !== undefined) {
    searchParams.set('completed', String(params.completed));
  }
  if (params?.priority !== null && params?.priority !== undefined) {
    searchParams.set('priority', params.priority);
  }
  if (params?.search !== null && params?.search !== undefined && params.search.trim()) {
    searchParams.set('search', params.search.trim());
  }
  const query = searchParams.toString();
  return request<TaskListResponse>(`/tasks/${query ? `?${query}` : ''}`, { signal });
}

export async function getTask(id: number): Promise<Task> {
  return request<Task>(`/tasks/${id}`);
}

export async function createTask(data: TaskCreate): Promise<Task> {
  return request<Task>('/tasks/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(id: number, data: TaskUpdate): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id: number): Promise<void> {
  return request<void>(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

// Stats
export async function getTaskStats(): Promise<TaskStats> {
  // Return default stats object without calling /tasks/stats endpoint
  return {
    total: 0,
    completed: 0,
    pending: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
}
