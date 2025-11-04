'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';

export default function ItemTab({ 
  items, 
  categories,
  vendors,
  showForm, 
  formData, 
  loading, 
  canCreate, 
  permissionsLoading,
  pagination,
  onToggleForm, 
  onFormChange, 
  onSubmit,
  onPageChange,
  onItemsPerPageChange,
  selectedItems = [],
  onSelectAll,
  onSelectItem,
  onEdit,
  onDelete,
  canEdit
}) {
  return (
    <>
      {canCreate && !permissionsLoading && (
        <Button onClick={onToggleForm} className="mb-4">
          {showForm ? 'Cancel' : '+ Add Item'}
        </Button>
      )}

      {showForm && canCreate && (
        <Card className="mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">New Item</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
                options={[
                  { value: '', label: 'Select category' },
                  ...categories.map((c) => ({ value: c._id, label: c.name })),
                ]}
                value={formData.categoryId || ''}
                onChange={(e) => onFormChange({ ...formData, categoryId: e.target.value })}
                required
              />
              <Input
                label="Item Name"
                value={formData.name || ''}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                placeholder="e.g., Cement, Bricks, Paint"
                required
              />
              <Input
                label="Unit"
                placeholder="e.g., bags, tons, sqft"
                value={formData.unit || ''}
                onChange={(e) => onFormChange({ ...formData, unit: e.target.value })}
                required
              />
              <Input
                label="Rate Per Unit ($)"
                type="number"
                step="0.01"
                value={formData.ratePerUnit || ''}
                onChange={(e) => onFormChange({ ...formData, ratePerUnit: e.target.value })}
                placeholder="0.00"
                required
              />
              <Select
                label="Default Vendor (Optional)"
                options={[
                  { value: '', label: 'Select vendor' },
                  ...vendors.map((v) => ({ value: v._id, label: v.name })),
                ]}
                value={formData.defaultVendor || ''}
                onChange={(e) => onFormChange({ ...formData, defaultVendor: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (formData._id ? 'Updating...' : 'Creating...') 
                : (formData._id ? 'Update Item' : 'Create Item')}
            </Button>
          </form>
        </Card>
      )}

      <Card className="shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Items List</h3>
          <p className="text-sm text-gray-600">
            Total: {pagination?.totalItems || items.length} item(s)
          </p>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No items created yet</p>
            {canCreate && <p className="text-sm">Click "Add Item" to get started</p>}
          </div>
        ) : (
          <>
            <Table
              headers={[
                <input
                  key="select-all"
                  type="checkbox"
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                  className="rounded"
                />,
                'Item Name', 
                'Category', 
                'Unit', 
                'Rate', 
                'Default Vendor',
                ...(canEdit ? ['Actions'] : [])
              ]}
              data={items}
              renderRow={(item) => (
                <>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={(e) => onSelectItem && onSelectItem(item._id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {item.categoryId?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 border-r border-gray-200">{item.unit}</td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <span className="font-semibold text-green-600">
                      ${parseFloat(item.ratePerUnit).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 border-r border-gray-200">{item.defaultVendor?.name || '—'}</td>
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit && onEdit(item)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(item._id)}
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
