'use client';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';

export const useGstColumns = () => {
  return [
    /* Context / Document Type */
    {
      accessorKey: 'context',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Document Type" />
      ),
      cell: ({ row }) => {
        const context = row.original?.context;
        if (!context) return '--';
        return context.replace('_', ' ');
      },
    },

    /* Period */
    {
      accessorKey: 'retPeriod',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Period" />
      ),
      cell: ({ row }) => {
        const period = row.original?.retPeriod; // MMYYYY
        return period ? moment(period, 'MMYYYY').format('MMMM YYYY') : '--';
      },
    },

    /* Section Type */
    {
      accessorKey: 'sectionType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Section" />
      ),
      cell: ({ row }) => row.original?.sectionType?.toUpperCase() || '--',
    },

    /* GSTIN */
    {
      accessorKey: 'gstin',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GSTIN" />
      ),
      cell: ({ row }) => row.original?.gstin || '--',
    },

    /* Reference ID */
    {
      accessorKey: 'referenceId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reference ID" />
      ),
      cell: ({ row }) => row.original?.referenceId || '--',
    },

    /* Filed On */
    {
      accessorKey: 'filedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Filed On" />
      ),
      cell: ({ row }) => {
        const filedAt = row.original?.filedAt;
        return filedAt ? moment(filedAt).format('DD MMM YYYY') : '--';
      },
    },

    /* Status */
    {
      accessorKey: 'isFiled',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isFiled = row.original?.isFiled;
        const status = isFiled ? 'Filed' : 'Pending';
        return <ConditionalRenderingStatus status={status} />;
      },
    },
  ];
};
