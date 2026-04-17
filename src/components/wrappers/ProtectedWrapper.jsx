'use client';

import { usePermission } from '@/hooks/usePermissions';
import AccessDenied from '../shared/AccessDenied';

export const ProtectedWrapper = ({ permissionCode, children }) => {
  const { hasPermission } = usePermission();

  return hasPermission(permissionCode) ? (
    children
  ) : permissionCode.includes('view') ? (
    <AccessDenied />
  ) : null;
};
