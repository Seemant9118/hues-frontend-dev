'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';

export const useServicesColumnsForCatalogue = (
  selectedServicesItems,
  setSelectedServicesItems,
) => {
  // Function to handle row selection
  const handleRowSelection = (isSelected, row) => {
    const catalogueWithServices = {
      itemId: row.original.id,
      cataloguePrice: row.original.rate,
      catalogueQuantity: row.original.quantity ?? null,
      type: 'SERVICE',
    };

    if (isSelected) {
      setSelectedServicesItems((prev) => [...prev, catalogueWithServices]);
    } else {
      setSelectedServicesItems((prev) =>
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
          catalogueQuantity: row.original.quantity ?? null,
          type: 'SERVICE',
        };
      });
      setSelectedServicesItems(allItems);
    } else {
      setSelectedServicesItems([]); // Clear all selections
    }
  };

  // Extract selected row IDs
  const selectedRowIds = selectedServicesItems.map((item) => item.itemId);

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
      accessorKey: 'serviceName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SERVICE NAME" />
      ),
    },
    {
      accessorKey: 'sac',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SAC" />
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DESCRIPTION" />
      ),
      cell: ({ row }) => {
        const { description } = row.original;
        return <p className="truncate">{description}</p>;
      },
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
