import { Task, TaskStatus, Station } from '../types';

// Mock tasks data for development
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Clean kitchen equipment',
    description: 'Deep clean all kitchen equipment and surfaces',
    station: 'kitchen',
    status: 'open',
    dueDate: '2025-01-15',
    dueTime: '14:00',
    basePoints: 20,
    assignerId: '1',
    tags: ['cleaning', 'equipment'],
    attachments: [],
    createdAt: new Date().toISOString(),
    overdueDays: 0
  },
  {
    id: '2', 
    title: 'Update menu display',
    description: 'Update the front counter menu display with new items',
    station: 'front',
    status: 'in-progress',
    dueDate: '2025-01-16',
    dueTime: '10:00',
    basePoints: 15,
    assignerId: '1',
    assigneeId: '2',
    tags: ['display', 'menu'],
    attachments: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    overdueDays: 0
  },
  {
    id: '3',
    title: 'Stock inventory check',
    description: 'Count and update inventory for all store items',
    station: 'store',
    status: 'pending-review',
    dueDate: '2025-01-14',
    dueTime: '16:00',
    basePoints: 30,
    assignerId: '1',
    assigneeId: '3',
    tags: ['inventory', 'stock'],
    attachments: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    completedAt: new Date().toISOString(),
    overdueDays: 0
  }
];

export class TasksService {
  async getAllTasks(): Promise<Task[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockTasks]);
      }, 100);
    });
  }

  async getTaskById(id: string): Promise<Task | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const task = mockTasks.find(t => t.id === id);
        resolve(task || null);
      }, 50);
    });
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'overdueDays'>): Promise<Task> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString(),
          overdueDays: 0
        };
        
        mockTasks.unshift(newTask);
        resolve(newTask);
      }, 100);
    });
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const taskIndex = mockTasks.findIndex(t => t.id === id);
        if (taskIndex === -1) {
          resolve(null);
          return;
        }

        const updatedTask = {
          ...mockTasks[taskIndex],
          ...taskData,
          id // Preserve original ID
        };

        mockTasks[taskIndex] = updatedTask;
        resolve(updatedTask);
      }, 100);
    });
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredTasks = mockTasks
          .filter(task => task.status === status)
          .sort((a, b) => {
            // Sort by due date, then due time
            if (a.dueDate !== b.dueDate) {
              return (a.dueDate || '').localeCompare(b.dueDate || '');
            }
            return (a.dueTime || '').localeCompare(b.dueTime || '');
          });
        
        resolve(filteredTasks);
      }, 100);
    });
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredTasks = mockTasks
          .filter(task => task.assigneeId === assigneeId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        resolve(filteredTasks);
      }, 100);
    });
  }

  async getTasksByStation(station: Station): Promise<Task[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredTasks = mockTasks
          .filter(task => task.station === station)
          .sort((a, b) => {
            // Sort by due date, then due time
            if (a.dueDate !== b.dueDate) {
              return (a.dueDate || '').localeCompare(b.dueDate || '');
            }
            return (a.dueTime || '').localeCompare(b.dueTime || '');
          });
        
        resolve(filteredTasks);
      }, 100);
    });
  }

  private async request<T>(url: string, options: RequestInit): Promise<T> {
    // Mock implementation for API requests
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // This is a mock - in a real implementation this would make HTTP requests
        reject(new Error('Mock implementation - API requests not supported'));
      }, 100);
    });
  }
}

export const tasksService = new TasksService();
export default TasksService;