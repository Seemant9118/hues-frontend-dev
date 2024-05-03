"use client";
import Tooltips from "@/components/Tooltips";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";
import moment from "moment";

export const PurchaseColumns = [
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
      <DataTableColumnHeader column={column} title="PURCHASE ID" />
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
  //   accessorKey: "type",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="TYPE" />
  //   ),
  // },
  // {
  //   accessorKey: "quantity",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="PURCHASE ORDERS" />
  //   ),
  //   cell: ({ row }) => {
  //     const description = row.original.quantity;
  //     return <p className="truncate">{description}</p>;
  //   },
  // },
  {
    accessorKey: "buyerEnterpriseId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="VENDORS" />
    ),
  },
  // {
  //   accessorKey: "delivery_date",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="DELIVERY DATE" />
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
          tooltip = (
            <Tooltips trigger={<Info size={14} />} isContentShow="true" />
          );
          break;
        default:
          return null;
      }

      return (
        <div
          className="w-24 p-1 flex justify-center items-center font-bold border rounded gap-1"
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
      <DataTableColumnHeader column={column} title="AMOUNT" />
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
];
