'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { paymentApi } from '@/api/payments/payment_api';
import { templateApi } from '@/api/templates_api/template_api';
import { getQCDefectStatuses } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import CommentBox from '@/components/comments/CommentBox';
import CreateDebitNote from '@/components/debitNote/CreateDebitNote';
import InvoiceOverview from '@/components/invoices/InvoiceOverview';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import MakePaymentNewInvoice from '@/components/payments/MakePaymentNewInvoice';
import { usePaymentColumns } from '@/components/payments/paymentColumns';
import { DataTable } from '@/components/table/data-table';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { getDebitNoteByInvoice } from '@/services/Debit_Note_Services/DebitNoteServices';
import { getGRNs } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import {
  getInvoice,
  getItemsToCreateDebitNote,
} from '@/services/Invoice_Services/Invoice_Services';
import { getPaymentsByInvoiceId } from '@/services/Payment_Services/PaymentServices';
import {
  getDocument,
  viewPdfInNewTab,
} from '@/services/Template_Services/Template_Services';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Download, Eye, MoveUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import emptyImg from '../../../../../../../../public/Empty.png';
import { useGrnColumns } from '../../../transport/grn/GRNColumns';
import { debitNoteColumns } from './debitNoteColumns';
import { usePurchaseInvoiceColumns } from './usePurchaseInvoiceColumns';

const PAGE_LIMIT = 10;

