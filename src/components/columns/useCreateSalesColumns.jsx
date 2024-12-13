'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

export const useCreateSalesColumns = (isOrder, setOrder, setSelectedItem) => {
  return [
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEM" />
      ),
    },
    {
      accessorKey: 'unitPrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PRICE" />
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QUANTITY" />
      ),
    },
    {
      accessorKey: 'gstPerUnit',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GST (%)" />
      ),
    },

    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={isOrder === 'invoice' ? 'INVOICE VALUE' : 'AMOUNT'}
        />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));

        return formattedAmount(amount);
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original.productId;
        return (
          <div className="flex items-center gap-2">
            <Button
              className="text-red-500"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedItem(row.original);
                setOrder((prev) => ({
                  ...prev,
                  orderItems: prev.orderItems.filter(
                    (item) => item.productId !== id,
                  ),
                }));
              }}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        );
      },
    },
  ];
};
