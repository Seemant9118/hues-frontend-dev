'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';

export const useUserColumns = ({ onEditClick }) => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'NAME'} />
      ),
      cell: ({ row }) => row.original?.name || '-',
    },
    {
      accessorKey: 'mobilenumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'MOBILE NUMBER'} />
      ),
      cell: ({ row }) => row.original?.mobilenumber || '-',
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'EMAIL'} />
      ),
      cell: ({ row }) => row.original?.email || '-',
    },
    {
      accessorKey: 'pannumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'PAN'} />
      ),
      cell: ({ row }) => row.original?.pannumber || '-',
    },
    {
      accessorKey: 'aadhaarnumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'AADHAR'} />
      ),
      cell: ({ row }) => row.original?.aadhaarnumber || '-',
    },
    {
      accessorKey: 'dateofbirth',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'DOB'} />
      ),
      cell: ({ row }) => {
        const { dateofbirth } = row.original;
        if (!dateofbirth) return '-';

        const formattedDate = moment(
          dateofbirth,
          ['DD/MM/YYYY', 'YYYY-MM-DD'],
          true,
        ).isValid()
          ? moment(dateofbirth, ['DD/MM/YYYY', 'YYYY-MM-DD']).format(
              'DD/MM/YYYY',
            )
          : '-';

        return formattedDate;
      },
    },
    {
      accessorKey: 'isonboardingcomplete',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'IS ONBOARDING COMPLETE?'}
        />
      ),
      cell: ({ row }) => {
        const { isonboardingcomplete } = row.original;
        return isonboardingcomplete === true
          ? '✅'
          : isonboardingcomplete === false
            ? '❌'
            : '-';
      },
    },
    {
      accessorKey: 'isdirector',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'IS DIRECTOR?'} />
      ),
      cell: ({ row }) => {
        const { isdirector } = row.original;
        return isdirector === true ? '✅' : isdirector === false ? '❌' : '-';
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-fit">
              <div className="flex flex-col">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onEditClick(row.original);
                  }}
                >
                  <Pencil size={14} />
                  Edit
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
