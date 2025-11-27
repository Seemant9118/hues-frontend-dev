'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '@/api/rolesApi/rolesApi';
import { getPermissions } from '@/services/Roles_Services/Roles_Services';

export default function AuthInitializer() {
  const { setAuthData } = useAuth();

  // api call to fetch roles and permissions
  const { data: rolesAndPermissions } = useQuery({
    queryKey: rolesApi.getAllPermissions.endpointKey,
    queryFn: getPermissions,
    select: (data) => data.data.data,
  });

  useEffect(() => {
    if (!rolesAndPermissions) return;

    setAuthData(
      rolesAndPermissions?.userDetails?.name,
      rolesAndPermissions?.userDetails?.roles,
      rolesAndPermissions?.permissions,
    );
  }, [rolesAndPermissions]);

  return null; // No UI
}
