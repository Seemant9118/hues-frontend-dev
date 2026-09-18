import { Badge } from '@/components/ui/badge';
import React, { useMemo } from 'react';

export const useShareResponsesColumns = (dataItems = []) => {
  const columns = useMemo(() => {
    // Extract unique keys from all values across the data items
    const valueKeys = new Set();
    dataItems.forEach((item) => {
      if (item.values) {
        Object.keys(item.values).forEach((key) => valueKeys.add(key));
      }
    });

    const dynamicColumns = Array.from(valueKeys).map((key) => ({
      accessorKey: `values.${key}`,
      header: key.charAt(0).toUpperCase() + key.slice(1),
      cell: ({ row }) => {
        const val = row.original.values?.[key];
        return (
          <span className="text-sm text-neutral-900">
            {val !== undefined && val !== null ? String(val) : '-'}
          </span>
        );
      },
    }));

    return [
      ...dynamicColumns,
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const resp = row.original;
          return (
            <Badge
              variant="secondary"
              className={
                resp.status === 'SUBMITTED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }
            >
              {resp.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'submittedAt',
        header: 'Submitted At',
        cell: ({ row }) => {
          const resp = row.original;
          return (
            <span className="text-xs text-neutral-500">
              {resp.submittedAt
                ? new Date(resp.submittedAt).toLocaleString()
                : 'N/A'}
            </span>
          );
        },
      },
    ];
  }, [dataItems]);

  return { columns };
};
