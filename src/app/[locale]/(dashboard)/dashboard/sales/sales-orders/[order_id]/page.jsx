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
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import EditOrder from '@/components/orders/EditOrderS';
import NegotiationHistory from '@/components/orders/NegotiationHistory';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import PaymentDetails from '@/components/payments/PaymentDetails';
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
import { acceptOrder } from '@/services/Invoice_Services/Invoice_Services';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
  remindOrder,
  updateOrderForUnrepliedSales,
  viewOrderinNewTab,
} from '@/services/Orders_Services/Orders_Services';
import { stockOut } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
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
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [isGenerateInvoice, setIsGenerateInvoice] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [viewNegotiationHistory, setViewNegotiationHistory] = useState(false);
  // const [isUploadingAttachements, setIsUploadingAttachements] = useState(false);
  const [tab, setTab] = useState('overview');
  // const [files, setFiles] = useState([]);
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
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');
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
  const { isLoading, data: orderDetails } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey],
    queryFn: () => OrderDetails(params.order_id),
    select: (data) => data.data.data,
    enabled: hasPermission('permission:sales-view'),
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

  const withdrawOrderMutation = useMutation({
    mutationKey: [invoiceApi.withDrawOrder.endpointKey],
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

  // [ATTACHMENTS]
  // handle upload proofs fn
  // const handleAttached = async (file) => {
  //   setFiles((prevFiles) => [...prevFiles, file]);
  //   toast.success('File attached successfully!');
  // };
  // const handleFileRemove = (file) => {
  //   setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
  // };

  // const createAttachments = useMutation({
  //   mutationKey: [attachementsAPI.createAttachement.endpointKey],
  //   mutationFn: createAttachements,
  //   onSuccess: () => {
  //     toast.success('Attachements Upload Successfully');
  //     queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
  //     setFiles([]);
  //   },
  //   onError: (error) => {
  //     toast.error(error.response.data.message || 'Something Went Wrong');
  //   },
  // });

  // const uploadAttachements = () => {
  //   if (files?.length === 0) {
  //     toast.error('Please select atleast one file to upload');
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append('contextType', 'ORDER'); // assuming fixed or dynamic context
  //   formData.append('contextId', params.order_id); // use actual ID here

  //   // handle files if any
  //   if (files.length > 0) {
  //     files.forEach((file) => {
  //       formData.append('files', file);
  //     });
  //   }

  //   createAttachments.mutate(formData);
  // };

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

  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
      <Wrapper className="h-full py-2">
        {isLoading && !orderDetails && <Loading />}

        {/* editOrder Component */}
        {isEditingOrder && (
          <EditOrder
            cta="offer"
            isOrder="order"
            orderId={params.order_id}
            onCancel={() => setIsEditingOrder(false)}
          />
        )}

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

        {!isEditingOrder && !isLoading && orderDetails && (
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

                {/* negotiation ctas */}
                {!isGenerateInvoice &&
                  !isNegotiation &&
                  !isRecordingPayment &&
                  !viewNegotiationHistory && (
                    <ProtectedWrapper
                      permissionCode={'permission:sales-negotiation'}
                    >
                      <section className="flex gap-2">
                        {/* status NEW */}
                        {tab === 'overview' &&
                          !isGenerateInvoice &&
                          !isRecordingPayment &&
                          orderDetails?.negotiationStatus === 'NEW' &&
                          orderDetails?.sellerEnterpriseId === enterpriseId && (
                            <>
                              {/* {orderDetails?.orderType === 'SALES' && (
                        <span className="flex items-center gap-1 rounded-sm border border-[#A5ABBD24] bg-[#F5F6F8] px-4 py-2 text-sm font-semibold">
                          <Clock size={12} />
                          {translations('ctas.footer_ctas.wait_response')}
                        </span>
                      )} */}

                              {orderDetails?.orderType === 'PURCHASE' && (
                                <div className="flex w-full justify-end gap-2">
                                  {!isNegotiation && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="blue_outline"
                                        onClick={() => setIsNegotiation(true)}
                                      >
                                        {translations(
                                          'ctas.footer_ctas.negotiate',
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={handleAccept}
                                        disabled={acceptMutation.isPending}
                                      >
                                        {acceptMutation.isPending ? (
                                          <Loading size={14} />
                                        ) : (
                                          translations(
                                            'ctas.footer_ctas.accept',
                                          )
                                        )}
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        {/* status NEGOTIATION */}
                        {tab === 'overview' &&
                          !isGenerateInvoice &&
                          !isRecordingPayment &&
                          orderDetails?.negotiationStatus === 'NEGOTIATION' &&
                          orderDetails?.sellerEnterpriseId === enterpriseId &&
                          !viewNegotiationHistory && (
                            <>
                              {orderDetails?.orderStatus ===
                                'BID_SUBMITTED' && (
                                <div className="flex w-full justify-end gap-2">
                                  {!isNegotiation && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="blue_outline"
                                        onClick={() => setIsNegotiation(true)}
                                      >
                                        {translations(
                                          'ctas.footer_ctas.negotiate',
                                        )}
                                      </Button>
                                      <Button size="sm" onClick={handleAccept}>
                                        {translations(
                                          'ctas.footer_ctas.accept',
                                        )}
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                              {/* {orderDetails?.orderStatus === 'OFFER_SUBMITTED' && (
                        <span className="flex items-center gap-1 rounded-sm border border-[#A5ABBD24] bg-[#F5F6F8] px-4 py-2 text-sm font-semibold">
                          <Clock size={12} />{' '}
                          {translations('ctas.footer_ctas.wait_response')}
                        </span>
                      )} */}
                            </>
                          )}
                      </section>
                    </ProtectedWrapper>
                  )}

                {/* record payment CTA */}
                {!isGenerateInvoice &&
                  !isRecordingPayment &&
                  (orderDetails.negotiationStatus === 'INVOICED' ||
                    orderDetails?.negotiationStatus === 'PARTIAL_INVOICED') &&
                  orderDetails?.metaData?.payment?.status !== 'PAID' &&
                  !viewNegotiationHistory && (
                    <ProtectedWrapper
                      permissionCode={'permission:sales-create-payment'}
                    >
                      <Button
                        variant="blue_outline"
                        size="sm"
                        onClick={() => setIsRecordingPayment(true)}
                        className="font-bold"
                      >
                        {translations('ctas.record_payment')}
                      </Button>
                    </ProtectedWrapper>
                  )}
                {/* revise CTA */}
                {!isGenerateInvoice &&
                  !isRecordingPayment &&
                  !isNegotiation &&
                  orderDetails.orderType === 'SALES' &&
                  enterpriseId.toString() ===
                    orderDetails.sellerEnterpriseId.toString() &&
                  orderDetails.negotiationStatus !== 'WITHDRAWN' &&
                  orderDetails.negotiationStatus !== 'ACCEPTED' &&
                  orderDetails.negotiationStatus !== 'INVOICED' &&
                  orderDetails.negotiationStatus !== 'PARTIAL_INVOICED' &&
                  !viewNegotiationHistory && (
                    <ProtectedWrapper permissionCode="permission:sales-edit">
                      <Button
                        variant="blue_outline"
                        size="sm"
                        onClick={() => setIsEditingOrder(true)}
                        className="font-bold"
                      >
                        {translations('ctas.more.revise')}
                      </Button>
                    </ProtectedWrapper>
                  )}

                {/* generateInvoice CTA */}
                {!isGenerateInvoice &&
                  !isRecordingPayment &&
                  !orderDetails?.invoiceGenerationCompleted &&
                  (orderDetails?.negotiationStatus === 'ACCEPTED' ||
                    orderDetails?.negotiationStatus === 'PARTIAL_INVOICED' ||
                    (orderDetails.negotiationStatus === 'NEW' &&
                      orderDetails?.orderType === 'SALES')) &&
                  !viewNegotiationHistory && (
                    <ProtectedWrapper
                      permissionCode={'permission:sales-invoice-create'}
                    >
                      <Button
                        variant="blue_outline"
                        size="sm"
                        onClick={() => {
                          // Case 1: Uninvited enterprise
                          // Directly accept the order without showing a modal.
                          if (
                            orderDetails?.buyerType ===
                              'UNINVITED-ENTERPRISE' &&
                            orderDetails?.metaData?.sellerData?.orderStatus ===
                              'OFFER_SENT'
                          ) {
                            acceptOrderMutation.mutate({
                              orderId: Number(params.order_id),
                            });
                          }

                          // Case 2: Confirmed enterprise but no reply
                          else if (
                            orderDetails?.buyerType === 'ENTERPRISE' &&
                            orderDetails?.metaData?.sellerData?.orderStatus ===
                              'OFFER_SENT'
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
                                  className: 'w-36',
                                  onClick: () => remindOrderMutation.mutate(),
                                },
                                {
                                  label: 'Proceed, anyway',
                                  className:
                                    'w-36 bg-blue-600 text-white hover:bg-blue-700',
                                  onClick: () => {
                                    // Withdraw (create invoice for NEW order flow) and proceed
                                    withdrawOrderMutation.mutate({
                                      orderId: Number(params.order_id),
                                      amount: orderDetails?.amount,
                                      gstAmount: orderDetails?.gstAmount,
                                      orderItems: orderDetails?.orderItems,
                                    });
                                  },
                                },
                              ],
                            });
                          }

                          // Case 3: Direct invoice generation
                          else {
                            setIsGenerateInvoice(true);
                          }
                        }}
                        className="font-bold"
                      >
                        {translations('ctas.generate_invoice')}
                      </Button>
                    </ProtectedWrapper>
                  )}

                {/* stock-out CTA */}
                {!isGenerateInvoice &&
                  !isRecordingPayment &&
                  !orderDetails?.invoiceGenerationCompleted &&
                  orderDetails?.negotiationStatus === 'ACCEPTED' &&
                  orderDetails?.metaData?.sellerData?.stockOut ===
                    'STOCK_OUT' &&
                  !viewNegotiationHistory && (
                    <ProtectedWrapper
                      permissionCode={'permission:sales-stock-out'}
                    >
                      <Button
                        variant="blue_outline"
                        size="sm"
                        onClick={() =>
                          stockOutMutation.mutate({
                            enterpriseId: Number(enterpriseId),
                            orderId: Number(params.order_id),
                          })
                        }
                        className="font-bold"
                      >
                        {translations('ctas.stock-out')}
                      </Button>
                    </ProtectedWrapper>
                  )}

                {/* more ctas */}
                {/* {!isGenerateInvoice &&
                  !isRecordingPayment &&
                  !isNegotiation &&
                  orderDetails.negotiationStatus === 'NEW' &&
                  userId.toString() === orderDetails.createdBy.toString() && (
                    <ProtectedWrapper permissionCode={'permission:sales-edit'}>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Tooltips
                            trigger={
                              <Button
                                variant="blue_outline"
                                size="sm"
                                className="flex items-center justify-center border border-[#DCDCDC] text-black"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            }
                            content={translations('ctas.more.placeholder')}
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="max-w-fit">
                          <span
                            onClick={() => setIsEditingOrder(true)}
                            className="flex items-center justify-center gap-2 rounded-sm p-1 text-sm hover:cursor-pointer hover:bg-gray-300"
                          >
                            <Pencil size={14} />{' '}
                            {translations('ctas.more.revise')}
                          </span>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </ProtectedWrapper>
                  )} */}
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
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewOrder;
