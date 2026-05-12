/* eslint-disable prettier/prettier */

'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteSubCategory } from '@/services/Admin_Services/AdminServices';
import { MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';

export const useSubCategoryColumns = ({
  setIsEditingSubCategory,
  setSubCategoryToEdit,
}) => {
  return [
    {
      accessorKey: 'subCategoryName',
      size: 220,
      minSize: 220,
      maxSize: 220,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sub Category Name" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original?.subCategoryName || '-'}
        </Badge>
      ),
    },

    {
      accessorKey: 'categoryName',
      size: 220,
      minSize: 220,
      maxSize: 220,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category Name" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original?.category?.categoryName || '-'}
        </Badge>
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
                  setIsEditingSubCategory((prev) => !prev);
                  e.stopPropagation();
                  setSubCategoryToEdit(row.original);
                }}
              >
                <Pencil size={12} />
                Edit
              </DropdownMenuItem>
              <ConfirmAction
                deleteCta={'Delete'}
                infoText={
                  'Are you sure you want to delete this sub-category record? This action cannot be undone.'
                }
                cancelCta={'Cancel'}
                id={id}
                invalidateKey={AdminAPIs.getSubCategories.endpointKey}
                mutationKey={AdminAPIs.deleteSubCategory.endpointKey}
                mutationFunc={deleteSubCategory}
                successMsg={'Deleted sub-category successfully.'}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
