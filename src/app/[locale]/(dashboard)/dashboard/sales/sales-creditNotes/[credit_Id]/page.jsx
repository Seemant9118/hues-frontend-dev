'use client';

import { CreditNoteApi } from '@/api/creditNote/CreditNoteApi';
import {
  formattedAmount,
  getQCDefectStatuses,
} from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import CommentBox from '@/components/comments/CommentBox';
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
  getCreditNote,
  previewCreditNote,
} from '@/services/Credit_Note_Services/CreditNoteServices';
import { viewPdfInNewTab } from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, MoveUpRight } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { buildBuyerSellerRowsForCredits } from './buildBuyerSellerRowsForCredits';
import { useCreditNotesItemsColumns } from './useCreditNotesItemsColumns';

const ViewCreditNote = () => {
  useMetaData('Hues! - Credit Notes Details', 'HUES CREDITNOTES'); // dynamic title

  const translations = useTranslations(
    'sales.sales-credit_notes.credit_notes_details',
  );

  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const router = useRouter();
  const params = useParams();
  const creditNoteId = params.credit_Id;
  const [tabs, setTabs] = useState('overview');

  const debitNoteBreadCrumbs = [
    {
      id: 1,
      name: translations('title.credit_notes'),
      path: `/dashboard/sales/sales-creditNotes`,
      show: true, // Always show
    },

    {
      id: 2,
      name: translations('title.credit_notes_details'),
      path: `/dashboard/sales/sales-creditNotes/${creditNoteId}`,
      show: true, // Always show
    },
  ];
  const onTabChange = (tab) => {
    setTabs(tab);
  };

  // get creditNote
  const { data: creditNoteDetails } = useQuery({
    queryKey: [CreditNoteApi.getCreditNote.endpointKey, creditNoteId],
    queryFn: () => getCreditNote({ id: creditNoteId }),
    select: (creditNote) => creditNote.data.data,
    enabled: hasPermission('permission:sales-view'),
  });

  // overviw component data
  const overviewData = {
    creditNoteId: creditNoteDetails?.referenceNumber,
    vendorName: creditNoteDetails?.toEnterprise?.name,
    createdOn: moment(creditNoteDetails?.createdAt).format('DD/MM/YYYY'),
    defects: '',
    debitNoteId: creditNoteDetails?.debitNote?.referenceNumber,
    invoiceId: creditNoteDetails?.invoice?.referenceNumber,
    claimedAmount: formattedAmount(creditNoteDetails?.debitNote?.amount),
    setteledAmount: formattedAmount(creditNoteDetails?.approvedAmount),
  };
  const overviewLabels = {
    creditNoteId: translations('overview_labels.creditNoteId'),
    vendorName: translations('overview_labels.vendorName'),
    createdOn: translations('overview_labels.createdOn'),
    defects: translations('overview_labels.defects'),
    debitNoteId: translations('overview_labels.debitNoteId'),
    invoiceId: translations('overview_labels.invoiceId'),
    claimedAmount: translations('overview_labels.claimedAmount'),
    setteledAmount: translations('overview_labels.setteledAmount'),
  };
  const customRender = {
    defects: () => {
      const statuses = getQCDefectStatuses(creditNoteDetails);

      if (!statuses?.length) return '-';

      return (
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <ConditionalRenderingStatus key={status} status={status} isQC />
          ))}
        </div>
      );
    },
    debitNoteId: () => {
      const debitNoteId = creditNoteDetails?.debitNote?.id;
      const debitNoteRef = creditNoteDetails?.debitNote?.referenceNumber;

      return (
        <p
          className={`flex items-center gap-1 ${
            debitNoteId
              ? 'cursor-pointer hover:text-primary hover:underline'
              : 'cursor-default text-muted-foreground'
          }`}
          onClick={() => {
            if (debitNoteId) {
              router.push(`/dashboard/sales/sales-debitNotes/${debitNoteId}`);
            }
          }}
        >
          {debitNoteRef ? (
            <>
              {debitNoteRef}
              <MoveUpRight size={14} />
            </>
          ) : (
            '--'
          )}
        </p>
      );
    },
    invoiceId: () => {
      const invoiceId = creditNoteDetails?.invoice?.id;
      const invoiceRef = creditNoteDetails?.invoice?.referenceNumber;

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

  // Data to rendered in - recon (merged) table
  const mergedRows = useMemo(
    () =>
      buildBuyerSellerRowsForCredits(creditNoteDetails?.creditNoteItems || []),
    [creditNoteDetails],
  );

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
  const formatCreditNotePayloadForPreview = (creditNoteDetails) => {
    if (!creditNoteDetails) return null;

    const {
      referenceNumber,
      createdAt,
      invoice,
      debitNote,
      fromEnterprise,
      toEnterprise,
      creditNoteItems = [],
    } = creditNoteDetails;

    const items = creditNoteItems.map((item) => {
      const productName =
        item?.debitNoteItem?.invoiceItem?.orderItemId?.productDetails
          ?.productName || '';

      const issue = [
        item?.debitNoteItem?.isShortDelivery && 'Short Delivery',
        item?.debitNoteItem?.isUnsatisfactory && 'Short Quantity',
      ]
        .filter(Boolean)
        .join(', ');

      return {
        ...item, // keep full creditNoteItem
        name: productName,
        issue,
      };
    });

    // totals only from ACCEPTED responses
    const totalAmount = items.reduce(
      (sum, item) =>
        sum +
        item.responseDetails.reduce(
          (acc, res) => acc + (res.approvedAmount || 0),
          0,
        ),
      0,
    );

    const totalTaxAmount = items.reduce(
      (sum, item) =>
        sum +
        item.responseDetails.reduce(
          (acc, res) => acc + (res.taxAmount || 0),
          0,
        ),
      0,
    );

    return {
      sellerEnterprise: {
        name: fromEnterprise?.name || '',
        gst: getEnterpriseGst(fromEnterprise),
        address: getEnterpriseAddress(fromEnterprise),
      },
      buyerEnterprise: {
        name: toEnterprise?.name || '',
        gst: getEnterpriseGst(toEnterprise),
        address: getEnterpriseAddress(toEnterprise),
      },
      invoiceId: invoice?.referenceNumber || '',
      creditNoteId: referenceNumber || '',
      debitNoteId: debitNote?.referenceNumber,
      creditNoteCreationDate: moment(createdAt).format('DD/MM/YY') || '',
      remarks: '',
      items,
      totalAmount,
      totalTaxAmount,
    };
  };

  const previewCreditNoteMutation = useMutation({
    mutationFn: previewCreditNote,
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
    if (creditNoteDetails?.dispatchDocumentSlug) {
      viewPdfInNewTab(creditNoteDetails?.dispatchDocumentSlug);
    } else {
      const formattedPayload =
        formatCreditNotePayloadForPreview(creditNoteDetails);
      previewCreditNoteMutation.mutate({
        id: creditNoteId,
        data: formattedPayload,
      });
    }
  };

  // columns
  const creditNoteItemsColumns = useCreditNotesItemsColumns();

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
            </TabsList>
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
              <CommentBox contextId={creditNoteId} context={'CREDIT_NOTE'} />

              <MergerDataTable
                id="buyer-seller-table"
                columns={creditNoteItemsColumns}
                data={mergedRows}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewCreditNote;
