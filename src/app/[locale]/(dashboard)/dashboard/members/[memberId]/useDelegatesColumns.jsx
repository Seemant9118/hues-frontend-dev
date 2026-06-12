'use client';

import {
  capitalize,
  convertSnakeToTitleCase,
} from '@/appUtils/helperFunctions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermission } from '@/hooks/usePermissions';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import React from 'react';

export const useDelegatesColumns = ({
  setEditUser,
  setIsEditMode,
  setIsAssignUserOpen,
  handleRemoveUser,
  memberId,
  enterpriseId,
  memberDetails,
}) => {
  const { hasPermission } = usePermission();

  return React.useMemo(
    () =>
      [
        {
          accessorKey: 'name',
          header: 'User Name',
          cell: ({ row }) => (
            <div className="font-medium text-gray-900">
              {capitalize(row.original.name) || '-'}
            </div>
          ),
        },
        {
          accessorKey: 'mobileNumber',
          header: 'Mobile Number',
          cell: ({ row }) => (
            <div className="text-gray-500">
              +91 {row.original.mobileNumber || '-'}
            </div>
          ),
        },
        {
          accessorKey: 'email',
          header: 'Email',
          cell: ({ row }) => (
            <div className="text-gray-500">{row.original.email || '-'}</div>
          ),
        },
        {
          accessorKey: 'roles',
          header: 'Role',
          cell: ({ row }) => {
            const userRoles =
              row.original.rolesAssigned &&
              row.original.rolesAssigned.length > 0
                ? row.original.rolesAssigned
                    .map((r) => convertSnakeToTitleCase(r.name))
                    .join(', ')
                : '-';
            return <Badge variant={'secondary'}>{userRoles}</Badge>;
          },
        },
        {
          accessorKey: 'createdAt',
          header: 'Date',
          cell: ({ row }) => {
            const date = row.original.createdAt
              ? new Date(row.original.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : '-';
            return <div className="text-gray-500">{date}</div>;
          },
        },
        enterpriseId !== memberDetails?.enterpriseId?.id &&
          hasPermission('permission:members-edit') && {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
              const user = row.original;
              return (
                <div className="text-right">
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
                            setEditUser(user);
                            setIsEditMode(true);
                            setIsAssignUserOpen(true);
                          }}
                          className="justify-start gap-2 text-left"
                        >
                          <Pencil size={14} />
                          Edit Roles
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveUser(user)}
                          className="justify-start gap-2 text-left text-red-600 hover:text-red-700"
                        >
                          <Trash size={14} />
                          Remove
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            },
          },
      ].filter(Boolean),
    [
      memberId,
      setEditUser,
      setIsEditMode,
      setIsAssignUserOpen,
      handleRemoveUser,
      enterpriseId,
      memberDetails,
      hasPermission,
    ],
  );
};
