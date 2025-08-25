import { UserRole } from './types';

// Overtime Record
export interface OvertimeRecord {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  hourlyRate: number; // RM per hour
  totalAmount: number; // calculated: totalHours * hourlyRate
  description: string;
  approvedBy?: string; // manager id who approved
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Salary Advance Request
export interface SalaryAdvance {
  id: string;
  advanceNumber: string; // ADV-001, ADV-002, etc.
  staffId: string;
  requestedAmount: number; // RM
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string; // only Jay, Niko, or Le can approve
  approvedAt?: string;
  rejectionReason?: string;
  repaymentMethod: 'salary-deduction' | 'manual';
  monthlyDeduction?: number; // RM per month if salary-deduction
  remainingBalance: number; // current outstanding amount
  repaymentHistory: RepaymentRecord[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Repayment tracking
export interface RepaymentRecord {
  id: string;
  advanceId: string;
  amount: number; // RM repaid
  date: string;
  method: 'salary-deduction' | 'cash' | 'bank-transfer';
  processedBy: string; // staff id who processed
  notes?: string;
  createdAt: string;
}

// Monthly Salary Summary
export interface SalarySummary {
  staffId: string;
  month: string; // YYYY-MM format
  baseSalary: number;
  overtimeHours: number;
  overtimeAmount: number;
  advanceDeductions: number;
  netSalary: number;
  generatedAt: string;
}

// Enhanced OT Records with focus on Bahar (ID: 10) and other staff
export let overtimeRecords: OvertimeRecord[] = [
  // Bahar's OT Records - Multiple entries with different statuses
  {
    id: '1',
    staffId: '10', // Bahar
    date: '2024-08-23',
    startTime: '22:00',
    endTime: '02:00',
    totalHours: 4,
    hourlyRate: 11.50,
    totalAmount: 46.00,
    description: 'Late night kitchen deep cleaning and inventory organization',
    approvedBy: '3', // Le
    approvedAt: '2024-08-24T09:00:00Z',
    status: 'approved',
    createdAt: '2024-08-24T06:00:00Z',
    updatedAt: '2024-08-24T09:00:00Z'
  },
  {
    id: '2',
    staffId: '10', // Bahar
    date: '2024-08-22',
    startTime: '19:30',
    endTime: '23:30',
    totalHours: 4,
    hourlyRate: 11.50,
    totalAmount: 46.00,
    description: 'Weekend catering preparation for Monday corporate order',
    approvedBy: '1', // Jay
    approvedAt: '2024-08-23T10:00:00Z',
    status: 'approved',
    createdAt: '2024-08-23T07:00:00Z',
    updatedAt: '2024-08-23T10:00:00Z'
  },
  {
    id: '3',
    staffId: '10', // Bahar
    date: '2024-08-21',
    startTime: '18:00',
    endTime: '22:00',
    totalHours: 4,
    hourlyRate: 11.50,
    totalAmount: 46.00,
    description: 'Staff training for new Indonesian dishes and recipe standardization',
    status: 'pending',
    createdAt: '2024-08-22T06:30:00Z',
    updatedAt: '2024-08-22T06:30:00Z'
  },
  {
    id: '4',
    staffId: '10', // Bahar
    date: '2024-08-20',
    startTime: '20:00',
    endTime: '01:00',
    totalHours: 5,
    hourlyRate: 11.50,
    totalAmount: 57.50,
    description: 'Extended dinner service due to unexpected large group booking',
    approvedBy: '2', // Niko
    approvedAt: '2024-08-21T08:30:00Z',
    status: 'approved',
    createdAt: '2024-08-21T07:00:00Z',
    updatedAt: '2024-08-21T08:30:00Z'
  },
  {
    id: '5',
    staffId: '10', // Bahar
    date: '2024-08-19',
    startTime: '21:00',
    endTime: '00:30',
    totalHours: 3.5,
    hourlyRate: 11.50,
    totalAmount: 40.25,
    description: 'Kitchen equipment maintenance and preparation for tomorrow',
    status: 'pending',
    createdAt: '2024-08-20T06:45:00Z',
    updatedAt: '2024-08-20T06:45:00Z'
  },
  {
    id: '6',
    staffId: '10', // Bahar
    date: '2024-08-18',
    startTime: '17:00',
    endTime: '21:00',
    totalHours: 4,
    hourlyRate: 11.50,
    totalAmount: 46.00,
    description: 'Sunday special menu preparation and ingredient prep for Monday',
    approvedBy: '3', // Le
    approvedAt: '2024-08-19T09:00:00Z',
    status: 'approved',
    createdAt: '2024-08-19T06:00:00Z',
    updatedAt: '2024-08-19T09:00:00Z'
  },
  
  // Other staff OT records for context
  {
    id: '7',
    staffId: '3', // Lily (Le)
    date: '2024-08-20',
    startTime: '22:00',
    endTime: '02:00',
    totalHours: 4,
    hourlyRate: 16.00,
    totalAmount: 64.00,
    description: 'Management tasks and next day preparation supervision',
    approvedBy: '1', // Jay
    approvedAt: '2024-08-21T09:00:00Z',
    status: 'approved',
    createdAt: '2024-08-21T06:00:00Z',
    updatedAt: '2024-08-21T09:00:00Z'
  },
  {
    id: '8',
    staffId: '4', // Simon
    date: '2024-08-19',
    startTime: '19:00',
    endTime: '23:00',
    totalHours: 4,
    hourlyRate: 12.00,
    totalAmount: 48.00,
    description: 'Weekend beverage station coverage and equipment cleaning',
    approvedBy: '3', // Le
    approvedAt: '2024-08-20T10:00:00Z',
    status: 'approved',
    createdAt: '2024-08-20T07:00:00Z',
    updatedAt: '2024-08-20T10:00:00Z'
  },
  {
    id: '9',
    staffId: '5', // Ko Sai
    date: '2024-08-18',
    startTime: '20:00',
    endTime: '00:00',
    totalHours: 4,
    hourlyRate: 10.00,
    totalAmount: 40.00,
    description: 'Kitchen deep cleaning after dinner service',
    status: 'pending',
    createdAt: '2024-08-19T06:00:00Z',
    updatedAt: '2024-08-19T06:00:00Z'
  },
  {
    id: '10',
    staffId: '6', // Thua
    date: '2024-08-17',
    startTime: '18:00',
    endTime: '22:00',
    totalHours: 4,
    hourlyRate: 11.00,
    totalAmount: 44.00,
    description: 'Weekend prep work for Monday specials',
    approvedBy: '2', // Niko
    approvedAt: '2024-08-18T08:00:00Z',
    status: 'approved',
    createdAt: '2024-08-18T06:00:00Z',
    updatedAt: '2024-08-18T08:00:00Z'
  },
  {
    id: '11',
    staffId: '8', // Ros
    date: '2024-08-15',
    startTime: '17:00',
    endTime: '21:00',
    totalHours: 4,
    hourlyRate: 9.50,
    totalAmount: 38.00,
    description: 'Front desk coverage during staff meeting',
    status: 'pending',
    createdAt: '2024-08-16T08:00:00Z',
    updatedAt: '2024-08-16T08:00:00Z'
  },
  {
    id: '12',
    staffId: '7', // Sherry
    date: '2024-08-14',
    startTime: '19:30',
    endTime: '23:30',
    totalHours: 4,
    hourlyRate: 10.50,
    totalAmount: 42.00,
    description: 'Weekend dinner service extension',
    approvedBy: '3', // Le
    approvedAt: '2024-08-15T10:00:00Z',
    status: 'approved',
    createdAt: '2024-08-15T07:30:00Z',
    updatedAt: '2024-08-15T10:00:00Z'
  }
];

// Enhanced Salary Advances - Focus on Bahar and various statuses
export let salaryAdvances: SalaryAdvance[] = [
  // Bahar's salary advances - Different statuses as requested
  {
    id: '1',
    advanceNumber: 'ADV-001',
    staffId: '10', // Bahar
    requestedAmount: 1200.00,
    reason: 'Children school fees payment for new semester - urgent deadline this week',
    requestDate: '2024-08-10',
    status: 'approved',
    approvedBy: '1', // Jay
    approvedAt: '2024-08-10T14:00:00Z',
    repaymentMethod: 'salary-deduction',
    monthlyDeduction: 200.00,
    remainingBalance: 800.00, // 2 months already deducted
    repaymentHistory: [
      {
        id: '1',
        advanceId: '1',
        amount: 200.00,
        date: '2024-08-31',
        method: 'salary-deduction',
        processedBy: '1',
        notes: 'First month deduction',
        createdAt: '2024-08-31T09:00:00Z'
      },
      {
        id: '2',
        advanceId: '1',
        amount: 200.00,
        date: '2024-09-30',
        method: 'salary-deduction',
        processedBy: '1',
        notes: 'Second month deduction',
        createdAt: '2024-09-30T09:00:00Z'
      }
    ],
    notes: 'Approved due to education expenses - important for staff family. 6-month repayment plan.',
    createdAt: '2024-08-10T10:00:00Z',
    updatedAt: '2024-09-30T09:00:00Z'
  },
  {
    id: '2',
    advanceNumber: 'ADV-002',
    staffId: '10', // Bahar
    requestedAmount: 800.00,
    reason: 'Motorcycle down payment - need reliable transportation for work attendance',
    requestDate: '2024-07-15',
    status: 'approved',
    approvedBy: '2', // Niko
    approvedAt: '2024-07-15T16:00:00Z',
    repaymentMethod: 'salary-deduction',
    monthlyDeduction: 200.00,
    remainingBalance: 0.00, // Fully repaid
    repaymentHistory: [
      {
        id: '3',
        advanceId: '2',
        amount: 200.00,
        date: '2024-07-31',
        method: 'salary-deduction',
        processedBy: '2',
        notes: 'First month deduction',
        createdAt: '2024-07-31T09:00:00Z'
      },
      {
        id: '4',
        advanceId: '2',
        amount: 200.00,
        date: '2024-08-31',
        method: 'salary-deduction',
        processedBy: '2',
        notes: 'Second month deduction',
        createdAt: '2024-08-31T09:00:00Z'
      },
      {
        id: '5',
        advanceId: '2',
        amount: 200.00,
        date: '2024-09-30',
        method: 'salary-deduction',
        processedBy: '2',
        notes: 'Third month deduction',
        createdAt: '2024-09-30T09:00:00Z'
      },
      {
        id: '6',
        advanceId: '2',
        amount: 200.00,
        date: '2024-10-31',
        method: 'salary-deduction',
        processedBy: '2',
        notes: 'Final payment - fully settled',
        createdAt: '2024-10-31T09:00:00Z'
      }
    ],
    notes: 'Transportation essential for work - fully repaid ahead of schedule.',
    createdAt: '2024-07-15T12:00:00Z',
    updatedAt: '2024-10-31T09:00:00Z'
  },
  {
    id: '3',
    advanceNumber: 'ADV-003',
    staffId: '10', // Bahar
    requestedAmount: 600.00,
    reason: 'Medical emergency - wife needs dental treatment and cannot wait for insurance approval',
    requestDate: '2024-08-22',
    status: 'pending',
    repaymentMethod: 'salary-deduction',
    monthlyDeduction: 150.00,
    remainingBalance: 600.00,
    repaymentHistory: [],
    notes: 'Pending approval - health emergency requires urgent attention.',
    createdAt: '2024-08-22T09:00:00Z',
    updatedAt: '2024-08-22T09:00:00Z'
  },
  {
    id: '4',
    advanceNumber: 'ADV-004',
    staffId: '10', // Bahar
    requestedAmount: 400.00,
    reason: 'House rent deposit for moving to closer accommodation to reduce travel time',
    requestDate: '2024-08-20',
    status: 'approved',
    approvedBy: '3', // Le
    approvedAt: '2024-08-21T11:00:00Z',
    repaymentMethod: 'salary-deduction',
    monthlyDeduction: 100.00,
    remainingBalance: 400.00,
    repaymentHistory: [],
    notes: 'Approved to help with housing - starts deduction next month.',
    createdAt: '2024-08-20T08:00:00Z',
    updatedAt: '2024-08-21T11:00:00Z'
  },
  
  // Other staff advances for context
  {
    id: '5',
    advanceNumber: 'ADV-005',
    staffId: '5', // Ko Sai
    requestedAmount: 800.00,
    reason: 'Family medical emergency - need to pay for mother\'s hospital bills',
    requestDate: '2024-08-10',
    status: 'approved',
    approvedBy: '1', // Jay
    approvedAt: '2024-08-10T14:00:00Z',
    repaymentMethod: 'salary-deduction',
    monthlyDeduction: 200.00,
    remainingBalance: 600.00,
    repaymentHistory: [
      {
        id: '7',
        advanceId: '5',
        amount: 200.00,
        date: '2024-08-31',
        method: 'salary-deduction',
        processedBy: '1',
        notes: 'First month deduction',
        createdAt: '2024-08-31T09:00:00Z'
      }
    ],
    notes: 'Approved due to medical emergency. 4-month repayment plan.',
    createdAt: '2024-08-10T10:00:00Z',
    updatedAt: '2024-08-31T09:00:00Z'
  },
  {
    id: '6',
    advanceNumber: 'ADV-006',
    staffId: '8', // Ros
    requestedAmount: 500.00,
    reason: 'Motorcycle repair - need transportation for work',
    requestDate: '2024-08-15',
    status: 'approved',
    approvedBy: '3', // Le
    approvedAt: '2024-08-15T16:00:00Z',
    repaymentMethod: 'salary-deduction',
    monthlyDeduction: 125.00,
    remainingBalance: 500.00,
    repaymentHistory: [],
    notes: 'Transportation essential for work attendance.',
    createdAt: '2024-08-15T12:00:00Z',
    updatedAt: '2024-08-15T16:00:00Z'
  },
  {
    id: '7',
    advanceNumber: 'ADV-007',
    staffId: '6', // Thua
    requestedAmount: 300.00,
    reason: 'Rent deposit for new apartment',
    requestDate: '2024-08-18',
    status: 'pending',
    repaymentMethod: 'salary-deduction',
    monthlyDeduction: 100.00,
    remainingBalance: 300.00,
    repaymentHistory: [],
    notes: 'Pending approval from authorized personnel.',
    createdAt: '2024-08-18T09:00:00Z',
    updatedAt: '2024-08-18T09:00:00Z'
  },
  {
    id: '8',
    advanceNumber: 'ADV-008',
    staffId: '7', // Sherry
    requestedAmount: 400.00,
    reason: 'Personal laptop for online courses to improve skills',
    requestDate: '2024-08-22',
    status: 'rejected',
    approvedBy: '1', // Jay
    approvedAt: '2024-08-22T15:00:00Z',
    rejectionReason: 'Not considered essential expense. Please save monthly for personal development purchases.',
    repaymentMethod: 'salary-deduction',
    monthlyDeduction: 100.00,
    remainingBalance: 400.00,
    repaymentHistory: [],
    createdAt: '2024-08-22T10:00:00Z',
    updatedAt: '2024-08-22T15:00:00Z'
  }
];

// Helper functions for salary management
export const addOvertimeRecord = (newRecord: Omit<OvertimeRecord, 'id'>): OvertimeRecord => {
  const id = (Math.max(...overtimeRecords.map(r => parseInt(r.id)), 0) + 1).toString();
  const record: OvertimeRecord = { ...newRecord, id };
  overtimeRecords.push(record);
  return record;
};

export const updateOvertimeRecord = (id: string, updates: Partial<OvertimeRecord>): OvertimeRecord | null => {
  const index = overtimeRecords.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  overtimeRecords[index] = { ...overtimeRecords[index], ...updates, updatedAt: new Date().toISOString() };
  return overtimeRecords[index];
};

export const deleteOvertimeRecord = (id: string): boolean => {
  const index = overtimeRecords.findIndex(r => r.id === id);
  if (index === -1) return false;
  
  overtimeRecords.splice(index, 1);
  return true;
};

export const addSalaryAdvance = (newAdvance: Omit<SalaryAdvance, 'id' | 'advanceNumber'>): SalaryAdvance => {
  const id = (Math.max(...salaryAdvances.map(a => parseInt(a.id)), 0) + 1).toString();
  const advanceNumber = `ADV-${id.padStart(3, '0')}`;
  const advance: SalaryAdvance = { ...newAdvance, id, advanceNumber };
  salaryAdvances.push(advance);
  return advance;
};

export const updateSalaryAdvance = (id: string, updates: Partial<SalaryAdvance>): SalaryAdvance | null => {
  const index = salaryAdvances.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  salaryAdvances[index] = { ...salaryAdvances[index], ...updates, updatedAt: new Date().toISOString() };
  return salaryAdvances[index];
};

export const deleteSalaryAdvance = (id: string): boolean => {
  const index = salaryAdvances.findIndex(a => a.id === id);
  if (index === -1) return false;
  
  salaryAdvances.splice(index, 1);
  return true;
};

export const getOvertimeRecordsByStaff = (staffId: string): OvertimeRecord[] => {
  return overtimeRecords.filter(record => record.staffId === staffId);
};

export const getSalaryAdvancesByStaff = (staffId: string): SalaryAdvance[] => {
  return salaryAdvances.filter(advance => advance.staffId === staffId);
};

export const getOvertimeRecordsByDateRange = (staffId: string, startDate: string, endDate: string): OvertimeRecord[] => {
  return overtimeRecords.filter(record => 
    record.staffId === staffId &&
    record.date >= startDate && 
    record.date <= endDate
  );
};

export const getSalaryAdvancesByDateRange = (staffId: string, startDate: string, endDate: string): SalaryAdvance[] => {
  return salaryAdvances.filter(advance => 
    advance.staffId === staffId &&
    advance.requestDate >= startDate && 
    advance.requestDate <= endDate
  );
};

export const calculatePeriodSummary = (staffId: string, startDate: string, endDate: string) => {
  const otRecords = getOvertimeRecordsByDateRange(staffId, startDate, endDate);
  const advances = getSalaryAdvancesByDateRange(staffId, startDate, endDate);
  
  const totalOTHours = otRecords
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.totalHours, 0);
    
  const totalOTAmount = otRecords
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.totalAmount, 0);
    
