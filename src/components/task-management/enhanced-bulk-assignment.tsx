"use client";

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  X,
  User,
  Calendar,
  Star,
  Zap
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Task, User as UserType, Station } from '../../lib/types';
import { users, currentUser } from '../../lib/data';

interface EnhancedBulkAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTasks: Task[];
  onAssign: (assignments: { taskId: string; assigneeId: string }[]) => void;
}

interface UserWorkload {
  userId: string;
  assignedTasks: number;
  totalPoints: number;
  averageCompletionRate: number;
  stationMatch: boolean;
  currentLoad: 'low' | 'medium' | 'high';
  estimatedCapacity: number;
}

export function EnhancedBulkAssignment({ 
  isOpen, 
  onClose, 
  selectedTasks, 
  onAssign 
}: EnhancedBulkAssignmentProps) {
  const [assignments, setAssignments] = useState<{ [taskId: string]: string }>({});
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'smart' | 'balanced'>('smart');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Calculate user workloads
  const userWorkloads = useMemo(() => {
    const workloads: UserWorkload[] = [];
    
    users.forEach(user => {
      if (user.id === currentUser.id) return; // Skip current user
      
      // Mock workload data - in real app this would come from the service
      const assignedTasks = Math.floor(Math.random() * 10) + 1;
      const totalPoints = Math.floor(Math.random() * 300) + 50;
      const averageCompletionRate = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      // Check station compatibility with selected tasks
      const taskStations = [...new Set(selectedTasks.map(task => task.station))];
      const stationMatch = !user.station || taskStations.includes(user.station);
      
      // Determine current load
      let currentLoad: 'low' | 'medium' | 'high' = 'low';
      if (assignedTasks > 7) currentLoad = 'high';
      else if (assignedTasks > 4) currentLoad = 'medium';
      
      workloads.push({
        userId: user.id,
        assignedTasks,
        totalPoints,
        averageCompletionRate,
        stationMatch,
        currentLoad,
        estimatedCapacity: Math.max(0, 10 - assignedTasks)
      });
    });
    
    return workloads.sort((a, b) => {
      // Sort by: station match first, then by load (low to high), then by completion rate (high to low)
      if (a.stationMatch !== b.stationMatch) return b.stationMatch ? 1 : -1;
      if (a.currentLoad !== b.currentLoad) {
        const loadOrder = { 'low': 0, 'medium': 1, 'high': 2 };
        return loadOrder[a.currentLoad] - loadOrder[b.currentLoad];
      }
      return b.averageCompletionRate - a.averageCompletionRate;
    });
  }, [selectedTasks]);

  const getUserById = (id: string) => users.find(user => user.id === id);
  const getWorkloadByUserId = (id: string) => userWorkloads.find(w => w.userId === id);

  const handleSmartAssignment = () => {
    const newAssignments: { [taskId: string]: string } = {};
    const availableUsers = userWorkloads.filter(w => w.estimatedCapacity > 0);
    
    selectedTasks.forEach((task, index) => {
      // Prefer users with matching station and lower load
      const bestUser = availableUsers.find(w => {
        const workload = getWorkloadByUserId(w.userId);
        return workload && workload.stationMatch && workload.currentLoad !== 'high';
      }) || availableUsers[index % availableUsers.length];
      
      if (bestUser) {
        newAssignments[task.id] = bestUser.userId;
        bestUser.estimatedCapacity--;
      }
    });
    
    setAssignments(newAssignments);
  };

  const handleBalancedAssignment = () => {
    const newAssignments: { [taskId: string]: string } = {};
    const availableUsers = [...userWorkloads].sort((a, b) => a.assignedTasks - b.assignedTasks);
    
    selectedTasks.forEach((task, index) => {
      const user = availableUsers[index % availableUsers.length];
      newAssignments[task.id] = user.userId;
      user.assignedTasks++; // Update for next assignment
    });
    
    setAssignments(newAssignments);
  };

  const handleAssignToSelected = () => {
    if (selectedUsers.length === 0) return;
    
    const newAssignments: { [taskId: string]: string } = {};
    selectedTasks.forEach((task, index) => {
      newAssignments[task.id] = selectedUsers[index % selectedUsers.length];
    });
    
    setAssignments(newAssignments);
  };

  const handleSubmit = () => {
    const assignmentList = Object.entries(assignments).map(([taskId, assigneeId]) => ({
      taskId,
      assigneeId
    }));
    
    onAssign(assignmentList);
    onClose();
  };

  const getLoadColor = (load: 'low' | 'medium' | 'high') => {
    switch (load) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
    }
  };

  const getLoadTextColor = (load: 'low' | 'medium' | 'high') => {
    switch (load) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
    }
  };

  const assignedCount = Object.keys(assignments).length;
  const canSubmit = assignedCount === selectedTasks.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Bulk Task Assignment ({selectedTasks.length} tasks)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Mode Selection */}
          <Tabs value={assignmentMode} onValueChange={(value) => setAssignmentMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="smart" className="flex items-center gap-2">
                <Zap className="size-4" />
                Smart Assignment
              </TabsTrigger>
              <TabsTrigger value="balanced" className="flex items-center gap-2">
                <TrendingUp className="size-4" />
                Balanced Load
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <User className="size-4" />
                Manual Selection
              </TabsTrigger>
            </TabsList>

            <TabsContent value="smart" className="space-y-4">
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription>
                  Smart assignment considers station matching, current workload, and completion rates to suggest optimal assignments.
                </AlertDescription>
              </Alert>
              <Button onClick={handleSmartAssignment} className="w-full">
                Generate Smart Assignments
              </Button>
            </TabsContent>

            <TabsContent value="balanced" className="space-y-4">
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription>
                  Balanced assignment distributes tasks evenly across all available team members regardless of specialization.
                </AlertDescription>
              </Alert>
              <Button onClick={handleBalancedAssignment} className="w-full">
                Generate Balanced Assignments
              </Button>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription>
                  Select specific team members to assign tasks to. Tasks will be distributed among selected users.
                </AlertDescription>
              </Alert>
              
              {/* User Selection */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {userWorkloads.map((workload) => {
                  const user = getUserById(workload.userId);
                  if (!user) return null;

                  return (
                    <Card 
                      key={user.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id) ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedUsers(prev => 
                          prev.includes(user.id) 
                            ? prev.filter(id => id !== user.id)
                            : [...prev, user.id]
                        );
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="size-8">
                            <AvatarImage src={user.photo} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {user.station || 'Any Station'}
                            </div>
                          </div>
                          <Checkbox 
                            checked={selectedUsers.includes(user.id)}
                            readOnly
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Load:</span>
                            <span className={`font-medium capitalize ${getLoadTextColor(workload.currentLoad)}`}>
                              {workload.currentLoad}
                            </span>
                          </div>
                          <Progress 
                            value={workload.assignedTasks * 10} 
                            className="h-1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {selectedUsers.length > 0 && (
                <Button onClick={handleAssignToSelected} className="w-full">
                  Assign to Selected Users ({selectedUsers.length})
                </Button>
              )}
            </TabsContent>
          </Tabs>

          {/* User Workload Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="size-5" />
              Team Workload Overview
            </h3>
            
            <div className="grid gap-3">
              {userWorkloads.slice(0, 6).map((workload) => {
                const user = getUserById(workload.userId);
                if (!user) return null;

                const isAssigned = Object.values(assignments).includes(user.id);
                const taskCount = Object.values(assignments).filter(id => id === user.id).length;

                return (
                  <Card key={user.id} className={isAssigned ? 'ring-1 ring-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.photo} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="capitalize">{user.station || 'Any Station'}</span>
                              {workload.stationMatch && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="size-3 mr-1" />
                                  Station Match
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Current Tasks</div>
                            <div className="font-medium">{workload.assignedTasks}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Completion Rate</div>
                            <div className="font-medium">{workload.averageCompletionRate}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Load</div>
                            <Badge variant="outline" className={`${getLoadTextColor(workload.currentLoad)} border-current`}>
                              {workload.currentLoad}
                            </Badge>
                          </div>
                          {isAssigned && (
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">New Tasks</div>
                              <Badge className="bg-primary">+{taskCount}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Assignment Preview */}
          {assignedCount > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Calendar className="size-5" />
                Assignment Preview ({assignedCount}/{selectedTasks.length})
              </h3>
              
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {selectedTasks.map((task) => {
                  const assigneeId = assignments[task.id];
                  const assignee = assigneeId ? getUserById(assigneeId) : null;
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs capitalize">
                            {task.station}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Star className="size-3" />
                            {task.basePoints}
                          </span>
                        </div>
                      </div>
                      
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarImage src={assignee.photo} />
                            <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{assignee.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setAssignments(prev => {
                                const newAssignments = { ...prev };
                                delete newAssignments[task.id];
                                return newAssignments;
                              });
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleSubmit} 
              disabled={!canSubmit}
              className="flex-1"
            >
              Assign {assignedCount} Task{assignedCount !== 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}