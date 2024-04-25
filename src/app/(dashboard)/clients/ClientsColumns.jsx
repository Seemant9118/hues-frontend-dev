"use client";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";
import AddModal from "@/components/Modals/AddModal";
import ConfirmAction from "@/components/Modals/ConfirmAction";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocalStorageService } from "@/lib/utils";
import {
  DeleteEnterpriseUser,
  UpdateEnterpriseUser,
} from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { Edit3, MoreVertical } from "lucide-react";
import { useState } from "react";

export const ClientsColumns = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NAME" />
    ),
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ADDRESS" />
    ),
    cell: ({ row }) => {
      const address = row.original.address;
      return <p className="truncate">{address}</p>;
    },
  },
  {
    accessorKey: "mobileNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PHONE" />
    ),
    cell: ({ row }) => {
      const mobile_number = row.original.mobileNumber;
      return <p className="flex-shrink-0">{mobile_number}</p>;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="EMAIL" />
    ),
  },
  {
    accessorKey: "panNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PAN" />
    ),
  },
  {
    accessorKey: "gstNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GST No." />
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.userId;
      const name = row.original.name;
      const [isMenuOpen,setIsMenuOpen] = useState(false);

      return (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-w-fit">
            <AddModal
              cta="client"
              btnName="Edit"
              mutationFunc={UpdateEnterpriseUser}
              userData={row.original}
              userId={row.original.userId}
              setIsMenuOpen={setIsMenuOpen}
            />
            <ConfirmAction
              name={name}
              id={id}
              mutationKey={enterprise_user.getEnterpriseUsers.endpointKey}
              mutationFunc={DeleteEnterpriseUser}
              setIsMenuOpen={setIsMenuOpen}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
