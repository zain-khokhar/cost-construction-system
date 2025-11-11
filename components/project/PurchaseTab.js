'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';

export default function PurchaseTab({ 
  purchases, 
  phases,
  categories,
  items,
  vendors,
  showForm, 
  formData, 
  loading, 
  canCreateExpense, 
  permissionsLoading,
  pagination,
  onToggleForm, 
  onFormChange, 
  onSubmit,
  onPhaseChange,
  onCategoryChange,
  onPageChange,
  onItemsPerPageChange,
  selectedPurchases = [],
  onSelectAll,
  onSelectPurchase,
  onEdit,
  onDelete,
  canEdit
}) {
  return (
    <>
      {canCreateExpense && !permissionsLoading && (
        <Button onClick={onToggleForm} className="mb-4">
          {showForm ? 'Cancel' : '+ Log Purchase'}
        </Button>
      )}

      {showForm && canCreateExpense && (
        <Card className="mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">New Purchase</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Phase"
                options={[
                  { value: '', label: 'Select phase' },
                  ...phases.map((p) => ({ value: p._id, label: p.name })),
                ]}
                value={formData.phaseId || ''}
                onChange={onPhaseChange}
                required
              />
              <Select
                label="Category"
                options={[
                  { value: '', label: 'Select category' },
                  ...categories.map((c) => ({ value: c._id, label: c.name })),
                ]}
                value={formData.categoryId || ''}
                onChange={onCategoryChange}
                required
              />
              <Select
                label="Item"
                options={[
                  { value: '', label: 'Select item' },
                  ...items.map((i) => ({ value: i._id, label: i.name })),
                ]}
                value={formData.itemId || ''}
                onChange={(e) => onFormChange({ ...formData, itemId: e.target.value })}
                required
              />
              <Select
                label="Vendor (Optional)"
                options={[
                  { value: '', label: 'Select vendor' },
                  ...vendors.map((v) => ({ value: v._id, label: v.name })),
                ]}
                value={formData.vendorId || ''}
                onChange={(e) => onFormChange({ ...formData, vendorId: e.target.value })}
              />
              <Input
                label="Quantity"
                type="number"
                step="0.01"
                value={formData.quantity || ''}
                onChange={(e) => onFormChange({ ...formData, quantity: e.target.value })}
                required
              />
              <Input
                label="Price Per Unit"
                type="number"
                step="0.01"
                value={formData.pricePerUnit || ''}
                onChange={(e) => onFormChange({ ...formData, pricePerUnit: e.target.value })}
                required
              />
              <Input
                label="Purchase Date"
                type="date"
                value={formData.purchaseDate || ''}
                onChange={(e) => onFormChange({ ...formData, purchaseDate: e.target.value })}
              />
              <Input
                label="Invoice URL (Optional)"
                value={formData.invoiceUrl || ''}
                onChange={(e) => onFormChange({ ...formData, invoiceUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (formData._id ? 'Updating...' : 'Creating...') 
                : (formData._id ? 'Update Purchase' : 'Create Purchase')}
            </Button>
          </form>
        </Card>
      )}

      <Card className="shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Purchases List</h3>
          <p className="text-sm text-gray-600">
            Total: {pagination?.totalItems || purchases.length} purchase(s)
          </p>
        </div>
        {purchases.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No purchases logged yet</p>
            {canCreateExpense && <p className="text-sm">Click "Log Purchase" to get started</p>}
          </div>
        ) : (
          <>
            <Table
              headers={[
                <input
                  key="select-all"
                  type="checkbox"
                  checked={selectedPurchases.length === purchases.length && purchases.length > 0}
                  onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                  className="rounded"
                />,
                'Item', 
                'Quantity', 
                'Unit Price', 
                'Total Cost', 
                'Vendor', 
                'Date',
                ...(canEdit ? ['Actions'] : [])
              ]}
              data={purchases}
              renderRow={(purchase) => (
                <>
                  <td className="px-6 max-sm:p-2 py-4 border-r border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedPurchases.includes(purchase._id)}
                      onChange={(e) => onSelectPurchase && onSelectPurchase(purchase._id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 max-sm:p-2 py-4 border-r border-gray-200">
                    <span className="font-medium text-gray-900">{purchase.itemId?.name || 'N/A'}</span>
                  </td>
                  <td className="px-6 max-sm:p-2 py-4 text-gray-600 border-r border-gray-200">
                    {purchase.quantity} {purchase.itemId?.unit || 'units'}
                  </td>
                  <td className="px-6 max-sm:p-2 py-4 border-r border-gray-200">
                    <span className="text-gray-700">${parseFloat(purchase.pricePerUnit).toFixed(2)}</span>
                  </td>
                  <td className="px-6 max-sm:p-2 py-4 border-r border-gray-200">
                    <span className="font-semibold text-green-600">
                      ${purchase.totalCost.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 max-sm:p-2 py-4 border-r border-gray-200">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {purchase.vendorId?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 max-sm:p-2 py-4 text-gray-600 border-r border-gray-200">
                    {new Date(purchase.purchaseDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  {canEdit && (
                    <td className="px-6 max-sm:p-2 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit && onEdit(purchase)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(purchase._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </>
              )}
            />
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={onPageChange}
                onItemsPerPageChange={onItemsPerPageChange}
              />
            )}
          </>
        )}
      </Card>
    </>
  );
}