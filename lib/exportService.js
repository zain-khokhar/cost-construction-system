import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Purchase from '@/models/Purchase';
import Project from '@/models/Project';
import Phase from '@/models/Phase';
import Category from '@/models/Category';
import Item from '@/models/Item';
import Vendor from '@/models/Vendor';
import mongoose from 'mongoose';

/**
 * Export data to PDF with proper formatting
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions [{ header: 'Name', dataKey: 'name' }]
 * @param {String} title - Document title
 * @param {String} filename - Output filename
 */
export function exportToPDF(data, columns, title, filename = 'export.pdf') {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Add table using autoTable
  autoTable(doc, {
    startY: 35,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey] || 'N/A')),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [68, 114, 196], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  
  return doc;
}

/**
 * Export data to CSV
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions [{ header: 'Name', key: 'name' }]
 * @param {String} filename - Output filename
 */
export function exportToCSV(data, columns, filename = 'export.csv') {
  // Create header row
  const headers = columns.map(col => col.header).join(',');
  
  // Create data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key] || '';
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return headers + '\n' + rows.join('\n');
}

/**
 * Export purchases to Excel
 */
export async function exportPurchasesToExcel(filters, companyId) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Purchases');

  // Define columns
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Project', key: 'project', width: 20 },
    { header: 'Phase', key: 'phase', width: 15 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Item', key: 'item', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Unit Price', key: 'unitPrice', width: 12 },
    { header: 'Total Cost', key: 'totalCost', width: 12 },
    { header: 'Vendor', key: 'vendor', width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Fetch purchases
  const query = { companyId: new mongoose.Types.ObjectId(companyId), ...filters };
  const purchases = await Purchase.find(query)
    .populate('projectId', 'name')
    .populate('phaseId', 'name')
    .populate('categoryId', 'name')
    .populate('itemId', 'name')
    .populate('vendorId', 'name')
    .sort({ purchaseDate: -1 });

  // Add data rows
  purchases.forEach((purchase) => {
    worksheet.addRow({
      date: purchase.purchaseDate?.toISOString().split('T')[0] || 'N/A',
      project: purchase.projectId?.name || 'N/A',
      phase: purchase.phaseId?.name || 'N/A',
      category: purchase.categoryId?.name || 'N/A',
      item: purchase.itemId?.name || 'N/A',
      quantity: purchase.quantity,
      unitPrice: purchase.pricePerUnit,
      totalCost: purchase.totalCost,
      vendor: purchase.vendorId?.name || 'N/A',
    });
  });

  // Auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: 'I1',
  };

  return workbook;
}

/**
 * Export budget summary to Excel
 */
export async function exportBudgetSummaryToExcel(companyId) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Budget Summary');

  // Define columns
  worksheet.columns = [
    { header: 'Project', key: 'project', width: 25 },
    { header: 'Total Budget', key: 'budget', width: 15 },
    { header: 'Amount Spent', key: 'spent', width: 15 },
    { header: 'Remaining', key: 'remaining', width: 15 },
    { header: '% Used', key: 'percentUsed', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Fetch projects
  const projects = await Project.find({ companyId: new mongoose.Types.ObjectId(companyId) });

  // Calculate spending for each project
  for (const project of projects) {
    const purchases = await Purchase.aggregate([
      { $match: { projectId: project._id, companyId: new mongoose.Types.ObjectId(companyId) } },
      { $group: { _id: null, totalSpent: { $sum: '$totalCost' } } },
    ]);

    const totalSpent = purchases.length > 0 ? purchases[0].totalSpent : 0;
    const remaining = project.totalBudget - totalSpent;
    const percentUsed = project.totalBudget > 0 ? (totalSpent / project.totalBudget) * 100 : 0;

    let status = 'On Track';
    if (percentUsed > 100) status = 'Over Budget';
    else if (percentUsed > 90) status = 'Critical';
    else if (percentUsed > 80) status = 'Warning';

    const row = worksheet.addRow({
      project: project.name,
      budget: project.totalBudget,
      spent: totalSpent,
      remaining: remaining,
      percentUsed: percentUsed.toFixed(2) + '%',
      status: status,
    });

    // Color code status
    if (status === 'Over Budget') {
      row.getCell('status').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' },
      };
      row.getCell('status').font = { color: { argb: 'FFFFFFFF' } };
    } else if (status === 'Critical') {
      row.getCell('status').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFA500' },
      };
    }
  }

  return workbook;
}

