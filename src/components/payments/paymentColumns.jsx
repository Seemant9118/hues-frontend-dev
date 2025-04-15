'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';

export const usePaymentColumns = () => {
  const [showAll, setShowAll] = useState(false);
  const translations = useTranslations(
    'sales.sales-invoices.invoice_details.tabs.content.tab2.table.header',
  );

  const handleToggleShow = () => {
    setShowAll(!showAll);
  };
  return [
    {
      accessorKey: 'paymentReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('payment_id')}
        />
      ),
      cell: ({ row }) => {
        const { paymentReferenceNumber } = row.original;

        return (
          <div className="flex items-center">
            <span>{paymentReferenceNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'paymentDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('date')} />
      ),
      cell: ({ row }) => {
        const { paymentDate } = row.original;
        const formattedDate =
          paymentDate !== null ? moment(paymentDate).format('DD-MM-YYYY') : '-';
        return <div className="text-[#A5ABBD]">{formattedDate}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('status')} />
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        return (
          <div className="flex max-w-sm">
            <ConditionalRenderingStatus status={status} />
          </div>
        );
      },
    },
    {
      accessorKey: 'invoiceReferenceNumbers',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('invoice_no')}
        />
      ),
      cell: ({ row }) => {
        const { invoiceReferenceNumbers } = row.original;

        return (
          <div className="flex flex-col items-start gap-2">
            {invoiceReferenceNumbers
              .slice(0, showAll ? invoiceReferenceNumbers.length : 3)
              .map((invoiceNo) => (
                <div
                  key={invoiceNo}
                  className="w-40 rounded-sm border border-[#EDEEF2] bg-[#F6F7F9] p-1 text-xs text-black"
                >
                  {invoiceNo}
                </div>
              ))}

            {invoiceReferenceNumbers.length > 3 && (
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
    {
      accessorKey: 'amountPaid',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('amount')} />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amountPaid'));

        return <div className="font-medium">{formattedAmount(amount)}</div>;
      },
    },
  ];
};
