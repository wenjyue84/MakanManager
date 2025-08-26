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
  gender: 'male' | 'female';
  phone: string;
  startDate: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  status: 'active' | 'inactive';
  photo: string;
  station?: Station;
  documents: UserDocument[];
  points: number;
  weeklyPoints: number;
  monthlyPoints: number;
}

export interface UserDocument {
  id: string;
  name: string;
  type: 'passport' | 'ic' | 'contract' | 'certificate';
  filename: string;
  uploadedBy: string;
  uploadedDate: string;
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
  tags?: string[];
  attachments?: string[];
  comments?: TaskComment[];
  history?: TaskHistory[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  createdAt: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  action: string;
  userId?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  taskId: string;
  remindAt: string;
  message?: string;
  createdAt: string;
}

export interface ReportMetrics {
  tasksOnTimePercent: number;
  spending: number;
  budget: number;
  budgetUtilization: number;
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

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeStep {
  step: number;
  instruction: string;
  timerMinutes?: number;
}

export interface RecipeAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: 'main-dish' | 'soup' | 'beverage' | 'sauce-condiment';
  cuisine: 'malaysian' | 'thai' | 'indonesian';
  station: Station;
  yield: string;
  prepTimeMinutes: number;
  tags: string[];
  photo: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  allergens: ('shellfish' | 'dairy' | 'gluten' | 'nuts' | 'soy' | 'egg')[];
  attachments?: RecipeAttachment[];
  notes?: string;
  lastUpdatedBy?: string;
  lastUpdatedDate?: string;
}

export interface StaffMeal {
  id: string;
  date: string;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'break';
  dishName: string;
  cookedBy: string;
  eaters: string[];
  approximateCost: number;
  photo?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  categories: string[];
  paymentTerms?: string;
  deliveryDays?: string[];
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  level: 'basic' | 'proficient' | 'expert';
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: string;
  requestedVerification: boolean;
  isExclusive?: boolean;
  notes?: string;
  pointsAwarded?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PointEntry {
  id: string;
  userId: string;
  points: number;
  reason?: string;
  createdAt: string;
}