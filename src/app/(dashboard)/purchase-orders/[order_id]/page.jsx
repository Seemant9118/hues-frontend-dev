'use client';

import { orderApi } from '@/api/order_api/order_api';
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
import { usePurchaseOrderColumns } from './usePurchaseOrderColumns';
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
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const searchParams = useSearchParams();
  const showInvoice = searchParams.get('showInvoice');

  const [isPastInvoices, setIsPastInvoices] = useState(showInvoice || false);
  const [isNegotiation, setIsNegotiation] = useState(false);

  const purchaseOrdersBreadCrumbs = [
    {
      name: 'PURCHASES',
      path: '/purchase-orders',
      show: true, // Always show
    },
    {
      name: `${params.order_id}`,
      path: `/purchase-orders/${params.order_id}`,
      show: true, // Always show
    },
    {
      name: 'NEGOTIATION',
      path: `/purchase-orders/${params.order_id}/`,
      show: isNegotiation, // Show only if isNegotiation is true
    },
    {
      name: 'INVOICES',
      path: `/purchase-orders/${params.order_id}/`,
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
    const newPath = `/purchase-orders/${params.order_id}${
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

  const OrderColumns = usePurchaseOrderColumns();

  return (
    <Wrapper className="relative">
      {isLoading && !orderDetails && <Loading />}
      {!isLoading && orderDetails && (
        <>
          <section className="flex items-start justify-between">
            <div className="flex flex-col gap-2 pt-2">
              {/* breadcrumbs */}
              <OrderBreadCrumbs
                possiblePagesBreadcrumbs={purchaseOrdersBreadCrumbs}
                setIsNegotiation={setIsNegotiation}
                setIsPastInvoices={setIsPastInvoices}
              />
              <div className="flex gap-2">
                <ConditionalRenderingStatus
                  status={orderDetails?.negotiationStatus}
                />
                <ConditionalRenderingStatus
                  status={orderDetails?.metaData?.payment?.status}
                />
              </div>
            </div>

            <Button variant="blue_outline">
              <Share2 size={14} />
              Share Order
            </Button>
          </section>

          {!isPastInvoices && !isNegotiation && (
            <DataTable
              columns={OrderColumns}
              data={orderDetails.orderItems}
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
                    router.push('/purchase-orders');
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
                orderDetails?.buyerEnterpriseId === enterpriseId && (
                  <>
                    {orderDetails?.orderType === 'PURCHASE' && (
                      <span className="rounded-md border border-yellow-500 bg-yellow-50 p-2 font-bold text-yellow-500">
                        Waiting for Response
                      </span>
                    )}

                    {orderDetails?.orderType === 'SALES' && (
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
                orderDetails?.buyerEnterpriseId === enterpriseId && (
                  <>
                    {orderDetails?.orderStatus === 'OFFER_SUBMITTED' && (
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
                    {orderDetails?.orderStatus === 'BID_SUBMITTED' && (
                      <span className="rounded-md border border-yellow-500 bg-yellow-50 p-2 font-bold text-yellow-500">
                        Waiting for Response
                      </span>
                    )}
                  </>
                )}

              {/* DebitNote/Credit Note CTA */}
              {/* !isPastInvoices && status = Invoiced && payment = paid && isRaised == "CreditNote", then show : Credit note raised */}
              {/* {!isPastInvoices &&
                orderDetails?.metaData?.invoice?.status === 'INVOICED' &&
                orderDetails?.metaData?.payment?.status === 'PAID' &&
                orderDetails?.metaData?.creditNoteRaised && (
                  <DebitCreditNotesModal
                    isDebitNoteRaised={false}
                  />
                )} */}

              {/* viewInvoice CTA */}
              {!isPastInvoices &&
                (orderDetails?.metaData?.invoice?.status ===
                  'PARTIAL_INVOICED' ||
                  orderDetails?.metaData?.invoice?.status === 'INVOICED') && (
                  <Button
                    variant="blue_outline"
                    className="w-40 border-yellow-500 bg-yellow-50 text-yellow-500 hover:bg-yellow-500 hover:text-white"
                    onClick={() => setIsPastInvoices(true)}
                  >
                    <Eye size={16} />
                    View Invoices
                  </Button>
                )}
            </section>
          </div>
        </>
      )}
    </Wrapper>
  );
};

export default ViewOrder;
