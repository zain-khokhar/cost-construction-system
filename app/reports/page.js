'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import ExportModal from '@/components/ui/ExportModal';
import ReportsFilters from '@/components/reports/ReportsFilters';
import ReportsSummary from '@/components/reports/ReportsSummary';
import { useReportsData } from '@/lib/hooks/useReportsData';
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

  const openExportModal = () => {
    setExportModal({ isOpen: true });
  };

  const closeExportModal = () => {
    setExportModal({ isOpen: false });
  };

  const handlePageChange = (page) => {
    updatePagination('currentPage', page);
    setSelectedPurchases([]); // Clear selections when changing pages
    setSelectAll(false);
  };

  const handleItemsPerPageChange = (limit) => {
    updatePagination('itemsPerPage', limit);
    updatePagination('currentPage', 1);
    setSelectedPurchases([]);
    setSelectAll(false);
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      // Select all purchases on current page
      setSelectedPurchases(purchases.map(p => p._id));
    } else {
      setSelectedPurchases([]);
    }
  };

  const handleSelectPurchase = (purchaseId, checked) => {
    if (checked) {
      setSelectedPurchases([...selectedPurchases, purchaseId]);
    } else {
      setSelectedPurchases(selectedPurchases.filter(id => id !== purchaseId));
      setSelectAll(false);
    }
  };

  const getExportData = async () => {
    if (selectAll) {
      // Export all data across all pages
      return await fetchAllPurchasesForExport();
    } else if (selectedPurchases.length > 0) {
      // Export only selected purchases
      return purchases.filter(p => selectedPurchases.includes(p._id));
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="flex gap-3">
          {selectedPurchases.length > 0 && (
            <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <span className="font-medium">
                {selectAll ? `All ${pagination.totalItems} items selected` : `${selectedPurchases.length} selected`}
              </span>
            </div>
          )}
          <Button
            onClick={openExportModal}
            disabled={purchases.length === 0}
          >
            Export {selectedPurchases.length > 0 ? 'Selected' : 'All'}
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
              headers={[
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
              ]}
              data={purchases}
              renderRow={(purchase, index) => (
                <>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPurchases.includes(purchase._id)}
                      onChange={(e) => handleSelectPurchase(purchase._id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </td>
                
                  <td className="px-6 py-4">
                    {format(new Date(purchase.purchaseDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">{purchase.projectId?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{purchase.phaseId?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{purchase.categoryId?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{purchase.itemId?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{purchase.quantity || 0} {purchase.itemId?.unit || ''}</td>
                  <td className="px-6 py-4">${(purchase.pricePerUnit || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium">${(purchase.totalCost || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">{purchase.vendorId?.name || 'N/A'}</td>
                </>
              )}
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
        title={`Export ${selectAll ? 'All' : selectedPurchases.length > 0 ? 'Selected' : 'Current Page'} Purchases`}
        exportParams={filters}
        selectedIds={selectedPurchases}
        exportAll={selectAll}
      />
    </AppLayout>
  );
}

