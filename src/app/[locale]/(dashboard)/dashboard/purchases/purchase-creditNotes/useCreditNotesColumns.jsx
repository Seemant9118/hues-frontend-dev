'use client';

import {
  formattedAmount,
  getQCDefectStatuses,
} from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { Dot } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useCreditNotesColumns = (setSelectedDebit) => {
  const translations = useTranslations(
    'purchases.purchase-credit_notes.table.header',
  );
  // Function to handle row selection
  const handleRowSelection = (isSelected, row) => {
    const debits = { ...row.original };

    if (isSelected) {
      setSelectedDebit((prev) => [...prev, debits]);
    } else {
      setSelectedDebit((prev) =>
        prev.filter((order) => order.id !== row.original.id),
      );
    }
  };

  // Function to handle "Select All" functionality
  const handleSelectAll = (isAllSelected, rows) => {
    if (isAllSelected) {
      const allOrders = rows.map((row) => {
        return { ...row.original };
      });
      setSelectedDebit(allOrders);
    } else {
      setSelectedDebit([]); // Clear all selections
    }
  };
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            handleSelectAll(!!value, table.getRowModel().rows);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <div
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click from being triggered
          }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              handleRowSelection(!!value, row);
            }}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('debitNote_Id')}
        />
      ),
      cell: ({ row }) => {
        const { referenceNumber } = row.original;
        const isBuyerRead = row.original?.readTracker?.buyerIsRead || true;
        return (
          <div className="flex items-center">
            {!isBuyerRead && <Dot size={32} className="text-[#3288ED]" />}
            <span>{referenceNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'enterprise',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('vendors')}
        />
      ),
      cell: ({ row }) => {
        const { fromEnterprise } = row.original;

        return <div>{fromEnterprise?.name || '-'}</div>;
      },
    },
    {
      accessorKey: 'invoiceReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('invoice_id')}
        />
      ),
      cell: ({ row }) => {
        const invoiceReferenceNumber = row.original?.invoice?.referenceNumber;
        return (
          <div className="flex items-center">
            <span>{invoiceReferenceNumber || '-'}</span>
          </div>
        );
      },
    },

    {
      accessorKey: 'defects',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('defects')}
        />
      ),
      cell: ({ row }) => {
        const statuses = getQCDefectStatuses(row.original);

        if (!statuses.length) return '-';

        return (
          <div className="flex flex-col gap-2">
            {statuses?.map((status) => (
              <ConditionalRenderingStatus key={status} status={status} isQC />
            ))}
          </div>
        );
      },
    },

    {
      accessorKey: 'claimedAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('claimed_amount')}
        />
      ),
      cell: ({ row }) => {
        const claimedAmount = row.original?.debitNote?.amount;
        return formattedAmount(claimedAmount);
      },
    },

    {
      accessorKey: 'setteledAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('setteled_amount')}
        />
      ),
      cell: ({ row }) => {
        const { approvedAmount } = row.original;
        return formattedAmount(approvedAmount);
      },
    },

    {
      accessorKey: 'createdOn',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('createdOn')}
        />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        return (
          <div className="text-[#A5ABBD]">
            {moment(createdAt).format('DD-MM-YYYY')}
          </div>
        );
      },
    },
  ];
};
