/**
 * Hook for managing purchase form relationships (phase -> category -> item)
 * @param {Object} formData - Current form data
 * @param {Function} setFormData - Function to update form data
 * @param {Function} fetchCategories - Function to fetch categories for a phase
 * @param {Function} fetchItems - Function to fetch items for a category
 * @returns {Object} Handlers for cascading selections
 */
export function usePurchaseRelations(formData, setFormData, fetchCategories, fetchItems) {
  const handlePhaseChange = (e) => {
    const phaseId = e.target.value;
    setFormData({ ...formData, phaseId, categoryId: '', itemId: '' });
    if (phaseId) {
      fetchCategories(1, 10, phaseId);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFormData({ ...formData, categoryId, itemId: '' });
    if (categoryId) {
      fetchItems(1, 10, categoryId);
    }
  };

  return {
    handlePhaseChange,
    handleCategoryChange,
  };
}
