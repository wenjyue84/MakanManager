"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Star,
  User,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { StatusChip } from '../ui/status-chip';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Task, Station, TaskStatus, User as UserType } from '../../lib/types';
import { users } from '../../lib/data';
import { useCurrentUser } from '../../lib/hooks/use-current-user';
import { TaskCreateModal } from '../modals/task-create-modal';
import { TaskEditModal } from '../modals/task-edit-modal';
import { TaskDetailModal } from '../modals/task-detail-modal';
import { toast } from 'sonner';

interface TaskListProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

export function TaskList({ tasks, onTasksChange }: TaskListProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedStation, setSelectedStation] = useState<Station | 'all'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedAssigner, setSelectedAssigner] = useState<string>('all');
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const stations: Station[] = ['kitchen', 'front', 'store', 'outdoor'];
  const statuses: TaskStatus[] = ['open', 'in-progress', 'on-hold', 'pending-review', 'overdue', 'done'];

  // Filter tasks based on current filters
  useEffect(() => {
    let filtered = tasks;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }
    if (selectedStation !== 'all') {
      filtered = filtered.filter(task => task.station === selectedStation);
    }
    if (selectedAssignee !== 'all') {
      filtered = filtered.filter(task => task.assigneeId === selectedAssignee);
    }
    if (selectedAssigner !== 'all') {
      filtered = filtered.filter(task => task.assignerId === selectedAssigner);
    }
    if (repeatOnly) {
      filtered = filtered.filter(task => task.repeat);
    }
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedStatus, selectedStation, selectedAssignee, selectedAssigner, repeatOnly, searchQuery]);

  const { user: currentUser, isLoading } = useCurrentUser();

  if (isLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  const isManagement = currentUser.roles.some(role =>
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  const getUserById = (id: string) => users.find(user => user.id === id);

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getProofIcon = (proofType: string) => {
    switch (proofType) {
      case 'photo': return '📷';
      case 'text': return '📝';
      case 'checklist': return '✅';
      default: return '📄';
    }
  };

  // CRUD Operations
  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'overdueDays'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(), // Simple ID generation for demo
      createdAt: new Date().toISOString(),
      overdueDays: 0
    };

    const updatedTasks = [newTask, ...tasks];
    onTasksChange(updatedTasks);
    toast.success('Task created successfully!');
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    onTasksChange(updatedTasks);
    toast.success('Task updated successfully!');
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    onTasksChange(updatedTasks);
    toast.success('Task deleted successfully!');
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleBulkAction = (action: 'delete' | 'assign' | 'change-status') => {
    if (action === 'delete') {
      const updatedTasks = tasks.filter(task => !selectedTasks.includes(task.id));
      onTasksChange(updatedTasks);
      setSelectedTasks([]);
      toast.success(`${selectedTasks.length} tasks deleted successfully!`);
    }
    // Add other bulk actions as needed
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedStation('all');
    setSelectedAssignee('all');
    setSelectedAssigner('all');
    setRepeatOnly(false);
  };

  const TaskRow = ({ task }: { task: Task }) => {
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
    const assigner = getUserById(task.assignerId);

    return (
      <TableRow className="hover:bg-accent/50">
        <TableCell className="w-12">
          <Checkbox
            checked={selectedTasks.includes(task.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedTasks([...selectedTasks, task.id]);
              } else {
                setSelectedTasks(selectedTasks.filter(id => id !== task.id));
              }
            }}
          />
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium cursor-pointer hover:text-primary" onClick={() => handleViewTask(task)}>
              {task.title}
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </div>
            {task.repeat && (
              <Badge variant="secondary" className="text-xs">
                <RotateCcw className="size-3 mr-1" />
                {task.repeat}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="capitalize">
            {task.station}
          </Badge>
        </TableCell>
        <TableCell>
          <StatusChip status={task.status} />
        </TableCell>
        <TableCell>
          <div className="text-sm">
            <div>{formatDate(task.dueDate)}</div>
            <div className="text-muted-foreground">{formatTime(task.dueTime)}</div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="size-4 text-yellow-500" />
            <span>{task.basePoints}</span>
          </div>
        </TableCell>
        <TableCell>
          {assignee ? (
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={assignee.photo} />
                <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{assignee.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Unassigned</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getProofIcon(task.proofType)}</span>
            <span className="text-xs capitalize">{task.proofType}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleViewTask(task)}
            >
              <Eye className="size-4" />
            </Button>
            {isManagement && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditTask(task)}
              >
                <Edit className="size-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewTask(task)}>
                  <Eye className="size-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {isManagement && (
                  <>
                    <DropdownMenuItem onClick={() => handleEditTask(task)}>
                      <Edit className="size-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Management</h2>
          <p className="text-muted-foreground">Manage and organize all tasks</p>
        </div>
        {isManagement && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="size-4" />
            New Task
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as TaskStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Station Filter */}
            <Select value={selectedStation} onValueChange={(value) => setSelectedStation(value as Station | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station} value={station} className="capitalize">
                    {station}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Assignee Filter */}
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={repeatOnly}
                  onChange={(e) => setRepeatOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Repeat tasks only</span>
              </label>
            </div>
            
            {(searchQuery || selectedStatus !== 'all' || selectedStation !== 'all' || 
              selectedAssignee !== 'all' || selectedAssigner !== 'all' || repeatOnly) && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete Selected
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedTasks([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTasks(filteredTasks.map(t => t.id));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-center">Points</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchQuery || selectedStatus !== 'all' || selectedStation !== 'all' || 
                         selectedAssignee !== 'all' || selectedAssigner !== 'all' || repeatOnly
                          ? 'No tasks match the current filters.'
                          : 'No tasks found. Create your first task to get started!'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      <TaskEditModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={handleUpdateTask}
        onTaskDelete={handleDeleteTask}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={handleUpdateTask}
      />
    </div>
  );
}
