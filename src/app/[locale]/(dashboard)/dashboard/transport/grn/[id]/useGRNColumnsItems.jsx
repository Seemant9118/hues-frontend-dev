'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

export const useGRNColumnsItems = () => {
  const t = useTranslations('transport.grns.grnsDetails.tabs.tab1.table');

  return [
    /* Item Name */
    {
      id: 'itemName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.itemName')} />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">
            {row.original?.metaData?.productDetails?.productName}
          </span>
          <span className="text-grey-400 text-xs">
            {row.original?.metaData?.productDetails?.skuId}
          </span>
        </div>
      ),
    },

    /* Batch Number */
    {
      id: 'batchNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.batch')} />
      ),
      cell: ({ row }) =>
        row.original?.batchNo || row.original?.metaData?.batchNo || '--',
    },

    /* Expiry Date */
    {
      id: 'expiryDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.expiry')} />
      ),
      cell: ({ row }) =>
        row.original?.expiryDate || row.original?.metaData?.expiryDate || '--',
    },

    /* Qty Received */
    {
      id: 'qtyReceived',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.dispatchQty')}
        />
      ),
      cell: ({ row }) => {
        const acceptQty = row.original?.acceptedQuantity || 0;
        const rejectQty = row.original?.rejectedQuantity || 0;
        return acceptQty + rejectQty;
      },
    },

    {
      id: 'qtyAccepted',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('header.qtyRecieved')}
        />
      ),
      cell: ({ row }) => {
        const acceptQty = row.original?.acceptedQuantity || 0;
        return acceptQty;
      },
    },

    {
      id: 'qtyRejected',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('header.qtyMissing')} />
      ),
      cell: ({ row }) => {
        const rejectQty = row.original?.rejectedQuantity || 0;
        return rejectQty;
      },
    },
  ];
};
