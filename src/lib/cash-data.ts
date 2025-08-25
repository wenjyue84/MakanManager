// Cash Reconciliation Data Structure
export interface CashDenomination {
  value: number;
  count: number;
  total: number;
}

export interface CashBreakdown {
  notes: CashDenomination[];
  coins: CashDenomination[];
  totalNotes: number;
  totalCoins: number;
  grandTotal: number;
}

export interface CashReconciliation {
  id: string;
  reconciliationNumber: string; // CR-001, CR-002, etc.
  date: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  cashierId: string;
  cashierName: string;
  
  // POS and Float amounts
  posSalesTotal: number;
  openingFloat: number;
  expectedCash: number; // posSalesTotal + openingFloat
  
  // Actual cash count
  actualCashCount: number;
  cashBreakdown?: CashBreakdown;
  
  // Calculated difference
  difference: number; // actualCashCount - expectedCash
  status: 'tally' | 'shortage' | 'overage';
  
  // Discrepancy handling
  discrepancyReason?: 'counting-error' | 'transaction-error' | 'theft' | 'pos-malfunction' | 'customer-dispute' | 'promotional-discount' | 'other';
  discrepancyNotes?: string;
  
  // Approval and signatures
  cashierSignature?: string; // base64 signature data
  cashierSignedAt?: string;
  managerApproval?: boolean;
  approvedBy?: string; // manager staff id
  approvedAt?: string;
  managerNotes?: string;
  
  // Photo evidence
  photoUrl?: string;
  
  // Audit trail
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}

export interface ShiftSummary {
  date: string;
  shift: string;
  totalSales: number;
  totalReconciliations: number;
  totalDiscrepancies: number;
  netDiscrepancy: number;
}

// Malaysian Ringgit denominations
export const MYR_NOTES = [
  { value: 100, label: 'RM100', color: 'purple' },
  { value: 50, label: 'RM50', color: 'blue' },
  { value: 20, label: 'RM20', color: 'orange' },
  { value: 10, label: 'RM10', color: 'red' },
  { value: 5, label: 'RM5', color: 'green' },
  { value: 1, label: 'RM1', color: 'blue' }
];

export const MYR_COINS = [
  { value: 0.50, label: '50 sen', color: 'silver' },
  { value: 0.20, label: '20 sen', color: 'bronze' },
  { value: 0.10, label: '10 sen', color: 'silver' },
  { value: 0.05, label: '5 sen', color: 'bronze' }
];

