'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import CurrencySelect from '@/components/ui/CurrencySelect';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { getCurrencySymbol } from '@/lib/utils/currencies';

export default function ProjectsPage() {
  const router = useRouter();
  const { canCreate, loading: permissionsLoading } = usePermissions();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    currency: 'USD',
  });
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [pagination.currentPage, pagination.itemsPerPage]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProjects(projects.map(p => p._id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId, checked) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId]);
    } else {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      starting_soon: { label: 'Starting Soon', color: 'bg-yellow-100 text-yellow-800' },
      ongoing: { label: 'Ongoing', color: 'bg-green-100 text-green-800' },
      paused: { label: 'Paused', color: 'bg-gray-100 text-gray-800' },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
    };
    const config = statusConfig[status] || statusConfig.starting_soon;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchProjects(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?page=${pagination.currentPage}&limit=${pagination.itemsPerPage}`);
      const data = await res.json();
      if (data.ok) {
        setProjects(data.data.projects);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingProject ? `/api/projects/${editingProject}` : '/api/projects';
      const method = editingProject ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalBudget: parseFloat(formData.totalBudget),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || `Failed to ${editingProject ? 'update' : 'create'} project`);
      }

      setFormData({ name: '', client: '', location: '', startDate: '', endDate: '', totalBudget: '', currency: 'USD' });
      setShowForm(false);
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project._id);
    setFormData({
      name: project.name,
      client: project.client,
      location: project.location || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      totalBudget: project.totalBudget,
      currency: project.currency || 'USD',
    });
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchProjects();
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        setError(data.error?.message || 'Failed to delete project');
      }
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setFormData({ name: '', client: '', location: '', startDate: '', endDate: '', totalBudget: '', currency: 'USD' });
    setShowForm(false);
    setError('');
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your construction projects</p>
        </div>
        {canCreate && !permissionsLoading && (
          <Button
            onClick={() => {
              if (!showForm) {
                setShowForm(true);
              } else {
                handleCancelEdit();
              }
            }}
            className="w-full sm:w-auto min-w-[140px] shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
              </svg>
              {showForm ? 'Cancel' : 'New Project'}
            </span>
          </Button>
        )}
      </div>

      {/* Form Section */}
      {showForm && canCreate && (
        <Card className="mb-4 md:mb-6 shadow-lg">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {editingProject ? 'Edit Project' : 'New Project'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Input
                    label="Project Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full"
                    placeholder="Enter project name"
                  />
                </div>
                <div className="lg:col-span-1">
                  <Input
                    label="Client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    required
                    className="w-full"
                    placeholder="Enter client name"
                  />
                </div>
                <div className="lg:col-span-1">
                  <Input
                    label="Total Budget"
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                    required
                    className="w-full"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <CurrencySelect
                    value={formData.currency}
                    onChange={(value) => setFormData({ ...formData, currency: value })}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full"
                    placeholder="Enter project location"
                  />
                </div>
                <div className="sm:col-span-1">
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div className="sm:col-span-1">
                  <Input
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto min-w-[140px] order-2 sm:order-1"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </Button>
                {editingProject && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto min-w-[100px] order-1 sm:order-2"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete this project? This action cannot be undone and will remove all associated purchases and data.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white order-1 sm:order-2"
                >
                  Delete Project
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Projects Table/Cards */}
      <Card className="shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first project.</p>
            {canCreate && (
              <Button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              <div className="">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedProjects.length === projects.length && projects.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedProjects.length > 0 ? `${selectedProjects.length} selected` : 'Select all'}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedProjects.includes(project._id)}
                            onChange={(e) => handleSelectProject(project._id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-600">{project.client}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canCreate ? (
                            <select
                              value={project.status || 'starting_soon'}
                              onChange={(e) => handleStatusUpdate(project._id, e.target.value)}
                              className="text-xs border rounded px-2 py-1 bg-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="starting_soon">Starting Soon</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="paused">Paused</option>
                              <option value="completed">Completed</option>
                            </select>
                          ) : (
                            getStatusBadge(project.status)
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium">{project.location || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Budget:</span>
                          <p className="font-medium">${project.totalBudget.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Start Date:</span>
                          <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/projects/${project._id}`)}
                          className="flex-1 min-w-20"
                        >
                          View
                        </Button>
                        {canCreate && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(project)}
                              className="flex-1 min-w-20"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(project._id)}
                              className="flex-1 min-w-20 text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table
                headers={[
                  <input
                    key="select-all"
                    type="checkbox"
                    checked={selectedProjects.length === projects.length && projects.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />,
                  'Name',
                  'Client',
                  'Location',
                  'Budget',
                  'Status',
                  'Start Date',
                  'Actions'
                ]}
                data={projects}
                renderRow={(project) => (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project._id)}
                        onChange={(e) => handleSelectProject(project._id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
                    <td className="px-6 py-4 text-gray-600">{project.client}</td>
                    <td className="px-6 py-4 text-gray-600">{project.location || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${project.totalBudget.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {canCreate ? (
                        <select
                          value={project.status || 'starting_soon'}
                          onChange={(e) => handleStatusUpdate(project._id, e.target.value)}
                          className="text-sm border rounded px-3 py-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="starting_soon">Starting Soon</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        getStatusBadge(project.status)
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(project.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/projects/${project._id}`)}
                        >
                          View
                        </Button>
                        {canCreate && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(project)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(project._id)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </>
                )}
              />
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 px-4 py-3 sm:px-2">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={(page) => setPagination({ ...pagination, currentPage: page })}
                onItemsPerPageChange={(limit) => setPagination({ ...pagination, itemsPerPage: limit, currentPage: 1 })}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}