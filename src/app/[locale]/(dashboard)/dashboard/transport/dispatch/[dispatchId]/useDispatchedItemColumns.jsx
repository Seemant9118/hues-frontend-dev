'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

export const useDispatchedItemColumns = ({ movementType }) => {
  const translations = useTranslations(
    'transport.dispatched-notes.dispatch_details.tabs.tab2.table.header',
  );

  return [
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('product')}
        />
      ),
      cell: ({ row }) => {
        const { productName, product } = row.original;
        return <span>{productName || product?.name}</span>;
      },
    },

    ...(movementType === 'OUTWARD'
      ? [
          {
            accessorKey: 'invoiceQuantity',
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={translations('invoiceQty')}
              />
            ),
            cell: ({ row }) => row.original.invoiceQuantity ?? '-',
          },
        ]
      : []),

    {
      accessorKey: 'dispatchedQuantity',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('dispatchedQty')}
        />
      ),
      cell: ({ row }) => {
        const { dispatchedQuantity } = row.original;
        return dispatchedQuantity;
      },
    },

    {
      accessorKey: 'rate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('rate')} />
      ),
      cell: ({ row }) => {
        const { rate } = row.original;
        return formattedAmount(rate);
      },
    },

    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('amount')} />
      ),
      cell: ({ row }) => {
        const { amount } = row.original;
        return formattedAmount(amount);
      },
    },
  ];
};