// Sample cash reconciliation data
export let cashReconciliations: CashReconciliation[] = [
  {
    id: '1',
    reconciliationNumber: 'CR-001',
    date: '2024-08-23',
    shift: 'morning',
    cashierId: '7', // Sherry
    cashierName: 'Sherry',
    posSalesTotal: 485.60,
    openingFloat: 200.00,
    expectedCash: 685.60,
    actualCashCount: 685.60,
    cashBreakdown: {
      notes: [
        { value: 50, count: 8, total: 400.00 },
        { value: 20, count: 6, total: 120.00 },
        { value: 10, count: 12, total: 120.00 },
        { value: 5, count: 5, total: 25.00 },
        { value: 1, count: 15, total: 15.00 }
      ],
      coins: [
        { value: 0.50, count: 11, total: 5.50 },
        { value: 0.10, count: 1, total: 0.10 }
      ],
      totalNotes: 680.00,
      totalCoins: 5.60,
      grandTotal: 685.60
    },
    difference: 0.00,
    status: 'tally',
    cashierSignature: 'data:image/svg+xml;base64,signature_data_here',
    cashierSignedAt: '2024-08-23T14:30:00Z',
    managerApproval: true,
    approvedBy: '3', // Lily
    approvedAt: '2024-08-23T14:35:00Z',
    createdAt: '2024-08-23T14:25:00Z',
    updatedAt: '2024-08-23T14:35:00Z',
    finalizedAt: '2024-08-23T14:35:00Z'
  },
  {
    id: '2',
    reconciliationNumber: 'CR-002',
    date: '2024-08-23',
    shift: 'afternoon',
    cashierId: '8', // Ros
    cashierName: 'Ros',
    posSalesTotal: 672.30,
    openingFloat: 200.00,
    expectedCash: 872.30,
    actualCashCount: 865.80,
    cashBreakdown: {
      notes: [
        { value: 50, count: 10, total: 500.00 },
        { value: 20, count: 8, total: 160.00 },
        { value: 10, count: 15, total: 150.00 },
        { value: 5, count: 10, total: 50.00 },
        { value: 1, count: 5, total: 5.00 }
      ],
      coins: [
        { value: 0.50, count: 1, total: 0.50 },
        { value: 0.20, count: 1, total: 0.20 },
        { value: 0.10, count: 1, total: 0.10 }
      ],
      totalNotes: 865.00,
      totalCoins: 0.80,
      grandTotal: 865.80
    },
    difference: -6.50,
    status: 'shortage',
    discrepancyReason: 'counting-error',
    discrepancyNotes: 'Possible miscounting during busy afternoon rush. Will be more careful.',
    cashierSignature: 'data:image/svg+xml;base64,signature_data_here',
    cashierSignedAt: '2024-08-23T18:15:00Z',
    managerApproval: true,
    approvedBy: '2', // Niko
    approvedAt: '2024-08-23T18:30:00Z',
    managerNotes: 'Minor shortage acceptable. Reminded staff about careful counting procedures.',
    createdAt: '2024-08-23T18:10:00Z',
    updatedAt: '2024-08-23T18:30:00Z',
    finalizedAt: '2024-08-23T18:30:00Z'
  },
  {
    id: '3',
    reconciliationNumber: 'CR-003',
    date: '2024-08-22',
    shift: 'evening',
    cashierId: '7', // Sherry
    cashierName: 'Sherry',
    posSalesTotal: 543.80,
    openingFloat: 200.00,
    expectedCash: 743.80,
    actualCashCount: 748.30,
    cashBreakdown: {
      notes: [
        { value: 50, count: 9, total: 450.00 },
        { value: 20, count: 7, total: 140.00 },
        { value: 10, count: 12, total: 120.00 },
        { value: 5, count: 6, total: 30.00 },
        { value: 1, count: 8, total: 8.00 }
      ],
      coins: [
        { value: 0.20, count: 1, total: 0.20 },
        { value: 0.10, count: 1, total: 0.10 }
      ],
      totalNotes: 748.00,
      totalCoins: 0.30,
      grandTotal: 748.30
    },
    difference: 4.50,
    status: 'overage',
    discrepancyReason: 'customer-dispute',
    discrepancyNotes: 'Customer paid extra RM5 tip but walked away before change could be given.',
    cashierSignature: 'data:image/svg+xml;base64,signature_data_here',
    cashierSignedAt: '2024-08-22T22:10:00Z',
    managerApproval: true,
    approvedBy: '3', // Lily
    approvedAt: '2024-08-22T22:20:00Z',
    managerNotes: 'Overage from customer tip - acceptable.',
    createdAt: '2024-08-22T22:05:00Z',
    updatedAt: '2024-08-22T22:20:00Z',
    finalizedAt: '2024-08-22T22:20:00Z'
  },
  {
    id: '4',
    reconciliationNumber: 'CR-004',
    date: '2024-08-22',
    shift: 'morning',
    cashierId: '8', // Ros
    cashierName: 'Ros',
    posSalesTotal: 421.75,
    openingFloat: 200.00,
    expectedCash: 621.75,
    actualCashCount: 615.25,
    difference: -6.50,
    status: 'shortage',
    discrepancyReason: 'other',
    discrepancyNotes: 'Possible error in POS system during power outage. Need to investigate.',
    cashierSignature: 'data:image/svg+xml;base64,signature_data_here',
    cashierSignedAt: '2024-08-22T14:20:00Z',
    managerApproval: false,
    createdAt: '2024-08-22T14:15:00Z',
    updatedAt: '2024-08-22T14:20:00Z'
  },
  {
    id: '5',
    reconciliationNumber: 'CR-005',
    date: '2024-08-21',
    shift: 'afternoon',
    cashierId: '9', // Islam
    cashierName: 'Islam',
    posSalesTotal: 398.40,
    openingFloat: 200.00,
    expectedCash: 598.40,
    actualCashCount: 598.40,
    difference: 0.00,
    status: 'tally',
    cashierSignature: 'data:image/svg+xml;base64,signature_data_here',
    cashierSignedAt: '2024-08-21T18:25:00Z',
    managerApproval: true,
    approvedBy: '4', // Simon
    approvedAt: '2024-08-21T18:30:00Z',
    createdAt: '2024-08-21T18:20:00Z',
    updatedAt: '2024-08-21T18:30:00Z',
    finalizedAt: '2024-08-21T18:30:00Z'
  },
  {
    id: '6',
    reconciliationNumber: 'CR-006',
    date: '2024-08-23',
    shift: 'evening',
    cashierId: '9', // Islam
    cashierName: 'Islam',
    posSalesTotal: 0.00,
    openingFloat: 200.00,
    expectedCash: 200.00,
    actualCashCount: 0.00,
    difference: 0.00,
    status: 'tally',
    createdAt: '2024-08-23T22:00:00Z',
    updatedAt: '2024-08-23T22:00:00Z'
  }
];

// Helper functions for cash management
export const addCashReconciliation = (newReconciliation: Omit<CashReconciliation, 'id' | 'reconciliationNumber'>): CashReconciliation => {
  const id = (Math.max(...cashReconciliations.map(r => parseInt(r.id)), 0) + 1).toString();
  const reconciliationNumber = `CR-${id.padStart(3, '0')}`;
  const reconciliation: CashReconciliation = { ...newReconciliation, id, reconciliationNumber };
  cashReconciliations.push(reconciliation);
  return reconciliation;
};

