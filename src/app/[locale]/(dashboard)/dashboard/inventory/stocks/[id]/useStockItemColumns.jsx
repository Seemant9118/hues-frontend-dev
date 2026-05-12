'use client';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';

export const useStockItemColumns = () => {
  return [
    /* Transaction Type */
    {
      accessorKey: 'transactiontype',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transaction Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {convertSnakeToTitleCase(row.original?.transactionType) || '--'}
        </Badge>
      ),
    },

    /* Opening Balance */
    {
      accessorKey: 'openingbalance',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Opening Balance" />
      ),
      cell: ({ row }) => Math.round(Number(row.original?.openingBalance ?? 0)),
    },

    /* Closing Balance */
    {
      accessorKey: 'closingbalance',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Closing Balance" />
      ),
      cell: ({ row }) => Math.round(Number(row.original?.closingBalance ?? 0)),
    },

    /* Quantity */
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty" />
      ),
      cell: ({ row }) => row.original?.quantity ?? 0,
    },

    /* Operation Type */
    {
      accessorKey: 'operationtype',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Operation Type" />
      ),
      cell: ({ row }) => {
        const type = row.original?.operationType;
        return <ConditionalRenderingStatus status={type} />;
      },
    },

    /* Transferred Bucket */
    {
      accessorKey: 'bucketName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transferred Bucket" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original?.bucketName || '--'}</Badge>
      ),
    },
  ];
};
