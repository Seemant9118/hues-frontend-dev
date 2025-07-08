'use client';

import { capitalize } from '@/appUtils/helperFunctions';
import GenerateLink from '@/components/enterprise/GenerateLink';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { generateLink } from '@/services/Invitation_Service/Invitation_Service';
import moment from 'moment';

export const useInviteeMembersColumns = () => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="NAME" />
      ),
      cell: ({ row }) => {
        const { name } = row.original.invitation.userDetails;
        return <div>{name}</div>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="JOINING DATE" />
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
        <DataTableColumnHeader column={column} title="PHONE NUMBER" />
      ),
      cell: ({ row }) => {
        const { mobileNumber } = row.original.invitation.userDetails;
        return <div>+91 {mobileNumber || '-'}</div>;
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="EMAIL ID" />
      ),
      cell: ({ row }) => {
        const { email } = row.original.invitation.userDetails;
        return <div>{email || '-'}</div>;
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ROLE" />
      ),
      cell: ({ row }) => {
        const { role } = row.original;
        return (
          <div className="w-fit rounded-[5px] border border-[#EDEEF2] bg-[#F6F7F9] p-1 text-sm">
            {capitalize(role)}
          </div>
        );
      },
    },
    {
      accessorKey: 'invitation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="INVITATION" />
      ),
      cell: ({ row }) => {
        const { id, status } = row.original.invitation;

        return (
          <GenerateLink
            invitationStatus={status}
            invitationId={id}
            mutationFunc={generateLink}
          />
        );
      },
    },
  ];
};
