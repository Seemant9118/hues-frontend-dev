'use client';

import { invitation } from '@/api/invitation/Invitation';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  acceptInvitation,
  rejectInvitation,
} from '@/services/Invitation_Service/Invitation_Service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export const useInviteColumns = () => {
  const queryClient = useQueryClient();
  const enterpriseId = getEnterpriseId();

  const acceptInvitationMutation = useMutation({
    mutationFn: (data) => acceptInvitation(data),
    onSuccess: () => {
      toast.success('Success');
      queryClient.invalidateQueries([
        invitation.getReceivedInvitation.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const rejectInvitationMutation = useMutation({
    mutationFn: (data) => rejectInvitation(data),
    onSuccess: () => {
      toast.success('Rejected');
      queryClient.invalidateQueries([
        invitation.getReceivedInvitation.endpointKey,
      ]);
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
      cell: ({ row }) => {
        if (!row.original.name) {
          return 'NA';
        } else {
          return row.original.name;
        }
      },
    },
    {
      accessorKey: 'gstNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GST IN" />
      ),
      cell: ({ row }) => {
        if (!row.original.gstNumber) {
          return 'NA';
        } else {
          return row.original.gstNumber;
        }
      },
    },
    {
      accessorKey: 'panNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PAN" />
      ),
      cell: ({ row }) => {
        if (!row.original.panNumber) {
          return 'NA';
        } else {
          return row.original.panNumber;
        }
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="MAIL" />
      ),
      cell: ({ row }) => {
        if (!row.original.email) {
          return 'NA';
        } else {
          return row.original.email;
        }
      },
    },
    {
      accessorKey: 'mobileNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PHONE NO." />
      ),
      cell: ({ row }) => {
        if (!row.original.mobileNumber) {
          return 'NA';
        } else {
          return row.original.mobileNumber;
        }
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ACCEPT/REJECT" />
      ),
      cell: ({ row }) => {
        const { id } = row.original;

        return (
          <div className="flex items-center gap-4">
            <Button
              className="w-34 h-9 bg-red-500 hover:bg-red-700"
              onClick={() => handleReject(id)}
            >
              <X size={20} className="cursor-pointer" />
            </Button>
            <Button
              className="w-34 h-9 bg-green-500 hover:bg-green-700"
              onClick={() => handleAccept(id)}
            >
              <Check />
            </Button>
          </div>
        );
      },
    },
  ];
};
