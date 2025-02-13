'use client';

import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { capitalize } from '@/appUtils/helperFunctions';
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
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export const useCatalogueColumns = (setSelectedCatalogue) => {
  const translations = useTranslations('catalogue');

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
          <DataTableColumnHeader
            column={column}
            title={translations('table.header.item')}
          />
        ),
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={translations('table.header.type')}
          />
        ),
        cell: ({ row }) => {
          return <div>{capitalize(row.original.type)}</div>;
        },
      },
      {
        accessorKey: 'sku', // Change to SKU of the catalogue
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={translations('table.header.sku')}
          />
        ),
        cell: ({ row }) => {
          const { sku } = row.original;
          return <>{sku || '-'}</>;
        },
      },
      {
        accessorKey: 'manufacturerName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={translations('table.header.manufacturer')}
          />
        ),
        cell: ({ row }) => {
          const { manufacturerName } = row.original;
          return manufacturerName ?? '-';
        },
      },
      {
        accessorKey: 'hsnCode',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={translations('table.header.hsnSac')}
          />
        ),
      },
      {
        accessorKey: 'rate',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={translations('table.header.price')}
          />
        ),
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const { itemId, name, type } = row.original;

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
                  deleteCta={translations('table.columnActions.remove.cta')}
                  infoText={translations(
                    'table.columnActions.remove.infoText',
                    {
                      name,
                    },
                  )}
                  cancelCta={translations('table.columnActions.remove.cancel')}
                  id={itemId}
                  type={type}
                  invalidateKey={catalogueApis.getCatalogues.endpointKey}
                  mutationKey={catalogueApis.deleteCatalogue.endpointKey}
                  mutationFunc={deleteCatalogue}
                  successMsg={translations(
                    'table.columnActions.remove.successMsg',
                  )}
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
