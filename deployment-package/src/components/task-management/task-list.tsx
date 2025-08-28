"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
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
import { Task, Station, TaskStatus } from '../../lib/types';
import { useCurrentUser } from '../../lib/hooks/use-current-user';
import { TaskCreateModal } from '../modals/task-create-modal';
import { TaskEditModal } from '../modals/task-edit-modal';
import { TaskDetailModal } from '../modals/task-detail-modal';
import { toast } from 'sonner';
import { tasksApi } from '../../lib/api/tasks';

interface TaskListProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

export function TaskList({ tasks, onTasksChange }: TaskListProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedStation, setSelectedStation] = useState<Station | 'all'>('all');
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  
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
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedStatus, selectedStation, searchQuery]);

  const { user: currentUser, isLoading } = useCurrentUser();

  if (isLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  const isManagement = currentUser.roles.some(role =>
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  const getUserById = (id: string) => {
    // For now, return a mock user - in real app this would come from user context or API
    return {
      id,
      name: 'User',
      photo: '',
      station: 'kitchen'
    };
  };

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

  // CRUD Operations
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'overdueDays'>) => {
    try {
      setIsTaskLoading(true);
      const response = await tasksApi.createTask({
        title: taskData.title,
        description: taskData.description,
        station: taskData.station,
        points: taskData.basePoints,
        dueAt: `${taskData.dueDate}T${taskData.dueTime}`,
        proofType: taskData.proofType,
        allowMultiplier: taskData.allowMultiplier,
        assigneeId: taskData.assigneeId
      });

      const updatedTasks = [response.task, ...tasks];
      onTasksChange(updatedTasks);
      toast.success('Task created successfully!');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.');
    } finally {
      setIsTaskLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setIsTaskLoading(true);
      const response = await tasksApi.updateTask(taskId, updates);
      
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? response.task : task
      );
      onTasksChange(updatedTasks);
      toast.success('Task updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task. Please try again.');
    } finally {
      setIsTaskLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsTaskLoading(true);
      // Note: Delete endpoint not implemented yet in backend
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      onTasksChange(updatedTasks);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task. Please try again.');
    } finally {
      setIsTaskLoading(false);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedStation('all');
  };

  const TaskRow = ({ task }: { task: Task }) => {
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;

    return (
      <TableRow className="hover:bg-accent/50">
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium cursor-pointer hover:text-primary" onClick={() => handleViewTask(task)}>
              {task.title}
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </div>
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
            <span className="font-medium">{task.basePoints}</span>
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
            {isManagement && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteTask(task.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
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
            Add Task
          </Button>
        )}
      </div>

      {/* Simple Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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

            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          {isTaskLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-6 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-center">Points</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchQuery || selectedStatus !== 'all' || selectedStation !== 'all'
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
          )}
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
