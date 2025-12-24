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
            <span>{row.original?.productname}</span>
            <span className="text-xs text-muted-foreground">
              {row.original?.skuid}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original?.categoryname}</Badge>
      ),
    },

    {
      accessorKey: 'location',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => row.original?.warehousename || '--',
    },

    {
      accessorKey: 'bucket',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bucket" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original?.bucketname}</Badge>
      ),
    },

    {
      accessorKey: 'available',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Available" />
      ),
      cell: ({ row }) =>
        Math.ceil(Number(row.original?.availablequantity) ?? 0),
    },

    {
      accessorKey: 'avgCost',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Avg Cost" />
      ),
      cell: ({ row }) => formattedAmount(row.original?.unitprice ?? 0),
    },

    {
      accessorKey: 'value',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => formattedAmount(row.original?.totalprice ?? 0),
    },
  ];
};
