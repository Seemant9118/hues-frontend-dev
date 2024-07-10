'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const NotificationColumns = [
  {
    accessorKey: 'notifications',
    header: ({ column }) => (
      <DataTableColumnHeader
        notificationHeader={'true'}
        column={column}
        title="NOTIFICATIONS"
      />
    ),
  },
  {
    accessorKey: 'recievdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        notificationHeader={'true'}
        column={column}
        title="RECIEVED AT"
      />
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader
        notificationHeader={'true'}
        column={column}
        title="TYPE"
      />
    ),
  },
];
