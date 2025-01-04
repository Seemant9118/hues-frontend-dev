'use client';

import { capitalize } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Dot } from 'lucide-react';
import moment from 'moment';

export const NotificationColumns = [
  {
    accessorKey: 'text',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NOTIFICATIONS" />
    ),
    cell: ({ row }) => {
      const { text, isRead } = row.original;
      return (
        <div className="flex items-center gap-1">
          <span className="text-primary">{!isRead && <Dot />}</span>
          <span>{text}</span>
        </div>
      );
    },
  },

  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RECIEVED AT" />
    ),
    cell: ({ row }) => {
      const { createdAt } = row.original;
      const date = moment(createdAt).format('DD-MM-YYYY');
      return <div className="text-[#A5ABBD]">{date}</div>;
    },
  },
  {
    accessorKey: 'notificationType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TYPE" />
    ),
    cell: ({ row }) => {
      const { notificationType } = row.original;
      return <div>{capitalize(notificationType)}</div>;
    },
  },
];
