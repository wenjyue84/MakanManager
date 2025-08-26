"use client";

import React, { useState, useMemo, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign,
  User,
  Calculator,
  FileText,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  PenTool,
  Eye,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Coins,
  Banknote
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
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useCurrentUserWithFallback } from '../../lib/hooks/use-current-user';
import { staffMembers } from '../../lib/staff-data';
import { 
  cashReconciliations,
  addCashReconciliation,
  updateCashReconciliation,
  calculateCashBreakdown,
  calculateDifference,
  getReconciliationStatus,
  getReconciliationsByDate,
  calculateDailyStats,
  calculateWeeklyTrends,
  getPendingApprovals,
  canApproveCash,
  getStatusColor,
  getDiscrepancyReasons,
  getShiftTimes,
  initializeCashBreakdown,
  formatCurrency,
  formatDateTime,
  MYR_NOTES,
  MYR_COINS,
  type CashReconciliation,
  type CashBreakdown,
  type CashDenomination
} from '../../lib/cash-data';
import { toast } from "sonner@2.0.3";
import { 
  exportCashReconciliationsToExcel, 
  exportCashReconciliationsToPDF,
  exportFilteredCashData 
} from '../../lib/cash-export';

export function CashPage() {
  const { user: currentUser } = useCurrentUserWithFallback();
  const [activeTab, setActiveTab] = useState('reconciliation');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [selectedCashier, setSelectedCashier] = useState<string>(currentUser.id);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CashReconciliation | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form states
  const [posSalesTotal, setPosSalesTotal] = useState<number>(0);
  const [openingFloat, setOpeningFloat] = useState<number>(200);
  const [actualCashCount, setActualCashCount] = useState<number>(0);
  const [cashBreakdown, setCashBreakdown] = useState<CashBreakdown>(initializeCashBreakdown());
  const [discrepancyReason, setDiscrepancyReason] = useState<string>('');
  const [discrepancyNotes, setDiscrepancyNotes] = useState<string>('');
  const [isSigned, setIsSigned] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isManagement = canApproveCash(currentUser.id);
  const expectedCash = posSalesTotal + openingFloat;
  const difference = calculateDifference(actualCashCount, expectedCash);
  const status = getReconciliationStatus(difference);

  const weeklyTrends = useMemo(() => calculateWeeklyTrends(), []);
  const pendingApprovals = useMemo(() => getPendingApprovals(), []);
  const todayStats = useMemo(() => calculateDailyStats(selectedDate), [selectedDate]);

  const handleDenominationChange = (type: 'notes' | 'coins', index: number, count: number) => {
    const newBreakdown = { ...cashBreakdown };
    const denomination = newBreakdown[type][index];
    denomination.count = count;
    denomination.total = count * denomination.value;
    
    const newCalculatedBreakdown = calculateCashBreakdown(newBreakdown.notes, newBreakdown.coins);
    setCashBreakdown(newCalculatedBreakdown);
    setActualCashCount(newCalculatedBreakdown.grandTotal);
  };

  const handleDirectCashInput = (amount: number) => {
    setActualCashCount(amount);
    // Reset breakdown when manually entering amount
    setCashBreakdown(initializeCashBreakdown());
  };

  const handleSaveReconciliation = () => {
    if (!selectedShift) {
      toast.error('Please select a shift');
      return;
    }

    if (!isSigned) {
      toast.error('Please provide your signature');
      return;
    }

    const newReconciliation = addCashReconciliation({
      date: selectedDate,
      shift: selectedShift as any,
      cashierId: selectedCashier,
      cashierName: staffMembers.find(s => s.id === selectedCashier)?.name || 'Unknown',
      posSalesTotal,
      openingFloat,
      expectedCash,
      actualCashCount,
      cashBreakdown: cashBreakdown.grandTotal > 0 ? cashBreakdown : undefined,
      difference,
      status,
      discrepancyReason: discrepancyReason || undefined,
      discrepancyNotes: discrepancyNotes || undefined,
      cashierSignature: 'signature_data_placeholder',
      cashierSignedAt: new Date().toISOString(),
      photoUrl: photoFile ? URL.createObjectURL(photoFile) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    toast.success(`Cash reconciliation ${newReconciliation.reconciliationNumber} saved successfully`);
    
    // Reset form
    setPosSalesTotal(0);
    setOpeningFloat(200);
    setActualCashCount(0);
    setCashBreakdown(initializeCashBreakdown());
    setDiscrepancyReason('');
    setDiscrepancyNotes('');
    setIsSigned(false);
    setPhotoFile(null);
  };

  const handleApproveReconciliation = (id: string, approved: boolean) => {
    const updated = updateCashReconciliation(id, {
      managerApproval: approved,
      approvedBy: approved ? currentUser.id : undefined,
      approvedAt: approved ? new Date().toISOString() : undefined,
      finalizedAt: approved ? new Date().toISOString() : undefined
    });

    if (updated) {
      toast.success(`Reconciliation ${approved ? 'approved' : 'rejected'} successfully`);
    }
  };

  const handleExportPDF = () => {
    const result = exportCashReconciliationsToPDF(cashReconciliations);
    if (result.success) {
      toast.success(`PDF exported successfully: ${result.filename}`);
    } else {
      toast.error(`Export failed: ${result.error}`);
    }
  };

  const handleExportExcel = () => {
    const result = exportCashReconciliationsToExcel(cashReconciliations);
    if (result.success) {
      toast.success(`Excel file exported successfully: ${result.filename}`);
    } else {
      toast.error(`Export failed: ${result.error}`);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      toast.success('Photo uploaded successfully');
    }
  };

  const handleViewRecord = (record: CashReconciliation) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const getDifferenceColor = (diff: number): string => {
    if (diff === 0) return 'text-success';
    if (diff < 0) return 'text-destructive';
    return 'text-warning';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'tally': return <CheckCircle className="size-4 text-success" />;
      case 'shortage': return <XCircle className="size-4 text-destructive" />;
      case 'overage': return <AlertTriangle className="size-4 text-warning" />;
      default: return <AlertTriangle className="size-4" />;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Cash Management</h1>
              <p className="text-muted-foreground">
                Daily cash reconciliation and tracking
              </p>
            </div>
            
            {isManagement && pendingApprovals.length > 0 && (
              <Badge variant="warning">
                {pendingApprovals.length} pending approval{pendingApprovals.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="reconciliation">Cash Reconciliation</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              {isManagement && (
                <TabsTrigger value="approvals">
                  Approvals
                  {pendingApprovals.length > 0 && (
                    <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                      {pendingApprovals.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
            
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <Download className="size-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handleExportExcel} variant="outline" size="sm">
                <Download className="size-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>

          <TabsContent value="reconciliation" className="space-y-6">
            {/* Header Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  Reconciliation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Shift *</Label>
                    <Select value={selectedShift} onValueChange={setSelectedShift}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {getShiftTimes().map(shift => (
                          <SelectItem key={shift.value} value={shift.value}>
                            <div className="flex items-center gap-2">
                              <Clock className="size-4" />
                              {shift.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Cashier</Label>
                    <Select value={selectedCashier} onValueChange={setSelectedCashier}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {staffMembers.filter(s => s.roles.includes('staff')).map(staff => (
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
                </div>
              </CardContent>
            </Card>

            {/* Cash Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="size-5" />
                    POS & Float
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>POS Sales Total (RM)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={posSalesTotal}
                      onChange={(e) => setPosSalesTotal(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Opening Float (RM)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={openingFloat}
                      onChange={(e) => setOpeningFloat(parseFloat(e.target.value) || 0)}
                      placeholder="200.00"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Expected Cash (Auto-calculated)</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(expectedCash)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        POS Sales + Opening Float
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="size-5" />
                    Actual Cash Count
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Total Cash Amount (RM)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={actualCashCount}
                      onChange={(e) => handleDirectCashInput(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Cash Breakdown Collapsible */}
                  <Collapsible open={isBreakdownExpanded} onOpenChange={setIsBreakdownExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Coins className="size-4 mr-2" />
                        Detailed Cash Count
                        {isBreakdownExpanded ? <ChevronUp className="size-4 ml-2" /> : <ChevronDown className="size-4 ml-2" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      {/* Notes */}
                      <div>
                        <Label className="flex items-center gap-2">
                          <Banknote className="size-4" />
                          Notes
                        </Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {MYR_NOTES.map((note, index) => (
                            <div key={note.value} className="flex items-center gap-2">
                              <div className="w-16 text-sm font-medium">{note.label}</div>
                              <Input
                                type="number"
                                min="0"
                                value={cashBreakdown.notes[index]?.count || 0}
                                onChange={(e) => handleDenominationChange('notes', index, parseInt(e.target.value) || 0)}
                                className="w-20"
                              />
                              <div className="text-sm text-muted-foreground min-w-[60px]">
                                = {formatCurrency((cashBreakdown.notes[index]?.count || 0) * note.value)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-right mt-2 font-medium">
                          Notes Total: {formatCurrency(cashBreakdown.totalNotes)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Coins */}
                      <div>
                        <Label className="flex items-center gap-2">
                          <Coins className="size-4" />
                          Coins
                        </Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {MYR_COINS.map((coin, index) => (
                            <div key={coin.value} className="flex items-center gap-2">
                              <div className="w-16 text-sm font-medium">{coin.label}</div>
                              <Input
                                type="number"
                                min="0"
                                value={cashBreakdown.coins[index]?.count || 0}
                                onChange={(e) => handleDenominationChange('coins', index, parseInt(e.target.value) || 0)}
                                className="w-20"
                              />
                              <div className="text-sm text-muted-foreground min-w-[60px]">
                                = {formatCurrency((cashBreakdown.coins[index]?.count || 0) * coin.value)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-right mt-2 font-medium">
                          Coins Total: {formatCurrency(cashBreakdown.totalCoins)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="text-right text-lg font-bold">
                        Grand Total: {formatCurrency(cashBreakdown.grandTotal)}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {/* Difference Display */}
                  <div>
                    <Label>Difference</Label>
                    <div className={`mt-1 p-3 rounded-lg border-2 ${
                      difference === 0 ? 'border-success bg-success/10' :
                      difference < 0 ? 'border-destructive bg-destructive/10' :
                      'border-warning bg-warning/10'
                    }`}>
                      <div className={`text-2xl font-bold ${getDifferenceColor(difference)}`}>
                        {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(status)}
                        <span className="text-sm font-medium capitalize">
                          {status === 'tally' ? 'Perfect Match!' : 
                           status === 'shortage' ? 'Cash Shortage' : 'Cash Overage'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Discrepancy Section */}
            {difference !== 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="size-5" />
                    Discrepancy Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Reason for Discrepancy</Label>
                    <Select value={discrepancyReason} onValueChange={setDiscrepancyReason}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDiscrepancyReasons().map(reason => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                      value={discrepancyNotes}
                      onChange={(e) => setDiscrepancyNotes(e.target.value)}
                      placeholder="Provide detailed explanation of the discrepancy..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photo Upload & Signature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="size-5" />
                    Photo Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="size-4 mr-2" />
                      Upload Cash Photo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    {photoFile && (
                      <div className="text-sm text-success">
                        ✓ Photo uploaded: {photoFile.name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="size-5" />
                    Cashier Signature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground rounded-lg p-4 text-center">
                      <canvas
                        ref={signatureRef}
                        width="300"
                        height="100"
                        className="border rounded cursor-crosshair"
                        onClick={() => setIsSigned(true)}
                      />
                      <div className="text-sm text-muted-foreground mt-2">
                        Click to sign
                      </div>
                    </div>
                    {isSigned && (
                      <div className="text-sm text-success">
                        ✓ Signature captured
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Ensure all information is accurate before saving
                  </div>
                  <Button onClick={handleSaveReconciliation} size="lg" className="min-w-[200px]">
                    <FileText className="size-4 mr-2" />
                    Save Reconciliation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Records</CardTitle>
                  <FileText className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.totalReconciliations}</div>
                  <div className="text-xs text-muted-foreground">reconciliations</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="size-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(todayStats.totalSales)}</div>
                  <div className="text-xs text-muted-foreground">today's total</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
                  <AlertTriangle className="size-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.totalDiscrepancies}</div>
                  <div className="text-xs text-muted-foreground">issues found</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Difference</CardTitle>
                  <TrendingUp className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getDifferenceColor(todayStats.netDiscrepancy)}`}>
                    {todayStats.netDiscrepancy > 0 ? '+' : ''}{formatCurrency(todayStats.netDiscrepancy)}
                  </div>
                  <div className="text-xs text-muted-foreground">net variance</div>
                </CardContent>
              </Card>
            </div>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="size-5" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>From Date</Label>
                    <Input
                      type="date"
                      defaultValue={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="mt-1"
                      id="export-from-date"
                    />
                  </div>
                  <div>
                    <Label>To Date</Label>
                    <Input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="mt-1"
                      id="export-to-date"
                    />
                  </div>
                  <div>
                    <Label>Filter by Status</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="tally">Tally</SelectItem>
                        <SelectItem value="shortage">Shortage</SelectItem>
                        <SelectItem value="overage">Overage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button 
                      onClick={() => {
                        const fromDate = (document.getElementById('export-from-date') as HTMLInputElement)?.value;
                        const toDate = (document.getElementById('export-to-date') as HTMLInputElement)?.value;
                        const result = exportFilteredCashData(
                          cashReconciliations, 
                          { dateFrom: fromDate, dateTo: toDate },
                          'pdf'
                        );
                        if (result.success) {
                          toast.success(`Filtered PDF exported: ${result.filename}`);
                        } else {
                          toast.error(`Export failed: ${result.error}`);
                        }
                      }}
                      variant="outline" 
                      size="sm"
                    >
                      <Download className="size-4 mr-1" />
                      PDF
                    </Button>
                    <Button 
                      onClick={() => {
                        const fromDate = (document.getElementById('export-from-date') as HTMLInputElement)?.value;
                        const toDate = (document.getElementById('export-to-date') as HTMLInputElement)?.value;
                        const result = exportFilteredCashData(
                          cashReconciliations, 
                          { dateFrom: fromDate, dateTo: toDate },
                          'excel'
                        );
                        if (result.success) {
                          toast.success(`Filtered Excel exported: ${result.filename}`);
                        } else {
                          toast.error(`Export failed: ${result.error}`);
                        }
                      }}
                      variant="outline" 
                      size="sm"
                    >
                      <Download className="size-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Records Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reconciliations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record #</TableHead>
                        <TableHead>Date & Shift</TableHead>
                        <TableHead>Cashier</TableHead>
                        <TableHead>Sales Total</TableHead>
                        <TableHead>Difference</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashReconciliations.slice(0, 10).map(record => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.reconciliationNumber}</TableCell>
                          <TableCell>
                            <div>{record.date}</div>
                            <div className="text-sm text-muted-foreground capitalize">{record.shift}</div>
                          </TableCell>
                          <TableCell>{record.cashierName}</TableCell>
                          <TableCell>{formatCurrency(record.posSalesTotal)}</TableCell>
                          <TableCell className={getDifferenceColor(record.difference)}>
                            {record.difference > 0 ? '+' : ''}{formatCurrency(record.difference)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(record.status)}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleViewRecord(record)}>
                                <Eye className="size-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  const result = exportFilteredCashData(
                                    [record], 
                                    {},
                                    'pdf',
                                    `reconciliation-${record.reconciliationNumber}.pdf`
                                  );
                                  if (result.success) {
                                    toast.success(`Record exported: ${result.filename}`);
                                  } else {
                                    toast.error(`Export failed: ${result.error}`);
                                  }
                                }}
                                title="Export this record as PDF"
                              >
                                <Download className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isManagement && (
            <TabsContent value="approvals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals ({pendingApprovals.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingApprovals.length > 0 ? (
                    <div className="space-y-4">
                      {pendingApprovals.map(record => (
                        <div key={record.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{record.reconciliationNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                {record.date} • {record.shift} • {record.cashierName}
                              </div>
                              <div className={`text-sm font-medium ${getDifferenceColor(record.difference)}`}>
                                Difference: {record.difference > 0 ? '+' : ''}{formatCurrency(record.difference)}
                              </div>
                              {record.discrepancyNotes && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  Note: {record.discrepancyNotes}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveReconciliation(record.id, true)}
                              >
                                <CheckCircle className="size-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleApproveReconciliation(record.id, false)}
                              >
                                <XCircle className="size-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="size-12 mx-auto mb-4 opacity-50" />
                      <div>No pending approvals</div>
                      <div className="text-sm">All reconciliations have been processed</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* View Record Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>Reconciliation {selectedRecord.reconciliationNumber}</span>
                  <Badge variant={getStatusColor(selectedRecord.status)}>
                    {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedRecord.date} • {selectedRecord.shift} shift • {selectedRecord.cashierName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>POS Sales Total</Label>
                    <div className="text-lg font-medium">{formatCurrency(selectedRecord.posSalesTotal)}</div>
                  </div>
                  <div>
                    <Label>Opening Float</Label>
                    <div className="text-lg font-medium">{formatCurrency(selectedRecord.openingFloat)}</div>
                  </div>
                  <div>
                    <Label>Expected Cash</Label>
                    <div className="text-lg font-medium">{formatCurrency(selectedRecord.expectedCash)}</div>
                  </div>
                  <div>
                    <Label>Actual Cash Count</Label>
                    <div className="text-lg font-medium">{formatCurrency(selectedRecord.actualCashCount)}</div>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <Label>Difference</Label>
                  <div className={`text-3xl font-bold ${getDifferenceColor(selectedRecord.difference)}`}>
                    {selectedRecord.difference > 0 ? '+' : ''}{formatCurrency(selectedRecord.difference)}
                  </div>
                </div>

                {selectedRecord.discrepancyNotes && (
                  <>
                    <Separator />
                    <div>
                      <Label>Discrepancy Notes</Label>
                      <div className="bg-muted p-3 rounded-lg mt-1">{selectedRecord.discrepancyNotes}</div>
                    </div>
                  </>
                )}

                {selectedRecord.managerApproval !== undefined && (
                  <>
                    <Separator />
                    <div>
                      <Label>Manager Approval</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedRecord.managerApproval ? (
                          <CheckCircle className="size-4 text-success" />
                        ) : (
                          <XCircle className="size-4 text-destructive" />
                        )}
                        <span>{selectedRecord.managerApproval ? 'Approved' : 'Rejected'}</span>
                        {selectedRecord.approvedAt && (
                          <span className="text-sm text-muted-foreground">
                            on {formatDateTime(selectedRecord.approvedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}