import { ChevronDown, ChevronUp, MoveUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { Progress } from '../ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Button } from '../ui/button';

const OrdersOverview = ({
  isCollapsableOverview,
  orderDetails,
  orderId,
  multiStatus,
  Name,
  mobileNumber,
  amtPaid,
  totalAmount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  const isSalesDetailPage = pathName.includes('/sales-orders');

  // Format the amount as a dollar amount
  const formatAmountIntoRupee = (amount) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
    return formatted;
  };

  const paymentProgressPercent = (amtPaid / totalAmount) * 100;

  return (
    <>
      {!isCollapsableOverview && (
        <section className="flex h-48 gap-2 rounded-md border p-5">
          <div className="flex w-1/2 flex-col gap-4">
            <section className="flex flex-col gap-2">
              <p className="text-xs font-bold">Order ID</p>
              <p className="text-sm font-bold">{orderId}</p>
            </section>

            <section className="flex flex-col gap-2">
              <p className="text-xs font-bold">
                {isSalesDetailPage ? 'Client' : 'Vendor'} Name
              </p>
              <p className="text-lg font-bold">
                {Name ?? 'Name not available'}
              </p>
              <p className="text-xs font-bold text-[#A5ABBD]">
                +91 {mobileNumber}
              </p>
            </section>
          </div>
          <div className="flex w-1/2 flex-col gap-4">
            <section className="flex flex-col gap-4">
              <p className="text-xs font-bold">Order Status</p>
              <div>{multiStatus}</div>
            </section>

            {(orderDetails?.negotiationStatus === 'PARTIAL_INVOICED' ||
              orderDetails?.negotiationStatus === 'INVOICED') && (
              <section className="flex flex-col gap-5">
                <p className="text-xs font-bold">Payment Status</p>
                <Progress
                  className="w-1/2 bg-[#F3F3F3]"
                  value={paymentProgressPercent}
                />
                <p className="text-xs font-bold text-[#A5ABBD]">{`${formatAmountIntoRupee(amtPaid)} of ${formatAmountIntoRupee(totalAmount)}`}</p>
              </section>
            )}
          </div>
          {(orderDetails?.negotiationStatus === 'ACCEPTED' ||
            orderDetails?.negotiationStatus === 'INVOICED') && (
            <div className="flex w-1/2 flex-col items-end gap-4">
              <section className="flex flex-col gap-4">
                <p className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[#288AF9] hover:underline">
                  View Negotiation <MoveUpRight size={12} />
                </p>
              </section>
            </div>
          )}
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
                  <p className="text-xs font-bold">Order ID</p>
                  <p className="text-sm font-bold">{orderId}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {isSalesDetailPage ? 'Client' : 'Vendor'} Name
                  </p>
                  <p className="text-sm font-bold">
                    {Name ?? 'Name not available'}
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-bold">Order Status</p>
                  <div>{multiStatus}</div>
                </div>
                <div className="flex flex-col gap-5">
                  <p className="text-xs font-bold">Payment Status</p>
                  <p className="text-xs font-bold text-[#A5ABBD]">{`${formatAmountIntoRupee(amtPaid)} of ${formatAmountIntoRupee(totalAmount)}`}</p>
                </div>
              </section>
            )}
            {isOpen && <h1 className="text-sm font-bold">Overview</h1>}
          </div>

          <CollapsibleContent className="animate-fadeInUp space-y-2">
            <section className="flex h-48 gap-2 rounded-md p-5">
              <div className="flex w-1/2 flex-col gap-4">
                <section className="flex flex-col gap-2">
                  <p className="text-xs font-bold">Order ID</p>
                  <p className="text-sm font-bold">{orderId}</p>
                </section>

                <section className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {isSalesDetailPage ? 'Client' : 'Vendor'} Name
                  </p>
                  <p className="text-lg font-bold">
                    {Name ?? 'Name not available'}
                  </p>
                  <p className="text-xs font-bold text-[#A5ABBD]">
                    +91 {mobileNumber}
                  </p>
                </section>
              </div>
              <div className="flex w-1/2 flex-col gap-4">
                <section className="flex flex-col gap-4">
                  <p className="text-xs font-bold">Order Status</p>
                  <div>{multiStatus}</div>
                </section>

                <section className="flex flex-col gap-5">
                  <p className="text-xs font-bold">Payment Status</p>
                  <Progress
                    className="w-1/2 bg-[#F3F3F3]"
                    value={paymentProgressPercent}
                  />
                  <p className="text-xs font-bold text-[#A5ABBD]">{`${formatAmountIntoRupee(amtPaid)} of ${formatAmountIntoRupee(totalAmount)}`}</p>
                </section>
              </div>
              {(orderDetails?.negotiationStatus === 'ACCEPTED' ||
                orderDetails?.negotiationStatus === 'INVOICED') && (
                <div className="flex w-1/2 flex-col items-end gap-4">
                  <section className="flex flex-col gap-4">
                    <p className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[#288AF9] hover:underline">
                      View Negotiation <MoveUpRight size={12} />
                    </p>
                  </section>
                </div>
              )}
            </section>
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  );
};

export default OrdersOverview;