const ViewInvoice = () => {
  useMetaData('Hues! - Purchase Invoice Details', 'HUES INVOICES'); // dynamic title

  const translations = useTranslations(
    'purchases.purchase-invoices.invoice_details',
  );
  const { hasPermission } = usePermission();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState('overview');
  const [isPaymentAdvicing, setIsPaymentAdvicing] = useState(false);
  const [grns, setGrns] = useState(null);
  const [paginationData, setPaginationData] = useState(false);
  const [isCreatingDebitNote, setIsCreatingDebitNote] = useState(false);
  const [showAllDebitNotes, setShowAllDebitNotes] = useState(false);

  const invoiceOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.invoices'),
      path: '/dashboard/purchases/purchase-invoices/',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title.invoice_details'),
      path: `/dashboard/purchases/purchase-invoices/${params.invoiceId}`,
      show: true, // Always show
    },
    {
      id: 3,
      name: translations('title.payment_advice'),
      path: `/dashboard/purchases/purchase-invoices/${params.invoiceId}`,
      show: isPaymentAdvicing, // Show only if isPaymentAdvicing is true
    },
    {
      id: 3,
      name: translations('title.creating_debit_note'),
      path: `/dashboard/purchases/purchase-invoices/${params.invoiceId}`,
      show: isCreatingDebitNote, // Show only if isCreatingDebitNote is true
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');

    setIsPaymentAdvicing(state === 'payment_advice');
    setIsCreatingDebitNote(state === 'creating_debit_note');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/dashboard/purchases/purchase-invoices/${params.invoiceId}`;

    if (isPaymentAdvicing) {
      newPath += '?state=payment_advice';
    } else if (isCreatingDebitNote) {
      newPath += '?state=creating_debit_note';
    } else {
      newPath += '';
    }

    router.push(newPath);
  }, [params.invoiceId, isPaymentAdvicing, isCreatingDebitNote, router]);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const { isLoading, data: invoiceDetails } = useQuery({
    queryKey: [invoiceApi.getInvoice.endpointKey, params.invoiceId],
    queryFn: () => getInvoice(params.invoiceId),
    select: (data) => data.data.data,
    enabled: hasPermission('permission:purchase-view'),
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
    unit: invoice?.unit,
    unitPrice: invoice?.unitPrice,
    totalAmount: invoice?.totalAmount,
  }));

  // fetch items to create debit note
  const { data: itemsToCreateDebitNote } = useQuery({
    queryKey: [
      invoiceApi.getItemsToCreateDebitNote.endpointKey,
      params.invoiceId,
    ],
    queryFn: () => getItemsToCreateDebitNote({ id: params.invoiceId }),
    select: (data) => data.data.data,
    enabled: isCreatingDebitNote,
  });

  // fetch payment details
  const { isLoading: isPaymentsLoading, data: paymentsListing } = useQuery({
    queryKey: [paymentApi.getPaymentsByInvoiceId.endpointKey, params.invoiceId],
    queryFn: () => getPaymentsByInvoiceId(params.invoiceId),
    select: (data) => data.data.data,
    enabled: tab === 'payment',
  });

  // fetch grns for invoice
  const grnsQuery = useInfiniteQuery({
    queryKey: [deliveryProcess.getGRNs.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getGRNs({
        page: pageParam,
        limit: PAGE_LIMIT,
        invoiceId: params.invoiceId,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    staleTime: Infinity, // data never becomes stale
    refetchOnMount: false, // don’t refetch on remount
    refetchOnWindowFocus: false, // already correct
    enabled: tab === 'grns',
  });

  useEffect(() => {
    const source = grnsQuery.data;
    if (!source) return;
    const flattened = source.pages.flatMap(
      (page) => page?.data?.data?.data || [],
    );
    const uniqueGRNSData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );
    setGrns(uniqueGRNSData);
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: Number(lastPage?.totalPages),
      currFetchedPage: Number(lastPage?.page),
    });
  }, [grnsQuery.data]);

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

  // Statuses
  const paymentStatus = ConditionalRenderingStatus({
    status: invoiceDetails?.invoiceDetails?.invoiceMetaData?.payment?.status,
  });
  const debitNoteRawStatus =
    invoiceDetails?.invoiceDetails?.invoiceMetaData?.debitNote?.status;
  const hasDebitNote =
    debitNoteRawStatus && debitNoteRawStatus !== 'NOT_RAISED';
  const debitNotesIds = () => {
    const debitNotes = invoiceDetails?.debitNotes || [];

    if (!debitNotes.length) {
      return <span className="text-muted-foreground">--</span>;
    }

    const firstNote = debitNotes[0];
    const remainingNotes = debitNotes.slice(1);

    return (
      <div className="flex flex-col gap-1">
        {/* First debit note (always visible) */}
        <p
          className="flex cursor-pointer items-center gap-1 hover:text-primary hover:underline"
          onClick={() =>
            router.push(
              `/dashboard/purchases/purchase-debitNotes/${firstNote?.id}`,
            )
          }
        >
          {firstNote?.referenceNumber}
          <MoveUpRight size={14} />
        </p>

        {/* Remaining debit notes (conditionally rendered) */}
        {showAllDebitNotes &&
          remainingNotes?.map((note) => (
            <p
              key={note.id}
              className="flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-primary hover:underline"
              onClick={() =>
                router.push(
                  `/dashboard/purchases/purchase-debitNotes/${note?.id}`,
                )
              }
            >
              {note?.referenceNumber}
              <MoveUpRight size={12} />
            </p>
          ))}

        {/* Show more / Show less toggle */}
        {remainingNotes?.length > 0 && (
          <button
            type="button"
            className="w-fit text-xs text-primary underline"
            onClick={() => setShowAllDebitNotes((prev) => !prev)}
          >
            {showAllDebitNotes
              ? 'Show less'
              : `+${remainingNotes?.length} more`}
          </button>
        )}
      </div>
    );
  };

  const isAnyDefects =
    invoiceDetails?.invoiceDetails?.isShortQuantity ||
    invoiceDetails?.invoiceDetails?.isUnsatisfactory ||
    invoiceDetails?.invoiceDetails?.isShortDelivery;

  const defects = () => {
    const statuses = getQCDefectStatuses(invoiceDetails?.invoiceDetails);

    if (!statuses?.length) return '-';

    return (
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <ConditionalRenderingStatus key={status} status={status} isQC />
        ))}
      </div>
    );
  };

  const invoiceItemsColumns = usePurchaseInvoiceColumns();
  const paymentsColumns = usePaymentColumns();
  const GRNColumns = useGrnColumns();
  const debitNColumns = debitNoteColumns();

  const onRowClick = (row) => {
    router.push(`/dashboard/purchases/purchase-payments/${row.paymentId}`);
  };

  const onDebitNoteClick = (row) => {
    router.push(`/dashboard/purchases/purchase-debitNotes/${row.id}`);
  };

  const onGRNClick = (row) => {
    router.push(`/dashboard/transport/grn/${row.id}`);
  };

  return (
    <ProtectedWrapper permissionCode={'permission:purchase-view'}>
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
                {/* create debit note */}
                {!invoiceDetails?.invoiceDetails?.debitNoteCreationCompleted &&
                  !isCreatingDebitNote &&
                  !isPaymentAdvicing && (
                    <ProtectedWrapper
                      permissionCode={'permission:purchase-debit-note-action'}
                    >
                      <Tooltips
                        trigger={
                          <Button
                            size="sm"
                            variant="blue_outline"
                            onClick={() => setIsCreatingDebitNote(true)}
                            className="font-bold"
                            disabled={!isAnyDefects}
                          >
                            Create Debit Note
                          </Button>
                        }
                        content={
                          'No defects reported yet. Once QC marks defects, you’ll be able to create the Debit Note.'
                        }
                      />
                    </ProtectedWrapper>
                  )}

                {!isPaymentAdvicing &&
                  !isCreatingDebitNote &&
                  (invoiceDetails?.invoiceDetails?.invoiceMetaData?.payment
                    ?.status === 'NOT_PAID' ||
                    invoiceDetails?.invoiceDetails?.invoiceMetaData?.payment
                      ?.status === 'PARTIAL_PAID') && (
                    <ProtectedWrapper
                      permissionCode={'permission:purchase-create-payment'}
                    >
                      <Button
                        variant="blue_outline"
                        size="sm"
                        onClick={() => setIsPaymentAdvicing(true)}
                        className="font-bold"
                      >
                        {translations('ctas.payment_advice')}
                      </Button>
                    </ProtectedWrapper>
                  )}

                <ProtectedWrapper
                  permissionCode={'permission:purchase-document'}
                >
                  {/* View CTA modal */}
                  {!isPaymentAdvicing && !isCreatingDebitNote && (
                    <Tooltips
                      trigger={
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewPdfInNewTab(pvtUrl)}
                        >
                          <Eye size={14} />
                        </Button>
                      }
                      content={translations('ctas.view.placeholder')}
                    />
                  )}

                  {/* download CTA */}
                  {!isPaymentAdvicing && !isCreatingDebitNote && (
                    <Tooltips
                      trigger={
                        <Button
                          size="sm"
                          asChild
                          variant="outline"
                          className="w-full"
                        >
                          <a
                            download={pdfDoc?.publicUrl}
                            href={pdfDoc?.publicUrl}
                          >
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
            {!isPaymentAdvicing && !isCreatingDebitNote && (
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
                  <TabsTrigger value="grns">
                    {translations('tabs.label.tab3')}
                  </TabsTrigger>
                  <TabsTrigger value="debitNotes">
                    {translations('tabs.label.tab4')}
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
                        debitNoteStatus={debitNotesIds()}
                        defectsStatus={defects()}
                        hasDebitNote={hasDebitNote}
                        Name={`${invoiceDetails?.invoiceDetails?.vendorName} (${invoiceDetails?.invoiceDetails?.clientType})`}
                        type={invoiceDetails?.invoiceDetails?.invoiceType}
                        date={invoiceDetails?.invoiceDetails?.createdAt}
                        amount={invoiceDetails?.invoiceDetails?.totalAmount}
                        amountPaid={invoiceDetails?.invoiceDetails?.amountPaid}
                      />

                      <CommentBox
                        contextId={params.invoiceId}
                        context={'INVOICE'}
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
                    <DataTable
                      onRowClick={onRowClick}
                      data={paymentsListing}
                      columns={paymentsColumns}
                    />
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
                <TabsContent value="grns">
                  <div className="scrollBarStyles flex flex-col gap-4 overflow-auto">
                    {grnsQuery?.isLoading && <Loading />}
                    {!grnsQuery?.isLoading && grns?.length > 0 && (
                      <InfiniteDataTable
                        id="grns-table-for-invoice"
                        columns={GRNColumns}
                        data={grns}
                        fetchNextPage={grnsQuery.fetchNextPage}
                        isFetching={grnsQuery.isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        onRowClick={onGRNClick}
                      />
                    )}
                  </div>
                  {!grnsQuery?.isLoading && grns?.length === 0 && (
                    <div className="flex h-[55vh] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                      <Image src={emptyImg} alt="emptyIcon" />
                      <p className="font-bold">
                        {translations(
                          'tabs.content.tab3.emtpyStateComponent.title',
                        )}
                      </p>
                      <p className="max-w-96 text-center">
                        {translations(
                          'tabs.content.tab3.emtpyStateComponent.para',
                        )}
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="debitNotes">
                  <div className="scrollBarStyles flex flex-col gap-4 overflow-auto">
                    {isDebitNoteLoading && <Loading />}
                    {!isDebitNoteLoading && debitNotes?.length > 0 && (
                      <DataTable
                        columns={debitNColumns}
                        data={debitNotes || []}
                        onRowClick={onDebitNoteClick}
                      />
                    )}
                  </div>
                  {!isDebitNoteLoading && debitNotes?.length === 0 && (
                    <div className="flex h-[55vh] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                      <Image src={emptyImg} alt="emptyIcon" />
                      <p className="font-bold">
                        {translations(
                          'tabs.content.tab4.emtpyStateComponent.title',
                        )}
                      </p>
                      <p className="max-w-96 text-center">
                        {translations(
                          'tabs.content.tab4.emtpyStateComponent.para',
                        )}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {/* recordPayment component */}
            {isPaymentAdvicing && !isCreatingDebitNote && (
              <MakePaymentNewInvoice
                paymentStatus={paymentStatus}
                hasDebitNote={hasDebitNote}
                debitNoteStatus={debitNotesIds()}
                defectsStatus={defects()}
                invoiceDetails={invoiceDetails?.invoiceDetails}
                setIsRecordingPayment={setIsPaymentAdvicing}
                contextType={'PAYMENT_ADVICE'}
              />
            )}

            {/* Create debit note modal */}
            {isCreatingDebitNote && !isPaymentAdvicing && (
              <CreateDebitNote
                isCreatingDebitNote={isCreatingDebitNote}
                setIsCreatingDebitNote={setIsCreatingDebitNote}
                data={itemsToCreateDebitNote || []}
                id={params.invoiceId}
              />
            )}
          </>
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewInvoice;
