'use client';

import { auditLogsAPIs } from '@/api/auditLogs/auditLogsApi';
import { invitation } from '@/api/invitation/Invitation';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import DynamicModal from '@/components/Modals/DynamicModal';
import Tooltips from '@/components/auth/Tooltips';
import CommentBox from '@/components/comments/CommentBox';
import PINVerifyModal from '@/components/invoices/PINVerifyModal';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import EditOrder from '@/components/orders/EditOrderS';
import NegotiationHistory from '@/components/orders/NegotiationHistory';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import PaymentDetails from '@/components/payments/PaymentDetails';
import AccessDenied from '@/components/shared/AccessDenied';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import TimelineItem from '@/components/ui/TimelineItem';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { getOrderAudits } from '@/services/AuditLogs_Services/AuditLogsService';
import { getInvitationStatus } from '@/services/Invitation_Service/Invitation_Service';
import {
  acceptOrder,
  withDrawOrder,
} from '@/services/Invoice_Services/Invoice_Services';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
  remindOrder,
  updateOrderForUnrepliedSales,
  viewOrderinNewTab,
} from '@/services/Orders_Services/Orders_Services';
import { stockOut } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Eye,
  FileText,
  Handshake,
  IndianRupee,
  Package,
  Pencil,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSalesOrderColumns } from './useSalesOrderColumns';

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
const GenerateInvoice = dynamic(
  () => import('@/components/invoices/GenerateInvoice'),
  {
    loading: () => <Loading />,
  },
);

const MakePaymentNew = dynamic(
  () => import('@/components/payments/MakePaymentNew'),
  {
    loading: () => <Loading />,
  },
);

const EditOrderServices = dynamic(
  () => import('@/components/orders/CreateOrderServices'),
  {
    loading: () => <Loading />,
  },
);

