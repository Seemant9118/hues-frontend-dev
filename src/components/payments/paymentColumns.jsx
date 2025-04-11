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
      accessorKey: 'paymentreferencenumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('payment_id')}
        />
      ),
      cell: ({ row }) => {
        const { paymentreferencenumber } = row.original;

        return (
          <div className="flex items-center">
            <span>{paymentreferencenumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'paymentdate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('date')} />
      ),
      cell: ({ row }) => {
        const { paymentdate } = row.original;
        const formattedDate =
          paymentdate !== null ? moment(paymentdate).format('DD-MM-YYYY') : '-';
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
      accessorKey: 'invoicereferencenumbers',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('invoice_no')}
        />
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
    {
      accessorKey: 'amountpaid',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('amount')} />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amountpaid'));

        return <div className="font-medium">{formattedAmount(amount)}</div>;
      },
    },
  ];
};
