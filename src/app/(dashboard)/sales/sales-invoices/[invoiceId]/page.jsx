'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { paymentApi } from '@/api/payments/payment_api';
import { templateApi } from '@/api/templates_api/template_api';
import { formattedAmount } from '@/appUtils/helperFunctions';
import InvoicePDFViewModal from '@/components/Modals/InvoicePDFViewModal';
import Tooltips from '@/components/auth/Tooltips';
import InvoiceOverview from '@/components/invoices/InvoiceOverview';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import MakePaymentNewInvoice from '@/components/payments/MakePaymentNewInvoice';
import { usePaymentColumns } from '@/components/payments/paymentColumns';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { getDebitNoteByInvoice } from '@/services/Debit_Note_Services/DebitNoteServices';
import { getInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { getPaymentsByInvoiceId } from '@/services/Payment_Services/PaymentServices';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { Download, MoveUpRight, Share2 } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import emptyImg from '../../../../../../public/Empty.png';
import { useSalesInvoiceColumns } from './useSalesInvoiceColumns';

const ViewInvoice = () => {
  useMetaData('Hues! - Sales Invoice Details', 'HUES INVOICES'); // dynamic title
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState('overview');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const invoiceOrdersBreadCrumbs = [
    {
      id: 1,
      name: 'Invoices',
      path: '/sales/sales-invoices',
      show: true, // Always show
    },
    {
      id: 2,
      name: `Invoice details`,
      path: `/sales/sales-invoices/${params.invoiceId}`,
      show: true, // Always show
    },
    {
      id: 3,
      name: 'Record Payment',
      path: `/sales/sales-invoices/${params.invoiceId}`,
      show: isRecordingPayment, // Show only if isGenerateInvoice is true
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');

    setIsRecordingPayment(state === 'recordPayment');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/sales/sales-invoices/${params.invoiceId}`;

    if (isRecordingPayment) {
      newPath += '?state=recordPayment';
    } else {
      newPath += '';
    }

    router.push(newPath);
  }, [params.invoiceId, isRecordingPayment, router]);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  // fetch invoice details
  const { isLoading, data: invoiceDetails } = useQuery({
    queryKey: [invoiceApi.getInvoice.endpointKey, params.invoiceId],
    queryFn: () => getInvoice(params.invoiceId),
    select: (data) => data.data.data,
    enabled: tab === 'overview',
  });

  // conversion pvt url to public url to download
  const pvtUrl = invoiceDetails?.invoiceDetails?.attachmentLink;
  // Fetch the PDF document using react-query
  const { data: pdfDoc } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, pvtUrl],
    queryFn: () => getDocument(pvtUrl),
    enabled: !!pvtUrl, // Only fetch if pvtUrl is available
    select: (res) => res.data.data,
  });

  // invoice items details
  const invoiceItems = invoiceDetails?.invoiceItemDetails?.map((invoice) => ({
    productName:
      invoice?.orderItemId?.productDetails?.productName ||
      invoice?.orderItemId?.productDetails?.serviceName,
    quantity: invoice?.quantity,
    unitPrice: invoice?.unitPrice,
    totalAmount: invoice?.totalAmount,
  }));

  // fetch payment details
  const { isLoading: isPaymentsLoading, data: paymentsListing } = useQuery({
    queryKey: [paymentApi.getPaymentsByInvoiceId.endpointKey, params.invoiceId],
    queryFn: () => getPaymentsByInvoiceId(params.invoiceId),
    select: (data) => data.data.data,
    enabled: tab === 'payment',
  });

  // fetch debitNotes of invoice
  const { isLoading: isDebitNoteLoading, data: debitNotes } = useQuery({
    queryKey: [
      DebitNoteApi.getDebitNoteByInvoiceId.endpointKey,
      params.invoiceId,
    ],
    queryFn: () => getDebitNoteByInvoice(params.invoiceId),
    select: (data) => data.data.data,
    enabled: tab === 'debitNotes',
  });

  const paymentStatus = ConditionalRenderingStatus({
    status: invoiceDetails?.invoiceDetails?.invoiceMetaData?.payment?.status,
  });
  const debitNoteStatus = ConditionalRenderingStatus({
    status: invoiceDetails?.invoiceDetails?.invoiceMetaData?.debitNote?.status,
  });

  const paymentsColumns = usePaymentColumns();
  const invoiceItemsColumns = useSalesInvoiceColumns();

  // fn for capitalization
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <Wrapper className="h-full py-2">
      {/* headers */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <div className="flex gap-2 pt-2">
          {/* breadcrumbs */}
          <OrderBreadCrumbs
            possiblePagesBreadcrumbs={invoiceOrdersBreadCrumbs}
          />
        </div>
        <div className="flex gap-2">
          {!isRecordingPayment &&
            (invoiceDetails?.invoiceDetails?.invoiceMetaData?.payment
              ?.status === 'NOT_PAID' ||
              invoiceDetails?.invoiceDetails?.invoiceMetaData?.payment
                ?.status === 'PARTIAL_PAID') && (
              <Button
                variant="blue_outline"
                size="sm"
                onClick={() => setIsRecordingPayment(true)}
                className="font-bold"
              >
                Record Payment
              </Button>
            )}

          {/* share CTA */}
          {!isRecordingPayment && (
            <Tooltips
              trigger={
                <Button
                  disabled
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center"
                >
                  <Share2 size={14} />
                </Button>
              }
              content={'Share feature coming soon...'}
            />
          )}
          {/* View CTA modal */}
          {!isRecordingPayment && <InvoicePDFViewModal Url={pvtUrl} />}

          {/* download CTA */}
          {!isRecordingPayment && (
            <Tooltips
              trigger={
                <Button size="sm" asChild variant="outline" className="w-full">
                  <a download={pdfDoc?.publicUrl} href={pdfDoc?.publicUrl}>
                    <Download size={14} />
                  </a>
                </Button>
              }
              content={'Download the invoice PDF'}
            />
          )}
        </div>
      </section>
      {!isRecordingPayment && (
        <Tabs value={tab} onValueChange={onTabChange} defaultValue={'overview'}>
          <TabsList className="border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payment">Payment Receipts</TabsTrigger>
            <TabsTrigger value="debitNotes">Debit Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            {isLoading && <Loading />}
            {/* orders overview */}
            {!isLoading && invoiceDetails?.invoiceDetails && (
              <div className="flex flex-col gap-4">
                <InvoiceOverview
                  isCollapsableOverview={false}
                  invoiceDetails={invoiceDetails.invoiceDetails}
                  invoiceId={
                    invoiceDetails?.invoiceDetails?.invoiceReferenceNumber
                  }
                  orderId={invoiceDetails?.invoiceDetails?.orderId}
                  orderRefId={
                    invoiceDetails?.invoiceDetails?.orderReferenceNumber
                  }
                  paymentStatus={paymentStatus}
                  debitNoteStatus={debitNoteStatus}
                  Name={`${invoiceDetails?.invoiceDetails?.customerName} (${invoiceDetails?.invoiceDetails?.clientType})`}
                  type={invoiceDetails?.invoiceDetails?.invoiceType}
                  date={invoiceDetails?.invoiceDetails?.createdAt}
                  amount={invoiceDetails?.invoiceDetails?.totalAmount}
                  amountPaid={invoiceDetails?.invoiceDetails?.amountPaid}
                />

                <DataTable data={invoiceItems} columns={invoiceItemsColumns} />
              </div>
            )}
          </TabsContent>
          <TabsContent value="payment">
            {isPaymentsLoading && <Loading />}
            {!isPaymentsLoading && paymentsListing?.length > 0 && (
              <DataTable data={paymentsListing} columns={paymentsColumns} />
            )}
            {!isPaymentsLoading && paymentsListing?.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 text-[#939090]">
                <Image src={emptyImg} alt="emptyIcon" />
                <p className="font-bold">No payments yet</p>
                <p className="max-w-96 text-center">
                  {
                    "You haven't created any payments yet. Start by generating your first payment to keep track of your transactions"
                  }
                </p>
                {!isRecordingPayment &&
                  (invoiceDetails?.invoiceDetails?.invoiceMetaData?.payment
                    ?.status === 'NOT_PAID' ||
                    invoiceDetails?.invoiceDetails?.invoiceMetaData?.payment
                      ?.status === 'PARTIAL_PAID') && (
                    <Button
                      variant="blue_outline"
                      size="sm"
                      onClick={() => setIsRecordingPayment(true)}
                      className="font-bold"
                    >
                      Record Payment
                    </Button>
                  )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="debitNotes">
            <div className="scrollBarStyles flex max-h-[55vh] flex-col gap-4 overflow-auto">
              {isDebitNoteLoading && <Loading />}
              {!isDebitNoteLoading &&
                debitNotes?.length > 0 &&
                debitNotes?.map((debitNote) => {
                  return (
                    <div
                      key={debitNote?.id}
                      className="flex flex-col gap-2 rounded-lg border bg-white p-4 shadow-customShadow"
                    >
                      <section className="flex items-center justify-between">
                        <div className="flex w-full flex-col gap-4">
                          <div className="flex justify-between">
                            <h1 className="flex items-center gap-4">
                              <span className="text-sm font-bold">
                                {debitNote?.referenceNumber}
                              </span>
                              <span className="rounded border border-[#EDEEF2] bg-[#F6F7F9] p-1.5 text-xs">
                                {capitalize(debitNote?.status)}
                              </span>
                            </h1>

                            <p
                              onClick={() => {
                                router.push(
                                  `/sales/sales-debitNotes/${debitNote?.id}`,
                                );
                              }}
                              className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[#288AF9] hover:underline"
                            >
                              View Debit Note <MoveUpRight size={12} />
                            </p>
                          </div>

                          <div className="flex gap-10">
                            <h1 className="text-sm">
                              <span className="font-bold text-[#ABB0C1]">
                                Date :{' '}
                              </span>
                              <span className="text-[#363940]">
                                {moment(debitNote?.createdAt).format(
                                  'DD-MM-YYYY',
                                )}
                              </span>
                            </h1>
                            <h1 className="text-sm">
                              <span className="font-bold text-[#ABB0C1]">
                                Total Amount :{' '}
                              </span>
                              <span className="font-bold text-[#363940]">
                                {formattedAmount(debitNote?.amount)}
                              </span>
                              <span> (inc. GST)</span>
                            </h1>
                            <h1 className="text-sm font-bold">
                              <span className="font-bold text-[#ABB0C1]">
                                Type :{' '}
                              </span>
                              <span className="font-bold text-[#363940]">
                                {capitalize('ss')}
                              </span>
                            </h1>
                          </div>
                          <div className="flex gap-2">
                            <h1 className="text-sm">
                              <span className="font-bold text-[#ABB0C1]">
                                Reason :{' '}
                              </span>
                              <span className="font-bold text-[#363940]">
                                {debitNote?.remark}
                              </span>
                            </h1>
                          </div>
                        </div>
                      </section>
                    </div>
                  );
                })}
            </div>
            {!isDebitNoteLoading && debitNotes?.length === 0 && (
              <div className="flex h-[55vh] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                <Image src={emptyImg} alt="emptyIcon" />
                <p className="font-bold">No debit notes raised yet</p>
                <p className="max-w-96 text-center">
                  {"You haven't any debit notes yet. "}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* recordPayment component */}
      {isRecordingPayment && (
        <MakePaymentNewInvoice
          paymentStatus={paymentStatus}
          debitNoteStatus={debitNoteStatus}
          invoiceDetails={invoiceDetails?.invoiceDetails}
          setIsRecordingPayment={setIsRecordingPayment}
        />
      )}
    </Wrapper>
  );
};

export default ViewInvoice;
