"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Calendar,
  Activity,
  Zap,
  PieChart,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Task, User as UserType, Station } from '../../lib/types';
import { users } from '../../lib/data';

interface AssignmentAnalyticsDashboardProps {
  tasks: Task[];
  className?: string;
}

interface TeamMetrics {
  totalAssignments: number;
  completionRate: number;
  avgResponseTime: number;
  workloadBalance: number;
  stationUtilization: { [key: string]: number };
  topPerformers: string[];
  bottlenecks: string[];
}

interface UserAnalytics {
  userId: string;
  assignedTasks: number;
  completedTasks: number;
  completionRate: number;
  avgResponseTime: number;
  tasksByStation: { [key: string]: number };
  pointsEarned: number;
  efficiency: number;
  workloadStatus: 'underutilized' | 'optimal' | 'overloaded';
}

export function AssignmentAnalyticsDashboard({ 
  tasks, 
  className 
}: AssignmentAnalyticsDashboardProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedStation, setSelectedStation] = useState<Station | 'all'>('all');

  // Calculate team metrics
  const teamMetrics = useMemo((): TeamMetrics => {
    const assignedTasks = tasks.filter(task => task.assigneeId);
    const completedTasks = assignedTasks.filter(task => task.status === 'done');
    
    // Station utilization
    const stationCounts = tasks.reduce((acc, task) => {
      acc[task.station] = (acc[task.station] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const totalTasks = tasks.length;
    const stationUtilization = Object.keys(stationCounts).reduce((acc, station) => {
      acc[station] = (stationCounts[station] / totalTasks) * 100;
      return acc;
    }, {} as { [key: string]: number });

    // Mock performance data
    const topPerformers = users.slice(0, 3).map(u => u.id);
    const bottlenecks = users.slice(-2).map(u => u.id);

    return {
      totalAssignments: assignedTasks.length,
      completionRate: assignedTasks.length > 0 ? (completedTasks.length / assignedTasks.length) * 100 : 0,
      avgResponseTime: 4.2, // Mock data
      workloadBalance: 78, // Mock data
      stationUtilization,
      topPerformers,
      bottlenecks
    };
  }, [tasks]);

  // Calculate user analytics
  const userAnalytics = useMemo((): UserAnalytics[] => {
    const analytics: UserAnalytics[] = [];
    
    users.forEach(user => {
      const userTasks = tasks.filter(task => task.assigneeId === user.id);
      const completedTasks = userTasks.filter(task => task.status === 'done');
      
      const tasksByStation = userTasks.reduce((acc, task) => {
        acc[task.station] = (acc[task.station] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      const pointsEarned = completedTasks.reduce((sum, task) => sum + task.basePoints, 0);
      
      // Mock additional metrics
      const efficiency = Math.floor(Math.random() * 30) + 70; // 70-100%
      const avgResponseTime = Math.floor(Math.random() * 8) + 2; // 2-10 hours
      
      let workloadStatus: 'underutilized' | 'optimal' | 'overloaded' = 'optimal';
      if (userTasks.length < 3) workloadStatus = 'underutilized';
      if (userTasks.length > 8) workloadStatus = 'overloaded';
      
      analytics.push({
        userId: user.id,
        assignedTasks: userTasks.length,
        completedTasks: completedTasks.length,
        completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0,
        avgResponseTime,
        tasksByStation,
        pointsEarned,
        efficiency,
        workloadStatus
      });
    });
    
    return analytics.sort((a, b) => b.efficiency - a.efficiency);
  }, [tasks]);

  const filteredUserAnalytics = useMemo(() => {
    if (selectedStation === 'all') return userAnalytics;
    return userAnalytics.filter(ua => {
      const user = users.find(u => u.id === ua.userId);
      return user?.station === selectedStation;
    });
  }, [userAnalytics, selectedStation]);

  const getUserById = (id: string) => users.find(user => user.id === id);

  const getWorkloadStatusColor = (status: string) => {
    switch (status) {
      case 'underutilized': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'optimal': return 'text-green-600 bg-green-50 border-green-200';
      case 'overloaded': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="size-6" />
            Assignment Analytics
          </h2>
          <p className="text-muted-foreground">Team performance and workload insights</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedStation} onValueChange={(value) => setSelectedStation(value as Station | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              <SelectItem value="kitchen">Kitchen</SelectItem>
              <SelectItem value="front">Front</SelectItem>
              <SelectItem value="store">Store</SelectItem>
              <SelectItem value="outdoor">Outdoor</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold">{teamMetrics.totalAssignments}</p>
              </div>
              <Users className="size-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="size-4 text-green-500 mr-1" />
              <span className="text-green-500">+12%</span>
              <span className="text-muted-foreground ml-1">vs last {timeframe}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{teamMetrics.completionRate.toFixed(1)}%</p>
              </div>
              <Target className="size-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <Progress value={teamMetrics.completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{teamMetrics.avgResponseTime}h</p>
              </div>
              <Clock className="size-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="size-4 text-green-500 mr-1" />
              <span className="text-green-500">-0.8h</span>
              <span className="text-muted-foreground ml-1">vs last {timeframe}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Workload Balance</p>
                <p className="text-2xl font-bold">{teamMetrics.workloadBalance}%</p>
              </div>
              <Activity className="size-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <Progress value={teamMetrics.workloadBalance} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team">Team Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Performance</TabsTrigger>
          <TabsTrigger value="stations">Station Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="size-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {teamMetrics.topPerformers.map((userId, index) => {
                  const user = getUserById(userId);
                  const analytics = userAnalytics.find(ua => ua.userId === userId);
                  if (!user || !analytics) return null;

                  return (
                    <div key={userId} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <Avatar className="size-8">
                          <AvatarImage src={user.photo} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{analytics.efficiency}% efficiency</div>
                        </div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-sm font-medium">{analytics.completedTasks} tasks</div>
                        <div className="text-xs text-muted-foreground">{analytics.pointsEarned} pts</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Attention Needed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5" />
                  Attention Needed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredUserAnalytics
                  .filter(ua => ua.workloadStatus === 'overloaded' || ua.completionRate < 70)
                  .slice(0, 3)
                  .map((analytics) => {
                    const user = getUserById(analytics.userId);
                    if (!user) return null;

                    return (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg border border-yellow-200 bg-yellow-50">
                        <Avatar className="size-8">
                          <AvatarImage src={user.photo} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {analytics.workloadStatus === 'overloaded' ? 'Overloaded' : 'Low completion rate'}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {analytics.completionRate.toFixed(0)}%
                        </Badge>
                      </div>
                    );
                  })}
                
                {filteredUserAnalytics.filter(ua => ua.workloadStatus === 'overloaded' || ua.completionRate < 70).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle className="size-8 mx-auto mb-2 text-green-500" />
                    All team members performing well!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid gap-4">
            {filteredUserAnalytics.map((analytics) => {
              const user = getUserById(analytics.userId);
              if (!user) return null;

              return (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.photo} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {user.station || 'Any Station'}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getWorkloadStatusColor(analytics.workloadStatus)} capitalize`}
                      >
                        {analytics.workloadStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Tasks Assigned</div>
                        <div className="font-medium text-lg">{analytics.assignedTasks}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Completed</div>
                        <div className="font-medium text-lg">{analytics.completedTasks}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Completion Rate</div>
                        <div className="font-medium text-lg">{analytics.completionRate.toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Points Earned</div>
                        <div className="font-medium text-lg">{analytics.pointsEarned}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Efficiency</span>
                        <span>{analytics.efficiency}%</span>
                      </div>
                      <Progress value={analytics.efficiency} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(teamMetrics.stationUtilization).map(([station, percentage]) => (
              <Card key={station}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold mb-2">{percentage.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground capitalize mb-3">{station} Station</div>
                  <Progress value={percentage} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}