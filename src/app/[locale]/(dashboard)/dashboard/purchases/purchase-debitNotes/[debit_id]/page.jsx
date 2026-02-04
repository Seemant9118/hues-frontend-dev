/* eslint-disable import/no-unresolved */

'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import {
  formattedAmount,
  getQCDefectStatuses,
} from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import CommentBox from '@/components/comments/CommentBox';
import EditDebitNoteItem from '@/components/debitNote/EditDebitNoteItem';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { getAllCreditNotes } from '@/services/Credit_Note_Services/CreditNoteServices';
import {
  getDebitNote,
  previewDebitNote,
  updateDebitNote,
} from '@/services/Debit_Note_Services/DebitNoteServices';
import { viewPdfInNewTab } from '@/services/Template_Services/Template_Services';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { BookOpen, Eye, MoveUpRight } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import emptyImg from '../../../../../../../../public/Empty.png';
import { useCreditNotesColumns } from '../../purchase-creditNotes/useCreditNotesColumns';
import { PurchaseTable } from '../../purchasetable/PurchaseTable';
import { useDebitNoteColumns } from './debitnoteColumns';

const PAGE_LIMIT = 10;

const ViewDebitNote = () => {
  useMetaData('Hues! - Debit Notes Details', 'HUES DEBITNOTES'); // dynamic title

  const translations = useTranslations(
    'purchases.purchase-debit_notes.debit_notes_details',
  );
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const router = useRouter();
  const params = useParams();
  const debitNoteId = params.debit_id;
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [creditNotesListing, setCreditNotesListing] = useState([]); // debitNotes
  const [paginationData, setPaginationData] = useState({});
  const [tabs, setTabs] = useState('overview');

  const debitNoteBreadCrumbs = [
    {
      id: 1,
      name: translations('title.debit_notes'),
      path: `/dashboard/purchases/purchase-debitNotes/`,
      show: true, // Always show
    },

    {
      id: 2,
      name: translations('title.debit_note_details'),
      path: `/dashboard/purchases/purchase-debitNotes/${debitNoteId}`,
      show: true, // Always show
    },
  ];

  const onTabChange = (tab) => {
    setTabs(tab);
  };

  // Fetch creditNotes data with infinite scroll
  const {
    data,
    fetchNextPage,
    isFetching,
    isLoading: isCreditNotesLoading,
  } = useInfiniteQuery({
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getAllCreditNotes({
        context: 'DEBITNOTE',
        page: pageParam,
        limit: PAGE_LIMIT,
        debitNoteId,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
    enabled: tabs === 'creditNotes' && hasPermission('permission:sales-view'),
    placeholderData: keepPreviousData,
  });

  // data flattening - formatting
  useEffect(() => {
    if (!data) return;

    // Flatten sales cebitnotes data from all pages
    const flattenedSalesCreditNotesData = data.pages
      .map((page) => page?.data?.data?.data) // Assuming sales invoices data is nested in `data.data.data`
      .flat();

    // Deduplicate sales data based on unique `id`
    const uniqueSalesCebitNotesData = Array.from(
      new Map(
        flattenedSalesCreditNotesData.map((sale) => [
          sale.id, // Assuming `id` is the unique identifier for each sale debit note
          sale,
        ]),
      ).values(),
    );

    // Update state with deduplicated sales invoices data
    setCreditNotesListing(uniqueSalesCebitNotesData);

    // Calculate pagination data using the last page's information
    const lastPage = data.pages[data.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [data]);

  const onRowClick = (row) => {
    router.push(`/dashboard/purchases/purchase-creditNotes/${row.id}`);
  };

  // get debitNote
  const { data: debitNoteDetails } = useQuery({
    queryKey: [DebitNoteApi.getDebitNote.endpointKey, debitNoteId],
    queryFn: () => getDebitNote(debitNoteId),
    select: (debitNote) => debitNote.data.data,
    enabled: hasPermission('permission:purchase-view'),
  });

  const overviewData = {
    debitNoteId: debitNoteDetails?.referenceNumber,
    vendorName: debitNoteDetails?.toEnterprise?.name,
    invoiceId: debitNoteDetails?.invoice.referenceNumber,
    defects: '',
    claimedAmount: formattedAmount(debitNoteDetails?.amount),
    setteledAmount: formattedAmount(debitNoteDetails?.setteledAmount),
    createdOn: moment(debitNoteDetails?.createdAt).format('DD/MM/YYYY'),
    status: debitNoteDetails?.status,
  };
  const overviewLabels = {
    debitNoteId: translations('overview_labels.debitNoteId'),
    vendorName: translations('overview_labels.vendorName'),
    invoiceId: translations('overview_labels.invoiceId'),
    defects: translations('overview_labels.defects'),
    claimedAmount: translations('overview_labels.claimedAmount'),
    setteledAmount: translations('overview_labels.setteledAmount'),
    createdOn: translations('overview_labels.createdOn'),
    status: translations('overview_labels.status'),
  };

  const customRender = {
    defects: () => {
      const statuses = getQCDefectStatuses(debitNoteDetails);

      if (!statuses?.length) return '-';

      return (
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <ConditionalRenderingStatus key={status} status={status} isQC />
          ))}
        </div>
      );
    },
    invoiceId: () => {
      const invoiceId = debitNoteDetails?.invoice.id;
      const invoiceRef = debitNoteDetails?.invoice.referenceNumber;

      return (
        <p
          className={`flex items-center gap-1 ${
            invoiceId
              ? 'cursor-pointer hover:text-primary hover:underline'
              : 'cursor-default text-muted-foreground'
          }`}
          onClick={() => {
            if (invoiceId) {
              router.push(
                `/dashboard/purchases/purchase-invoices/${invoiceId}`,
              );
            }
          }}
        >
          {invoiceRef ? (
            <>
              {invoiceRef}
              <MoveUpRight size={14} />
            </>
          ) : (
            '--'
          )}
        </p>
      );
    },
  };

  const handleEditLine = (item) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const updateDebitNoteMutation = useMutation({
    mutationFn: updateDebitNote,
    onSuccess: () => {
      toast.success('Debit Note updated Successfully');
      queryClient.invalidateQueries([DebitNoteApi.getDebitNote.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'something went wrong');
    },
  });
  const handleSubmit = (type = 'DRAFT') => {
    if (!debitNoteDetails?.debitNoteItems?.length) return;

    const payload = {
      status: type, // 'DRAFT' | 'SENT'
      items: debitNoteDetails.debitNoteItems.map((item) => {
        const { buyerExpectation } = item;

        return {
          debitNoteItemId: item.id,
          buyerExpectation,

          ...(buyerExpectation === 'REQUEST_REFUND' && {
            refundAmount: Number(item.amount || 0),
          }),

          ...(buyerExpectation === 'REQUEST_REPLACEMENT' && {
            refundAmount: 0,
            replacementQuantity: Number(item.replacementQuantity || 0),
          }),

          ...(buyerExpectation === 'REQUEST_BOTH' && {
            refundAmount: Number(item.amount || 0),
            replacementQuantity: Number(item.replacementQuantity || 0),
          }),

          metaData: {
            internalRemark: item?.metaData?.internalRemark || '',
            severityIndicator: item?.metaData?.severityIndicator || '',
          },
        };
      }),
    };

    updateDebitNoteMutation.mutate({
      id: debitNoteId,
      data: payload,
    });
  };

  // helper to get REGISTER_ADDRESS or fallback
  const getEnterpriseAddress = (enterprise) => {
    if (!enterprise?.addresses?.length) return '';

    const registeredAddress = enterprise.addresses.find(
      (addr) => addr.type === 'REGISTER_ADDRESS',
    );

    return registeredAddress?.address || enterprise.addresses[0]?.address || '';
  };

  // helper to get GST from gsts[] or fallback
  const getEnterpriseGst = (enterprise) => {
    if (enterprise?.gsts?.length) {
      return enterprise.gsts[0]?.gst;
    }
    return enterprise?.gstNumber || '';
  };

  // fn to format payload for preview
  const formatPayloadForPreview = (debitNoteDetails) => {
    if (!debitNoteDetails) return null;

    const {
      referenceNumber,
      createdAt,
      remark,
      invoice,
      fromEnterprise,
      toEnterprise,
      debitNoteItems = [],
    } = debitNoteDetails;

    const items = debitNoteItems.map((item) => {
      const productName =
        item?.invoiceItem?.orderItemId?.productDetails?.productName || '';
      const issues = [
        item?.isShortDelivery && 'Short Delivery',
        item?.isUnsatisfactory && 'Short Quantity',
      ]
        .filter(Boolean)
        .join(', ');

      return {
        name: productName,
        refundQuantity: item.refundQuantity || 0,
        replacementQuantity: item.replacementQuantity || 0,
        amount: item.amount || 0,
        taxAmount: item.taxAmount || 0,
        cgstDetails: item.cgstDetails || null,
        sgstDetails: item.sgstDetails || null,
        igstDetails: item.igstDetails || null,
        issue: issues,
      };
    });

    const totalAmount = items.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );

    const totalTaxAmount = items.reduce(
      (sum, item) => sum + (item.taxAmount || 0),
      0,
    );

    return {
      sellerEnterprise: {
        name: toEnterprise?.name || '',
        gst: getEnterpriseGst(toEnterprise),
        address: getEnterpriseAddress(toEnterprise),
      },
      buyerEnterprise: {
        name: fromEnterprise?.name || '',
        gst: getEnterpriseGst(fromEnterprise),
        address: getEnterpriseAddress(fromEnterprise),
      },
      invoiceId: invoice?.referenceNumber || '',
      debitNoteId: referenceNumber || '',
      debitNoteCreationDate: moment(createdAt).format('DD/MM/YY') || '',
      remarks: remark || '',
      items,
      totalAmount,
      totalTaxAmount,
    };
  };

  const previewDebitNoteMutation = useMutation({
    mutationFn: previewDebitNote,
    onSuccess: async (data) => {
      toast.success('Document Generated Successfully');
      const pdfSlug = data?.data?.data?.dispatchDocumentSlug;

      viewPdfInNewTab(pdfSlug);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handlePreview = () => {
    if (debitNoteDetails?.dispatchDocumentSlug) {
      viewPdfInNewTab(debitNoteDetails?.dispatchDocumentSlug);
    } else {
      const formattedPayload = formatPayloadForPreview(debitNoteDetails);

      previewDebitNoteMutation.mutate({
        id: debitNoteId,
        data: formattedPayload,
      });
    }
  };

  const creditNotesColumns = useCreditNotesColumns();
  const debitNoteColumns = useDebitNoteColumns({
    onEditLine: handleEditLine,
    isDebitNotePosted: debitNoteDetails?.status === 'SENT',
  });

  return (
    <ProtectedWrapper permissionCode={'permission:purchase-view'}>
      <Wrapper className="h-full py-2">
        {/* Header */}
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
          {/* breadcrumbs */}
          <OrderBreadCrumbs possiblePagesBreadcrumbs={debitNoteBreadCrumbs} />

          {/* preview */}
          <Tooltips
            trigger={
              <Button
                onClick={handlePreview}
                size="sm"
                variant="outline"
                className="font-bold"
              >
                <Eye size={14} />
              </Button>
            }
            content={translations('preview.tootips-content')}
          />
        </section>

        <Tabs
          value={tabs}
          onValueChange={onTabChange}
          defaultValue={'overview'}
        >
          <section className="flex items-center justify-between gap-2">
            <TabsList className="border">
              <TabsTrigger value="overview">
                {translations('tabs.tab1.title')}
              </TabsTrigger>
              <TabsTrigger value="creditNotes">
                {translations('tabs.tab2.title')}
              </TabsTrigger>
            </TabsList>

            {debitNoteDetails?.status === 'DRAFT' && (
              <div className="flex items-center gap-2">
                {/* <Button
                  variant="outline"
                  size="sm"
                  disabled={updateDebitNoteMutation?.isPending}
                  onClick={() => handleSubmit('DRAFT')}
                >
                  <Save size={14} /> Save as Draft
                </Button> */}
                <Button
                  disabled={updateDebitNoteMutation?.isPending}
                  size="sm"
                  onClick={() => handleSubmit('SENT')}
                >
                  <BookOpen size={14} /> Finalize & Post Debit Note
                </Button>
              </div>
            )}
          </section>

          <TabsContent value="overview">
            <div className="flex flex-col gap-4">
              {/* OVERVIEW SECTION */}
              <Overview
                collapsible={false}
                data={overviewData}
                labelMap={overviewLabels}
                customRender={customRender}
              />

              {/* comment */}
              <CommentBox contextId={debitNoteId} context={'DEBIT_NOTE'} />

              <DataTable
                id="grns"
                columns={debitNoteColumns}
                data={debitNoteDetails?.debitNoteItems || []}
              />

              {/* Edit Item */}
              <EditDebitNoteItem
                open={editOpen}
                onOpenChange={setEditOpen}
                item={selectedItem}
                debitNoteId={debitNoteId}
              />
            </div>
          </TabsContent>

          <TabsContent
            value="creditNotes"
            className="flex-grow overflow-hidden"
          >
            {isCreditNotesLoading && <Loading />}
            {!isCreditNotesLoading && creditNotesListing?.length > 0 && (
              <PurchaseTable
                id={'purchase-debits-credits'}
                columns={creditNotesColumns}
                data={creditNotesListing}
                fetchNextPage={fetchNextPage}
                isFetching={isFetching}
                totalPages={paginationData?.totalPages}
                currFetchedPage={paginationData?.currFetchedPage}
                onRowClick={onRowClick}
              />
            )}

            {!isCreditNotesLoading && creditNotesListing?.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                <Image src={emptyImg} alt="emptyIcon" />
                <p>{translations('emtpyStateComponent.heading')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewDebitNote;
