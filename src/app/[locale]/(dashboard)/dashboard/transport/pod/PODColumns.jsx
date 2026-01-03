'use client';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Dot } from 'lucide-react';
import moment from 'moment';

export const usePODColumns = ({ enterpriseId }) => {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="POD ID" />
      ),
      cell: ({ row }) => {
        const { referenceNumber } = row.original;
        const isSeller =
          row.original.readTracker?.sellerEnterpriseId === enterpriseId;
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
        <DataTableColumnHeader column={column} title="POD Date" />
      ),
      cell: ({ row }) => moment(row.original?.createdAt).format('DD/MM/YYYY'),
    },

    {
      accessorKey: 'vendorName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client/Vendor Name" />
      ),
      cell: ({ row }) => {
        // iamBuyer ?
        const iamBuyer = row.original?.metaData?.buyerId === enterpriseId;

        const buyerName = row.original?.metaData?.buyerDetails?.name;
        const sellerName = row.original?.metaData?.sellerDetails?.name;

        // if iamBuyer then show my vendorName (seller)
        return iamBuyer ? sellerName : buyerName;
      },
    },

    {
      accessorKey: 'totalItems',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Items" />
      ),
      cell: ({ row }) => row.original?.items?.length || 0,
    },

    /* Status */
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Status'} />
      ),
      cell: ({ row }) => {
        const isSeller =
          row.original?.metaData?.sellerEnterpriseId === enterpriseId;
        return (
          <ConditionalRenderingStatus
            isSeller={isSeller}
            isPOD
            status={row.original?.status}
          />
        );
      },
    },
  ];
};
