"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  DollarSign,
  Clock,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  TrendingUp,
  User,
  FileText,
  Calculator
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { useCurrentUserWithFallback } from '../../lib/hooks/use-current-user';
import { staffMembers } from '../../lib/staff-data';
import { 
  overtimeRecords,
  salaryAdvances,
  addOvertimeRecord,
  updateOvertimeRecord,
  deleteOvertimeRecord,
  addSalaryAdvance,
  updateSalaryAdvance,
  getOvertimeRecordsByStaff,
  getSalaryAdvancesByStaff,
  calculatePeriodSummary,
  canApproveSalaryAdvance,
  getPendingApprovals,
  getOTStatusColor,
  getAdvanceStatusColor,
  getStaffHourlyRate,
  formatCurrency,
  formatDateTime,
  formatTime,
  calculateHoursDifference,
  type OvertimeRecord,
  type SalaryAdvance
} from '../../lib/salary-data';
import { toast } from "sonner";

export function SalaryPage() {
  const { user: currentUser } = useCurrentUserWithFallback();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStaff, setSelectedStaff] = useState<string>(currentUser.id);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  // Dialog states
  const [isOTDialogOpen, setIsOTDialogOpen] = useState(false);
  const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OvertimeRecord | SalaryAdvance | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Add state for OT records to trigger re-renders
  const [otRecords, setOtRecords] = useState<OvertimeRecord[]>([]);
  const [advanceRecords, setAdvanceRecords] = useState<SalaryAdvance[]>([]);

  // Form states
  const [otForm, setOtForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    description: ''
  });

  const [advanceForm, setAdvanceForm] = useState({
    amount: 0,
    reason: '',
    repaymentMethod: 'salary-deduction' as 'salary-deduction' | 'manual',
    monthlyDeduction: 0
  });

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load initial data
  useEffect(() => {
    loadOTRecords();
    loadAdvanceRecords();
  }, [selectedStaff, dateRange]);

  const loadOTRecords = () => {
    const records = getOvertimeRecordsByStaff(targetStaffId).filter(record => 
      record.date >= dateRange.start && record.date <= dateRange.end
    );
    setOtRecords(records);
  };

  const loadAdvanceRecords = () => {
    const records = getSalaryAdvancesByStaff(targetStaffId).filter(advance => 
      advance.requestDate >= dateRange.start && advance.requestDate <= dateRange.end
    );
    setAdvanceRecords(records);
  };

  const isManagement = currentUser.roles.some(role => 
    ['owner', 'manager'].includes(role)
  );
  
  const canApprove = canApproveSalaryAdvance(currentUser.id);
  const canViewAllRecords = isManagement;

  // Get data based on permissions
  const staffToShow = canViewAllRecords ? staffMembers : staffMembers.filter(s => s.id === currentUser.id);
  const targetStaffId = canViewAllRecords ? selectedStaff : currentUser.id;

  // Calculate summary for selected period
  const periodSummary = useMemo(() => {
    return calculatePeriodSummary(targetStaffId, dateRange.start, dateRange.end);
  }, [targetStaffId, dateRange, otRecords, advanceRecords]);

  // Get records for display - use local state instead of recalculating
  const staffOTRecords = otRecords;
  const staffAdvances = advanceRecords;

  // Pending approvals for management
  const pendingApprovals = useMemo(() => {
    if (!canApprove) return { pendingOT: [], pendingAdvances: [], totalPending: 0 };
    return getPendingApprovals();
  }, [canApprove, otRecords, advanceRecords]);

  const getUserById = (id: string) => {
    return staffMembers.find(member => member.id === id);
  };

  const handleAddOT = () => {
    if (!otForm.date || !otForm.startTime || !otForm.endTime || !otForm.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const totalHours = calculateHoursDifference(otForm.startTime, otForm.endTime);
    if (totalHours <= 0) {
      toast.error('Invalid time range');
      return;
    }

    const hourlyRate = getStaffHourlyRate(currentUser.id);
    const totalAmount = totalHours * hourlyRate;

    const newRecord = addOvertimeRecord({
      staffId: currentUser.id,
      date: otForm.date,
      startTime: otForm.startTime,
      endTime: otForm.endTime,
      totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      hourlyRate,
      totalAmount: Math.round(totalAmount * 100) / 100,
      description: otForm.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Reload OT records to update the UI
    loadOTRecords();
    
    toast.success(`OT record added! ${totalHours.toFixed(1)} hours - ${formatCurrency(totalAmount)}`);
    setIsOTDialogOpen(false);
    setOtForm({
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      description: ''
    });
  };

  const handleRequestAdvance = () => {
    if (advanceForm.amount <= 0 || !advanceForm.reason.trim()) {
      toast.error('Please enter amount and reason');
      return;
    }

    const newAdvance = addSalaryAdvance({
      // Use targetStaffId so management can request advances for selected staff
      staffId: targetStaffId,
      requestedAmount: advanceForm.amount,
      reason: advanceForm.reason,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      repaymentMethod: advanceForm.repaymentMethod,
      monthlyDeduction: advanceForm.monthlyDeduction,
      remainingBalance: advanceForm.amount,
      repaymentHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Reload advance records to update the UI
    loadAdvanceRecords();

    toast.success(`Salary advance requested: ${formatCurrency(advanceForm.amount)}`);
    setIsAdvanceDialogOpen(false);
    setAdvanceForm({
      amount: 0,
      reason: '',
      repaymentMethod: 'salary-deduction',
      monthlyDeduction: 0
    });
  };

  const handleApproveOT = (record: OvertimeRecord, approved: boolean) => {
    const updated = updateOvertimeRecord(record.id, {
      status: approved ? 'approved' : 'rejected',
      approvedBy: approved ? currentUser.id : undefined,
      approvedAt: approved ? new Date().toISOString() : undefined,
      rejectionReason: approved ? undefined : 'Rejected by management'
    });

    if (updated) {
      // Reload records to update the UI
      loadOTRecords();
      const staff = getUserById(record.staffId);
      toast.success(`OT ${approved ? 'approved' : 'rejected'} for ${staff?.name}`);
    }
  };

  const handleApproveAdvance = (advance: SalaryAdvance, approved: boolean, rejectionReason?: string) => {
    const updated = updateSalaryAdvance(advance.id, {
      status: approved ? 'approved' : 'rejected',
      approvedBy: currentUser.id,
      approvedAt: new Date().toISOString(),
      rejectionReason: approved ? undefined : rejectionReason
    });

    if (updated) {
      // Reload records to update the UI
      loadAdvanceRecords();
      const staff = getUserById(advance.staffId);
      toast.success(`Advance ${approved ? 'approved' : 'rejected'} for ${staff?.name}`);
    }
  };

  const handleDownloadRecord = () => {
    const staff = getUserById(targetStaffId);
    const filename = `salary-record-${staff?.name.replace(/\s+/g, '-')}-${dateRange.start}-to-${dateRange.end}.txt`;
    
    const content = generateSalaryReport(targetStaffId, dateRange.start, dateRange.end);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Salary record downloaded successfully');
  };

  const generateSalaryReport = (staffId: string, startDate: string, endDate: string): string => {
    const staff = getUserById(staffId);
    const otRecords = getOvertimeRecordsByStaff(staffId).filter(r => 
      r.date >= startDate && r.date <= endDate
    );
    const advances = getSalaryAdvancesByStaff(staffId).filter(a => 
      a.requestDate >= startDate && a.requestDate <= endDate
    );
    const summary = calculatePeriodSummary(staffId, startDate, endDate);

    let report = `MAKAN MOMENTS CAFE - SALARY RECORD\n`;
    report += `=======================================\n\n`;
    report += `Staff: ${staff?.name}\n`;
    report += `Period: ${startDate} to ${endDate}\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    report += `SUMMARY\n`;
    report += `-------\n`;
    report += `Total OT Hours: ${summary.totalOTHours.toFixed(1)} hours\n`;
    report += `Total OT Amount: ${formatCurrency(summary.totalOTAmount)}\n`;
    report += `Total Advances: ${formatCurrency(summary.totalAdvancesTaken)}\n`;
    report += `Net Earnings: ${formatCurrency(summary.netEarnings)}\n\n`;
    
    if (otRecords.length > 0) {
      report += `OVERTIME RECORDS\n`;
      report += `----------------\n`;
      otRecords.forEach(record => {
        report += `${record.date} | ${formatTime(record.startTime)}-${formatTime(record.endTime)} | `;
        report += `${record.totalHours.toFixed(1)}h | ${formatCurrency(record.totalAmount)} | `;
        report += `${record.status.toUpperCase()}\n`;
        report += `  Description: ${record.description}\n\n`;
      });
    }
    
    if (advances.length > 0) {
      report += `SALARY ADVANCES\n`;
      report += `---------------\n`;
      advances.forEach(advance => {
        report += `${advance.advanceNumber} | ${advance.requestDate} | `;
        report += `${formatCurrency(advance.requestedAmount)} | ${advance.status.toUpperCase()}\n`;
        report += `  Reason: ${advance.reason}\n`;
        report += `  Balance: ${formatCurrency(advance.remainingBalance)}\n\n`;
      });
    }
    
    return report;
  };

  // Component for OT record card (mobile)
  const OTRecordCard = ({ record }: { record: OvertimeRecord }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-medium">{record.date}</div>
            <div className="text-sm text-muted-foreground">
              {formatTime(record.startTime)} - {formatTime(record.endTime)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{record.totalHours.toFixed(1)}h</div>
            <div className="text-sm font-medium text-success">
              {formatCurrency(record.totalAmount)}
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mb-2">{record.description}</div>
        <div className="flex items-center justify-between">
          <Badge variant={getOTStatusColor(record.status)}>
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </Badge>
          {canApprove && record.status === 'pending' && (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => handleApproveOT(record, true)}>
                <CheckCircle className="size-3 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleApproveOT(record, false)}>
                <XCircle className="size-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Component for advance request card (mobile)
  const AdvanceCard = ({ advance }: { advance: SalaryAdvance }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-medium">{advance.advanceNumber}</div>
            <div className="text-sm text-muted-foreground">{advance.requestDate}</div>
          </div>
          <div className="text-right">
            <div className="font-medium text-primary">
              {formatCurrency(advance.requestedAmount)}
            </div>
            <div className="text-xs text-muted-foreground">
              Balance: {formatCurrency(advance.remainingBalance)}
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mb-2">{advance.reason}</div>
        <div className="flex items-center justify-between">
          <Badge variant={getAdvanceStatusColor(advance.status)}>
            {advance.status.charAt(0).toUpperCase() + advance.status.slice(1)}
          </Badge>
          {canApprove && advance.status === 'pending' && (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => handleApproveAdvance(advance, true)}>
                <CheckCircle className="size-3 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleApproveAdvance(advance, false, 'Rejected by management')}>
                <XCircle className="size-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Salary Management</h1>
              <p className="text-muted-foreground">
                Track overtime hours, salary advances, and earnings
              </p>
            </div>
            
            {canApprove && pendingApprovals.totalPending > 0 && (
              <Badge variant="warning" className="mr-2">
                {pendingApprovals.totalPending} pending approval{pendingApprovals.totalPending !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            {canViewAllRecords && (
              <div className="flex-1">
                <Label>Staff Member</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {staffToShow.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src={staff.photo} />
                            <AvatarFallback className="text-xs">{staff.name[0]}</AvatarFallback>
                          </Avatar>
                          {staff.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex gap-2">
              <div>
                <Label>From</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>To</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleDownloadRecord} variant="outline">
                  <Download className="size-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OT Hours</CardTitle>
              <Clock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{periodSummary.totalOTHours.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">hours worked</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OT Earnings</CardTitle>
              <TrendingUp className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(periodSummary.totalOTAmount)}</div>
              <div className="text-xs text-muted-foreground">approved amount</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Advances</CardTitle>
              <DollarSign className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(periodSummary.totalAdvancesTaken)}</div>
              <div className="text-xs text-muted-foreground">taken this period</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
              <Calculator className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(periodSummary.netEarnings)}</div>
              <div className="text-xs text-muted-foreground">OT minus advances</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="overtime">Overtime</TabsTrigger>
              <TabsTrigger value="advances">Advances</TabsTrigger>
              {canApprove && (
                <TabsTrigger value="approvals">
                  Approvals
                  {pendingApprovals.totalPending > 0 && (
                    <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                      {pendingApprovals.totalPending}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
            
            <div className="flex gap-2">
              <Button onClick={() => setIsOTDialogOpen(true)}>
                <Plus className="size-4 mr-2" />
                Add OT
              </Button>
              <Button onClick={() => setIsAdvanceDialogOpen(true)} variant="outline">
                <DollarSign className="size-4 mr-2" />
                Request Advance
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Overtime</CardTitle>
                </CardHeader>
                <CardContent>
                  {staffOTRecords.slice(0, 5).map(record => (
                    <div key={record.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="text-sm font-medium">{record.date}</div>
                        <div className="text-xs text-muted-foreground">
                          {record.totalHours.toFixed(1)}h - {record.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(record.totalAmount)}</div>
                        <Badge variant={getOTStatusColor(record.status)} className="text-xs">
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {staffOTRecords.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No overtime records for this period
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Advances</CardTitle>
                </CardHeader>
                <CardContent>
                  {staffAdvances.slice(0, 5).map(advance => (
                    <div key={advance.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="text-sm font-medium">{advance.advanceNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {advance.requestDate} - {advance.reason.substring(0, 30)}...
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(advance.requestedAmount)}</div>
                        <Badge variant={getAdvanceStatusColor(advance.status)} className="text-xs">
                          {advance.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {staffAdvances.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No salary advances for this period
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="overtime" className="space-y-4">
            {isMobile ? (
              <div>
                {staffOTRecords.map(record => (
                  <OTRecordCard key={record.id} record={record} />
                ))}
                {staffOTRecords.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No overtime records found for this period
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      {canApprove && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffOTRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          {formatTime(record.startTime)} - {formatTime(record.endTime)}
                        </TableCell>
                        <TableCell>{record.totalHours.toFixed(1)}h</TableCell>
                        <TableCell>{formatCurrency(record.hourlyRate)}/h</TableCell>
                        <TableCell className="font-medium">{formatCurrency(record.totalAmount)}</TableCell>
                        <TableCell className="max-w-xs truncate">{record.description}</TableCell>
                        <TableCell>
                          <Badge variant={getOTStatusColor(record.status)}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </TableCell>
                        {canApprove && (
                          <TableCell>
                            {record.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => handleApproveOT(record, true)}>
                                  <CheckCircle className="size-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleApproveOT(record, false)}>
                                  <XCircle className="size-3" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {staffOTRecords.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No overtime records found for this period
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="advances" className="space-y-4">
            {isMobile ? (
              <div>
                {staffAdvances.map(advance => (
                  <AdvanceCard key={advance.id} advance={advance} />
                ))}
                {staffAdvances.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No salary advances found for this period
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      {canApprove && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffAdvances.map(advance => (
                      <TableRow key={advance.id}>
                        <TableCell className="font-medium">{advance.advanceNumber}</TableCell>
                        <TableCell>{advance.requestDate}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(advance.requestedAmount)}</TableCell>
                        <TableCell className="max-w-xs truncate">{advance.reason}</TableCell>
                        <TableCell>{formatCurrency(advance.remainingBalance)}</TableCell>
                        <TableCell>
                          <Badge variant={getAdvanceStatusColor(advance.status)}>
                            {advance.status.charAt(0).toUpperCase() + advance.status.slice(1)}
                          </Badge>
                        </TableCell>
                        {canApprove && (
                          <TableCell>
                            {advance.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => handleApproveAdvance(advance, true)}>
                                  <CheckCircle className="size-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleApproveAdvance(advance, false, 'Rejected by management')}>
                                  <XCircle className="size-3" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {staffAdvances.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No salary advances found for this period
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {canApprove && (
            <TabsContent value="approvals" className="space-y-4">
              <div className="grid gap-4">
                {pendingApprovals.pendingOT.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Overtime Approvals ({pendingApprovals.pendingOT.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pendingApprovals.pendingOT.map(record => {
                          const staff = getUserById(record.staffId);
                          return (
                            <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                  <AvatarImage src={staff?.photo} />
                                  <AvatarFallback>{staff?.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{staff?.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {record.date} • {record.totalHours.toFixed(1)}h • {formatCurrency(record.totalAmount)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{record.description}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleApproveOT(record, true)}>
                                  <CheckCircle className="size-4 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleApproveOT(record, false)}>
                                  <XCircle className="size-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {pendingApprovals.pendingAdvances.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Advance Approvals ({pendingApprovals.pendingAdvances.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pendingApprovals.pendingAdvances.map(advance => {
                          const staff = getUserById(advance.staffId);
                          return (
                            <div key={advance.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                  <AvatarImage src={staff?.photo} />
                                  <AvatarFallback>{staff?.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{staff?.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {advance.advanceNumber} • {advance.requestDate} • {formatCurrency(advance.requestedAmount)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{advance.reason}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleApproveAdvance(advance, true)}>
                                  <CheckCircle className="size-4 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleApproveAdvance(advance, false, 'Rejected by management')}>
                                  <XCircle className="size-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {pendingApprovals.totalPending === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="size-12 mx-auto mb-4 opacity-50" />
                    <div>No pending approvals</div>
                    <div className="text-sm">All requests have been processed</div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Add OT Dialog */}
      <Dialog open={isOTDialogOpen} onOpenChange={setIsOTDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Overtime Record</DialogTitle>
            <DialogDescription>
              Record your overtime hours for approval
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={otForm.date}
                onChange={(e) => setOtForm(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={otForm.startTime}
                  onChange={(e) => setOtForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={otForm.endTime}
                  onChange={(e) => setOtForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            {otForm.startTime && otForm.endTime && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Hours:</span> {calculateHoursDifference(otForm.startTime, otForm.endTime).toFixed(1)}h
                </div>
                <div className="text-sm">
                  <span className="font-medium">Rate:</span> {formatCurrency(getStaffHourlyRate(currentUser.id))}/hour
                </div>
                <div className="text-sm">
                  <span className="font-medium">Total:</span> {formatCurrency(calculateHoursDifference(otForm.startTime, otForm.endTime) * getStaffHourlyRate(currentUser.id))}
                </div>
              </div>
            )}

            <div>
              <Label>Description *</Label>
              <Textarea
                value={otForm.description}
                onChange={(e) => setOtForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the overtime work performed..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOTDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOT}>
              Add OT Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Advance Dialog */}
      <Dialog open={isAdvanceDialogOpen} onOpenChange={setIsAdvanceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Salary Advance</DialogTitle>
            <DialogDescription>
              Submit a request for salary advance (requires approval)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Amount (RM) *</Label>
              <Input
                type="number"
                step="0.01"
                value={advanceForm.amount}
                onChange={(e) => setAdvanceForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Reason *</Label>
              <Textarea
                value={advanceForm.reason}
                onChange={(e) => setAdvanceForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please provide detailed reason for the advance request..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Repayment Method</Label>
              <Select 
                value={advanceForm.repaymentMethod} 
                onValueChange={(value) => setAdvanceForm(prev => ({ ...prev, repaymentMethod: value as 'salary-deduction' | 'manual' }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary-deduction">Monthly Salary Deduction</SelectItem>
                  <SelectItem value="manual">Manual Repayment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {advanceForm.repaymentMethod === 'salary-deduction' && (
              <div>
                <Label>Monthly Deduction (RM)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={advanceForm.monthlyDeduction}
                  onChange={(e) => setAdvanceForm(prev => ({ ...prev, monthlyDeduction: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="mt-1"
                />
                {advanceForm.monthlyDeduction > 0 && advanceForm.amount > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Repayment period: {Math.ceil(advanceForm.amount / advanceForm.monthlyDeduction)} months
                  </div>
                )}
              </div>
            )}

            <div className="bg-warning/10 p-3 rounded-lg">
              <div className="text-sm text-warning-foreground">
                <AlertCircle className="size-4 inline mr-1" />
                <strong>Note:</strong> Advance requests can only be approved by Jay, Niko, or Le.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdvanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestAdvance}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

