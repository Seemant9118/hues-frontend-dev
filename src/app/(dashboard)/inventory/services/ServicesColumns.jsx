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
import { Edit3, MoreVertical } from 'lucide-react';
import moment from 'moment';

export const useServicesColumns = (setIsEditing, setServicesToEdit) => {
  return [
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
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ADDED ON" />
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
                <Edit3 size={12} />
                Edit
              </DropdownMenuItem>

              <ConfirmAction
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
