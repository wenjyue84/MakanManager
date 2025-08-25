# Task Management CRUD Operations

This document describes the complete CRUD (Create, Read, Update, Delete) operations implemented for the Tasks section of the MakanManager restaurant management system.

## Overview

The Task Management system provides comprehensive functionality for managing restaurant tasks, including creation, assignment, tracking, and completion workflows. The system supports role-based access control and integrates with the existing user management and points system.

## Components

### 1. TaskCreateModal (`src/components/modals/task-create-modal.tsx`)
- **Purpose**: Create new tasks with full configuration options
- **Features**:
  - Task title and description
  - Station assignment (kitchen, front, store, outdoor)
  - Due date and time selection
  - Base points configuration
  - Assignee selection (optional)
  - Proof type requirements (photo, text, checklist, none)
  - Repeat schedule options (daily, weekly, monthly, custom)

### 2. TaskEditModal (`src/components/modals/task-edit-modal.tsx`)
- **Purpose**: Edit existing tasks with permission controls
- **Features**:
  - Full task editing capabilities
  - Status management
  - Permission-based access control
  - Delete functionality with confirmation
  - Form validation

### 3. TaskDetailModal (`src/components/modals/task-detail-modal.tsx`)
- **Purpose**: View task details and perform workflow actions
- **Features**:
  - Task information display
  - Status transitions
  - Proof submission
  - Approval workflow
  - Point adjustments

### 4. TaskList (`src/components/task-management/task-list.tsx`)
- **Purpose**: Main interface for task management
- **Features**:
  - Comprehensive task listing
  - Advanced filtering and search
  - Bulk operations
  - CRUD action integration
  - Responsive design

### 5. TaskManagementDemo (`src/components/pages/task-management-demo.tsx`)
- **Purpose**: Demo page showcasing all CRUD operations
- **Features**:
  - Feature overview
  - Statistics display
  - Interactive task management interface

## CRUD Operations

### Create (C)
```typescript
const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'overdueDays'>) => {
  const newTask: Task = {
    ...taskData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    overdueDays: 0
  };
  
  const updatedTasks = [newTask, ...tasks];
  onTasksChange(updatedTasks);
  toast.success('Task created successfully!');
};
```

**Features**:
- Form validation for required fields
- Default value assignment
- Real-time feedback
- Integration with existing data structure

### Read (R)
```typescript
const handleViewTask = (task: Task) => {
  setSelectedTask(task);
  setIsDetailModalOpen(true);
};
```

**Features**:
- Task detail display
- Status information
- Assignment details
- Proof requirements
- Workflow actions

### Update (U)
```typescript
const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
  const updatedTasks = tasks.map(task =>
    task.id === taskId ? { ...task, ...updates } : task
  );
  onTasksChange(updatedTasks);
  toast.success('Task updated successfully!');
};
```

**Features**:
- Partial updates support
- Permission-based editing
- Form validation
- Real-time updates

### Delete (D)
```typescript
const handleDeleteTask = (taskId: string) => {
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  onTasksChange(updatedTasks);
  toast.success('Task deleted successfully!');
};
```

**Features**:
- Confirmation dialogs
- Bulk deletion support
- Permission controls
- Immediate feedback

## Advanced Features

### Filtering and Search
- **Status filtering**: Open, In Progress, On Hold, Pending Review, Overdue, Done
- **Station filtering**: Kitchen, Front, Store, Outdoor
- **Assignee filtering**: By specific user
- **Search**: Across title and description
- **Repeat tasks**: Toggle for recurring tasks only

### Bulk Operations
- **Multi-select**: Checkbox-based task selection
- **Bulk delete**: Remove multiple tasks at once
- **Bulk actions**: Extensible for future operations

### Permission System
```typescript
const isManagement = currentUser.roles.some(role => 
  ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
);

const canEdit = task && (
  currentUser.roles.includes('owner') ||
  currentUser.roles.includes('manager') ||
  currentUser.roles.includes('head-of-kitchen') ||
  currentUser.roles.includes('front-desk-manager') ||
  task.assignerId === currentUser.id
);
```

### Data Validation
- Required field validation
- Date/time validation
- Point value constraints
- Custom repeat schedule validation

## Database Integration

The system integrates with the existing PostgreSQL database through the `TasksService`:

```typescript
export class TasksService {
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'overdueDays'>): Promise<Task>
  async getTaskById(id: string): Promise<Task | null>
  async updateTask(id: string, taskData: Partial<Task>): Promise<Task | null>
  async deleteTask(id: string): Promise<boolean>
  async getTasksByStatus(status: TaskStatus): Promise<Task[]>
  async getTasksByAssignee(assigneeId: string): Promise<Task[]>
  async getTasksByStation(station: Station): Promise<Task[]>
}
```

## User Experience Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-friendly interactions

### Real-time Feedback
- Toast notifications for all operations
- Loading states during operations
- Error handling with user-friendly messages

### Intuitive Interface
- Consistent UI patterns
- Clear action buttons
- Contextual help and descriptions

## Navigation Integration

The Task Management system is integrated into the main navigation:

```typescript
{
  id: 'task-management', 
  label: 'Task Management', 
  icon: CheckSquare, 
  description: 'Full CRUD operations for tasks', 
  managementOnly: true
}
```

Accessible via the Operations section in the sidebar navigation.

## Usage Examples

### Creating a New Task
1. Navigate to Task Management
2. Click "New Task" button
3. Fill in required fields (title, description, station, due date/time)
4. Configure optional settings (assignee, proof type, repeat schedule)
5. Submit form

### Editing an Existing Task
1. Click the edit button (pencil icon) on any task row
2. Modify desired fields
3. Save changes or delete the task

### Bulk Operations
1. Select multiple tasks using checkboxes
2. Choose bulk action from the action bar
3. Confirm operation

### Filtering Tasks
1. Use the filter panel to set criteria
2. Apply multiple filters simultaneously
3. Clear filters when needed

## Future Enhancements

- **API Integration**: Connect to backend services
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Workflows**: Custom approval processes
- **Reporting**: Task analytics and performance metrics
- **Mobile App**: Native mobile application
- **Notifications**: Push notifications for task updates

## Technical Implementation

### State Management
- React hooks for local state
- Props for component communication
- Context for global state (if needed)

### Performance Optimization
- Memoized filtering
- Efficient re-renders
- Lazy loading for large datasets

### Error Handling
- Form validation errors
- API error handling
- User-friendly error messages

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support

## Conclusion

The Task Management CRUD system provides a comprehensive solution for restaurant task management with:
- Full CRUD operations
- Advanced filtering and search
- Role-based permissions
- Bulk operations
- Responsive design
- Integration with existing systems

The system is designed to be scalable, maintainable, and user-friendly while providing powerful functionality for restaurant managers and staff.
