/* eslint-disable prettier/prettier */

'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { capitalize } from '@/appUtils/helperFunctions';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteEnterprise } from '@/services/Admin_Services/AdminServices';
import { MoreVertical } from 'lucide-react';

export const useOnboardingDataColumns = () => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'ENTERPRISE NAME'} />
      ),
      cell: ({ row }) => (
        <div className="w-full max-w-[300px] truncate">
          {row.original?.name || '-'}
        </div>
      ),
      size: 200, // Optional: Helps set initial width if your table lib respects it
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'ENTERPRISE TYPE'} />
      ),
      cell: ({ row }) => capitalize(row.original?.type) || '-',
    },
    {
      accessorKey: 'panNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'PAN NUMBER'} />
      ),
      cell: ({ row }) => row.original?.panNumber || '-',
    },
    {
      accessorKey: 'isPanVerified',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'PAN VERIFIED'} />
      ),
      cell: ({ row }) => {
        const value = row.original?.isPanVerified;
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '-';
      },
    },
    {
      accessorKey: 'gstNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'GST NUMBER'} />
      ),
      cell: ({ row }) => row.original?.gstNumber || '-',
    },
    {
      accessorKey: 'isGstVerified',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'GST VERIFIED'} />
      ),
      cell: ({ row }) => {
        const value = row.original?.isGstVerified;
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '-';
      },
    },
    {
      accessorKey: 'udyam',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'UDYAM NUMBER'} />
      ),
      cell: ({ row }) => row.original?.udyam || '-',
    },
    {
      accessorKey: 'isUdyamVerified',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'UDYAM VERIFIED'} />
      ),
      cell: ({ row }) => {
        const value = row.original?.isUdyamVerified;
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '-';
      },
    },
    {
      accessorKey: 'cin',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'CIN'} />
      ),
      cell: ({ row }) => row.original?.cin || '-',
    },
    {
      accessorKey: 'isCinVerified',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'CIN VERIFIED'} />
      ),
      cell: ({ row }) => {
        const value = row.original?.isCinVerified;
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '-';
      },
    },
    {
      accessorKey: 'llpin',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'LLPIN'} />
      ),
      cell: ({ row }) => row.original?.llpin || '-',
    },
    {
      accessorKey: 'isLlpinVerified',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'LLPIN VERIFIED'} />
      ),
      cell: ({ row }) => {
        const value = row.original?.isLlpinVerified;
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '-';
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'EMAIL'} />
      ),
      cell: ({ row }) => row.original?.email || '-',
    },
    {
      accessorKey: 'isDirectorAssigned',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'DIRECTOR ASSIGNED'} />
      ),
      cell: ({ row }) => {
        const value = row.original?.isDirectorAssigned;
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '-';
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const { id, name } = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-fit">
              <ConfirmAction
                deleteCta={'Delete'}
                cancelCta={'Cancel'}
                infoText={`Are you sure you want to delete ${name}?`}
                id={id}
                mutationKey={AdminAPIs.deleteEnterprise.endpointKey}
                mutationFunc={deleteEnterprise}
                successMsg={'Enterprise deleted successfully'}
                customError={'failed to delete enterprise'}
                invalidateKey={AdminAPIs.getOnboardingData.endpointKey}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
