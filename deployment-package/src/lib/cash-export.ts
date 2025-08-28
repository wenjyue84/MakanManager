// Cash Management Export Utilities
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CashReconciliation, formatCurrency, formatDateTime } from './cash-data';

// Excel Export Functions
export const exportCashReconciliationsToExcel = (
  reconciliations: CashReconciliation[],
  filename?: string
) => {
  try {
    // Prepare data for Excel
    const excelData = reconciliations.map((record) => ({
      'Record Number': record.reconciliationNumber,
      'Date': record.date,
      'Shift': record.shift.charAt(0).toUpperCase() + record.shift.slice(1),
      'Cashier': record.cashierName,
      'POS Sales Total': record.posSalesTotal,
      'Opening Float': record.openingFloat,
      'Expected Cash': record.expectedCash,
      'Actual Cash Count': record.actualCashCount,
      'Difference': record.difference,
      'Status': record.status.charAt(0).toUpperCase() + record.status.slice(1),
      'Discrepancy Reason': record.discrepancyReason || 'N/A',
      'Discrepancy Notes': record.discrepancyNotes || 'N/A',
      'Cashier Signed At': record.cashierSignedAt ? formatDateTime(record.cashierSignedAt) : 'Not Signed',
      'Manager Approval': record.managerApproval === true ? 'Approved' : 
                         record.managerApproval === false ? 'Rejected' : 'Pending',
      'Approved By': record.approvedBy || 'N/A',
      'Approved At': record.approvedAt ? formatDateTime(record.approvedAt) : 'N/A',
      'Manager Notes': record.managerNotes || 'N/A',
      'Created At': formatDateTime(record.createdAt),
      'Updated At': formatDateTime(record.updatedAt),
      'Finalized At': record.finalizedAt ? formatDateTime(record.finalizedAt) : 'Not Finalized'
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Record Number
      { wch: 12 }, // Date
      { wch: 10 }, // Shift
      { wch: 15 }, // Cashier
      { wch: 15 }, // POS Sales Total
      { wch: 15 }, // Opening Float
      { wch: 15 }, // Expected Cash
      { wch: 18 }, // Actual Cash Count
      { wch: 12 }, // Difference
      { wch: 10 }, // Status
      { wch: 20 }, // Discrepancy Reason
      { wch: 30 }, // Discrepancy Notes
      { wch: 20 }, // Cashier Signed At
      { wch: 18 }, // Manager Approval
      { wch: 15 }, // Approved By
      { wch: 20 }, // Approved At
      { wch: 25 }, // Manager Notes
      { wch: 20 }, // Created At
      { wch: 20 }, // Updated At
      { wch: 20 }  // Finalized At
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Cash Reconciliations');

    // Create summary worksheet
    const summaryData = createSummaryData(reconciliations);
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Generate filename
    const exportFilename = filename || `cash-reconciliations-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, exportFilename);
    
    return { success: true, filename: exportFilename };
  } catch (error) {
    console.error('Excel export error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// PDF Export Functions
export const exportCashReconciliationsToPDF = (
  reconciliations: CashReconciliation[],
  filename?: string
) => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    // Add title
    doc.setFontSize(20);
    doc.text('Cash Management - Reconciliation Report', 20, 20);
    
    // Add export date
    doc.setFontSize(10);
    doc.text(`Generated on: ${formatDateTime(new Date().toISOString())}`, 20, 30);
    
    // Prepare table data
    const tableData = reconciliations.map(record => [
      record.reconciliationNumber,
      record.date,
      record.shift.charAt(0).toUpperCase() + record.shift.slice(1),
      record.cashierName,
      formatCurrency(record.posSalesTotal),
      formatCurrency(record.expectedCash),
      formatCurrency(record.actualCashCount),
      formatCurrency(record.difference),
      record.status.charAt(0).toUpperCase() + record.status.slice(1),
      record.managerApproval === true ? 'Approved' : 
      record.managerApproval === false ? 'Rejected' : 'Pending'
    ]);

    // Create the main table
    autoTable(doc, {
      head: [[
        'Record #',
        'Date',
        'Shift', 
        'Cashier',
        'POS Sales',
        'Expected',
        'Actual',
        'Difference',
        'Status',
        'Approval'
      ]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        4: { halign: 'right' }, // POS Sales
        5: { halign: 'right' }, // Expected
        6: { halign: 'right' }, // Actual
        7: { halign: 'right' }, // Difference
      },
      didDrawPage: (data) => {
        // Add page numbers
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Add summary section on new page if there are records
    if (reconciliations.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Summary Statistics', 20, 20);
      
      const summaryStats = calculateSummaryStats(reconciliations);
      const summaryTableData = Object.entries(summaryStats).map(([key, value]) => [
        key,
        typeof value === 'number' && key.includes('Amount') ? formatCurrency(value) : value.toString()
      ]);

      autoTable(doc, {
        body: summaryTableData,
        startY: 30,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { halign: 'right', cellWidth: 50 }
        }
      });
    }

    // Generate filename and save
    const exportFilename = filename || `cash-reconciliations-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(exportFilename);
    
    return { success: true, filename: exportFilename };
  } catch (error) {
    console.error('PDF export error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Helper function to create summary data for Excel
const createSummaryData = (reconciliations: CashReconciliation[]) => {
  const stats = calculateSummaryStats(reconciliations);
  
  return Object.entries(stats).map(([key, value]) => ({
    'Metric': key,
    'Value': typeof value === 'number' && key.includes('Amount') ? formatCurrency(value) : value
  }));
};

// Helper function to calculate summary statistics
const calculateSummaryStats = (reconciliations: CashReconciliation[]) => {
  const totalRecords = reconciliations.length;
  const totalSales = reconciliations.reduce((sum, record) => sum + record.posSalesTotal, 0);
  const totalExpected = reconciliations.reduce((sum, record) => sum + record.expectedCash, 0);
  const totalActual = reconciliations.reduce((sum, record) => sum + record.actualCashCount, 0);
  const totalDifference = reconciliations.reduce((sum, record) => sum + record.difference, 0);
  
  const tallyCount = reconciliations.filter(r => r.status === 'tally').length;
  const shortageCount = reconciliations.filter(r => r.status === 'shortage').length;
  const overageCount = reconciliations.filter(r => r.status === 'overage').length;
  
  const approvedCount = reconciliations.filter(r => r.managerApproval === true).length;
  const rejectedCount = reconciliations.filter(r => r.managerApproval === false).length;
  const pendingCount = reconciliations.filter(r => r.managerApproval === undefined).length;

  const averageDifference = totalRecords > 0 ? totalDifference / totalRecords : 0;
  const accuracyRate = totalRecords > 0 ? (tallyCount / totalRecords) * 100 : 0;

  return {
    'Total Records': totalRecords,
    'Total Sales Amount': totalSales,
    'Total Expected Amount': totalExpected,
    'Total Actual Amount': totalActual,
    'Total Difference Amount': totalDifference,
    'Average Difference': averageDifference,
    'Accuracy Rate (%)': Math.round(accuracyRate * 100) / 100,
    'Perfect Matches (Tally)': tallyCount,
    'Shortages': shortageCount,
    'Overages': overageCount,
    'Approved Records': approvedCount,
    'Rejected Records': rejectedCount,
    'Pending Approval': pendingCount
  };
};

// Export filtered data
export const exportFilteredCashData = (
  reconciliations: CashReconciliation[],
  filters: {
    dateFrom?: string;
    dateTo?: string;
    cashier?: string;
    shift?: string;
    status?: string;
  },
  exportType: 'excel' | 'pdf',
  filename?: string
) => {
  // Apply filters
  let filteredData = [...reconciliations];
  
  if (filters.dateFrom) {
    filteredData = filteredData.filter(r => r.date >= filters.dateFrom!);
  }
  
  if (filters.dateTo) {
    filteredData = filteredData.filter(r => r.date <= filters.dateTo!);
  }
  
  if (filters.cashier) {
    filteredData = filteredData.filter(r => r.cashierId === filters.cashier);
  }
  
  if (filters.shift) {
    filteredData = filteredData.filter(r => r.shift === filters.shift);
  }
  
  if (filters.status) {
    filteredData = filteredData.filter(r => r.status === filters.status);
  }

  // Sort by date and reconciliation number
  filteredData.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date); // Most recent first
    return b.reconciliationNumber.localeCompare(a.reconciliationNumber);
  });

  // Export based on type
  if (exportType === 'excel') {
    return exportCashReconciliationsToExcel(filteredData, filename);
  } else {
    return exportCashReconciliationsToPDF(filteredData, filename);
  }
};

// Export single reconciliation record (detailed view)
export const exportSingleReconciliation = (
  record: CashReconciliation,
  exportType: 'excel' | 'pdf'
) => {
  const filename = `reconciliation-${record.reconciliationNumber}-${record.date}`;
  
  if (exportType === 'excel') {
    return exportCashReconciliationsToExcel([record], `${filename}.xlsx`);
  } else {
    return exportCashReconciliationsToPDF([record], `${filename}.pdf`);
  }
};