'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const useItemsColumns = ({
  setPartialInvoiceData,
  partialInvoiceData,
}) => {
  const handleRowSelection = (row, value) => {
    const updatedSelection = value
      ? [...partialInvoiceData, row.original]
      : partialInvoiceData.filter((item) => item.id !== row.original.id);

    setPartialInvoiceData(updatedSelection);
  };

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              handleRowSelection(row, !!value);
            }}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEM NAME" />
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QUANTITY" />
      ),
      cell: ({ row }) => {
        const { quantity } = row.original;
        return (
          <div className="flex gap-1">
            <Button variant="export" onClick={() => quantity - 1}>
              -
            </Button>
            <Input
              type="text"
              name="quantity"
              className="w-20"
              value={quantity}
            />
            <Button variant="export" onClick={() => quantity + 1}>
              +
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TOTAL AMOUNT" />
      ),
      cell: ({ row }) => {
        const totalAmt = row.original.quantity * row.original.rate;
        return (
          <Input
            type="text"
            name="quantity"
            disabled
            className="w-20 disabled:cursor-not-allowed"
            value={totalAmt}
          />
        );
      },
    },
  ];
};
