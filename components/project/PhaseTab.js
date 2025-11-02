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
  onSelectPhase
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
              {loading ? 'Creating...' : 'Create Phase'}
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
                'Created Date'
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
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(phase.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
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
