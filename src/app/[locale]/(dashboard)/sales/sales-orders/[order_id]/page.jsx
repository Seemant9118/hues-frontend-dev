'use client';

import { invitation } from '@/api/invitation/Invitation';
import { orderApi } from '@/api/order_api/order_api';
import Tooltips from '@/components/auth/Tooltips';
import CommentBox from '@/components/comments/CommentBox';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import EditOrder from '@/components/orders/EditOrder';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import PaymentDetails from '@/components/payments/PaymentDetails';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService } from '@/lib/utils';
import { getInvitationStatus } from '@/services/Invitation_Service/Invitation_Service';
import {
  bulkNegotiateAcceptOrReject,
  OrderDetails,
  viewOrderinNewTab,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, MoreVertical, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
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
  useMetaData('Hues! - Sales Order Details', 'HUES SALES'); // dynamic title

  const translations = useTranslations('sales.sales-orders.order_details');

  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const searchParams = useSearchParams();
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [isGenerateInvoice, setIsGenerateInvoice] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  // const [isUploadingAttachements, setIsUploadingAttachements] = useState(false);
  const [tab, setTab] = useState('overview');
  // const [files, setFiles] = useState([]);

  const onTabChange = (value) => {
    setTab(value);
  };

  const salesOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.sales'),
      path: '/sales/sales-orders',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title.order_details'),
      path: `/sales/sales-orders/${params.order_id}`,
      show: true, // Always show
    },
    {
      id: 3,
      name: translations('title.negotiation'),
      path: `/sales/sales-orders/${params.order_id}`,
      show: isNegotiation, // Show only if isNegotiation is true
    },
    {
      id: 4,
      name: translations('title.generate_invoice'),
      path: `/sales/sales-orders/${params.order_id}`,
      show: isGenerateInvoice, // Show only if isGenerateInvoice is true
    },
    {
      id: 5,
      name: translations('title.record_payment'),
      path: `/sales/sales-orders/${params.order_id}`,
      show: isRecordingPayment, // Show only if isGenerateInvoice is true
    },
    // {
    //   id: 6,
    //   name: translations('title.upload_attachements'),
    //   path: `/sales/sales-orders/${params.order_id}`,
    //   show: isUploadingAttachements, // Show only if isUploadingAttachements is true
    // },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');
    setIsNegotiation(state === 'negotiation');
    setIsGenerateInvoice(state === 'generateInvoice');
    setIsRecordingPayment(state === 'recordPayment');
    // setIsUploadingAttachements(state === 'uploadingAttachements');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/sales/sales-orders/${params.order_id}`;

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

  // api calling for orderDEtails
  const { isLoading, data: orderDetails } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey],
    queryFn: () => OrderDetails(params.order_id),
    select: (data) => data.data.data,
  });

  const { data: invitationData } = useQuery({
    queryKey: [
      invitation.getInvitationStatus.endpointKey,
      orderDetails?.buyerId,
    ],
    queryFn: () => getInvitationStatus({ buyerId: orderDetails?.buyerId }),
    select: (data) => data.data.data,
    enabled: orderDetails?.buyerType === 'UNINVITED-ENTERPRISE',
    refetchOnWindowFocus: false,
  });

  // accept mutation
  const acceptMutation = useMutation({
    mutationKey: orderApi.bulkNegotiateAcceptOrReject.endpointKey,
    mutationFn: bulkNegotiateAcceptOrReject,
    onSuccess: () => {
      toast.success(translations('successMsg.order_accepted'));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate({
      orderId: Number(params.order_id),
      status: 'ACCEPTED',
    });
  };

  // [ATTACHMENTS]
  // handle upload proofs fn
  // const handleAttached = async (file) => {
  //   setFiles((prevFiles) => [...prevFiles, file]);
  //   toast.success('File attached successfully!');
  // };
  // const handleFileRemove = (file) => {
  //   setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
  // };

  // const createAttachments = useMutation({
  //   mutationKey: [attachementsAPI.createAttachement.endpointKey],
  //   mutationFn: createAttachements,
  //   onSuccess: () => {
  //     toast.success('Attachements Upload Successfully');
  //     queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
  //     setFiles([]);
  //   },
  //   onError: (error) => {
  //     toast.error(error.response.data.message || 'Something Went Wrong');
  //   },
  // });

  // const uploadAttachements = () => {
  //   if (files?.length === 0) {
  //     toast.error('Please select atleast one file to upload');
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append('contextType', 'ORDER'); // assuming fixed or dynamic context
  //   formData.append('contextId', params.order_id); // use actual ID here

  //   // handle files if any
  //   if (files.length > 0) {
  //     files.forEach((file) => {
  //       formData.append('files', file);
  //     });
  //   }

  //   createAttachments.mutate(formData);
  // };

  const OrderColumns = useSalesOrderColumns(orderDetails?.negotiationStatus);

  // multiStatus components
  const sellerStatus =
    orderDetails?.negotiationStatus === 'WITHDRAWN'
      ? 'WITHDRAWN'
      : orderDetails?.metaData?.sellerData?.orderStatus;

  const multiStatus = (
    <div className="flex gap-2">
      <ConditionalRenderingStatus status={sellerStatus} />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.payment?.status}
      />
    </div>
  );

  return (
    <Wrapper className="h-full py-2">
      {isLoading && !orderDetails && <Loading />}

      {/* editOrder Component */}
      {isEditingOrder && (
        <EditOrder
          type="sales"
          name="Edit"
          cta="offer"
          isOrder="order"
          orderId={params.order_id}
          onCancel={() => setIsEditingOrder(false)}
        />
      )}

      {!isEditingOrder && !isLoading && orderDetails && (
        <>
          {/* headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex gap-2">
              {/* breadcrumbs */}
              <OrderBreadCrumbs
                possiblePagesBreadcrumbs={salesOrdersBreadCrumbs}
                setIsNegotiation={setIsNegotiation}
                setIsGenerateInvoice={setIsGenerateInvoice}
              />
            </div>
            <div className="flex gap-2">
              {/* upload attachments */}
              {/* {!isUploadingAttachements &&
                !isNegotiation &&
                !isGenerateInvoice &&
                !isRecordingPayment && (
                  <Button
                    variant="blue_outline"
                    size="sm"
                    onClick={() => setIsUploadingAttachements(true)}
                    className="font-bold"
                  >
                    {translations('ctas.upload_attachements')}
                  </Button>
                )} */}

              {/* record payment CTA */}
              {!isGenerateInvoice &&
                !isRecordingPayment &&
                (orderDetails.negotiationStatus === 'INVOICED' ||
                  orderDetails?.negotiationStatus === 'PARTIAL_INVOICED') &&
                orderDetails?.metaData?.payment?.status !== 'PAID' && (
                  <Button
                    variant="blue_outline"
                    size="sm"
                    onClick={() => setIsRecordingPayment(true)}
                    className="font-bold"
                  >
                    {translations('ctas.record_payment')}
                  </Button>
                )}
              {/* generateInvoice CTA */}
              {!isGenerateInvoice &&
                !isRecordingPayment &&
                !orderDetails?.invoiceGenerationCompleted &&
                (orderDetails?.negotiationStatus === 'ACCEPTED' ||
                  orderDetails?.negotiationStatus === 'PARTIAL_INVOICED' ||
                  (orderDetails.negotiationStatus === 'NEW' &&
                    orderDetails?.orderType === 'SALES')) && (
                  <Button
                    variant="blue_outline"
                    size="sm"
                    onClick={() => setIsGenerateInvoice(true)}
                    className="font-bold"
                  >
                    {translations('ctas.generate_invoice')}
                  </Button>
                )}

              {/* download CTA */}
              {!isGenerateInvoice &&
                !isRecordingPayment &&
                !isNegotiation &&
                orderDetails?.negotiationStatus !== 'WITHDRAWN' && (
                  <Tooltips
                    trigger={
                      <Button
                        onClick={() => viewOrderinNewTab(params.order_id)}
                        size="sm"
                        variant="outline"
                        className="font-bold"
                      >
                        <Eye size={14} />
                      </Button>
                    }
                    content={translations('ctas.view.placeholder')}
                  />
                )}

              {/* share CTA */}
              {/* {!isUploadingAttachements && !isGenerateInvoice &&
                !isRecordingPayment &&
                !isNegotiation &&
                orderDetails?.negotiationStatus !== 'WITHDRAWN' && (
                  <ShareOrderInvoice
                    heading={'Share Order Details'}
                    queryKey={orderApi.shareOrder.endpointKey}
                    queryFn={shareOrder}
                  />
                )} */}

              {/* more ctas */}
              {!isGenerateInvoice &&
                !isRecordingPayment &&
                !isNegotiation &&
                orderDetails.negotiationStatus === 'NEW' &&
                userId.toString() === orderDetails.createdBy.toString() && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Tooltips
                        trigger={
                          <Button
                            variant="blue_outline"
                            size="sm"
                            className="flex items-center justify-center border border-[#DCDCDC] text-black"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                        content={translations('ctas.more.placeholder')}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-w-fit">
                      <span
                        onClick={() => setIsEditingOrder(true)}
                        className="flex items-center justify-center gap-2 rounded-sm p-1 text-sm hover:cursor-pointer hover:bg-gray-300"
                      >
                        <Pencil size={14} /> {translations('ctas.more.edit')}
                      </span>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
            </div>
          </section>

          {/* switch tabs */}
          {!isGenerateInvoice && !isNegotiation && !isRecordingPayment && (
            <section>
              <Tabs
                value={tab}
                onValueChange={onTabChange}
                defaultValue={'overview'}
              >
                <section className="sticky top-12 bg-white py-2">
                  <TabsList className="border">
                    <TabsTrigger
                      className={`w-24 ${tab === 'overview' ? 'shadow-customShadow' : ''}`}
                      value="overview"
                    >
                      {translations('tabs.label.tab1')}
                    </TabsTrigger>
                    <TabsTrigger
                      className={`w-24 ${tab === 'invoices' ? 'shadow-customShadow' : ''}`}
                      value="invoices"
                    >
                      {translations('tabs.label.tab2')}
                    </TabsTrigger>
                    <TabsTrigger
                      className={`${tab === 'payment' ? 'shadow-customShadow' : ''}`}
                      value="payment"
                    >
                      {translations('tabs.label.tab3')}
                    </TabsTrigger>
                    <TabsTrigger
                      className={`w-24 ${tab === 'timeline' ? 'shadow-customShadow' : ''}`}
                      value="timeline"
                    >
                      {translations('tabs.label.tab4')}
                    </TabsTrigger>
                  </TabsList>
                </section>

                <TabsContent value="overview" className="flex flex-col gap-4">
                  {/* orders overview */}
                  <OrdersOverview
                    isCollapsableOverview={false}
                    orderDetails={orderDetails}
                    orderId={orderDetails?.referenceNumber}
                    multiStatus={multiStatus}
                    Name={`${orderDetails?.clientName} (${orderDetails?.clientType})`}
                    mobileNumber={orderDetails?.mobileNumber}
                    amtPaid={orderDetails?.amountPaid}
                    totalAmount={orderDetails.amount + orderDetails.gstAmount}
                    invitationData={invitationData}
                  />

                  <CommentBox contextId={params.order_id} context={'ORDER'} />

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
                  {translations('tabs.content.tab4.coming_soon')}
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
              contextType="PAYMENT"
            />
          )}

          {/* upload attachements */}
          {/* {!isGenerateInvoice && !isNegotiation && !isRecordingPayment && (
            <div className="mt-4 flex h-full flex-col justify-between gap-4">
              <div>
                <FileUploader
                  handleChange={handleAttached}
                  name="file"
                  types={['png', 'pdf']}
                >
                  <div className="mb-2 flex min-w-[700px] cursor-pointer items-center justify-between gap-3 rounded border-2 border-dashed border-[#288AF9] px-5 py-10">
                    <div className="flex items-center gap-4">
                      <UploadCloud className="text-[#288AF9]" size={40} />
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium text-darkText">
                          {translations('fileUploader.instruction')}
                        </p>
                        <p className="text-xs font-normal text-[#288AF9]">
                          {translations('fileUploader.note')}
                        </p>
                      </div>
                    </div>
                    <Button variant="blue_outline">
                      <Upload />
                      {translations('fileUploader.buttons.select')}
                    </Button>
                  </div>
                </FileUploader>
                {files?.length > 0 && (
                  <span className="mt-2 w-full text-sm font-semibold">
                    {translations('fileUploader.attachedFilesLabel')}
                  </span>
                )}
                <div className="mt-4 flex flex-wrap gap-4">
                  {files?.map((file) => (
                    <div
                      key={file.name}
                      className="relative flex w-64 flex-col gap-2 rounded-xl border border-neutral-300 bg-white p-4 shadow-sm"
                    >
                      
                      <X
                        size={16}
                        onClick={() => handleFileRemove(file)}
                        className="absolute right-2 top-2 cursor-pointer text-neutral-500 hover:text-red-500"
                      />

                     
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                        {file.name.split('.').pop() === 'pdf' ? (
                          <FileText size={16} className="text-red-600" />
                        ) : (
                          // eslint-disable-next-line jsx-a11y/alt-text
                          <Image size={16} className="text-primary" />
                        )}
                      </div>

                     
                      <p className="truncate text-sm font-medium text-neutral-800">
                        {file.name}
                      </p>

                     
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/10 p-1.5 text-green-600">
                          <Check size={12} />
                        </div>
                        <p className="text-xs font-medium text-green-600">
                          {translations('fileUploader.fileAttachedMessage')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div> 

              <div className="flex items-end justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFiles([]);
                  }}
                >
                  {translations('fileUploader.buttons.cancel')}
                </Button>
                <Button
                  size="sm"
                  onClick={uploadAttachements}
                  disabled={createAttachments?.isPending}
                >
                  {createAttachments?.isPending ? (
                    <Loading />
                  ) : (
                    translations('fileUploader.buttons.upload')
                  )}
                </Button>
              </div>
            </div>
          )} */}

          {/* footer ctas */}
          {!isGenerateInvoice && !isNegotiation && !isRecordingPayment && (
            <div className="sticky bottom-0 z-10 flex justify-end bg-white">
              <section className="flex gap-2">
                {/* status NEW */}
                {tab === 'overview' &&
                  !isGenerateInvoice &&
                  !isRecordingPayment &&
                  orderDetails?.negotiationStatus === 'NEW' &&
                  orderDetails?.sellerEnterpriseId === enterpriseId && (
                    <>
                      {/* {orderDetails?.orderType === 'SALES' && (
                        <span className="flex items-center gap-1 rounded-sm border border-[#A5ABBD24] bg-[#F5F6F8] px-4 py-2 text-sm font-semibold">
                          <Clock size={12} />
                          {translations('ctas.footer_ctas.wait_response')}
                        </span>
                      )} */}

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
                                {translations('ctas.footer_ctas.negotiate')}
                              </Button>
                              <Button
                                size="sm"
                                className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                                onClick={handleAccept}
                                disabled={acceptMutation.isPending}
                              >
                                {acceptMutation.isPending ? (
                                  <Loading size={14} />
                                ) : (
                                  translations('ctas.footer_ctas.accept')
                                )}
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
                                {translations('ctas.footer_ctas.negotiate')}
                              </Button>
                              <Button
                                size="sm"
                                className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                                onClick={handleAccept}
                              >
                                {translations('ctas.footer_ctas.accept')}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      {/* {orderDetails?.orderStatus === 'OFFER_SUBMITTED' && (
                        <span className="flex items-center gap-1 rounded-sm border border-[#A5ABBD24] bg-[#F5F6F8] px-4 py-2 text-sm font-semibold">
                          <Clock size={12} />{' '}
                          {translations('ctas.footer_ctas.wait_response')}
                        </span>
                      )} */}
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
