'use client';

import { orderApi } from '@/api/order_api/order_api';
import BulkNegotiateModal from '@/components/Modals/BulkNegotiateModal';
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
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
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
  const [isPastInvoices, setIsPastInvoices] = useState(false);

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
  const ConditionalRenderingStatus = ({ status }) => {
    let statusText;
    let statusColor;
    let statusBG;
    let statusBorder;

    switch (status) {
      case 'ACCEPTED':
        statusText = 'ACCEPTED';
        statusColor = '#39C06F';
        statusBG = '#39C06F1A';
        statusBorder = '#39C06F';
        break;
      case 'NEW':
        statusText = 'NEW';
        statusColor = '#1863B7';
        statusBG = '#1863B71A';
        statusBorder = '#1863B7';
        break;
      case 'NEGOTIATION':
        statusText = 'NEGOTIATION';
        statusColor = '#F8BA05';
        statusBG = '#F8BA051A';
        statusBorder = '#F8BA05';
        break;
      default:
        return null;
    }

    return (
      <div
        className="flex max-w-fit items-center justify-center gap-1 rounded border px-1.5 py-2 text-sm font-bold"
        style={{
          color: statusColor,
          backgroundColor: statusBG,
          borderColor: statusBorder,
        }}
      >
        {statusText}
      </div>
    );
  };

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

          {!isPastInvoices && (
            <DataTable
              columns={OrderColumns}
              data={orderDetails.orderItems}
            ></DataTable>
          )}

          {isPastInvoices && <PastInvoices />}

          <div className="mt-auto h-[1px] bg-neutral-300"></div>

          <div className="flex justify-between">
            {!isPastInvoices && (
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
                    <div className="flex gap-2">
                      <BulkNegotiateModal orderDetails={orderDetails} />
                      <Button
                        className="w-32 bg-[#39C06F] text-white hover:bg-[#39C06F1A] hover:text-[#39C06F]"
                        onClick={handleAccept}
                      >
                        Accept
                      </Button>
                    </div>
                  )}
                </>
              )}

            {/* status NEGOTIATION */}
            {!isPastInvoices &&
              orderDetails?.negotiationStatus === 'NEGOTIATION' &&
              orderDetails?.buyerEnterpriseId === enterpriseId && (
                <>
                  {orderDetails?.orderItems?.[0]?.negotiation?.status ===
                    'OFFER_SUBMITTED' && (
                    <div className="flex gap-2">
                      <BulkNegotiateModal orderDetails={orderDetails} />
                      <Button
                        className="w-32 bg-[#39C06F] text-white hover:bg-[#39C06F1A] hover:text-[#39C06F]"
                        onClick={handleAccept}
                      >
                        Accept
                      </Button>
                    </div>
                  )}
                  {orderDetails?.orderItems?.[0]?.negotiation?.status ===
                    'BID_SUBMITTED' && (
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
