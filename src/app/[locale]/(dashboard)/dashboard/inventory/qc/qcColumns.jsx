'use client';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const useQCColumns = () => {
  return [
    /* Sr No */
    {
      id: 'srNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sr." />
      ),
      cell: ({ row }) => row.index + 1,
    },

    /* SKU ID */
    {
      accessorKey: 'skuId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU ID" />
      ),
      cell: ({ row }) => row.original?.metaData?.productDetails?.skuId || '--',
    },

    /* Item Name */
    {
      accessorKey: 'itemName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item Name" />
      ),
      cell: ({ row }) =>
        row.original?.metaData?.productDetails?.productName || '--',
    },

    /* Qty Received */
    {
      accessorKey: 'totalQuantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty Received" />
      ),
      cell: ({ row }) => row.original?.totalQuantity ?? 0,
    },

    /* Qty Accepted */
    {
      accessorKey: 'qcPassedQuantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty Accepted" />
      ),
      cell: ({ row }) => row.original?.qcPassedQuantity ?? 0,
    },

    /* Qty Rejected */
    {
      accessorKey: 'qcFailedQuantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty Rejected" />
      ),
      cell: ({ row }) => row.original?.qcFailedQuantity ?? 0,
    },

    /* QC Status */
    {
      accessorKey: 'qcStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QC Status" />
      ),
      cell: ({ row }) => {
        const status = row.original?.qcStatus;

        return <ConditionalRenderingStatus status={status} />;
      },
    },
  ];
};
