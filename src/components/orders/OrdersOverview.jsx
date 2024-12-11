import { acknowledgeApi } from '@/api/acknowledgements/acknowledgeApi';
import { orderApi } from '@/api/order_api/order_api';
import { formattedAmount } from '@/appUtils/helperFunctions';
import {
  undoAcknowledgeStatus,
  updateAcknowledgeStatus,
} from '@/services/Acknowledge_Services/AcknowledgeServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Info, MoveUpRight } from 'lucide-react';
import { useParams, usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Progress } from '../ui/progress';

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
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const pathName = usePathname();
  const isSalesDetailPage = pathName.includes('/sales-orders');
  const isPurchaseDetailPage = pathName.includes('/purchase-orders');

  const paymentProgressPercent = (amtPaid / totalAmount) * 100;

  // update acknowledge status : yes or no
  const updateAcknowlegeMutation = useMutation({
    mutationKey: [
      acknowledgeApi.updateAcknowledgeStatus.endpoint,
      params.order_id,
    ],
    mutationFn: updateAcknowledgeStatus,
    onSuccess: () => {
      toast.success('Order Acknowledged Successfully');
      queryClient.invalidateQueries([
        orderApi.getOrderDetails.endpointKey,
        orderId,
      ]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // undo acknowledgestatus : undo
  const undoAcknowlegeMutation = useMutation({
    mutationKey: [
      acknowledgeApi.undoAcknowledgeStatus.endpoint,
      params.order_id,
    ],
    mutationFn: undoAcknowledgeStatus,
    onSuccess: () => {
      toast.success('Undo Order Acknowledged Successfully');
      queryClient.invalidateQueries([
        orderApi.getOrderDetails.endpointKey,
        orderId,
      ]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleAcknowledgeAcceptReject = (isAccept) => {
    updateAcknowlegeMutation.mutate({
      id: orderDetails?.acknowledgement?.id,
      data: {
        isAcknowledged: isAccept,
        contextId: Number(params.order_id),
      },
    });
  };

  const hanldeRevertAcknowledge = () => {
    undoAcknowlegeMutation.mutate({
      id: orderDetails?.acknowledgement?.id,
      data: {
        contextId: params.order_id,
      },
    });
  };

  return (
    <>
      {!isCollapsableOverview && (
        <section
          className={
            isPurchaseDetailPage && orderDetails?.isAcknowledgeMentNeeded
              ? 'flex h-60 flex-col gap-2 rounded-md border p-5'
              : 'h-48 rounded-md border p-5'
          }
        >
          <section className="flex">
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
                  <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amtPaid)} of ${formattedAmount(totalAmount)}`}</p>
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
          {isPurchaseDetailPage && orderDetails?.isAcknowledgeMentNeeded && (
            <section className="flex items-center justify-between rounded-md bg-[#288AF90A] px-3 py-1.5">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Info size={14} />
                This order is directly recorded by our client/vendor.
                Acknowledge to add it to your order list
              </span>
              <div className="flex gap-2">
                {/* actionTaken : true, undo */}
                {orderDetails?.acknowledgement?.actionTaken && (
                  <Button
                    onClick={hanldeRevertAcknowledge}
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-md text-xs"
                  >
                    Undo
                  </Button>
                )}
                {/* actionTaken : false, yes/no */}
                {!orderDetails?.acknowledgement?.actionTaken && (
                  <>
                    <Button
                      onClick={() => handleAcknowledgeAcceptReject(false)}
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-md text-xs"
                    >
                      No
                    </Button>
                    <Button
                      onClick={() => handleAcknowledgeAcceptReject(true)}
                      size="sm"
                      className="h-8 rounded-md bg-[#288AF9] text-xs text-white"
                    >
                      Yes
                    </Button>
                  </>
                )}
              </div>
            </section>
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
                  <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amtPaid)} of ${formattedAmount(totalAmount)}`}</p>
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
                  <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amtPaid)} of ${formattedAmount(totalAmount)}`}</p>
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
