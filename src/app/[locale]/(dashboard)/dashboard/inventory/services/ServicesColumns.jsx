'use client';

import { servicesApi } from '@/api/inventories/services/services';
import { formattedAmount } from '@/appUtils/helperFunctions';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import { usePermission } from '@/hooks/usePermissions';
import { DeleteProductServices } from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useServicesColumns = (setIsEditing, setServicesToEdit, router) => {
  const translations = useTranslations('services');
  const { hasAnyPermission } = usePermission();

  const baseColumns = [
    {
      accessorKey: 'serviceName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.serviceName')}
        />
      ),
      cell: ({ row }) => {
        const { serviceName } = row.original;
        return (
          <div className="flex items-center gap-1">
            <span className="hover:text-primary hover:underline">
              {serviceName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'serviceCode',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.serviceCode')}
        />
      ),
    },
    {
      accessorKey: 'shortDescription',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.description')}
        />
      ),
      cell: ({ row }) => {
        const defaultValue =
          row.original?.config?.short_description?.defaultValue || '-';
        return <p className="truncate">{defaultValue}</p>;
      },
    },
    {
      accessorKey: 'basePrice',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.rate')}
        />
      ),
      cell: ({ row }) => {
        const value = row.getValue('basePrice');
        return formattedAmount(value);
      },
    },
    {
      accessorKey: 'gstPercentage',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.gst')}
        />
      ),
      cell: ({ row }) => {
        const value = row.original?.config?.gst_percentage?.defaultValue;
        return value ? `${value}%` : '-';
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.addedOn')}
        />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        const date = moment(createdAt).format('DD-MM-YYYY');
        return <div>{date}</div>;
      },
    },
  ];

  // Conditionally add actions column
  const canShowActions = hasAnyPermission([
    'permission:item-masters-edit',
    'permission:item-masters-delete',
  ]);

  if (canShowActions) {
    baseColumns.push({
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const { id } = row.original;
        const name = row.original.serviceName;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-fit">
              <ProtectedWrapper permissionCode="permission:item-masters-edit">
                <DropdownMenuItem
                  className="flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setServicesToEdit(row.original);
                    router.push('/dashboard/inventory/services?action=edit');
                    setIsEditing(true);
                  }}
                >
                  <Pencil size={12} />
                  {translations('table.columnActions.edit')}
                </DropdownMenuItem>
              </ProtectedWrapper>

              <ProtectedWrapper permissionCode="permission:item-masters-delete">
                <ConfirmAction
                  deleteCta={translations('table.columnActions.delete.cta')}
                  infoText={translations(
                    'table.columnActions.delete.infoText',
                    {
                      name,
                    },
                  )}
                  cancelCta={translations('table.columnActions.delete.cancel')}
                  id={id}
                  mutationKey={servicesApi.getAllProductServices.endpointKey}
                  mutationFunc={DeleteProductServices}
                  successMsg={translations(
                    'table.columnActions.delete.successMsg',
                  )}
                />
              </ProtectedWrapper>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return baseColumns;
};
