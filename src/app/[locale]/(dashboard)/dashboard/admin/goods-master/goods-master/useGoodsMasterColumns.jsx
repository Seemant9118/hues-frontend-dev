/* eslint-disable prettier/prettier */

'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { capitalize } from '@/appUtils/helperFunctions';
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
import { deleteGoodsMaster } from '@/services/Admin_Services/AdminServices';
import { MoreVertical, Pencil } from 'lucide-react';

export const useGoodsMasterColumns = ({
  setIsEditingGoodsMaster,
  setGoodsMasterToEdit,
}) => {
  return [
    {
      accessorKey: 'huesItemCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hues Item ID" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original?.huesItemId || '-'}</span>
      ),
    },
    {
      accessorKey: 'hsnCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HSN" />
      ),
    },
    {
      accessorKey: 'itemName',
      size: 220,
      minSize: 220,
      maxSize: 220,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item" />
      ),
      cell: ({ row }) => (
        <div className="w-[220px] truncate font-medium">
          {capitalize(row.original?.item) || '-'}
        </div>
      ),
    },

    {
      accessorKey: 'category',
      size: 220,
      minSize: 220,
      maxSize: 220,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original?.category?.categoryName || '-'}
        </Badge>
      ),
    },

    {
      accessorKey: 'subCategory',
      size: 220,
      minSize: 220,
      maxSize: 220,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sub category" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original?.subCategory?.subCategoryName || '-'}
        </Badge>
      ),
    },

    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original?.id;
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
                  setIsEditingGoodsMaster((prev) => !prev);
                  e.stopPropagation();
                  setGoodsMasterToEdit(row.original);
                }}
              >
                <Pencil size={12} />
                Edit
              </DropdownMenuItem>

              <ConfirmAction
                deleteCta={'Delete'}
                infoText={
                  'Are you sure you want to delete this goods master record? This action cannot be undone.'
                }
                cancelCta={'Cancel'}
                id={id}
                invalidateKey={AdminAPIs.getGoodsMaster.endpointKey}
                mutationKey={AdminAPIs.deleteGoodsMaster.endpointKey}
                mutationFunc={deleteGoodsMaster}
                successMsg={'Deleted goods master record successfully.'}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
