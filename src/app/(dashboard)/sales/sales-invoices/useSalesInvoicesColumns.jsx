'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { Dot } from 'lucide-react';
import moment from 'moment';

export const useSalesInvoicesColumns = (setSelectedInvoices) => {
  // Function to handle row selection
  const handleRowSelection = (isSelected, row) => {
    const orderWithCustomer = { ...row.original };

    if (isSelected) {
      setSelectedInvoices((prev) => [...prev, orderWithCustomer]);
    } else {
      setSelectedInvoices((prev) =>
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
      setSelectedInvoices(allOrders);
    } else {
      setSelectedInvoices([]); // Clear all selections
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
      accessorKey: 'invoiceReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="INVOICE ID" />
      ),
      cell: ({ row }) => {
        const { invoiceReferenceNumber } = row.original;
        const isSaleRead = row.original?.readTracker?.sellerIsRead;
        return (
          <div className="flex items-center">
            {!isSaleRead && <Dot size={32} className="text-[#3288ED]" />}
            <span>{invoiceReferenceNumber}</span>
          </div>
        );
      },
    },

    {
      accessorKey: 'invoiceDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DATE" />
      ),
      cell: ({ row }) => {
        const { invoiceDate } = row.original;
        return (
          <div className="text-[#A5ABBD]">
            {moment(invoiceDate).format('DD-MM-YYYY')}
          </div>
        );
      },
    },
    {
      accessorKey: 'clientType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CUSTOMERS TYPE" />
      ),
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CUSTOMERS" />
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STATUS" />
      ),
      cell: ({ row }) => {
        const paymentStatus = row.original?.invoiceMetaData?.payment?.status;
        const debitNoteStatus =
          row.original?.invoiceMetaData?.debitNote?.status === 'NOT_RAISED'
            ? ''
            : row.original?.invoiceMetaData?.debitNote?.status;

        return (
          <div className="flex items-start gap-2">
            <ConditionalRenderingStatus status={paymentStatus} />
            {debitNoteStatus !== '' && (
              <ConditionalRenderingStatus status={debitNoteStatus} />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'orderReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ORDER ID" />
      ),
      cell: ({ row }) => {
        const { orderReferenceNumber } = row.original;
        return (
          <div className="w-48 rounded border border-[#EDEEF2] bg-[#F6F7F9] p-1">
            {orderReferenceNumber}
          </div>
        );
      },
    },

    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TOTAL AMOUNT" />
      ),
      cell: ({ row }) => {
        const { totalAmount } = row.original;
        return formattedAmount(totalAmount);
      },
    },
  ];
};
