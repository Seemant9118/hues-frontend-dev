import { formattedAmount } from '@/appUtils/helperFunctions';
import { viewPdfInNewTab } from '@/services/Template_Services/Template_Services';
import { File, MoveUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import InvoicePDFViewModal from '../Modals/InvoicePDFViewModal';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import { Button } from '../ui/button';

const PaymentOverview = ({ paymentsDetails }) => {
  const translations = useTranslations('components.paymentOverview');
  const router = useRouter();
  const pathName = usePathname();
  const isPaymentOnSales = pathName.includes('sales');

  if (!paymentsDetails) return null;

  return (
    <div className="space-y-2 rounded-md border p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold">{translations('paymentId')}</p>
          <p className="text-sm font-bold">
            {paymentsDetails?.paymentReferenceNumber}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold">{translations('invoiceId')}</p>
          <p
            onClick={() => {
              if (isPaymentOnSales) {
                router.push(
                  `/dashboard/sales/sales-invoices/${paymentsDetails?.invoiceReferenceNumbers[0]?.id}`,
                );
              } else {
                router.push(
                  `/dashboard/purchases/purchase-invoices/${paymentsDetails?.invoiceReferenceNumbers[0]?.id}`,
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
          <p className="text-xs font-semibold">{translations('status')}</p>
          <div className="flex max-w-sm">
            <ConditionalRenderingStatus
              status={paymentsDetails?.status}
              isPayment={true}
              isSellerPage={isPaymentOnSales}
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold">
            {isPaymentOnSales
              ? translations('clientName')
              : translations('vendorName')}
          </p>
          <p className="text-sm font-bold">
            {isPaymentOnSales
              ? `${paymentsDetails?.clientName} (${paymentsDetails?.clientType})`
              : `${paymentsDetails?.sellerName}`}
          </p>
          <p className="text-sm text-gray-400">
            {paymentsDetails?.number ?? translations('fallback')}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold">
            {translations('transactionId')}
          </p>
          <p className="text-sm font-bold">
            {paymentsDetails?.transactionId || translations('fallback')}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold">
            {translations('modeOfPayment')}
          </p>
          <p className="text-sm font-bold">
            {paymentsDetails?.paymentMode?.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold">{translations('amountPaid')}</p>
          <p className="text-sm font-bold">
            {formattedAmount(paymentsDetails?.amountPaid)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold">{translations('totalAmount')}</p>
          <p className="text-sm font-bold">
            {formattedAmount(paymentsDetails?.totalAmount)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold">{translations('paymentDate')}</p>
          <p className="text-sm font-bold">{paymentsDetails?.paymentDate}</p>
        </div>

        {paymentsDetails?.paymentMode !== 'cash' && (
          <>
            <div>
              <p className="text-xs font-semibold">{'Bank and Branch Name'}</p>
              <p className="text-sm font-bold">
                {paymentsDetails?.bankName || '-'}
              </p>
              <p className="text-sm font-semibold">
                {paymentsDetails?.branchName || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold">{'Account Number'}</p>
              <p className="text-sm font-bold">
                {paymentsDetails?.maskedAccountNumber || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold">{'IFSC Code'}</p>
              <p className="text-sm font-bold">
                {paymentsDetails?.ifscCode || '-'}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold">
          {translations('additionalProof')}
        </p>
        <div className="space-x-2">
          {paymentsDetails?.attachments?.length > 0
            ? paymentsDetails.attachments.map((attachment) => {
                const isPdf = attachment?.url?.toLowerCase().endsWith('.pdf');

                const handleClick = () => {
                  if (isPdf) {
                    viewPdfInNewTab(attachment.url);
                  } else {
                    // Open modal manually (if modal logic allows it)
                    // Or rely on `InvoicePDFViewModal` for non-PDFs
                  }
                };

                return isPdf ? (
                  <Button
                    key={attachment.id}
                    variant="outline"
                    onClick={handleClick}
                    className="w-56 cursor-pointer overflow-hidden px-2 hover:text-primary"
                  >
                    <div className="flex w-full items-center gap-2">
                      <File size={14} className="shrink-0" />
                      <span className="truncate">{attachment?.name}</span>
                    </div>
                  </Button>
                ) : (
                  <InvoicePDFViewModal
                    key={attachment.id}
                    cta={
                      <Button
                        variant="outline"
                        className="w-56 cursor-pointer overflow-hidden px-2 hover:text-primary"
                      >
                        <div className="flex w-full items-center gap-2">
                          <File size={14} className="shrink-0" />
                          <span className="truncate">{attachment?.name}</span>
                        </div>
                      </Button>
                    }
                    Url={attachment?.url}
                    name={attachment?.name}
                  />
                );
              })
            : translations('fallback')}
        </div>
      </div>
    </div>
  );
};

export default PaymentOverview;
