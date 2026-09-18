import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { auditLogsAPIs } from '@/api/auditLogs/auditLogsApi';
import { invitation } from '@/api/invitation/Invitation';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { getOrderAudits } from '@/services/AuditLogs_Services/AuditLogsService';
import { getInvitationStatus } from '@/services/Invitation_Service/Invitation_Service';
import {
  acceptOrder,
  withDrawOrder,
} from '@/services/Invoice_Services/Invoice_Services';
import {
  bulkNegotiateAcceptOrReject,
  bulkNegotiateAcceptOrRejectOnBehalf,
  OrderDetails,
  remindOrder,
  updateOrderForUnrepliedSales,
} from '@/services/Orders_Services/Orders_Services';
import { stockOut } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { toast } from 'sonner';

export const useSalesOrderQueries = ({
  orderId,
  tab,
  hasPermission,
  translations,
  setModalData,
  setWithdrawModalOpen,
  setIsPINError,
  router,
}) => {
  const queryClient = useQueryClient();

  // api calling for order timeline
  const { isLoading: isTimeLinesDataLoading, data: timeLineData } = useQuery({
    queryKey: [auditLogsAPIs.getOrderAudits.endpointKey, orderId],
    queryFn: () => getOrderAudits(orderId),
    select: (data) => data.data.data,
    enabled: tab === 'timeline',
  });

  // api calling for orderDEtails
  const {
    isLoading,
    data: orderDetails,
    error,
  } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey, orderId],
    queryFn: () => OrderDetails(orderId),
    select: (data) => data.data.data,
    enabled: hasPermission('permission:sales-view'),
    retry: (failureCount, error) => {
      // Don't retry if it's a 403 error
      if (error?.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  const { data: invitationData } = useQuery({
    queryKey: [
      invitation.getInvitationStatus.endpointKey,
      orderDetails?.buyerId,
    ],
    queryFn: () => getInvitationStatus({ buyerId: orderDetails?.buyerId }),
    select: (data) => data.data.data,
    enabled: orderDetails?.buyerType === 'UNINVITED-ENTERPRISE',
    refetchOnWindowFocus: false,
  });

  // accept mutation
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
      orderId: Number(orderId),
      status: 'ACCEPTED',
    });
  };

  const handleProxyAccept = (proxyData) => {
    // FORMDATA
    const formData = new FormData();
    formData.append('orderId', Number(orderId));
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

  const stockOutMutation = useMutation({
    mutationKey: [stockInOutAPIs.stockOut.endpointKey],
    mutationFn: stockOut,
    onSuccess: () => {
      toast.success(translations('successMsg.stock_out'));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      );
    },
  });

  const acceptOrderMutation = useMutation({
    mutationKey: [invoiceApi.acceptOrder.endpointKey],
    mutationFn: acceptOrder,
    onSuccess: (res) => {
      toast.success(translations('ctas.mark_as_confirmed_offline.successMsg'));
      setModalData((prev) => ({
        ...prev,
        isOpen: false,
      }));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      router.push(
        `/dashboard/sales/sales-orders/${res?.data?.data?.orderId}?state=generateInvoice`,
      );
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          translations('ctas.mark_as_confirmed_offline.errorMsg') ||
          translations('errorMsg.common'),
      );
    },
  });

  // for order withdraw
  const withdrawOrderMutation = useMutation({
    mutationKey: [invoiceApi.withDrawOrder.endpointKey],
    mutationFn: withDrawOrder,
    onSuccess: () => {
      toast.success(translations('ctas.cancel.successMsg'));
      setModalData((prev) => ({
        ...prev,
        isOpen: false,
      }));
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

  const remindOrderMutation = useMutation({
    mutationKey: [orderApi.remindOrder.endpointKey],
    mutationFn: () => remindOrder(Number(orderId)),
    onSuccess: () => {
      toast.success('Reminder Send Successfully');
      setModalData((prev) => ({
        ...prev,
        isOpen: false,
      }));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  // for making invoice of unrreplied order
  const unRepliedInvoiceMutation = useMutation({
    mutationFn: updateOrderForUnrepliedSales,
    onSuccess: (res) => {
      toast.success(translations('successMsg.invoice_generate_success'));
      setModalData((prev) => ({
        ...prev,
        isOpen: false,
      }));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      router.push(
        `/dashboard/sales/sales-orders/${res?.data?.data?.newOrderId}?state=generateInvoice`,
      );
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      );
    },
  });

  return {
    isTimeLinesDataLoading,
    timeLineData,
    isLoading,
    orderDetails,
    error,
    invitationData,
    acceptMutation,
    acceptOnBehalfMutation,
    handleAccept,
    handleProxyAccept,
    stockOutMutation,
    acceptOrderMutation,
    withdrawOrderMutation,
    remindOrderMutation,
    unRepliedInvoiceMutation,
  };
};
