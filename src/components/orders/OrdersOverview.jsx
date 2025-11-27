/* eslint-disable jsx-a11y/alt-text */
import { acknowledgeApi } from '@/api/acknowledgements/acknowledgeApi';
import { orderApi } from '@/api/order_api/order_api';
import { formattedAmount } from '@/appUtils/helperFunctions';
import {
  undoAcknowledgeStatus,
  updateAcknowledgeStatus,
} from '@/services/Acknowledge_Services/AcknowledgeServices';
import { viewOrderinNewTab } from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Eye, Info, MoveUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import Tooltips from '../auth/Tooltips';
import InvitationActionModal from '../Modals/InvitationActionModal';
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
  invitationData,
  setViewNegotiationHistory,
}) => {
  const translations = useTranslations('components.order_overview');

  const queryClient = useQueryClient();
  const [isInviteActionModalOpen, setIsInviteActionModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const pathName = usePathname();
  const isSalesDetailPage = pathName.includes('/sales-orders');
  const isPurchaseDetailPage = pathName.includes('/purchase-orders');

  const paymentProgressPercent = (amtPaid / totalAmount) * 100;

  // const [showAll, setShowAll] = useState(false);

  // const attachmentsToShow = showAll
  //   ? orderDetails.attachments
  //   : orderDetails.attachments.slice(0, 3);

  // const handleClick = (attachment) => {
  //   const isPdf = attachment?.documenturl?.toLowerCase().endsWith('.pdf');
  //   if (isPdf) {
  //     viewPdfInNewTab(attachment?.documenturl);
  //   }
  //   // else you can handle modal inside InvoicePDFViewModal
  // };

  // update acknowledge status : yes or no
  const updateAcknowlegeMutation = useMutation({
    mutationKey: [
      acknowledgeApi.updateAcknowledgeStatus.endpoint,
      params.order_id,
    ],
    mutationFn: updateAcknowledgeStatus,
    onSuccess: () => {
      toast.success(translations('successMsg.acknowledged_sucess'));
      queryClient.invalidateQueries([
        orderApi.getOrderDetails.endpointKey,
        orderId,
      ]);
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
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
      toast.success(translations('successMsg.undo_acknowledged_success'));
      queryClient.invalidateQueries([
        orderApi.getOrderDetails.endpointKey,
        orderId,
      ]);
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
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
                <p className="text-xs font-bold">
                  {translations('label.order_id')}
                </p>
                <p className="flex items-center gap-2 text-sm font-bold">
                  {orderId}
                  <Tooltips
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewOrderinNewTab(params.order_id)}
                        className="font-bold hover:text-primary"
                      >
                        <Eye size={14} />
                      </Button>
                    }
                    content={translations('placeholder.preview_order')}
                  />
                </p>
              </section>

              <section className="flex flex-col gap-2">
                <p className="text-xs font-bold">
                  {isSalesDetailPage
                    ? translations('label.client_name')
                    : translations('label.vendor_name')}
                </p>
                <p className="h-8 w-10/12 truncate text-lg font-bold">
                  {Name ?? 'Name not available'}
                </p>
                <p className="flex items-center text-xs font-bold text-[#A5ABBD]">
                  <span>+91 {mobileNumber}</span>
                  {orderDetails?.buyerType === 'UNINVITED-ENTERPRISE' && (
                    <InvitationActionModal
                      status={invitationData?.invitationStatus}
                      invitationId={invitationData?.invitationId}
                      name={orderDetails?.clientName}
                      mobileNumber={mobileNumber}
                      isInviteActionModalOpen={isInviteActionModalOpen}
                      setIsInviteActionModalOpen={setIsInviteActionModalOpen}
                    />
                  )}
                </p>
              </section>
            </div>
            <div className="flex w-1/2 flex-col gap-4">
              <section className="flex flex-col gap-4">
                <p className="text-xs font-bold">
                  {translations('label.order_status')}
                </p>
                <div>{multiStatus}</div>
              </section>

              {orderDetails?.negotiationStatus === 'PARTIAL_INVOICED' ||
              orderDetails?.negotiationStatus === 'INVOICED' ? (
                <section className="flex flex-col gap-5">
                  <p className="text-xs font-bold">
                    {translations('label.payment_status')}
                  </p>
                  <Progress
                    className="w-1/2 bg-[#F3F3F3]"
                    value={paymentProgressPercent}
                  />
                  <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amtPaid)} of ${formattedAmount(totalAmount)}`}</p>
                </section>
              ) : (
                <section className="flex flex-col gap-3">
                  <p className="text-xs font-bold">
                    {translations('label.total_amount')}
                  </p>
                  <p className="text-sm font-bold">
                    {`${formattedAmount(totalAmount)}`}
                  </p>
                </section>
              )}
            </div>
            {(orderDetails?.negotiationStatus === 'ACCEPTED' ||
              orderDetails?.negotiationStatus === 'INVOICED' ||
              orderDetails?.negotiationStatus === 'NEGOTIATION') && (
              <div className="flex w-1/2 flex-col items-end gap-4">
                <section className="flex flex-col gap-4">
                  <Tooltips
                    trigger={
                      <p
                        onClick={() => {
                          setViewNegotiationHistory(true);
                        }}
                        className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[#288AF9] hover:underline"
                      >
                        {translations('label.view_negotiation')}
                        <MoveUpRight size={12} />
                      </p>
                    }
                    content={translations('placeholder.view_negotiation')}
                  />
                </section>
              </div>
            )}

            {/* attachments - only show when attachements present */}
            {/* {orderDetails?.attachments?.length > 0 && (
              <div className="flex h-full w-1/2 flex-col gap-4">
                <section className="flex flex-col gap-4">
                  <p className="text-xs font-bold">{'Attachments'}</p>

                  <div className="scrollBarStyles flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-2">
                    {attachmentsToShow.map((attachment) => {
                      const isPdf = attachment?.documenturl
                        ?.toLowerCase()
                        .endsWith('.pdf');

                      return isPdf ? (
                        <div
                          key={attachment.attachmentid}
                          onClick={() => handleClick(attachment)}
                          className="cursor-pointer overflow-hidden rounded-full border px-2 hover:bg-muted hover:text-primary"
                        >
                          <div className="flex w-full items-center gap-2 p-1">
                            <FileText size={16} className="text-red-600" />
                            <span className="truncate text-xs">
                              {attachment?.attachmentfilename}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <InvoicePDFViewModal
                          key={attachment.attachmentid}
                          cta={
                            <div className="cursor-pointer overflow-hidden rounded-full border px-2 hover:bg-muted hover:text-primary">
                              <div className="flex items-center gap-2 p-1">
                                <ImageIcon size={16} className="text-primary" />
                                <span className="truncate text-xs">
                                  {attachment?.attachmentfilename}
                                </span>
                              </div>
                            </div>
                          }
                          Url={attachment?.documenturl}
                          name={attachment?.attachmentfilename}
                        />
                      );
                    })}

                    {!showAll && orderDetails.attachments.length > 3 && (
                      <div
                        className="cursor-pointer rounded-full border px-2 py-1 text-xs hover:bg-muted hover:text-primary"
                        onClick={() => setShowAll(true)}
                      >
                        +{orderDetails.attachments.length - 3} more
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )} */}
          </section>
          {isPurchaseDetailPage && orderDetails?.isAcknowledgeMentNeeded && (
            <section className="flex items-center justify-between rounded-md bg-[#288AF90A] px-3 py-1.5">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Info size={14} />
                {translations('acknowledge_message.infoText')}
              </span>
              <div className="flex gap-2">
                {/* actionTaken : true, undo */}
                {orderDetails?.acknowledgement?.actionTaken && (
                  <Button
                    onClick={hanldeRevertAcknowledge}
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-md text-xs"
                    disabled={undoAcknowlegeMutation.isPending}
                  >
                    {translations('acknowledge_message.ctas.undo')}
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
                      disabled={updateAcknowlegeMutation.isPending}
                    >
                      {translations('acknowledge_message.ctas.no')}
                    </Button>
                    <Button
                      onClick={() => handleAcknowledgeAcceptReject(true)}
                      size="sm"
                      className="h-8 rounded-md bg-[#288AF9] text-xs text-white"
                      disabled={updateAcknowlegeMutation.isPending}
                    >
                      {translations('acknowledge_message.ctas.yes')}
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
                  <p className="text-xs font-bold">
                    {translations('label.order_id')}
                  </p>
                  <p className="text-sm font-bold">{orderId}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {isSalesDetailPage
                      ? translations('label.client_name')
                      : translations('label.vendor_name')}
                  </p>
                  <p className="text-sm font-bold">
                    {Name ?? 'Name not available'}
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-bold">
                    {translations('label.order_status')}
                  </p>
                  <div>{multiStatus}</div>
                </div>
                <div className="flex flex-col gap-5">
                  <p className="text-xs font-bold">
                    {translations('label.payment_status')}
                  </p>
                  <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amtPaid)} of ${formattedAmount(totalAmount)}`}</p>
                </div>
              </section>
            )}
            {isOpen && (
              <h1 className="text-sm font-bold">{translations('title')}</h1>
            )}
          </div>

          <CollapsibleContent className="animate-fadeInUp space-y-2">
            <section className="flex h-48 gap-2 rounded-md p-5">
              <div className="flex w-1/2 flex-col gap-4">
                <section className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {translations('label.order_id')}
                  </p>
                  <p className="text-sm font-bold">{orderId}</p>
                </section>

                <section className="flex flex-col gap-2">
                  <p className="text-xs font-bold">
                    {isSalesDetailPage
                      ? translations('label.client_name')
                      : translations('label.vendor_name')}
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
                  <p className="text-xs font-bold">
                    {translations('label.order_status')}
                  </p>
                  <div>{multiStatus}</div>
                </section>

                <section className="flex flex-col gap-5">
                  <p className="text-xs font-bold">
                    {translations('label.payment_status')}
                  </p>
                  <Progress
                    className="w-1/2 bg-[#F3F3F3]"
                    value={paymentProgressPercent}
                  />
                  <p className="text-xs font-bold text-[#A5ABBD]">{`${formattedAmount(amtPaid)} of ${formattedAmount(totalAmount)}`}</p>
                </section>
              </div>
            </section>
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  );
};

export default OrdersOverview;
