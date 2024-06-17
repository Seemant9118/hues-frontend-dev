'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';

export const ResponseColumns = [
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
    accessorKey: 'product',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PRODUCT" />
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DESCRIPTION" />
    ),
  },
  {
    accessorKey: 'hsn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="HSN | SAC" />
    ),
    cell: ({ row }) => {
      const description = row.original.orders;
      return <p className="truncate">{description}</p>;
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ROLE (MRP)" />
    ),
  },
  {
    accessorKey: 'units',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="UNITS" />
    ),
  },
  {
    accessorKey: 'tax',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TAXABLE VALUE" />
    ),
  },
  {
    accessorKey: 'gst',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GST (%)" />
    ),
  },
  {
    accessorKey: 'gst_value',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GST (VALUE)" />
    ),
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
];