/**
 * Export items to PDF/CSV
 */
export async function exportItems(companyId, projectId = null, format = 'pdf') {
  let items;
  
  if (projectId) {
    // Items don't have projectId, need to find via category -> phase -> project
    const phases = await Phase.find({ 
      projectId: new mongoose.Types.ObjectId(projectId),
      companyId: new mongoose.Types.ObjectId(companyId)
    }).select('_id');
    
    const phaseIds = phases.map(p => p._id);
    
    const categories = await Category.find({
      phaseId: { $in: phaseIds },
      companyId: new mongoose.Types.ObjectId(companyId)
    }).select('_id');
    
    const categoryIds = categories.map(c => c._id);
    
    items = await Item.find({
      categoryId: { $in: categoryIds },
      companyId: new mongoose.Types.ObjectId(companyId)
    })
      .populate('categoryId', 'name')
      .populate('defaultVendor', 'name')
      .sort({ name: 1 });
  } else {
    items = await Item.find({ companyId: new mongoose.Types.ObjectId(companyId) })
      .populate('categoryId', 'name')
      .populate('defaultVendor', 'name')
      .sort({ name: 1 });
  }

  const data = items.map(item => ({
    name: item.name,
    category: item.categoryId?.name || 'N/A',
    unit: item.unit,
    ratePerUnit: `$${item.ratePerUnit?.toFixed(2) || '0.00'}`,
    defaultVendor: item.defaultVendor?.name || 'N/A',
  }));

  const columns = [
    { header: 'Item Name', dataKey: 'name', key: 'name' },
    { header: 'Category', dataKey: 'category', key: 'category' },
    { header: 'Unit', dataKey: 'unit', key: 'unit' },
    { header: 'Rate Per Unit', dataKey: 'ratePerUnit', key: 'ratePerUnit' },
    { header: 'Default Vendor', dataKey: 'defaultVendor', key: 'defaultVendor' },
  ];

  if (format === 'pdf') {
    return exportToPDF(data, columns, 'Items Report', 'items-report.pdf');
  } else {
    return exportToCSV(data, columns, 'items-report.csv');
  }
}

/**
 * Export categories to PDF/CSV
 */
export async function exportCategories(companyId, projectId = null, format = 'pdf') {
  let categories;
  
  if (projectId) {
    // Categories don't have projectId, need to find via phase -> project
    const phases = await Phase.find({ 
      projectId: new mongoose.Types.ObjectId(projectId),
      companyId: new mongoose.Types.ObjectId(companyId)
    }).select('_id');
    
    const phaseIds = phases.map(p => p._id);
    
    categories = await Category.find({
      phaseId: { $in: phaseIds },
      companyId: new mongoose.Types.ObjectId(companyId)
    })
      .populate('phaseId', 'name')
      .sort({ name: 1 });
  } else {
    categories = await Category.find({ companyId: new mongoose.Types.ObjectId(companyId) })
      .populate('phaseId', 'name')
      .sort({ name: 1 });
  }

  const data = categories.map(category => ({
    name: category.name,
    phase: category.phaseId?.name || 'N/A',
    description: category.description || 'N/A',
  }));

  const columns = [
    { header: 'Category Name', dataKey: 'name', key: 'name' },
    { header: 'Phase', dataKey: 'phase', key: 'phase' },
    { header: 'Description', dataKey: 'description', key: 'description' },
  ];

  if (format === 'pdf') {
    return exportToPDF(data, columns, 'Categories Report', 'categories-report.pdf');
  } else {
    return exportToCSV(data, columns, 'categories-report.csv');
  }
}

/**
 * Export phases to PDF/CSV
 */
