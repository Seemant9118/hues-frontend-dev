'use client';

import { catalogueApis } from '@/api/catalogue/catalogueApi';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteCatalogue } from '@/services/Catalogue_Services/CatalogueServices';
import { MoreVertical } from 'lucide-react';
import { useEffect, useMemo } from 'react';

export const useCatalogueColumns = (
  bulkDeleteIsSuccess,
  setSelectedCatalogue,
) => {
  // Function to handle row selection
  const handleRowSelection = (isSelected, row) => {
    setSelectedCatalogue((prev) => {
      if (isSelected) {
        // Add the row to the selected catalogue if it's not already present
        return [...prev, row.original];
      } else {
        // Remove the row from the selected catalogue
        return prev.filter((item) => item.itemId !== row.original.itemId);
      }
    });
  };

  // Function to handle "Select All" functionality
  const handleSelectAll = (isAllSelected, rows) => {
    setSelectedCatalogue(() => {
      if (isAllSelected) {
        // Select all rows
        return rows.map((row) => row.original);
      } else {
        // Deselect all rows
        return [];
      }
    });
  };

  // Effect to clear selected rows after a successful bulk delete
  useEffect(() => {
    if (bulkDeleteIsSuccess) {
      setSelectedCatalogue([]); // Clear selectedCatalogue state
    }
  }, [bulkDeleteIsSuccess, setSelectedCatalogue]);

  // Column definitions
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => {
              const isAllSelected = !!value;
              table.toggleAllPageRowsSelected(isAllSelected);
              handleSelectAll(isAllSelected, table.getRowModel().rows);
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
              checked={row.getIsSelected()}
              onCheckedChange={(value) => {
                const isSelected = !!value;
                row.toggleSelected(isSelected);
                handleRowSelection(isSelected, row);
              }}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ITEM" />
        ),
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="TYPE" />
        ),
      },
      {
        accessorKey: 'itemId', // Change to SKU of the catalogue
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="SKU" />
        ),
      },
      {
        accessorKey: 'manufacturerName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={'MANUFACTURER'} />
        ),
        cell: ({ row }) => {
          const { manufacturerName } = row.original;
          return manufacturerName ?? '-';
        },
      },
      {
        accessorKey: 'hsnCode',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={'HSN/SAC'} />
        ),
      },
      {
        accessorKey: 'rate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="PRICE" />
        ),
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const { productId, name, type } = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-w-fit">
                <ConfirmAction
                  infoText={`You are removing ${name} from catalogue`}
                  id={productId}
                  type={type}
                  invalidateKey={catalogueApis.getCatalogues.endpointKey}
                  mutationKey={catalogueApis.deleteCatalogue.endpointKey}
                  mutationFunc={deleteCatalogue}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [setSelectedCatalogue],
  );

  return columns;
};
