'use client';

import { orderApi } from '@/api/order_api/order_api';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import NegotiationComponent from '@/components/orders/NegotiationComponent';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, MoveLeft } from 'lucide-react';
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

const ViewOrder = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();

  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const searchParams = useSearchParams();
  const showInvoice = searchParams.get('showInvoice');
  const invoiceId = searchParams.get('invoiceId');

  const [isPastInvoices, setIsPastInvoices] = useState(showInvoice || false);
  const [isNegotiation, setIsNegotiation] = useState(false);

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

  const subHeader = isPastInvoices ? (
    <>
      ORDER ID: #{params.order_id} {' > '}
      <span className="text-blue-400 underline">INVOICES</span>
    </>
  ) : (
    <div className="flex items-center gap-2">
      ORDER ID: #{params.order_id}{' '}
      <ConditionalRenderingStatus status={orderDetails?.negotiationStatus} />
    </div>
  );

  return (
    <Wrapper className="relative">
      {isLoading && !orderDetails && <Loading />}
      {!isLoading && orderDetails && (
        <>
          <SubHeader name={subHeader}>
            {orderDetails.negotiationStatus === 'ACCEPTED' && (
              <div className="flex gap-2">
                {isPastInvoices ? (
                  <Button
                    variant="outline"
                    className="flex w-32 items-center justify-center gap-2"
                    onClick={() => {
                      setIsPastInvoices(false);
                    }}
                  >
                    <MoveLeft size={16} />
                    Back{' '}
                  </Button>
                ) : (
                  <Button
                    variant="blue_outline"
                    className="w-40"
                    onClick={() => {
                      setIsPastInvoices(true);
                    }}
                  >
                    <Eye size={16} />
                    View Invoices{' '}
                  </Button>
                )}
              </div>
            )}
          </SubHeader>

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

          {isPastInvoices && !isNegotiation && (
            <PastInvoices invoiceId={invoiceId} />
          )}

          {!isNegotiation && (
            <div className="mt-auto h-[1px] bg-neutral-300"></div>
          )}

          <div className="flex justify-between">
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
                      {/* <BulkNegotiateModal orderDetails={orderDetails} /> */}
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
          </div>
        </>
      )}
    </Wrapper>
  );
};

export default ViewOrder;
