'use client';

import { getRoleDisplayName } from '@/lib/roles';

/**
 * RoleBadge - Display role with appropriate styling
 * @param {string} role - User role (admin, manager, viewer)
 * @param {string} size - Size variant (sm, md, lg)
 * @param {boolean} showDescription - Whether to show role description
 */
export default function RoleBadge({ role, size = 'md', showDescription = false }) {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const getDescription = (role) => {
    const descriptions = {
      admin: 'Full access - create projects, budgets, manage users',
      manager: 'Log expenses, manage purchases',
      viewer: 'Read-only access',
    };
    return descriptions[role] || '';
  };

  return (
    <div className="inline-flex flex-col">
      <span
        className={`
          inline-flex items-center font-medium rounded-full border
          ${getRoleColor(role)}
          ${getSizeClasses(size)}
        `}
      >
        {getRoleDisplayName(role)}
      </span>
      {showDescription && (
        <span className="text-xs text-gray-500 mt-1">{getDescription(role)}</span>
      )}
    </div>
  );
}
