'use client';

import { userAuth } from '@/api/user_auth/Users';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { getUserById } from '@/services/User_Auth_Service/UserAuthServices';
import { useQuery } from '@tanstack/react-query';

const UserCell = ({ row }) => {
  const userId = row.original.createdBy;
  const { data, error, isLoading } = useQuery({
    queryKey: [userAuth.getUserById.endpointKey],
    queryFn: () => getUserById(userId),
    select: (data) => data.data.data,
    enabled: !!userId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
  return <div>{data?.name || '-'}</div>;
};

export const useNegotiationHistoryColumns = () => {
  return [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DATE" />
      ),
    },
    {
      accessorKey: 'createdBy',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: UserCell,
    },
    {
      accessorKey: 'priceType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TYPE" />
      ),
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PRICE" />
      ),
    },
  ];
};
