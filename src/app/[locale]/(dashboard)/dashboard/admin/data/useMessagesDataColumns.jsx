'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';

export const useMessagesDataColumns = () => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'NAME'} />
      ),
      cell: ({ row }) => <div>{row.original?.name || '-'}</div>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'EMAIL'} />
      ),
      cell: ({ row }) => <div>{row.original?.email || '-'}</div>,
    },
    {
      accessorKey: 'mobileNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'MOBILE NUMBER'} />
      ),
      cell: ({ row }) => {
        const countryCode = row.original?.countryCode || '+91';
        const mobileNumber = row.original?.mobileNumber;

        return (
          <div>{mobileNumber ? `${countryCode} ${mobileNumber}` : '-'}</div>
        );
      },
    },
    {
      accessorKey: 'message',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'MESSAGE'} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[350px] truncate">
          {row.original?.message || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'RECEIVED ON'} />
      ),
      cell: ({ row }) => {
        const createdAt = row.original?.createdAt;
        return (
          <div>
            {createdAt ? moment(createdAt).format('DD/MM/YYYY | hh:mm A') : '-'}
          </div>
        );
      },
    },
  ];
};
