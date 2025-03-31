'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { Dot } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const usePaymentsColumn = (setSelectedDebit) => {
  const translations = useTranslations(
    'purchases.purchase-payments.section.table.header',
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
      const allOrders = rows.map((row) => ({ ...row.original }));
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
      accessorKey: 'paymentId',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('payment_id')}
        />
      ),
      cell: ({ row }) => {
        const { referenceNumber } = row.original;
        const isBuyerRead = row.original?.readTracker?.buyerIsRead;
        return (
          <div className="flex items-center">
            {!isBuyerRead && <Dot size={32} className="text-[#3288ED]" />}
            <span>{referenceNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'vendorName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('vendor_name')}
        />
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
      accessorKey: 'invoiceId',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('invoice_id')}
        />
      ),
      cell: ({ row }) => {
        const { toEnterprise } = row.original;
        return <div>{toEnterprise.name}</div>;
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('total_amount')}
        />
      ),
      cell: ({ row }) => {
        const { amount } = row.original;
        return formattedAmount(amount);
      },
    },
    {
      accessorKey: 'amountPaid',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('amount_paid')}
        />
      ),
      cell: ({ row }) => {
        const { amount } = row.original;
        return formattedAmount(amount);
      },
    },
    {
      accessorKey: 'paymentMode',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('mode_of_payment')}
        />
      ),
      cell: ({ row }) => {
        const { amount } = row.original;
        return formattedAmount(amount);
      },
    },
    {
      accessorKey: 'paymentDate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('payment_date')}
        />
      ),
      cell: ({ row }) => {
        const { amount } = row.original;
        return formattedAmount(amount);
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('status')} />
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        // Function for capitalization
        const capitalize = (str) =>
          str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        return (
          <div className="w-fit rounded-[5px] border border-[#EDEEF2] bg-[#F6F7F9] p-1 text-sm">
            {capitalize(status)}
          </div>
        );
      },
    },
  ];
};
