'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

export const useDispatchedItemColumns = () => {
  const translations = useTranslations(
    'sales.sales-dispatched-notes.dispatch_details.tabs.tab2.table.header',
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
        const { productName } = row.original;
        return <span>{productName}</span>;
      },
    },

    {
      accessorKey: 'invoiceQuantity',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('invoiceQty')}
        />
      ),
      cell: ({ row }) => {
        const { invoiceQuantity } = row.original;
        return invoiceQuantity;
      },
    },

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
