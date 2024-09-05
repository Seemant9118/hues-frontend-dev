'use client';

import { orderApi } from '@/api/order_api/order_api';
import EditablePartialInvoiceModal from '@/components/Modals/EditablePartialInvoiceModal';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Share2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSalesOrderColumns } from './useSalesOrderColumns';

// dynamic imports
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
  const searchParams = useSearchParams();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [isPastInvoices, setIsPastInvoices] = useState(false);
  const [isNegotiation, setIsNegotiation] = useState(false);

  const salesOrdersBreadCrumbs = [
    {
      name: 'SALES',
      path: '/sales-orders',
      show: true, // Always show
    },
    {
      name: `${params.order_id}`,
      path: `/sales-orders/${params.order_id}`,
      show: true, // Always show
    },
    {
      name: 'NEGOTIATION',
      path: `/sales-orders/${params.order_id}`,
      show: isNegotiation, // Show only if isNegotiation is true
    },
    {
      name: 'INVOICES',
      path: `/sales-orders/${params.order_id}`,
      show: isPastInvoices, // Show only if isPastInvoices is true
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');
    setIsNegotiation(state === 'negotiation');
    setIsPastInvoices(state === 'past-invoices');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state
    const newPath = `/sales-orders/${params.order_id}${isNegotiation ? '?state=negotiation' : isPastInvoices ? '?state=past-invoices' : ''}`;
    router.push(newPath, { shallow: true });
  }, [isNegotiation, isPastInvoices, params.order_id, router]);

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

  const OrderColumns = useSalesOrderColumns(orderDetails?.negotiationStatus);

  return (
    <Wrapper className="relative">
      {isLoading && !orderDetails && <Loading />}

      {!isLoading && orderDetails && (
        <>
          <section className="flex items-center justify-between">
            <div className="flex flex-col gap-2 pt-2">
              {/* breadcrumbs */}
              <OrderBreadCrumbs
                possiblePagesBreadcrumbs={salesOrdersBreadCrumbs}
                setIsNegotiation={setIsNegotiation}
                setIsPastInvoices={setIsPastInvoices}
              />
              <ConditionalRenderingStatus
                status={orderDetails?.negotiationStatus}
              />
            </div>

            <Button variant="blue_outline">
              <Share2 size={14} />
              Share Order
            </Button>
          </section>

          {!isPastInvoices && !isNegotiation && (
            <DataTable
              columns={OrderColumns}
              data={orderDetails?.orderItems}
            ></DataTable>
          )}

          {isNegotiation && !isPastInvoices && (
            <NegotiationComponent
              orderDetails={orderDetails}
              isNegotiation={isNegotiation}
              setIsNegotiation={setIsNegotiation}
            />
          )}

          {isPastInvoices && !isNegotiation && <PastInvoices />}

          {!isNegotiation && (
            <div className="mt-auto h-[1px] bg-neutral-300"></div>
          )}

          <div className="flex justify-between">
            <section>
              {!isPastInvoices && !isNegotiation && (
                <Button
                  variant="outline"
                  className="w-32"
                  onClick={() => {
                    router.push('/sales-orders');
                  }}
                >
                  {' '}
                  Close{' '}
                </Button>
              )}
            </section>
            <section className="flex gap-2">
              {/* status NEW */}
              {!isPastInvoices &&
                orderDetails?.negotiationStatus === 'NEW' &&
                orderDetails?.sellerEnterpriseId === enterpriseId && (
                  <>
                    {orderDetails?.orderType === 'SALES' && (
                      <span className="rounded-md border border-yellow-500 bg-yellow-50 p-2 font-bold text-yellow-500">
                        Waiting for Response
                      </span>
                    )}

                    {orderDetails?.orderType === 'PURCHASE' && (
                      <div className="flex w-full justify-end gap-2">
                        {!isNegotiation && (
                          <>
                            <Button
                              className="w-32 bg-[#F8BA05] text-white hover:bg-[#F8BA051A] hover:text-[#F8BA05]"
                              onClick={() => setIsNegotiation(true)}
                            >
                              Negotiate
                            </Button>
                            <Button
                              className="w-32 bg-[#39C06F] text-white hover:bg-[#39C06F1A] hover:text-[#39C06F]"
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
                orderDetails?.sellerEnterpriseId === enterpriseId && (
                  <>
                    {orderDetails?.orderStatus === 'BID_SUBMITTED' && (
                      <div className="flex w-full justify-end gap-2">
                        {!isNegotiation && (
                          <>
                            <Button
                              className="w-32 bg-[#F8BA05] text-white hover:bg-[#F8BA051A] hover:text-[#F8BA05]"
                              onClick={() => setIsNegotiation(true)}
                            >
                              Negotiate
                            </Button>
                            <Button
                              className="w-32 bg-[#39C06F] text-white hover:bg-[#39C06F1A] hover:text-[#39C06F]"
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

              {/* genrateInvoice CTA */}
              {!isPastInvoices &&
                (orderDetails.negotiationStatus === 'ACCEPTED' ||
                  orderDetails.negotiationStatus === 'NEW') && (
                  <div className="flex gap-2">
                    {/* if any partial invoice generated then show view invoices */}
                    <Button
                      variant="blue_outline"
                      className="w-40 border-yellow-500 bg-yellow-50 text-yellow-500 hover:bg-yellow-500 hover:text-white"
                      onClick={() => setIsPastInvoices(true)}
                    >
                      <Eye size={16} />
                      View Invoices
                    </Button>

                    {!orderDetails?.invoiceGenerationCompleted && (
                      <EditablePartialInvoiceModal
                        orderDetails={orderDetails}
                        setIsPastInvoices={setIsPastInvoices}
                      />
                    )}
                  </div>
                )}
            </section>
          </div>
        </>
      )}
    </Wrapper>
  );
};

export default ViewOrder;
