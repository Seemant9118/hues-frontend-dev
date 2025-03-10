'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
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
import { resendInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { MoreVertical, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export const useClientsColumns = (getLink, sendReminder) => {
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
    {
      accessorKey: 'invitation',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.invitation')}
        />
      ),
      cell: ({ row }) => {
        const { invitationStatus } = row.original;

        switch (invitationStatus) {
          case 'PENDING':
            return (
              <div className="flex w-20 items-center justify-center rounded-[6px] border border-blue-700 bg-blue-100 p-1 text-blue-700">
                {translations('table.column.status.pending')}
              </div>
            );
          case 'REJECTED':
            return (
              <div className="flex w-20 items-center justify-center rounded-[6px] border border-red-500 bg-red-100 p-1 text-red-500">
                {translations('table.column.status.rejected')}
              </div>
            );

          case 'ACCEPTED':
            return (
              <div className="flex w-36 items-center justify-center rounded-[6px] border border-green-500 bg-green-100 p-1 text-green-500">
                {translations('table.column.status.acceptedByClient')}
              </div>
            );
          default:
            return (
              <div className="flex w-36 items-center justify-center rounded-[6px] border border-green-500 bg-green-100 p-1 text-green-500">
                {translations('table.column.status.acceptedByYou')}
              </div>
            );
        }
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
                  <div className="flex flex-col">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        sendReminder(invitationId);
                      }}
                    >
                      {translations('table.column.actions.sendReminder')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        getLink(invitationId);
                      }}
                    >
                      {translations('table.column.actions.copyInviteLink')}
                    </Button>
                    <Button
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
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        );
      },
    },
  ];
};
