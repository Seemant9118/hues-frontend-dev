import { formattedAmount } from '@/appUtils/helperFunctions';
import { ChevronDown, ChevronUp, MoveUpRight } from 'lucide-react';
import moment from 'moment';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';

const InvoiceOverview = ({
  isCollapsableOverview,
  invoiceId,
  orderId,
  orderRefId,
  Name,
  paymentStatus,
  debitNoteStatus,
  type,
  date,
  amount,
}) => {
  const router = useRouter();
  const pathName = usePathname();
  const isSalesDetailPage = pathName.includes('/sales-invoices');

  const [isOpen, setIsOpen] = useState(false);

  // fn for capitalization
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return (
    <>
      {!isCollapsableOverview && (
        <section className="flex h-52 justify-between gap-2 rounded-md border p-5">
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

            <section className="flex w-1/4 flex-col gap-2">
              <p className="text-xs font-bold">Payment Status</p>
              <div>{paymentStatus}</div>
            </section>
          </div>

          {/* second column */}
          <div className="flex w-full flex-col justify-between">
            <section className="flex flex-col gap-2">
              <p className="text-xs font-bold">Order ID</p>
              <p
                className="flex cursor-pointer items-center gap-1 text-sm font-bold hover:text-primary"
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
              <p className="text-xs font-bold">Types</p>
              <p className="text-sm font-bold">{capitalize(type)}</p>
            </section>

            <section className="flex w-1/4 flex-col gap-2">
              <p className="text-xs font-bold">Debit Notes</p>
              <div>{debitNoteStatus}</div>
            </section>
          </div>

          {/* third column */}
          <div className="flex w-full flex-col gap-3">
            <section className="flex flex-col gap-2">
              <p className="text-xs font-bold">Date</p>
              <p className="text-sm font-bold">
                {moment(date).format('DD/MM/YYYY')}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <p className="text-xs font-bold">Total Amount</p>
              <p className="text-sm font-bold">{formattedAmount(amount)}</p>
            </section>
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
                  <p className="text-xs font-bold">Invoice ID</p>
                  <p className="text-sm font-bold">{invoiceId}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {isSalesDetailPage ? 'Client' : 'Vendor'} Name
                  </p>
                  <p className="text-sm font-bold">{Name}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-bold">Order ID</p>
                  <p className="text-sm font-bold">{orderId}</p>
                </div>
                <div className="flex flex-col gap-5">
                  <p className="text-xs font-bold">Total Amount</p>
                  <p className="text-sm font-bold">{formattedAmount(amount)}</p>
                </div>
              </section>
            )}
            {isOpen && <h1 className="text-sm font-bold">Overview</h1>}
          </div>

          <CollapsibleContent className="animate-fadeInUp space-y-2">
            <section className="flex h-40 rounded-md p-5">
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
                  <p className="text-sm font-bold">{capitalize(type)}</p>
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
                  <p className="text-sm font-bold">{formattedAmount(amount)}</p>
                </section>
              </div>
            </section>
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  );
};

export default InvoiceOverview;