const ViewOrder = () => {
  useMetaData('Hues! - Sales Order Details', 'HUES SALES'); // dynamic title

  const translations = useTranslations('sales.sales-orders.order_details');
  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const enterpriseId = getEnterpriseId();
  const searchParams = useSearchParams();
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isEditingServiceOrder, setIsEditingServiceOrder] = useState(false);
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [isGenerateInvoice, setIsGenerateInvoice] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [viewNegotiationHistory, setViewNegotiationHistory] = useState(false);
  // const [isUploadingAttachements, setIsUploadingAttachements] = useState(false);
  const [tab, setTab] = useState('overview');
  // const [files, setFiles] = useState([]);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isPINError, setIsPINError] = useState(false);
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: '',
    description: '',
    buttons: [],
  });

  const onTabChange = (value) => {
    setTab(value);
  };

  const salesOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.sales'),
      path: '/dashboard/sales/sales-orders',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title.order_details'),
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: true, // Always show
    },
    {
      id: 3,
      name: translations('title.negotiation'),
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: isNegotiation, // Show only if isNegotiation is true
    },
    {
      id: 4,
      name: translations('title.generate_invoice'),
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: isGenerateInvoice, // Show only if isGenerateInvoice is true
    },
    {
      id: 5,
      name: translations('title.record_payment'),
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: isRecordingPayment, // Show only if isGenerateInvoice is true
    },
    {
      id: 6,
      name: 'Negotiation History',
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: viewNegotiationHistory, // Show only if viewNegotiatioHistory is true
    },
    {
      id: 7,
      name: 'Edit Order',
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: isEditingOrder || isEditingServiceOrder, // Show only if isEditingOrder is true
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');
    setIsEditingOrder(state === 'editOrder');
    setIsEditingServiceOrder(state === 'editServiceOrder');
    setIsNegotiation(state === 'negotiation');
    setIsGenerateInvoice(state === 'generateInvoice');
    setIsRecordingPayment(state === 'recordPayment');
    setViewNegotiationHistory(state === 'negotiationHistory');
    // setIsUploadingAttachements(state === 'uploadingAttachements');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/dashboard/sales/sales-orders/${params.order_id}`;

    if (isNegotiation) {
      newPath += '?state=negotiation';
    } else if (isGenerateInvoice) {
      newPath += '?state=generateInvoice';
    } else if (isRecordingPayment) {
      newPath += '?state=recordPayment';
    } else if (viewNegotiationHistory) {
      newPath += '?state=negotiationHistory';
    } else if (isEditingOrder) {
      newPath += '?state=editOrder';
    } else if (isEditingServiceOrder) {
      newPath += '?state=editServiceOrder';
    } else {
      newPath += '';
    }

    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [
    isNegotiation,
    isGenerateInvoice,
    viewNegotiationHistory,
    isRecordingPayment,
    isEditingOrder,
    isEditingServiceOrder,
    params.order_id,
    router,
  ]);

  useEffect(() => {
    queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
  }, [isNegotiation]);

  // api calling for order timeline
  const { isLoading: isTimeLinesDataLoading, data: timeLineData } = useQuery({
    queryKey: [auditLogsAPIs.getOrderAudits.endpointKey],
    queryFn: () => getOrderAudits(params.order_id),
    select: (data) => data.data.data,
    enabled: tab === 'timeline',
  });

  // api calling for orderDEtails
  const {
    isLoading,
    data: orderDetails,
    error,
  } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey],
    queryFn: () => OrderDetails(params.order_id),
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

  const stockOutMutation = useMutation({
    mutationKey: [stockInOutAPIs.stockOut.endpointKey],
    mutationFn: stockOut,
    onSuccess: () => {
      toast.success(translations('successMsg.stock_out'));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  const acceptOrderMutation = useMutation({
    mutationKey: [invoiceApi.acceptOrder.endpointKey],
    mutationFn: acceptOrder,
    onSuccess: (res) => {
      toast.success(translations('successMsg.order_accepted'));
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
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  // for order withdraw
  const withdrawOrderMutation = useMutation({
    mutationKey: [invoiceApi.withDrawOrder.endpointKey],
    mutationFn: withDrawOrder,
    onSuccess: () => {
      toast.success(translations('ctas.withdraw.successMsg'));
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
          translations('ctas.withdraw.errorMsg') ||
          translations('errorMsg.common'),
      );
    },
  });

  const remindOrderMutation = useMutation({
    mutationKey: [orderApi.remindOrder.endpointKey],
    mutationFn: () => remindOrder(Number(params.order_id)),
    onSuccess: () => {
      toast.success('Reminder Send Successfully');

      setModalData((prev) => ({
        ...prev,
        isOpen: false,
      }));
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
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

  const OrderColumns = useSalesOrderColumns(orderDetails?.negotiationStatus);

  // multiStatus components
  const sellerStatus =
    orderDetails?.negotiationStatus === 'WITHDRAWN'
      ? 'WITHDRAWN'
      : orderDetails?.metaData?.sellerData?.orderStatus;

  const multiStatus = (
    <div className="flex gap-2">
      <ConditionalRenderingStatus status={sellerStatus} />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.sellerData?.stockOut}
      />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.payment?.status}
      />
    </div>
  );

  // maintain ctas in sales order
  const ctaList = [];
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
        if (
          tab === 'overview' &&
          orderDetails?.negotiationStatus === 'NEGOTIATION' &&
          orderDetails?.sellerEnterpriseId === enterpriseId &&
          !viewNegotiationHistory
        ) {
          if (orderDetails?.orderStatus === 'BID_SUBMITTED' && !isNegotiation) {
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

    // record payment CTA
    if (
      !isGenerateInvoice &&
      !isRecordingPayment &&
      (orderDetails.negotiationStatus === 'INVOICED' ||
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
      orderDetails.orderType === 'SALES' &&
      enterpriseId.toString() === orderDetails.sellerEnterpriseId.toString() &&
      orderDetails.negotiationStatus !== 'WITHDRAWN' &&
      orderDetails.negotiationStatus !== 'ACCEPTED' &&
      orderDetails.negotiationStatus !== 'INVOICED' &&
      orderDetails.negotiationStatus !== 'PARTIAL_INVOICED' &&
      !viewNegotiationHistory
    ) {
      if (hasPermission('permission:sales-edit')) {
        ctaList.push({
          icon: <Pencil size={14} />,
          label: translations('ctas.more.revise'),
          onClick: () => {
            if (orderDetails?.invoiceType === 'GOODS') {
              setIsEditingOrder(true);
            } else {
              setIsEditingServiceOrder(true);
            }
          },
          variant: 'warning',
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
        (orderDetails.negotiationStatus === 'NEW' &&
          orderDetails?.orderType === 'SALES')) &&
      !viewNegotiationHistory
    ) {
      if (hasPermission('permission:sales-invoice-create')) {
        ctaList.push({
          icon: <FileText size={14} />,
          label: translations('ctas.generate_invoice'),
          onClick: () => {
            if (
              orderDetails?.buyerType === 'UNINVITED-ENTERPRISE' &&
              orderDetails?.metaData?.sellerData?.orderStatus === 'OFFER_SENT'
            ) {
              acceptOrderMutation.mutate({ orderId: Number(params.order_id) });
            } else if (
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

    // withdraw cta
    if (
      orderDetails?.negotiationStatus === 'NEW' &&
      orderDetails?.metaData?.sellerData?.orderStatus === 'OFFER_SENT'
    ) {
      if (hasPermission('permission:sales-edit')) {
        ctaList.push({
          icon: <X size={14} />,
          label: translations('ctas.withdraw.cta'),
          onClick: () => setWithdrawModalOpen(true),
          variant: 'outline',
        });
      }
    }
  }

  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
      <Wrapper className="h-full py-2">
        {isLoading && !orderDetails && <Loading />}

        {/* 403 Access Denied */}
        {!isLoading && error?.response?.status === 403 && <AccessDenied />}

        {/* modal */}
        {modalData.isOpen && (
          <DynamicModal
            isOpen={modalData.isOpen}
            onClose={() =>
              setModalData((prev) => ({
                ...prev,
                isOpen: false,
              }))
            }
            title={modalData.title}
            description={modalData.description}
            buttons={modalData.buttons}
          />
        )}

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
          !isEditingServiceOrder &&
          !isLoading &&
          orderDetails && (
            <>
              {/* headers */}
              <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
                <div className="flex gap-2">
                  {/* breadcrumbs */}
                  <OrderBreadCrumbs
                    possiblePagesBreadcrumbs={salesOrdersBreadCrumbs}
                    setIsNegotiation={setIsNegotiation}
                    setIsGenerateInvoice={setIsGenerateInvoice}
                  />
                </div>
                <div className="flex gap-1">
                  {/* view CTA */}
                  {!isGenerateInvoice &&
                    !isRecordingPayment &&
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
                  {ctaList.length > 0 &&
                    ctaList.map((cta) => (
                      <Button
                        key={cta.label}
                        size="sm"
                        variant={cta.variant || 'default'}
                        onClick={cta.onClick}
                        disabled={cta.disabled}
                        className={cta.className || 'item-center flex gap-1'}
                      >
                        {cta.icon}
                        {cta.label}
                      </Button>
                    ))}
                </div>
              </section>

              {/* switch tabs */}
              {!isGenerateInvoice &&
                !isNegotiation &&
                !isRecordingPayment &&
                !viewNegotiationHistory && (
                  <section>
                    <Tabs
                      value={tab}
                      onValueChange={onTabChange}
                      defaultValue={'overview'}
                    >
                      <section className="sticky top-12 bg-white py-2">
                        <TabsList className="border">
                          <TabsTrigger
                            className={`${tab === 'overview' ? 'shadow-customShadow' : ''}`}
                            value="overview"
                          >
                            {translations('tabs.label.tab1')}
                          </TabsTrigger>
                          <TabsTrigger
                            className={`${tab === 'invoices' ? 'shadow-customShadow' : ''}`}
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
                            className={`${tab === 'timeline' ? 'shadow-customShadow' : ''}`}
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
                        {/* orders overview */}
                        <OrdersOverview
                          isCollapsableOverview={false}
                          orderDetails={orderDetails}
                          orderId={orderDetails?.referenceNumber}
                          multiStatus={multiStatus}
                          Name={`${orderDetails?.clientName} (${orderDetails?.clientType})`}
                          mobileNumber={orderDetails?.mobileNumber}
                          amtPaid={orderDetails?.amountPaid}
                          totalAmount={
                            orderDetails.amount + orderDetails.gstAmount
                          }
                          invitationData={invitationData}
                          setViewNegotiationHistory={setViewNegotiationHistory}
                        />

                        <CommentBox
                          contextId={params.order_id}
                          context={'ORDER'}
                        />

                        {/* orderDetail Table */}
                        <DataTable
                          columns={OrderColumns}
                          data={orderDetails?.orderItems}
                        ></DataTable>
                      </TabsContent>
                      <TabsContent value="invoices">
                        <PastInvoices
                          setIsGenerateInvoice={setIsGenerateInvoice}
                          orderDetails={orderDetails}
                        />
                      </TabsContent>
                      <TabsContent value="payment">
                        <PaymentDetails
                          orderId={params.order_id}
                          orderDetails={orderDetails}
                          setIsRecordingPayment={setIsRecordingPayment}
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
              {isNegotiation &&
                !isGenerateInvoice &&
                !isRecordingPayment &&
                !viewNegotiationHistory && (
                  <NegotiationComponent
                    orderDetails={orderDetails}
                    isNegotiation={isNegotiation}
                    setIsNegotiation={setIsNegotiation}
                  />
                )}

              {/* seprator */}
              {!isNegotiation &&
                !isGenerateInvoice &&
                !isRecordingPayment &&
                !viewNegotiationHistory && (
                  <div className="mt-auto h-[1px] bg-neutral-300"></div>
                )}

              {/* generate Invoice component */}
              {isGenerateInvoice &&
                !isNegotiation &&
                !isRecordingPayment &&
                !viewNegotiationHistory && (
                  <GenerateInvoice
                    orderDetails={orderDetails}
                    setIsGenerateInvoice={setIsGenerateInvoice}
                  />
                )}

              {/* recordPayment component */}
              {isRecordingPayment &&
                !isGenerateInvoice &&
                !isNegotiation &&
                !viewNegotiationHistory && (
                  <MakePaymentNew
                    orderId={params.order_id}
                    orderDetails={orderDetails}
                    setIsRecordingPayment={setIsRecordingPayment}
                    contextType="PAYMENT"
                  />
                )}

              {
                // negotiation history
                viewNegotiationHistory &&
                  !isGenerateInvoice &&
                  !isNegotiation &&
                  !isEditingOrder &&
                  !isRecordingPayment && (
                    <NegotiationHistory orderId={params.order_id} />
                  )
              }
            </>
          )}

        {/* editOrder Component - goods */}
        {isEditingOrder && (
          <EditOrder
            cta="offer"
            isOrder="order"
            orderId={params.order_id}
            onCancel={() => setIsEditingOrder(false)}
          />
        )}

        {/* editOrder Component - service */}
        {isEditingServiceOrder && (
          <EditOrderServices
            createSalesServiceBreadCrumbs={salesOrdersBreadCrumbs}
            cta="offer"
            orderId={params.order_id}
            setIsCreatingSalesService={setIsEditingServiceOrder}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewOrder;
