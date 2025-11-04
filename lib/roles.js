/**
 * Role-Based Access Control (RBAC) System
 * 
 * Roles:
 * - Admin: Full access - create projects, budgets, manage users, view all data
 * - Manager: Log expenses, manage purchases, view project data
 * - Viewer: Read-only access for clients/owners
 */

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer',
};

/**
 * Role hierarchy: Admin > Manager > Viewer
 */
const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.VIEWER]: 1,
};

/**
 * Permission definitions for each role
 */
export const PERMISSIONS = {
  // Project permissions
  PROJECT_CREATE: [ROLES.ADMIN],
  PROJECT_UPDATE: [ROLES.ADMIN],
  PROJECT_DELETE: [ROLES.ADMIN],
  PROJECT_VIEW: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  
  // Budget permissions
  BUDGET_CREATE: [ROLES.ADMIN],
  BUDGET_UPDATE: [ROLES.ADMIN],
  BUDGET_DELETE: [ROLES.ADMIN],
  BUDGET_VIEW: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  
  // Expense/Purchase permissions
  EXPENSE_CREATE: [ROLES.ADMIN, ROLES.MANAGER],
  EXPENSE_UPDATE: [ROLES.ADMIN, ROLES.MANAGER],
  EXPENSE_DELETE: [ROLES.ADMIN, ROLES.MANAGER],
  EXPENSE_VIEW: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  
  // Phase permissions
  PHASE_CREATE: [ROLES.ADMIN],
  PHASE_UPDATE: [ROLES.ADMIN],
  PHASE_DELETE: [ROLES.ADMIN],
  PHASE_VIEW: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  
  // Category permissions
  CATEGORY_CREATE: [ROLES.ADMIN],
  CATEGORY_UPDATE: [ROLES.ADMIN],
  CATEGORY_DELETE: [ROLES.ADMIN],
  CATEGORY_VIEW: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  
  // Item permissions
  ITEM_CREATE: [ROLES.ADMIN],
  ITEM_UPDATE: [ROLES.ADMIN],
  ITEM_DELETE: [ROLES.ADMIN],
  ITEM_VIEW: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  
  // Vendor permissions
  VENDOR_CREATE: [ROLES.ADMIN],
  VENDOR_UPDATE: [ROLES.ADMIN],
  VENDOR_DELETE: [ROLES.ADMIN],
  VENDOR_VIEW: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  
  // Report permissions
  REPORT_VIEW: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  REPORT_EXPORT: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  
  // User management permissions
  USER_CREATE: [ROLES.ADMIN],
  USER_UPDATE: [ROLES.ADMIN],
  USER_DELETE: [ROLES.ADMIN],
  USER_VIEW: [ROLES.ADMIN],
};

/**
 * Check if user role is Admin
 */
export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

/**
 * Check if user role is Manager or higher
 */
export function isManager(role) {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}

/**
 * Check if user role is Viewer or higher (all roles)
 */
export function isViewer(role) {
  return role === ROLES.ADMIN || role === ROLES.MANAGER || role === ROLES.VIEWER;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole, permission) {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Check if user role meets or exceeds required role
 */
export function hasRole(userRole, requiredRole) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Require specific role(s) - throws error if not authorized
 */
export function requireRole(userRole, requiredRoles) {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(userRole);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role) {
  const names = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.MANAGER]: 'Manager',
    [ROLES.VIEWER]: 'Viewer',
  };
  return names[role] || 'Unknown';
}

/**
 * Get role description
 */
export function getRoleDescription(role) {
  const descriptions = {
    [ROLES.ADMIN]: 'Full access - create projects, budgets, manage users, view all data',
    [ROLES.MANAGER]: 'Log expenses, manage purchases, view project data',
    [ROLES.VIEWER]: 'Read-only access for clients/owners',
  };
  return descriptions[role] || '';
}

/**
 * Legacy compatibility functions
 */
export function canAdmin(role) {
  return isAdmin(role);
}

export function canManager(role) {
  return isManager(role);
}

export function canViewer(role) {
  return isViewer(role);
}
