'use client';

import {
  convertSnakeToTitleCase,
  getQCDefectStatuses,
} from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { SquarePen } from 'lucide-react';

export const useResponseDebitNoteItemColumns = ({
  onEditLine,
  isDebitNotePosted,
}) => {
  return [
    /* Item / Service */
    {
      accessorKey: 'itemName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item / Service" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original?.invoiceItem?.orderItemId?.productDetails
            ?.productName || '-'}
        </span>
      ),
    },

    /* Issue */
    {
      accessorKey: 'issue',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Issue" />
      ),
      cell: ({ row }) => {
        const statuses = getQCDefectStatuses(row.original);
        if (!statuses.length) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            {statuses.map((status) => (
              <ConditionalRenderingStatus key={status} status={status} isQC />
            ))}
          </div>
        );
      },
    },

    /* TODO: add status for Response */
    {
      accessorKey: 'response',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Response" />
      ),
      cell: () => {
        return '-';
      },
    },

    /* TODO: add a Quantity */
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty" />
      ),
      cell: ({ row }) => {
        const { buyerExpectation, refundQuantity } = row.original;

        if (
          buyerExpectation === 'REQUEST_REFUND' ||
          buyerExpectation === 'REQUEST_BOTH'
        ) {
          return refundQuantity || '-';
        }

        return '-';
      },
    },

    /* Claimed Amount */
    {
      accessorKey: 'claimedAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Claimed Amount" />
      ),
      cell: ({ row }) => {
        const amount = row.original?.amount;
        return amount ? `₹ ${amount.toLocaleString()}` : '-';
      },
    },

    /* Buyer Expectation */
    {
      accessorKey: 'buyerExpectation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Buyer Expectation" />
      ),
      cell: ({ row }) =>
        convertSnakeToTitleCase(row.original?.buyerExpectation) || '-',
    },

    /* Internal Remark */
    {
      accessorKey: 'internalRemark',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Internal Remark" />
      ),
      cell: ({ row }) => row.original?.metaData?.internalRemark || '-',
    },

    /* Actions */
    ...(!isDebitNotePosted
      ? [
          {
            accessorKey: 'actions',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Actions" />
            ),
            cell: ({ row }) => {
              const item = row.original;
              return (
                <div className="flex items-center gap-4">
                  <button
                    className="text-gray-600 hover:text-primary"
                    onClick={() => onEditLine(item)}
                  >
                    <SquarePen size={16} />
                  </button>
                </div>
              );
            },
          },
        ]
      : []),
  ];
};
