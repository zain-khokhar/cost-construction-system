'use client';

import { useState, useCallback, useMemo } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import ExportModal from '@/components/ui/ExportModal';
import ReportsFilters from '@/components/reports/ReportsFilters';
import ReportsSummary from '@/components/reports/ReportsSummary';
import { useReportsData } from '@/lib/hooks/useReportsData';
import { getCurrencySymbol } from '@/lib/utils/currencies';
import { format } from 'date-fns';

export default function ReportsPage() {
  const {
    purchases,
    projects,
    phases,
    categories,
    items,
    vendors,
    loading,
    error,
    filters,
    pagination,
    summary,
    updateFilter,
    updatePagination,
    resetFilters,
    fetchAllPurchasesForExport,
  } = useReportsData();

  const [exportModal, setExportModal] = useState({ isOpen: false });
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Memoized event handlers
  const openExportModal = useCallback(() => {
    setExportModal({ isOpen: true });
  }, []);

  const closeExportModal = useCallback(() => {
    setExportModal({ isOpen: false });
  }, []);

  const handlePageChange = useCallback((page) => {
    updatePagination('currentPage', page);
    setSelectedPurchases([]); // Clear selections when changing pages
    setSelectAll(false);
  }, [updatePagination]);

  const handleItemsPerPageChange = useCallback((limit) => {
    updatePagination('itemsPerPage', limit);
    updatePagination('currentPage', 1);
    setSelectedPurchases([]);
    setSelectAll(false);
  }, [updatePagination]);

  const handleSelectAll = useCallback((checked) => {
    setSelectAll(checked);
    if (checked) {
      // Select all purchases on current page
      setSelectedPurchases(purchases.map(p => p._id));
    } else {
      setSelectedPurchases([]);
    }
  }, [purchases]);

  const handleSelectPurchase = useCallback((purchaseId, checked) => {
    if (checked) {
      setSelectedPurchases(prev => [...prev, purchaseId]);
    } else {
      setSelectedPurchases(prev => prev.filter(id => id !== purchaseId));
      setSelectAll(false);
    }
  }, []);

  const getExportData = useCallback(async () => {
    if (selectAll) {
      // Export all data across all pages
      return await fetchAllPurchasesForExport();
    } else if (selectedPurchases.length > 0) {
      // Export only selected purchases
      return purchases.filter(p => selectedPurchases.includes(p._id));
    }
    return null;
  }, [selectAll, selectedPurchases, purchases, fetchAllPurchasesForExport]);

  // Memoized table headers to prevent re-creation on every render
  const tableHeaders = useMemo(() => [
    <input
      key="select-all"
      type="checkbox"
      checked={selectAll}
      onChange={(e) => handleSelectAll(e.target.checked)}
      className="w-4 h-4 text-blue-600 rounded"
    />,
    'Date',
    'Project',
    'Phase',
    'Category',
    'Item',
    'Quantity',
    'Unit Price',
    'Total',
    'Vendor'
  ], [selectAll, handleSelectAll]);

  // Memoized render row function to prevent re-creation on every render
  const renderPurchaseRow = useCallback((purchase, index) => (
    <>
      <td className="px-3 md:px-6 py-3 md:py-4">
        <input
          type="checkbox"
          checked={selectedPurchases.includes(purchase._id)}
          onChange={(e) => handleSelectPurchase(purchase._id, e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
      </td>
    
      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base whitespace-nowrap">
        {format(new Date(purchase.purchaseDate), 'MMM dd, yyyy')}
      </td>
      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base">{purchase.projectId?.name || 'N/A'}</td>
      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base">{purchase.phaseId?.name || 'N/A'}</td>
      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base">{purchase.categoryId?.name || 'N/A'}</td>
      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base">{purchase.itemId?.name || 'N/A'}</td>
      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base">{purchase.quantity || 0} {purchase.itemId?.unit || ''}</td>
      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base">{getCurrencySymbol(purchase.projectId?.currency || 'USD')}{(purchase.pricePerUnit || 0).toLocaleString()}</td>
      <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-sm md:text-base">{getCurrencySymbol(purchase.projectId?.currency || 'USD')}{(purchase.totalCost || 0).toLocaleString()}</td>
      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base">{purchase.vendorId?.name || 'N/A'}</td>
    </>
  ), [selectedPurchases, handleSelectPurchase]);

  // Memoized export title
  const exportTitle = useMemo(() => 
    `Export ${selectAll ? 'All' : selectedPurchases.length > 0 ? 'Selected' : 'Current Page'} Purchases`,
    [selectAll, selectedPurchases.length]
  );

  // Memoized export button text
  const exportButtonText = useMemo(() => 
    `Export ${selectedPurchases.length > 0 ? 'Selected' : 'All'}`,
    [selectedPurchases.length]
  );

  // Calculate the correct currency based on filters and data
  const getCurrentCurrency = useMemo(() => {
    // If filtering by specific project, use that project's currency
    if (filters.projectId && projects.length > 0) {
      const selectedProject = projects.find(p => p._id === filters.projectId);
      return selectedProject?.currency || 'USD';
    }
    
    // If we have project budgets, use the first one's currency
    if (summary.projectBudgets && summary.projectBudgets.length > 0) {
      return summary.projectBudgets[0].currency || 'USD';
    }
    
    // Default to USD
    return 'USD';
  }, [filters.projectId, projects, summary.projectBudgets]);

  // Memoized selected count text
  const selectedCountText = useMemo(() => 
    selectAll ? `All ${pagination.totalItems} items selected` : `${selectedPurchases.length} selected`,
    [selectAll, pagination.totalItems, selectedPurchases.length]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold pl-8">Reports</h2>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
          {selectedPurchases.length > 0 && (
            <div className="flex items-center px-3 md:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm md:text-base">
              <span className="font-medium">
                {selectedCountText}
              </span>
            </div>
          )}
          <Button
            onClick={openExportModal}
            disabled={purchases.length === 0}
            className="w-full sm:w-auto"
          >
            {exportButtonText}
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <ReportsFilters
          filters={filters}
          projects={projects}
          phases={phases}
          categories={categories}
          items={items}
          vendors={vendors}
          onFilterChange={updateFilter}
          onReset={resetFilters}
        />
      </Card>

      {/* Summary Section */}
      <div className="mb-6">
        <ReportsSummary
          summary={summary}
          totalRecords={pagination.totalItems}
          projectBudgets={summary.projectBudgets}
          hasProjectFilter={!!filters.projectId}
          currency={getCurrentCurrency}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Purchases Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No purchases found. Try adjusting your filters.
          </div>
        ) : (
          <>
            <Table
              headers={tableHeaders}
              data={purchases}
              renderRow={renderPurchaseRow}
            />
            
            {/* Pagination */}
            <div className="mt-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                itemsPerPage={pagination.itemsPerPage}
                totalItems={pagination.totalItems}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </>
        )}
      </Card>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={closeExportModal}
        exportType="purchases"
        title={exportTitle}
        exportParams={filters}
        selectedIds={selectedPurchases}
        exportAll={selectAll}
      />
    </div>
  );
}

