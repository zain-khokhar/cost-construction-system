import { useState } from 'react';

/**
 * Hook for managing confirmation modal state
 * @returns {Object} Modal state and handlers
 */
export function useConfirmModal() {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    title: '',
    resolver: null,
  });

  const confirmDelete = (message, title = 'Confirm Delete') => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        title,
        resolver: resolve,
      });
    });
  };

  const handleConfirm = () => {
    if (confirmState.resolver) {
      confirmState.resolver(true);
    }
    setConfirmState({ isOpen: false, message: '', title: '', resolver: null });
  };

  const handleCancel = () => {
    if (confirmState.resolver) {
      confirmState.resolver(false);
    }
    setConfirmState({ isOpen: false, message: '', title: '', resolver: null });
  };

  return {
    confirmState,
    confirmDelete,
    handleConfirm,
    handleCancel,
  };
}
