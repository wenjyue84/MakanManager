"use client";

import React, { useState } from 'react';
import { Task } from '../../lib/types';
import { TaskList } from '../task-management/task-list';

interface TasksProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: () => void;
  onCreateDiscipline: () => void;
  currentLanguage: string;
}

export function Tasks({
  tasks,
  loading,
  error,
  onTaskClick,
  onTaskUpdate,
  onCreateTask,
  onCreateDiscipline,
  currentLanguage
}: TasksProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Update local tasks when props change
  React.useEffect(() => {
    console.log('Tasks component received new tasks:', tasks);
    setLocalTasks(tasks);
  }, [tasks]);

  // Debug logging
  console.log('Tasks component render - loading:', loading, 'error:', error, 'tasks count:', tasks.length);

  const handleTasksChange = (newTasks: Task[]) => {
    setLocalTasks(newTasks);
    // You can add logic here to sync with parent component if needed
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <TaskList 
        tasks={localTasks} 
        onTasksChange={handleTasksChange} 
      />
    </div>
  );
}