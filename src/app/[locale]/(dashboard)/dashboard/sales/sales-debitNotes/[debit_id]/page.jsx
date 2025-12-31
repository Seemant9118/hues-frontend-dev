'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import {
  formattedAmount,
  getQCDefectStatuses,
} from '@/appUtils/helperFunctions';
import CommentBox from '@/components/comments/CommentBox';
import CreateResponseD from '@/components/debitNote/CreateResponseD';
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
import { getDebitNote } from '@/services/Debit_Note_Services/DebitNoteServices';
import { useQuery } from '@tanstack/react-query';
import { MoveUpRight, PlusCircle } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { buildBuyerSellerRows } from './buildBuyerSellerTableRows';
import { useBuyerSellerColumns } from './useBuyerSellerMergedColumns';

const ViewDebitNote = () => {
  useMetaData('Hues! - Debit Notes Details', 'HUES DEBITNOTES'); // dynamic title

  const translations = useTranslations(
    'sales.sales-debit_notes.debit_notes_details',
  );

  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const debitNoteId = params.debit_id;
  const [tabs, setTabs] = useState('overview');

  const isAddingResponse = searchParams.get('action') === 'adding-response';

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
      path: `/dashboard/sales/sales-debitNotes/${debitNoteId}?action=adding-response`,
      show: isAddingResponse,
    },
  ];

  const onTabChange = (tab) => {
    setTabs(tab);
  };

  // get debitNote
  const { data: debitNoteDetails } = useQuery({
    queryKey: [DebitNoteApi.getDebitNote.endpointKey, debitNoteId],
    queryFn: () => getDebitNote(debitNoteId),
    select: (debitNote) => debitNote.data.data,
    enabled: hasPermission('permission:sales-view'),
  });

  const getDraftResponses = (item) => {
    const draft = item?.metaData?.creditNoteDraftResponse;

    if (!draft) return [];

    return Array.isArray(draft) ? draft : [draft];
  };

  const getRespondedQty = (item) => {
    const responses = getDraftResponses(item);

    return responses.reduce(
      (sum, r) =>
        sum +
        (Number(r.approvedQuantity) || 0) +
        (Number(r.rejectedQuantity) || 0),
      0,
    );
  };

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
      };
    });

  const overviewData = {
    debitNoteId: debitNoteDetails?.referenceNumber,
    clientName: debitNoteDetails?.fromEnterprise?.name,
    invoiceId: debitNoteDetails?.invoice.referenceNumber,
    defects: '',
    claimedAmount: formattedAmount(debitNoteDetails?.amount),
    setteledAmount: formattedAmount(debitNoteDetails?.setteledAmount),
    createdOn: moment(debitNoteDetails?.createdAt).format('DD/MM/YYYY'),
    status: debitNoteDetails?.status,
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

  const mergedRows = useMemo(
    () => buildBuyerSellerRows(debitNoteDetails?.debitNoteItems || []),
    [debitNoteDetails],
  );

  const buyerSellerColumns = useBuyerSellerColumns();

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

        {!isAddingResponse && (
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
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/dashboard/sales/sales-debitNotes/${debitNoteId}?action=adding-response`,
                    )
                  }
                >
                  <PlusCircle size={14} /> Add Response
                </Button>

                {/* <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                  onClick={() => handleSubmit('DRAFT')}
                >
                  <Save size={14} /> Save as Draft
                </Button>
                <Button
                  disabled={true}
                  size="sm"
                  onClick={() => handleSubmit('SENT')}
                >
                  <BookOpen size={14} /> Finalize & Post Credit Note
                </Button> */}
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
          </Tabs>
        )}

        {/* Create Response comopnent */}
        {isAddingResponse && (
          <CreateResponseD
            items={itemsToCreateResponse || []}
            debitNoteId={debitNoteId}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewDebitNote;
