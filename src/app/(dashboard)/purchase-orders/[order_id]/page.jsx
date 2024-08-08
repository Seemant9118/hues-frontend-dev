'use client';

import { orderApi } from '@/api/order_api/order_api';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { OrderDetails } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import { Eye, MoveLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { usePurchaseOrderColumns } from './usePurchaseOrderColumns';
// dynamic imports
const PastInvoices = dynamic(
  () => import('@/components/invoices/PastInvoices'),
  {
    loading: () => <Loading />,
  },
);

const ViewOrder = () => {
  const router = useRouter();
  const params = useParams();
  const [isPastInvoices, setIsPastInvoices] = useState(false);

  const { isLoading, data: orderDetails } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey],
    queryFn: () => OrderDetails(params.order_id),
    select: (res) => res.data.data,
  });

  const OrderColumns = usePurchaseOrderColumns(
    orderDetails?.buyerEnterpriseId,
    orderDetails?.sellerEnterpriseId,
    orderDetails?.orderType,
  );

  const subHeader = isPastInvoices ? (
    <>
      ORDER ID: #{params.order_id} {' > '}
      <span className="text-blue-400 underline">INVOICES</span>
    </>
  ) : (
    `ORDER ID: #${params.order_id}`
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
        </>
      )}
    </Wrapper>
  );
};

export default ViewOrder;
