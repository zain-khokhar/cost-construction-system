/**
 * Reusable hook for managing edit operations
 * @param {Function} setFormData - Function to update form data
 * @param {Function} openForm - Function to open the form for specific entity type
 * @returns {Object} Edit handlers for different entities
 */
export function useEditHandlers(setFormData, openForm) {
  const handleEditPhase = (phase) => {
    setFormData({
      name: phase.name,
      description: phase.description || '',
      _id: phase._id
    });
    openForm('phases');
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      phaseId: category.phaseId?._id || category.phaseId,
      _id: category._id
    });
    openForm('categories');
  };

  const handleEditItem = (item) => {
    setFormData({
      name: item.name,
      unit: item.unit,
      ratePerUnit: item.ratePerUnit,
      categoryId: item.categoryId?._id || item.categoryId,
      defaultVendor: item.defaultVendor?._id || item.defaultVendor || '',
      _id: item._id
    });
    openForm('items');
  };

  const handleEditPurchase = (purchase) => {
    setFormData({
      phaseId: purchase.phaseId?._id || purchase.phaseId || '',
      categoryId: purchase.categoryId?._id || purchase.categoryId || '',
      itemId: purchase.itemId?._id || purchase.itemId,
      vendorId: purchase.vendorId?._id || purchase.vendorId || '',
      quantity: purchase.quantity,
      pricePerUnit: purchase.pricePerUnit,
      purchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate).toISOString().split('T')[0] : '',
      invoiceUrl: purchase.invoiceUrl || '',
      _id: purchase._id
    });
    openForm('purchases');
  };

  return {
    handleEditPhase,
    handleEditCategory,
    handleEditItem,
    handleEditPurchase,
  };
}
