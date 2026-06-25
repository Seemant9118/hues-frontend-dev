import React, { useMemo } from 'react';
import { FileText, FileSignature, Eye } from 'lucide-react';
import moment from 'moment';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const useContractsColumns = ({ statusFilter, handleRowClick }) => {
  return useMemo(
    () => [
      {
        accessorKey: 'templateName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Agreement Name" />
        ),
        cell: ({ row }) => {
          const agreement = row.original;
          const name =
            agreement?.template?.name || agreement?.name || 'Agreement';
          return (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#288AF9]">
                <FileText size={16} />
              </div>
              <span className="font-semibold text-gray-900">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'enterpriseName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Offered By" />
        ),
        cell: ({ row }) => {
          const agreement = row.original;
          const enterpriseName =
            agreement?.enterprise?.name ||
            agreement?.enterpriseId?.name ||
            'Company';
          return (
            <span className="font-medium text-gray-700">{enterpriseName}</span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => {
          const agreement = row.original;
          const date = agreement?.createdAt || agreement?.updatedAt;
          return (
            <span className="text-sm text-gray-500">
              {date ? moment(date).format('DD-MM-YYYY') : '-'}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: () => {
          const isSigned = statusFilter === 'signed';
          return isSigned ? (
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 font-semibold text-green-700 hover:bg-green-50"
            >
              Signed
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 font-semibold text-amber-700 hover:bg-amber-50"
            >
              To Be Signed
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="pr-4 text-right">Action</div>,
        cell: ({ row }) => {
          const agreement = row.original;
          const isSigned =
            statusFilter === 'signed' || !!agreement?.signedDocument;
          return (
            <div className="flex justify-end pr-2">
              {isSigned ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(agreement);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-[#288AF9] text-white hover:bg-[#288AF9]/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(agreement);
                  }}
                >
                  <FileSignature className="h-3.5 w-3.5" />
                  Sign
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [statusFilter, handleRowClick],
  );
};
