'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useDeliveryChallansColumns = (enterpriseId) => {
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
        return referenceNumber || '-';
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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client/Vendor Name" />
      ),
      cell: ({ row }) => {
        const iamSeller = row.original?.enterpriseId === enterpriseId;

        const buyerName = row.original?.metaData?.buyerName;
        const sellerName = row.original?.metaData?.sellerDetails?.name;

        return iamSeller ? buyerName : sellerName;
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
      accessorKey: 'legFrom',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Leg From" />
      ),
      cell: ({ row }) => {
        const legFrom = row.original?.legFrom;
        return legFrom || '-';
      },
    },
    {
      accessorKey: 'legTo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Leg To" />
      ),
      cell: ({ row }) => {
        const legTo = row.original?.legTo;
        return legTo || '-';
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