  const totalAdvancesTaken = advances
    .filter(a => a.status === 'approved')
    .reduce((sum, a) => sum + a.requestedAmount, 0);
    
  const pendingOTAmount = otRecords
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.totalAmount, 0);
    
  const pendingAdvances = advances
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + a.requestedAmount, 0);

  return {
    totalOTHours,
    totalOTAmount,
    totalAdvancesTaken,
    pendingOTAmount,
    pendingAdvances,
    netEarnings: totalOTAmount - totalAdvancesTaken
  };
};

// Check if user can approve salary advances
export const canApproveSalaryAdvance = (userId: string): boolean => {
  // Jay (owner), Niko (manager), Le (area manager) can approve
  const approvers = ['1', '2', '3']; // Jay, Niko, Le
  return approvers.includes(userId);
};

// Get pending items for approval
export const getPendingApprovals = () => {
  const pendingOT = overtimeRecords.filter(r => r.status === 'pending');
  const pendingAdvances = salaryAdvances.filter(a => a.status === 'pending');
  
  return {
    pendingOT,
    pendingAdvances,
    totalPending: pendingOT.length + pendingAdvances.length
  };
};

// Status color helpers
export const getOTStatusColor = (status: string): string => {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'destructive';
    default: return 'secondary';
  }
};

