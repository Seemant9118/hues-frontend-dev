'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import AddModal from '@/components/Modals/AddModal';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import GenerateLink from '@/components/enterprise/GenerateLink';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  deleteClient,
  updateClient,
} from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { generateLink } from '@/services/Invitation_Service/Invitation_Service';
import { MoreVertical } from 'lucide-react';

export const ClientsColumns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NAME" />
    ),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ADDRESS" />
    ),
    cell: ({ row }) => {
      const { address } = row.original;
      return <p className="truncate">{address}</p>;
    },
  },
  {
    accessorKey: 'mobileNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PHONE" />
    ),
    cell: ({ row }) => {
      const { mobileNumber } = row.original;
      return <p className="flex-shrink-0">{mobileNumber}</p>;
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="EMAIL" />
    ),
  },
  {
    accessorKey: 'panNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PAN" />
    ),
  },
  {
    accessorKey: 'gstNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GST No." />
    ),
  },
  {
    accessorKey: 'invitation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="INVITATION" />
    ),
    cell: ({ row }) => {
      const id = row.original.invitationId;
      const { invitationStatus } = row.original;
      return (
        <GenerateLink
          invitationStatus={invitationStatus}
          invitationId={id}
          mutationFunc={generateLink}
        />
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const { id } = row.original;
      const { name } = row.original;

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
              mutationKey={clientEnterprise.getClients.endpointKey}
              mutationFunc={deleteClient}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
