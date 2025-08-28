"use client";

import React from 'react';
import { Clock, User, MapPin, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { StatusChip } from '../ui/status-chip';
import { Task } from '../../lib/types';
import { users } from '../../lib/data';
import { useCurrentUser } from '../../lib/hooks/use-current-user';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onTaskUpdate }: TaskDetailModalProps) {
  const { user: currentUser, isLoading } = useCurrentUser();

  if (!task || isLoading || !currentUser) return null;

  const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null;
  const assigner = users.find(u => u.id === task.assignerId);

  const isAssignee = task.assigneeId === currentUser.id;
  const canClaim = task.status === 'open' && !task.assigneeId;

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleClaim = () => {
    onTaskUpdate(task.id, {
      status: 'in-progress',
      assigneeId: currentUser.id
    });
    onClose();
  };

  const handleComplete = () => {
    onTaskUpdate(task.id, {
      status: 'done',
      completedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{task.title}</span>
            <StatusChip status={task.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Info */}
          <div className="space-y-3">
            <p className="text-muted-foreground">{task.description}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="capitalize">{task.station}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span>{formatTime(task.dueTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="size-4 text-muted-foreground" />
                <span>{task.basePoints} points</span>
              </div>
            </div>

            {/* Proof requirement */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Proof required: {task.proofType === 'none' ? 'None' : task.proofType}
              </span>
            </div>
          </div>

          {/* People involved */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="text-sm">Assigned by:</span>
              <Avatar className="size-6">
                <AvatarImage src={assigner?.photo} />
                <AvatarFallback className="text-xs">{assigner?.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{assigner?.name}</span>
            </div>
            
            {assignee ? (
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="text-sm">Assigned to:</span>
                <Avatar className="size-6">
                  <AvatarImage src={assignee.photo} />
                  <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{assignee.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Unassigned</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            {canClaim && (
              <Button onClick={handleClaim} className="flex-1">
                Claim Task
              </Button>
            )}
            {isAssignee && task.status === 'in-progress' && (
              <Button onClick={handleComplete} className="flex-1">
                Mark Complete
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}