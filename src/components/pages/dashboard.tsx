"use client";

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Trophy, 
  Plus,
  Calendar,
  Timer,
  User,
  Star,
  DollarSign,
  Package,
  Users,
  Utensils,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Wallet,
  BarChart3,
  Zap,
  Coffee,
  ShoppingCart,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { StatusChip } from '../ui/status-chip';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { tasks, users, currentUser } from '../../lib/data';
import { getUnreadCount } from '../../lib/notifications-data';
import { Task, User as UserType } from '../../lib/types';

interface DashboardProps {
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
  onCreateDiscipline: () => void;
}

export function Dashboard({ onTaskClick, onCreateTask, onCreateDiscipline }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [salesData, setSalesData] = useState({
    today: 2675.50,
    target: 2500,
    orders: 47,
    avgOrder: 56.82
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isManagement = currentUser.roles.some(role => 
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  const isStaff = currentUser.roles.includes('staff');

  // Filter tasks for current user
  const myTasks = tasks.filter(task => 
    task.assigneeId === currentUser.id && 
    !['done'].includes(task.status)
  );

  const openTasks = tasks.filter(task => task.status === 'open');
  
  const pendingReviews = tasks.filter(task => 
    task.status === 'pending-review' && 
    (task.assignerId === currentUser.id || isManagement)
  );

  // Real-time data calculations
  const overdueCount = tasks.filter(task => task.status === 'overdue').length;
  const pendingApprovals = pendingReviews.length;
  const notificationCount = getUnreadCount();
  const currentUserRank = users
    .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
    .findIndex(user => user.id === currentUser.id) + 1;

  // Today's schedule and reminders
  const todaySchedule = [
    { id: '1', title: 'Opening Prep', time: '08:00', status: 'completed', type: 'task' },
    { id: '2', title: 'Staff Briefing', time: '08:30', status: 'completed', type: 'meeting' },
    { id: '3', title: 'Inventory Check', time: '16:00', status: 'pending', type: 'task' },
    { id: '4', title: 'Cash Reconciliation', time: '22:00', status: 'pending', type: 'task' }
  ];

  // Quick actions based on role
  const quickActions = isManagement ? [
    { id: 'new-order', label: 'New Order', icon: Package, action: () => onTaskClick, color: 'primary' },
    { id: 'cash-count', label: 'Cash Count', icon: Wallet, color: 'warning' },
    { id: 'staff-meal', label: 'Staff Meal', icon: Utensils, color: 'success' },
    { id: 'issue-report', label: 'Report Issue', icon: AlertTriangle, color: 'destructive' }
  ] : [
    { id: 'clock-in', label: 'Clock In/Out', icon: Clock, color: 'primary' },
    { id: 'staff-meal', label: 'Request Meal', icon: Utensils, color: 'success' },
    { id: 'break', label: 'Take Break', icon: Coffee, color: 'secondary' },
    { id: 'help', label: 'Get Help', icon: AlertCircle, color: 'outline' }
  ];

  // Staff performance data
  const performanceData = {
    tasksCompleted: 12,
    tasksTarget: 15,
    pointsEarned: currentUser.weeklyPoints,
    pointsTarget: 100,
    efficiency: 87
  };

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getUserById = (id: string) => users.find(user => user.id === id);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}, {currentUser.name}!
          </h1>
          <p className="text-muted-foreground">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          {notificationCount > 0 && (
            <Badge variant="destructive">{notificationCount} alerts</Badge>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.color === 'primary' ? 'default' : 'outline'}
                  className="h-16 flex-col gap-2"
                  onClick={action.action}
                >
                  <Icon className="size-5" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role-Based KPI Cards */}
      {isManagement ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">RM{salesData.today.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Today's Sales</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="size-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      {((salesData.today / salesData.target - 1) * 100).toFixed(0)}% vs target
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{salesData.orders}</p>
                  <p className="text-sm text-muted-foreground">Orders Today</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    RM{salesData.avgOrder.toFixed(0)} avg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pendingApprovals > 0 ? 'bg-orange-100' : 'bg-green-100'}`}>
                  <Clock className={`size-5 ${pendingApprovals > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingApprovals}</p>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  {pendingApprovals > 0 && (
                    <Badge variant="warning" className="text-xs mt-1">Action Required</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="size-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.filter(u => u.roles.includes('staff')).length}</p>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {users.filter(u => u.status === 'available').length} available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentUser.weeklyPoints}</p>
                  <p className="text-sm text-muted-foreground">Points This Week</p>
                  <Progress value={(currentUser.weeklyPoints / performanceData.pointsTarget) * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Trophy className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">#{currentUserRank}</p>
                  <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
                  <Badge variant="outline" className="text-xs mt-1">Top Performer</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="size-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{performanceData.tasksCompleted}</p>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <Progress value={(performanceData.tasksCompleted / performanceData.tasksTarget) * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="size-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{performanceData.efficiency}%</p>
                  <p className="text-sm text-muted-foreground">Efficiency</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="size-3 text-green-600" />
                    <span className="text-xs text-green-600">+5% this week</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                  <div className={`p-1.5 rounded ${
                    item.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle className="size-3 text-green-600" />
                    ) : (
                      <Clock className="size-3 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      item.status === 'completed' ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <Badge variant={item.status === 'completed' ? 'success' : 'outline'} className="text-xs">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Live Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2">
                <div className="p-1.5 bg-green-100 rounded">
                  <Package className="size-3 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New order received</p>
                  <p className="text-xs text-muted-foreground">Order #ORD-048 - RM34.50</p>
                </div>
                <span className="text-xs text-muted-foreground">2 min ago</span>
              </div>

              <div className="flex items-center gap-3 p-2">
                <div className="p-1.5 bg-blue-100 rounded">
                  <CheckCircle className="size-3 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Task completed</p>
                  <p className="text-xs text-muted-foreground">Islam finished cleaning espresso machine</p>
                </div>
                <span className="text-xs text-muted-foreground">5 min ago</span>
              </div>

              <div className="flex items-center gap-3 p-2">
                <div className="p-1.5 bg-orange-100 rounded">
                  <AlertTriangle className="size-3 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Low stock alert</p>
                  <p className="text-xs text-muted-foreground">Arabica coffee beans - 2 days remaining</p>
                </div>
                <span className="text-xs text-muted-foreground">15 min ago</span>
              </div>

              <div className="flex items-center gap-3 p-2">
                <div className="p-1.5 bg-purple-100 rounded">
                  <Users className="size-3 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Staff check-in</p>
                  <p className="text-xs text-muted-foreground">Sherry started morning shift</p>
                </div>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {myTasks.length === 0 ? (
            <p className="text-muted-foreground">No active tasks assigned</p>
          ) : (
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <StatusChip status={task.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="size-3" />
                        {formatTime(task.dueTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="size-3" />
                        {task.basePoints} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Management Actions */}
      {isManagement && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Management Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button onClick={onCreateTask} className="h-20 flex-col gap-2">
                <Plus className="size-5" />
                <span>Create Task</span>
              </Button>
              <Button onClick={onCreateDiscipline} variant="outline" className="h-20 flex-col gap-2">
                <AlertTriangle className="size-5" />
                <span>Disciplinary Action</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <BarChart3 className="size-5" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* My Active Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="size-5" />
{isStaff ? 'My Tasks' : isManagement ? 'Team Tasks' : 'Active Tasks'}
              </span>
              <Badge variant="outline">{myTasks.length} active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active tasks assigned</p>
                <p className="text-sm text-muted-foreground">Check back later for new assignments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTasks.slice(0, 4).map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <StatusChip status={task.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="size-3" />
                          {formatTime(task.dueTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="size-3" />
                          {task.basePoints} pts
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.station}
                    </Badge>
                  </div>
                ))}
                {myTasks.length > 4 && (
                  <Button variant="ghost" className="w-full">
                    View all {myTasks.length} tasks
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Tasks / Pending Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="size-5" />
                {isManagement ? 'Pending Reviews' : 'Available Tasks'}
              </span>
              <Badge variant="outline">
                {isManagement ? pendingReviews.length : openTasks.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(isManagement ? pendingReviews : openTasks).length === 0 ? (
              <div className="text-center py-8">
                <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isManagement ? 'No pending reviews' : 'No available tasks'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isManagement ? 'All tasks are up to date' : 'Check back later for opportunities'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(isManagement ? pendingReviews : openTasks).slice(0, 4).map((task) => {
                  const relatedUser = isManagement 
                    ? getUserById(task.assigneeId!) 
                    : getUserById(task.assignerId);
                  
                  return (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{task.title}</h4>
                          {isManagement && <StatusChip status={task.status} />}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {relatedUser && (
                            <>
                              <Avatar className="size-5">
                                <AvatarImage src={relatedUser.photo} />
                                <AvatarFallback className="text-xs">{relatedUser.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{relatedUser.name}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{task.basePoints} pts</span>
                          <span>•</span>
                          <span>{formatTime(task.dueTime)}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.station}
                      </Badge>
                    </div>
                  );
                })}
                {(isManagement ? pendingReviews : openTasks).length > 4 && (
                  <Button variant="ghost" className="w-full">
                    View all {(isManagement ? pendingReviews : openTasks).length} items
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}