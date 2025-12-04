'use client';

import { formattedAmount, isGstApplicable } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { SessionStorageService } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';

export const useCreateSalesColumns = (
  isOrder,
  isOfferType,
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
    ...(isOfferType === 'SERVICE'
      ? [
          {
            accessorKey: 'discountPercentage',
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={translations('discount')}
                className="min-w-[50px]"
              />
            ),
          },
        ]
      : []),
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
            accessorKey: 'finalAmount',
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={translations('amount')}
              />
            ),
            cell: ({ row }) => {
              const finalAmount = parseFloat(row.getValue('finalAmount'));
              return formattedAmount(finalAmount);
            },
          },
        ]
      : []),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex min-w-[50px] items-center gap-2">
            <Button
              className="text-red-500"
              variant="ghost"
              size="icon"
              onClick={() => {
                // Move item back to selectedItem
                setSelectedItem({
                  ...row.original,
                  productId: row.original.id || row.original.productId,
                });

                // Update order state (remove item)
                setOrder((prev) => {
                  const updatedItems = prev.orderItems.filter(
                    (item) => item.productId !== row.original.productId,
                  );

                  const updatedOrder = {
                    ...prev,
                    orderItems: updatedItems,
                  };

                  // Update session storage with updatedOrder and restored itemDraft
                  if (isPurchasePage) {
                    const prevDraft =
                      SessionStorageService.get('bidDraft') || {};
                    SessionStorageService.set('bidDraft', {
                      ...prevDraft,
                      ...updatedOrder,
                      itemDraft: row.original,
                    });
                  } else {
                    const prevDraft =
                      SessionStorageService.get('orderDraft') || {};
                    SessionStorageService.set('orderDraft', {
                      ...prevDraft,
                      ...updatedOrder,
                      itemDraft: row.original,
                    });
                  }

                  return updatedOrder;
                });
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
