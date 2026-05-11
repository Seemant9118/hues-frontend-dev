'use client';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const useQCItemsColumns = () => {
  return [
    /* Item Name */
    {
      accessorKey: 'itemName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item Name / SKU" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">
            {row.original?.metaData?.productDetails?.productName}
          </span>
          <span className="text-grey-400 text-xs">
            {row.original?.metaData?.productDetails?.skuId}
          </span>
        </div>
      ),
    },

    // batch number
    {
      accessorKey: 'batchNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Batch" />
      ),
      cell: ({ row }) => row.original?.batchNo || '--',
    },
    // expiry date
    {
      accessorKey: 'expiryDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expiry Date" />
      ),
      cell: ({ row }) => row.original?.expiryDate || '--',
    },

    /* QC Received */
    {
      accessorKey: 'qcReceived',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QC Recieved" />
      ),
      cell: ({ row }) => row.original?.totalQuantity ?? 0,
    },

    /* QC Accepted */
    {
      accessorKey: 'qcAccepted',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QC Accepted" />
      ),
      cell: ({ row }) => row.original?.qcPassedQuantity ?? 0,
    },

    /* QC Rejected */
    {
      accessorKey: 'qcRejected',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QC Rejected" />
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
        const isWithIssues =
          row.original?.qcFailedQuantity > 0 &&
          status === 'PARTIALLY_COMPLETED';
        const finalStatus = isWithIssues
          ? 'PARTIALLY_COMPLETED_WITH_ISSUES'
          : status;

        return <ConditionalRenderingStatus status={finalStatus} isQC />;
      },
    },
  ];
};
