import { useAuth } from '../context/AuthContext';

export const usePermission = () => {
  const { permissions } = useAuth();

  const hasPermission = (code) => {
    if (!permissions || permissions.length === 0) return false;
    return permissions.some(
      (perm) => perm.code === code && perm.isDeleted === false,
    );
  };

  const hasAnyPermission = (codes = []) => {
    return codes.some((code) => hasPermission(code));
  };

  return { hasPermission, hasAnyPermission };
};
