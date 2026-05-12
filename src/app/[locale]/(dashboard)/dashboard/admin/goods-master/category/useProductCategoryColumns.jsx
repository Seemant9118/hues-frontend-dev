/* eslint-disable prettier/prettier */

'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteCategory } from '@/services/Admin_Services/AdminServices';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';

export const useProductCategoryColumns = ({
  setIsEditingCategory,
  setCategoryToEdit,
}) => {
  return [
    {
      accessorKey: 'categoryName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category Name" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original?.categoryName || '-'}</Badge>
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
        const { id } = row.original;
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
              <ConfirmAction
                deleteCta={'Delete'}
                infoText={
                  'Are you sure you want to delete this category record? This action cannot be undone.'
                }
                cancelCta={'Cancel'}
                id={id}
                invalidateKey={AdminAPIs.getCategories.endpointKey}
                mutationKey={AdminAPIs.deleteCategory.endpointKey}
                mutationFunc={deleteCategory}
                successMsg={'Deleted category successfully.'}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
