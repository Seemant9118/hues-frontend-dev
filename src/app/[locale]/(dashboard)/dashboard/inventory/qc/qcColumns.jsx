'use client';

import { getQCDefectStatuses } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const useQCColumns = () => {
  return [
    /* GRN ID */
    {
      accessorKey: 'grnId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GRN ID" />
      ),
      cell: ({ row }) => row.original?.referenceNumber || '--',
    },

    /* Invoice ID */
    {
      accessorKey: 'invoiceId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice ID" />
      ),
      cell: ({ row }) =>
        row.original?.metaData?.invoiceDetails?.referenceNumber || '--',
    },

    /* QC Received */
    {
      accessorKey: 'totalQC',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total QC" />
      ),
      cell: ({ row }) => row.original?.qcSummary?.totalItems ?? 0,
    },

    /* QC Pending */
    {
      accessorKey: 'pendingQC',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pending QC" />
      ),
      cell: ({ row }) => row.original?.qcSummary?.pendingItems ?? 0,
    },

    /* QC Accepted */
    {
      accessorKey: 'acceptedQC',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QC Accepted" />
      ),
      cell: ({ row }) => row.original?.qcSummary?.completedItems ?? 0,
    },

    /* QC Rejected */
    {
      accessorKey: 'rejectedQC',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QC Rejected" />
      ),
      cell: ({ row }) => row.original?.qcSummary?.rejectedQuantity ?? 0,
    },

    {
      accessorKey: 'flags',
      header: ({ column }) => (
        <DataTableColumnHeader
          className="w-36"
          column={column}
          title="QC Issues"
        />
      ),
      cell: ({ row }) => {
        const statuses = getQCDefectStatuses(row.original);

        if (!statuses.length) return '-';

        return (
          <div className="flex flex-col gap-2">
            {statuses.map((status) => (
              <ConditionalRenderingStatus key={status} status={status} isQC />
            ))}
          </div>
        );
      },
    },

    /* QC Status */
    {
      accessorKey: 'qcStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QC Status" />
      ),
      cell: ({ row }) => {
        const status = row.original?.qcSummary?.parentStatus;

        return <ConditionalRenderingStatus status={status} isQC />;
      },
    },
  ];
};
