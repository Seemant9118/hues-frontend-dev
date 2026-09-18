import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auditLogsAPIs } from '@/api/auditLogs/auditLogsApi';
import { orderApi } from '@/api/order_api/order_api';
import { getOrderAudits } from '@/services/AuditLogs_Services/AuditLogsService';
import { OrderDetails } from '@/services/Orders_Services/Orders_Services';

export const usePurchaseOrderQueries = ({
  orderId,
  tab,
  hasPermission,
  router,
  searchParams,
}) => {
  const queryClient = useQueryClient();

  // Route state syncing
  const showInvoice = searchParams.get('showInvoice');
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isEditingPurchaseService, setIsEditingPurchaseService] =
    useState(false);
  const [isPastInvoices, setIsPastInvoices] = useState(showInvoice || false);
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [isNegotiateOnBehalf, setIsNegotiateOnBehalf] = useState(false);
  const [isPaymentAdvicing, setIsPaymentAdvicing] = useState(false);
  const [viewNegotiationHistory, setViewNegotiationHistory] = useState(false);

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');
    setIsEditingOrder(state === 'editOrder');
    setIsEditingPurchaseService(state === 'editServiceOrder');
    setIsNegotiation(
      state === 'negotiation' || state === 'negotiationByBehalf',
    );
    setIsNegotiateOnBehalf(state === 'negotiationByBehalf');
    setIsPastInvoices(state === 'showInvoice');
    setIsPaymentAdvicing(state === 'payment_advice');
    setViewNegotiationHistory(state === 'negotiationHistory');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/dashboard/purchases/purchase-orders/${orderId}`;

    if (isNegotiation) {
      newPath += isNegotiateOnBehalf
        ? '?state=negotiationByBehalf'
        : '?state=negotiation';
    } else if (isPastInvoices) {
      newPath += '?state=showInvoice';
    } else if (isPaymentAdvicing) {
      newPath += '?state=payment_advice';
    } else if (viewNegotiationHistory) {
      newPath += '?state=negotiationHistory';
    } else if (isEditingOrder) {
      newPath += '?state=editOrder';
    } else if (isEditingPurchaseService) {
      newPath += '?state=editServiceOrder';
    } else {
      newPath += '';
    }
    // Use router.push to match original behaviour
    router.push(newPath);
  }, [
    isNegotiation,
    isNegotiateOnBehalf,
    isPastInvoices,
    isPaymentAdvicing,
    viewNegotiationHistory,
    isEditingOrder,
    isEditingPurchaseService,
    orderId,
    router,
  ]);

  useEffect(() => {
    queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
  }, [isNegotiation, queryClient]);

  // api calling for order timeline
  const { isLoading: isTimeLinesDataLoading, data: timeLineData } = useQuery({
    queryKey: [auditLogsAPIs.getOrderAudits.endpointKey, orderId],
    queryFn: () => getOrderAudits(orderId),
    select: (data) => data.data.data,
    enabled: tab === 'timeline',
  });

  const {
    isLoading,
    data: orderDetails,
    error,
  } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey, orderId],
    queryFn: () => OrderDetails(orderId),
    select: (res) => res.data.data,
    enabled: hasPermission('permission:purchase-view'),
  });

  return {
    isEditingOrder,
    setIsEditingOrder,
    isEditingPurchaseService,
    setIsEditingPurchaseService,
    isPastInvoices,
    setIsPastInvoices,
    isNegotiation,
    setIsNegotiation,
    isNegotiateOnBehalf,
    setIsNegotiateOnBehalf,
    isPaymentAdvicing,
    setIsPaymentAdvicing,
    viewNegotiationHistory,
    setViewNegotiationHistory,
    isTimeLinesDataLoading,
    timeLineData,
    isLoading,
    orderDetails,
    error,
  };
};
