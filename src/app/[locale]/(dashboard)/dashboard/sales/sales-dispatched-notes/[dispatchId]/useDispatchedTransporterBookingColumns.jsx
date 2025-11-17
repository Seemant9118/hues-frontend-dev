'use client';

import { formatDate } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

export const useDispatchedTransporterBookingColumns = () => {
  const translations = useTranslations(
    'sales.sales-dispatched-notes.dispatch_details.tabs.tab2.table.header',
  );

  return [
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('type')} />
      ),
      cell: ({ row }) => {
        const { type } = row.original;
        return <span>{type}</span>;
      },
    },

    {
      accessorKey: 'bookingNo',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('booking_no')}
        />
      ),
      cell: ({ row }) => {
        const { bookingNo } = row.original;
        return bookingNo;
      },
    },

    {
      accessorKey: 'dispatchedQuantity',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('dispatchedQty')}
        />
      ),
      cell: ({ row }) => {
        const { dispatchedQuantity } = row.original;
        return dispatchedQuantity;
      },
    },

    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('date')} />
      ),
      cell: ({ row }) => {
        const { date } = row.original;
        return formatDate(date);
      },
    },

    {
      accessorKey: 'remarks',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('remarks')}
        />
      ),
      cell: ({ row }) => {
        const { remarks } = row.original;
        return remarks;
      },
    },
  ];
};
