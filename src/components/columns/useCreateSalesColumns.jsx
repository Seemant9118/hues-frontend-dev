'use client';

import { formattedAmount, isGstApplicable } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';

export const useCreateSalesColumns = (
  isOrder,
  setOrder,
  setSelectedItem,
  isPurchasePage,
  isGstApplicableForSalesOrders,
  isGstApplicableForPurchaseOrders,
) => {
  const translations = useTranslations(
    'components.create_edit_order.form.table.header',
  );
  return [
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('item')} />
      ),
      cell: ({ row }) => {
        const { productName, serviceName } = row.original;
        return (
          <div className="flex items-center gap-2">
            <span>{productName || serviceName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('quantity')}
          className="min-w-[50px]"
        />
      ),
    },
    {
      accessorKey: 'unitPrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('price')} />
      ),
    },
    ...(isGstApplicable(
      isPurchasePage
        ? isGstApplicableForPurchaseOrders
        : isGstApplicableForSalesOrders,
    )
      ? [
          {
            accessorKey: 'gstPerUnit',
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={translations('gst')}
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
          title={
            isOrder === 'invoice'
              ? translations('invoice_value')
              : translations('value')
          }
        />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));

        return formattedAmount(amount);
      },
    },
    ...(isGstApplicable(
      isPurchasePage
        ? isGstApplicableForPurchaseOrders
        : isGstApplicableForSalesOrders,
    )
      ? [
          {
            accessorKey: 'totalGstAmount',
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={translations('tax_amount')}
              />
            ),
          },
          {
            accessorKey: 'amount',
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={translations('amount')}
              />
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
