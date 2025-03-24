'use client';

import { invitation } from '@/api/invitation/Invitation';
import { orderApi } from '@/api/order_api/order_api';
import Tooltips from '@/components/auth/Tooltips';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import EditOrder from '@/components/orders/EditOrder';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import PaymentDetails from '@/components/payments/PaymentDetails';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService } from '@/lib/utils';
import { getInvitationStatus } from '@/services/Invitation_Service/Invitation_Service';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
  shareOrder,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Download, MoreVertical, Pencil } from 'lucide-react';
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

  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const searchParams = useSearchParams();
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [isGenerateInvoice, setIsGenerateInvoice] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [tab, setTab] = useState('overview');

  const onTabChange = (value) => {
    setTab(value);
  };

  const salesOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.sales'),
      path: '/sales/sales-orders',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title.order_details'),
      path: `/sales/sales-orders/${params.order_id}`,
      show: true, // Always show
    },
    {
      id: 3,
      name: translations('title.negotiation'),
      path: `/sales/sales-orders/${params.order_id}`,
      show: isNegotiation, // Show only if isNegotiation is true
    },
    {
      id: 4,
      name: translations('title.generate_invoice'),
      path: `/sales/sales-orders/${params.order_id}`,
      show: isGenerateInvoice, // Show only if isGenerateInvoice is true
    },
    {
      id: 5,
      name: translations('title.record_payment'),
      path: `/sales/sales-orders/${params.order_id}`,
      show: isRecordingPayment, // Show only if isGenerateInvoice is true
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');
    setIsNegotiation(state === 'negotiation');
    setIsGenerateInvoice(state === 'generateInvoice');
    setIsRecordingPayment(state === 'recordPayment');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/sales/sales-orders/${params.order_id}`;

    if (isNegotiation) {
      newPath += '?state=negotiation';
    } else if (isGenerateInvoice) {
      newPath += '?state=generateInvoice';
    } else if (isRecordingPayment) {
      newPath += '?state=recordPayment';
    } else {
      newPath += '';
    }

    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [
    isNegotiation,
    isGenerateInvoice,
    isRecordingPayment,
    params.order_id,
    router,
  ]);

  useEffect(() => {
    queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
  }, [isNegotiation]);

  // api calling for orderDEtails
  const { isLoading, data: orderDetails } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey],
    queryFn: () => OrderDetails(params.order_id),
    select: (data) => data.data.data,
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

  // download mutaion
  const downloadOrderMutation = useMutation({
    mutationKey: [orderApi.shareOrder.endpointKey],
    mutationFn: shareOrder,
    onSuccess: (res) => {
      const { publicUrl } = res.data.data;
      // Trigger file download
      const link = document.createElement('a');
      link.href = publicUrl;
      link.click();
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
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
        status={orderDetails?.metaData?.payment?.status}
      />
    </div>
  );

  return (
    <Wrapper className="h-full py-2">
      {isLoading && !orderDetails && <Loading />}

      {/* editOrder Component */}
      {isEditingOrder && (
        <EditOrder
          type="sales"
          name="Edit"
          cta="offer"
          isOrder="order"
          orderId={params.order_id}
          onCancel={() => setIsEditingOrder(false)}
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
            <div className="flex gap-2">
              {/* record payment CTA */}
              {!isGenerateInvoice &&
                !isRecordingPayment &&
                (orderDetails.negotiationStatus === 'INVOICED' ||
                  orderDetails?.negotiationStatus === 'PARTIAL_INVOICED') &&
                orderDetails?.metaData?.payment?.status !== 'PAID' && (
                  <Button
                    variant="blue_outline"
                    size="sm"
                    onClick={() => setIsRecordingPayment(true)}
                    className="font-bold"
                  >
                    {translations('ctas.record_payment')}
                  </Button>
                )}
              {/* generateInvoice CTA */}
              {!isGenerateInvoice &&
                !isRecordingPayment &&
                !orderDetails?.invoiceGenerationCompleted &&
                (orderDetails?.negotiationStatus === 'ACCEPTED' ||
                  orderDetails?.negotiationStatus === 'PARTIAL_INVOICED' ||
                  (orderDetails.negotiationStatus === 'NEW' &&
                    orderDetails?.orderType === 'SALES')) && (
                  <Button
                    variant="blue_outline"
                    size="sm"
                    onClick={() => setIsGenerateInvoice(true)}
                    className="font-bold"
                  >
                    {translations('ctas.generate_invoice')}
                  </Button>
                )}

              {/* download CTA */}
              {!isGenerateInvoice &&
                !isRecordingPayment &&
                !isNegotiation &&
                orderDetails?.negotiationStatus !== 'WITHDRAWN' && (
                  <Tooltips
                    trigger={
                      <Button
                        disabled={downloadOrderMutation.isPending}
                        onClick={() =>
                          downloadOrderMutation.mutate(params.order_id)
                        }
                        size="sm"
                        variant="outline"
                        className="font-bold"
                      >
                        {downloadOrderMutation.isPending ? (
                          <Loading size={14} />
                        ) : (
                          <Download size={14} />
                        )}
                      </Button>
                    }
                    content={translations('ctas.download.placeholder')}
                  />
                )}

              {/* share CTA */}
              {/* {!isGenerateInvoice &&
                !isRecordingPayment &&
                !isNegotiation &&
                orderDetails?.negotiationStatus !== 'WITHDRAWN' && (
                  <ShareOrderInvoice
                    heading={'Share Order Details'}
                    queryKey={orderApi.shareOrder.endpointKey}
                    queryFn={shareOrder}
                  />
                )} */}

              {/* more ctas */}
              {!isGenerateInvoice &&
                !isRecordingPayment &&
                !isNegotiation &&
                orderDetails.negotiationStatus === 'NEW' &&
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
                        <Pencil size={14} /> {translations('ctas.more.edit')}
                      </span>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
            </div>
          </section>

          {/* switch tabs */}
          {!isGenerateInvoice && !isNegotiation && !isRecordingPayment && (
            <section>
              <Tabs
                value={tab}
                onValueChange={onTabChange}
                defaultValue={'overview'}
              >
                <section className="sticky top-12 bg-white py-2">
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
                  {/* orders overview */}
                  <OrdersOverview
                    isCollapsableOverview={false}
                    orderDetails={orderDetails}
                    orderId={orderDetails?.referenceNumber}
                    multiStatus={multiStatus}
                    Name={`${orderDetails?.clientName} (${orderDetails?.clientType})`}
                    mobileNumber={orderDetails?.mobileNumber}
                    amtPaid={orderDetails?.amountPaid}
                    totalAmount={orderDetails.amount + orderDetails.gstAmount}
                    invitationData={invitationData}
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
                  {translations('tabs.content.tab4.coming_soon')}
                </TabsContent>
              </Tabs>
            </section>
          )}

          {/* Negotiation Component */}
          {isNegotiation && !isGenerateInvoice && !isRecordingPayment && (
            <NegotiationComponent
              orderDetails={orderDetails}
              isNegotiation={isNegotiation}
              setIsNegotiation={setIsNegotiation}
            />
          )}

          {/* seprator */}
          {!isNegotiation && !isGenerateInvoice && !isRecordingPayment && (
            <div className="mt-auto h-[1px] bg-neutral-300"></div>
          )}

          {/* generate Invoice component */}
          {isGenerateInvoice && !isNegotiation && !isRecordingPayment && (
            <GenerateInvoice
              orderDetails={orderDetails}
              setIsGenerateInvoice={setIsGenerateInvoice}
            />
          )}

          {/* recordPayment component */}
          {isRecordingPayment && !isGenerateInvoice && !isNegotiation && (
            <MakePaymentNew
              orderId={params.order_id}
              orderDetails={orderDetails}
              setIsRecordingPayment={setIsRecordingPayment}
            />
          )}

          {/* footer ctas */}
          <div className="sticky bottom-0 z-10 flex justify-end bg-white">
            <section className="flex gap-2">
              {/* status NEW */}
              {tab === 'overview' &&
                !isGenerateInvoice &&
                !isRecordingPayment &&
                orderDetails?.negotiationStatus === 'NEW' &&
                orderDetails?.sellerEnterpriseId === enterpriseId && (
                  <>
                    {orderDetails?.orderType === 'SALES' && (
                      <span className="flex items-center gap-1 rounded-sm border border-[#A5ABBD24] bg-[#F5F6F8] px-4 py-2 text-sm font-semibold">
                        <Clock size={12} />
                        {translations('ctas.footer_ctas.wait_response')}
                      </span>
                    )}

                    {orderDetails?.orderType === 'PURCHASE' && (
                      <div className="flex w-full justify-end gap-2">
                        {!isNegotiation && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-32"
                              onClick={() => setIsNegotiation(true)}
                            >
                              {translations('ctas.footer_ctas.negotiate')}
                            </Button>
                            <Button
                              size="sm"
                              className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
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
              {tab === 'overview' &&
                !isGenerateInvoice &&
                !isRecordingPayment &&
                orderDetails?.negotiationStatus === 'NEGOTIATION' &&
                orderDetails?.sellerEnterpriseId === enterpriseId && (
                  <>
                    {orderDetails?.orderStatus === 'BID_SUBMITTED' && (
                      <div className="flex w-full justify-end gap-2">
                        {!isNegotiation && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-32"
                              onClick={() => setIsNegotiation(true)}
                            >
                              {translations('ctas.footer_ctas.negotiate')}
                            </Button>
                            <Button
                              size="sm"
                              className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                              onClick={handleAccept}
                            >
                              {translations('ctas.footer_ctas.accept')}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                    {orderDetails?.orderStatus === 'OFFER_SUBMITTED' && (
                      <span className="flex items-center gap-1 rounded-sm border border-[#A5ABBD24] bg-[#F5F6F8] px-4 py-2 text-sm font-semibold">
                        <Clock size={12} />{' '}
                        {translations('ctas.footer_ctas.wait_response')}
                      </span>
                    )}
                  </>
                )}
            </section>
          </div>
        </>
      )}
    </Wrapper>
  );
};

export default ViewOrder;
