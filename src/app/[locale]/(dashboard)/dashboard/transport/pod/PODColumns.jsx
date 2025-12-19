'use client';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { LocalStorageService } from '@/lib/utils';
import moment from 'moment';

export const usePODColumns = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="POD ID" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original?.referenceNumber}</span>
      ),
    },

    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="POD Date"
          className="min-w-fit"
        />
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
        <DataTableColumnHeader
          column={column}
          title="Total Items"
          className="min-w-fit"
        />
      ),
      cell: ({ row }) => row.original?.items?.length || 0,
    },

    /* Status */
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'Status'}
          className="min-w-fit"
        />
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