export const updateCashReconciliation = (id: string, updates: Partial<CashReconciliation>): CashReconciliation | null => {
  const index = cashReconciliations.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  cashReconciliations[index] = { ...cashReconciliations[index], ...updates, updatedAt: new Date().toISOString() };
  return cashReconciliations[index];
};

export const deleteCashReconciliation = (id: string): boolean => {
  const index = cashReconciliations.findIndex(r => r.id === id);
  if (index === -1) return false;
  
  cashReconciliations.splice(index, 1);
  return true;
};

export const calculateCashBreakdown = (notes: CashDenomination[], coins: CashDenomination[]): CashBreakdown => {
  const totalNotes = notes.reduce((sum, note) => sum + note.total, 0);
  const totalCoins = coins.reduce((sum, coin) => sum + coin.total, 0);
  
  return {
    notes,
    coins,
    totalNotes,
    totalCoins,
    grandTotal: totalNotes + totalCoins
  };
};

export const calculateDifference = (actualCash: number, expectedCash: number): number => {
  return actualCash - expectedCash;
};

export const getReconciliationStatus = (difference: number): 'tally' | 'shortage' | 'overage' => {
  if (difference === 0) return 'tally';
  if (difference < 0) return 'shortage';
  return 'overage';
};

export const getReconciliationsByDate = (date: string): CashReconciliation[] => {
  return cashReconciliations.filter(r => r.date === date);
};

export const getReconciliationsByShift = (shift: string): CashReconciliation[] => {
  return cashReconciliations.filter(r => r.shift === shift);
};

export const getReconciliationsByCashier = (cashierId: string): CashReconciliation[] => {
  return cashReconciliations.filter(r => r.cashierId === cashierId);
};

export const getReconciliationsByDateRange = (startDate: string, endDate: string): CashReconciliation[] => {
  return cashReconciliations.filter(r => r.date >= startDate && r.date <= endDate);
};

// Status and discrepancy reason helpers
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'tally': return 'success';
    case 'shortage': return 'destructive';
    case 'overage': return 'warning';
    default: return 'secondary';
  }
};

export const getDiscrepancyReasons = () => [
  { value: 'counting-error', label: 'Counting Error' },
  { value: 'transaction-error', label: 'Transaction Error' },
  { value: 'theft', label: 'Theft/Missing Cash' },
  { value: 'pos-malfunction', label: 'POS System Malfunction' },
  { value: 'customer-dispute', label: 'Customer Dispute/Tip' },
  { value: 'promotional-discount', label: 'Promotional Discount' },
  { value: 'other', label: 'Other (specify in notes)' }
];

// Analytics and reporting functions
export const calculateDailyStats = (date: string) => {
  const dayReconciliations = getReconciliationsByDate(date);
  
  const totalSales = dayReconciliations.reduce((sum, r) => sum + r.posSalesTotal, 0);
  const totalDiscrepancies = dayReconciliations.filter(r => r.difference !== 0).length;
  const netDiscrepancy = dayReconciliations.reduce((sum, r) => sum + r.difference, 0);
  const averageDiscrepancy = totalDiscrepancies > 0 ? netDiscrepancy / totalDiscrepancies : 0;
  
  const statusBreakdown = dayReconciliations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalReconciliations: dayReconciliations.length,
    totalSales,
    totalDiscrepancies,
    netDiscrepancy,
    averageDiscrepancy,
    statusBreakdown
  };
};

export const calculateWeeklyTrends = () => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  return last7Days.map(date => ({
    date,
    ...calculateDailyStats(date)
  }));
};

export const getPendingApprovals = (): CashReconciliation[] => {
  return cashReconciliations.filter(r => 
    r.cashierSignature && !r.managerApproval && r.difference !== 0
  );
};

// Utility functions
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

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getShiftTimes = () => [
  { value: 'morning', label: 'Morning (6:00 AM - 2:00 PM)' },
  { value: 'afternoon', label: 'Afternoon (2:00 PM - 10:00 PM)' },
  { value: 'evening', label: 'Evening (10:00 PM - 2:00 AM)' },
  { value: 'night', label: 'Night (2:00 AM - 6:00 AM)' }
];

export const canApproveCash = (userId: string): boolean => {
  // Only managers and above can approve cash reconciliations
  const approvers = ['1', '2', '3', '4']; // Jay, Niko, Le, Simon
  return approvers.includes(userId);
};

export const initializeCashBreakdown = (): CashBreakdown => {
  const notes = MYR_NOTES.map(note => ({ value: note.value, count: 0, total: 0 }));
  const coins = MYR_COINS.map(coin => ({ value: coin.value, count: 0, total: 0 }));
  
  return {
    notes,
    coins,
    totalNotes: 0,
    totalCoins: 0,
    grandTotal: 0
  };
};