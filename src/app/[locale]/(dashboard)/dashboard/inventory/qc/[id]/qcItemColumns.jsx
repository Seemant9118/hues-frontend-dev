'use client';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const useQCItemsColumns = () => {
  return [
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
