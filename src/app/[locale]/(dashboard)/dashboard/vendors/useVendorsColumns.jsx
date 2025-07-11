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
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import {
  acceptInvitation,
  rejectInvitation,
  resendInvitation,
} from '@/services/Invitation_Service/Invitation_Service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreVertical, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export const useVendorsColumns = (
  getLink,
  sendReminder,
  onEditClick,
  enterpriseId,
) => {
  const queryClient = useQueryClient();
  const translations = useTranslations('vendor');

  const acceptInvitationMutation = useMutation({
    mutationFn: (data) => acceptInvitation(data),
    onSuccess: () => {
      toast.success('Invitation Accepted Successfully');

      queryClient.invalidateQueries([vendorEnterprise.getVendors.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const rejectInvitationMutation = useMutation({
    mutationFn: (data) => rejectInvitation(data),
    onSuccess: () => {
      toast.success('Invitation Rejected Successfully');

      queryClient.invalidateQueries([vendorEnterprise.getVendors.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleAccept = (id) => {
    acceptInvitationMutation.mutate({
      enterpriseId,
      invitationId: id,
    });
  };

  const handleReject = (id) => {
    rejectInvitationMutation.mutate({
      enterpriseId,
      invitationId: id,
    });
  };

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.name')}
        />
      ),
      cell: ({ row }) => {
        const vendorName =
          row.original?.vendor?.name ||
          row.original?.invitation?.userDetails?.name;
        return <p className="flex-shrink-0">{vendorName}</p>;
      },
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
        const mobileNumber =
          row.original?.vendor?.mobileNumber ||
          row.original?.invitation?.userDetails?.mobileNumber;
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
        const email =
          row.original?.vendor?.email ||
          row.original?.invitation?.userDetails?.email;
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
      cell: ({ row }) => {
        const panNumber =
          row.original?.vendor?.panNumber ||
          row.original?.invitation?.userDetails?.panNumber;
        return <p className="flex-shrink-0">{panNumber || '-'}</p>;
      },
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
        const invitationId = row.original?.invitation?.id;
        const invitationStatus = row.original?.invitation?.status;

        const enterpriseId = row.original?.enterpriseId;
        const inviterEnterpriseId = row.original?.invitation?.fromEnterpriseId;

        if (
          invitationStatus === 'PENDING' &&
          enterpriseId === inviterEnterpriseId
        ) {
          return (
            <div className="flex w-20 items-center justify-center rounded-[6px] border border-blue-700 bg-blue-100 p-1 text-blue-700">
              {translations('table.column.status.pending')}
            </div>
          );
        } else if (
          invitationStatus === 'PENDING' &&
          enterpriseId !== inviterEnterpriseId
        ) {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border border-red-500 font-semibold text-red-500 hover:bg-red-500 hover:text-white"
                onClick={() => handleReject(invitationId)}
              >
                Reject
              </Button>
              <Button onClick={() => handleAccept(invitationId)} size="sm">
                Accept
              </Button>
            </div>
          );
        } else if (invitationStatus === 'REJECTED') {
          return (
            <div className="flex w-20 items-center justify-center rounded-[6px] border border-red-500 bg-red-100 p-1 text-red-500">
              {translations('table.column.status.rejected')}
            </div>
          );
        } else if (invitationStatus === 'ACCEPTED') {
          return (
            <div className="flex w-36 items-center justify-center rounded-[6px] border border-green-500 bg-green-100 p-1 text-green-500">
              {translations('table.column.status.acceptedByVendor')}
            </div>
          );
        } else {
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
        const invitationId = row.original?.invitation?.id;
        const invitationStatus = row.original?.invitation?.status;

        const enterpriseId = row.original?.enterpriseId;
        const inviterEnterpriseId = row.original?.invitation?.fromEnterpriseId;

        return (
          (invitationStatus === 'REJECTED' || invitationStatus === 'PENDING') &&
          enterpriseId === inviterEnterpriseId && (
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
                    <ProtectedWrapper
                      permissionCode={'permission:vendors-edit'}
                    >
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
                    </ProtectedWrapper>
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
