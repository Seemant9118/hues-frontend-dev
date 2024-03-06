"use client";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { Edit2, Trash2 } from "lucide-react";

export const CreateSalesColumns = [
  {
    accessorKey: "item",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ITEM" />
    ),
  },
  {
    accessorKey: "unit_price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="UNIT PRICE" />
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="QUANTITY" />
    ),
  },
  {
    accessorKey: "gst",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GST (%)" />
    ),
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
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="grey" size="icon">
            <Edit2 size={14} />
          </Button>
          <Button className="text-red-500" variant="ghost" size="icon">
            <Trash2 size={14} />
          </Button>
        </div>
      );
    },
  },
];
