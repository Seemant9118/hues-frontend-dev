'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';

export const useDispatchNoteColumns = () => {
  const translations = useTranslations(
    'sales.sales-invoices.invoice_details.tabs.content.tab4.table.header',
  );

  return [
    {
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('dispatchId')}
        />
      ),
      cell: ({ row }) => {
        const { referenceNumber } = row.original;
        return <span>{referenceNumber}</span>;
      },
    },

    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('status')} />
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        return (
          <div className="flex max-w-sm">
            <ConditionalRenderingStatus status={status} />
          </div>
        );
      },
    },

    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('createdAt')}
        />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        const date = new Date(createdAt).toLocaleString();
        return <div className="text-[#A5ABBD]">{date}</div>;
      },
    },

    {
      accessorKey: 'items',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('items')} />
      ),
      cell: ({ row }) => {
        const { items } = row.original;
        const total = items?.length ?? 0;

        // OR show dispatched quantities list
        // items.map(item => item.dispatchedQuantity).join(', ')

        return <div>{total} item(s)</div>;
      },
    },
  ];
};
