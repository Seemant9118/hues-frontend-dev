'use client';

import ShareModal from '@/components/Modals/ShareModal';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export const Columns = [
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
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ITEM TYPE" />
    ),
  },
  {
    accessorKey: 'product_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ITEM NAME" />
    ),
  },
  {
    accessorKey: 'hsn_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CODE" />
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DESCRIPTION" />
    ),
    cell: ({ row }) => {
      const { description } = row.original;
      return <p className="truncate">{description}</p>;
    },
  },
  {
    accessorKey: 'rate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RATE" />
    ),
  },
  {
    accessorKey: 'gst',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GST" />
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Edit
            </DropdownMenuItem>

            <ShareModal currLink="https://www.hues.com?/sfkaskjvbsdl45!" />
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
