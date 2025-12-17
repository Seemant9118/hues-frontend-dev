'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

export const usePODColumns = () => {
  const t = useTranslations(
    'transport.delivery-challan.delivery_challan_details.tabs.tab5.table',
  );

  return [
    /* SKU ID */
    {
      accessorKey: 'skuId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.skuId')} />
      ),
      cell: ({ row }) => row.original.metaData?.productDetails?.skuId || '--',
    },

    /* Item Name */
    {
      accessorKey: 'itemName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.itemName')} />
      ),
      cell: ({ row }) =>
        row.original.metaData?.productDetails?.productName || '--',
    },

    /* Status */
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.status')} />
      ),
      cell: ({ row }) => {
        return (
          <ConditionalRenderingStatus
            isPOD={true}
            status={row.original.status}
          />
        );
      },
    },

    /* Qty Accepted */
    {
      accessorKey: 'acceptQuantity',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.qtyAccepted')}
        />
      ),
      cell: ({ row }) => row.original.acceptQuantity ?? 0,
    },

    /* Qty Rejected */
    {
      accessorKey: 'rejectQuantity',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.qtyRejected')}
        />
      ),
      cell: ({ row }) => row.original.rejectQuantity ?? 0,
    },

    /* Price */
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.price')} />
      ),
      cell: ({ row }) => {
        const price = formattedAmount(
          row.original.metaData?.productDetails?.salesPrice,
        );
        return price || '--';
      },
    },

    /* GST % */
    {
      accessorKey: 'gst',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.gst')} />
      ),
      cell: ({ row }) => {
        const gst = row.original.metaData?.productDetails?.gstPercentage;
        return gst ? `${gst}%` : '0.00%';
      },
    },

    /* Amount */
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.amount')} />
      ),
      cell: ({ row }) => formattedAmount(row.original.amount) || '--',
    },
  ];
};
