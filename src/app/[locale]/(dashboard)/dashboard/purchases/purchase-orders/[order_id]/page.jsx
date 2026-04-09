'use client';

import { auditLogsAPIs } from '@/api/auditLogs/auditLogsApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import CommentBox from '@/components/comments/CommentBox';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import NegotiationHistory from '@/components/orders/NegotiationHistory';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import MakePaymentNew from '@/components/payments/MakePaymentNew';
import PaymentDetails from '@/components/payments/PaymentDetails';
import { DataTable } from '@/components/table/data-table';
import PINVerifyModal from '@/components/invoices/PINVerifyModal';
import Loading from '@/components/ui/Loading';
import TimelineItem from '@/components/ui/TimelineItem';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { getOrderAudits } from '@/services/AuditLogs_Services/AuditLogsService';
import { withDrawOrder } from '@/services/Invoice_Services/Invoice_Services';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
  viewOrderinNewTab,
} from '@/services/Orders_Services/Orders_Services';
import { stockIn } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Eye,
  Handshake,
  IndianRupee,
  MoreVertical,
  Package,
  Pencil,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePurchaseOrderColumns } from './usePurchaseOrderColumns';

// dynamic imports
const OrdersOverview = dynamic(
  () => import('@/components/orders/OrdersOverview'),
  {
    loading: () => <Loading />,
  },
);
const PastInvoices = dynamic(
  () => import('@/components/invoices/PastInvoices'),
  {
    loading: () => <Loading />,
  },
);
const NegotiationComponent = dynamic(
  () => import('@/components/orders/NegotiationComponent'),
  {
    loading: () => <Loading />,
  },
);
const EditOrder = dynamic(() => import('@/components/orders/EditOrderS'), {
  loading: () => <Loading />,
});
const EditOrderServices = dynamic(
  () => import('@/components/orders/CreateOrderServices'),
  {
    loading: () => <Loading />,
  },
);

