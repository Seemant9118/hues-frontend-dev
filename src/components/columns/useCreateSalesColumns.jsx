'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

export const useCreateSalesColumns = (setOrder) => {
  return [
    {
      accessorKey: 'product_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEM" />
      ),
    },
    {
      accessorKey: 'unit_price',
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
      accessorKey: 'gst_per_unit',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GST (%)" />
      ),
    },

    {
      accessorKey: 'total_amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="AMOUNT" />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('total_amount'));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original.product_id;
        return (
          <div className="flex items-center gap-2">
            <Button variant="grey" size="icon">
              <Edit2 size={14} />
            </Button>
            <Button
              className="text-red-500"
              variant="ghost"
              size="icon"
              onClick={() => {
                setOrder((prev) => ({
                  ...prev,
                  order_items: prev.order_items.filter(
                    (item) => item.product_id !== id,
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
