'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
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
import { useQuery } from '@tanstack/react-query';
import { MoreVertical } from 'lucide-react';

export const useCatlogueColumns = (setSelectedCatalogue) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const { data: clients } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (res) => res.data.data,
  });

  // Function to get customer name from clients list
  const getCustomerName = (buyerEnterpriseId) => {
    const client = clients?.find((clientData) => {
      const clientId = clientData?.client?.id ?? clientData?.id;
      return clientId === buyerEnterpriseId;
    });

    return client?.client === null
      ? client?.invitation?.userDetails?.name
      : client?.client?.name;
  };

  // Function to handle row selection
  const handleRowSelection = (isSelected, row) => {
    const customerName = getCustomerName(row.original.buyerEnterpriseId);
    const orderWithCustomer = { ...row.original, customerName };

    if (isSelected) {
      setSelectedCatalogue((prev) => [...prev, orderWithCustomer]);
    } else {
      setSelectedCatalogue((prev) =>
        prev.filter((order) => order.id !== row.original.id),
      );
    }
  };

  // Function to handle "Select All" functionality
  const handleSelectAll = (isAllSelected, rows) => {
    if (isAllSelected) {
      const allOrders = rows.map((row) => {
        const customerName = getCustomerName(row.original.buyerEnterpriseId);
        return { ...row.original, customerName };
      });
      setSelectedCatalogue(allOrders);
    } else {
      setSelectedCatalogue([]); // Clear all selections
    }
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
            checked={row.getIsSelected()}
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
      accessorKey: 'productName', // change to itemName of catalogue
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEM" />
      ),
    },
    {
      accessorKey: 'id', // change to sku of catalogue
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" />
      ),
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
        <DataTableColumnHeader column={column} title="HSN" />
      ),
    },
    {
      accessorKey: 'rate', // change to price of catalogue
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PRICE" />
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const { id } = row.original;
        const name = row.original.productName;
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
                name={name}
                id={id}
                // mutationKey={goodsApi.getAllProductGoods.endpointKey}
                // mutationFunc={DeleteProductGoods}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
