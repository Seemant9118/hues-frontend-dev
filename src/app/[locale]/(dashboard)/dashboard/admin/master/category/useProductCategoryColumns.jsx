/* eslint-disable prettier/prettier */

'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';

export const useProductCategoryColumns = ({
  setIsEditingCategory,
  setCategoryToEdit,
}) => {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-primary">#{row.original?.id}</span>
      ),
      size: 80,
    },

    {
      accessorKey: 'categoryName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category Name" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[220px] truncate">
          {row.original?.categoryName || '-'}
        </div>
      ),
    },

    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[280px] truncate">
          {row.original?.description || '-'}
        </div>
      ),
    },

    {
      accessorKey: 'isDeleted',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Is Deleted" />
      ),
      cell: ({ row }) =>
        row.original?.isDeleted ? (
          <span className="font-medium text-red-600">Yes</span>
        ) : (
          <span className="font-medium text-green-600">No</span>
        ),
    },

    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated at" />
      ),
      cell: ({ row }) =>
        row.original?.updatedAt
          ? moment(row.original.updatedAt).format('DD/MM/YYYY')
          : '-',
    },

    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created at" />
      ),
      cell: ({ row }) =>
        row.original?.createdAt
          ? moment(row.original.updatedAt).format('DD/MM/YYYY')
          : '-',
    },

    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-fit">
              <DropdownMenuItem
                className="flex items-center justify-center gap-2"
                onClick={(e) => {
                  setIsEditingCategory((prev) => !prev);
                  e.stopPropagation();
                  setCategoryToEdit(row.original);
                }}
              >
                <Pencil size={12} />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
