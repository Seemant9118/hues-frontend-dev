'use client';

import React, { useMemo } from 'react';
import { Asterisk } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export function useVersionDetailsColumns() {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'label',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Field Label" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-neutral-800">
            {row.original.label}
          </span>
        ),
      },
      {
        accessorKey: 'key',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Key" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-neutral-500">
            {row.original.key}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
          <span className="text-[11px] font-semibold text-primary">
            {row.original.type}
          </span>
        ),
      },
      {
        accessorKey: 'kind',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Kind" />
        ),
        cell: ({ row }) => {
          const kind = row.original.kind || 'SYSTEM';
          return (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                kind === 'CUSTOM'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {kind}
            </span>
          );
        },
      },
      {
        accessorKey: 'required',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Required" />
        ),
        cell: ({ row }) =>
          row.original.required ? (
            <span className="flex items-center gap-0.5 font-bold text-red-500">
              <Asterisk className="h-3 w-3" /> Yes
            </span>
          ) : (
            <span className="text-neutral-400">No</span>
          ),
      },
      {
        accessorKey: 'visible',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Visible" />
        ),
        cell: ({ row }) =>
          row.original.visible !== false ? (
            <span className="font-semibold text-primary">Visible</span>
          ) : (
            <span className="text-neutral-400">Hidden</span>
          ),
      },
    ],
    [],
  );

  return columns;
}
