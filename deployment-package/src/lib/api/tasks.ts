import { Task, TaskStatus, Station } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Task API functions
export const tasksApi = {
  // Get all tasks with optional filters
  getTasks: async (filters?: {
    status?: TaskStatus | 'all';
    station?: Station | 'all';
    assigneeId?: string | 'all';
    assignerId?: string | 'all';
  }): Promise<{ tasks: Task[] }> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.station && filters.station !== 'all') params.append('station', filters.station);
    if (filters?.assigneeId && filters.assigneeId !== 'all') params.append('assigneeId', filters.assigneeId);
    if (filters?.assignerId && filters.assignerId !== 'all') params.append('assignerId', filters.assignerId);
    
    const queryString = params.toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Create a new task
  createTask: async (taskData: {
    title: string;
    description: string;
    station: Station;
    points?: number;
    dueAt: string;
    proofType?: 'photo' | 'text' | 'checklist' | 'none';
    allowMultiplier?: boolean;
    assigneeId?: string;
  }): Promise<{ task: Task }> => {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Update a task
  updateTask: async (taskId: string, updateData: Partial<Task>): Promise<{ task: Task }> => {
    return apiRequest(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  // Claim a task
  claimTask: async (taskId: string): Promise<{ task: Task }> => {
    return apiRequest(`/tasks/${taskId}/claim`, {
      method: 'POST',
    });
  },

  // Submit a task for review
  submitTask: async (taskId: string, proofData?: any): Promise<{ task: Task }> => {
    return apiRequest(`/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ proofData }),
    });
  },

  // Approve a task
  approveTask: async (taskId: string, data: {
    multiplier?: number;
    adjustment?: number;
    reason?: string;
  }): Promise<{ 
    task: Task; 
    pointsAwarded: number; 
    remainingBudget: number; 
  }> => {
    return apiRequest(`/tasks/${taskId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reject a task
  rejectTask: async (taskId: string, reason: string): Promise<{ task: Task }> => {
    return apiRequest(`/tasks/${taskId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Put a task on hold
  holdTask: async (taskId: string, reason: string): Promise<{ task: Task }> => {
    return apiRequest(`/tasks/${taskId}/hold`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Resume a task from hold
  resumeTask: async (taskId: string): Promise<{ task: Task }> => {
    return apiRequest(`/tasks/${taskId}/resume`, {
      method: 'POST',
    });
  },
};

// Authentication API functions
export const authApi = {
  // Login user
  login: async (credentials: { username: string; password: string }): Promise<{
    user: any;
    token: string;
  }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: any }> => {
    return apiRequest('/auth/me');
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },

  // Get stored user data
  getStoredUser: (): any => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Leaderboard API functions
export const leaderboardApi = {
  // Get leaderboard
  getLeaderboard: async (filters?: {
    range?: 'weekly' | 'monthly' | 'alltime';
    role?: string | 'all';
    station?: string | 'all';
  }): Promise<{
    leaderboard: any[];
    range: string;
    role: string;
    station: string;
  }> => {
    const params = new URLSearchParams();
    if (filters?.range) params.append('range', filters.range);
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.station && filters.station !== 'all') params.append('station', filters.station);
    
    const queryString = params.toString();
    const endpoint = `/leaderboard${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },
};
