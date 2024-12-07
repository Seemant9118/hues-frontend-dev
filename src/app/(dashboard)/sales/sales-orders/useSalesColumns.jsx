'use client';

import { orderApi } from '@/api/order_api/order_api';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LocalStorageService } from '@/lib/utils';
import { DeleteOrder } from '@/services/Orders_Services/Orders_Services';
import { Dot, MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';

export const useSalesColumns = (
  setIsEditingOrder,
  setOrderId,
  setSelectedOrders,
) => {
  const userId = LocalStorageService.get('user_profile');

  // Function to handle row selection
  const handleRowSelection = (isSelected, row) => {
    const customerName = row.original.clientName;
    const orderWithCustomer = { ...row.original, customerName };

    if (isSelected) {
      setSelectedOrders((prev) => [...prev, orderWithCustomer]);
    } else {
      setSelectedOrders((prev) =>
        prev.filter((order) => order.id !== row.original.id),
      );
    }
  };

  // Function to handle "Select All" functionality
  const handleSelectAll = (isAllSelected, rows) => {
    if (isAllSelected) {
      const allOrders = rows.map((row) => {
        const customerName = row.original.clientName;
        return { ...row.original, customerName };
      });
      setSelectedOrders(allOrders);
    } else {
      setSelectedOrders([]); // Clear all selections
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
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ORDER ID" />
      ),
      cell: ({ row }) => {
        const { referenceNumber } = row.original;
        const isSaleRead = row.original?.readTracker?.sellerIsRead;
        return (
          <div className="flex items-center">
            {!isSaleRead && <Dot size={32} className="text-[#3288ED]" />}
            <span>{referenceNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DATE" />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        const date = moment(createdAt).format('DD-MM-YYYY');
        return <div>{date}</div>;
      },
    },
    {
      accessorKey: 'clientType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CUSTOMERS TYPE" />
      ),
    },
    {
      accessorKey: 'clientName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CUSTOMERS" />
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STATUS" />
      ),
      cell: ({ row }) => {
        const sellerStatus =
          row.original?.negotiationStatus === 'WITHDRAWN'
            ? 'WITHDRAWN'
            : row.original?.metaData?.sellerData?.orderStatus;
        const paymentStatus = row.original?.metaData?.payment?.status;
        return (
          <div className="flex w-44 flex-wrap gap-1">
            <ConditionalRenderingStatus status={sellerStatus} />
            <ConditionalRenderingStatus status={paymentStatus} />
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
        const { amount, gstAmount } = row.original;
        const totalAmount = parseFloat(amount + gstAmount);

        const formattedAmt = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'INR',
        }).format(totalAmount);

        return <div>{formattedAmt}</div>;
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const { id, createdBy, referenceNumber } = row.original;
        const status = row.original.negotiationStatus;

        if (status === 'NEGOTIATION' || status === 'ACCEPTED') return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-fit">
              {status === 'NEW' &&
                userId.toString() === createdBy.toString() && (
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
                infoText={`You are removing this order ${referenceNumber}`}
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
