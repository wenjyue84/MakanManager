"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { TaskList } from '../task-management/task-list';
import { Task } from '../../lib/types';
import { tasks as initialTasks } from '../../lib/data';

export function TaskManagementDemo() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Task Management System</h1>
        <p className="text-muted-foreground">
          Complete CRUD operations for managing restaurant tasks with advanced filtering and bulk actions.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Create</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add new tasks with detailed information including assignments, due dates, and proof requirements.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View task details, track progress, and manage task lifecycle from creation to completion.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Update</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Edit task details, change assignments, update status, and modify requirements as needed.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Delete</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Remove completed or obsolete tasks with confirmation dialogs and bulk deletion support.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">Advanced Filtering</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Filter by status, station, assignee, and assigner</li>
                <li>• Search across task titles and descriptions</li>
                <li>• Toggle for repeat tasks only</li>
                <li>• Real-time filtering with clear options</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Bulk Operations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Select multiple tasks with checkboxes</li>
                <li>• Bulk delete operations</li>
                <li>• Bulk status changes</li>
                <li>• Bulk assignment updates</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Task Management</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Full task lifecycle management</li>
                <li>• Role-based permissions</li>
                <li>• Proof requirement tracking</li>
                <li>• Repeat schedule support</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">User Experience</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Responsive design for all devices</li>
                <li>• Intuitive modal interfaces</li>
                <li>• Toast notifications for actions</li>
                <li>• Consistent UI patterns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Current Task Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'open').length}</div>
              <div className="text-sm text-muted-foreground">Open</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'in-progress').length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{tasks.filter(t => t.status === 'on-hold').length}</div>
              <div className="text-sm text-muted-foreground">On Hold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{tasks.filter(t => t.status === 'pending-review').length}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{tasks.filter(t => t.status === 'overdue').length}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'done').length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Task Management Interface */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Task Management Interface</h2>
          <Badge variant="secondary">Management Access Required</Badge>
        </div>
        <p className="text-muted-foreground">
          Use the interface below to manage tasks. You can create, edit, delete, and view task details.
          All changes are reflected in real-time.
        </p>
      </div>

      <TaskList tasks={tasks} onTasksChange={setTasks} />
    </div>
  );
}
