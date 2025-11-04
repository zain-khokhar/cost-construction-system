'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';

export default function CategoryTab({ 
  categories, 
  phases,
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
  selectedCategories = [],
  onSelectAll,
  onSelectCategory,
  onEdit,
  onDelete,
  canEdit
}) {
  return (
    <>
      {canCreate && !permissionsLoading && (
        <Button onClick={onToggleForm} className="mb-4">
          {showForm ? 'Cancel' : '+ Add Category'}
        </Button>
      )}

      {showForm && canCreate && (
        <Card className="mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">New Category</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <Select
              label="Phase"
              options={[
                { value: '', label: 'Select phase' },
                ...phases.map((p) => ({ value: p._id, label: p.name })),
              ]}
              value={formData.phaseId || ''}
              onChange={(e) => onFormChange({ ...formData, phaseId: e.target.value })}
              required
            />
            <Input
              label="Category Name"
              value={formData.name || ''}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder="e.g., Steel Work, Masonry, Electrical"
              required
            />
            <Input
              label="Description (Optional)"
              value={formData.description || ''}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              placeholder="Enter category description"
            />
            <Button type="submit" disabled={loading}>
              {loading 
                ? (formData._id ? 'Updating...' : 'Creating...') 
                : (formData._id ? 'Update Category' : 'Create Category')}
            </Button>
          </form>
        </Card>
      )}

      <Card className="shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Categories List</h3>
          <p className="text-sm text-gray-600">
            Total: {pagination?.totalItems || categories.length} categor{(pagination?.totalItems || categories.length) === 1 ? 'y' : 'ies'}
          </p>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No categories created yet</p>
            {canCreate && <p className="text-sm">Click "Add Category" to get started</p>}
          </div>
        ) : (
          <>
            <Table
              headers={[
                <input
                  key="select-all"
                  type="checkbox"
                  checked={selectedCategories.length === categories.length && categories.length > 0}
                  onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                  className="rounded"
                />,
                'Category Name', 
                'Phase', 
                'Description',
                ...(canEdit ? ['Actions'] : [])
              ]}
              data={categories}
              renderRow={(cat) => (
                <>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat._id)}
                      onChange={(e) => onSelectCategory && onSelectCategory(cat._id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <span className="font-medium text-gray-900">{cat.name}</span>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {cat.phaseId?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 border-r border-gray-200">{cat.description || '—'}</td>
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit && onEdit(cat)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(cat._id)}
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
