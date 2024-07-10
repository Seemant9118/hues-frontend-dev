'use client';

import { NotificationDataTableColumnHeader } from '@/components/table/NotificationDataTableColumnHeader';
import moment from 'moment';

export const NotificationColumns = [
  {
    accessorKey: 'notifications',
    header: ({ column }) => (
      <NotificationDataTableColumnHeader
        column={column}
        title="NOTIFICATIONS"
      />
    ),
  },
  {
    accessorKey: 'recievdAt',
    header: ({ column }) => (
      <NotificationDataTableColumnHeader
        notificationDateFilter={'true'}
        column={column}
        title="RECIEVED AT"
      />
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
      <NotificationDataTableColumnHeader
        notificationTypeFilter={'true'}
        column={column}
        title="TYPE"
      />
    ),
  },
];
