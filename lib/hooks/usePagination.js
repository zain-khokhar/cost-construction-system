/**
 * Hook for managing pagination handlers for an entity
 * @param {Function} fetchFunction - Function to fetch data with pagination
 * @param {Object} pagination - Pagination state object
 * @returns {Object} Pagination handlers
 */
export function usePagination(fetchFunction, pagination) {
  const handlePageChange = (page) => {
    fetchFunction(page, pagination.itemsPerPage);
  };

  const handleItemsPerPageChange = (limit) => {
    fetchFunction(1, limit);
  };

  return {
    handlePageChange,
    handleItemsPerPageChange,
  };
}
