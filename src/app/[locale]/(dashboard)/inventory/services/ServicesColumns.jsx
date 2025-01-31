'use client';

import { servicesApi } from '@/api/inventories/services/services';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteProductServices } from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useServicesColumns = (setIsEditing, setServicesToEdit) => {
  const translations = useTranslations('services');

  return [
    {
      accessorKey: 'serviceName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.serviceName')}
        />
      ),
    },
    {
      accessorKey: 'sac',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.sac')}
        />
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.description')}
        />
      ),
      cell: ({ row }) => {
        const { description } = row.original;
        return <p className="truncate">{description}</p>;
      },
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.rate')}
        />
      ),
    },
    {
      accessorKey: 'gstPercentage',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.gst')}
        />
      ),
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
    {
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
              <DropdownMenuItem
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  setIsEditing((prev) => !prev);
                  setServicesToEdit(row.original);
                }}
              >
                <Pencil size={12} />
                {translations('table.columnActions.edit')}
              </DropdownMenuItem>

              <ConfirmAction
                deleteCta={translations('table.columnActions.delete')}
                infoText={`You are removing ${name} from inventory`}
                id={id}
                mutationKey={servicesApi.getAllProductServices.endpointKey}
                mutationFunc={DeleteProductServices}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
