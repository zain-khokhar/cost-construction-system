import { useState } from 'react';

/**
 * Reusable hook for managing item selections
 * @param {Array} items - Array of items to manage selections for
 * @returns {Object} Selection state and handlers
 */
export function useSelection(items = []) {
  const [selected, setSelected] = useState([]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelected(items.map(item => item._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (itemId, checked) => {
    if (checked) {
      setSelected([...selected, itemId]);
    } else {
      setSelected(selected.filter(id => id !== itemId));
    }
  };

  const clearSelection = () => {
    setSelected([]);
  };

  const removeFromSelection = (itemId) => {
    setSelected(selected.filter(id => id !== itemId));
  };

  return {
    selected,
    handleSelectAll,
    handleSelect,
    clearSelection,
    removeFromSelection,
  };
}
