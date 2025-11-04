import { useState, useEffect } from 'react';

/**
 * Custom hook to check user permissions on the client side
 * Usage: const { user, hasPermission, isAdmin, isManager, isViewer } = usePermissions();
 */
export function usePermissions() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Define permissions (matching backend)
    const PERMISSIONS = {
      PROJECT_CREATE: ['admin'],
      PROJECT_UPDATE: ['admin'],
      PROJECT_DELETE: ['admin'],
      
      BUDGET_CREATE: ['admin'],
      BUDGET_UPDATE: ['admin'],
      BUDGET_DELETE: ['admin'],
      
      EXPENSE_CREATE: ['admin', 'manager'],
      EXPENSE_UPDATE: ['admin', 'manager'],
      EXPENSE_DELETE: ['admin', 'manager'],
      
      PHASE_CREATE: ['admin'],
      PHASE_UPDATE: ['admin'],
      PHASE_DELETE: ['admin'],
      
      CATEGORY_CREATE: ['admin'],
      CATEGORY_UPDATE: ['admin'],
      CATEGORY_DELETE: ['admin'],
      
      ITEM_CREATE: ['admin'],
      ITEM_UPDATE: ['admin'],
      ITEM_DELETE: ['admin'],
      
      VENDOR_CREATE: ['admin'],
      VENDOR_UPDATE: ['admin'],
      VENDOR_DELETE: ['admin'],
    };

    const allowedRoles = PERMISSIONS[permission];
    return allowedRoles ? allowedRoles.includes(user.role) : false;
  };

  return {
    user,
    loading,
    hasPermission,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isViewer: user?.role === 'viewer',
    canCreate: user?.role === 'admin', // Only admin can create most things
    canCreateExpense: user?.role === 'admin' || user?.role === 'manager', // Admin and Manager can log expenses
  };
}
