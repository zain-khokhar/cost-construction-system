import { useState, useEffect, useCallback } from 'react';

export function useReportsData() {
  const [purchases, setPurchases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [filters, setFilters] = useState({
    projectId: '',
    phaseId: '',
    categoryId: '',
    itemId: '',
    vendorId: '',
    startDate: '',
    endDate: '',
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Summary data
  const [summary, setSummary] = useState({
    totalSpending: 0,
    totalBudget: 0,
    remainingBudget: 0,
    projectBudgets: [], // Array of {name, budget} objects
  });

  // Fetch all dropdown data on mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Fetch purchases when filters or pagination change
  useEffect(() => {
    fetchPurchases();
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  const fetchDropdownData = async () => {
    try {
      const [projectsRes, vendorsRes] = await Promise.all([
        fetch('/api/projects?limit=1000'),
        fetch('/api/vendors?limit=1000'),
      ]);

      const [projectsData, vendorsData] = await Promise.all([
        projectsRes.json(),
        vendorsRes.json(),
      ]);

      if (projectsData.ok) setProjects(projectsData.data.projects);
      if (vendorsData.ok) setVendors(vendorsData.data.vendors);
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
      setError('Failed to load filter options');
    }
  };

  const fetchPhases = useCallback(async (projectId) => {
    if (!projectId) {
      setPhases([]);
      return;
    }
    try {
      const res = await fetch(`/api/phases?projectId=${projectId}&limit=1000`);
      const data = await res.json();
      if (data.ok) setPhases(data.data.phases);
    } catch (err) {
      console.error('Failed to fetch phases:', err);
    }
  }, []);

  const fetchCategories = useCallback(async (phaseId) => {
    if (!phaseId) {
      setCategories([]);
      return;
    }
    try {
      const res = await fetch(`/api/categories?phaseId=${phaseId}&limit=1000`);
      const data = await res.json();
      if (data.ok) setCategories(data.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchItems = useCallback(async (categoryId) => {
    if (!categoryId) {
      setItems([]);
      return;
    }
    try {
      const res = await fetch(`/api/items?categoryId=${categoryId}&limit=1000`);
      const data = await res.json();
      if (data.ok) setItems(data.data.items);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  }, []);

  const fetchPurchases = async (exportAll = false) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      // Add pagination (unless exporting all)
      if (!exportAll) {
        params.append('page', pagination.currentPage);
        params.append('limit', pagination.itemsPerPage);
      } else {
        params.append('exportAll', 'true');
      }

      const res = await fetch(`/api/purchases?${params.toString()}`);
      const data = await res.json();
      
      if (data.ok) {
        setPurchases(data.data.purchases);
        if (!exportAll) {
          setPagination(data.data.pagination);
        }
        calculateSummary(data.data.purchases);
        return data.data.purchases; // Return for export
      } else {
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Failed to load purchases';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
      setError('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (purchasesList) => {
    const totalSpending = purchasesList.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    
    // Get unique projects from purchases and collect their budgets
    const uniqueProjects = {};
    const projectBudgets = [];
    
    purchasesList.forEach(p => {
      if (p.projectId?._id && p.projectId?.totalBudget !== undefined) {
        if (!uniqueProjects[p.projectId._id]) {
          uniqueProjects[p.projectId._id] = true; // Mark as seen
          projectBudgets.push({
            name: p.projectId.name,
            budget: p.projectId.totalBudget,
          });
        }
      }
    });
    
    const totalBudget = projectBudgets.reduce((sum, proj) => sum + proj.budget, 0);
    const remainingBudget = totalBudget - totalSpending;

    setSummary({
      totalSpending,
      totalBudget,
      remainingBudget,
      projectBudgets,
    });
  };

  const updateFilter = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Clear dependent filters when parent changes
      if (key === 'projectId') {
        newFilters.phaseId = '';
        newFilters.categoryId = '';
        newFilters.itemId = '';
        setPhases([]);
        setCategories([]);
        setItems([]);
        if (value) fetchPhases(value);
      } else if (key === 'phaseId') {
        newFilters.categoryId = '';
        newFilters.itemId = '';
        setCategories([]);
        setItems([]);
        if (value) fetchCategories(value);
      } else if (key === 'categoryId') {
        newFilters.itemId = '';
        setItems([]);
        if (value) fetchItems(value);
      }
      
      return newFilters;
    });
    
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const updatePagination = (key, value) => {
    setPagination(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      projectId: '',
      phaseId: '',
      categoryId: '',
      itemId: '',
      vendorId: '',
      startDate: '',
      endDate: '',
    });
    setPhases([]);
    setCategories([]);
    setItems([]);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const fetchAllPurchasesForExport = async () => {
    return await fetchPurchases(true);
  };

  return {
    purchases,
    projects,
    phases,
    categories,
    items,
    vendors,
    loading,
    error,
    filters,
    pagination,
    summary,
    updateFilter,
    updatePagination,
    resetFilters,
    fetchAllPurchasesForExport,
  };
}
