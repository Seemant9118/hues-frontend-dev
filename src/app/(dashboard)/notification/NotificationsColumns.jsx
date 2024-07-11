'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';

export const NotificationColumns = [
  {
    accessorKey: 'notifications',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NOTIFICATIONS" />
    ),
  },
  {
    accessorKey: 'recievdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RECIEVED AT" />
    ),
    cell: ({ row }) => {
      const { recievdAt } = row.original;
      const date = moment(recievdAt).format('DD-MM-YYYY');
      return <div className="text-[#A5ABBD]">{date}</div>;
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TYPE" />
    ),
  },
];
