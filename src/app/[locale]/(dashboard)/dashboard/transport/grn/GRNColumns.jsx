'use client';

import { getQCDefectStatuses } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { LocalStorageService } from '@/lib/utils';
import { Dot } from 'lucide-react';
import moment from 'moment';

export const useGrnColumns = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GRN ID" />
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
        <DataTableColumnHeader column={column} title="GRN Date" />
      ),
      cell: ({ row }) => moment(row.original.createdAt).format('DD MMM YYYY'),
    },

    {
      accessorKey: 'vendorName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vendor Name" />
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
      cell: ({ row }) => row.original.items?.length || 0,
    },
    {
      accessorKey: 'flags',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Defects" />
      ),
      cell: ({ row }) => {
        const statuses = getQCDefectStatuses(row.original);

        if (!statuses.length) return '-';

        return (
          <div className="flex flex-col gap-2">
            {statuses.map((status) => (
              <ConditionalRenderingStatus key={status} status={status} isQC />
            ))}
          </div>
        );
      },
    },
  ];
};
