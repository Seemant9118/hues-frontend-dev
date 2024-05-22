"use client";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";
import { client_enterprise } from "@/api/enterprises_user/client_enterprise/client_enterprise";
import AddModal from "@/components/Modals/AddModal";
import ConfirmAction from "@/components/Modals/ConfirmAction";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteClient,
  updateClient,
} from "@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service";
import {
  DeleteEnterpriseUser,
  UpdateEnterpriseUser,
} from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { MoreVertical } from "lucide-react";

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
      const id = row.original.id;
      const name = row.original.name;

      return (
        <DropdownMenu>
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
              mutationFunc={updateClient}
              userData={row.original}
              id={id}
            />
            <ConfirmAction
              name={name}
              id={id}
              mutationKey={client_enterprise.getClients.endpointKey}
              mutationFunc={deleteClient}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
