'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import BudgetProgressChart from '@/components/charts/BudgetProgressChart';
import CostTrendChart from '@/components/charts/CostTrendChart';
import ItemCostHorizontalChart from '@/components/charts/ItemCostHorizontalChart';
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

  // Memoized data-fetching functions
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) setProjects(data.data.projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  }, []);

  const fetchAnalytics = useCallback(async (projectId = null) => {
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
  }, [router]);

  // Effects with proper dependencies
  useEffect(() => {
    fetchProjects();
    fetchAnalytics();
  }, [fetchProjects, fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics(selectedProject);
  }, [selectedProject, fetchAnalytics]);

  // Memoized event handlers
  const handleProjectChange = useCallback((e) => {
    setSelectedProject(e.target.value || null);
  }, []);

  const handleClearProject = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const handleProjectCardClick = useCallback((projectId) => {
    setSelectedProject(projectId === selectedProject ? null : projectId);
  }, [selectedProject]);

  // Memoized derived data - expensive calculations
  const summaryStats = useMemo(() => {
    return budgetData.reduce((acc, project) => {
      acc.totalBudget += project.budget || 0;
      acc.totalSpent += project.spent || 0;
      acc.totalRemaining += project.remaining || 0;
      return acc;
    }, { totalBudget: 0, totalSpent: 0, totalRemaining: 0 });
  }, [budgetData]);

  const avgUsage = useMemo(() => {
    return budgetData.length > 0 
      ? (summaryStats.totalSpent / summaryStats.totalBudget * 100).toFixed(1)
      : 0;
  }, [budgetData, summaryStats]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 md:p-6 rounded-lg shadow-lg">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Project Dashboard</h2>
          <p className="text-sm md:text-base text-blue-100">Real-time construction cost analytics</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
          <select
            value={selectedProject || ''}
            onChange={handleProjectChange}
            className="flex-1 sm:flex-none bg-white text-gray-900 border-0 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md"
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
              onClick={handleClearProject}
              className="bg-blue-500 hover:bg-blue-400 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-colors shadow-md whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 md:px-6 py-3 md:py-4 rounded-r-lg shadow-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm md:text-base">{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 md:py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-blue-600 border-t-transparent mb-3 md:mb-4"></div>
            <p className="text-gray-600 font-medium text-sm md:text-base">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs md:text-sm font-medium mb-1">Total Budget</p>
                  <h3 className="text-2xl md:text-3xl font-bold">${summaryStats.totalBudget.toLocaleString()}</h3>
                </div>
                <div className="bg-blue-400 bg-opacity-30 p-3 md:p-4 rounded-full">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs md:text-sm font-medium mb-1">Total Spent</p>
                  <h3 className="text-2xl md:text-3xl font-bold">${summaryStats.totalSpent.toLocaleString()}</h3>
                </div>
                <div className="bg-green-400 bg-opacity-30 p-3 md:p-4 rounded-full">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className={`bg-gradient-to-br ${summaryStats.totalRemaining >= 0 ? 'from-teal-500 to-teal-600' : 'from-red-500 to-red-600'} text-white shadow-lg hover:shadow-xl transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${summaryStats.totalRemaining >= 0 ? 'text-teal-100' : 'text-red-100'} text-xs md:text-sm font-medium mb-1`}>Remaining</p>
                  <h3 className="text-2xl md:text-3xl font-bold">${summaryStats.totalRemaining.toLocaleString()}</h3>
                </div>
                <div className={`${summaryStats.totalRemaining >= 0 ? 'bg-teal-400' : 'bg-red-400'} bg-opacity-30 p-3 md:p-4 rounded-full`}>
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs md:text-sm font-medium mb-1">Avg Usage</p>
                  <h3 className="text-2xl md:text-3xl font-bold">{avgUsage}%</h3>
                </div>
                <div className="bg-purple-400 bg-opacity-30 p-3 md:p-4 rounded-full">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Project Cards */}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Project Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {budgetData.map((project) => (
                <Card 
                  key={project.projectId}
                  className={`cursor-pointer transition-all hover:shadow-xl border-2 ${
                    selectedProject === project.projectId 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-transparent hover:border-blue-200'
                  }`}
                  onClick={() => handleProjectCardClick(project.projectId)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-800 flex-1">{project.projectName}</h3>
                    {selectedProject === project.projectId && (
                      <span className="text-xs bg-blue-500 text-white px-2.5 py-1 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 font-medium">Budget:</span>
                      <span className="font-bold text-gray-900">${project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 font-medium">Spent:</span>
                      <span className="font-bold text-gray-900">${project.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 font-medium">Remaining:</span>
                      <span
                        className={`font-bold ${
                          project.remaining < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        ${project.remaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t-2 border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 font-medium">Progress:</span>
                        <span className={`font-bold text-lg ${
                          project.percentUsed > 100 ? 'text-red-600' : project.percentUsed > 80 ? 'text-orange-600' : 'text-blue-600'
                        }`}>
                          {project.percentUsed}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            project.percentUsed > 100 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : project.percentUsed > 80
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                          style={{ width: `${Math.min(project.percentUsed, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Analytics & Insights
            </h3>
            
            {/* First Row - Budget Progress and Utilization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <Card title="Budget vs Actual Spending" className="shadow-lg">
                {budgetData.length > 0 ? (
                  <BudgetProgressChart data={budgetData} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="font-medium">No budget data available</p>
                  </div>
                )}
              </Card>

              <Card title="Overall Budget Utilization" className="shadow-lg">
                {budgetData.length > 0 ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="w-full max-w-md text-center">
                      <div className="text-center mb-8">
                        <p className="text-6xl font-bold text-blue-600 mb-2">
                          {((summaryStats.totalSpent / summaryStats.totalBudget) * 100).toFixed(1)}%
                        </p>
                        <p className="text-lg text-gray-600 font-medium">Overall Utilization</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <span className="text-gray-700 font-medium">Spent</span>
                          <span className="text-green-700 font-bold text-lg">${summaryStats.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <span className="text-gray-700 font-medium">Remaining</span>
                          <span className="text-blue-700 font-bold text-lg">${summaryStats.totalRemaining.toLocaleString()}</span>
                        </div>
                        {summaryStats.totalSpent > summaryStats.totalBudget && (
                          <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                            <span className="text-gray-700 font-medium">Over Budget</span>
                            <span className="text-red-700 font-bold text-lg">${(summaryStats.totalSpent - summaryStats.totalBudget).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <p className="font-medium">No budget data available</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Second Row - Phase Cost Trend */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 mb-4 md:mb-6">
              <Card title="Phase Cost Trend Analysis" className="shadow-lg">
                {phaseData.length > 0 ? (
                  <CostTrendChart data={phaseData} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p className="font-medium">No phase data available</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Third Row - Items and Vendors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card title="Top 5 Expensive Items" className="shadow-lg">
                {itemData.length > 0 ? (
                  <ItemCostHorizontalChart data={itemData} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p className="font-medium">No item data available</p>
                  </div>
                )}
              </Card>

              <Card title="Vendor Spend Distribution" className="shadow-lg">
                {vendorData.length > 0 ? (
                  <VendorSpendPieChart data={vendorData} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <p className="font-medium">No vendor data available</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
