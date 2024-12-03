'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
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
import { getVendors } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Share2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const searchParams = useSearchParams();
  const showInvoice = searchParams.get('showInvoice');

  const [isPastInvoices, setIsPastInvoices] = useState(showInvoice || false);
  const [isNegotiation, setIsNegotiation] = useState(false);

  const [tab, setTab] = useState('overview');

  const onTabChange = (value) => {
    setTab(value);
  };

  const purchaseOrdersBreadCrumbs = [
    {
      id: 1,
      name: 'Purchases',
      path: '/purchases/purchase-orders',
      show: true, // Always show
    },
    {
      id: 2,
      name: `Order details`,
      path: `/purchases/purchase-orders/${params.order_id}`,
      show: true, // Always show
    },
    {
      id: 3,
      name: 'Negotiation',
      path: `/purchases/purchase-orders/${params.order_id}/`,
      show: isNegotiation, // Show only if isNegotiation is true
    },
    {
      id: 4,
      name: 'Invoices',
      path: `/purchases/purchase-orders/${params.order_id}/`,
      show: isPastInvoices, // Show only if isPastInvoices is true
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');
    setIsNegotiation(state === 'negotiation');
    setIsPastInvoices(state === 'showInvoice');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    const newPath = `/purchases/purchase-orders/${params.order_id}${
      isNegotiation
        ? '?state=negotiation'
        : isPastInvoices
          ? '?state=showInvoice'
          : ''
    }`;

    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [isNegotiation, isPastInvoices, params.order_id, router]);

  useEffect(() => {
    queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
  }, [isNegotiation]);

  const { isLoading, data: orderDetails } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey],
    queryFn: () => OrderDetails(params.order_id),
    select: (res) => res.data.data,
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

  // fetching vendor to get vendorName
  const { data: vendors } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors(enterpriseId),
    select: (res) => res.data.data,
  });
  const vendor = vendors?.find(
    (vendorData) => vendorData?.vendor?.id === orderDetails?.sellerEnterpriseId,
  );
  const vendorName =
    vendor?.vendor?.name !== null
      ? vendor?.vendor?.name
      : vendor?.invitation?.userDetails?.name;

  const vendorNumber =
    vendor?.vendor === null
      ? vendor?.invitation?.invitationIdentifier
      : vendor?.vendor?.mobileNumber;

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

  return (
    <Wrapper className="h-full py-2">
      {isLoading && !orderDetails && <Loading />}
      {!isLoading && orderDetails && (
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
              {/* ctas - share invoice create */}
              {/* share CTA */}

              {!isNegotiation && (
                <Button
                  variant="blue_outline"
                  size="sm"
                  className="flex items-center justify-center border border-[#DCDCDC] text-black"
                >
                  <Share2 size={14} />
                </Button>
              )}
            </div>
          </section>

          {/* switch tabs */}
          {!isNegotiation && (
            <section>
              <Tabs
                value={tab}
                onValueChange={onTabChange}
                defaultValue={'overview'}
              >
                <section className="sticky top-10 z-10 bg-white">
                  <TabsList className="border">
                    <TabsTrigger
                      className={`w-24 ${tab === 'overview' ? 'shadow-customShadow' : ''}`}
                      value="overview"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      className={`w-24 ${tab === 'invoices' ? 'shadow-customShadow' : ''}`}
                      value="invoices"
                    >
                      Invoice
                    </TabsTrigger>
                    <TabsTrigger
                      className={`w-24 ${tab === 'payment' ? 'shadow-customShadow' : ''}`}
                      value="payment"
                    >
                      Payment
                    </TabsTrigger>
                    <TabsTrigger
                      className={`w-24 ${tab === 'timeline' ? 'shadow-customShadow' : ''}`}
                      value="timeline"
                    >
                      Timeline
                    </TabsTrigger>
                  </TabsList>
                </section>

                <TabsContent value="overview" className="flex flex-col gap-4">
                  <OrdersOverview
                    orderDetails={orderDetails}
                    orderId={orderDetails?.referenceNumber}
                    multiStatus={multiStatus}
                    Name={vendorName}
                    mobileNumber={vendorNumber}
                    amtPaid={orderDetails?.amountPaid}
                    totalAmount={orderDetails.amount + orderDetails.gstAmount}
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
                  Timeline here. Coming Soon...
                </TabsContent>
              </Tabs>
            </section>
          )}

          {/* Negotiation Component */}
          {isNegotiation && !isPastInvoices && (
            <NegotiationComponent
              orderDetails={orderDetails}
              isNegotiation={isNegotiation}
              setIsNegotiation={setIsNegotiation}
            />
          )}

          {/* Invoices Component */}
          {isPastInvoices && !isNegotiation && <PastInvoices />}

          {/* seprator */}
          {!isNegotiation && (
            <div className="mt-auto h-[1px] bg-neutral-300"></div>
          )}

          {/* Footer ctas */}
          {!isNegotiation && (
            <div className="sticky bottom-0 z-10 flex justify-end">
              <section className="flex gap-2">
                {/* status NEW */}
                {!isPastInvoices &&
                  orderDetails?.negotiationStatus === 'NEW' &&
                  orderDetails?.buyerEnterpriseId === enterpriseId && (
                    <>
                      {orderDetails?.orderType === 'PURCHASE' && (
                        <span className="flex items-center gap-1 rounded-sm border border-[#A5ABBD24] bg-[#F5F6F8] px-4 py-2 text-sm font-semibold">
                          <Clock size={12} /> Waiting for Response
                        </span>
                      )}

                      {orderDetails?.orderType === 'SALES' && (
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
                {!isPastInvoices &&
                  orderDetails?.negotiationStatus === 'NEGOTIATION' &&
                  orderDetails?.buyerEnterpriseId === enterpriseId && (
                    <>
                      {orderDetails?.orderStatus === 'OFFER_SUBMITTED' && (
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
                      {orderDetails?.orderStatus === 'BID_SUBMITTED' && (
                        <span className="flex items-center gap-1 rounded-sm border border-[#A5ABBD24] bg-[#F5F6F8] px-4 py-2 text-sm font-semibold">
                          <Clock size={12} /> Waiting for Response
                        </span>
                      )}
                    </>
                  )}
              </section>
            </div>
          )}
        </>
      )}
    </Wrapper>
  );
};

export default ViewOrder;
