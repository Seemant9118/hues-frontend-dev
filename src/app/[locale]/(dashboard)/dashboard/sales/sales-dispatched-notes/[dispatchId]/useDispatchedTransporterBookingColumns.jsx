'use client';

import { capitalize, formatDate } from '@/appUtils/helperFunctions';
import Attachments from '@/components/Modals/Attachments';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useTranslations } from 'next-intl';

const bookingType = {
  LR: 'LORRY RECIEPT',
  LB: 'LADING BILL',
};

export const useDispatchedTransporterBookingColumns = ({
  setIsCreatingEWBB,
  setSelectedTransportForUpdateB,
}) => {
  const translations = useTranslations(
    'sales.sales-dispatched-notes.dispatch_details.tabs.tab3.table',
  );

  return [
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('header.type')}
        />
      ),
      cell: ({ row }) => {
        const { type } = row.original;
        const bookingMode = bookingType[type] || type;
        return <span>{capitalize(bookingMode)}</span>;
      },
    },

    {
      accessorKey: 'bookingNo',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('header.booking_no')}
        />
      ),
      cell: ({ row }) => {
        const { bookingNo } = row.original;
        return bookingNo;
      },
    },

    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('header.date')}
        />
      ),
      cell: ({ row }) => {
        const { date } = row.original;
        return formatDate(date);
      },
    },

    {
      accessorKey: 'attachments',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('header.attachments')}
        />
      ),
      cell: ({ row }) => {
        const { attachments } = row.original;
        return <Attachments attachments={attachments} />;
      },
    },

    {
      accessorKey: 'action',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('header.action')}
        />
      ),
      cell: ({ row }) => {
        return (
          <button
            onClick={() => {
              setIsCreatingEWBB(true);
              setSelectedTransportForUpdateB(row.original?.bookingId);
            }}
            className="rounded-sm border bg-green-500 px-2 py-1 text-white hover:border hover:bg-green-600 hover:underline"
          >
            {translations('ctas.updatePartB')}
          </button>
        );
      },
    },

    {
      accessorKey: 'remarks',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('header.remarks')}
        />
      ),
      cell: ({ row }) => {
        const { remarks } = row.original;
        return remarks || '--';
      },
    },
  ];
};
