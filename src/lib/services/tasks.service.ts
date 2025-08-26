import { Task, TaskStatus, Station } from '../types';

class TasksService {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || res.statusText);
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }

  getAllTasks(): Promise<Task[]> {
    return this.request<Task[]>('/api/tasks');
  }

  getTaskById(id: string): Promise<Task> {
    return this.request<Task>(`/api/tasks/${id}`);
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'overdueDays'>): Promise<Task> {
    return this.request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  updateTask(id: string, task: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  deleteTask(id: string): Promise<void> {
    return this.request<void>(`/api/tasks/${id}`, { method: 'DELETE' });
  }

  getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    return this.request<Task[]>(`/api/tasks?status=${encodeURIComponent(status)}`);
  }

  getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return this.request<Task[]>(`/api/tasks?assigneeId=${encodeURIComponent(assigneeId)}`);
  }

  getTasksByStation(station: Station): Promise<Task[]> {
    return this.request<Task[]>(`/api/tasks?station=${encodeURIComponent(station)}`);
  }
}

export const tasksService = new TasksService();
export default TasksService;
