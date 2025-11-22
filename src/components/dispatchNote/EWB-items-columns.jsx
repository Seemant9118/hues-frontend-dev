'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const useEWBItemColumns = () => {
  return [
    // Product Name
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Name" />
      ),
      cell: ({ row }) => <span>{row.original.productName}</span>,
    },

    // Product Description
    {
      accessorKey: 'productDesc',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <span className="line-clamp-2 text-muted-foreground">
          {row.original.productDesc}
        </span>
      ),
    },

    // HSN Code
    {
      accessorKey: 'hsnCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HSN Code" />
      ),
      cell: ({ row }) => <span>{row.original.hsnCode}</span>,
    },

    // Quantity
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.quantity} {row.original.qtyUnit}
        </span>
      ),
    },

    // Taxable Amount
    {
      accessorKey: 'taxableAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Taxable Value" />
      ),
      cell: ({ row }) => (
        <span>₹{Number(row.original.taxableAmount).toFixed(2)}</span>
      ),
    },

    // SGST
    {
      accessorKey: 'sgstRate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SGST %" />
      ),
      cell: ({ row }) => <span>{row.original.sgstRate}%</span>,
    },

    // CGST
    {
      accessorKey: 'cgstRate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CGST %" />
      ),
      cell: ({ row }) => <span>{row.original.cgstRate}%</span>,
    },

    // IGST
    {
      accessorKey: 'igstRate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="IGST %" />
      ),
      cell: ({ row }) => <span>{row.original.igstRate}%</span>,
    },

    // Cess
    {
      accessorKey: 'cessRate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cess %" />
      ),
      cell: ({ row }) => <span>{row.original.cessRate}%</span>,
    },
  ];
};
