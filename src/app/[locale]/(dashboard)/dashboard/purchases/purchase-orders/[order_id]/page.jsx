'use client';

import { auditLogsAPIs } from '@/api/auditLogs/auditLogsApi';
import { orderApi } from '@/api/order_api/order_api';
import Tooltips from '@/components/auth/Tooltips';
import CommentBox from '@/components/comments/CommentBox';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import EditOrder from '@/components/orders/EditOrder';
import NegotiationHistory from '@/components/orders/NegotiationHistory';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import MakePaymentNew from '@/components/payments/MakePaymentNew';
import PaymentDetails from '@/components/payments/PaymentDetails';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import TimelineItem from '@/components/ui/TimelineItem';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useAuth } from '@/context/AuthContext';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService } from '@/lib/utils';
import { getOrderAudits } from '@/services/AuditLogs_Services/AuditLogsService';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreVertical, Pencil } from 'lucide-react';
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

const ViewOrder = () => {
  useMetaData('Hues! - Purchase Order Details', 'HUES PURCHASES'); // dynamic title

  const translations = useTranslations(
    'purchases.purchase-orders.order_details',
  );

  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const searchParams = useSearchParams();
  const showInvoice = searchParams.get('showInvoice');
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isPastInvoices, setIsPastInvoices] = useState(showInvoice || false);
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [isPaymentAdvicing, setIsPaymentAdvicing] = useState(false);
  const [viewNegotiationHistory, setViewNegotiationHistory] = useState(false);
  // const [isUploadingAttachements, setIsUploadingAttachements] = useState(false);
  // const [files, setFiles] = useState([]);

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
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');
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
  //     setIsUploadingAttachements(false);
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
        status={orderDetails?.metaData?.payment?.status}
      />
    </div>
  );

  if (!permissions || permissions.length === 0) {
    return null; // or <Loading />
  }

  if (!hasPermission('permission:purchase-view')) {
    router.replace('/unauthorized');
    return null;
  }

  return (
    <Wrapper className="h-full py-2">
      {isLoading && !orderDetails && <Loading />}
      {/* editOrder Component */}
      {isEditingOrder && (
        <EditOrder
          type="sales"
          name="Edit"
          cta="bid"
          isOrder="order"
          orderId={params.order_id}
          onCancel={() => setIsEditingOrder(false)}
        />
      )}
      {!isEditingOrder && !isLoading && orderDetails && (
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

            <div className="flex gap-2">
              {/* negotiation ctas */}
              {!isNegotiation && !viewNegotiationHistory && (
                <ProtectedWrapper
                  permissionCode={'permission:purchase-negotiation'}
                >
                  <section className="flex gap-2">
                    {/* status NEW */}
                    {!isPastInvoices &&
                      orderDetails?.negotiationStatus === 'NEW' &&
                      orderDetails?.buyerId === enterpriseId && (
                        <>
                          {/* {orderDetails?.orderType === 'PURCHASE' && (
                        <span className="flex items-center gap-1 rounded-sm border border-[#A5ABBD24] bg-[#F5F6F8] px-4 py-2 text-sm font-semibold">
                          <Clock size={12} />{' '}
                          {translations('ctas.footer_ctas.wait_response')}
                        </span>
                      )} */}

                          {orderDetails?.orderType === 'SALES' && (
                            <div className="flex w-full justify-end gap-2">
                              {!isNegotiation && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="blue_outline"
                                    onClick={() => setIsNegotiation(true)}
                                  >
                                    {translations('ctas.footer_ctas.negotiate')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleAccept}
                                    disabled={acceptMutation.isPending}
                                  >
                                    {acceptMutation.isPending ? (
                                      <Loading size={14} />
                                    ) : (
                                      translations('ctas.footer_ctas.accept')
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      )}

                    {/* status NEGOTIATION */}
                    {!isPastInvoices &&
                      orderDetails?.negotiationStatus === 'NEGOTIATION' &&
                      orderDetails?.buyerId === enterpriseId && (
                        <>
                          {orderDetails?.orderStatus === 'OFFER_SUBMITTED' && (
                            <div className="flex w-full justify-end gap-2">
                              {!isNegotiation && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="blue_outline"
                                    onClick={() => setIsNegotiation(true)}
                                  >
                                    {translations('ctas.footer_ctas.negotiate')}
                                  </Button>
                                  <Button size="sm" onClick={handleAccept}>
                                    {translations('ctas.footer_ctas.accept')}
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                          {/* {orderDetails?.orderStatus === 'BID_SUBMITTED' && (
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
              {/* send payment advice CTA */}
              {!isPaymentAdvicing &&
                (orderDetails.negotiationStatus === 'INVOICED' ||
                  orderDetails?.negotiationStatus === 'PARTIAL_INVOICED') &&
                orderDetails?.metaData?.payment?.status !== 'PAID' && (
                  <ProtectedWrapper
                    permissionCode={'permission:purchase-create-payment'}
                  >
                    <Button
                      variant="blue_outline"
                      size="sm"
                      onClick={() => setIsPaymentAdvicing(true)}
                      className="font-bold"
                    >
                      {translations('ctas.payment_advice')}
                    </Button>
                  </ProtectedWrapper>
                )}

              {/* more ctas */}
              <ProtectedWrapper permissionCode={'permission:purchase-edit'}>
                {orderDetails.negotiationStatus === 'NEW' &&
                  userId.toString() === orderDetails.createdBy.toString() && (
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
                  )}
              </ProtectedWrapper>
            </div>
          </section>
          {/* switch tabs */}
          {!isNegotiation && !isPaymentAdvicing && !viewNegotiationHistory && (
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

                <TabsContent value="overview" className="flex flex-col gap-4">
                  <OrdersOverview
                    orderDetails={orderDetails}
                    orderId={orderDetails?.referenceNumber}
                    multiStatus={multiStatus}
                    Name={`${orderDetails?.vendorName} (${orderDetails?.clientType})`}
                    mobileNumber={orderDetails?.vendorMobileNumber}
                    amtPaid={orderDetails?.amountPaid}
                    totalAmount={orderDetails.amount + orderDetails.gstAmount}
                    setViewNegotiationHistory={setViewNegotiationHistory}
                  />

                  <CommentBox contextId={params.order_id} context={'ORDER'} />

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

                    {!isTimeLinesDataLoading && timeLineData?.length === 0 && (
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
          {isPaymentAdvicing && !isNegotiation && !viewNegotiationHistory && (
            <MakePaymentNew
              orderId={params.order_id}
              orderDetails={orderDetails}
              setIsRecordingPayment={setIsPaymentAdvicing}
              contextType="PAYMENT_ADVICE"
            />
          )}
          {/* upload attachements */}
          {/* {isUploadingAttachements && !isNegotiation && !isPaymentAdvicing &&  !viewNegotiationHistory && (
            <div className="mt-4 flex h-full flex-col justify-between gap-4">
              <div>
                <FileUploader
                  handleChange={handleAttached}
                  name="file"
                  types={['png', 'pdf']}
                >
                  <div className="mb-2 flex min-w-[700px] cursor-pointer items-center justify-between gap-3 rounded border-2 border-dashed border-[#288AF9] px-5 py-10">
                    <div className="flex items-center gap-4">
                      <UploadCloud className="text-[#288AF9]" size={40} />
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium text-darkText">
                          {translations('fileUploader.instruction')}
                        </p>
                        <p className="text-xs font-normal text-[#288AF9]">
                          {translations('fileUploader.note')}
                        </p>
                      </div>
                    </div>
                    <Button variant="blue_outline">
                      <Upload />
                      {translations('fileUploader.buttons.select')}
                    </Button>
                  </div>
                </FileUploader>
                {files?.length > 0 && (
                  <span className="mt-2 w-full text-sm font-semibold">
                    {translations('fileUploader.attachedFilesLabel')}
                  </span>
                )}
                <div className="mt-4 flex flex-wrap gap-4">
                  {files?.map((file) => (
                    <div
                      key={file.name}
                      className="relative flex w-64 flex-col gap-2 rounded-xl border border-neutral-300 bg-white p-4 shadow-sm"
                    >
                      <X
                        size={16}
                        onClick={() => handleFileRemove(file)}
                        className="absolute right-2 top-2 cursor-pointer text-neutral-500 hover:text-red-500"
                      />

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                        {file.name.split('.').pop() === 'pdf' ? (
                          <FileText size={16} className="text-red-600" />
                        ) : (
                          // eslint-disable-next-line jsx-a11y/alt-text
                          <Image size={16} className="text-primary" />
                        )}
                      </div>

                      <p className="truncate text-sm font-medium text-neutral-800">
                        {file.name}
                      </p>

                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/10 p-1.5 text-green-600">
                          <Check size={12} />
                        </div>
                        <p className="text-xs font-medium text-green-600">
                          {translations('fileUploader.fileAttachedMessage')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsUploadingAttachements(false);
                    setFiles([]);
                  }}
                >
                  {translations('fileUploader.buttons.cancel')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => uploadAttachements(files)}
                  disabled={createAttachments?.isPending}
                >
                  {createAttachments?.isPending ? (
                    <Loading />
                  ) : (
                    translations('fileUploader.buttons.upload')
                  )}
                </Button>
              </div>
            </div>
          )} */}

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
    </Wrapper>
  );
};

export default ViewOrder;
