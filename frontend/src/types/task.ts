export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  high: number;
  medium: number;
  low: number;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  priority?: Priority;
  completed?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  priority?: Priority;
  completed?: boolean;
}

export interface ApiError {
  detail: string;
}
