'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { orderApi } from '@/api/order_api/order_api';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LocalStorageService } from '@/lib/utils';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { DeleteOrder } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import { MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';

export const useSalesColumns = (setIsEditingOrder, setOrderId) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const { data: clients } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (res) => res.data.data,
  });

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
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ORDER ID" />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DATE" />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        const date = moment(createdAt).format('DD-MM-YYYY');
        return <div className="text-[#A5ABBD]">{date}</div>;
      },
    },
    {
      accessorKey: 'buyerEnterpriseId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CUSTOMERS" />
      ),
      cell: ({ row }) => {
        const client = clients?.find((clientData) => {
          const clientId = clientData?.client?.id ?? clientData?.id;
          return clientId === row.original.buyerEnterpriseId;
        });

        const clientName =
          client?.client === null
            ? client?.invitation?.userDetails?.name
            : client?.client?.name;

        return <div>{clientName}</div>;
      },
    },
    {
      accessorKey: 'negotiationStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STATUS" />
      ),
      cell: ({ row }) => {
        const status = row.original.negotiationStatus;

        let statusText;
        let statusColor;
        let statusBG;
        let statusBorder;
        let tooltip;
        switch (status) {
          case 'ACCEPTED':
            statusText = 'Accepted';
            statusColor = '#39C06F';
            statusBG = '#39C06F1A';
            statusBorder = '#39C06F';
            break;
          case 'NEW':
            statusText = 'New';
            statusColor = '#1863B7';
            statusBG = '#1863B71A';
            statusBorder = '#1863B7';
            break;
          case 'NEGOTIATION':
            statusText = 'Negotiation';
            statusColor = '#F8BA05';
            statusBG = '#F8BA051A';
            statusBorder = '#F8BA05';
            break;
          default:
            return null;
        }

        return (
          <div
            className="flex max-w-fit items-center justify-center gap-1 rounded border px-1.5 py-2 font-bold"
            style={{
              color: statusColor,
              backgroundColor: statusBG,
              border: statusBorder,
            }}
          >
            {statusText} {tooltip}
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TOTAL AMOUNT" />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const { id } = row.original;
        const name = 'order';
        const status = row.original.negotiationStatus;
        if (status === 'NEGOTIATION') return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-fit">
              {status === 'NEW' && (
                <span
                  onClick={(e) => {
                    setIsEditingOrder(true);
                    e.stopPropagation();
                    setOrderId(row.original.id);
                  }}
                  className="flex items-center justify-center gap-2 rounded-sm p-1 text-sm hover:cursor-pointer hover:bg-gray-300"
                >
                  <Pencil size={14} /> Edit
                </span>
              )}
              <ConfirmAction
                name={name}
                id={id}
                mutationKey={orderApi.getSales.endpointKey}
                mutationFunc={DeleteOrder}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
