'use client';

import Tooltips from '@/components/auth/Tooltips';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { Info } from 'lucide-react';

export const useGoodsColumnsForCatalogue = (
  selectedGoodsItems,
  setSelectedGoodsItems,
) => {
  // Function to handle row selection
  const handleRowSelection = (isSelected, row) => {
    const catalogueWithGoods = {
      itemId: row.original.id,
      cataloguePrice: row.original.rate,
      catalogueQuantity: row.original.quantity,
      type: 'GOODS',
    };

    if (isSelected) {
      setSelectedGoodsItems((prev) => [...prev, catalogueWithGoods]);
    } else {
      setSelectedGoodsItems((prev) =>
        prev.filter((item) => item.itemId !== row.original.id),
      );
    }
  };

  // Function to handle "Select All" functionality
  const handleSelectAll = (isAllSelected, rows) => {
    if (isAllSelected) {
      const allItems = rows.map((row) => {
        return {
          itemId: row.original.id,
          cataloguePrice: row.original.rate,
          catalogueQuantity: row.original.quantity,
          type: 'GOODS',
        };
      });
      setSelectedGoodsItems(allItems);
    } else {
      setSelectedGoodsItems([]); // Clear all selections
    }
  };

  // Extract selected row IDs
  const selectedRowIds = selectedGoodsItems.map((item) => item.itemId);

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            handleSelectAll(!!value, table.getRowModel().rows);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <div
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click from being triggered
          }}
        >
          <Checkbox
            // checked={row.getIsSelected()}
            checked={selectedRowIds.includes(row.original.id)} // Sync UI with external state
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              handleRowSelection(!!value, row);
            }}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PRODUCT" />
      ),
      cell: ({ row }) => {
        const { description, productName } = row.original;
        return (
          <div className="flex items-center gap-1">
            {productName}
            <Tooltips trigger={<Info size={14} />} content={description} />
          </div>
        );
      },
    },
    {
      accessorKey: 'manufacturerName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="MANUFACTURER" />
      ),
    },
    {
      accessorKey: 'hsnCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HSN CODE" />
      ),
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="RATE" />
      ),
    },
    {
      accessorKey: 'gstPercentage',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GST (%)" />
      ),
    },
  ];
};
