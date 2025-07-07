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
    {
      code: 'permission:sales-negotiation',
      displayName: 'Sales Negotiation',
      description: 'Sales Negotiation',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:sales-invoice-create',
      displayName: 'Sales Invoice Create',
      description: 'Sales Invoice Create',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:sales-document',
      displayName: 'Sales Document',
      description: 'Sales Document',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:sales-create-payment',
      displayName: 'Sales Create Payment',
      description: 'Sales Create Payment',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:sales-debit-note-action',
      displayName: 'Sales Debit Note Action',
      description: 'Sales Debit Note Action',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:sales-payments-action',
      displayName: 'Sales Payments Action',
      description: 'Sales Payments Action',
      isAllowed: true,
      isDeleted: false,
    },
    // purchase permissions
    {
      code: 'permission:purchase-view',
      displayName: 'Purchase View',
      description: 'Purchase View',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:purchase-create',
      displayName: 'Purchase Create',
      description: 'Purchase Create',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:purchase-edit',
      displayName: 'Purchase Edit',
      description: 'Purchase Edit',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:purchase-delete',
      displayName: 'Purchase Delete',
      description: 'Purchase Delete',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:purchase-download',
      displayName: 'Purchase Download',
      description: 'Purchase Download',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:purchase-negotiation',
      displayName: 'Purchase Negotiation',
      description: 'Purchase Negotiation',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:purchase-invoice-create',
      displayName: 'Purchase Invoice Create',
      description: 'Purchase Invoice Create',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:purchase-document',
      displayName: 'Purchase Document',
      description: 'Purchase Document',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:purchase-create-payment',
      displayName: 'Purchase Create Payment',
      description: 'Purchase Create Payment',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:purchase-debit-note-action',
      displayName: 'Purchase Debit Note Action',
      description: 'Purchase Debit Note Action',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:purchase-payments-action',
      displayName: 'Purchase Payments Action',
      description: 'Purchase Payments Action',
      isAllowed: true,
      isDeleted: false,
    },
    // clients permissions
    {
      code: 'permission:clients-view',
      displayName: 'Clients View',
      description: 'Clients View',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:clients-create',
      displayName: 'Clients Create',
      description: 'Clients Create',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:clients-edit',
      displayName: 'Clients Edit',
      description: 'Clients Edit',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:clients-delete',
      displayName: 'Clients Delete',
      description: 'Clients Delete',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:clients-download',
      displayName: 'Clients Download',
      description: 'Clients Download',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:clients-upload',
      displayName: 'Clients Upload',
      description: 'Clients Upload',
      isAllowed: true,
      isDeleted: false,
    },
    // vendors permissions
    {
      code: 'permission:vendors-view',
      displayName: 'Vendors View',
      description: 'Vendors View',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:vendors-create',
      displayName: 'Vendors Create',
      description: 'Vendors Create',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:vendors-edit',
      displayName: 'Vendors Edit',
      description: 'Vendors Edit',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:vendors-delete',
      displayName: 'Vendors Delete',
      description: 'Vendors Delete',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:vendors-download',
      displayName: 'Vendors Download',
      description: 'Vendors Download',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:vendors-upload',
      displayName: 'Vendors Upload',
      description: 'Vendors Upload',
      isAllowed: true,
      isDeleted: false,
    },
    // customers permissions
    {
      code: 'permission:customers-view',
      displayName: 'Customers View',
      description: 'Customers View',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:customers-create',
      displayName: 'Customers Create',
      description: 'Customers Create',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:customers-edit',
      displayName: 'Customers Edit',
      description: 'Customers Edit',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:customers-delete',
      displayName: 'Customers Delete',
      description: 'Customers Delete',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:customers-download',
      displayName: 'Customers Download',
      description: 'Customers Download',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:customers-upload',
      displayName: 'Customers Upload',
      description: 'Customers Upload',
      isAllowed: true,
      isDeleted: false,
    },
    // members permissions
    {
      code: 'permission:members-view',
      displayName: 'Members View',
      description: 'Members View',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:members-create',
      displayName: 'Members Create',
      description: 'Members Create',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:members-edit',
      displayName: 'Members Edit',
      description: 'Members Edit',
      isAllowed: true,
      isDeleted: false,
    },
    {
      code: 'permission:members-delete',
      displayName: 'Members Delete',
      description: 'Members Delete',
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
