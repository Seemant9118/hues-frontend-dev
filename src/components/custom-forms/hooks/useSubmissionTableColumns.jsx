'use client';

import { useMemo } from 'react';
import { Eye, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function useSubmissionTableColumns({ onInspect }) {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Submission ID',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-primary">
                <FileText size={14} />
              </div>
              <span className="font-mono text-xs font-semibold text-neutral-800">
                #{item.id}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'formConfigurationId',
        header: 'Form ID',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span className="inline-flex items-center rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-700">
              Form #{item.formConfigurationId}
            </span>
          );
        },
      },
      {
        accessorKey: 'valuesSummary',
        header: 'Data Summary',
        cell: ({ row }) => {
          const item = row.original;
          const keys = Object.keys(item.values || {});
          if (keys.length === 0) {
            return (
              <span className="text-xs text-neutral-400">Empty payload</span>
            );
          }
          const summary = keys
            .slice(0, 3)
            .map((k) => `${k}: ${item.values[k]}`)
            .join(' | ');
          const extra = keys.length > 3 ? ` (+${keys.length - 3} more)` : '';

          return (
            <span
              className="block max-w-[280px] truncate font-mono text-xs text-neutral-600"
              title={summary + extra}
            >
              {summary}
              {extra}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const item = row.original;
          const isSubmitted = item.status === 'SUBMITTED';
          return (
            <Badge
              className={
                isSubmitted
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                  : 'border border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-100'
              }
            >
              {item.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Submitted At',
        cell: ({ row }) => {
          const item = row.original;
          const dateStr = item.createdAt
            ? new Date(item.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : '-';
          return <span className="text-xs text-neutral-500">{dateStr}</span>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onInspect(item)}
                className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-primary active:bg-neutral-100"
              >
                <Eye size={14} />
                View Response
              </button>
            </div>
          );
        },
      },
    ],
    [onInspect],
  );

  return columns;
}
