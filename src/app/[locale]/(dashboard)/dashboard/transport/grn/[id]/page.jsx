'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import {
  getEnterpriseId,
  getQCDefectStatuses,
} from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import {
  getGRN,
  previewGRN,
} from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { viewPdfInNewTab } from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, MoveUpRight } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useGRNColumnsItems } from './useGRNColumnsItems';

export default function GRN() {
  useMetaData('Hues! - GRN Details', 'HUES GRN Details');
  const translations = useTranslations('transport.grns.grnsDetails');
  const router = useRouter();
  const params = useParams();
  const enterpriseId = getEnterpriseId();
  const [tabs, setTabs] = useState('overview');
  // const [showAllDebitNotes, setShowAllDebitNotes] = useState(false);

  const grnsBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/transport/grn',
      show: true,
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/transport/grn/${params.id}`,
      show: true,
    },
  ];

  const onTabChange = (tab) => {
    setTabs(tab);
  };

  // fetch grnDetails
  const { data: grnDetails } = useQuery({
    queryKey: [deliveryProcess.getGRN.endpointKey],
    queryFn: () => getGRN({ id: params.id }),
    select: (data) => data.data.data,
  });

  const isSeller = grnDetails?.metaData?.sellerEnterpriseId === enterpriseId;

  // iamSeller -> show my vendorname
  const iamSeller = isSeller;
  const buyerName = grnDetails?.metaData?.buyerDetails?.name;
  const sellerName = grnDetails?.metaData?.sellerDetails?.name;

  const overviewData = {
    grnId: grnDetails?.referenceNumber,
    vendorName: iamSeller ? buyerName : sellerName,
    grnDate: moment(grnDetails?.createdAt).format('DD/MM/YYYY'),
    defects: '',
    podId: grnDetails?.podReferenceNumber,
    invoiceId: grnDetails?.metaData?.invoiceDetails?.referenceNumber || '-',
    EWB: grnDetails?.metaData?.invoiceDetails?.eWayBillId || '-',
    // debitNote: grnDetails?.metaData?.debitNoteDetails?.referenceNumber || '-',
  };
  const overviewLabels = {
    grnId: translations('overview_labels.grnId'),
    ...(!isSeller
      ? { vendorName: translations('overview_labels.vendorName') }
      : { vendorName: translations('overview_labels.clientName') }),
    grnDate: translations('overview_labels.grnDate'),
    defects: translations('overview_labels.defects'),
    podId: translations('overview_labels.podId'),
    invoiceId: translations('overview_labels.invoiceId'),
    EWB: translations('overview_labels.EWB'),
    // debitNote: translations('overview_labels.debitNote'),
  };

  const customRender = {
    podId: () => {
      const podId = grnDetails?.podId;
      const podRef = grnDetails?.podReferenceNumber;

      return (
        <p
          className={`flex items-center gap-1 ${
            podId
              ? 'cursor-pointer hover:text-primary hover:underline'
              : 'cursor-default text-muted-foreground'
          }`}
          onClick={() => {
            if (podId) {
              router.push(`/dashboard/transport/pod/${podId}`);
            }
          }}
        >
          {podRef ? (
            <>
              {podRef}
              <MoveUpRight size={14} />
            </>
          ) : (
            '--'
          )}
        </p>
      );
    },
    invoiceId: () => {
      const invoiceId = grnDetails?.metaData?.invoiceDetails?.id;
      const invoiceRef = grnDetails?.metaData?.invoiceDetails?.referenceNumber;

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
    defects: () => {
      const statuses = getQCDefectStatuses(grnDetails);
      if (!statuses.length) return '-';
      return (
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <ConditionalRenderingStatus key={status} status={status} isQC />
          ))}
        </div>
      );
    },
    // debitNote: () => {
    //   const debitNotes = grnDetails?.debitNotes || [];

    //   if (!debitNotes.length) {
    //     return <span className="text-muted-foreground">--</span>;
    //   }

    //   const firstNote = debitNotes[0];
    //   const remainingNotes = debitNotes.slice(1);

    //   return (
    //     <div className="flex flex-col gap-1">
    //       {/* First debit note (always visible) */}
    //       <p
    //         className="flex cursor-pointer items-center gap-1 hover:text-primary hover:underline"
    //         onClick={() =>
    //           router.push(
    //             `/dashboard/purchases/purchase-debitNotes/${firstNote.id}`,
    //           )
    //         }
    //       >
    //         {firstNote.referenceNumber}
    //         <MoveUpRight size={14} />
    //       </p>

    //       {/* Remaining debit notes (conditionally rendered) */}
    //       {showAllDebitNotes &&
    //         remainingNotes.map((note) => (
    //           <p
    //             key={note.id}
    //             className="flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-primary hover:underline"
    //             onClick={() =>
    //               router.push(
    //                 `/dashboard/purchases/purchase-debitNotes/${note.id}`,
    //               )
    //             }
    //           >
    //             {note.referenceNumber}
    //             <MoveUpRight size={12} />
    //           </p>
    //         ))}

    //       {/* Show more / Show less toggle */}
    //       {remainingNotes.length > 0 && (
    //         <button
    //           type="button"
    //           className="w-fit text-xs text-primary underline"
    //           onClick={() => setShowAllDebitNotes((prev) => !prev)}
    //         >
    //           {showAllDebitNotes
    //             ? 'Show less'
    //             : `+${remainingNotes.length} more`}
    //         </button>
    //       )}
    //     </div>
    //   );
    // },
  };

  const previewGRNMutation = useMutation({
    mutationFn: previewGRN,
    onSuccess: async (data) => {
      toast.success('Document Generated Successfully');
      const pdfSlug = data?.data?.data?.grnDocumentSlug;

      viewPdfInNewTab(pdfSlug);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handlePreview = () => {
    if (grnDetails?.documentLink) {
      viewPdfInNewTab(grnDetails?.documentLink);
    } else {
      previewGRNMutation.mutate({
        id: params.id,
      });
    }
  };

  const grnItemsColumns = useGRNColumnsItems();

  return (
    <Wrapper className="h-full py-2">
      {/* Header */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <OrderBreadCrumbs possiblePagesBreadcrumbs={grnsBreadCrumbs} />

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
          content={'Preview GRN Document'}
        />
      </section>

      <Tabs value={tabs} onValueChange={onTabChange} defaultValue={'overview'}>
        <section className="flex items-center justify-between gap-2">
          <TabsList className="border">
            <TabsTrigger value="overview">
              {translations('tabs.tab1.title')}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {!grnDetails?.isQcCompleted && (
              <Button
                size="sm"
                onClick={() => {
                  router.push(`/dashboard/inventory/qc/${params.id}`);
                }}
              >
                Update QC
              </Button>
            )}
          </div>
        </section>

        <TabsContent value="overview">
          {/* OVERVIEW SECTION */}
          <Overview
            collapsible={false}
            data={overviewData}
            labelMap={overviewLabels}
            customRender={customRender}
          />

          {/* Scrollable table area */}
          <div className="flex-1 overflow-auto">
            <DataTable
              id="grns"
              columns={grnItemsColumns}
              data={grnDetails?.id ? grnDetails?.items : []}
            />
          </div>
        </TabsContent>
      </Tabs>
    </Wrapper>
  );
}
