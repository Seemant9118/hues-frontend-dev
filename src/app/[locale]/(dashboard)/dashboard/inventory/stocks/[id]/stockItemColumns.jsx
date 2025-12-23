'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';

export const useStockItemsColumns = () => {
  return [
    /* SKU ID */
    {
      accessorKey: 'skuId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU ID" />
      ),
      cell: ({ row }) => row.original?.skuId || '--',
    },

    /* Item Name */
    {
      accessorKey: 'itemName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item Name" />
      ),
      cell: ({ row }) => row.original?.name || '--',
    },

    /* Total Quantity */
    {
      accessorKey: 'totalQuantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Quantity" />
      ),
      cell: ({ row }) => row.original?.totalQuantity ?? 0,
    },

    /* Opening Stock */
    {
      accessorKey: 'openingStock',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Opening Stock" />
      ),
      cell: ({ row }) => row.original?.movements?.[0]?.openingBalance ?? 0,
    },

    /* Closing Stock */
    {
      accessorKey: 'closingStock',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Closing Stock" />
      ),
      cell: ({ row }) => row.original?.movements?.[0]?.closingBalance ?? 0,
    },

    /* Bucket */
    {
      accessorKey: 'bucket',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bucket" />
      ),
      cell: ({ row }) => {
        const bucket = row.original?.movements?.[0]?.bucketName;

        return <Badge variant="secondary">{bucket || '--'}</Badge>;
      },
    },
  ];
};
