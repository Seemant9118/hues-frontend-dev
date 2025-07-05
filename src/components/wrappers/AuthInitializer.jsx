'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const exampleRolesAndPermissions = {
  role: 'DIRECTOR-MANAGER',
  permissions: [
    // dashboard permissions
    {
      code: 'permission:view-dashboard',
      displayName: 'Dashboard Access',
      description: 'Dashboard Access',
      isAllowed: true,
      isDeleted: false,
    },
    // item masters permissions
    {
      code: 'permission:item-masters-view',
      displayName: 'Item Masters View',
      description: 'Item Masters View',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:item-masters-create',
      displayName: 'Item Masters Create',
      description: 'Item Masters Create',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:item-masters-edit',
      displayName: 'Item Masters Edit',
      description: 'Item Masters Edit',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:item-masters-delete',
      displayName: 'Item Masters Delete',
      description: 'Item Masters Delete',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:item-masters-download',
      displayName: 'Item Masters Download',
      description: 'Item Masters Download',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:item-masters-upload',
      displayName: 'Item Masters Upload',
      description: 'Item Masters Upload',
      isAllowed: true,
      isDeleted: false,
    },
    // sales permissions
    {
      code: 'permission:sales-view',
      displayName: 'Sales View',
      description: 'Sales View',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:sales-create',
      displayName: 'Sales Create',
      description: 'Sales Create',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:sales-edit',
      displayName: 'Sales Edit',
      description: 'Sales Edit',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:sales-delete',
      displayName: 'Sales Delete',
      description: 'Sales Delete',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:sales-download',
      displayName: 'Sales Download',
      description: 'Sales Download',
      isAllowed: true,
      isDeleted: false,
    },
  ],
};

export default function AuthInitializer() {
  const { setAuthData } = useAuth();

  useEffect(() => {
    // Simulate API call

    setAuthData(
      exampleRolesAndPermissions.role,
      exampleRolesAndPermissions.permissions,
    );
  }, []);

  return null; // No UI
}
