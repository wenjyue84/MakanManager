"use client";

import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  User, 
  MapPin, 
  Star, 
  Camera, 
  FileText, 
  CheckSquare,
  Calendar,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { StatusChip } from '../ui/status-chip';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Task } from '../../lib/types';
import { users, managementBudgets, appSettings } from '../../lib/data';
import { useCurrentUser } from '../../lib/hooks/use-current-user';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onTaskUpdate }: TaskDetailModalProps) {
  const [multiplier, setMultiplier] = useState([1.0]);
  const [adjustment, setAdjustment] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproval, setShowApproval] = useState(false);
  const [showRejection, setShowRejection] = useState(false);
  const [proofText, setProofText] = useState('');
  const { user: currentUser, isLoading } = useCurrentUser();

  if (!task || isLoading || !currentUser) return null;

  const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null;
  const assigner = users.find(u => u.id === task.assignerId);

  const isAssignee = task.assigneeId === currentUser.id;
  const canApprove = task.status === 'pending-review' &&
    (task.assignerId === currentUser.id ||
     currentUser.roles.some(role => ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)));

  const isOwner = currentUser.roles.includes('owner');
  const canClaim = task.status === 'open' && 
    (isOwner ? assigner?.roles.includes('owner') : true);

  // Budget calculation
  const currentBudget = managementBudgets.get(currentUser.id) || appSettings.managementDailyBudget;
  const calculatedPoints = Math.round(task.basePoints * multiplier[0] + adjustment);
  const budgetCost = Math.abs(adjustment);
  const remainingBudget = currentBudget - budgetCost;
  const budgetPercentage = ((appSettings.managementDailyBudget - currentBudget) / appSettings.managementDailyBudget) * 100;

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getProofIcon = (proofType: string) => {
    switch (proofType) {
      case 'photo': return Camera;
      case 'text': return FileText;
      case 'checklist': return CheckSquare;
      default: return FileText;
    }
  };

  const handleClaim = () => {
    onTaskUpdate(task.id, {
      status: 'in-progress',
      assigneeId: currentUser.id
    });
    onClose();
  };

  const handleSubmitCompletion = () => {
    onTaskUpdate(task.id, {
      status: 'pending-review',
      proofData: task.proofType === 'text' ? proofText : 'Proof submitted',
      completedAt: new Date().toISOString()
    });
    onClose();
  };

  const handleApprove = () => {
    if (budgetCost > currentBudget) return;

    onTaskUpdate(task.id, {
      status: 'done',
      finalPoints: calculatedPoints,
      multiplier: multiplier[0],
      adjustment: adjustment,
      approvedAt: new Date().toISOString()
    });

    // Update management budget
    managementBudgets.set(currentUser.id, remainingBudget);
    
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) return;

    onTaskUpdate(task.id, {
      status: 'in-progress',
      rejectionReason: rejectionReason
    });
    onClose();
  };

  const handleReturnToAssigner = (action: 'reassign' | 'extend' | 'cancel') => {
    if (action === 'cancel') {
      onTaskUpdate(task.id, { status: 'done' });
    } else if (action === 'extend') {
      const newDueDate = new Date(task.dueDate);
      newDueDate.setDate(newDueDate.getDate() + 1);
      onTaskUpdate(task.id, {
        status: 'in-progress',
        dueDate: newDueDate.toISOString().split('T')[0]
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{task.title}</span>
            <StatusChip status={task.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Info */}
          <div className="space-y-4">
            <p className="text-muted-foreground">{task.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="capitalize">{task.station}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span>{new Date(task.dueDate).toLocaleDateString()} at {formatTime(task.dueTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="size-4 text-muted-foreground" />
                <span>{task.basePoints} points</span>
              </div>
              {task.repeat && (
                <div className="flex items-center gap-2">
                  <RotateCcw className="size-4 text-muted-foreground" />
                  <span className="capitalize">{task.repeat}</span>
                </div>
              )}
            </div>

            {/* Proof requirement */}
            <div className="flex items-center gap-2">
              {React.createElement(getProofIcon(task.proofType), { 
                className: "size-4 text-muted-foreground" 
              })}
              <span className="capitalize">Proof: {task.proofType}</span>
            </div>

            {/* People involved */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span>Assigned by:</span>
                <Avatar className="size-6">
                  <AvatarImage src={assigner?.photo} />
                  <AvatarFallback className="text-xs">{assigner?.name[0]}</AvatarFallback>
                </Avatar>
                <span>{assigner?.name}</span>
              </div>
              
              {assignee && (
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span>Assigned to:</span>
                  <Avatar className="size-6">
                    <AvatarImage src={assignee.photo} />
                    <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{assignee.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Overdue Alert */}
          {task.status === 'overdue' && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                This task is overdue and has been returned to the assigner for action.
              </AlertDescription>
            </Alert>
          )}

          {/* Rejection Reason */}
          {task.rejectionReason && (
            <Alert>
              <AlertTriangle className="size-4" />
              <AlertDescription>
                <strong>Rejected:</strong> {task.rejectionReason}
              </AlertDescription>
            </Alert>
          )}

          {/* Proof Display */}
          {task.status === 'pending-review' && task.proofData && (
            <div className="space-y-2">
              <Label>Submitted Proof</Label>
              <div className="p-3 bg-accent rounded-lg">
                <p className="text-sm">{task.proofData}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <Separator />

          {/* Claim Action */}
          {task.status === 'open' && (
            <div className="flex gap-3">
              <Button 
                onClick={handleClaim} 
                disabled={!canClaim}
                className="flex-1"
              >
                {canClaim ? 'Claim Task' : 'Owner Only'}
              </Button>
              {!canClaim && (
                <p className="text-sm text-muted-foreground self-center">
                  Only owners can claim tasks created by owners
                </p>
              )}
            </div>
          )}

          {/* Submit Completion */}
          {task.status === 'in-progress' && isAssignee && (
            <div className="space-y-3">
              <Label>Submit Task Completion</Label>
              {task.proofType === 'text' && (
                <Textarea
                  placeholder="Enter your completion details..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                />
              )}
              {task.proofType === 'photo' && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Camera className="size-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload photo proof</p>
                </div>
              )}
              <Button onClick={handleSubmitCompletion} className="w-full">
                Submit Completion
              </Button>
            </div>
          )}

          {/* Approval Actions */}
          {canApprove && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowApproval(true)}
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button 
                  onClick={() => setShowRejection(true)}
                  variant="outline" 
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>

              {/* Approval Panel */}
              {showApproval && (
                <div className="space-y-4 p-4 border rounded-lg bg-accent/50">
                  <h4 className="font-medium">Approve Task</h4>
                  
                  {/* Multiplier */}
                  <div className="space-y-2">
                    <Label>Point Multiplier: {multiplier[0].toFixed(1)}x</Label>
                    <Slider
                      value={multiplier}
                      onValueChange={setMultiplier}
                      min={appSettings.multiplierMin}
                      max={appSettings.multiplierMax}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{appSettings.multiplierMin}x</span>
                      <span>{appSettings.multiplierMax}x</span>
                    </div>
                  </div>

                  {/* Point Adjustment */}
                  <div className="space-y-2">
                    <Label>Point Adjustment</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={adjustment}
                        onChange={(e) => setAdjustment(Number(e.target.value))}
                        className="flex-1"
                        min={-currentBudget}
                        max={currentBudget}
                      />
                      <span className="text-sm text-muted-foreground">points</span>
                    </div>
                  </div>

                  {/* Calculation Summary */}
                  <div className="space-y-2 p-3 bg-background rounded border">
                    <div className="flex justify-between text-sm">
                      <span>Base Points:</span>
                      <span>{task.basePoints}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Multiplier ({multiplier[0].toFixed(1)}x):</span>
                      <span>{Math.round(task.basePoints * multiplier[0])}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Adjustment:</span>
                      <span>{adjustment > 0 ? '+' : ''}{adjustment}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Final Points:</span>
                      <span>{calculatedPoints}</span>
                    </div>
                  </div>

                  {/* Budget Tracking */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Budget Used:</span>
                      <span>{budgetCost} / {appSettings.managementDailyBudget}</span>
                    </div>
                    <Progress value={budgetPercentage + (budgetCost / appSettings.managementDailyBudget) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Remaining budget: {remainingBudget} points
                    </p>
                    
                    {budgetCost > currentBudget && (
                      <Alert variant="destructive">
                        <AlertTriangle className="size-4" />
                        <AlertDescription>
                          Insufficient daily budget. Reduce adjustment or try again tomorrow.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleApprove} 
                      disabled={budgetCost > currentBudget}
                      className="flex-1"
                    >
                      Confirm Approval
                    </Button>
                    <Button 
                      onClick={() => setShowApproval(false)} 
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Rejection Panel */}
              {showRejection && (
                <div className="space-y-3 p-4 border rounded-lg bg-accent/50">
                  <Label>Rejection Reason</Label>
                  <Textarea
                    placeholder="Explain why this task is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleReject} 
                      disabled={!rejectionReason.trim()}
                      variant="destructive"
                      className="flex-1"
                    >
                      Reject Task
                    </Button>
                    <Button 
                      onClick={() => setShowRejection(false)} 
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overdue Actions */}
          {task.status === 'overdue' && task.assignerId === currentUser.id && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This task is overdue. Choose an action:
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleReturnToAssigner('extend')}
                  variant="outline" 
                  size="sm"
                >
                  Extend
                </Button>
                <Button 
                  onClick={() => handleReturnToAssigner('reassign')}
                  variant="outline" 
                  size="sm"
                >
                  Reassign
                </Button>
                <Button 
                  onClick={() => handleReturnToAssigner('cancel')}
                  variant="destructive" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}