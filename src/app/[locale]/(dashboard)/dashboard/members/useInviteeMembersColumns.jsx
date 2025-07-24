'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateAssociateMember } from '@/services/Associate_Members_Services/AssociateMembersServices';
import { generateLink } from '@/services/Invitation_Service/Invitation_Service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreVertical, Pencil, Share2, UserRoundX } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';

export const useInviteeMembersColumns = (
  translation,
  setIsMemberEditing,
  setSelectedMember,
  enterpriseId,
) => {
  const queryClient = useQueryClient();
  const generateLinkMutation = useMutation({
    mutationFn: generateLink,
    onSuccess: (data) => {
      navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/login?invitationToken=${data.data.data}`,
      );
      toast.success(translation('success.linkCopied'));
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          translation('errors.generateLinkFailed'),
      );
    },
  });

  const handleClick = (invitationId) => {
    generateLinkMutation.mutate(invitationId);
  };

  const updateMemberMutation = useMutation({
    mutationKey: [associateMemberApi.updateAssociateMember.endpointKey],
    mutationFn: updateAssociateMember,
    onSuccess: () => {
      toast.success(translation('success.userInactiveSuccess'));
      queryClient.invalidateQueries([
        associateMemberApi.getAllAssociateMembers.endpointKey,
        enterpriseId,
      ]);
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translation('errors.commonError'),
      );
    },
  });

  const handleInactive = (invitationId, member) => {
    updateMemberMutation.mutate({
      id: invitationId,
      data: member,
    });
  };

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translation('tableColumns.name')}
        />
      ),
      cell: ({ row }) => {
        const { name } = row.original.invitation.userDetails;
        return <div>{name}</div>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translation('tableColumns.joiningDate')}
        />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        const date = moment(createdAt).format('DD-MM-YYYY');
        return <div className="text-[#A5ABBD]">{date}</div>;
      },
    },
    {
      accessorKey: 'mobileNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translation('tableColumns.phoneNumber')}
        />
      ),
      cell: ({ row }) => {
        const { mobileNumber } = row.original.invitation.userDetails;
        return <div>+91 {mobileNumber || '-'}</div>;
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translation('tableColumns.emailId')}
        />
      ),
      cell: ({ row }) => {
        const { email } = row.original.invitation.userDetails;
        return <div>{email || '-'}</div>;
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translation('tableColumns.role')}
        />
      ),
      cell: ({ row }) => {
        const { roles } = row.original;
        return roles && roles.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <div
                key={role.roleId}
                className="w-fit rounded-[5px] border border-[#ebebec] bg-[#EDEEF2] p-1 text-sm"
              >
                {convertSnakeToTitleCase(role.name)}
              </div>
            ))}
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'invitation',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translation('tableColumns.invitation')}
        />
      ),
      cell: ({ row }) => {
        const { status } = row.original.invitation;
        let content;
        switch (status) {
          case 'PENDING':
            content = (
              <div className="flex w-20 items-center justify-center rounded-[6px] border border-blue-500 bg-blue-100 p-1 text-primary">
                {translation('tableColumns.statuses.pending')}
              </div>
            );
            break;
          case 'REJECTED':
            content = (
              <div className="flex w-20 items-center justify-center rounded-[6px] border border-red-500 bg-red-100 p-1 text-red-500">
                {translation('tableColumns.statuses.rejected')}
              </div>
            );
            break;
          case 'ACCEPTED':
            content = (
              <div className="flex w-20 items-center justify-center rounded-[6px] border border-green-500 bg-green-100 p-1 text-green-500">
                {translation('tableColumns.statuses.accepted')}
              </div>
            );
            break;
          default:
            content = '-';
        }
        return content;
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const invitationStatus = row.original?.invitation?.status;
        const invitationId = row.original?.id;

        return (
          (invitationStatus === 'ACCEPTED' ||
            invitationStatus === 'PENDING') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-w-fit">
                {invitationStatus === 'PENDING' && (
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedMember(row.original);
                        setIsMemberEditing(true);
                      }}
                    >
                      <Pencil size={14} />
                      {translation('tableColumns.actions.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleClick(invitationId)}
                    >
                      <Share2 size={14} />
                      {translation('tableColumns.actions.share')}
                    </Button>
                  </div>
                )}
                {invitationStatus === 'ACCEPTED' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleInactive(invitationId, {
                        enterpriseId,
                        name: row.original.invitation?.userDetails?.name || '',
                        mobileNumber:
                          row.original.invitation?.userDetails?.mobileNumber ||
                          '',
                        countryCode:
                          row.original.invitation?.userDetails?.countryCode ||
                          '',
                        rolesIds: row.original.roles
                          ?.map((role) => role.roleId)
                          .filter((id) => id != null), // filter out null/undefined
                        isActive: false,
                      })
                    }
                  >
                    <UserRoundX size={14} />
                    {translation('tableColumns.actions.inactive')}
                  </Button>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        );
      },
    },
  ];
};
