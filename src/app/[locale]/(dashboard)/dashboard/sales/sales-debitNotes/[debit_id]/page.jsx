'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import {
  formattedAmount,
  getQCDefectStatuses,
} from '@/appUtils/helperFunctions';
import CommentBox from '@/components/comments/CommentBox';
import CreateCreditNote from '@/components/credtiNote/CreateCreditNote';
import CreateResponseD from '@/components/debitNote/CreateResponseD';
import EditResponse from '@/components/debitNote/EditResponse';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { MergerDataTable } from '@/components/table/merger-data-table';
import { Button } from '@/components/ui/button';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useAuth } from '@/context/AuthContext';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import {
  getDebitNote,
  sellerResponseUpdate,
} from '@/services/Debit_Note_Services/DebitNoteServices';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { BookOpen, MoveUpRight, PlusCircle } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getAllCreditNotes } from '@/services/Credit_Note_Services/CreditNoteServices';
import Loading from '@/components/ui/Loading';
import Image from 'next/image';
import { buildBuyerSellerRows } from './buildBuyerSellerTableRows';
import { useBuyerSellerColumns } from './useBuyerSellerMergedColumns';
import { SalesTable } from '../../salestable/SalesTable';
import { useCreditNotesColumns } from '../../sales-creditNotes/useCreditNotesColumns';
import emptyImg from '../../../../../../../../public/Empty.png';

const PAGE_LIMIT = 10;

