'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';

export const useEnterpriseDataColumns = () => {
  return [
    {
      accessorKey: 'enterprise_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'ENTERPRISE NAME'} />
      ),
    },
    {
      accessorKey: 'invoice_count',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'NO. OF INVOICE RAISED'}
        />
      ),
    },
    {
      accessorKey: 'order_count',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'NO. OF ORDER CREATED'} />
      ),
    },
    {
      accessorKey: 'LatestUserUpdate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'LAST LOGGED IN'} />
      ),
      cell: ({ row }) => {
        const LastUserUpdatedAt = row.original?.latest_user_session_update;

        return (
          <div>
            {moment(LastUserUpdatedAt).format('DD/MM/YYYY | hh:mm A') || '-'}
          </div>
        );
      },
    },
  ];
};
