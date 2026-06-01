import { formatValue } from '@/appUtils/helperFunctions';

export const useAuthorizedPersonColumns = () => {
  return [
    {
      accessorKey: 'id',
      header: 'Person ID',
      cell: ({ row }) => formatValue(row.original.id),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => formatValue(row.original.name),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => formatValue(row.original.email),
    },
    {
      accessorKey: 'mobileNumber',
      header: 'Mobile Number',
      cell: ({ row }) => formatValue(row.original.mobileNumber),
    },
  ];
};
