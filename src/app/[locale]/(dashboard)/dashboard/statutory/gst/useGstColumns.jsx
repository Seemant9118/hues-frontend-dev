'use client';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';

export const useGstColumns = () => {
  return [
    /* Return Type */
    {
      accessorKey: 'returnType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Return Type" />
      ),
      cell: ({ row }) => row.original?.returnType || '--',
    },

    /* Period */
    {
      accessorKey: 'period',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Period" />
      ),
      cell: ({ row }) => {
        const period = row.original?.period; // MMYYYY
        return period ? moment(period, 'MMYYYY').format('MMMM YYYY') : '--';
      },
    },

    /* GSTIN */
    {
      accessorKey: 'gstin',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GSTIN" />
      ),
      cell: ({ row }) => row.original?.gstin || '--',
    },

    /* Filed On */
    {
      accessorKey: 'filedOn',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Filed On" />
      ),
      cell: ({ row }) => {
        const filedOn = row.original?.filedOn;
        return filedOn ? moment(filedOn).format('DD MMM YYYY') : '--';
      },
    },

    /* ARN */
    {
      accessorKey: 'arn',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ARN" />
      ),
      cell: ({ row }) => row.original?.arn || '--',
    },

    /* Status */
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original?.status;
        return status ? <ConditionalRenderingStatus status={status} /> : '--';
      },
    },
  ];
};
