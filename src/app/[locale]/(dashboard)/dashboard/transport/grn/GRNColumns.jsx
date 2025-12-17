'use client';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { LocalStorageService } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';

export const useGrnColumns = () => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GRN ID" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.referenceNumber}</span>
      ),
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

    // {
    //   accessorKey: 'totalAcceptedAmount',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Accepted Amount" />
    //   ),
    //   cell: ({ row }) => (
    //     <span className="font-medium">
    //       ₹{Number(row.original.totalAcceptedAmount).toLocaleString('en-IN')}
    //     </span>
    //   ),
    // },

    // {
    //   accessorKey: 'totalGstAmount',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="GST Amount" />
    //   ),
    //   cell: ({ row }) => (
    //     <span>
    //       ₹{Number(row.original.totalGstAmount).toLocaleString('en-IN')}
    //     </span>
    //   ),
    // },

    {
      accessorKey: 'flags',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Flags" />
      ),
      cell: ({ row }) => {
        const { isShortQuantity } = row.original;

        const status = isShortQuantity ? 'SHORT_QUANTITY' : null;
        return <ConditionalRenderingStatus status={status} />;
      },
    },

    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const { status } = row.original;

        return <ConditionalRenderingStatus status={status} />;
      },
    },

    {
      id: 'action',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/transport/grn/${row.original.id}`);
          }}
        >
          Open QAC
          <ExternalLink size={14} />
        </Button>
      ),
    },
  ];
};
