'use client';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { Dot } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const usePurchaseInvoicesColumns = (setSelectedInvoices) => {
  const translations = useTranslations(
    'purchases.purchase-invoices.table.header',
  );

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
        <DataTableColumnHeader
          column={column}
          title={translations('invoice_id')}
        />
      ),
      cell: ({ row }) => {
        const { invoiceReferenceNumber } = row.original;
        const isPurchaseRead = row.original?.readTracker?.buyerIsRead;
        return (
          <div className="flex items-center">
            {!isPurchaseRead && <Dot size={32} className="text-[#3288ED]" />}
            <span>{invoiceReferenceNumber}</span>
          </div>
        );
      },
    },

    {
      accessorKey: 'invoiceDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('date')} />
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
      accessorKey: 'vendorName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('vendors')}
        />
      ),
    },
    {
      accessorKey: 'orderReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('order_id')}
        />
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
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('status')} />
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
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('total_amount')}
        />
      ),
      cell: ({ row }) => {
        const { totalAmount } = row.original;
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'INR',
        }).format(totalAmount);
        return formattedAmount;
      },
    },
  ];
};
