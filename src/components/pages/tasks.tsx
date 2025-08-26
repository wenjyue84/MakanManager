"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  Calendar,
  Timer,
  User,
  Star,
  Camera,
  FileText,
  CheckSquare,
  MapPin,
  MoreHorizontal,
  ChevronDown,
  RotateCcw,
  Clock,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { StatusChip } from '../ui/status-chip';
import { Checkbox } from '../ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Task, Station, TaskStatus, User as UserType } from '../../lib/types';
import { users, currentUser } from '../../lib/data';

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

const statusCounts = {
  open: 12,
  'in-progress': 8,
  'on-hold': 3,
  'pending-review': 5,
  overdue: 2,
  done: 56
};

const stations: Station[] = ['kitchen', 'front', 'store', 'outdoor'];

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
  const [activeTab, setActiveTab] = useState<TaskStatus>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | 'all'>('all');
  const [selectedAssigner, setSelectedAssigner] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <div className="p-4">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const isManagement = currentUser.roles.some(role => 
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  const isOwner = currentUser.roles.includes('owner');

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.status !== activeTab) return false;
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedStation !== 'all' && task.station !== selectedStation) return false;
      if (selectedAssigner !== 'all' && task.assignerId !== selectedAssigner) return false;
      if (selectedAssignee !== 'all' && task.assigneeId !== selectedAssignee) return false;
      if (repeatOnly && !task.repeat) return false;
      return true;
    });
  }, [tasks, activeTab, searchQuery, selectedStation, selectedAssigner, selectedAssignee, repeatOnly]);

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
      case 'photo': return Camera;
      case 'text': return FileText;
      case 'checklist': return CheckSquare;
      default: return FileText;
    }
  };

  const canClaimTask = (task: Task) => {
    if (task.status !== 'open') return false;
    const assigner = getUserById(task.assignerId);
    return isOwner ? assigner?.roles.includes('owner') : true;
  };

  const canApproveTask = (task: Task) => {
    return task.status === 'pending-review' && 
      (task.assignerId === currentUser.id || isManagement);
  };

  const getTaskActions = (task: Task) => {
    const actions = [];
    
    switch (task.status) {
      case 'open':
        if (canClaimTask(task)) {
          actions.push({ label: 'Claim', primary: true, action: () => onTaskUpdate(task.id, { status: 'in-progress', assigneeId: currentUser.id }) });
        } else {
          actions.push({ label: 'Owner Only', disabled: true, tooltip: 'Owner can only claim Owner-created tasks' });
        }
        if (isManagement) {
          actions.push({ label: 'Assign', action: () => onTaskClick(task) });
        }
        break;
        
      case 'in-progress':
        if (task.assigneeId === currentUser.id) {
          actions.push({ label: 'Submit', primary: true, action: () => onTaskClick(task) });
        }
        if (isManagement) {
          actions.push({ label: 'Put On Hold', action: () => onTaskUpdate(task.id, { status: 'on-hold' }) });
          actions.push({ label: 'Reassign', action: () => onTaskClick(task) });
        }
        break;
        
      case 'on-hold':
        if (isManagement) {
          actions.push({ label: 'Resume', primary: true, action: () => onTaskUpdate(task.id, { status: 'in-progress' }) });
        }
        break;
        
      case 'pending-review':
        if (canApproveTask(task)) {
          actions.push({ label: 'Approve', primary: true, action: () => onTaskClick(task) });
          actions.push({ label: 'Reject', action: () => onTaskClick(task) });
        }
        break;
        
      case 'overdue':
        if (task.assignerId === currentUser.id) {
          actions.push({ label: 'Reassign', action: () => onTaskClick(task) });
          actions.push({ label: 'Extend', action: () => onTaskClick(task) });
          actions.push({ label: 'Cancel', action: () => onTaskUpdate(task.id, { status: 'done' }) });
        }
        break;
        
      default:
        break;
    }
    
    return actions;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStation('all');
    setSelectedAssigner('all');
    setSelectedAssignee('all');
    setRepeatOnly(false);
  };

  const applyPreset = (preset: string) => {
    clearFilters();
    switch (preset) {
      case 'my-approvals':
        setActiveTab('pending-review');
        break;
      case 'my-tasks':
        setActiveTab('in-progress');
        setSelectedAssignee(currentUser.id);
        break;
      case 'open-kitchen':
        setActiveTab('open');
        setSelectedStation('kitchen');
        break;
    }
  };

  const handleBulkAction = (action: 'assign' | 'approve') => {
    // Handle bulk operations
    console.log(`Bulk ${action} for tasks:`, selectedTasks);
    setSelectedTasks([]);
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
    const actions = getTaskActions(task);
    const ProofIcon = getProofIcon(task.proofType);

    return (
      <Card className="cursor-pointer hover:bg-accent/50" onClick={() => onTaskClick(task)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{task.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <StatusChip status={task.status} />
                  <Badge variant="outline" className="text-xs capitalize">
                    {task.station}
                  </Badge>
                  {task.repeat && (
                    <Badge variant="secondary" className="text-xs">
                      <RotateCcw className="size-3 mr-1" />
                      {task.repeat}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ProofIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{task.basePoints}</span>
              </div>
            </div>

            {/* Due date and assignee */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                <span>{formatDate(task.dueDate)} at {formatTime(task.dueTime)}</span>
              </div>
              {assignee ? (
                <div className="flex items-center gap-1">
                  <Avatar className="size-5">
                    <AvatarImage src={assignee.photo} />
                    <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{assignee.name}</span>
                </div>
              ) : (
                <span className="text-xs">Unassigned</span>
              )}
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex gap-2 pt-2 border-t">
                {actions.slice(0, 2).map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.primary ? "default" : "outline"}
                    disabled={action.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action?.();
                    }}
                    className="flex-1"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Overdue banner */}
            {task.status === 'overdue' && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="size-4" />
                <AlertDescription className="text-xs">
                  Overdue — returned to Assigner
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const TaskTableRow = ({ task }: { task: Task }) => {
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
    const actions = getTaskActions(task);
    const ProofIcon = getProofIcon(task.proofType);
    const showBulkSelect = isManagement && (activeTab === 'open' || activeTab === 'pending-review');

    return (
      <TableRow className="hover:bg-accent/50">
        {showBulkSelect && (
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
        )}
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium cursor-pointer hover:text-primary" onClick={() => onTaskClick(task)}>
              {task.title}
            </div>
            {task.repeat && (
              <Badge variant="secondary" className="text-xs">
                <RotateCcw className="size-3 mr-1" />
                {task.repeat}
              </Badge>
            )}
            {task.status === 'overdue' && (
              <div className="text-xs text-destructive font-medium">
                Overdue — returned to Assigner
              </div>
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
          {task.basePoints}
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
        <TableCell className="text-center">
          <ProofIcon className="size-4 mx-auto text-muted-foreground" />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {actions.slice(0, 2).map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.primary ? "default" : "outline"}
                disabled={action.disabled}
                onClick={() => action.action?.()}
              >
                {action.label}
              </Button>
            ))}
            {actions.length > 2 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {actions.slice(2).map((action, index) => (
                    <DropdownMenuItem key={index} onClick={() => action.action?.()}>
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const showBulkActions = isManagement && selectedTasks.length > 0 && (activeTab === 'open' || activeTab === 'pending-review');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Welcome back, {currentUser.name}</p>
          </div>
          {isManagement && (
            <div className="flex gap-2">
              <Button onClick={onCreateTask} className="flex items-center gap-2">
                <Plus className="size-4" />
                New Task
              </Button>
              <Button onClick={onCreateDiscipline} variant="outline" className="flex items-center gap-2">
                <AlertTriangle className="size-4" />
                New Disciplinary Action
              </Button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedStation} onValueChange={(value) => setSelectedStation(value as Station | 'all')}>
                <SelectTrigger className="w-32">
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

              <Select value={selectedAssigner} onValueChange={setSelectedAssigner}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Assigner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assigners</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="w-36">
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="repeat-only"
                  checked={repeatOnly}
                  onCheckedChange={setRepeatOnly}
                />
                <Label htmlFor="repeat-only" className="text-sm">
                  Repeat only
                </Label>
              </div>

              {(searchQuery || selectedStation !== 'all' || selectedAssigner !== 'all' || selectedAssignee !== 'all' || repeatOnly) && (
                <Button onClick={clearFilters} variant="outline" size="sm">
                  <X className="size-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter Presets */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('my-approvals')}
            >
              My Approvals
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('my-tasks')}
            >
              My Tasks
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('open-kitchen')}
            >
              Open Tasks — Kitchen
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border">
          <span className="text-sm font-medium">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            {activeTab === 'open' && (
              <Button size="sm" onClick={() => handleBulkAction('assign')}>
                Assign
              </Button>
            )}
            {activeTab === 'pending-review' && (
              <Button size="sm" onClick={() => handleBulkAction('approve')}>
                Approve
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setSelectedTasks([])}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TaskStatus)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="open" className="relative">
            Open
            <Badge variant="secondary" className="ml-1 text-xs">
              {statusCounts.open}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="relative">
            In Progress
            <Badge variant="secondary" className="ml-1 text-xs">
              {statusCounts['in-progress']}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="on-hold" className="relative">
            On Hold
            <Badge variant="secondary" className="ml-1 text-xs">
              {statusCounts['on-hold']}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending-review" className="relative">
            Pending Review
            <Badge variant="secondary" className="ml-1 text-xs">
              {statusCounts['pending-review']}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="relative">
            Overdue
            <Badge variant="secondary" className="ml-1 text-xs">
              {statusCounts.overdue}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="done" className="relative">
            Done
            <Badge variant="secondary" className="ml-1 text-xs">
              {statusCounts.done}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {Object.keys(statusCounts).map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  {status === 'open' && 'No open tasks. Create a task or check other tabs.'}
                  {status === 'pending-review' && 'Nothing to review now.'}
                  {status !== 'open' && status !== 'pending-review' && `No ${status.replace('-', ' ')} tasks found.`}
                </div>
              </div>
            ) : (
              <>
                {isMobile ? (
                  // Mobile Card Layout
                  <div className="grid gap-4">
                    {filteredTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  // Desktop Table Layout
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {isManagement && (activeTab === 'open' || activeTab === 'pending-review') && (
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
                          )}
                          <TableHead>Title</TableHead>
                          <TableHead>Station</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead className="text-center">Base Pts</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead className="text-center">Proof</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTasks.map((task) => (
                          <TaskTableRow key={task.id} task={task} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between px-2">
                  <div className="text-sm text-muted-foreground">
                    Showing 1-{Math.min(10, filteredTasks.length)} of {filteredTasks.length} tasks
                  </div>
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select value="10">
                        <SelectTrigger className="h-8 w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}