'use client';

import { formattedAmount, isGstApplicable } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

export const useCreateSalesColumns = (
  isOrder,
  setOrder,
  setSelectedItem,
  haveGstForSalesOrders,
) => {
  return [
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEM" />
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="QUANTITY"
          className="min-w-[50px]"
        />
      ),
    },
    {
      accessorKey: 'unitPrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PRICE" />
      ),
    },
    ...(isGstApplicable(haveGstForSalesOrders)
      ? [
          {
            accessorKey: 'gstPerUnit',
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title="GST (%)"
                className="min-w-[50px]"
              />
            ),
          },
        ]
      : []),

    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={isOrder === 'invoice' ? 'INVOICE VALUE' : 'VALUE'}
        />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));

        return formattedAmount(amount);
      },
    },
    ...(isGstApplicable(haveGstForSalesOrders)
      ? [
          {
            accessorKey: 'totalGstAmount',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="TAX AMOUNT" />
            ),
          },
          {
            accessorKey: 'amount',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="AMOUNT" />
            ),
            cell: ({ row }) => {
              const amount = parseFloat(row.getValue('totalAmount'));
              const totalGstAmount = parseFloat(row.getValue('totalGstAmount'));
              const finalAmount = amount + totalGstAmount;

              return formattedAmount(finalAmount);
            },
          },
        ]
      : []),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original.productId;
        return (
          <div className="flex min-w-[50px] items-center gap-2">
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
