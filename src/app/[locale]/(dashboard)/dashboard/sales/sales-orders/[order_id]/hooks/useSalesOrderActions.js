import {
  Check,
  CheckCheck,
  FileText,
  Handshake,
  HeartHandshake,
  IndianRupee,
  Package,
  Pencil,
  X,
} from 'lucide-react';
import Loading from '@/components/ui/Loading';

export const useSalesOrderActions = ({
  orderDetails,
  isGenerateInvoice,
  isRecordingPayment,
  isNegotiation,
  viewNegotiationHistory,
  hasPermission,
  enterpriseId,
  tab,
  params,
  translations,
  acceptMutation,
  handleAccept,
  setIsNegotiation,
  setIsNegotiateOnBehalf,
  setProxyModalOpen,
  setIsRecordingPayment,
  setIsEditingOrder,
  setIsEditingServiceOrder,
  acceptOrderMutation,
  setModalData,
  remindOrderMutation,
  unRepliedInvoiceMutation,
  setIsGenerateInvoice,
  stockOutMutation,
  setWithdrawModalOpen,
}) => {
  const ctaList = [];
  const threeDotActions = [];

  if (orderDetails) {
    // negotiation ctas
    if (
      !isGenerateInvoice &&
      !isNegotiation &&
      !isRecordingPayment &&
      !viewNegotiationHistory
    ) {
      if (hasPermission('permission:sales-negotiation')) {
        if (
          tab === 'overview' &&
          orderDetails?.negotiationStatus === 'NEW' &&
          orderDetails?.sellerEnterpriseId === enterpriseId
        ) {
          if (orderDetails?.orderType === 'PURCHASE' && !isNegotiation) {
            ctaList.push({
              isDropdown: true,
              label: translations('ctas.footer_ctas.negotiate'),
              variant: 'blue_outline',
              actions: [
                {
                  key: 'negotiate',
                  label: translations('ctas.footer_ctas.negotiate'),
                  icon: Handshake,
                  onClick: () => setIsNegotiation(true),
                },
                orderDetails?.negotiationStatus === 'NEGOTIATION' && {
                  key: 'negotiateByBehalf',
                  label: translations('ctas.footer_ctas.negotiateByBehalf'),
                  icon: HeartHandshake,
                  onClick: () => {
                    setIsNegotiation(true);
                    setIsNegotiateOnBehalf(true);
                  },
                },
              ],
            });
            ctaList.push({
              isDropdown: true,
              label: acceptMutation.isPending ? (
                <Loading size={14} />
              ) : (
                translations('ctas.footer_ctas.accept')
              ),
              variant: 'default',
              disabled: acceptMutation.isPending,
              actions: [
                {
                  key: 'accept',
                  label: translations('ctas.footer_ctas.accept'),
                  icon: Check,
                  onClick: handleAccept,
                  disabled: acceptMutation.isPending,
                },
                orderDetails?.negotiationStatus === 'NEGOTIATION' && {
                  key: 'acceptByBehalf',
                  label: translations('ctas.footer_ctas.acceptByBehalf'),
                  icon: CheckCheck,
                  onClick: () => setProxyModalOpen(true),
                  disabled: acceptMutation.isPending,
                },
              ],
            });
          }
        }
        if (
          tab === 'overview' &&
          orderDetails?.negotiationStatus === 'NEGOTIATION' &&
          orderDetails?.sellerEnterpriseId === enterpriseId &&
          !viewNegotiationHistory
        ) {
          if (orderDetails?.orderStatus === 'BID_SUBMITTED' && !isNegotiation) {
            ctaList.push({
              isDropdown: true,
              label: translations('ctas.footer_ctas.negotiate'),
              variant: 'blue_outline',
              actions: [
                {
                  key: 'negotiate',
                  label: translations('ctas.footer_ctas.negotiate'),
                  icon: Handshake,
                  onClick: () => setIsNegotiation(true),
                },
                orderDetails?.negotiationStatus === 'NEGOTIATION' && {
                  key: 'negotiateByBehalf',
                  label: translations('ctas.footer_ctas.negotiateByBehalf'),
                  icon: HeartHandshake,
                  onClick: () => {
                    setIsNegotiation(true);
                    setIsNegotiateOnBehalf(true);
                  },
                },
              ],
            });
            ctaList.push({
              isDropdown: true,
              label: acceptMutation.isPending ? (
                <Loading size={14} />
              ) : (
                translations('ctas.footer_ctas.accept')
              ),
              variant: 'default',
              disabled: acceptMutation.isPending,
              actions: [
                {
                  key: 'accept',
                  label: translations('ctas.footer_ctas.accept'),
                  icon: Check,
                  onClick: handleAccept,
                  disabled: acceptMutation.isPending,
                },
                orderDetails?.negotiationStatus === 'NEGOTIATION' && {
                  key: 'acceptByBehalf',
                  label: translations('ctas.footer_ctas.acceptByBehalf'),
                  icon: CheckCheck,
                  onClick: () => setProxyModalOpen(true),
                  disabled: acceptMutation.isPending,
                },
              ],
            });
          }
        }
      }
    }

    // record payment CTA
    if (
      !isGenerateInvoice &&
      !isRecordingPayment &&
      (orderDetails?.negotiationStatus === 'INVOICED' ||
        orderDetails?.negotiationStatus === 'PARTIAL_INVOICED') &&
      orderDetails?.metaData?.payment?.status !== 'PAID' &&
      !viewNegotiationHistory
    ) {
      if (hasPermission('permission:sales-create-payment')) {
        ctaList.push({
          icon: <IndianRupee size={14} />,
          label: translations('ctas.record_payment'),
          onClick: () => setIsRecordingPayment(true),
          variant: 'blue_outline',
        });
      }
    }

    // revise CTA
    if (
      !isGenerateInvoice &&
      !isRecordingPayment &&
      !isNegotiation &&
      orderDetails?.orderType === 'SALES' &&
      enterpriseId?.toString() ===
        orderDetails?.sellerEnterpriseId?.toString() &&
      orderDetails?.negotiationStatus !== 'WITHDRAWN' &&
      orderDetails?.negotiationStatus !== 'ACCEPTED' &&
      orderDetails?.negotiationStatus !== 'INVOICED' &&
      orderDetails?.negotiationStatus !== 'PARTIAL_INVOICED' &&
      orderDetails?.negotiationStatus !== 'NEGOTIATION' &&
      !viewNegotiationHistory
    ) {
      if (hasPermission('permission:sales-edit')) {
        threeDotActions.push({
          key: 'revise',
          icon: Pencil,
          label: translations('ctas.more.revise'),
          onClick: () => {
            if (orderDetails?.invoiceType === 'GOODS') {
              setIsEditingOrder(true);
            } else {
              setIsEditingServiceOrder(true);
            }
          },
        });
      }
    }

    // marked as confirmed (offline)
    if (
      !isGenerateInvoice &&
      !isRecordingPayment &&
      !isNegotiation &&
      orderDetails?.negotiationStatus === 'NEW' &&
      orderDetails?.orderType === 'SALES' &&
      orderDetails?.buyerType === 'UNINVITED-ENTERPRISE' &&
      orderDetails?.metaData?.sellerData?.orderStatus === 'OFFER_SENT'
    ) {
      if (hasPermission('permission:sales-edit')) {
        ctaList.push({
          icon: <Check size={14} />,
          label: translations('ctas.mark_as_confirmed_offline.cta'),
          onClick: () =>
            acceptOrderMutation.mutate({ orderId: Number(params.order_id) }),
          variant: 'default',
        });
      }
    }

    // generateInvoice CTA
    if (
      !isGenerateInvoice &&
      !isRecordingPayment &&
      !orderDetails?.invoiceGenerationCompleted &&
      (orderDetails?.negotiationStatus === 'ACCEPTED' ||
        orderDetails?.negotiationStatus === 'PARTIAL_INVOICED' ||
        (orderDetails?.negotiationStatus === 'NEW' &&
          orderDetails?.orderType === 'SALES')) &&
      orderDetails?.buyerType === 'ENTERPRISE'
    ) {
      if (hasPermission('permission:sales-invoice-create')) {
        ctaList.push({
          icon: <FileText size={14} />,
          label: translations('ctas.generate_invoice'),
          onClick: () => {
            if (
              orderDetails?.buyerType === 'ENTERPRISE' &&
              orderDetails?.metaData?.sellerData?.orderStatus === 'OFFER_SENT'
            ) {
              setModalData({
                isOpen: true,
                title: 'Enterprise Offer Pending',
                description:
                  'Your client hasn’t replied to this order yet. Proceeding will accept the order and allow you to create an invoice. Would you like to proceed?',
                buttons: [
                  {
                    label: 'Remind',
                    variant: 'outline',
                    onClick: () => remindOrderMutation.mutate(),
                  },
                  {
                    label: 'Proceed, anyway',
                    onClick: () => {
                      unRepliedInvoiceMutation.mutate({
                        orderId: Number(params.order_id),
                        amount: orderDetails?.amount,
                        gstAmount: orderDetails?.gstAmount,
                        orderItems: orderDetails?.orderItems,
                      });
                    },
                  },
                ],
              });
            } else {
              setIsGenerateInvoice(true);
            }
          },
          variant: 'blue_outline',
        });
      }
    }

    // stock-out CTA
    if (
      !isGenerateInvoice &&
      !isRecordingPayment &&
      !orderDetails?.invoiceGenerationCompleted &&
      orderDetails?.negotiationStatus === 'ACCEPTED' &&
      orderDetails?.metaData?.sellerData?.stockOut === 'STOCK_OUT' &&
      !viewNegotiationHistory
    ) {
      if (hasPermission('permission:sales-stock-out')) {
        ctaList.push({
          icon: <Package size={14} />,
          label: translations('ctas.stock-out'),
          onClick: () =>
            stockOutMutation.mutate({
              enterpriseId: Number(enterpriseId),
              orderId: Number(params.order_id),
            }),
          variant: 'outline',
        });
      }
    }

    // cancel cta
    if (
      !isGenerateInvoice &&
      !isRecordingPayment &&
      orderDetails?.negotiationStatus === 'NEW' &&
      orderDetails?.metaData?.sellerData?.orderStatus === 'OFFER_SENT'
    ) {
      if (hasPermission('permission:sales-edit')) {
        threeDotActions.push({
          key: 'cancel',
          icon: X,
          label: translations('ctas.cancel.cta'),
          onClick: () => setWithdrawModalOpen(true),
        });
      }
    }

    if (threeDotActions.length > 0) {
      ctaList.push({
        isDropdown: true,
        isThreeDots: true,
        label: 'more-actions',
        variant: 'outline',
        actions: threeDotActions,
      });
    }
  }

  const recommendedActions = [];
  const ancillaryActions = [];
  let cancelAction = null;

  if (orderDetails) {
    ctaList.forEach((cta) => {
      if (cta.isHeader) {
        // Skipped, kept in header
      } else if (cta.isDropdown) {
        if (cta.isThreeDots) {
          (cta.actions || []).forEach((action) => {
            if (action) {
              if (action.key === 'cancel') {
                cancelAction = action;
              } else {
                ancillaryActions.push(action);
              }
            }
          });
        } else {
          (cta.actions || []).forEach((action) => {
            if (action) {
              ancillaryActions.push(action);
            }
          });
        }
      } else {
        recommendedActions.push(cta);
      }
    });
  }

  const hasAnyActions =
    recommendedActions.length > 0 ||
    ancillaryActions.length > 0 ||
    !!cancelAction;

  return {
    ctaList,
    recommendedActions,
    ancillaryActions,
    cancelAction,
    hasAnyActions,
  };
};
