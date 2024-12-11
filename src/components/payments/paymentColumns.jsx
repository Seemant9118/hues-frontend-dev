'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';
import { useState } from 'react';

export const usePaymentColumns = () => {
  const [showAll, setShowAll] = useState(false);

  const handleToggleShow = () => {
    setShowAll(!showAll);
  };
  return [
    {
      accessorKey: 'paymentid',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PAYMENT ID" />
      ),
      cell: ({ row }) => {
        const { paymentid } = row.original;
        return <span className="font-bold">{paymentid}</span>;
      },
    },
    {
      accessorKey: 'amountpaid',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="AMOUNT" />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amountpaid'));

        return <div className="font-medium">{formattedAmount(amount)}</div>;
      },
    },
    {
      accessorKey: 'paymentdata',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DATE" />
      ),
      cell: ({ row }) => {
        const { paymentdata } = row.original;
        const formattedDate = moment(paymentdata).format('DD-MM-YYYY');
        return <div className="text-[#A5ABBD]">{formattedDate}</div>;
      },
    },

    {
      accessorKey: 'invoicereferencenumbers',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="INVOICE NO" />
      ),
      cell: ({ row }) => {
        const { invoicereferencenumbers } = row.original;

        return (
          <div className="flex flex-col items-start gap-2">
            {invoicereferencenumbers
              .slice(0, showAll ? invoicereferencenumbers.length : 3)
              .map((invoiceNo) => (
                <div
                  key={invoiceNo}
                  className="w-40 rounded-sm border border-[#EDEEF2] bg-[#F6F7F9] p-1 text-xs text-black"
                >
                  {invoiceNo}
                </div>
              ))}

            {invoicereferencenumbers.length > 3 && (
              <button
                onClick={handleToggleShow}
                className="text-xs text-blue-500 underline"
              >
                {showAll ? 'Show less' : 'See more'}
              </button>
            )}
          </div>
        );
      },
    },
  ];
};
