'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { getCurrencySymbol } from '@/lib/utils/currencies';

export default function VendorsPage() {
  const { canCreate, loading: permissionsLoading } = usePermissions();
  const [vendors, setVendors] = useState([]);
  const [vendorSpend, setVendorSpend] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    rating: '',
  });
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [editingVendor, setEditingVendor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [companyCurrency, setCompanyCurrency] = useState('USD');

  useEffect(() => {
    fetchVendors();
    fetchVendorSpend();
    fetchCompanySettings();
  }, [pagination.currentPage, pagination.itemsPerPage]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedVendors(vendors.map(v => v._id));
    } else {
      setSelectedVendors([]);
    }
  };

  const handleSelectVendor = (vendorId, checked) => {
    if (checked) {
      setSelectedVendors([...selectedVendors, vendorId]);
    } else {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    }
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vendors?page=${pagination.currentPage}&limit=${pagination.itemsPerPage}`);
      const data = await res.json();
      if (data.ok) {
        setVendors(data.data.vendors);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorSpend = async () => {
    try {
      const res = await fetch('/api/analytics/vendor-spend');
      const data = await res.json();
      if (data.ok) setVendorSpend(data.data.vendorSpend);
    } catch (err) {
      console.error('Failed to fetch vendor spend:', err);
    }
  };

  const fetchCompanySettings = async () => {
    try {
      const res = await fetch('/api/companies/settings');
      const data = await res.json();
      if (data.ok && data.data) {
        setCompanyCurrency(data.data.defaultCurrency || 'USD');
      }
    } catch (err) {
      console.error('Failed to fetch company settings:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = { ...formData };
      if (formData.rating) payload.rating = parseFloat(formData.rating);

      const url = editingVendor ? `/api/vendors/${editingVendor}` : '/api/vendors';
      const method = editingVendor ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || `Failed to ${editingVendor ? 'update' : 'create'} vendor`);
      }

      setFormData({ name: '', contact: '', address: '', rating: '' });
      setShowForm(false);
      setEditingVendor(null);
      fetchVendors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor._id);
    setFormData({
      name: vendor.name,
      contact: vendor.contact || '',
      address: vendor.address || '',
      rating: vendor.rating || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (vendorId) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchVendors();
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        setError(data.error?.message || 'Failed to delete vendor');
      }
    } catch (err) {
      setError('Failed to delete vendor');
    }
  };

  const handleCancelEdit = () => {
    setEditingVendor(null);
    setFormData({ name: '', contact: '', address: '', rating: '' });
    setShowForm(false);
  };

  const getVendorSpend = (vendorId) => {
    const spend = vendorSpend.find((v) => v._id === vendorId);
    return spend ? spend.totalSpend : 0;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold pl-8 py-4">Vendors</h2>
        {canCreate && !permissionsLoading && (
          <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
            {showForm ? 'Cancel' : 'New Vendor'}
          </Button>
        )}
      </div>

      {showForm && canCreate && (
        <Card className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{editingVendor ? 'Edit Vendor' : 'New Vendor'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Vendor Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                  <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  <Input
                    label="Rating (0-5)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="flex gap-2">
                  <Button type="submit">{editingVendor ? 'Update Vendor' : 'Create Vendor'}</Button>
                  {editingVendor && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          )}

          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
              <Card className="max-w-md">
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this vendor? This action cannot be undone.
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
                      checked={selectedVendors.length === vendors.length && vendors.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />,
                    'Name',
                    'Contact',
                    'Address',
                    'Rating',
                    'Total Spend',
                    canCreate && 'Actions'
                  ].filter(Boolean)}
                  data={vendors}
                  renderRow={(vendor) => (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedVendors.includes(vendor._id)}
                          onChange={(e) => handleSelectVendor(vendor._id, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4">{vendor.name}</td>
                      <td className="px-6 py-4">{vendor.contact || 'N/A'}</td>
                      <td className="px-6 py-4">{vendor.address || 'N/A'}</td>
                      <td className="px-6 py-4">{vendor.rating || 'N/A'}</td>
                      <td className="px-6 py-4 font-medium">
                        {getCurrencySymbol(companyCurrency)}{getVendorSpend(vendor._id).toLocaleString()}
                      </td>
                      {canCreate && (
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(vendor)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(vendor._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      )}
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
    </div>
  );
}