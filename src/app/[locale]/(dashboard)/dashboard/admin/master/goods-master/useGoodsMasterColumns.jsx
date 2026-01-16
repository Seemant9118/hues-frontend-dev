/* eslint-disable prettier/prettier */

'use client';

import { capitalize } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil } from 'lucide-react';

export const useGoodsMasterColumns = ({
  setIsEditingGoodsMaster,
  setGoodsMasterToEdit,
}) => {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },

    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="rounded-full border border-primary px-3 py-1 text-xs text-primary">
          #{row.original?.category?.id}{' '}
          {row.original?.category?.categoryName || '-'}
        </span>
      ),
    },

    {
      accessorKey: 'subCategory',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sub category" />
      ),
      cell: ({ row }) => (
        <span className="rounded-full border border-primary px-3 py-1 text-xs text-primary">
          #{row.original?.subCategory?.id}{' '}
          {row.original?.subCategory?.subCategoryName || '-'}
        </span>
      ),
    },

    {
      accessorKey: 'huesItemCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hues item" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original?.huesItemId || '-'}</span>
      ),
    },

    {
      accessorKey: 'itemName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {capitalize(row.original?.item) || '-'}
        </span>
      ),
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
                  setIsEditingGoodsMaster((prev) => !prev);
                  e.stopPropagation();
                  setGoodsMasterToEdit(row.original);
                }}
              >
                <Pencil size={12} />
                Edit
              </DropdownMenuItem>

              {/* <ConfirmAction
                  deleteCta={translations('table.columnActions.delete.cta')}
                  infoText={translations(
                    'table.columnActions.delete.infoText',
                    {
                      name,
                    },
                  )}
                  cancelCta={translations('table.columnActions.delete.cancel')}
                  id={id}
                  mutationKey={goodsApi.getAllProductGoods.endpointKey}
                  mutationFunc={DeleteProductGoods}
                  successMsg={translations(
                    'table.columnActions.delete.successMsg',
                  )}
                /> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
