'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';
import ConfirmAction from '../Modals/ConfirmAction';

export const paymentColumns = [
  {
    accessorKey: 'paymentId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PAYMENT ID" />
    ),
    cell: ({ row }) => {
      const { paymentId } = row.original;
      return <span className="font-bold">{paymentId}</span>;
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="AMOUNT" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DATE" />
    ),
    cell: ({ row }) => {
      const { date } = row.original;
      const formattedDate = moment(date).format('DD-MM-YYYY');
      return <div className="text-[#A5ABBD]">{formattedDate}</div>;
    },
  },

  {
    accessorKey: 'invoices',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="INVOICE NO" />
    ),
    cell: ({ row }) => {
      const { invoices } = row.original;
      return invoices.map((invoiceNo) => (
        <div key={invoiceNo} className="text-[#A5ABBD]">
          {invoiceNo}
        </div>
      ));
    },
  },

  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const { paymentId } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-w-fit">
            <span
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center justify-center gap-2 rounded-sm p-1 text-sm hover:cursor-pointer hover:bg-gray-300"
            >
              <Pencil size={14} /> Edit
            </span>

            <ConfirmAction name={'Payment'} id={paymentId} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
