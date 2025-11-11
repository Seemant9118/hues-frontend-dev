'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

export const useCustomersColumns = () => {
  const translations = useTranslations('customer');
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.name')}
        />
      ),
    },
    {
      accessorKey: 'mobileNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.phone')}
        />
      ),
      cell: ({ row }) => {
        const { mobileNumber } = row.original;
        return <p className="flex-shrink-0">{`+91 ${mobileNumber}`}</p>;
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.email')}
        />
      ),
      cell: ({ row }) => {
        const { email } = row.original;
        return <p className="flex-shrink-0">{email || '-'}</p>;
      },
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.address')}
        />
      ),
    },
  ];
};
