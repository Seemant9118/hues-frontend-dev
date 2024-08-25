'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const NegotiationHistoryColumns = [
  {
    accessorKey: 'status',
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CREATED AT" />
    ),
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="QUANTITY" />
    ),
  },
  {
    accessorKey: 'rate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RATE" />
    ),
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TOTAL" />
    ),
  },
];