const ViewDebitNote = () => {
  useMetaData('Hues! - Debit Notes Details', 'HUES DEBITNOTES'); // dynamic title

  const translations = useTranslations(
    'sales.sales-debit_notes.debit_notes_details',
  );

  const queryClient = useQueryClient();
  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const router = useRouter();
  const params = useParams();
  const debitNoteId = params.debit_id;
  const [tabs, setTabs] = useState('overview');
  const [isAddingResponse, setIsAddingResponse] = useState(false);
  const [isEditingResponse, setIsEditingRespoonse] = useState(false);
  const [isCreatingCreditNote, setIsCreatingCreditNote] = useState(false);
  const [selectedItemToEdit, setSelectedItemToEdit] = useState(null);
  const [creditNotesListing, setCreditNotesListing] = useState([]); // debitNotes
  const [paginationData, setPaginationData] = useState({});

  const debitNoteBreadCrumbs = [
    {
      id: 1,
      name: translations('title.debit_notes'),
      path: `/dashboard/sales/sales-debitNotes`,
      show: true, // Always show
    },

    {
      id: 2,
      name: translations('title.debit_note_details'),
      path: `/dashboard/sales/sales-debitNotes/${debitNoteId}`,
      show: true, // Always show
    },

    {
      id: 3,
      name: translations('title.adding_response'),
      path: `/dashboard/sales/sales-debitNotes/${debitNoteId}`,
      show: isAddingResponse,
    },

    {
      id: 4,
      name: translations('title.editing_response'),
      path: `/dashboard/sales/sales-debitNotes/${debitNoteId}`,
      show: isEditingResponse,
    },

    {
      id: 5,
      name: translations('title.create_credit_note'),
      path: `/dashboard/sales/sales-debitNotes/${debitNoteId}`,
      show: isCreatingCreditNote,
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
    router.push(`/dashboard/sales/sales-creditNotes/${row.id}`);
  };

  // side effect to clear data for edit
  useEffect(() => {
    if (!isAddingResponse) {
      setSelectedItemToEdit(null);
    }
  }, [isAddingResponse]);

  // get debitNote
  const { data: debitNoteDetails } = useQuery({
    queryKey: [DebitNoteApi.getDebitNote.endpointKey, debitNoteId],
    queryFn: () => getDebitNote(debitNoteId),
    select: (debitNote) => debitNote.data.data,
    enabled: hasPermission('permission:sales-view'),
  });

  // overviw component data
  const overviewData = {
    debitNoteId: debitNoteDetails?.referenceNumber,
    clientName: debitNoteDetails?.fromEnterprise?.name,
    invoiceId: debitNoteDetails?.invoice.referenceNumber,
    defects: '',
    claimedAmount: formattedAmount(debitNoteDetails?.amount),
    setteledAmount: formattedAmount(debitNoteDetails?.setteledAmount),
    createdOn: moment(debitNoteDetails?.createdAt).format('DD/MM/YYYY'),
    status: debitNoteDetails?.creditNoteCompletedForAllItems
      ? 'FULLFILLED'
      : debitNoteDetails?.status
        ? 'RECIEVED'
        : '',
  };
  const overviewLabels = {
    debitNoteId: translations('overview_labels.debitNoteId'),
    clientName: translations('overview_labels.clientName'),
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
              router.push(`/dashboard/sales/sales-invoices/${invoiceId}`);
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

  // util fn to get only seller responses correspoding each buyer expectation
  const getDraftResponses = (item) => {
    const draft = item?.metaData?.creditNoteDraftResponse;

    if (!draft) return [];

    return Array.isArray(draft) ? draft : [draft];
  };
  // util fn to calculate responded qty
  const getRespondedQty = (item) => {
    const responses = getDraftResponses(item);

    return responses.reduce(
      (sum, r) =>
        sum +
        (Number(r.approvedQuantity) || 0) +
        (Number(r.rejectedQuantity) || 0) +
        (Number(r.replacementQty) || 0),
      0,
    );
  };
  // Data to create response
  const itemsToCreateResponse = (debitNoteDetails?.debitNoteItems || [])
    .filter((item) => {
      const expectedQty =
        (item.refundQuantity ?? 0) + (item.replacementQuantity ?? 0);

      const respondedQty = getRespondedQty(item);

      // keep only items NOT fully fulfilled
      return respondedQty < expectedQty;
    })
    .map((item) => {
      const responses = getDraftResponses(item);

      const approvedQuantity = responses.reduce(
        (sum, r) => sum + (r.approvedQuantity || 0),
        0,
      );

      const approvedAmount = responses.reduce(
        (sum, r) => sum + (r.approvedAmount || 0),
        0,
      );

      const respondedQty = getRespondedQty(item);

      return {
        debitNoteItemId: item.id,
        invoiceItemId: item.invoiceItemId,

        productName:
          item?.invoiceItem?.orderItemId?.productDetails?.productName || '-',

        skuId: item?.invoiceItem?.orderItemId?.productDetails?.skuId || '-',

        unitPrice: item.unitPrice,

        refundQuantity: item.refundQuantity,
        replacementQuantity: item.replacementQuantity,
        maxQuantity: item.maxQuantity,
        respondedQty,

        approvedQuantity,
        approvedAmount,

        buyerExpectation: item.buyerExpectation,

        taxAmount: item.taxAmount,

        cgstDetails: item.cgstDetails,
        sgstDetails: item.sgstDetails,
        igstDetails: item.igstDetails,

        qcFailedQty: item?.metaData?.qcFailedQty ?? 0,
        severityIndicator: item?.metaData?.severityIndicator ?? '',
        internalRemark: item?.metaData?.internalRemark ?? '',
        isShortDelivery: item.isShortDelivery,
        isUnsatisfactory: item.isUnsatisfactory,
      };
    });

  // Data to rendered in - recon (merged) table
  const mergedRows = useMemo(
    () => buildBuyerSellerRows(debitNoteDetails?.debitNoteItems || []),
    [debitNoteDetails],
  );

  // condition to render action for seller response - onEdit, onDelete
  const canShowSellerAction = (row) => {
    const { rowId, sellerResponse } = row.original || {};

    // no seller response yet
    if (!sellerResponse || sellerResponse === '-') return false;

    // seller rows like "77-1", "77-2"
    return typeof rowId === 'string' && rowId.includes('-');
  };
  const findDebitNoteItemById = (debitNoteItemId) => {
    return debitNoteDetails?.debitNoteItems?.find(
      (i) => i.id === debitNoteItemId,
    );
  };
  // onEdit
  const onEditLine = (row) => {
    // rowId format: "71-0"
    const debitNoteItemId = Number(row.rowId.split('-')[0]);

    const originalItem = findDebitNoteItemById(debitNoteItemId);

    if (!originalItem) {
      // eslint-disable-next-line no-console
      console.error('DebitNote item not found for edit', debitNoteItemId);
      return;
    }

    // Merge seller response + debitNoteItem
    const editPayload = {
      ...originalItem, // source of truth
      ...row, // seller response / UI data
      id: row.id,
      debitNoteItemId, // normalized id
      sellerResponse: row.sellerResponse,
      sellerQty: row.sellerQty,
      sellerAmount: row.sellerAmount,
      draftResponses: getDraftResponses(originalItem), // ✅ REQUIRED
    };

    setSelectedItemToEdit(editPayload);
    setIsEditingRespoonse(true);
  };

  // onDelete
  const sellerResponseUpdateMutation = useMutation({
    mutationFn: sellerResponseUpdate,
    onSuccess: () => {
      toast.success('Response deleted successfully');
      queryClient.invalidateQueries([DebitNoteApi.getDebitNote.endpointKey]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });
  const onDeleteLine = (row) => {
    const payload = {
      itemsToDelete: [
        {
          debitNoteItemId: row?.debitNoteItemId,
          id: row.id,
        },
      ],
    };
    sellerResponseUpdateMutation.mutate({
      id: debitNoteId,
      data: payload,
    });
  };

  // Data to create credit note
  const groupByDebitNoteItemId = (data = []) => {
    return data.reduce((acc, row) => {
      const key = row.debitNoteItemId;

      if (!acc[key]) acc[key] = [];
      acc[key].push(row);

      return acc;
    }, {});
  };
  const filterFullyFulfilledItems = (data = []) => {
    const grouped = groupByDebitNoteItemId(data);

    return Object.values(grouped)
      .filter((rows) => {
        if (!rows.length) return false;

        const { buyerQty } = rows[0];

        // If credit note already created for this item → exclude
        const isCreditNoteAlreadyCreated = rows.some(
          (r) => r.isCreditNoteCreated === true || r.creditNoteId,
        );

        if (isCreditNoteAlreadyCreated) return false;

        // Check full fulfillment
        const totalSellerQty = rows.reduce(
          (sum, r) => sum + (Number(r.sellerQty) || 0),
          0,
        );

        return totalSellerQty === buyerQty;
      })
      .flat(); // flatten back to rows
  };
  const filteredDataToCreateCreditNotes = filterFullyFulfilledItems(mergedRows);

  // columns
  const buyerSellerColumns = useBuyerSellerColumns({
    onEditLine,
    onDeleteLine,
    canShowSellerAction,
  });
  const creditNotesColumns = useCreditNotesColumns();

  if (!permissions || permissions.length === 0) {
    return null; // or <Loading />
  }

  if (!hasPermission('permission:sales-view')) {
    router.replace('/dashboard/unauthorized');
    return null;
  }

  return (
    <ProtectedWrapper permissionCode="permission:sales-view">
      <Wrapper className="h-full py-2">
        {/* Header */}
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
          {/* breadcrumbs */}
          <OrderBreadCrumbs possiblePagesBreadcrumbs={debitNoteBreadCrumbs} />
        </section>

        {!isAddingResponse && !isCreatingCreditNote && !isEditingResponse && (
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

              <div className="flex items-center gap-2">
                {/* if all items response added then hide it */}
                {itemsToCreateResponse?.length > 0 && (
                  <Button size="sm" onClick={() => setIsAddingResponse(true)}>
                    <PlusCircle size={14} /> Add Response
                  </Button>
                )}

                {itemsToCreateResponse?.length === 0 &&
                  !debitNoteDetails?.creditNoteCompletedForAllItems && (
                    <Button
                      size="sm"
                      onClick={() => setIsCreatingCreditNote(true)}
                    >
                      <BookOpen size={14} /> Finalize & Post Credit Note
                    </Button>
                  )}
              </div>
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

                <MergerDataTable
                  id="buyer-seller-table"
                  columns={buyerSellerColumns}
                  data={mergedRows}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="creditNotes"
              className="flex-grow overflow-hidden"
            >
              {isCreditNotesLoading && <Loading />}
              {!isCreditNotesLoading && creditNotesListing?.length > 0 && (
                <SalesTable
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
        )}

        {/* add response */}
        {isAddingResponse && !isCreatingCreditNote && !isEditingResponse && (
          <CreateResponseD
            items={itemsToCreateResponse || []}
            debitNoteId={debitNoteId}
            onClose={() => setIsAddingResponse(false)}
          />
        )}

        {/* edit a response */}
        {isEditingResponse &&
          !isCreatingCreditNote &&
          !isAddingResponse &&
          selectedItemToEdit && (
            <EditResponse
              item={selectedItemToEdit}
              debitNoteId={debitNoteId}
              onClose={() => setIsEditingRespoonse(false)}
            />
          )}

        {/* create a credit note */}
        {isCreatingCreditNote && !isAddingResponse && !isEditingResponse && (
          <CreateCreditNote
            isCreatingCreditNote={isCreatingCreditNote}
            setIsCreatingCreditNote={setIsCreatingCreditNote}
            data={filteredDataToCreateCreditNotes}
            id={debitNoteId}
            onClose={() => setIsCreatingCreditNote(false)}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewDebitNote;
