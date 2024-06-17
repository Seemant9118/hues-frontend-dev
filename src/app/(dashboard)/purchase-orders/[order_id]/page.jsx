'use client';

import { orderApi } from '@/api/order_api/order_api';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { OrderDetails } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { usePurchaseOrderColumns } from './usePurchaseOrderColumns';

const ViewOrder = () => {
  const router = useRouter();
  const params = useParams();

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

  return (
    <Wrapper className="relative">
      {isLoading && !orderDetails && <Loading />}
      {!isLoading && orderDetails && (
        <>
          <SubHeader name={`ORDER ID: #${params.order_id}`}></SubHeader>
          <DataTable
            columns={OrderColumns}
            data={orderDetails.orderItems}
          ></DataTable>

          <div className="absolute bottom-0 right-0">
            <div className="flex justify-end">
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
            </div>
          </div>
        </>
      )}
    </Wrapper>
  );
};

export default ViewOrder;
