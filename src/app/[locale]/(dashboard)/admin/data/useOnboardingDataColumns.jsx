/* eslint-disable prettier/prettier */

'use client';

import { capitalize } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

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
  ];
};
