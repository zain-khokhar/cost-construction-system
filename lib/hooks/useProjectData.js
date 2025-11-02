import { useState, useEffect, useCallback } from 'react';

export function useProjectData(projectId) {
  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination states for each tab
  const [phasesPagination, setPhasesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [categoriesPagination, setCategoriesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [itemsPagination, setItemsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [purchasesPagination, setPurchasesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Fetch functions with pagination
  const fetchPhases = useCallback(async (page = 1, limit = 10) => {
    try {
      const res = await fetch(`/api/phases?projectId=${projectId}&page=${page}&limit=${limit}`);
      const data = await res.json();
      if (data.ok) {
        setPhases(data.data.phases);
        if (data.data.pagination) {
          setPhasesPagination(data.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch phases:', err);
      setError('Failed to load phases');
    }
  }, [projectId]);

  const fetchCategories = useCallback(async (page = 1, limit = 10, phaseId = null) => {
    try {
      let url = `/api/categories?page=${page}&limit=${limit}`;
      if (phaseId) url += `&phaseId=${phaseId}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        setCategories(data.data.categories);
        if (data.data.pagination) {
          setCategoriesPagination(data.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    }
  }, []);

  const fetchItems = useCallback(async (page = 1, limit = 10, categoryId = null) => {
    try {
      let url = `/api/items?page=${page}&limit=${limit}`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        setItems(data.data.items);
        if (data.data.pagination) {
          setItemsPagination(data.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('Failed to load items');
    }
  }, []);

  const fetchAllItems = useCallback(async (page = 1, limit = 10) => {
    await fetchItems(page, limit, null);
  }, [fetchItems]);

  const fetchPurchases = useCallback(async (page = 1, limit = 10) => {
    try {
      const res = await fetch(`/api/purchases?projectId=${projectId}&page=${page}&limit=${limit}`);
      const data = await res.json();
      if (data.ok) {
        setPurchases(data.data.purchases);
        if (data.data.pagination) {
          setPurchasesPagination(data.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
      setError('Failed to load purchases');
    }
  }, [projectId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projectRes, vendorsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch('/api/vendors'),
      ]);

      const [projectData, vendorsData] = await Promise.all([
        projectRes.json(),
        vendorsRes.json(),
      ]);

      if (projectData.ok) setProject(projectData.data.project);
      if (vendorsData.ok) setVendors(vendorsData.data.vendors);

      // Fetch paginated data for each tab
      await Promise.all([
        fetchPhases(),
        fetchCategories(),
        fetchAllItems(),
        fetchPurchases(),
      ]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [projectId, fetchPhases, fetchCategories, fetchAllItems, fetchPurchases]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    project,
    phases,
    categories,
    items,
    purchases,
    vendors,
    loading,
    error,
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
    setPhasesPagination,
    setCategoriesPagination,
    setItemsPagination,
    setPurchasesPagination,
  };
}
