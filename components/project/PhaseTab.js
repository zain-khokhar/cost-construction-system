'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';

export default function PhaseTab({ 
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
  selectedPhases = [],
  onSelectAll,
  onSelectPhase,
  onEdit,
  onDelete,
  canEdit
}) {
  return (
    <>
      {canCreate && !permissionsLoading && (
        <Button onClick={onToggleForm} className="mb-4">
          {showForm ? 'Cancel' : '+ Add Phase'}
        </Button>
      )}

      {showForm && canCreate && (
        <Card className="mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">New Phase</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <Select
              label="Phase Type"
              options={[
                { value: '', label: 'Select phase type' },
                { value: 'Grey', label: 'Grey' },
                { value: 'Finishing', label: 'Finishing' },
              ]}
              value={formData.name || ''}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Description (Optional)"
              value={formData.description || ''}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              placeholder="Enter phase description"
            />
            <Button type="submit" disabled={loading}>
              {loading 
                ? (formData._id ? 'Updating...' : 'Creating...') 
                : (formData._id ? 'Update Phase' : 'Create Phase')}
            </Button>
          </form>
        </Card>
      )}

      <Card className="shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Phases List</h3>
          <p className="text-sm text-gray-600">
            Total: {pagination?.totalItems || phases.length} phase(s)
          </p>
        </div>
        {phases.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No phases created yet</p>
            {canCreate && <p className="text-sm">Click "Add Phase" to get started</p>}
          </div>
        ) : (
          <>
            <Table
              headers={[
                <input
                  key="select-all"
                  type="checkbox"
                  checked={selectedPhases.length === phases.length && phases.length > 0}
                  onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                  className="rounded"
                />,
                'Phase Name', 
                'Description', 
                'Created Date',
                ...(canEdit ? ['Actions'] : [])
              ]}
              data={phases}
              renderRow={(phase) => (
                <>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedPhases.includes(phase._id)}
                      onChange={(e) => onSelectPhase && onSelectPhase(phase._id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <span className="font-medium text-gray-900">{phase.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 border-r border-gray-200">{phase.description || '—'}</td>
                  <td className="px-6 py-4 text-gray-600 border-r border-gray-200">
                    {new Date(phase.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit && onEdit(phase)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(phase._id)}
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
