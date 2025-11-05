'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { usePermissions } from '@/lib/hooks/usePermissions';

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

      setFormData({ name: '', client: '', location: '', startDate: '', endDate: '', totalBudget: '' });
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
    setFormData({ name: '', client: '', location: '', startDate: '', endDate: '', totalBudget: '' });
    setShowForm(false);
    setError('');
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Projects</h2>
            {canCreate && !permissionsLoading && (
              <Button onClick={() => {
                if (!showForm) {
                  setShowForm(true);
                } else {
                  handleCancelEdit();
                }
              }}>
                {showForm ? 'Cancel' : 'New Project'}
              </Button>
            )}
          </div>

          {showForm && canCreate && (
            <Card className="mb-6">
              <h3 className="text-lg font-semibold mb-4">{editingProject ? 'Edit Project' : 'New Project'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Project Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    required
                  />
                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                  <Input
                    label="Total Budget"
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                    required
                  />
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="flex gap-2">
                  <Button type="submit">{editingProject ? 'Update Project' : 'Create Project'}</Button>
                  {editingProject && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          )}

          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="max-w-md">
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this project? This action cannot be undone and will remove all associated data.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </div>
          )}

          <Card>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <>
                <Table
                  headers={[
                    <input
                      key="select-all"
                      type="checkbox"
                      checked={selectedProjects.length === projects.length && projects.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
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
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4">{project.name}</td>
                      <td className="px-6 py-4">{project.client}</td>
                      <td className="px-6 py-4">{project.location || 'N/A'}</td>
                      <td className="px-6 py-4">${project.totalBudget.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {canCreate ? (
                          <select
                            value={project.status || 'starting_soon'}
                            onChange={(e) => handleStatusUpdate(project._id, e.target.value)}
                            className="text-xs border rounded px-2 py-1"
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
                      <td className="px-6 py-4">
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
                                className="text-red-600 hover:text-red-700"
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
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage}
                  onPageChange={(page) => setPagination({ ...pagination, currentPage: page })}
                  onItemsPerPageChange={(limit) => setPagination({ ...pagination, itemsPerPage: limit, currentPage: 1 })}
                />
              </>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
