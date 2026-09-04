import type { Task, TaskListResponse, TaskStats, TaskCreate, TaskUpdate } from '../types/task';

const API_BASE = '/api/v1';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
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
export async function getTasks(params?: {
  skip?: number;
  limit?: number;
  completed?: boolean | null;
  priority?: string | null;
  search?: string | null;
}): Promise<TaskListResponse> {
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
  return request<TaskListResponse>(`/tasks/${query ? `?${query}` : ''}`);
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
  return request<TaskStats>('/tasks/stats');
}

// Health
export async function getHealth(): Promise<{ status: string; app: string; version: string }> {
  const response = await fetch('/');
  return response.json();
}
