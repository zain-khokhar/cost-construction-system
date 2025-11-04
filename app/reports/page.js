'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import ExportModal from '@/components/ui/ExportModal';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';

export default function ReportsPage() {
  const [purchases, setPurchases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [exportModal, setExportModal] = useState({ isOpen: false, type: '', title: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [selectedProject, dateRange]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.ok) setProjects(data.data.projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const url = selectedProject
        ? `/api/purchases?projectId=${selectedProject}`
        : '/api/purchases';
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        const filtered = filterByDateRange(data.data.purchases);
        setPurchases(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = (data) => {
    const now = new Date();
    let startDate;

    switch (dateRange) {
      case 'daily':
        startDate = subDays(now, 1);
        break;
      case 'weekly':
        startDate = startOfWeek(now);
        break;
      case 'monthly':
        startDate = startOfMonth(now);
        break;
      default:
        return data;
    }

    return data.filter((p) => new Date(p.purchaseDate) >= startDate);
  };

  const getTotalCost = () => {
    return purchases.reduce((sum, p) => sum + p.totalCost, 0);
  };

  const openExportModal = (type, title) => {
    setExportModal({ isOpen: true, type, title });
  };

  const closeExportModal = () => {
    setExportModal({ isOpen: false, type: '', title: '' });
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reports</h2>
        <Button
          onClick={() => openExportModal('purchases', 'Export Purchases Report')}
          disabled={purchases.length === 0}
        >
          Export Report
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Project"
              options={[
                { value: '', label: 'All Projects' },
                ...projects.map((p) => ({ value: p._id, label: p.name })),
              ]}
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Date Range"
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'monthly', label: 'This Month' },
              ]}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total Purchases</p>
            <p className="text-2xl font-bold">{purchases.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-2xl font-bold text-blue-600">${getTotalCost().toLocaleString()}</p>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <Table
            headers={['Date', 'Project', 'Phase', 'Category', 'Item', 'Quantity', 'Total', 'Vendor']}
            data={purchases}
            renderRow={(purchase) => (
              <>
                <td className="px-6 py-4">
                  {format(new Date(purchase.purchaseDate), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4">{purchase.projectId?.name || 'N/A'}</td>
                <td className="px-6 py-4">{purchase.phaseId?.name || 'N/A'}</td>
                <td className="px-6 py-4">{purchase.categoryId?.name || 'N/A'}</td>
                <td className="px-6 py-4">{purchase.itemId?.name || 'N/A'}</td>
                <td className="px-6 py-4">{purchase.quantity}</td>
                <td className="px-6 py-4 font-medium">${purchase.totalCost.toLocaleString()}</td>
                <td className="px-6 py-4">{purchase.vendorId?.name || 'N/A'}</td>
              </>
            )}
          />
        )}
      </Card>

      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={closeExportModal}
        exportType={exportModal.type}
        projectId={selectedProject || null}
        title={exportModal.title}
      />
    </AppLayout>
  );
}

