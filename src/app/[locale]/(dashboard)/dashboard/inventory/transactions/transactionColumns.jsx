'use client';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';

export const useTrasnsactionsColumns = () => {
  return [
    /* Stock ID */
    {
      accessorKey: 'stockId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => row.original?.referenceNumber || '--',
    },

    /* GRN ID */
    {
      accessorKey: 'grnId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Doc ID" />
      ),
      cell: ({ row }) =>
        row.original?.grns?.[0]?.referenceNumber ||
        row.original?.dispatchnotes?.[0]?.referenceNumber ||
        '--',
    },

    /* Doc Type */
    {
      accessorKey: 'docType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Doc Type" />
      ),
      cell: ({ row }) => {
        return (
          <Badge variant="secondary">
            {convertSnakeToTitleCase(
              row.original?.docType || '-',
            ).toUpperCase()}
          </Badge>
        );
      },
    },

    /* Client/Vendor name */
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client/Vendor Name" />
      ),
      cell: ({ row }) =>
        row.original?.grns?.[0]?.metaData?.sellerDetails?.name ||
        row.original?.dispatchnotes?.[0]?.dispatchBuyerName ||
        0,
    },

    /* Total */
    {
      accessorKey: 'total',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Item(s)" />
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
