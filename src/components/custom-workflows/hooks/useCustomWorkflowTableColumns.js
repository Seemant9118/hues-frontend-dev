'use client';

import { formatDate } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import React, { useMemo } from 'react';

const STATUS_CONFIG = {
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

export function useCustomWorkflowTableColumns({ onInspect }) {
  return useMemo(
    () => [
      {
        accessorKey: 'instanceId',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Instance ID" />
        ),
        cell: ({ row }) => {
          const id = row.original.instanceId || row.original.id;
          const { recordId } = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold text-gray-900">
                #{id}
              </span>
              {recordId && (
                <span
                  className="max-w-[150px] truncate font-mono text-[10px] text-gray-400"
                  title={recordId}
                >
                  {recordId}
                </span>
              )}
            </div>
          );
        },
      },

      {
        accessorKey: 'currentStepKey',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Current Step" />
        ),
        cell: ({ row }) => {
          const stepKey = row.original.currentStepKey || '-';
          return (
            <Badge
              variant="secondary"
              className="font-mono text-[10px] uppercase"
            >
              {stepKey}
            </Badge>
          );
        },
      },

      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status || 'PENDING';
          const cfg = STATUS_CONFIG[status] || {
            label: status,
            className: 'bg-gray-100 text-gray-700',
          };
          return (
            <Badge
              variant="outline"
              className={`text-[11px] font-semibold ${cfg.className}`}
            >
              {cfg.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'startedAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Started At" />
        ),
        cell: ({ row }) => {
          const dateStr = row.original.startedAt || row.original.createdAt;
          if (!dateStr) return <span className="text-xs text-gray-400">-</span>;
          const date = new Date(dateStr);
          return (
            <span className="text-xs text-gray-700">{formatDate(date)}</span>
          );
        },
      },
      {
        accessorKey: 'completedAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Completed At" />
        ),
        cell: ({ row }) => {
          const dateStr = row.original.completedAt;
          if (!dateStr) return <span className="text-xs text-gray-400">-</span>;
          const date = new Date(dateStr);
          return (
            <span className="text-xs text-gray-700">{formatDate(date)}</span>
          );
        },
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onInspect?.(row.original);
              }}
            >
              <Eye size={13} />
              <span>View Details</span>
            </Button>
          );
        },
      },
    ],
    [onInspect],
  );
}
