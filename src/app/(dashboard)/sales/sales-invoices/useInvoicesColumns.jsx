'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';

export const useinvoiceColumns = () => {
  return [
    {
      accessorKey: 'invoiceId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="INVOICE ID" />
      ),
    },

    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DATE" />
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
    {
      accessorKey: 'customer',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CUSTOMERS" />
      ),
    },
    {
      accessorKey: 'orderId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ORDER ID" />
      ),
      cell: ({ row }) => {
        const { orderId } = row.original;
        return (
          <div className="w-14 rounded border border-[#EDEEF2] bg-[#F6F7F9] p-1">
            {orderId}
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
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'INR',
        }).format(totalAmount);
        return formattedAmount;
      },
    },
  ];
};
