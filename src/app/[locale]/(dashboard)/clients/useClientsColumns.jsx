'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import GenerateLink from '@/components/enterprise/GenerateLink';
import ResendInvitation from '@/components/enterprise/ResendInvitaion';
import EditModal from '@/components/Modals/EditModal';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateClient } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  generateLink,
  resendInvitation,
} from '@/services/Invitation_Service/Invitation_Service';
import { MoreVertical, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export const useClientsColumns = () => {
  const translations = useTranslations('client');
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.name')}
        />
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
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.phone')}
        />
      ),
      cell: ({ row }) => {
        const { mobileNumber } = row.original;
        return <p className="flex-shrink-0">{`+91 ${mobileNumber}`}</p>;
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.email')}
        />
      ),
      cell: ({ row }) => {
        const { email } = row.original;
        return <p className="flex-shrink-0">{email || '-'}</p>;
      },
    },
    {
      accessorKey: 'panNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.pan')}
        />
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
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.invitation')}
        />
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
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [isEditing, setIsEditing] = useState(false);
        const { id, invitationId, invitationStatus } = row.original;

        return (
          (invitationStatus === 'REJECTED' ||
            invitationStatus === 'PENDING') && (
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
                    btnName={translations('table.column.actions.resend')}
                    invalidateQuery={clientEnterprise.getClients.endpointKey}
                    invitationId={invitationId}
                    mutationFunc={resendInvitation}
                  />
                )}
                {invitationStatus === 'PENDING' && (
                  <>
                    <Button
                      className="w-full"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(true);
                      }}
                    >
                      <Pencil size={14} />
                      {translations('table.column.actions.edit')}
                    </Button>
                    {isEditing && (
                      <EditModal
                        id={id}
                        userData={row.original}
                        cta="client"
                        mutationFunc={updateClient}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                      />
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        );
      },
    },
  ];
};
