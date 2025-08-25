export type UserRole = 'owner' | 'manager' | 'head-of-kitchen' | 'front-desk-manager' | 'staff';

export type TaskStatus = 'open' | 'in-progress' | 'on-hold' | 'pending-review' | 'overdue' | 'done';

export type Station = 'kitchen' | 'front' | 'store' | 'outdoor';

export type Language = 'en' | 'id' | 'vi' | 'my';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In production, this should be hashed
  roles: UserRole[];
  avatar?: string;
  phone: string;
  startDate: string;
  emergencyContact: string;
  photo: string;
  station?: Station;
  points: number;
  weeklyPoints: number;
  monthlyPoints: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  station: Station;
  status: TaskStatus;
  dueDate: string;
  dueTime: string;
  basePoints: number;
  finalPoints?: number;
  multiplier?: number;
  adjustment?: number;
  assignerId: string;
  assigneeId?: string;
  proofType: 'photo' | 'text' | 'checklist' | 'none';
  proofData?: any;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'custom';
  overdueDays: number;
  createdAt: string;
  completedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface DisciplinaryAction {
  id: string;
  targetUserId: string;
  type: string;
  points: number;
  reason: string;
  createdById: string;
  createdAt: string;
  attachments?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  photo: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  steps: string[];
  allergens: string[];
  tags: string[];
  prepTime: number;
  station: Station;
}

export interface AppSettings {
  defaultTaskPoints: number;
  minTaskPoints: number;
  maxTaskPoints: number;
  multiplierMin: number;
  multiplierMax: number;
  managementDailyBudget: number;
  defaultOverdueDays: number;
  quietHoursStart: string;
  quietHoursEnd: string;
  rewardThresholds: Array<{
    points: number;
    reward: string;
  }>;
  stations: Station[];
  languages: Language[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}