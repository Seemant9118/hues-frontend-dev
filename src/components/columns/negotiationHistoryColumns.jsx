"use client";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";

export const negotiationHistoryColumns = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DATE"/>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
  },
  {
    accessorKey: "priceType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TYPE" />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PRICE" />
    ),
  },
];
