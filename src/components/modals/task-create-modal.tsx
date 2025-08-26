"use client";

import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Star, User, RotateCcw } from 'lucide-react';
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
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Task, Station, User as UserType } from '../../lib/types';
import { users } from '../../lib/data';
import { useCurrentUser } from '../../lib/hooks/use-current-user';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'overdueDays'>) => void;
}

export function TaskCreateModal({ isOpen, onClose, onCreateTask }: TaskCreateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    station: 'kitchen' as Station,
    dueDate: '',
    dueTime: '',
    basePoints: 10,
    assigneeId: '',
    proofType: 'none' as 'photo' | 'text' | 'checklist' | 'none',
    repeat: '' as '' | 'daily' | 'weekly' | 'monthly' | 'custom',
    customRepeat: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const stations: Station[] = ['kitchen', 'front', 'store', 'outdoor'];
  const proofTypes = ['none', 'photo', 'text', 'checklist'];
  const repeatOptions = ['', 'daily', 'weekly', 'monthly', 'custom'];

  const { user: currentUser, isLoading } = useCurrentUser();

  if (isLoading || !currentUser) {
    return null;
  }

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
    
    if (!validateForm()) {
      return;
    }

    const taskData: Omit<Task, 'id' | 'createdAt' | 'overdueDays'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      station: formData.station,
      status: 'open',
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      basePoints: formData.basePoints,
      assignerId: currentUser.id,
      assigneeId: formData.assigneeId || undefined,
      proofType: formData.proofType,
      repeat: formData.repeat || undefined,
      proofData: undefined,
      finalPoints: undefined,
      multiplier: undefined,
      adjustment: undefined,
      rejectionReason: undefined,
      completedAt: undefined,
      approvedAt: undefined
    };

    onCreateTask(taskData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      station: 'kitchen',
      dueDate: '',
      dueTime: '',
      basePoints: 10,
      assigneeId: '',
      proofType: 'none',
      repeat: '',
      customRepeat: ''
    });
    setErrors({});
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="size-5" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

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
                <Label htmlFor="assignee">Assignee (Optional)</Label>
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

          {/* Schedule & Points */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule & Points</h3>
            
            <div className="grid grid-cols-2 gap-4">
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
              <p className="text-xs text-muted-foreground">
                Base points that will be awarded upon completion
              </p>
            </div>
          </div>

          {/* Proof Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Proof Requirements</h3>
            
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
              <p className="text-xs text-muted-foreground">
                {formData.proofType === 'none' && 'Task can be completed without proof'}
                {formData.proofType === 'photo' && 'Requires photo evidence of completion'}
                {formData.proofType === 'text' && 'Requires text description of work done'}
                {formData.proofType === 'checklist' && 'Requires checklist completion'}
              </p>
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
              Create Task
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
