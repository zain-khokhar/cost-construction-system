import { ApiError } from './errors.js';
import { hasPermission, hasRole, PERMISSIONS } from './roles.js';

/**
 * Middleware to check if user has required permission
 * Usage: await requirePermission(user, 'PROJECT_CREATE')
 */
export function requirePermission(user, permission) {
  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!hasPermission(user.role, permission)) {
    throw new ApiError(403, `Insufficient permissions. Required: ${permission}`);
  }

  return true;
}

/**
 * Middleware to check if user has required role
 * Usage: await requireRoleLevel(user, 'admin')
 */
export function requireRoleLevel(user, requiredRole) {
  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!hasRole(user.role, requiredRole)) {
    throw new ApiError(403, `Insufficient role. Required: ${requiredRole}, Current: ${user.role}`);
  }

  return true;
}

/**
 * Helper to check if user can perform action on resource
 * Ensures user can only access their company's data
 */
export function canAccessResource(user, resource) {
  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }

  // Admin and Manager can access all company resources
  // Viewer can only view
  if (resource.companyId && resource.companyId.toString() !== user.companyId.toString()) {
    throw new ApiError(403, 'Access denied to this resource');
  }

  return true;
}

/**
 * Check multiple permissions (OR logic - user needs at least one)
 */
export function requireAnyPermission(user, permissions) {
  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }

  const hasAny = permissions.some(permission => hasPermission(user.role, permission));
  
  if (!hasAny) {
    throw new ApiError(403, `Insufficient permissions. Required one of: ${permissions.join(', ')}`);
  }

  return true;
}

/**
 * Check multiple permissions (AND logic - user needs all)
 */
export function requireAllPermissions(user, permissions) {
  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }

  const hasAll = permissions.every(permission => hasPermission(user.role, permission));
  
  if (!hasAll) {
    throw new ApiError(403, `Insufficient permissions. Required all of: ${permissions.join(', ')}`);
  }

  return true;
}

/**
 * Export PERMISSIONS for easy import
 */
export { PERMISSIONS };
