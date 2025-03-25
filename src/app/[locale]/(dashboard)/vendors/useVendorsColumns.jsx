'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import ResendInvitation from '@/components/enterprise/ResendInvitaion';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { resendInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { MoreVertical, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const useVendorsColumns = (getLink, sendReminder, onEditClick) => {
  const translations = useTranslations('vendor');

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
                {translations('table.column.status.acceptedByVendor')}
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
        const { invitationId, invitationStatus } = row.original;

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
                    invalidateQuery={vendorEnterprise.getVendors.endpointKey}
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
                        onEditClick(row.original);
                      }}
                    >
                      <Pencil size={14} />
                      {translations('table.column.actions.edit')}
                    </Button>
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
