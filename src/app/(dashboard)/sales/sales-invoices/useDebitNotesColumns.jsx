'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';

export const useDebitNotesColumns = () => {
  return [
    {
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="INVOICE ID" />
      ),
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
      accessorKey: 'enterprise',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CUSTOMERS" />
      ),
      cell: ({ row }) => {
        const { toEnterprise } = row.original;

        return <div>{toEnterprise.name}</div>;
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TOTAL AMOUNT" />
      ),
      cell: ({ row }) => {
        const { amount } = row.original;
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
        return formattedAmount;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STATUS" />
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        // fn for capitalization
        function capitalize(str) {
          return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        return (
          <div className="w-fit rounded-[5px] border border-[#EDEEF2] bg-[#F6F7F9] p-1 text-sm">
            {capitalize(status)}
          </div>
        );
      },
    },
  ];
};
