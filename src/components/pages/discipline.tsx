"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useCurrentUser } from '../../lib/hooks/use-current-user';
import { staffMembers } from '../../lib/staff-data';
import { disciplinaryTypes, managementBudgets, appSettings } from '../../lib/data';
import type { DisciplinaryType } from '../../lib/types';
import { toast } from 'sonner';

export function DisciplinePage() {
  const { user: currentUser, isLoading } = useCurrentUser();
  const [types, setTypes] = useState<DisciplinaryType[]>([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [reason, setReason] = useState('');
  const [remainingBudget, setRemainingBudget] = useState(0);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await fetch('/api/disciplinary-types');
        if (res.ok) {
          setTypes(await res.json());
        } else {
          setTypes(disciplinaryTypes);
        }
      } catch {
        setTypes(disciplinaryTypes);
      }
    };
    loadTypes();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setRemainingBudget(
        managementBudgets.get(currentUser.id) || appSettings.managementDailyBudget
      );
    }
  }, [currentUser]);

  const handleSubmit = async () => {
    if (!currentUser) return;
    const type = types.find((t) => t.id === typeId);
    if (!type) return;
    const cost = Math.abs(type.defaultPoints);
    if (cost > remainingBudget) {
      toast.error('Insufficient daily budget');
      return;
    }
    try {
      const res = await fetch('/api/disciplinary-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          typeId,
          reason,
          createdById: currentUser.id,
        }),
      });
      if (!res.ok) throw new Error('Failed to record action');
      managementBudgets.set(currentUser.id, remainingBudget - cost);
      setRemainingBudget(remainingBudget - cost);
      setTargetUserId('');
      setTypeId('');
      setReason('');
      toast.success('Disciplinary action recorded');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading || !currentUser) return null;

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Record Disciplinary Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Staff Member</Label>
            <Select value={targetUserId} onValueChange={setTargetUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.defaultPoints})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">
            Remaining budget: {remainingBudget}
          </div>
          <Button onClick={handleSubmit} disabled={!targetUserId || !typeId || !reason}>
            Submit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default DisciplinePage;
