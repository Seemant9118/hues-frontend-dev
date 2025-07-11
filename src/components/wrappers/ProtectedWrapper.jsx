import { usePermission } from '@/hooks/usePermissions';

export const ProtectedWrapper = ({ permissionCode, children }) => {
  const { hasPermission } = usePermission();

  return hasPermission(permissionCode) ? children : null;
};
