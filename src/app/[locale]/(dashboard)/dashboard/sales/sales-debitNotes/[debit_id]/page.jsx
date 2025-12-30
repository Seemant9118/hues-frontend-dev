'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import {
  formattedAmount,
  getQCDefectStatuses,
} from '@/appUtils/helperFunctions';
import CommentBox from '@/components/comments/CommentBox';
import CreateResponse from '@/components/debitNote/CreateResponse';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
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
  updateDebitNote,
} from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, MoveUpRight, PlusCircle, Save } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useDebitNoteColumns } from './debitnoteColumns';

const ViewDebitNote = () => {
  useMetaData('Hues! - Debit Notes Details', 'HUES DEBITNOTES'); // dynamic title

  const translations = useTranslations(
    'sales.sales-debit_notes.debit_notes_details',
  );

  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const debitNoteId = params.debit_id;
  const [isAddingResponse, setIsAddingResponse] = useState(false);
  const [tabs, setTabs] = useState('overview');

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

  // TODO: api change for raise credit note and saved draft
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

  const debitNoteColumns = useDebitNoteColumns({
    isDebitNotePosted: debitNoteDetails?.status === 'SENT',
  });

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

            {/* TODO: ctas hide logic */}
            <div className="flex items-center gap-2">
              <Button
                disabled={updateDebitNoteMutation?.isPending}
                size="sm"
                onClick={() => setIsAddingResponse(true)}
              >
                <PlusCircle size={14} /> Add Response
              </Button>
              <Button
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
              </Button>
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

              <DataTable
                id="grns"
                columns={debitNoteColumns}
                data={debitNoteDetails?.debitNoteItems || []}
              />

              {/* Create Response comopnent */}
              <CreateResponse
                open={isAddingResponse}
                onOpenChange={setIsAddingResponse}
                data={debitNoteDetails?.debitNoteItems || []}
                id={debitNoteId}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewDebitNote;
