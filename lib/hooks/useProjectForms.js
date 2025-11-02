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

  const handlePhaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/phases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create phase');
      
      setFormData({});
      setShowForm({ ...showForm, phases: false });
      // Refetch current page
      fetchPhases(1, phasesPagination?.itemsPerPage || 10);
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
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create category');
      
      setFormData({});
      setShowForm({ ...showForm, categories: false });
      // Refetch current page
      fetchCategories(1, categoriesPagination?.itemsPerPage || 10);
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
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ratePerUnit: parseFloat(formData.ratePerUnit),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create item');
      
      setFormData({});
      setShowForm({ ...showForm, items: false });
      // Fetch all items with current pagination
      fetchAllItems(1, itemsPagination?.itemsPerPage || 10);
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
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectId,
          quantity: parseFloat(formData.quantity),
          pricePerUnit: parseFloat(formData.pricePerUnit),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create purchase');
      
      setFormData({});
      setShowForm({ ...showForm, purchases: false });
      // Refetch current page
      fetchPurchases(1, purchasesPagination?.itemsPerPage || 10);
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
    handlePhaseSubmit,
    handleCategorySubmit,
    handleItemSubmit,
    handlePurchaseSubmit,
  };
}
