'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';

export const NotificationColumns = [
  {
    accessorKey: 'text',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NOTIFICATIONS" />
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RECIEVED AT" />
    ),
    cell: ({ row }) => {
      const { updatedAt } = row.original;
      const date = moment(updatedAt).format('DD-MM-YYYY');
      return <div className="text-[#A5ABBD]">{date}</div>;
    },
  },
  {
    accessorKey: 'notificationType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TYPE" />
    ),
  },
];
