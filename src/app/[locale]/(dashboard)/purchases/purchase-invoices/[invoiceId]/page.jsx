'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { paymentApi } from '@/api/payments/payment_api';
import { templateApi } from '@/api/templates_api/template_api';
import { formattedAmount } from '@/appUtils/helperFunctions';
import InvoicePDFViewModal from '@/components/Modals/InvoicePDFViewModal';
import RaisedDebitNoteModal from '@/components/Modals/RaisedDebitNoteModal';
import Tooltips from '@/components/auth/Tooltips';
import InvoiceOverview from '@/components/invoices/InvoiceOverview';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { usePaymentColumns } from '@/components/payments/paymentColumns';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { useRouter } from '@/i18n/routing';
import { getDebitNoteByInvoice } from '@/services/Debit_Note_Services/DebitNoteServices';
import { getInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { getPaymentsByInvoiceId } from '@/services/Payment_Services/PaymentServices';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { Download, MoveUpRight, Share2 } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import emptyImg from '../../../../../../../public/Empty.png';
import { usePurchaseInvoiceColumns } from './usePurchaseInvoiceColumns';

const ViewInvoice = () => {
  useMetaData('Hues! - Purchase Invoice Details', 'HUES INVOICES'); // dynamic title

  const translations = useTranslations(
    'purchases.purchase-invoices.invoice_details',
  );
  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState('overview');

  const invoiceOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.invoices'),
      path: '/purchases/purchase-invoices/',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title.invoice_details'),
      path: `/purchases/purchase-invoices/${params.invoiceId}`,
      show: true, // Always show
    },
  ];

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    const newPath = `/purchases/purchase-invoices/${params.invoiceId}`;
    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [params.invoiceId, router]);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const { isLoading, data: invoiceDetails } = useQuery({
    queryKey: [invoiceApi.getInvoice.endpointKey, params.invoiceId],
    queryFn: () => getInvoice(params.invoiceId),
    select: (data) => data.data.data,
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
  const invoiceItemsColumns = usePurchaseInvoiceColumns();

  // fn for capitalization
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <Wrapper className="h-full py-2">
      {isLoading && !invoiceDetails?.invoiceDetails && <Loading />}

      {!isLoading && invoiceDetails?.invoiceDetails && (
        <>
          {/* headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex gap-2 pt-2">
              {/* breadcrumbs */}
              <OrderBreadCrumbs
                possiblePagesBreadcrumbs={invoiceOrdersBreadCrumbs}
              />
            </div>
            <div className="flex gap-2">
              {/* raised debit note CTA */}
              <RaisedDebitNoteModal
                orderId={invoiceDetails?.invoiceDetails?.orderId}
                invoiceId={invoiceDetails?.invoiceDetails?.invoiceId}
              />

              {/* share CTA */}
              <Tooltips
                trigger={
                  <Button
                    disabled
                    variant="blue_outline"
                    size="sm"
                    className="flex items-center justify-center border border-[#DCDCDC] text-black"
                  >
                    <Share2 size={14} />
                  </Button>
                }
                content={translations('ctas.share.placeholder')}
              />

              {/* View CTA modal */}
              <InvoicePDFViewModal Url={pvtUrl} />

              {/* download CTA */}

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
            </div>
          </section>
          <Tabs
            value={tab}
            onValueChange={onTabChange}
            defaultValue={'overview'}
          >
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
                    Name={`${invoiceDetails?.invoiceDetails?.vendorName} (${invoiceDetails?.invoiceDetails?.clientType})`}
                    type={invoiceDetails?.invoiceDetails?.invoiceType}
                    date={invoiceDetails?.invoiceDetails?.createdAt}
                    amount={invoiceDetails?.invoiceDetails?.totalAmount}
                  />

                  <DataTable
                    data={invoiceItems}
                    columns={invoiceItemsColumns}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="payment">
              {isPaymentsLoading && <Loading />}
              {/* orders overview */}
              {!isPaymentsLoading && paymentsListing?.length > 0 && (
                <DataTable data={paymentsListing} columns={paymentsColumns} />
              )}
              {!isPaymentsLoading && paymentsListing?.length === 0 && (
                <div className="flex h-[29rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                  <Image src={emptyImg} alt="emptyIcon" />
                  <p className="font-bold">
                    {translations(
                      'tabs.content.tab2.emtpyStateComponent.title',
                    )}
                  </p>
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
                                    `/purchases/purchase-debitNotes/${debitNote?.id}`,
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
                                  {translations('tabs.content.tab3.label.date')}{' '}
                                  :{' '}
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
                                  :{' '}
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
                                  {translations(
                                    'tabs.content.tab3.label.reason',
                                  )}
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
                    {translations(
                      'tabs.content.tab3.emtpyStateComponent.title',
                    )}
                  </p>
                  <p className="max-w-96 text-center">
                    {translations('tabs.content.tab3.emtpyStateComponent.para')}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </Wrapper>
  );
};

export default ViewInvoice;
