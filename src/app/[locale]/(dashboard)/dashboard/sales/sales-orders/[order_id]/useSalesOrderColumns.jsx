'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

export const useSalesOrderColumns = (status) => {
  const translations = useTranslations(
    'sales.sales-orders.order_details.tabs.content.tab1.table.header',
  );
  return [
    {
      accessorKey: 'item',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('item')} />
      ),
      cell: ({ row }) => {
        const { productType } = row.original;
        const name =
          productType === 'GOODS'
            ? row.original.productDetails.productName
            : row.original.productDetails.serviceName;
        return name;
      },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => {
        return status === 'ACCEPTED' || status === 'PARTIAL_INVOICED' ? (
          <DataTableColumnHeader
            column={column}
            title={translations('invoice_quantity')}
          />
        ) : (
          <DataTableColumnHeader
            column={column}
            title={translations('quantity')}
          />
        );
      },
      cell: ({ row }) => {
        const isNegotiation = row.original?.negotiation;
        const { invoiceQuantity, quantity } = row.original;
        const negotiationQty = row.original?.negotiation?.quantity;
        const unitType = row.original?.unit?.abbreviation;

        return status === 'ACCEPTED' || status === 'PARTIAL_INVOICED' ? (
          <div>
            {invoiceQuantity} / {isNegotiation ? negotiationQty : quantity}{' '}
            {unitType}
          </div>
        ) : (
          <div>
            {isNegotiation ? negotiationQty : quantity} {unitType}
          </div>
        );
      },
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('ask_rate')}
        />
      ),
      cell: ({ row }) => {
        const isNegotiation = row.original?.negotiation;
        const { unitPrice } = row.original;
        const askRate = row.original?.negotiation?.unitPrice;
        return <div>{isNegotiation ? askRate : unitPrice}</div>;
      },
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
        const isNegotiation = row.original?.negotiation;
        const amount = parseFloat(row.getValue('totalAmount'));
        const negotiateAmt = parseFloat(row.original?.negotiation?.price);

        return formattedAmount(isNegotiation ? negotiateAmt : amount);
      },
    },
  ];
};