const ViewOrder = () => {
  useMetaData('Hues! - Purchase Order Details', 'HUES PURCHASES'); // dynamic title

  const translations = useTranslations(
    'purchases.purchase-orders.order_details',
  );
  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const enterpriseId = getEnterpriseId();
  const searchParams = useSearchParams();
  const showInvoice = searchParams.get('showInvoice');
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isEditingPurchaseService, setIsEditingPurchaseService] =
    useState(false);
  const [isPastInvoices, setIsPastInvoices] = useState(showInvoice || false);
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [isPaymentAdvicing, setIsPaymentAdvicing] = useState(false);
  const [viewNegotiationHistory, setViewNegotiationHistory] = useState(false);
  // const [isUploadingAttachements, setIsUploadingAttachements] = useState(false);
  // const [files, setFiles] = useState([]);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isPINError, setIsPINError] = useState(false);

  const [tab, setTab] = useState('overview');

  const onTabChange = (value) => {
    setTab(value);
  };

  const purchaseOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.purchases'),
      path: '/dashboard/purchases/purchase-orders',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title.order_details'),
      path: `/dashboard/purchases/purchase-orders/${params.order_id}`,
      show: true, // Always show
    },
    {
      id: 3,
      name: translations('title.negotiation'),
      path: `/dashboard/purchases/purchase-orders/${params.order_id}/`,
      show: isNegotiation, // Show only if isNegotiation is true
    },
    {
      id: 4,
      name: translations('title.invoice'),
      path: `/dashboard/purchases/purchase-orders/${params.order_id}/`,
      show: isPastInvoices, // Show only if isPastInvoices is true
    },
    {
      id: 5,
      name: translations('title.payment_advice'),
      path: `/purchases/purchase-orders/${params.order_id}`,
      show: isPaymentAdvicing, // Show only if isPaymentAdvicing is true
    },
    {
      id: 6,
      name: 'Negotiation History',
      path: `/dashboard/purchases/purchase-orders/${params.order_id}`,
      show: viewNegotiationHistory, // Show only if isUploadingAttachements is true
    },
    {
      id: 7,
      name: 'Edit Order',
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: isEditingOrder || isEditingPurchaseService, // Show only if isEditingOrder is true
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');
    setIsEditingOrder(state === 'editOrder');
    setIsEditingPurchaseService(state === 'editServiceOrder');
    setIsNegotiation(state === 'negotiation');
    setIsPastInvoices(state === 'showInvoice');
    setIsPaymentAdvicing(state === 'payment_advice');
    setViewNegotiationHistory(state === 'negotiationHistory');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/dashboard/purchases/purchase-orders/${params.order_id}`;

    if (isNegotiation) {
      newPath += '?state=negotiation';
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
    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [
    isNegotiation,
    isPastInvoices,
    isPaymentAdvicing,
    viewNegotiationHistory,
    params.order_id,
    router,
  ]);

  // api calling for order timeline
  const { isLoading: isTimeLinesDataLoading, data: timeLineData } = useQuery({
    queryKey: [auditLogsAPIs.getOrderAudits.endpointKey],
    queryFn: () => getOrderAudits(params.order_id),
    select: (data) => data.data.data,
    enabled: tab === 'timeline',
  });

  useEffect(() => {
    queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
  }, [isNegotiation]);

  const { isLoading, data: orderDetails } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey],
    queryFn: () => OrderDetails(params.order_id),
    select: (res) => res.data.data,
    enabled: hasPermission('permission:purchase-view'),
  });

  const acceptMutation = useMutation({
    mutationKey: orderApi.bulkNegotiateAcceptOrReject.endpointKey,
    mutationFn: bulkNegotiateAcceptOrReject,
    onSuccess: () => {
      toast.success(translations('successMsg.order_accepted'));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate({
      orderId: Number(params.order_id),
      status: 'ACCEPTED',
    });
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
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  const withdrawOrderMutation = useMutation({
    mutationKey: [invoiceApi.withDrawOrder.endpointKey],
    mutationFn: withDrawOrder,
    onSuccess: () => {
      toast.success(translations('ctas.withdraw.successMsg'));
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
          translations('ctas.withdraw.errorMsg') ||
          translations('errorMsg.common'),
      );
    },
  });

  const OrderColumns = usePurchaseOrderColumns();

  // multiStatus components
  const buyerStatus =
    orderDetails?.negotiationStatus === 'WITHDRAWN'
      ? 'WITHDRAWN'
      : orderDetails?.metaData?.buyerData?.orderStatus;

  const multiStatus = (
    <div className="flex gap-2">
      <ConditionalRenderingStatus status={buyerStatus} />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.buyerData?.stockIn}
      />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.payment?.status}
      />
    </div>
  );

  // maintain ctas in purchase order
  const ctaList = [];
  if (orderDetails) {
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
              icon: <Handshake size={14} />,
              label: translations('ctas.footer_ctas.negotiate'),
              onClick: () => setIsNegotiation(true),
              variant: 'blue_outline',
            });
            ctaList.push({
              icon: <Check size={14} />,
              label: acceptMutation.isPending ? (
                <Loading size={14} />
              ) : (
                translations('ctas.footer_ctas.accept')
              ),
              onClick: handleAccept,
              disabled: acceptMutation.isPending,
              variant: 'default',
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
              icon: <Handshake size={14} />,
              label: translations('ctas.footer_ctas.negotiate'),
              onClick: () => setIsNegotiation(true),
              variant: 'blue_outline',
            });
            ctaList.push({
              icon: <Check size={14} />,
              label: translations('ctas.footer_ctas.accept'),
              onClick: handleAccept,
              variant: 'default',
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
          variant: 'blue_outline',
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
        ctaList.push({
          icon: <Pencil size={14} />,
          label: translations('ctas.more.revise'),
          onClick: () => {
            if (orderDetails?.invoiceType === 'GOODS') {
              setIsEditingOrder(true);
            } else {
              setIsEditingPurchaseService(true);
            }
          },
          variant: 'blue_outline',
        });
      }
    }

    // withdraw CTA
    if (
      orderDetails?.negotiationStatus === 'NEW' &&
      orderDetails?.metaData?.buyerData?.orderStatus === 'BID_SENT'
    ) {
      if (hasPermission('permission:purchase-edit')) {
        ctaList.push({
          icon: <X size={14} />,
          label: translations('ctas.withdraw.cta'),
          onClick: () => setWithdrawModalOpen(true),
          variant: 'blue_outline',
        });
      }
    }
  }

  return (
    <ProtectedWrapper permissionCode={'permission:purchase-view'}>
      <Wrapper className="h-full py-2">
        {isLoading && !orderDetails && <Loading />}

        {/* withdraw pin modal */}
        <PINVerifyModal
          open={withdrawModalOpen}
          setOpen={setWithdrawModalOpen}
          order={orderDetails}
          handleCreateFn={(updatedOrder) => {
            withdrawOrderMutation.mutate({
              orderId: Number(params.order_id),
              pin: updatedOrder.pin,
              invoiceType:
                orderDetails?.invoiceType ||
                (orderDetails?.orderType === 'PURCHASE' ? 'GOODS' : 'GOODS'),
            });
          }}
          isPINError={isPINError}
          setIsPINError={setIsPINError}
          isPendingInvoice={withdrawOrderMutation.isPending}
        />

        {!isEditingOrder &&
          !isEditingPurchaseService &&
          !isLoading &&
          orderDetails && (
            <>
              {/* headers */}
              <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
                <div className="flex flex-col gap-2 pt-2">
                  {/* breadcrumbs */}
                  <OrderBreadCrumbs
                    possiblePagesBreadcrumbs={purchaseOrdersBreadCrumbs}
                    setIsNegotiation={setIsNegotiation}
                    setIsPastInvoices={setIsPastInvoices}
                  />
                </div>

                <div className="flex gap-1">
                  {/* view CTA */}
                  {!isPaymentAdvicing &&
                    !isNegotiation &&
                    !viewNegotiationHistory &&
                    orderDetails?.negotiationStatus !== 'WITHDRAWN' && (
                      <Tooltips
                        trigger={
                          <Button
                            onClick={() => viewOrderinNewTab(params.order_id)}
                            size="sm"
                            variant="outline"
                            className="font-bold"
                          >
                            <Eye size={14} />
                          </Button>
                        }
                        content={translations('ctas.view.placeholder')}
                      />
                    )}
                  {/* Dynamic CTAs */}
                  {ctaList.length <= 2 ? (
                    ctaList.map((cta) => (
                      <Button
                        key={cta.label}
                        size="sm"
                        variant={cta.variant || 'default'}
                        onClick={cta.onClick}
                        disabled={cta.disabled}
                        className={cta.className || 'flex items-center gap-1'}
                      >
                        {cta.icon}
                        {cta.label}
                      </Button>
                    ))
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="px-2 font-bold"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {ctaList.map((cta) => (
                          <DropdownMenuItem
                            key={cta.label}
                            onClick={cta.onClick}
                            disabled={cta.disabled}
                            className={
                              cta.className ||
                              'flex cursor-pointer items-center gap-2 font-medium'
                            }
                          >
                            {cta.icon}
                            {cta.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </section>
              {/* switch tabs */}
              {!isNegotiation &&
                !isPaymentAdvicing &&
                !viewNegotiationHistory && (
                  <section>
                    <Tabs
                      value={tab}
                      onValueChange={onTabChange}
                      defaultValue={'overview'}
                    >
                      <section className="sticky top-10 bg-white">
                        <TabsList className="border">
                          <TabsTrigger
                            className={`w-24 ${tab === 'overview' ? 'shadow-customShadow' : ''}`}
                            value="overview"
                          >
                            {translations('tabs.label.tab1')}
                          </TabsTrigger>
                          <TabsTrigger
                            className={`w-24 ${tab === 'invoices' ? 'shadow-customShadow' : ''}`}
                            value="invoices"
                          >
                            {translations('tabs.label.tab2')}
                          </TabsTrigger>
                          <TabsTrigger
                            className={`${tab === 'payment' ? 'shadow-customShadow' : ''}`}
                            value="payment"
                          >
                            {translations('tabs.label.tab3')}
                          </TabsTrigger>
                          <TabsTrigger
                            className={`w-24 ${tab === 'timeline' ? 'shadow-customShadow' : ''}`}
                            value="timeline"
                          >
                            {translations('tabs.label.tab4')}
                          </TabsTrigger>
                        </TabsList>
                      </section>

                      <TabsContent
                        value="overview"
                        className="flex flex-col gap-4"
                      >
                        <OrdersOverview
                          orderDetails={orderDetails}
                          orderId={orderDetails?.referenceNumber}
                          multiStatus={multiStatus}
                          Name={`${orderDetails?.vendorName} (${orderDetails?.clientType})`}
                          mobileNumber={orderDetails?.vendorMobileNumber}
                          amtPaid={orderDetails?.amountPaid}
                          totalAmount={
                            orderDetails.amount + orderDetails.gstAmount
                          }
                          setViewNegotiationHistory={setViewNegotiationHistory}
                        />

                        <CommentBox
                          contextId={params.order_id}
                          context={'ORDER'}
                        />

                        <DataTable
                          columns={OrderColumns}
                          data={orderDetails.orderItems}
                        ></DataTable>
                      </TabsContent>
                      <TabsContent value="invoices">
                        <PastInvoices orderDetails={orderDetails} />
                      </TabsContent>
                      <TabsContent value="payment">
                        <PaymentDetails
                          orderId={params.order_id}
                          orderDetails={orderDetails}
                        />
                      </TabsContent>
                      <TabsContent value="timeline">
                        <div className="h-full w-full animate-fadeInUp overflow-auto p-2">
                          {isTimeLinesDataLoading && <Loading />}
                          {!isTimeLinesDataLoading &&
                            timeLineData?.length > 0 &&
                            timeLineData?.map((timeLinetItem, index) => (
                              <TimelineItem
                                key={timeLinetItem?.id}
                                title={timeLinetItem?.action}
                                dateTime={timeLinetItem?.createdAt}
                                isLast={index === timeLineData.length - 1}
                                action={timeLinetItem?.action}
                                module={timeLinetItem?.module}
                                details={timeLinetItem?.details}
                              />
                            ))}

                          {!isTimeLinesDataLoading &&
                            timeLineData?.length === 0 && (
                              <div>No Timeline recorded yet</div>
                            )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </section>
                )}
              {/* Negotiation Component */}
              {isNegotiation && !isPastInvoices && !viewNegotiationHistory && (
                <NegotiationComponent
                  orderDetails={orderDetails}
                  isNegotiation={isNegotiation}
                  setIsNegotiation={setIsNegotiation}
                />
              )}
              {/* Invoices Component */}
              {isPastInvoices && !isNegotiation && !viewNegotiationHistory && (
                <PastInvoices />
              )}
              {isPaymentAdvicing &&
                !isNegotiation &&
                !viewNegotiationHistory && (
                  <MakePaymentNew
                    orderId={params.order_id}
                    orderDetails={orderDetails}
                    setIsRecordingPayment={setIsPaymentAdvicing}
                    contextType="PAYMENT_ADVICE"
                  />
                )}
              {
                // negotiation history
                viewNegotiationHistory &&
                  !isNegotiation &&
                  !isPastInvoices &&
                  !isEditingOrder &&
                  !isPaymentAdvicing && (
                    <NegotiationHistory orderId={params.order_id} />
                  )
              }
            </>
          )}

        {/* editOrder Component */}
        {isEditingOrder && (
          <EditOrder
            cta="bid"
            isOrder="order"
            orderId={params.order_id}
            onCancel={() => setIsEditingOrder(false)}
          />
        )}

        {/* editOrder Component */}
        {isEditingPurchaseService && (
          <EditOrderServices
            createSalesServiceBreadCrumbs={purchaseOrdersBreadCrumbs}
            setIsCreatingSalesService={setIsEditingPurchaseService}
            cta="bid"
            orderId={params.order_id}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewOrder;
