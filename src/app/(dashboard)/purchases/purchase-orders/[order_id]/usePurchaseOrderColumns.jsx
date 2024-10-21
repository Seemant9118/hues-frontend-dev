'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const usePurchaseOrderColumns = () => {
  return [
    {
      accessorKey: 'item',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEMS" />
      ),
      cell: ({ row }) => {
        const { productType } = row.original;
        const name =
          productType === 'GOODS'
            ? row.original?.productDetails?.productName
            : row.original?.productDetails?.serviceName;
        return name;
      },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QUANTITY" />
      ),
      cell: ({ row }) => {
        const isNegotiation = row.original?.negotiation;
        const { quantity } = row.original;
        const negotiationQty = row.original?.negotiation?.quantity;
        return <div>{isNegotiation ? negotiationQty : quantity}</div>;
      },
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ASKING RATE" />
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
        <DataTableColumnHeader column={column} title="TOTAL AMOUNT" />
      ),
      cell: ({ row }) => {
        const isNegotiation = row.original?.negotiation;
        const amount = parseFloat(row.getValue('totalAmount'));
        const negotiateAmt = parseFloat(row.original?.negotiation?.price);

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'INR',
        }).format(isNegotiation ? negotiateAmt : amount);
        return <div>{formatted}</div>;
      },
    },
  ];
};
