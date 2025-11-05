/**
 * Reusable hook for managing delete operations
 * @param {Function} confirmDelete - Function to show confirmation modal
 * @returns {Object} Delete handlers for different entities
 */
export function useDeleteHandlers(confirmDelete) {
  const createDeleteHandler = (config) => {
    const { apiPath, entityName, onSuccess, onRemoveFromSelection, confirmMessage } = config;

    return async (itemId) => {
      const confirmed = await confirmDelete(
        confirmMessage || `Are you sure you want to delete this ${entityName}?`
      );

      if (!confirmed) return;

      try {
        const res = await fetch(`${apiPath}/${itemId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        const data = await res.json();

        if (data.ok) {
          await onSuccess();
          onRemoveFromSelection?.(itemId);
        } else {
          alert(data.error?.message || `Failed to delete ${entityName}`);
        }
      } catch (error) {
        console.error(`Delete ${entityName} error:`, error);
        alert(`Failed to delete ${entityName}`);
      }
    };
  };

  return {
    createDeleteHandler,
  };
}
