'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';

export const invoiceColumns = [
  {
    accessorKey: 'items',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ITEMS" />
    ),
    cell: ({ row }) => {
      const { orderItemId } = row.original;
      const itemName =
        orderItemId?.productDetails?.productName ||
        orderItemId?.productDetails?.serviceName ||
        'N/A';
      return itemName;
    },
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="QUANTITY" />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DATE" />
    ),
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return moment(createdAt).format('DD-MM-YYYY');
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="AMOUNT" />
    ),
    cell: ({ row }) => {
      const { grossAmount } = row.original;
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
      }).format(grossAmount);
      return formattedAmount;
    },
  },
];
