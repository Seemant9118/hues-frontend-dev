'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Dot } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useDeliveryChallanColumns = (enterpriseId) => {
  const translations = useTranslations(
    'transport.delivery-challan.table.header',
  );

  return [
    {
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('deliveryChallanNo')}
        />
      ),
      cell: ({ row }) => {
        const { referenceNumber } = row.original;
        const isSeller = row.original.enterpriseId === enterpriseId;
        const isRead = isSeller
          ? row.original?.readTracker?.sellerIsRead
          : row.original?.readTracker?.buyerIsRead || true;

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
      accessorKey: 'dispatchReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('dispatchReferenceNumber')}
        />
      ),
      cell: ({ row }) => {
        const dispatchReferenceNumber =
          row.original?.dispatchNote?.referenceNumber;
        return (
          <div className="w-48 rounded border border-[#EDEEF2] bg-[#F6F7F9] p-1">
            {dispatchReferenceNumber}
          </div>
        );
      },
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
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('total_amount')}
        />
      ),
      cell: ({ row }) => {
        const { totalAmount } = row.original.metaData;
        return formattedAmount(totalAmount);
      },
    },
  ];
};
