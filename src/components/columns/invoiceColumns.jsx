'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import moment from 'moment';

export const invoiceColumns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'invoiceId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="INVOICE ID" />
    ),
    cell: ({ row }) => {
      const { invoiceId } = row.original;
      return <span className="font-bold">#{invoiceId}</span>;
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
    accessorKey: 'totalAmt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TOTAL AMOUNT" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalAmt'));
      return formattedAmount(amount);
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: () => {
      return <Button>View</Button>;
    },
  },
];
