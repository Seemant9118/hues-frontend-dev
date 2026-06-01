import { formatValue } from '@/appUtils/helperFunctions';

export const useAuthorizedPersonColumns = ({ translations }) => {
  return [
    {
      accessorKey: 'id',
      header: 'Person ID',
      cell: ({ row }) => formatValue(row.original.id),
    },
    {
      accessorKey: 'name',
      header: translations('tabs.tab3.content.overview_labels.name', {
        defaultValue: 'Name',
      }),
      cell: ({ row }) => formatValue(row.original.name),
    },
    {
      accessorKey: 'email',
      header: translations('tabs.tab3.content.overview_labels.email', {
        defaultValue: 'Email',
      }),
      cell: ({ row }) => formatValue(row.original.email),
    },
    {
      accessorKey: 'mobileNumber',
      header: translations('tabs.tab3.content.overview_labels.phone', {
        defaultValue: 'Mobile Number',
      }),
      cell: ({ row }) => formatValue(row.original.mobileNumber),
    },
  ];
};
