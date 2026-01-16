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

export const useServiceMasterColumns = ({
  setIsEditingServiceMaster,
  setServiceMasterToEdit,
}) => {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
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
      accessorKey: 'sac',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SAC" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original?.sac || '-'}</span>
      ),
    },

    {
      accessorKey: 'service',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Service" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {capitalize(row.original?.service) || '-'}
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
                  setIsEditingServiceMaster((prev) => !prev);
                  e.stopPropagation();
                  setServiceMasterToEdit(row.original);
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
