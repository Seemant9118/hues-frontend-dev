'use client';

import { orderApi } from '@/api/order_api/order_api';
import EditablePartialInvoiceModal from '@/components/Modals/EditablePartialInvoiceModal';
import PartialInvoiceViewModal from '@/components/Modals/PartialInvoiceViewModal';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { OrderDetails } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSalesOrderColumns } from './useSalesOrderColumns';

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
    select: (data) => data.data.data,
  });

  const OrderColumns = useSalesOrderColumns(
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
              // <InvoicePDFViewModal orderId={params.order_id} />
              <div className="flex gap-2">
                <PartialInvoiceViewModal />
                <EditablePartialInvoiceModal
                  orderItems={orderDetails?.orderItems}
                />
              </div>
            )}
            {/* <Button
              onClick={() => {
                setIsGenerationInvoice(true);
              }}
              variant={'blue_outline'}
              size="sm"
            >
              <FileText size={14} />
              Generate Invoice
            </Button> */}
          </SubHeader>

          {!isPastInvoices && (
            <DataTable
              columns={OrderColumns}
              data={orderDetails?.orderItems}
            ></DataTable>
          )}

          {isPastInvoices && <PastInvoices />}

          <div className="mt-auto h-[1px] bg-neutral-300"></div>

          <div className="flex items-end justify-between">
            {isPastInvoices ? (
              <Button
                variant="outline"
                className="w-32"
                onClick={() => {
                  setIsPastInvoices(false);
                }}
              >
                {' '}
                Back{' '}
              </Button>
            ) : (
              <>
                <Button
                  variant="blue_outline"
                  className="w-40"
                  onClick={() => {
                    setIsPastInvoices(true);
                  }}
                >
                  {' '}
                  View Past Invoices{' '}
                </Button>
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
              </>
            )}
          </div>
        </>
      )}
    </Wrapper>
  );
};

export default ViewOrder;
