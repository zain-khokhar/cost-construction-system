'use client';

import { useState } from 'react';
import { use } from 'react';
import ProjectHeader from '@/components/project/ProjectHeader';
import ExportModal from '@/components/ui/ExportModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useProjectData } from '@/lib/hooks/useProjectData';
import { useProjectForms } from '@/lib/hooks/useProjectForms';
import { useSelection } from '@/lib/hooks/useSelection';
import { useDeleteHandlers } from '@/lib/hooks/useDeleteHandlers';
import { useEditHandlers } from '@/lib/hooks/useEditHandlers';
import { usePurchaseRelations } from '@/lib/hooks/usePurchaseRelations';
import { usePagination } from '@/lib/hooks/usePagination';
import { useConfirmModal } from '@/lib/hooks/useConfirmModal';
import { renderTabContent } from '@/lib/utils/tabRenderer';

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
    openForm,
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

  // Confirmation modal
  const { confirmState, confirmDelete, handleConfirm, handleCancel } = useConfirmModal();

  // Selection management
  const phasesSelection = useSelection(phases);
  const categoriesSelection = useSelection(categories);
  const itemsSelection = useSelection(items);
  const purchasesSelection = useSelection(purchases);

  // Delete handlers
  const { createDeleteHandler } = useDeleteHandlers(confirmDelete);

  const handleDeletePhase = createDeleteHandler({
    apiPath: '/api/phases',
    entityName: 'phase',
    confirmMessage: 'Are you sure you want to delete this phase? This will also delete all associated categories and items.',
    onSuccess: () => fetchPhases(phasesPagination.currentPage, phasesPagination.itemsPerPage),
    onRemoveFromSelection: phasesSelection.removeFromSelection,
  });

  const handleDeleteCategory = createDeleteHandler({
    apiPath: '/api/categories',
    entityName: 'category',
    confirmMessage: 'Are you sure you want to delete this category? This will also delete all associated items.',
    onSuccess: () => fetchCategories(categoriesPagination.currentPage, categoriesPagination.itemsPerPage),
    onRemoveFromSelection: categoriesSelection.removeFromSelection,
  });

  const handleDeleteItem = createDeleteHandler({
    apiPath: '/api/items',
    entityName: 'item',
    onSuccess: () => fetchAllItems(itemsPagination.currentPage, itemsPagination.itemsPerPage),
    onRemoveFromSelection: itemsSelection.removeFromSelection,
  });

  const handleDeletePurchase = createDeleteHandler({
    apiPath: '/api/purchases',
    entityName: 'purchase',
    onSuccess: () => fetchPurchases(purchasesPagination.currentPage, purchasesPagination.itemsPerPage),
    onRemoveFromSelection: purchasesSelection.removeFromSelection,
  });

  // Edit handlers
  const editHandlers = useEditHandlers(setFormData, openForm);

  // Purchase relations
  const purchaseRelations = usePurchaseRelations(formData, setFormData, fetchCategories, fetchItems);

  // Pagination handlers
  const phasesPaginator = usePagination(fetchPhases, phasesPagination);
  const categoriesPaginator = usePagination(fetchCategories, categoriesPagination);
  const itemsPaginator = usePagination(fetchAllItems, itemsPagination);
  const purchasesPaginator = usePagination(fetchPurchases, purchasesPagination);

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

  // Loading state
  if (loading && !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const error = dataError || formError;

  return (
    <div>
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
            className={`px-6 py-3 capitalize font-medium transition-all ${activeTab === tab.id
              ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent({
        activeTab,
        phases,
        categories,
        items,
        purchases,
        vendors,
        showForm,
        formData,
        formLoading,
        canCreate,
        canCreateExpense,
        permissionsLoading,
        phasesPagination,
        categoriesPagination,
        itemsPagination,
        purchasesPagination,
        toggleForm,
        setFormData,
        handlePhaseSubmit,
        handleCategorySubmit,
        handleItemSubmit,
        handlePurchaseSubmit,
        phasesSelection,
        categoriesSelection,
        itemsSelection,
        purchasesSelection,
        editHandlers,
        handleDeletePhase,
        handleDeleteCategory,
        handleDeleteItem,
        handleDeletePurchase,
        phasesPaginator,
        categoriesPaginator,
        itemsPaginator,
        purchasesPaginator,
        purchaseRelations,
      })}

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={closeExportModal}
        exportType={exportModal.type}
        projectId={id}
        title={exportModal.title}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
      />
    </div>
  );
}
