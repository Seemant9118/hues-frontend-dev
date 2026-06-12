'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  acceptInvite,
  rejectInvite,
  updateAssociateMember,
} from '@/services/Associate_Members_Services/AssociateMembersServices';
import { generateLink } from '@/services/Invitation_Service/Invitation_Service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MoreVertical,
  Pencil,
  Share2,
  UserCheck,
  UserRoundX,
} from 'lucide-react';
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

  const acceptInviteMutation = useMutation({
    mutationKey: [associateMemberApi.acceptInvite.endpointKey],
    mutationFn: acceptInvite,
    onSuccess: () => {
      toast.success(
        translation('success.acceptSuccess') ||
          'Invitation accepted successfully!',
      );
      queryClient.invalidateQueries([
        associateMemberApi.getAllAssociateMembers.endpointKey,
        enterpriseId,
      ]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          translation('errors.commonError') ||
          'Failed to accept invitation',
      );
    },
  });

  const rejectInviteMutation = useMutation({
    mutationKey: [associateMemberApi.rejectInvite.endpointKey],
    mutationFn: rejectInvite,
    onSuccess: () => {
      toast.success(
        translation('success.rejectSuccess') ||
          'Invitation rejected successfully!',
      );
      queryClient.invalidateQueries([
        associateMemberApi.getAllAssociateMembers.endpointKey,
        enterpriseId,
      ]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          translation('errors.commonError') ||
          'Failed to reject invitation',
      );
    },
  });

  const isAcceptPending = acceptInviteMutation.isPending;
  const isRejectPending = rejectInviteMutation.isPending;

  const handleAccept = (invitationId) => {
    acceptInviteMutation.mutate({ invitationId, id: invitationId });
  };

  const handleReject = (invitationId) => {
    rejectInviteMutation.mutate({ invitationId, id: invitationId });
  };

  const handleInactive = (id, member) => {
    updateMemberMutation.mutate({
      id,
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
        const { membershipType } = row.original;
        const userDetails = row.original.invitation?.userDetails || {};
        const isExternalMember = membershipType === 'EXTERNAL_MEMBER';

        let memberName = '';
        if (isExternalMember) {
          if (row.original.sourceEnterpriseId?.id === enterpriseId) {
            memberName = row.original.enterpriseId?.name || '';
          } else {
            memberName = row.original.sourceEnterpriseId?.name || '';
          }
          if (!memberName) {
            memberName =
              row.original.name || row.original.enterpriseId?.name || '';
          }
        } else {
          memberName = row.original.name || userDetails.name || '';
        }

        return <div>{memberName || '-'}</div>;
      },
    },

    {
      accessorKey: 'memberShipType',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translation('tableColumns.membershipType')}
        />
      ),
      cell: ({ row }) => {
        const { membershipType } = row.original;
        const membershipTypeMap = {
          EXTERNAL_MEMBER: translation('tableColumns.statuses.external'),
        };
        return (
          <Badge variant="secondary">
            {membershipTypeMap[membershipType] ||
              translation('tableColumns.statuses.internal')}
          </Badge>
        );
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
        const { membershipType } = row.original;
        const userDetails = row.original.invitation?.userDetails || {};
        const isExternalMember = membershipType === 'EXTERNAL_MEMBER';

        let mobileNumber =
          userDetails.mobileNumber || row.original.mobileNumber;
        if (!mobileNumber && isExternalMember) {
          if (row.original.sourceEnterpriseId?.id === enterpriseId) {
            mobileNumber = row.original.enterpriseId?.phone;
          } else {
            mobileNumber = row.original.sourceEnterpriseId?.phone;
          }
        }

        const formattedMobile = mobileNumber
          ? mobileNumber.startsWith('+91')
            ? mobileNumber
            : `+91 ${mobileNumber}`
          : '-';

        return <div>{formattedMobile}</div>;
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
        const { membershipType } = row.original;
        const userDetails = row.original.invitation?.userDetails || {};
        const isExternalMember = membershipType === 'EXTERNAL_MEMBER';

        let email = userDetails.email || row.original.email;
        if (!email && isExternalMember) {
          if (row.original.sourceEnterpriseId?.id === enterpriseId) {
            email = row.original.enterpriseId?.email;
          } else {
            email = row.original.sourceEnterpriseId?.email;
          }
        }

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
                className="w-fit rounded-[8px] border border-[#ebebec] bg-[#EDEEF2] p-1 text-xs"
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
        const { status, toEnterpriseId } = row.original.invitation || {};
        const { isActive } = row.original;
        let content;

        switch (status) {
          case 'PENDING':
            if (toEnterpriseId === enterpriseId) {
              content = (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 border-green-500 px-2.5 text-xs font-semibold text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={() => handleAccept(row.original.invitation?.id)}
                    disabled={isAcceptPending || isRejectPending}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 border-red-500 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleReject(row.original.invitation?.id)}
                    disabled={isAcceptPending || isRejectPending}
                  >
                    Reject
                  </Button>
                </div>
              );
            } else {
              content = (
                <div className="flex w-20 items-center justify-center rounded-[6px] border border-blue-500 bg-blue-100 p-1 text-primary">
                  {translation('tableColumns.statuses.pending')}
                </div>
              );
            }
            break;

          case 'REJECTED':
            content = (
              <div className="flex w-20 items-center justify-center rounded-[6px] border border-red-500 bg-red-100 p-1 text-red-500">
                {translation('tableColumns.statuses.rejected')}
              </div>
            );
            break;

          case 'ACCEPTED':
            if (isActive) {
              content = (
                <div className="flex w-20 items-center justify-center rounded-[6px] border border-green-500 bg-green-100 p-1 text-green-500">
                  {translation('tableColumns.statuses.active')}
                </div>
              );
            } else {
              content = (
                <div className="flex w-20 items-center justify-center rounded-[6px] border border-gray-500 bg-gray-100 p-1 text-gray-600">
                  {translation('tableColumns.statuses.inactive')}
                </div>
              );
            }
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
        const membershipType = row.original?.membershipType;
        if (membershipType !== 'INTERNAL') {
          return null;
        }

        const id = row.original?.id;
        const isActive = row.original?.isActive;
        const invitationStatus = row.original?.invitation?.status;
        const invitationId = row.original?.invitation?.id;

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
                  {invitationStatus === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleClick(invitationId)}
                    >
                      <Share2 size={14} />
                      {translation('tableColumns.actions.share')}
                    </Button>
                  )}
                  {invitationStatus === 'ACCEPTED' && isActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() =>
                        handleInactive(id, {
                          enterpriseId,
                          name:
                            row.original.invitation?.userDetails?.name || '',
                          mobileNumber:
                            row.original.invitation?.userDetails
                              ?.mobileNumber || '',
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

                  {invitationStatus === 'ACCEPTED' && !isActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600"
                      onClick={() =>
                        handleInactive(id, {
                          enterpriseId,
                          name:
                            row.original.invitation?.userDetails?.name || '',
                          mobileNumber:
                            row.original.invitation?.userDetails
                              ?.mobileNumber || '',
                          countryCode:
                            row.original.invitation?.userDetails?.countryCode ||
                            '',
                          rolesIds: row.original.roles
                            ?.map((role) => role.roleId)
                            .filter((id) => id != null), // filter out null/undefined
                          isActive: true,
                        })
                      }
                    >
                      <UserCheck size={14} />
                      {translation('tableColumns.actions.active')}
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        );
      },
    },
  ];
};
