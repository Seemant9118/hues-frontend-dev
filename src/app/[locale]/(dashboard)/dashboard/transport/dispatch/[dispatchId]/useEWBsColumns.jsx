'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

export const useEWBsColumns = () => {
  const t = useTranslations(
    'transport.dispatched-notes.dispatch_details.tabs.tab4.table',
  );

  return [
    {
      accessorKey: 'ewbNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.ewbNo')} />
      ),
      cell: ({ row }) => row.original.ewbNo,
    },

    {
      accessorKey: 'ewayBillDate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.ewayBillDate')}
        />
      ),
    },

    {
      accessorKey: 'fromTrdName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.from')} />
      ),
      cell: ({ row }) => row.original.fromTrdName || '--',
    },

    {
      accessorKey: 'toTrdName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.to')} />
      ),
      cell: ({ row }) => row.original.toTrdName || '--',
    },

    {
      accessorKey: 'totalValue',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.totalValue')} />
      ),
      cell: ({ row }) => row.original.totalValue,
    },

    {
      accessorKey: 'totInvValue',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.invoiceValue')}
        />
      ),
      cell: ({ row }) => row.original.totInvValue,
    },

    {
      accessorKey: 'transporterName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.transporter')}
        />
      ),
      cell: ({ row }) => row.original.transporterName || '--',
    },

    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.status')} />
      ),
      cell: ({ row }) => row.original.status,
    },

    {
      accessorKey: 'noValidDays',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.noValidDays')}
        />
      ),
      cell: ({ row }) => row.original.noValidDays,
    },

    {
      accessorKey: 'vehicleType',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.vehicleType')}
        />
      ),
      cell: ({ row }) => row.original.vehicleType || '--',
    },
  ];
};
