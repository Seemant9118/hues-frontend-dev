'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { paymentApi } from '@/api/payments/payment_api';
import { templateApi } from '@/api/templates_api/template_api';
import { formattedAmount } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import CommentBox from '@/components/comments/CommentBox';
import InvoiceOverview from '@/components/invoices/InvoiceOverview';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import MakePaymentNewInvoice from '@/components/payments/MakePaymentNewInvoice';
import { usePaymentColumns } from '@/components/payments/paymentColumns';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { useRouter } from '@/i18n/routing';
import { getDebitNoteByInvoice } from '@/services/Debit_Note_Services/DebitNoteServices';
import { getInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { getPaymentsByInvoiceId } from '@/services/Payment_Services/PaymentServices';
import {
  getDocument,
  viewPdfInNewTab,
} from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { Download, Eye, MoveUpRight } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermissions';
import { useAuth } from '@/context/AuthContext';
import emptyImg from '../../../../../../../../public/Empty.png';
import { useSalesInvoiceColumns } from './useSalesInvoiceColumns';

const ViewInvoice = () => {
  useMetaData('Hues! - Sales Invoice Details', 'HUES INVOICES'); // dynamic title

  const translations = useTranslations('sales.sales-invoices.invoice_details');

  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState('overview');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const invoiceOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.invoices'),
      path: '/dashboard/sales/sales-invoices',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title.invoice_details'),
      path: `/dashboard/sales/sales-invoices/${params.invoiceId}`,
      show: true, // Always show
    },
    {
      id: 3,
      name: translations('title.record_payment'),
      path: `/dashboard/sales/sales-invoices/${params.invoiceId}`,
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
    let newPath = `/dashboard/sales/sales-invoices/${params.invoiceId}`;

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
    enabled: tab === 'overview' && hasPermission('permission:sales-view'),
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

  const onRowClick = (row) => {
    router.push(`/dashboard/sales/sales-payments/${row.paymentId}`);
  };

  if (!permissions || permissions.length === 0) {
    return null; // or <Loading />
  }

  if (!hasPermission('permission:sales-view')) {
    router.replace('/unauthorized');
    return null;
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
              <ProtectedWrapper
                permissionCode={'permission:sales-create-payment'}
              >
                <Button
                  variant="blue_outline"
                  size="sm"
                  onClick={() => setIsRecordingPayment(true)}
                  className="font-bold"
                >
                  {translations('ctas.record_payment')}
                </Button>
              </ProtectedWrapper>
            )}

          {/* share CTA */}
          {/* {!isRecordingPayment && (
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
              content={translations('ctas.share.placeholder')}
            />
          )} */}
          {/* View CTA modal */}
          <ProtectedWrapper permissionCode={'permission:sales-document'}>
            {!isRecordingPayment && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => viewPdfInNewTab(pvtUrl)}
              >
                <Eye size={14} />
              </Button>
            )}

            {/* download CTA */}
            {!isRecordingPayment && (
              <Tooltips
                trigger={
                  <Button
                    size="sm"
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <a download={pdfDoc?.publicUrl} href={pdfDoc?.publicUrl}>
                      <Download size={14} />
                    </a>
                  </Button>
                }
                content={translations('ctas.download.placeholder')}
              />
            )}
          </ProtectedWrapper>
        </div>
      </section>
      {!isRecordingPayment && (
        <Tabs value={tab} onValueChange={onTabChange} defaultValue={'overview'}>
          <TabsList className="border">
            <TabsTrigger value="overview">
              {translations('tabs.label.tab1')}
            </TabsTrigger>
            <TabsTrigger value="payment">
              {translations('tabs.label.tab2')}
            </TabsTrigger>
            <TabsTrigger value="debitNotes">
              {translations('tabs.label.tab3')}
            </TabsTrigger>
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

                <CommentBox contextId={params.invoiceId} context={'INVOICE'} />

                <DataTable data={invoiceItems} columns={invoiceItemsColumns} />
              </div>
            )}
          </TabsContent>
          <TabsContent value="payment">
            {isPaymentsLoading && <Loading />}
            {!isPaymentsLoading && paymentsListing?.length > 0 && (
              <DataTable
                onRowClick={onRowClick}
                data={paymentsListing}
                columns={paymentsColumns}
              />
            )}
            {!isPaymentsLoading && paymentsListing?.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 text-[#939090]">
                <Image src={emptyImg} alt="emptyIcon" />
                <p className="font-bold">
                  {translations('tabs.content.tab2.emtpyStateComponent.title')}
                </p>
                <ProtectedWrapper
                  permissionCode={'permission:sales-create-payment'}
                >
                  <p className="max-w-96 text-center">
                    {translations('tabs.content.tab2.emtpyStateComponent.para')}
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
                        {translations('ctas.record_payment')}
                      </Button>
                    )}
                </ProtectedWrapper>
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
                                  `/dashboard/sales/sales-debitNotes/${debitNote?.id}`,
                                );
                              }}
                              className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[#288AF9] hover:underline"
                            >
                              {translations(
                                'tabs.content.tab3.label.view_debit_notes',
                              )}
                              <MoveUpRight size={12} />
                            </p>
                          </div>

                          <div className="flex gap-10">
                            <h1 className="text-sm">
                              <span className="font-bold text-[#ABB0C1]">
                                {translations('tabs.content.tab3.label.date')}:
                              </span>
                              <span className="text-[#363940]">
                                {moment(debitNote?.createdAt).format(
                                  'DD-MM-YYYY',
                                )}
                              </span>
                            </h1>
                            <h1 className="text-sm">
                              <span className="font-bold text-[#ABB0C1]">
                                {translations(
                                  'tabs.content.tab3.label.total_amount',
                                )}
                                :
                              </span>
                              <span className="font-bold text-[#363940]">
                                {formattedAmount(debitNote?.amount)}
                              </span>
                              <span> (inc. GST)</span>
                            </h1>
                          </div>
                          <div className="flex gap-2">
                            <h1 className="text-sm">
                              <span className="font-bold text-[#ABB0C1]">
                                {translations('tabs.content.tab3.label.reason')}
                                :{' '}
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
                <p className="font-bold">
                  {translations('tabs.content.tab3.emtpyStateComponent.title')}
                </p>
                <p className="max-w-96 text-center">
                  {translations('tabs.content.tab3.emtpyStateComponent.para')}
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
          contextType={'PAYMENT'}
        />
      )}
    </Wrapper>
  );
};

export default ViewInvoice;
