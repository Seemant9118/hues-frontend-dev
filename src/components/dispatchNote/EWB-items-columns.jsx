'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const useEWBItemColumns = () => {
  return [
    // Product Name
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Name" />
      ),
      cell: ({ row }) => {
        const productName =
          row.original?.invoiceItem?.orderItemId?.productDetails?.productName ||
          '--';
        return <span>{productName}</span>;
      },
    },

    // Product Description
    {
      accessorKey: 'productDesc',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const productDesc =
          row.original?.invoiceItem?.orderItemId?.productDetails?.description ||
          '--';
        return (
          <span className="line-clamp-2 text-muted-foreground">
            {productDesc}
          </span>
        );
      },
    },

    // HSN Code
    {
      accessorKey: 'hsnCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HSN Code" />
      ),
      cell: ({ row }) => {
        const hsnCode =
          row.original?.invoiceItem?.orderItemId?.productDetails?.hsnCode ||
          '--';
        return <span>{hsnCode}</span>;
      },
    },

    // Quantity
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty" />
      ),
      cell: ({ row }) => {
        const dispatchedQty = row.original?.dispatchedQuantity || '--';
        return <span>{dispatchedQty}</span>;
      },
    },

    // Taxable Amount
    {
      accessorKey: 'taxableAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Taxable Value" />
      ),
      cell: ({ row }) => {
        const taxableAmount = row.original?.amount || '--';
        return <span>{formattedAmount(taxableAmount)}</span>;
      },
    },

    // SGST
    {
      accessorKey: 'sgstRate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SGST %" />
      ),
      cell: ({ row }) => {
        const sgst = row.original?.sgst;
        return <span>{sgst ? `${sgst}%` : '--'}</span>;
      },
    },

    // CGST
    {
      accessorKey: 'cgstRate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CGST %" />
      ),
      cell: ({ row }) => {
        const cgst = row.original?.cgst;
        return <span>{cgst ? `${cgst}%` : '--'}</span>;
      },
    },

    // IGST
    {
      accessorKey: 'igstRate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="IGST %" />
      ),
      cell: ({ row }) => {
        const igst = row.original?.igst;
        return <span>{igst ? `${igst}%` : '--'}</span>;
      },
    },

    // Cess
    {
      accessorKey: 'cessRate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cess %" />
      ),
      cell: ({ row }) => {
        const cess = row.original?.cess;
        return <span>{cess ? `${cess}%` : '--'}</span>;
      },
    },
  ];
};