export const getAdvanceStatusColor = (status: string): string => {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'destructive';
    default: return 'secondary';
  }
};

// Calculate hourly rate based on staff level (this would typically come from HR data)
export const getStaffHourlyRate = (staffId: string): number => {
  // Basic hourly rates - in real app this would come from staff database
  const rates: Record<string, number> = {
    '1': 20.00, // Jay (Owner)
    '2': 18.00, // Niko (Manager) 
    '3': 16.00, // Le (Area Manager)
    '4': 12.00, // Simon (Head of Kitchen)
    '5': 10.00, // Ko Sai
    '6': 11.00, // Thua
    '7': 10.50, // Sherry
    '8': 9.50,  // Ros
    '9': 9.50,  // Islam
    '10': 11.50 // Bahar
  };
  return rates[staffId] || 9.00; // Default minimum rate
};

export const formatCurrency = (amount: number): string => {
  return `RM${amount.toFixed(2)}`;
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (timeString: string): string => {
  return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const calculateHoursDifference = (startTime: string, endTime: string): number => {
  const start = new Date(`2024-01-01T${startTime}`);
  let end = new Date(`2024-01-01T${endTime}`);
  
  // Handle overnight shifts
  if (end < start) {
    end = new Date(`2024-01-02T${endTime}`);
  }
  
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60); // Convert to hours
};