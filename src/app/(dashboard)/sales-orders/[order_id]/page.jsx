'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { orderApi } from '@/api/order_api/order_api';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import PaymentDetails from '@/components/payments/PaymentDetails';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Share2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const searchParams = useSearchParams();
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [isGenerateInvoice, setIsGenerateInvoice] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const [tab, setTab] = useState('overview');

  const onTabChange = (value) => {
    setTab(value);
  };

  const salesOrdersBreadCrumbs = [
    {
      name: 'Sales',
      path: '/sales-orders',
      show: true, // Always show
    },
    {
      name: `Order Details`,
      path: `/sales-orders/${params.order_id}`,
      show: true, // Always show
    },
    {
      name: 'Negotiation',
      path: `/sales-orders/${params.order_id}`,
      show: isNegotiation, // Show only if isNegotiation is true
    },
    {
      name: 'Generate Invoice',
      path: `/sales-orders/${params.order_id}`,
      show: isGenerateInvoice, // Show only if isGenerateInvoice is true
    },
    {
      name: 'Record Payment',
      path: `/sales-orders/${params.order_id}`,
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
    let newPath = `/sales-orders/${params.order_id}`;

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

  const { isLoading, data: orderDetails } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey],
    queryFn: () => OrderDetails(params.order_id),
    select: (data) => data.data.data,
  });

  const acceptMutation = useMutation({
    mutationKey: orderApi.bulkNegotiateAcceptOrReject.endpointKey,
    mutationFn: bulkNegotiateAcceptOrReject,
    onSuccess: () => {
      toast.success('Order Accepted');
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate({
      orderId: Number(params.order_id),
      status: 'ACCEPTED',
    });
  };

  // to get client name and number
  const { data: clients } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (res) => res.data.data,
  });
  const client = clients?.find((clientData) => {
    const clientId = clientData?.client?.id ?? clientData?.id;
    return clientId === orderDetails?.buyerEnterpriseId;
  });

  const clientName =
    client?.client === null
      ? client?.invitation?.userDetails?.name
      : client?.client?.name;

  const clientNumber =
    client?.client === null
      ? client?.invitation?.invitationIdentifier
      : client?.client?.mobileNumber;

  const OrderColumns = useSalesOrderColumns(orderDetails?.negotiationStatus);

  // multiStatus components
  const multiStatus = (
    <div className="flex gap-2">
      <ConditionalRenderingStatus status={orderDetails?.negotiationStatus} />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.payment?.status}
      />
    </div>
  );

  return (
    <Wrapper className="relative">
      {isLoading && !orderDetails && <Loading />}

      {!isLoading && orderDetails && (
        <>
          {/* headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white">
            <div className="flex flex-col gap-2 pt-2">
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
                orderDetails.negotiationStatus === 'INVOICED' && (
                  <Button
                    variant="blue_outline"
                    size="sm"
                    onClick={() => setIsRecordingPayment(true)}
                    className="font-bold"
                  >
                    Record Payment
                  </Button>
                )}
              {/* generateInvoice CTA */}
              {!isGenerateInvoice &&
                !isRecordingPayment &&
                !orderDetails?.invoiceGenerationCompleted &&
                (orderDetails.negotiationStatus === 'ACCEPTED' ||
                  (orderDetails.negotiationStatus === 'NEW' &&
                    orderDetails?.orderType === 'SALES')) && (
                  <Button
                    variant="blue_outline"
                    size="sm"
                    onClick={() => setIsGenerateInvoice(true)}
                    className="font-bold"
                  >
                    Generate Invoice
                  </Button>
                )}

              {/* share CTA */}
              {!isGenerateInvoice && !isRecordingPayment && (
                <Button variant="blue_outline" size="sm">
                  <Share2 size={14} />
                </Button>
              )}
            </div>
          </section>

          {/* swtich tabs */}
          {!isGenerateInvoice && !isNegotiation && !isRecordingPayment && (
            <section>
              <Tabs
                value={tab}
                onValueChange={onTabChange}
                defaultValue={'overview'}
              >
                <section className="sticky top-10 z-10 bg-white">
                  <TabsList className="border">
                    <TabsTrigger className="w-24" value="overview">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger className="w-24" value="invoices">
                      Invoice
                    </TabsTrigger>
                    <TabsTrigger className="w-24" value="payment">
                      Payment
                    </TabsTrigger>
                    <TabsTrigger className="w-24" value="timeline">
                      Timeline
                    </TabsTrigger>
                  </TabsList>
                </section>

                <TabsContent value="overview" className="flex flex-col gap-4">
                  {/* orders overview */}
                  <OrdersOverview
                    orderId={params.order_id}
                    multiStatus={multiStatus}
                    Name={clientName}
                    mobileNumber={clientNumber}
                    amtPaid={orderDetails?.amountPaid}
                    totalAmount={orderDetails.amount + orderDetails.gstAmount}
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
                  Timeline here. Coming Soon...
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
                      <span className="rounded-sm border border-yellow-200 bg-yellow-50 p-2 text-sm font-bold text-yellow-500">
                        Waiting for Response
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
                              Negotiate
                            </Button>
                            <Button
                              size="sm"
                              className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                              onClick={handleAccept}
                            >
                              Accept
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
                              Negotiate
                            </Button>
                            <Button
                              size="sm"
                              className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                              onClick={handleAccept}
                            >
                              Accept
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                    {orderDetails?.orderStatus === 'OFFER_SUBMITTED' && (
                      <span className="rounded-md border border-yellow-500 bg-yellow-50 p-2 font-bold text-yellow-500">
                        Waiting for Response
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
