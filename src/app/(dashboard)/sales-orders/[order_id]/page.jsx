'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { orderApi } from '@/api/order_api/order_api';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FilePlus } from 'lucide-react';
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

const ViewOrder = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const searchParams = useSearchParams();
  const showInvoice = searchParams.get('showInvoice');

  const [isPastInvoices, setIsPastInvoices] = useState(showInvoice || false);
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [isGenerateInvoice, setIsGenerateInvoice] = useState(false);

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
      name: 'Invoices',
      path: `/sales-orders/${params.order_id}`,
      show: isPastInvoices, // Show only if isPastInvoices is true
    },
    {
      name: 'New Invoice',
      path: `/sales-orders/${params.order_id}/?state=showInvoice`,
      show: isGenerateInvoice, // Show only if isGenerateInvoice is true
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');
    setIsNegotiation(state === 'negotiation');
    setIsPastInvoices(state === 'showInvoice');
    // setIsGenerateInvoice(state === 'newInvoice');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/sales-orders/${params.order_id}`;

    if (isNegotiation) {
      newPath += '?state=negotiation';
    } else if (isPastInvoices) {
      newPath += '?state=showInvoice';
      if (isGenerateInvoice) {
        newPath += '&state=newInvoice';
      }
    }

    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [
    isNegotiation,
    isPastInvoices,
    isGenerateInvoice,
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

  const OrderColumns = useSalesOrderColumns(orderDetails?.negotiationStatus);

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
          <section className="flex items-center justify-between">
            <div className="flex flex-col gap-2 pt-2">
              {/* breadcrumbs */}
              <OrderBreadCrumbs
                possiblePagesBreadcrumbs={salesOrdersBreadCrumbs}
                setIsNegotiation={setIsNegotiation}
                setIsPastInvoices={setIsPastInvoices}
                setIsGenerateInvoice={setIsGenerateInvoice}
              />
            </div>
            <div className="flex gap-2">
              {!isPastInvoices &&
                !isNegotiation &&
                (orderDetails?.negotiationStatus === 'NEW' ||
                  orderDetails?.negotiationStatus === 'ACCEPTED' ||
                  orderDetails?.negotiationStatus === 'INVOICED') && (
                  <Button
                    variant="blue_outline"
                    size="sm"
                    className="w-20 cursor-not-allowed font-bold"
                  >
                    Payment
                  </Button>
                )}
              {!isPastInvoices &&
                !isNegotiation &&
                (orderDetails?.negotiationStatus === 'NEW' ||
                  orderDetails?.negotiationStatus === 'ACCEPTED' ||
                  orderDetails?.negotiationStatus === 'INVOICED') && (
                  <Button
                    variant="blue_outline"
                    size="sm"
                    className="w-20 font-bold"
                    onClick={() => setIsPastInvoices(true)}
                  >
                    Invoice
                  </Button>
                )}

              {/* generateInvoice CTA */}
              {isPastInvoices &&
                !isGenerateInvoice &&
                !orderDetails?.invoiceGenerationCompleted &&
                (orderDetails.negotiationStatus === 'ACCEPTED' ||
                  (orderDetails.negotiationStatus === 'NEW' &&
                    orderDetails?.orderType === 'SALES')) && (
                  <Button
                    onClick={() => setIsGenerateInvoice(true)}
                    className="bg-[#288AF9] font-bold"
                  >
                    <FilePlus size={14} />
                    New Invoice
                  </Button>
                )}

              {/* <Button variant="blue_outline">
              <Share2 size={14} />
              Share Order
            </Button> */}
            </div>
          </section>

          {/* orders overview */}
          {!isPastInvoices && !isGenerateInvoice && !isNegotiation && (
            <OrdersOverview
              orderId={params.order_id}
              multiStatus={multiStatus}
              Name={clientName}
              totalAmount={orderDetails?.amount}
            />
          )}

          {/* orderDetail Table */}
          {!isPastInvoices && !isNegotiation && (
            <DataTable
              columns={OrderColumns}
              data={orderDetails?.orderItems}
            ></DataTable>
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
          {isPastInvoices && !isNegotiation && (
            <PastInvoices
              isGenerateInvoice={isGenerateInvoice}
              setIsGenerateInvoice={setIsGenerateInvoice}
              setIsPastInvoices={setIsPastInvoices}
              orderDetails={orderDetails}
            />
          )}

          {/* seprator */}
          {!isNegotiation && !isPastInvoices && !isGenerateInvoice && (
            <div className="mt-auto h-[1px] bg-neutral-300"></div>
          )}

          <div className="flex justify-end">
            {/* <section>
              {!isNegotiation && !isPastInvoices && (
                <Button
                  variant="outline"
                  className="w-32"
                  onClick={() => {
                    router.back();
                  }}
                >
                  {' '}
                  Close{' '}
                </Button>
              )}
            </section> */}

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

              {/* CollectPayment CTA */}
              {/* !PastInvoices && status = Invoiced && payment != paid then show : collect payement modal */}
              {/* {!isPastInvoices && orderDetails?.metaData?.invoice?.status === 'INVOICED' &&
                orderDetails?.metaData?.payment?.status === 'NOT_PAID' && <CollectPaymentModal />} */}

              {/* DebitNote/Credit Note CTA */}
              {/* !isPastInvoices && status = Invoiced && payment = paid && isRaised == "DebitNote", then show : debit note raised */}
              {/* {!isPastInvoices &&
                orderDetails?.metaData?.invoice?.status === 'INVOICED' &&
                orderDetails?.metaData?.payment?.status === 'PAID' &&
                orderDetails?.metaData?.debitNoteRaised && (
                  <DebitCreditNotesModal
                    isDebitNoteRaised={orderDetails?.metaData?.debitNoteRaised}
                  />
                )} */}

              {/* viewInvoice CTA */}
              {/* {!isPastInvoices &&
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
                )} */}

              {/* generateInvoice CTA */}
              {/* {!isPastInvoices &&
                !orderDetails?.invoiceGenerationCompleted &&
                (orderDetails.negotiationStatus === 'ACCEPTED' ||
                  (orderDetails.negotiationStatus === 'NEW' &&
                    orderDetails?.orderType === 'SALES')) && (
                  <EditablePartialInvoiceModal
                    orderDetails={orderDetails}
                    setIsPastInvoices={setIsPastInvoices}
                  />
                )} */}
            </section>
          </div>
        </>
      )}
    </Wrapper>
  );
};

export default ViewOrder;
