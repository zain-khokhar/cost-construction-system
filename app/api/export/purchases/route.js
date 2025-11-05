import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { getUserFromRequest } from '@/lib/auth';
import { requirePermission } from '@/lib/roleMiddleware';
import Purchase from '@/models/Purchase';
import { exportToPDF } from '@/lib/exportService';
import ExcelJS from 'exceljs';

async function handler(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: { message: 'Unauthorized' } }, { status: 401 });
  }

  requirePermission(user, 'EXPENSE_VIEW');

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'pdf';
  const projectId = searchParams.get('projectId');
  const phaseId = searchParams.get('phaseId');
  const categoryId = searchParams.get('categoryId');
  const itemId = searchParams.get('itemId');
  const vendorId = searchParams.get('vendorId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const exportAll = searchParams.get('exportAll') === 'true';
  const selectedIdsParam = searchParams.get('selectedIds');
  const selectedIds = selectedIdsParam ? selectedIdsParam.split(',') : [];

  try {
    // Build filter
    const filter = { companyId: user.companyId };
    
    // If specific IDs are selected, only export those
    if (selectedIds.length > 0 && !exportAll) {
      filter._id = { $in: selectedIds };
    } else {
      // Apply other filters only if not exporting specific IDs
      if (projectId) filter.projectId = projectId;
      if (phaseId) filter.phaseId = phaseId;
      if (categoryId) filter.categoryId = categoryId;
      if (itemId) filter.itemId = itemId;
      if (vendorId) filter.vendorId = vendorId;
      
      if (startDate || endDate) {
        filter.purchaseDate = {};
        if (startDate) filter.purchaseDate.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.purchaseDate.$lte = end;
        }
      }
    }

    // Fetch all purchases matching filters (no pagination for export)
    const purchases = await Purchase.find(filter)
      .populate('itemId', 'name unit')
      .populate('categoryId', 'name')
      .populate('phaseId', 'name')
      .populate('projectId', 'name totalBudget')
      .populate('vendorId', 'name')
      .populate('createdBy', 'name')
      .sort({ purchaseDate: -1 });

    if (purchases.length === 0) {
      return NextResponse.json({ ok: false, error: { message: 'No data available to export' } }, { status: 404 });
    }

    if (format === 'pdf') {
      return await exportReportsToPDF(purchases);
    } else if (format === 'csv') {
      return await exportReportsToCSV(purchases);
    } else {
      return NextResponse.json({ ok: false, error: { message: 'Invalid format' } }, { status: 400 });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ ok: false, error: { message: error.message } }, { status: 500 });
  }
}

async function exportReportsToPDF(purchases) {
  const columns = [
    { header: 'Date', dataKey: 'date' },
    { header: 'Project', dataKey: 'project' },
    { header: 'Phase', dataKey: 'phase' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Item', dataKey: 'item' },
    { header: 'Quantity', dataKey: 'quantity' },
    { header: 'Total Cost', dataKey: 'totalCost' },
    { header: 'Vendor', dataKey: 'vendor' },
  ];

  const data = purchases.map(p => ({
    date: new Date(p.purchaseDate).toLocaleDateString(),
    project: p.projectId?.name || 'N/A',
    phase: p.phaseId?.name || 'N/A',
    category: p.categoryId?.name || 'N/A',
    item: p.itemId?.name || 'N/A',
    quantity: p.quantity.toString(),
    totalCost: `$${p.totalCost.toLocaleString()}`,
    vendor: p.vendorId?.name || 'N/A',
  }));

  const totalSpending = purchases.reduce((sum, p) => sum + p.totalCost, 0);

  const doc = exportToPDF(
    data,
    columns,
    'Purchases Report',
    `Total Spending: $${totalSpending.toLocaleString()} | Total Records: ${purchases.length}`
  );

  // Convert jsPDF document to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="purchases-report-${Date.now()}.pdf"`,
    },
  });
}

async function exportReportsToCSV(purchases) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Purchases Report');

  // Add headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Project', key: 'project', width: 20 },
    { header: 'Phase', key: 'phase', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Item', key: 'item', width: 25 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Unit Price', key: 'unitPrice', width: 15 },
    { header: 'Total Cost', key: 'totalCost', width: 15 },
    { header: 'Vendor', key: 'vendor', width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add data
  purchases.forEach(p => {
    worksheet.addRow({
      date: new Date(p.purchaseDate).toLocaleDateString(),
      project: p.projectId?.name || 'N/A',
      phase: p.phaseId?.name || 'N/A',
      category: p.categoryId?.name || 'N/A',
      item: p.itemId?.name || 'N/A',
      quantity: p.quantity,
      unitPrice: p.pricePerUnit,
      totalCost: p.totalCost,
      vendor: p.vendorId?.name || 'N/A',
    });
  });

  // Add total row
  const totalRow = worksheet.addRow({
    date: '',
    project: '',
    phase: '',
    category: '',
    item: '',
    quantity: '',
    unitPrice: 'TOTAL:',
    totalCost: purchases.reduce((sum, p) => sum + p.totalCost, 0),
    vendor: '',
  });
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE7E6E6' },
  };

  // Generate CSV buffer
  const buffer = await workbook.csv.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="purchases-report-${Date.now()}.csv"`,
    },
  });
}

export const GET = apiHandler(handler);
