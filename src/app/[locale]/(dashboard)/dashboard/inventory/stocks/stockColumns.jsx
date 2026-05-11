'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';

export const useStocksColumns = () => {
  return [
    {
      accessorKey: 'skuId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU / Item Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-1">
            <span>{row.original?.productName}</span>
            <span className="text-xs text-muted-foreground">
              {row.original?.skuId}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: 'location',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => row.original?.warehouseName || '--',
    },

    {
      accessorKey: 'bucket',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bucket" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original?.batches?.[0]?.bucketName}
        </Badge>
      ),
    },

    {
      accessorKey: 'available',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Available" />
      ),
      cell: ({ row }) =>
        Math.ceil(Number(row.original?.availableQuantity) ?? 0),
    },

    {
      accessorKey: 'avgCost',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Avg Cost" />
      ),
      cell: ({ row }) => formattedAmount(row.original?.unitPrice ?? 0),
    },

    {
      accessorKey: 'value',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => formattedAmount(row.original?.totalPrice ?? 0),
    },
  ];
};
