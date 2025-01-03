'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import GenerateLink from '@/components/enterprise/GenerateLink';
import ResendInvitation from '@/components/enterprise/ResendInvitaion';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  generateLink,
  resendInvitation,
} from '@/services/Invitation_Service/Invitation_Service';
import { MoreVertical } from 'lucide-react';

export const VendorsColumns = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NAME" />
    ),
  },
  // {
  //   accessorKey: 'address',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="ADDRESS" />
  //   ),
  //   cell: ({ row }) => {
  //     const { address } = row.original;
  //     return <p className="truncate">{address}</p>;
  //   },
  // },
  {
    accessorKey: 'mobileNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PHONE" />
    ),
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
  // {
  //   accessorKey: 'gstNumber',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="GST No." />
  //   ),
  // },
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
      const { invitationId, invitationStatus } = row.original;

      return (
        invitationStatus === 'REJECTED' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-fit">
              {invitationStatus === 'REJECTED' && (
                <ResendInvitation
                  invalidateQuery={vendorEnterprise.getVendors.endpointKey}
                  invitationId={invitationId}
                  mutationFunc={resendInvitation}
                />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      );
    },
  },
];
