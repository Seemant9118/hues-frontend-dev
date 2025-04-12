import { formattedAmount } from '@/appUtils/helperFunctions';
import { MoveUpRight } from 'lucide-react';
import moment from 'moment';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import ViewImage from '../ui/ViewImage';

const PaymentOverview = ({ paymentsDetails }) => {
  const router = useRouter();
  const pathName = usePathname();

  const isPaymentOnSales = pathName.includes('sales');

  if (!paymentsDetails) return null;

  return (
    <div className="space-y-2 rounded-md border p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold">Payment ID</p>
          <p className="text-sm font-bold">
            {paymentsDetails?.paymentReferenceNumber}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold">Invoice ID</p>
          <p
            onClick={() => {
              if (isPaymentOnSales) {
                router.push(
                  `/sales/sales-invoices/${paymentsDetails?.invoiceReferenceNumbers[0]?.id}`,
                );
              } else {
                router.push(
                  `/purchases/purchase-invoices/${paymentsDetails?.invoiceReferenceNumbers[0]?.id}`,
                );
              }
            }}
            className="flex cursor-pointer items-center gap-0.5 text-sm font-bold hover:text-primary hover:underline"
          >
            {
              paymentsDetails?.invoiceReferenceNumbers[0]
                ?.invoiceReferenceNumber
            }
            <MoveUpRight size={12} />
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold">Status</p>
          <div className="flex max-w-sm">
            <ConditionalRenderingStatus status={paymentsDetails?.status} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold">
            {isPaymentOnSales ? 'Client Name' : 'Vendor Name'}
          </p>
          <p className="text-sm font-bold">
            {isPaymentOnSales
              ? `${paymentsDetails?.clientName} (${paymentsDetails?.clientType})`
              : `${paymentsDetails?.sellerName}`}
          </p>
          <p className="text-sm text-gray-400">
            {paymentsDetails?.number ?? '-'}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold">Transaction ID</p>
          <p className="text-sm font-bold">
            {paymentsDetails?.transactionId || '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold">Mode of Payment</p>
          <p className="text-sm font-bold">
            {paymentsDetails?.paymentMode?.toUpperCase()}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold">Amount Paid</p>
          <p className="text-sm font-bold">
            {formattedAmount(paymentsDetails?.amountPaid)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold">Total Amount</p>
          <p className="text-sm font-bold">
            {formattedAmount(paymentsDetails?.totalAmount)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold">Payment Date</p>
          <p className="text-sm font-bold">
            {moment(paymentsDetails?.paymentDate).format('DD/MM/YYYY')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold">Additional Proof</p>
        <div className="space-x-2">
          {paymentsDetails?.attachments?.length > 0
            ? paymentsDetails.attachments.map((attachment) => (
                <ViewImage
                  key={attachment.id}
                  mediaName={attachment.name}
                  mediaImage={attachment.url}
                />
              ))
            : '-'}
        </div>
      </div>
    </div>
  );
};

export default PaymentOverview;
