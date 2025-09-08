'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

export const useSalesInvoiceColumns = () => {
  const translations = useTranslations(
    'sales.sales-invoices.invoice_details.tabs.content.tab1.table.header',
  );
  return [
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('item')} />
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('quantity')}
        />
      ),
      cell: ({ row }) => {
        const { quantity } = row.original;
        const unitType = row.original?.unit?.abbreviation;
        return (
          <div>
            {quantity} {unitType}
          </div>
        );
      },
    },
    {
      accessorKey: 'unitPrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('rate')} />
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('total_amount')}
        />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));

        return formattedAmount(amount);
      },
    },
  ];
};
