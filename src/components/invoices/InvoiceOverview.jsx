import moment from 'moment';
import { usePathname } from 'next/navigation';
import React from 'react';

const InvoiceOverview = ({ invoiceId, orderId, Name, type, date, amount }) => {
  const pathName = usePathname();
  const isSalesDetailPage = pathName.includes('/sales-invoices');

  // Format the amount as a dollar amount
  const formatAmountIntoRupee = (amount) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
    return formatted;
  };
  return (
    <section className="flex h-40 justify-between gap-2 rounded-md border p-5">
      {/* first column */}
      <div className="flex w-full flex-col justify-between">
        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold">Invoice ID</p>
          <p className="text-sm font-bold">{invoiceId}</p>
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold">
            {isSalesDetailPage ? 'Client' : 'Vendor'} Name
          </p>
          <p className="text-sm font-bold">{Name}</p>
        </section>
      </div>

      {/* second column */}
      <div className="flex w-full flex-col justify-between">
        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold">Order ID</p>
          <p className="text-sm font-bold">{orderId}</p>
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold">Types</p>
          <p className="text-sm font-bold">{type}</p>
        </section>
      </div>

      {/* third column */}
      <div className="flex w-full flex-col justify-between">
        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold">Date</p>
          <p className="text-sm font-bold">
            {moment(date).format('DD/MM/YYYY')}
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold">Total Amount</p>
          <p className="text-sm font-bold">{formatAmountIntoRupee(amount)}</p>
        </section>
      </div>
    </section>
  );
};

export default InvoiceOverview;