export async function exportPhases(companyId, projectId = null, format = 'pdf') {
  const query = { companyId: new mongoose.Types.ObjectId(companyId) };
  if (projectId) {
    query.projectId = new mongoose.Types.ObjectId(projectId);
  }

  const phases = await Phase.find(query)
    .populate('projectId', 'name')
    .sort({ name: 1 });

  const data = phases.map(phase => ({
    name: phase.name,
    project: phase.projectId?.name || 'N/A',
    budgetedAmount: `$${phase.budgetedAmount?.toLocaleString() || 0}`,
    actualAmount: `$${phase.actualAmount?.toLocaleString() || 0}`,
    status: phase.status || 'N/A',
  }));

  const columns = [
    { header: 'Phase Name', dataKey: 'name', key: 'name' },
    { header: 'Project', dataKey: 'project', key: 'project' },
    { header: 'Budgeted Amount', dataKey: 'budgetedAmount', key: 'budgetedAmount' },
    { header: 'Actual Amount', dataKey: 'actualAmount', key: 'actualAmount' },
    { header: 'Status', dataKey: 'status', key: 'status' },
  ];

  if (format === 'pdf') {
    return exportToPDF(data, columns, 'Phases Report', 'phases-report.pdf');
  } else {
    return exportToCSV(data, columns, 'phases-report.csv');
  }
}

/**
 * Export vendors to PDF/CSV
 */
export async function exportVendors(companyId, format = 'pdf') {
  const vendors = await Vendor.find({ 
    companyId: new mongoose.Types.ObjectId(companyId) 
  }).sort({ name: 1 });

  const data = vendors.map(vendor => ({
    name: vendor.name,
    contactPerson: vendor.contactPerson || 'N/A',
    phone: vendor.phone || 'N/A',
    email: vendor.email || 'N/A',
    address: vendor.address || 'N/A',
  }));

  const columns = [
    { header: 'Vendor Name', dataKey: 'name', key: 'name' },
    { header: 'Contact Person', dataKey: 'contactPerson', key: 'contactPerson' },
    { header: 'Phone', dataKey: 'phone', key: 'phone' },
    { header: 'Email', dataKey: 'email', key: 'email' },
    { header: 'Address', dataKey: 'address', key: 'address' },
  ];

  if (format === 'pdf') {
    return exportToPDF(data, columns, 'Vendors Report', 'vendors-report.pdf');
  } else {
    return exportToCSV(data, columns, 'vendors-report.csv');
  }
}

/**
 * Export purchases to PDF/CSV
 */
export async function exportPurchases(companyId, projectId = null, format = 'pdf') {
  const query = { companyId: new mongoose.Types.ObjectId(companyId) };
  if (projectId) {
    query.projectId = new mongoose.Types.ObjectId(projectId);
  }

  const purchases = await Purchase.find(query)
    .populate('projectId', 'name')
    .populate('phaseId', 'name')
    .populate('categoryId', 'name')
    .populate('itemId', 'name')
    .populate('vendorId', 'name')
    .sort({ purchaseDate: -1 });

  const data = purchases.map(purchase => ({
    date: purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString() : 'N/A',
    project: purchase.projectId?.name || 'N/A',
    phase: purchase.phaseId?.name || 'N/A',
    category: purchase.categoryId?.name || 'N/A',
    item: purchase.itemId?.name || 'N/A',
    quantity: purchase.quantity || 0,
    unitPrice: `$${purchase.pricePerUnit?.toLocaleString() || 0}`,
    totalCost: `$${purchase.totalCost?.toLocaleString() || 0}`,
    vendor: purchase.vendorId?.name || 'N/A',
  }));

  const columns = [
    { header: 'Date', dataKey: 'date', key: 'date' },
    { header: 'Project', dataKey: 'project', key: 'project' },
    { header: 'Phase', dataKey: 'phase', key: 'phase' },
    { header: 'Category', dataKey: 'category', key: 'category' },
    { header: 'Item', dataKey: 'item', key: 'item' },
    { header: 'Quantity', dataKey: 'quantity', key: 'quantity' },
    { header: 'Unit Price', dataKey: 'unitPrice', key: 'unitPrice' },
    { header: 'Total Cost', dataKey: 'totalCost', key: 'totalCost' },
    { header: 'Vendor', dataKey: 'vendor', key: 'vendor' },
  ];

  if (format === 'pdf') {
    return exportToPDF(data, columns, 'Purchases Report', 'purchases-report.pdf');
  } else {
    return exportToCSV(data, columns, 'purchases-report.csv');
  }
}
