"use client";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";
import { Check, Edit3, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ShareModal from "@/components/Modals/ShareModal";
import AddItem from "@/components/AddItem";
import {
  DeleteProductGoods,
  UpdateProductGoods,
} from "@/services/Inventories_Services/Goods_Inventories/Goods_Inventories";
import { useState } from "react";
import ConfirmAction from "@/components/Modals/ConfirmAction";
import { goods_api } from "@/api/inventories/goods/goods";

export const useGoodsColumns = (setIsEditing, setGoodsToEdit) => {
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
    // {
    //   accessorKey: "type",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="ITEM TYPE" />
    //   ),
    // },
    {
      accessorKey: "productName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PRODUCT NAME" />
      ),
    },
    {
      accessorKey: "manufacturerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="MANUFACTURER NAME" />
      ),
    },
    {
      accessorKey: "hsnCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CODE" />
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DESCRIPTION" />
      ),
      cell: ({ row }) => {
        const description = row.original.description;
        return <p className="truncate">{description}</p>;
      },
    },
    {
      accessorKey: "rate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="RATE" />
      ),
    },
    {
      accessorKey: "gstPercentage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GST (%)" />
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;
        const id = row.original.id;
        const name = row.original.productName;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-fit">
              <DropdownMenuItem
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  setIsEditing((prev) => !prev);
                  setGoodsToEdit(row.original);
                }}
              >
                <Edit3 size={12} />
                Edit
              </DropdownMenuItem>

              <ShareModal currLink="https://www.hues.com?/sfkaskjvbsdl45!" />

              <ConfirmAction
                name={name}
                id={id}
                mutationKey={goods_api.getAllProductGoods.endpointKey}
                mutationFunc={DeleteProductGoods}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
