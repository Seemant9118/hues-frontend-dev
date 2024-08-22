'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const useEditColumns = (setSelectedItem, setOrder) => {
  // Update the order state when input values change
  const handleInputChange = (row, key, newValue) => {
    setOrder((prev) => ({
      ...prev,
      orderItems: prev.orderItems.map((item) =>
        item.productId === row.original.productId
          ? { ...item, [key]: Number(newValue) }
          : item,
      ),
    }));
  };

  return [
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'ITEM'} />
      ),
    },
    {
      accessorKey: 'unitPrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PRICE" />
      ),
      cell: ({ row }) => {
        const { unitPrice } = row.original;
        return (
          <Input
            type="number"
            value={unitPrice}
            onChange={(e) =>
              handleInputChange(row, 'unitPrice', e.target.value)
            }
          />
        );
      },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QUANTITY" />
      ),
      cell: ({ row }) => {
        const { quantity } = row.original;
        return (
          <Input
            type="number"
            value={quantity}
            onChange={(e) => handleInputChange(row, 'quantity', e.target.value)}
          />
        );
      },
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
        <DataTableColumnHeader column={column} title="AMOUNT" />
      ),
      cell: ({ row }) => {
        const { quantity, unitPrice } = row.original;
        const amount = parseFloat(quantity * unitPrice) || 0;

        // Format the amount as INR
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
        const { productId } = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              className="text-red-500"
              variant="ghost"
              size="icon"
              onClick={() => {
                setOrder((prev) => ({
                  ...prev,
                  orderItems: prev.orderItems.filter(
                    (item) => item.productId !== productId,
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
