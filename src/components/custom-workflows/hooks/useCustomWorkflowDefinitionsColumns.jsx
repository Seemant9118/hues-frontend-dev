'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import React, { useMemo } from 'react';

export function useCustomWorkflowDefinitionsColumns({ onNavigate }) {
  return useMemo(
    () => [
      {
        accessorKey: 'definitionId',
        header: () => <DataTableColumnHeader columnTitle="ID" />,
        cell: ({ row }) => {
          const id = row.original.definitionId || row.original.id;
          return <span>#{id}</span>;
        },
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => {
          return (
            <Badge
              variant="outline"
              className="font-mono text-[11px] uppercase tracking-wider"
            >
              {row.original.module || 'CUSTOM_WORKFLOW'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'version',
        header: 'Version',
        cell: ({ row }) => {
          const versionNum =
            row.original.version?.version ??
            row.original.activeVersion?.version ??
            1;
          return (
            <Badge variant="secondary" className="text-xs font-semibold">
              v{versionNum}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status =
            row.original.status ||
            row.original.definitionStatus ||
            row.original.version?.status ||
            'ACTIVE';
          const isActive = status === 'ACTIVE' || status === 'PUBLISHED';

          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                isActive
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const id = row.original.definitionId || row.original.id;
          return (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(id);
                }}
              >
                <span>View Responses</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onNavigate],
  );
}
