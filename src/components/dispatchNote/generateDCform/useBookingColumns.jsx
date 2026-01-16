'use client';

import { capitalize, formatDate } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Trash } from 'lucide-react';

const bookingTypeMapping = {
  LR: 'LORRY RECIEPT',
  LB: 'LADING BILL',
};

const transportModeMapping = {
  ROAD: 'Road',
  AIR: 'Air',
  RAIL: 'Rail',
  SHIP: 'Ship',
};

export const useBookingColumns = ({ setFormData }) => {
  return [
    {
      accessorKey: 'bookingType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Booking Type'} />
      ),
      cell: ({ row }) => {
        const { bookingType } = row.original;
        const bookingMode = bookingTypeMapping[bookingType] || bookingType;
        return <span>{capitalize(bookingMode)}</span>;
      },
    },

    {
      accessorKey: 'bookingNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Booking No.'} />
      ),
      cell: ({ row }) => row.original.bookingNumber || '--',
    },

    {
      accessorKey: 'bookingDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Booking Date'} />
      ),
      cell: ({ row }) => {
        const { bookingDate } = row.original;
        return bookingDate ? formatDate(bookingDate) : '--';
      },
    },

    {
      accessorKey: 'legFrom',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Leg From'} />
      ),
      cell: ({ row }) => row.original.legFrom || '--',
    },

    {
      accessorKey: 'legTo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Leg To'} />
      ),
      cell: ({ row }) => row.original.legTo || '--',
    },

    {
      accessorKey: 'transMode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Transport Mode'} />
      ),
      cell: ({ row }) => {
        const { transMode } = row.original;
        return transportModeMapping[transMode] || transMode || '--';
      },
    },

    {
      accessorKey: 'transporterId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Transporter ID'} />
      ),
      cell: ({ row }) => row.original.transporterId || '--',
    },

    {
      accessorKey: 'remarks',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Remarks'} />
      ),
      cell: ({ row }) => row.original.remarks || '--',
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
                updated.splice(rowIndex, 1);

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
