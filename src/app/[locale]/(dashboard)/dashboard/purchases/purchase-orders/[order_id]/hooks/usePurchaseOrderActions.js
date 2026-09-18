import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import {
  bulkNegotiateAcceptOrReject,
  bulkNegotiateAcceptOrRejectOnBehalf,
} from '@/services/Orders_Services/Orders_Services';
import { stockIn } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { withDrawOrder } from '@/services/Invoice_Services/Invoice_Services';
import {
  Check,
  CheckCheck,
  Handshake,
  HeartHandshake,
  IndianRupee,
  Package,
  Pencil,
  X,
} from 'lucide-react';
import Loading from '@/components/ui/Loading';
import { toast } from 'sonner';

export const usePurchaseOrderActions = ({
  orderDetails,
  isPastInvoices,
  isPaymentAdvicing,
  isNegotiation,
  viewNegotiationHistory,
  hasPermission,
  enterpriseId,
  params,
  translations,
  setIsNegotiation,
  setIsNegotiateOnBehalf,
  setProxyModalOpen,
  setIsPaymentAdvicing,
  setIsEditingOrder,
  setIsEditingPurchaseService,
  setWithdrawModalOpen,
  setIsPINError,
}) => {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationKey: orderApi.bulkNegotiateAcceptOrReject.endpointKey,
    mutationFn: bulkNegotiateAcceptOrReject,
    onSuccess: () => {
      toast.success(translations('successMsg.order_accepted'));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      );
    },
  });

  const acceptOnBehalfMutation = useMutation({
    mutationKey: orderApi.bulkNegotiateAcceptOrRejectOnBehalf.endpointKey,
    mutationFn: bulkNegotiateAcceptOrRejectOnBehalf,
    onSuccess: () => {
      toast.success(translations('successMsg.order_accepted'));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      );
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate({
      orderId: Number(params.order_id),
      status: 'ACCEPTED',
    });
  };

  const handleProxyAccept = (proxyData) => {
    const formData = new FormData();
    formData.append('orderId', Number(params.order_id));
    formData.append('status', 'ACCEPTED');
    formData.append('isProxy', true);
    formData.append('reason', proxyData.reason);
    formData.append('consentNote', proxyData.consentNote);
    if (proxyData.files && proxyData.files.length > 0) {
      proxyData.files.forEach((file) => {
        formData.append('files', file);
      });
    }
    acceptOnBehalfMutation.mutate(formData);
  };

  const stockInMutation = useMutation({
    mutationKey: [stockInOutAPIs.stockIn.endpointKey],
    mutationFn: stockIn,
    onSuccess: () => {
      toast.success(translations('successMsg.stock_in'));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      );
    },
  });

  const withdrawOrderMutation = useMutation({
    mutationKey: [invoiceApi.withDrawOrder.endpointKey],
    mutationFn: withDrawOrder,
    onSuccess: () => {
      toast.success(translations('ctas.cancel.successMsg'));
      setWithdrawModalOpen(false);
      setIsPINError(false);
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      if (error?.response?.data?.message?.toLowerCase()?.includes('pin')) {
        setIsPINError(true);
      }
      toast.error(
        error.response?.data?.message ||
          translations('ctas.cancel.errorMsg') ||
          translations('errorMsg.common'),
      );
    },
  });

  // maintain ctas in purchase order
  const ctaList = [];
  if (orderDetails) {
    const threeDotActions = [];
    // negotiation ctas
    if (!isNegotiation && !viewNegotiationHistory) {
      if (hasPermission('permission:purchase-negotiation')) {
        // status NEW
        if (
          !isPastInvoices &&
          orderDetails?.negotiationStatus === 'NEW' &&
          orderDetails?.buyerId === enterpriseId
        ) {
          if (orderDetails?.orderType === 'SALES' && !isNegotiation) {
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

        // status NEGOTIATION
        if (
          !isPastInvoices &&
          orderDetails?.negotiationStatus === 'NEGOTIATION' &&
          orderDetails?.buyerId === enterpriseId
        ) {
          if (
            orderDetails?.orderStatus === 'OFFER_SUBMITTED' &&
            !isNegotiation
          ) {
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

    // send payment advice CTA
    if (
      !isPaymentAdvicing &&
      !viewNegotiationHistory &&
      (orderDetails?.negotiationStatus === 'INVOICED' ||
        orderDetails?.negotiationStatus === 'PARTIAL_INVOICED') &&
      orderDetails?.metaData?.payment?.status !== 'PAID'
    ) {
      if (hasPermission('permission:purchase-create-payment')) {
        ctaList.push({
          icon: <IndianRupee size={14} />,
          label: translations('ctas.payment_advice'),
          onClick: () => setIsPaymentAdvicing(true),
          variant: 'blue_outline',
        });
      }
    }

    // stock-in CTA
    if (
      !isPaymentAdvicing &&
      !viewNegotiationHistory &&
      !orderDetails?.invoiceGenerationCompleted &&
      orderDetails?.negotiationStatus === 'ACCEPTED' &&
      orderDetails?.metaData?.buyerData?.stockIn !== 'STOCK_IN'
    ) {
      if (hasPermission('permission:purchase-stock-in')) {
        ctaList.push({
          icon: <Package size={14} />,
          label: translations('ctas.stock-in'),
          onClick: () =>
            stockInMutation.mutate({
              enterpriseId: Number(enterpriseId),
              orderId: params.order_id,
            }),
          variant: 'outline',
        });
      }
    }

    // revise CTA
    if (
      orderDetails?.negotiationStatus === 'NEW' &&
      orderDetails?.orderType === 'PURCHASE' &&
      !viewNegotiationHistory &&
      enterpriseId?.toString() === orderDetails?.buyerId?.toString()
    ) {
      if (hasPermission('permission:purchase-edit')) {
        threeDotActions.push({
          key: 'revise',
          icon: Pencil,
          label: translations('ctas.more.revise'),
          onClick: () => {
            if (orderDetails?.invoiceType === 'GOODS') {
              setIsEditingOrder(true);
            } else {
              setIsEditingPurchaseService(true);
            }
          },
        });
      }
    }

    // withdraw CTA
    if (
      orderDetails?.negotiationStatus === 'NEW' &&
      orderDetails?.metaData?.buyerData?.orderStatus === 'BID_SENT'
    ) {
      if (hasPermission('permission:purchase-edit')) {
        threeDotActions.push({
          key: 'withdraw',
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
              if (action.key === 'withdraw') {
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
    acceptMutation,
    acceptOnBehalfMutation,
    handleAccept,
    handleProxyAccept,
    stockInMutation,
    withdrawOrderMutation,
  };
};
