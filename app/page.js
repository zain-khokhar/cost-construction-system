'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import PhaseCostBarChart from '@/components/charts/PhaseCostBarChart';
import TopItemsBarChart from '@/components/charts/TopItemsBarChart';
import VendorSpendPieChart from '@/components/charts/VendorSpendPieChart';

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [phaseData, setPhaseData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchAnalytics(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) setProjects(data.data.projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchAnalytics = async (projectId = null) => {
    try {
      setError(null);
      setLoading(true);
      
      const projectParam = projectId ? `?projectId=${projectId}` : '';
      
      const [budget, phase, items, vendors] = await Promise.all([
        fetch(`/api/analytics/budget-vs-actual${projectParam}`, { credentials: 'include' }).then((r) => {
          if (r.status === 401) {
            throw new Error('Unauthorized');
          }
          return r.json();
        }),
        fetch(`/api/analytics/phase-summary${projectParam}`, { credentials: 'include' }).then((r) => {
          if (r.status === 401) {
            throw new Error('Unauthorized');
          }
          return r.json();
        }),
        fetch(`/api/analytics/item-breakdown?limit=5${projectId ? `&projectId=${projectId}` : ''}`, { credentials: 'include' }).then((r) => {
          if (r.status === 401) {
            throw new Error('Unauthorized');
          }
          return r.json();
        }),
        fetch(`/api/analytics/vendor-spend${projectParam}`, { credentials: 'include' }).then((r) => {
          if (r.status === 401) {
            throw new Error('Unauthorized');
          }
          return r.json();
        }),
      ]);

      if (budget.ok) setBudgetData(budget.data?.budgetComparison || []);
      if (phase.ok) setPhaseData(phase.data?.summary || []);
      if (items.ok) setItemData(items.data?.breakdown || []);
      if (vendors.ok) setVendorData(vendors.data?.vendorSpend || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      if (error.message === 'Unauthorized') {
        // Redirect to login if unauthorized
        router.push('/login');
      } else {
        setError('Failed to load dashboard data. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value || null)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          {selectedProject && (
            <button
              onClick={() => setSelectedProject(null)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {budgetData.map((project) => (
                  <Card 
                    key={project.projectId}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedProject === project.projectId ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedProject(project.projectId === selectedProject ? null : project.projectId)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{project.projectName}</h3>
                      {selectedProject === project.projectId && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Active</span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium">${project.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spent:</span>
                        <span className="font-medium">${project.spent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining:</span>
                        <span
                          className={`font-medium ${
                            project.remaining < 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          ${project.remaining.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Used:</span>
                          <span className="font-medium">{project.percentUsed}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full ${
                              project.percentUsed > 100 ? 'bg-red-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(project.percentUsed, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Phase Cost Summary">
                  {phaseData.length > 0 ? (
                    <PhaseCostBarChart data={phaseData} />
                  ) : (
                    <p className="text-gray-500 text-center py-8">No phase data available</p>
                  )}
                </Card>

                <Card title="Top 5 Items by Cost">
                  {itemData.length > 0 ? (
                    <TopItemsBarChart data={itemData} />
                  ) : (
                    <p className="text-gray-500 text-center py-8">No item data available</p>
                  )}
                </Card>

                <Card title="Vendor Spend Distribution" className="lg:col-span-2">
                  {vendorData.length > 0 ? (
                    <VendorSpendPieChart data={vendorData} />
                  ) : (
                    <p className="text-gray-500 text-center py-8">No vendor data available</p>
                  )}
                </Card>
              </div>
            </>
          )}
    </>
  );
}
