'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import Tooltips from '@/components/auth/Tooltips';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  getGRN,
  previewGRN,
} from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { viewPdfInNewTab } from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ExternalLink, Eye } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useGRNColumnsItems } from './useGRNColumnsItems';

export default function QC() {
  const translations = useTranslations('transport.grns.grnsDetails');
  const router = useRouter();
  const params = useParams();
  const [tabs, setTabs] = useState('overview');

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

  const { data: grnDetails } = useQuery({
    queryKey: [deliveryProcess.getGRN.endpointKey],
    queryFn: () => getGRN({ id: params.id }),
    select: (data) => data.data.data,
  });

  const overviewData = {
    grnId: grnDetails?.referenceNumber,
    grnDate: moment(grnDetails?.createdAt).format('DD/MM/YYYY'),
    podId: grnDetails?.podReferenceNumber,
    deliveryDate: '-',
    EWB: grnDetails?.metaData?.invoiceDetails?.eWayBillId || '-',
  };
  const overviewLabels = {
    grnId: translations('overview_labels.grnId'),
    grnDate: translations('overview_labels.grnDate'),
    podId: translations('overview_labels.podId'),
    deliveryDate: translations('overview_labels.deliveryDate'),
    EWB: translations('overview_labels.EWB'),
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
              <ExternalLink size={14} />
            </>
          ) : (
            '--'
          )}
        </p>
      );
    },
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
          <Button
            size="sm"
            onClick={() => {
              router.push(`/dashboard/inventory/qc`);
            }}
          >
            Update QC
          </Button>
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
