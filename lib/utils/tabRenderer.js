import PhaseTab from '@/components/project/PhaseTab';
import CategoryTab from '@/components/project/CategoryTab';
import ItemTab from '@/components/project/ItemTab';
import PurchaseTab from '@/components/project/PurchaseTab';

/**
 * Renders the appropriate tab based on activeTab
 */
export function renderTabContent(config) {
  const {
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
  } = config;

  switch (activeTab) {
    case 'phases':
      return (
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
          onPageChange={phasesPaginator.handlePageChange}
          onItemsPerPageChange={phasesPaginator.handleItemsPerPageChange}
          selectedPhases={phasesSelection.selected}
          onSelectAll={phasesSelection.handleSelectAll}
          onSelectPhase={phasesSelection.handleSelect}
          onEdit={editHandlers.handleEditPhase}
          onDelete={handleDeletePhase}
          canEdit={canCreate}
        />
      );

    case 'categories':
      return (
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
          onPageChange={categoriesPaginator.handlePageChange}
          onItemsPerPageChange={categoriesPaginator.handleItemsPerPageChange}
          selectedCategories={categoriesSelection.selected}
          onSelectAll={categoriesSelection.handleSelectAll}
          onSelectCategory={categoriesSelection.handleSelect}
          onEdit={editHandlers.handleEditCategory}
          onDelete={handleDeleteCategory}
          canEdit={canCreate}
        />
      );

    case 'items':
      return (
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
          onPageChange={itemsPaginator.handlePageChange}
          onItemsPerPageChange={itemsPaginator.handleItemsPerPageChange}
          selectedItems={itemsSelection.selected}
          onSelectAll={itemsSelection.handleSelectAll}
          onSelectItem={itemsSelection.handleSelect}
          onEdit={editHandlers.handleEditItem}
          onDelete={handleDeleteItem}
          canEdit={canCreate}
        />
      );

    case 'purchases':
      return (
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
          onPhaseChange={purchaseRelations.handlePhaseChange}
          onCategoryChange={purchaseRelations.handleCategoryChange}
          onPageChange={purchasesPaginator.handlePageChange}
          onItemsPerPageChange={purchasesPaginator.handleItemsPerPageChange}
          selectedPurchases={purchasesSelection.selected}
          onSelectAll={purchasesSelection.handleSelectAll}
          onSelectPurchase={purchasesSelection.handleSelect}
          onEdit={editHandlers.handleEditPurchase}
          onDelete={handleDeletePurchase}
          canEdit={canCreateExpense}
        />
      );

    default:
      return null;
  }
}
