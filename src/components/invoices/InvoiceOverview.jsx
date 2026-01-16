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
  defectsStatus,
  hasDebitNote,
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
        <section className="grid grid-cols-3 gap-4 rounded-md border p-5 font-bold">
          <section className="flex flex-col">
            <p className="text-sm text-gray-600">
              {translations('label.invoice_id')}
            </p>
            <p className="text-base font-semibold">{invoiceId}</p>
          </section>

          <section className="flex flex-col">
            <p className="text-sm text-gray-600">
              {isSalesDetailPage
                ? translations('label.client_name')
                : translations('label.vendor_name')}
            </p>
            <p className="font-bold">{Name}</p>
          </section>

          <section className="flex w-fit flex-col">
            <p className="text-sm text-gray-600">
              {translations('label.payment_status')}
            </p>
            <div>{paymentStatus}</div>
          </section>
          <section className="flex flex-col">
            <p className="text-sm text-gray-600">
              {translations('label.order_id')}
            </p>
            <p
              className="flex cursor-pointer items-center gap-0.5 font-bold hover:text-primary hover:underline"
              onClick={() => {
                if (isSalesDetailPage) {
                  router.push(`/dashboard/sales/sales-orders/${orderId}`);
                } else {
                  router.push(
                    `/dashboard/purchases/purchase-orders/${orderId}`,
                  );
                }
              }}
            >
              {orderRefId} <MoveUpRight size={12} />
            </p>
          </section>

          <section className="flex flex-col">
            <p className="text-sm text-gray-600">
              {translations('label.type')}
            </p>
            <p className="font-bold">{capitalize(type)}</p>
          </section>

          {hasDebitNote && (
            <section className="flex w-fit flex-col">
              <p className="text-sm text-gray-600">
                {translations('label.debit_notes')}
              </p>
              <>{debitNoteStatus}</>
            </section>
          )}

          <section className="flex flex-col">
            <p className="text-sm text-gray-600">
              {translations('label.date')}
            </p>
            <p className="font-bold">{moment(date).format('DD/MM/YYYY')}</p>
          </section>

          {invoiceDetails?.invoiceMetaData?.payment?.status ===
            'PARTIAL_PAID' ||
          invoiceDetails?.invoiceMetaData?.payment?.status === 'PAID' ? (
            <section className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                {translations('label.payment_status')}
              </p>
              <Progress
                className="w-1/2 bg-[#F3F3F3]"
                value={paymentProgressPercent}
              />
              <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amountPaid)} of ${formattedAmount(amount)}`}</p>
            </section>
          ) : (
            <section className="flex flex-col">
              <p className="text-sm text-gray-600">
                {translations('label.total_amount')}
              </p>
              <p className="font-bold">{`${formattedAmount(amount)}`}</p>
            </section>
          )}

          <section className="flex flex-col">
            <p className="text-sm text-gray-600">
              {translations('label.defects')}
            </p>
            <>{defectsStatus}</>
          </section>
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
              <section className="grid w-full animate-fadeInUp grid-cols-4 gap-4 font-bold">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600">
                    {translations('label.invoice_id')}
                  </p>
                  <p className="font-bold">{invoiceId}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600">
                    {isSalesDetailPage
                      ? translations('label.client_name')
                      : translations('label.vendor_name')}
                  </p>
                  <p className="font-bold">{Name}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600">
                    {translations('label.order_id')}
                  </p>
                  <p className="font-bold">{orderRefId}</p>
                </div>
                {invoiceDetails?.invoiceMetaData?.payment?.status ===
                  'PARTIAL_PAID' ||
                invoiceDetails?.invoiceMetaData?.payment?.status === 'PAID' ? (
                  <section className="flex flex-col">
                    <p className="text-sm text-gray-600">
                      {translations('label.payment_status')}
                    </p>
                    <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amountPaid)} of ${formattedAmount(amount)}`}</p>
                  </section>
                ) : (
                  <section className="flex flex-col">
                    <p className="text-sm text-gray-600">
                      {translations('label.total_amount')}
                    </p>
                    <p className="font-bold">{`${formattedAmount(amount)}`}</p>
                  </section>
                )}
              </section>
            )}
            {isOpen && (
              <h1 className="text-sm font-bold text-gray-600">
                {translations('title')}
              </h1>
            )}
          </div>

          <CollapsibleContent className="animate-fadeInUp space-y-2">
            <section className="grid grid-cols-3 gap-2 p-5 font-bold">
              <section className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">
                  {translations('label.invoice_id')}
                </p>
                <p className="font-bold">{invoiceId}</p>
              </section>

              <section className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">
                  {isSalesDetailPage
                    ? translations('label.client_name')
                    : translations('label.vendor_name')}
                </p>
                <p className="font-bold">{Name}</p>
              </section>

              <section className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">
                  {translations('label.payment_status')}
                </p>
                <div>{paymentStatus}</div>
              </section>

              <section className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">
                  {translations('label.order_id')}
                </p>
                <p className="font-bold">{orderRefId}</p>
              </section>

              <section className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">
                  {translations('label.type')}
                </p>
                <p className="font-bold">{capitalize(type)}</p>
              </section>

              {hasDebitNote && (
                <section className="flex flex-col gap-2">
                  <p className="text-sm text-gray-600">
                    {translations('label.debit_notes')}
                  </p>
                  <div className="w-full">{debitNoteStatus}</div>
                </section>
              )}

              <section className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">
                  {translations('label.date')}
                </p>
                <p className="font-bold">{moment(date).format('DD/MM/YYYY')}</p>
              </section>

              {invoiceDetails?.invoiceMetaData?.payment?.status ===
                'PARTIAL_PAID' ||
              invoiceDetails?.invoiceMetaData?.payment?.status === 'PAID' ? (
                <section className="flex flex-col gap-2">
                  <p className="text-sm text-gray-600">
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
                  <p className="text-sm text-gray-600">
                    {translations('label.total_amount')}
                  </p>
                  <p className="font-bold">{`${formattedAmount(amount)}`}</p>
                </section>
              )}

              <section className="flex flex-col">
                <p className="text-sm text-gray-600">
                  {translations('label.defects')}
                </p>
                <>{defectsStatus}</>
              </section>
            </section>
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  );
};

export default InvoiceOverview;
