'use client';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const usePODColumns = ({ isSeller }) => {
  const t = useTranslations(
    'transport.delivery-challan.delivery_challan_details.tabs.tab5.table',
  );

  return [
    /* POD Reference Number */
    {
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.podId')} />
      ),
      cell: ({ row }) => row.original?.referenceNumber ?? '--',
    },

    /* Status */
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.status')} />
      ),
      cell: ({ row }) => (
        <ConditionalRenderingStatus
          isSeller={isSeller}
          isPOD
          status={row.original?.status}
        />
      ),
    },

    /* Created At */
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.original?.createdAt;
        return createdAt ? moment(createdAt).format('DD/MM/YYYY') : '--';
      },
    },

    /* Items Count */
    {
      accessorKey: 'items',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.items')} />
      ),
      cell: ({ row }) => {
        const items = row.original?.items;
        return Array.isArray(items) ? items.length : 0;
      },
    },
  ];
};
