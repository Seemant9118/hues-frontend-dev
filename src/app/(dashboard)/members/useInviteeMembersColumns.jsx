'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import moment from 'moment';

export const useInviteeMembersColumns = (setSelectedOrders) => {
  // Function to handle row selection
  const handleRowSelection = (isSelected, row) => {
    if (isSelected) {
      setSelectedOrders((prev) => [...prev, row.original]);
    } else {
      setSelectedOrders((prev) =>
        prev.filter((order) => order.id !== row.original.id),
      );
    }
  };

  // Function to handle "Select All" functionality
  const handleSelectAll = (isAllSelected, rows) => {
    if (isAllSelected) {
      const allOrders = rows.map((row) => row.original);
      setSelectedOrders(allOrders);
    } else {
      setSelectedOrders([]); // Clear all selections
    }
  };

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            handleSelectAll(!!value, table.getRowModel().rows);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <div
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click from being triggered
          }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              handleRowSelection(!!value, row);
            }}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="NAME" />
      ),
      cell: ({ row }) => {
        const { name } = row.original.invitation.userDetails;
        return <div>{name}</div>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="JOINING DATE" />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        const date = moment(createdAt).format('DD-MM-YYYY');
        return <div className="text-[#A5ABBD]">{date}</div>;
      },
    },
    {
      accessorKey: 'mobileNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PHONE NUMBER" />
      ),
      cell: ({ row }) => {
        const { mobileNumber } = row.original.invitation.userDetails;
        return <div>{mobileNumber}</div>;
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="EMAIL ID" />
      ),
      cell: ({ row }) => {
        const { email } = row.original.invitation.userDetails;
        return <div>{email}</div>;
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ROLE" />
      ),
      cell: ({ row }) => {
        const { role } = row.original;
        // fn for capitalization
        function capitalize(str) {
          return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        return (
          <div className="w-fit rounded-[5px] border border-[#EDEEF2] bg-[#F6F7F9] p-1 text-sm">
            {capitalize(role)}
          </div>
        );
      },
    },
  ];
};
