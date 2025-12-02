'use client';

import { capitalize, formatDate } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Trash } from 'lucide-react';

const bookingTypeMapping = {
  LR: 'LORRY RECIEPT',
  LB: 'LADING BILL',
};

export const useBookingColumns = ({ setFormData }) => {
  return [
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Type'} />
      ),
      cell: ({ row }) => {
        const { bookingType } = row.original;
        const bookingMode = bookingTypeMapping[bookingType] || bookingType;
        return <span>{capitalize(bookingMode)}</span>;
      },
    },

    {
      accessorKey: 'bookingNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Booking no.'} />
      ),
      cell: ({ row }) => {
        const { bookingNumber } = row.original;
        return bookingNumber;
      },
    },

    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Booking Date'} />
      ),
      cell: ({ row }) => {
        const { bookingDate } = row.original;
        return formatDate(bookingDate);
      },
    },

    //   {
    //     accessorKey: 'attachments',
    //     header: ({ column }) => (
    //       <DataTableColumnHeader
    //         column={column}
    //         title={translations('header.attachments')}
    //       />
    //     ),
    //     cell: ({ row }) => {
    //       const { attachments } = row.original;
    //       return <Attachments attachments={attachments} />;
    //     },
    //   },

    {
      accessorKey: 'remarks',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Remarks'} />
      ),
      cell: ({ row }) => {
        const { remarks } = row.original;
        return remarks || '--';
      },
    },

    {
      accessorKey: 'action',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Action'} />
      ),
      cell: ({ row }) => {
        const rowIndex = row.index;

        return (
          <button
            onClick={() => {
              setFormData((prev) => {
                const updated = [...(prev.transportBookings || [])];
                updated.splice(rowIndex, 1); // remove row

                return {
                  ...prev,
                  transportBookings: updated,
                };
              });
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash size={14} />
          </button>
        );
      },
    },
  ];
};
