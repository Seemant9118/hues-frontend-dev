'use client';

import ConfirmAction from '@/components/Modals/ConfirmAction';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

export const useCatlogueColumns = () => {
  return [
    {
      accessorKey: 'productName', // change to itemName of catalogue
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEM" />
      ),
    },
    {
      accessorKey: 'id', // change to sku of catalogue
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" />
      ),
    },
    {
      accessorKey: 'manufacturerName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="MANUFACTURER" />
      ),
    },
    {
      accessorKey: 'hsnCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HSN" />
      ),
    },
    {
      accessorKey: 'rate', // change to price of catalogue
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PRICE" />
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const { id } = row.original;
        const name = row.original.productName;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-fit">
              <ConfirmAction
                name={name}
                id={id}
                // mutationKey={goodsApi.getAllProductGoods.endpointKey}
                // mutationFunc={DeleteProductGoods}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
