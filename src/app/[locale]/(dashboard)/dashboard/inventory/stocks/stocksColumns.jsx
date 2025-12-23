'use client';

import { getValueForMovementType } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const useStocksColumns = () => {
  return [
    /* Stock ID */
    {
      accessorKey: 'stockId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock ID" />
      ),
      cell: ({ row }) => row.original?.referenceNumber || '--',
    },

    /* GRN ID */
    {
      accessorKey: 'grnId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GRN ID" />
      ),
      cell: ({ row }) => row.original?.grns?.[0]?.referenceNumber || '--',
    },

    /* Doc Type */
    {
      accessorKey: 'documentType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Doc Type" />
      ),
      cell: ({ row }) =>
        getValueForMovementType(row.original?.grns?.[0]?.movementType),
    },

    /* Client/Vendor name */
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vendor Name" />
      ),
      cell: ({ row }) =>
        row.original?.grns?.[0]?.metaData?.sellerDetails?.name ?? 0,
    },

    /* Total */
    {
      accessorKey: 'total',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => row.original?.totalItems ?? 0,
    },

    /* QC Status */
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original?.status;

        return <ConditionalRenderingStatus status={status} isQC />;
      },
    },
  ];
};
