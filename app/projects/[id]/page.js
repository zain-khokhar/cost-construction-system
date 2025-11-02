'use client';

import { useState } from 'react';
import { use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProjectHeader from '@/components/project/ProjectHeader';
import PhaseTab from '@/components/project/PhaseTab';
import CategoryTab from '@/components/project/CategoryTab';
import ItemTab from '@/components/project/ItemTab';
import PurchaseTab from '@/components/project/PurchaseTab';
import ExportModal from '@/components/ui/ExportModal';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useProjectData } from '@/lib/hooks/useProjectData';
import { useProjectForms } from '@/lib/hooks/useProjectForms';

export default function ProjectDetailPage({ params }) {
  const { id } = use(params);
  const { canCreate, canCreateExpense, loading: permissionsLoading } = usePermissions();
  
  // Custom hooks for data and form management
  const {
    project,
    phases,
    categories,
    items,
    purchases,
    vendors,
    loading,
    error: dataError,
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
  } = useProjectData(id);

  const {
    showForm,
    formData,
    error: formError,
    loading: formLoading,
    setFormData,
    toggleForm,
    handlePhaseSubmit,
    handleCategorySubmit,
    handleItemSubmit,
    handlePurchaseSubmit,
  } = useProjectForms(id, { 
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
  });

  // Local state
  const [activeTab, setActiveTab] = useState('phases');
  const [exportModal, setExportModal] = useState({ isOpen: false, type: '', title: '' });
  
  // Selection state for each tab
  const [selectedPhases, setSelectedPhases] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedPurchases, setSelectedPurchases] = useState([]);

  // Tab configurations
  const tabs = [
    { id: 'phases', label: 'Phases', permission: canCreate },
    { id: 'categories', label: 'Categories', permission: canCreate },
    { id: 'items', label: 'Items', permission: canCreate },
    { id: 'purchases', label: 'Purchases', permission: canCreateExpense },
  ];

  // Export modal handlers
  const openExportModal = () => {
    const title = `Export ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`;
    setExportModal({ isOpen: true, type: activeTab, title });
  };

  const closeExportModal = () => {
    setExportModal({ isOpen: false, type: '', title: '' });
  };

  // Purchase form specific handlers
  const handlePurchasePhaseChange = (e) => {
    const phaseId = e.target.value;
    setFormData({ ...formData, phaseId });
    fetchCategories(1, 10, phaseId);
  };

  const handlePurchaseCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFormData({ ...formData, categoryId });
    fetchItems(1, 10, categoryId);
  };

  // Pagination handlers
  const handlePhasesPageChange = (page) => {
    fetchPhases(page, phasesPagination.itemsPerPage);
  };

  const handlePhasesItemsPerPageChange = (limit) => {
    fetchPhases(1, limit);
  };

  const handleCategoriesPageChange = (page) => {
    fetchCategories(page, categoriesPagination.itemsPerPage);
  };

  const handleCategoriesItemsPerPageChange = (limit) => {
    fetchCategories(1, limit);
  };

  const handleItemsPageChange = (page) => {
    fetchAllItems(page, itemsPagination.itemsPerPage);
  };

  const handleItemsItemsPerPageChange = (limit) => {
    fetchAllItems(1, limit);
  };

  const handlePurchasesPageChange = (page) => {
    fetchPurchases(page, purchasesPagination.itemsPerPage);
  };

  const handlePurchasesItemsPerPageChange = (limit) => {
    fetchPurchases(1, limit);
  };

  // Selection handlers for Phases
  const handleSelectAllPhases = (checked) => {
    if (checked) {
      setSelectedPhases(phases.map(p => p._id));
    } else {
      setSelectedPhases([]);
    }
  };

  const handleSelectPhase = (phaseId, checked) => {
    if (checked) {
      setSelectedPhases([...selectedPhases, phaseId]);
    } else {
      setSelectedPhases(selectedPhases.filter(id => id !== phaseId));
    }
  };

  // Selection handlers for Categories
  const handleSelectAllCategories = (checked) => {
    if (checked) {
      setSelectedCategories(categories.map(c => c._id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId, checked) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    }
  };

  // Selection handlers for Items
  const handleSelectAllItems = (checked) => {
    if (checked) {
      setSelectedItems(items.map(i => i._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  // Selection handlers for Purchases
  const handleSelectAllPurchases = (checked) => {
    if (checked) {
      setSelectedPurchases(purchases.map(p => p._id));
    } else {
      setSelectedPurchases([]);
    }
  };

  const handleSelectPurchase = (purchaseId, checked) => {
    if (checked) {
      setSelectedPurchases([...selectedPurchases, purchaseId]);
    } else {
      setSelectedPurchases(selectedPurchases.filter(id => id !== purchaseId));
    }
  };

  // Loading state
  if (loading && !project) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) return null;

  const error = dataError || formError;

  return (
    <AppLayout>
      {/* Project Header */}
      <ProjectHeader 
        project={project} 
        activeTab={activeTab} 
        onExport={openExportModal}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 bg-white rounded-t-lg px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 capitalize font-medium transition-all ${
              activeTab === tab.id 
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'phases' && (
        <PhaseTab
          phases={phases}
          showForm={showForm.phases}
          formData={formData}
          loading={formLoading}
          canCreate={canCreate}
          permissionsLoading={permissionsLoading}
          pagination={phasesPagination}
          onToggleForm={() => toggleForm('phases')}
          onFormChange={setFormData}
          onSubmit={handlePhaseSubmit}
          onPageChange={handlePhasesPageChange}
          onItemsPerPageChange={handlePhasesItemsPerPageChange}
          selectedPhases={selectedPhases}
          onSelectAll={handleSelectAllPhases}
          onSelectPhase={handleSelectPhase}
        />
      )}

      {activeTab === 'categories' && (
        <CategoryTab
          categories={categories}
          phases={phases}
          showForm={showForm.categories}
          formData={formData}
          loading={formLoading}
          canCreate={canCreate}
          permissionsLoading={permissionsLoading}
          pagination={categoriesPagination}
          onToggleForm={() => toggleForm('categories')}
          onFormChange={setFormData}
          onSubmit={handleCategorySubmit}
          onPageChange={handleCategoriesPageChange}
          onItemsPerPageChange={handleCategoriesItemsPerPageChange}
          selectedCategories={selectedCategories}
          onSelectAll={handleSelectAllCategories}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {activeTab === 'items' && (
        <ItemTab
          items={items}
          categories={categories}
          vendors={vendors}
          showForm={showForm.items}
          formData={formData}
          loading={formLoading}
          canCreate={canCreate}
          permissionsLoading={permissionsLoading}
          pagination={itemsPagination}
          onToggleForm={() => toggleForm('items')}
          onFormChange={setFormData}
          onSubmit={handleItemSubmit}
          onPageChange={handleItemsPageChange}
          onItemsPerPageChange={handleItemsItemsPerPageChange}
          selectedItems={selectedItems}
          onSelectAll={handleSelectAllItems}
          onSelectItem={handleSelectItem}
        />
      )}

      {activeTab === 'purchases' && (
        <PurchaseTab
          purchases={purchases}
          phases={phases}
          categories={categories}
          items={items}
          vendors={vendors}
          showForm={showForm.purchases}
          formData={formData}
          loading={formLoading}
          canCreateExpense={canCreateExpense}
          permissionsLoading={permissionsLoading}
          pagination={purchasesPagination}
          onToggleForm={() => toggleForm('purchases')}
          onFormChange={setFormData}
          onSubmit={handlePurchaseSubmit}
          onPhaseChange={handlePurchasePhaseChange}
          onCategoryChange={handlePurchaseCategoryChange}
          onPageChange={handlePurchasesPageChange}
          onItemsPerPageChange={handlePurchasesItemsPerPageChange}
          selectedPurchases={selectedPurchases}
          onSelectAll={handleSelectAllPurchases}
          onSelectPurchase={handleSelectPurchase}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={closeExportModal}
        exportType={exportModal.type}
        projectId={id}
        title={exportModal.title}
      />
    </AppLayout>
  );
}
