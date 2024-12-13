'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const useSalesInvoiceColumns = () => {
  return [
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEMS" />
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QUANTITY" />
      ),
    },
    {
      accessorKey: 'unitPrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="RATE" />
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TOTAL AMOUNT" />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));

        return formattedAmount(amount);
      },
    },
  ];
};
