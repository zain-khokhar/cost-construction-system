import { useState } from 'react';

export function useProjectForms(
  projectId, 
  { 
    fetchData, 
    fetchPhases, 
    fetchCategories, 
    fetchItems, 
    fetchAllItems, 
    fetchPurchases,
    phasesPagination,
    categoriesPagination,
    itemsPagination,
    purchasesPagination,
  }
) {
  const [showForm, setShowForm] = useState({ 
    phases: false, 
    categories: false, 
    items: false, 
    purchases: false 
  });
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleForm = (tab) => {
    setShowForm({ ...showForm, [tab]: !showForm[tab] });
    setFormData({});
    setError('');
  };

  const openForm = (tab) => {
    setShowForm({ ...showForm, [tab]: true });
    setError('');
  };

  const handlePhaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isEditing = !!formData._id;
      const url = isEditing ? `/api/phases/${formData._id}` : '/api/phases';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Failed to ${isEditing ? 'update' : 'create'} phase`);
      
      setFormData({});
      setShowForm({ ...showForm, phases: false });
      // Refetch current page
      fetchPhases(phasesPagination?.currentPage || 1, phasesPagination?.itemsPerPage || 10);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isEditing = !!formData._id;
      const url = isEditing ? `/api/categories/${formData._id}` : '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
      
      setFormData({});
      setShowForm({ ...showForm, categories: false });
      // Refetch current page
      fetchCategories(categoriesPagination?.currentPage || 1, categoriesPagination?.itemsPerPage || 10);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isEditing = !!formData._id;
      const url = isEditing ? `/api/items/${formData._id}` : '/api/items';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ratePerUnit: parseFloat(formData.ratePerUnit),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Failed to ${isEditing ? 'update' : 'create'} item`);
      
      setFormData({});
      setShowForm({ ...showForm, items: false });
      // Fetch all items with current pagination
      fetchAllItems(itemsPagination?.currentPage || 1, itemsPagination?.itemsPerPage || 10);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isEditing = !!formData._id;
      const url = isEditing ? `/api/purchases/${formData._id}` : '/api/purchases';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectId,
          quantity: parseFloat(formData.quantity),
          pricePerUnit: parseFloat(formData.pricePerUnit),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Failed to ${isEditing ? 'update' : 'create'} purchase`);
      
      setFormData({});
      setShowForm({ ...showForm, purchases: false });
      // Refetch current page
      fetchPurchases(purchasesPagination?.currentPage || 1, purchasesPagination?.itemsPerPage || 10);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    showForm,
    formData,
    error,
    loading,
    setFormData,
    toggleForm,
    openForm,
    handlePhaseSubmit,
    handleCategorySubmit,
    handleItemSubmit,
    handlePurchaseSubmit,
  };
}
