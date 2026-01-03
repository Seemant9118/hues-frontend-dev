'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Dot } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useDispatchedNotes = () => {
  const translations = useTranslations(
    'transport.dispatched-notes.table.header',
  );

  return [
    {
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('dispatch_id')}
        />
      ),
      cell: ({ row }) => {
        const { referenceNumber } = row.original;
        const isRead = row.original?.readTracker?.sellerIsRead || true;

        return (
          <div className="flex items-center">
            {!isRead && <Dot size={32} className="text-primary" />}
            <span>{referenceNumber}</span>
          </div>
        );
      },
    },

    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('date')} />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        return (
          <div className="text-[#A5ABBD]">
            {moment(createdAt).format('DD-MM-YYYY')}
          </div>
        );
      },
    },
    {
      accessorKey: 'buyerName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('customers')}
        />
      ),
    },
    {
      accessorKey: 'supply',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('supply')} />
      ),
      cell: ({ row }) => {
        const supply = row.original?.supply;

        return supply || 'Outward Supply';
      },
    },
    {
      accessorKey: 'invoiceReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('invoice_id')}
        />
      ),
      cell: ({ row }) => {
        const invoiceReferenceNumber = row.original?.invoice?.referenceNumber;
        return (
          <div className="w-48 rounded border border-[#EDEEF2] bg-[#F6F7F9] p-1">
            {invoiceReferenceNumber}
          </div>
        );
      },
    },

    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('total_amount')}
        />
      ),
      cell: ({ row }) => {
        const { totalAmount } = row.original;
        return formattedAmount(totalAmount);
      },
    },
  ];
};
