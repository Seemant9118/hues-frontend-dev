"use client";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";
import { Edit3, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ShareModal from "@/components/Modals/ShareModal";
import ConfirmAction from "@/components/Modals/ConfirmAction";
import { services_api } from "@/api/inventories/services/services";
import { DeleteProductServices } from "@/services/Inventories_Services/Services_Inventories/Services_Inventories";

export const useServicesColumns = (setIsEditing, setServicesToEdit) => {
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
    //     accessorKey: "type",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="ITEM TYPE" />
    //     ),
    // },
    {
      accessorKey: "serviceName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SERVICE NAME" />
      ),
    },
    {
      accessorKey: "sac",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SAC" />
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
        const id = row.original.id;
        const name = row.original.serviceName;

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
                  setServicesToEdit(row.original);
                }}
              >
                <Edit3 size={12} />
                Edit
              </DropdownMenuItem>

              <ShareModal currLink="https://www.hues.com?/sfkaskjvbsdl45!" />

              <ConfirmAction
                name={name}
                id={id}
                mutationKey={services_api.getAllProductServices.endpointKey}
                mutationFunc={DeleteProductServices}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
