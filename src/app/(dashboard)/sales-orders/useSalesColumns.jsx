"use client";
import { client_enterprise } from "@/api/enterprises_user/client_enterprise/client_enterprise";
import { order_api } from "@/api/order_api/order_api";
import ConfirmAction from "@/components/Modals/ConfirmAction";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocalStorageService } from "@/lib/utils";
import { getClients } from "@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service";
import { DeleteOrder } from "@/services/Orders_Services/Orders_Services";
import { useQuery } from "@tanstack/react-query";
import { MoreVertical } from "lucide-react";
import moment from "moment";

export const useSalesColumns = () => {
  const enterprise_id = LocalStorageService.get("enterprise_Id");

  const { data: clients } = useQuery({
    queryKey: [client_enterprise.getClients.endpointKey],
    queryFn: (data) => getClients(enterprise_id),
    select: (data) => data.data.data,
  });
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
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
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ORDER ID" />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DATE" />
      ),
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        const date = moment(createdAt).format("DD-MM-YYYY");
        return <div className="text-[#A5ABBD]">{date}</div>;
      },
    },
    // {
    //   accessorKey: "item",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="ITEMS" />
    //   ),
    // },
    // {
    //   accessorKey: "type",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="TYPE"/>
    //   ),
    // },
    // {
    //   accessorKey: "quantity",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="ORDERS" />
    //   ),
    //   cell: ({ row }) => {
    //     const description = row.original.quantity;
    //     return <p className="truncate">{description}</p>;
    //   },
    // },
    {
      accessorKey: "buyerEnterpriseId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CUSTOMERS" />
      ),
      cell: ({ row }) => {
        const client = clients?.find(
          (client) => client.client.id === row.original.buyerEnterpriseId
        );
        return <div>{client?.client?.name}</div>;
      },
    },
    // {
    //   accessorKey: "price",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="PRICE" />
    //   ),
    // },
    // {
    //   accessorKey: "gst",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="GST %" />
    //   ),
    // },
    {
      accessorKey: "negotiationStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STATUS" />
      ),
      cell: ({ row }) => {
        const status = row.original.negotiationStatus;

        let statusText,
          statusColor,
          statusBG,
          statusBorder,
          btnName,
          actionBtn,
          tooltip;
        switch (status) {
          case "ACCEPTED":
            statusText = "Accepted";
            statusColor = "#39C06F";
            statusBG = "#39C06F1A";
            statusBorder = "#39C06F";
            break;
          case "NEW":
            statusText = "New";
            statusColor = "#1863B7";
            statusBG = "#1863B71A";
            statusBorder = "#1863B7";
            btnName = "Offer Price";
            break;
          case "NEGOTIATION":
            statusText = "Negotiation";
            statusColor = "#F8BA05";
            statusBG = "#F8BA051A";
            statusBorder = "#F8BA05";
            actionBtn = "action";
            break;
          default:
            return null;
        }

        return (
          <div
            className="max-w-fit px-1.5 py-2 flex justify-center items-center font-bold border rounded gap-1"
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
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TOTAL AMOUNT" />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "INR",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original.id;
        const name = "order";
        const status = row.original.negotiationStatus;
        if (status === "NEGOTIATION") return null;
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
                mutationKey={order_api.getSales.endpointKey}
                mutationFunc={DeleteOrder}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
