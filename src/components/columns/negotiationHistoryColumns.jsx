"use client";
import { user_Auth } from "@/api/user_auth/Users";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";
import { getUserById } from "@/services/User_Auth_Service/UserAuthServices";
import { useQuery } from "@tanstack/react-query";

export const usenegotiationHistoryColumns = () => {
  const fetchUser = (id) => {
    return useQuery({
      queryKey: [user_Auth.getUserById.endpointKey],
      queryFn: () => getUserById(id),
      select: (data) => data.data.data,
      enabled: !!id,
    });
  };

  return [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DATE" />
      ),
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: ({ row }) => {
        const userId = row.original.createdBy;
        const { data, error, isLoading } = fetchUser(userId);

        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>Error loading user</div>;
        return <div>{data?.name || "-"}</div>;
      },
    },
    {
      accessorKey: "priceType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TYPE" />
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PRICE" />
      ),
    },
  ];
};
