"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Star, User, RotateCcw, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Task, Station, TaskStatus } from '../../lib/types';
import { users } from '../../lib/data';
import { useCurrentUser } from '../../lib/hooks/use-current-user';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TaskEditModal({ task, isOpen, onClose, onTaskUpdate, onTaskDelete }: TaskEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    station: 'kitchen' as Station,
    status: 'open' as TaskStatus,
    dueDate: '',
    dueTime: '',
    basePoints: 10,
    assigneeId: '',
    proofType: 'none' as 'photo' | 'text' | 'checklist' | 'none',
    repeat: '' as '' | 'daily' | 'weekly' | 'monthly' | 'custom',
    customRepeat: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const stations: Station[] = ['kitchen', 'front', 'store', 'outdoor'];
  const statuses: TaskStatus[] = ['open', 'in-progress', 'on-hold', 'pending-review', 'overdue', 'done'];
  const proofTypes = ['none', 'photo', 'text', 'checklist'];
  const repeatOptions = ['', 'daily', 'weekly', 'monthly', 'custom'];

  const { user: currentUser, isLoading } = useCurrentUser();

  if (isLoading || !currentUser) {
    return null;
  }

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        station: task.station,
        status: task.status,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        basePoints: task.basePoints,
        assigneeId: task.assigneeId || '',
        proofType: task.proofType,
        repeat: task.repeat || '',
        customRepeat: ''
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (!formData.dueTime) {
      newErrors.dueTime = 'Due time is required';
    }
    if (formData.basePoints < 1) {
      newErrors.basePoints = 'Base points must be at least 1';
    }
    if (formData.repeat === 'custom' && !formData.customRepeat.trim()) {
      newErrors.customRepeat = 'Custom repeat schedule is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !task) {
      return;
    }

    const updates: Partial<Task> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      station: formData.station,
      status: formData.status,
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      basePoints: formData.basePoints,
      assigneeId: formData.assigneeId || undefined,
      proofType: formData.proofType,
      repeat: formData.repeat || undefined
    };

    onTaskUpdate(task.id, updates);
    handleClose();
  };

  const handleDelete = () => {
    if (task) {
      onTaskDelete(task.id);
      handleClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    setShowDeleteConfirm(false);
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const canEdit = task && (
    currentUser.roles.includes('owner') ||
    currentUser.roles.includes('manager') ||
    currentUser.roles.includes('head-of-kitchen') ||
    currentUser.roles.includes('front-desk-manager') ||
    task.assignerId === currentUser.id
  );

  const canDelete = task && (
    currentUser.roles.includes('owner') ||
    (task.status === 'open' && task.assignerId === currentUser.id)
  );

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="size-5" />
            Edit Task
          </DialogTitle>
        </DialogHeader>

        {!canEdit ? (
          <Alert>
            <AlertDescription>
              You don't have permission to edit this task.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Task Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter task title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what needs to be done..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={errors.description ? 'border-destructive' : ''}
                  rows={3}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>
            </div>

            {/* Assignment & Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Assignment & Location</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="station">Station *</Label>
                  <Select 
                    value={formData.station} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, station: value as Station }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station} value={station} className="capitalize">
                          {station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Select 
                    value={formData.assigneeId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {users
                        .filter(user => user.id !== currentUser.id)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <span>{user.name}</span>
                              <span className="text-xs text-muted-foreground capitalize">
                                ({user.station})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status & Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status & Schedule</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TaskStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      min={getMinDate()}
                      className={`pl-10 ${errors.dueDate ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueTime">Due Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="dueTime"
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                    className={`pl-10 ${errors.dueTime ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.dueTime && <p className="text-sm text-destructive">{errors.dueTime}</p>}
              </div>
            </div>

            {/* Points & Proof */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Points & Proof</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePoints">Base Points *</Label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="basePoints"
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.basePoints}
                      onChange={(e) => setFormData(prev => ({ ...prev, basePoints: parseInt(e.target.value) || 1 }))}
                      className={`pl-10 ${errors.basePoints ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.basePoints && <p className="text-sm text-destructive">{errors.basePoints}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proofType">Proof Type</Label>
                  <Select 
                    value={formData.proofType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, proofType: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {proofTypes.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type === 'none' ? 'No proof required' : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Repeat Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Repeat Schedule (Optional)</h3>
              
              <div className="space-y-2">
                <Label htmlFor="repeat">Repeat</Label>
                <Select 
                  value={formData.repeat} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, repeat: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    {repeatOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === '' ? 'No repeat' : 
                         option === 'custom' ? 'Custom schedule' : 
                         option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.repeat === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customRepeat">Custom Schedule *</Label>
                  <Input
                    id="customRepeat"
                    placeholder="e.g., Every Monday, Every 2 weeks, etc."
                    value={formData.customRepeat}
                    onChange={(e) => setFormData(prev => ({ ...prev, customRepeat: e.target.value }))}
                    className={errors.customRepeat ? 'border-destructive' : ''}
                  />
                  {errors.customRepeat && <p className="text-sm text-destructive">{errors.customRepeat}</p>}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" className="flex-1">
                Update Task
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {canDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </form>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="flex-1"
                >
                  Delete Task
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
