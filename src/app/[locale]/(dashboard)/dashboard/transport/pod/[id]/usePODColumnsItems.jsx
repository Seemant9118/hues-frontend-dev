'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

export const usePODColumnsItems = () => {
  const t = useTranslations('transport.pods.podsDetails.tabs.tab1.table');

  return [
    /* Sr. No */
    {
      id: 'sr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sr." />
      ),
      cell: ({ row }) => row.index + 1,
    },

    /* SKU ID */
    {
      id: 'skuId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.skuId')} />
      ),
      cell: ({ row }) => row.original?.metaData?.productDetails?.skuId || '--',
    },

    /* Item Name */
    {
      id: 'itemName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.itemName')} />
      ),
      cell: ({ row }) =>
        row.original?.metaData?.productDetails?.productName || '--',
    },

    /* Qty Received */
    {
      id: 'qtyReceived',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.qtyReceived')}
        />
      ),
      cell: ({ row }) => {
        const acceptQty = row.original?.acceptQuantity || 0;
        const rejectQty = row.original?.rejectQuantity || 0;
        return acceptQty + rejectQty;
      },
    },

    {
      id: 'qtyAccepted',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.qtyAccepted')}
        />
      ),
      cell: ({ row }) => {
        const acceptQty = row.original?.acceptQuantity || 0;
        return acceptQty;
      },
    },

    {
      id: 'qtyRejected',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.qtyRejected')}
        />
      ),
      cell: ({ row }) => {
        const rejectQty = row.original?.rejectQuantity || 0;
        return rejectQty;
      },
    },
  ];
};
