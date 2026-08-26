'use client';

import { usePermission } from '@/hooks/usePermissions';
import AccessDenied from '../shared/AccessDenied';

export const ProtectedWrapper = ({ permissionCode, permission, children }) => {
  const { hasPermission } = usePermission();
  const code = permissionCode || permission || '';

  return hasPermission(code) ? (
    children
  ) : code.includes('view') || code.includes('manage') ? (
    <AccessDenied />
  ) : null;
};
