import { capitalize, formattedAmount } from '@/appUtils/helperFunctions';
import { ChevronDown, ChevronUp, MoveUpRight } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Progress } from '../ui/progress';

const InvoiceOverview = ({
  isCollapsableOverview,
  invoiceDetails,
  invoiceId,
  orderId,
  orderRefId,
  Name,
  paymentStatus,
  debitNoteStatus,
  type,
  date,
  amount,
  amountPaid = 0,
}) => {
  const translations = useTranslations('components.invoice_overview');
  const router = useRouter();
  const pathName = usePathname();
  const isSalesDetailPage = pathName.includes('/sales-invoices');

  const paymentProgressPercent = (amountPaid / amount) * 100;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isCollapsableOverview && (
        <section className="flex h-52 justify-between gap-2 rounded-md border p-5">
          {/* first column */}
          <div className="flex w-full flex-col justify-between">
            <section className="flex flex-col gap-2">
              <p className="text-xs font-bold">
                {translations('label.invoice_id')}
              </p>
              <p className="text-sm font-bold">{invoiceId}</p>
            </section>

            <section className="flex flex-col gap-2">
              <p className="text-xs font-bold">
                {isSalesDetailPage
                  ? translations('label.client_name')
                  : translations('label.vendor_name')}
              </p>
              <p className="text-sm font-bold">{Name}</p>
            </section>

            <section className="flex w-fit flex-col gap-2">
              <p className="text-xs font-bold">
                {translations('label.payment_status')}
              </p>
              <div>{paymentStatus}</div>
            </section>
          </div>

          {/* second column */}
          <div className="flex w-full flex-col justify-between">
            <section className="flex flex-col gap-2">
              <p className="text-xs font-bold">
                {translations('label.order_id')}
              </p>
              <p
                className="flex cursor-pointer items-center gap-0.5 text-sm font-bold hover:text-primary hover:underline"
                onClick={() => {
                  if (isSalesDetailPage) {
                    router.push(`/sales/sales-orders/${orderId}`);
                  } else {
                    router.push(`/purchases/purchase-orders/${orderId}`);
                  }
                }}
              >
                {orderRefId} <MoveUpRight size={12} />
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <p className="text-xs font-bold">{translations('label.type')}</p>
              <p className="text-sm font-bold">{capitalize(type)}</p>
            </section>

            <section className="flex w-fit flex-col gap-2">
              <p className="text-xs font-bold">
                {translations('label.debit_notes')}
              </p>
              <div className="w-full">{debitNoteStatus}</div>
            </section>
          </div>

          {/* third column */}
          <div className="flex w-full flex-col gap-3">
            <section className="flex flex-col gap-2">
              <p className="text-xs font-bold">{translations('label.date')}</p>
              <p className="text-sm font-bold">
                {moment(date).format('DD/MM/YYYY')}
              </p>
            </section>

            {invoiceDetails?.invoiceMetaData?.payment?.status ===
              'PARTIAL_PAID' ||
            invoiceDetails?.invoiceMetaData?.payment?.status === 'PAID' ? (
              <section className="flex flex-col gap-5">
                <p className="text-xs font-bold">
                  {translations('label.payment_status')}
                </p>
                <Progress
                  className="w-1/2 bg-[#F3F3F3]"
                  value={paymentProgressPercent}
                />
                <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amountPaid)} of ${formattedAmount(amount)}`}</p>
              </section>
            ) : (
              <section className="flex flex-col gap-3">
                <p className="text-xs font-bold">
                  {translations('label.total_amount')}
                </p>
                <p className="text-sm font-bold">
                  {`${formattedAmount(amount)}`}
                </p>
              </section>
            )}
          </div>
        </section>
      )}

      {isCollapsableOverview && (
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full rounded-md border py-4 pl-2 pr-14"
        >
          <div
            className={
              isOpen ? 'flex items-center gap-2' : 'flex justify-between gap-2'
            }
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" debounceTime="0">
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
            {!isOpen && (
              <section className="flex w-full animate-fadeInUp items-center justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {translations('label.invoice_id')}
                  </p>
                  <p className="text-sm font-bold">{invoiceId}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {isSalesDetailPage
                      ? translations('label.client_name')
                      : translations('label.vendor_name')}
                  </p>
                  <p className="text-sm font-bold">{Name}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-bold">
                    {translations('label.order_id')}
                  </p>
                  <p className="text-sm font-bold">{orderRefId}</p>
                </div>
                {invoiceDetails?.invoiceMetaData?.payment?.status ===
                  'PARTIAL_PAID' ||
                invoiceDetails?.invoiceMetaData?.payment?.status === 'PAID' ? (
                  <section className="flex flex-col gap-5">
                    <p className="text-xs font-bold">
                      {translations('label.payment_status')}
                    </p>
                    <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amountPaid)} of ${formattedAmount(amount)}`}</p>
                  </section>
                ) : (
                  <section className="flex flex-col gap-3">
                    <p className="text-xs font-bold">
                      {translations('label.total_amount')}
                    </p>
                    <p className="text-sm font-bold">
                      {`${formattedAmount(amount)}`}
                    </p>
                  </section>
                )}
              </section>
            )}
            {isOpen && (
              <h1 className="text-sm font-bold">{translations('title')}</h1>
            )}
          </div>

          <CollapsibleContent className="animate-fadeInUp space-y-2">
            <section className="flex h-52 rounded-md p-5">
              {/* first column */}
              <div className="flex w-full flex-col justify-between">
                <section className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {translations('label.invoice_id')}
                  </p>
                  <p className="text-sm font-bold">{invoiceId}</p>
                </section>

                <section className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {isSalesDetailPage
                      ? translations('label.client_name')
                      : translations('label.vendor_name')}
                  </p>
                  <p className="text-sm font-bold">{Name}</p>
                </section>

                <section className="flex w-1/4 flex-col gap-2">
                  <p className="text-xs font-bold">
                    {translations('label.payment_status')}
                  </p>
                  <div>{paymentStatus}</div>
                </section>
              </div>

              {/* second column */}
              <div className="flex w-full flex-col justify-between">
                <section className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {translations('label.order_id')}
                  </p>
                  <p className="text-sm font-bold">{orderRefId}</p>
                </section>

                <section className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {translations('label.type')}
                  </p>
                  <p className="text-sm font-bold">{capitalize(type)}</p>
                </section>

                <section className="flex w-1/4 flex-col gap-2">
                  <p className="text-xs font-bold">
                    {translations('label.debit_notes')}
                  </p>
                  <div>{debitNoteStatus}</div>
                </section>
              </div>

              {/* third column */}
              <div className="flex w-full flex-col gap-3">
                <section className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {translations('label.date')}
                  </p>
                  <p className="text-sm font-bold">
                    {moment(date).format('DD/MM/YYYY')}
                  </p>
                </section>

                {invoiceDetails?.invoiceMetaData?.payment?.status ===
                  'PARTIAL_PAID' ||
                invoiceDetails?.invoiceMetaData?.payment?.status === 'PAID' ? (
                  <section className="flex flex-col gap-5">
                    <p className="text-xs font-bold">
                      {translations('label.payment_status')}
                    </p>
                    <Progress
                      className="w-1/2 bg-[#F3F3F3]"
                      value={paymentProgressPercent}
                    />
                    <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amountPaid)} of ${formattedAmount(amount)}`}</p>
                  </section>
                ) : (
                  <section className="flex flex-col gap-3">
                    <p className="text-xs font-bold">
                      {translations('label.total_amount')}
                    </p>
                    <p className="text-sm font-bold">
                      {`${formattedAmount(amount)}`}
                    </p>
                  </section>
                )}
              </div>
            </section>
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  );
};

export default InvoiceOverview;
