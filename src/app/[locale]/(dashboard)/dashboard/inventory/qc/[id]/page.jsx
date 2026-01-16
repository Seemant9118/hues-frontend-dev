'use client';

import { qcApis } from '@/api/inventories/qc/qc';
import CommentBox from '@/components/comments/CommentBox';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import QCItemsDialog from '@/components/qc/QCItemDialog';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  getQCDetailsWithGRNs,
  stockInFromQC,
} from '@/services/Inventories_Services/QC_Services/QC_Services';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, MoveUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQCItemsColumns } from './qcItemColumns';

const ViewQC = () => {
  const translations = useTranslations('qc.qcDetails');
  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState('overview');
  const [isQCDialogOpen, setIsQCDialogOpen] = useState(false);

  const itemsBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/inventory/qc',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/inventory/qc/${params.id}`,
      show: true, // Always show
    },
  ];

  const onTabChange = (tab) => {
    setTab(tab);
  };

  // item details fetching
  const { data: qcDetails } = useQuery({
    queryKey: [qcApis.getQCDetailsWithGRNs.endpointKey, params.id],
    queryFn: () => getQCDetailsWithGRNs({ id: params.id }),
    select: (res) => res.data.data,
    enabled: true,
  });

  const overviewData = {
    grnId: qcDetails?.items?.[0]?.grn?.referenceNumber || '-',
    invoiceId:
      qcDetails?.items?.[0]?.grn?.metaData?.invoiceDetails?.referenceNumber ||
      '-',
    vendorName:
      qcDetails?.items?.[0]?.grn?.metaData?.sellerDetails?.name || '-',
    status: qcDetails?.parentStatus || '-',
  };
  const overviewLabels = {
    grnId: translations('overview.labels.grnId'),
    invoiceId: translations('overview.labels.invoiceId'),
    vendorName: translations('overview.labels.vendorName'),
    status: translations('overview.labels.status'),
  };

  const customRender = {
    grnId: () => {
      return (
        <p
          className="flex cursor-pointer items-center gap-0.5 text-base font-semibold hover:text-primary hover:underline"
          onClick={() => {
            router.push(
              `/dashboard/transport/grn/${qcDetails?.items?.[0]?.grn?.id}`,
            );
          }}
        >
          {qcDetails?.items?.[0]?.grn?.referenceNumber}
          <MoveUpRight size={12} />
        </p>
      );
    },
    invoiceId: () => {
      return (
        <p
          className="flex cursor-pointer items-center gap-0.5 text-base font-semibold hover:text-primary hover:underline"
          onClick={() => {
            router.push(
              `/dashboard/purchases/purchase-invoices/${qcDetails?.items?.[0]?.grn?.metaData?.invoiceDetails?.id}`,
            );
          }}
        >
          {
            qcDetails?.items?.[0]?.grn?.metaData?.invoiceDetails
              ?.referenceNumber
          }
          <MoveUpRight size={12} />
        </p>
      );
    },
  };

  const stockInQCMutation = useMutation({
    mutationFn: stockInFromQC,
    onSuccess: (data) => {
      toast.success('Stock-In successful');
      router.push(
        `/dashboard/inventory/transactions/${data?.data?.data?.stockInId}`,
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleStockIn = () => {
    const items = qcDetails?.items || [];
    const payload = items.map((item) => {
      const qcCompletedQuantity =
        Number(item.qcPassedQuantity || 0) + Number(item.qcFailedQuantity || 0);

      return {
        id: item.id,
        qcCompletedQuantity,
        qcPassedQuantity: Number(item.qcPassedQuantity || 0),
        qcFailedQuantity: Number(item.qcFailedQuantity || 0),
        qcRemarks: item.qcRemarks || '',
      };
    });

    stockInQCMutation.mutate({
      data: { items: payload },
    });
  };

  const qcItemsColumns = useQCItemsColumns();

  return (
    <ProtectedWrapper permissionCode={'permission:item-masters-view'}>
      <Wrapper className="flex min-h-screen flex-col py-2">
        {/* Headers */}
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/dashboard/inventory/qc`)}
              className="rounded-sm p-2 hover:bg-gray-100"
            >
              <ArrowLeft size={16} />
            </button>
            {/* breadcrumbs */}
            <OrderBreadCrumbs possiblePagesBreadcrumbs={itemsBreadCrumbs} />
          </div>

          {/* ctas */}
          {qcDetails?.parentStatus !== 'STOCK_IN' && (
            <div className="flex items-center gap-2">
              {qcDetails?.parentStatus !== 'COMPLETED' && (
                <Button
                  size="sm"
                  variant="blue_outline"
                  onClick={() => {
                    setIsQCDialogOpen(true);
                  }}
                >
                  Add QC
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleStockIn}
                disabled={
                  stockInQCMutation.isLoading ||
                  qcDetails?.parentStatus !== 'COMPLETED'
                }
              >
                Stock-In
              </Button>
            </div>
          )}
        </section>

        {/* Content */}
        <Tabs value={tab} onValueChange={onTabChange} defaultValue={'overview'}>
          <TabsList className="border">
            <TabsTrigger value="overview">
              {translations('tabs.tab1.title')}
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="overview"
            className="flex flex-1 flex-col gap-4 overflow-hidden"
          >
            <Overview
              collapsible={tab !== 'overview'}
              data={overviewData}
              labelMap={overviewLabels}
              customRender={customRender}
              isQC={true}
            />

            {/* comment */}
            <div>
              <CommentBox context={'QC'} contextId={params.id} />
            </div>

            {qcDetails?.items?.length > 0 && (
              <>
                <DataTable
                  data={qcDetails?.items || []}
                  columns={qcItemsColumns}
                />
              </>
            )}

            <QCItemsDialog
              open={isQCDialogOpen}
              onClose={() => setIsQCDialogOpen(false)}
              qcDetails={qcDetails}
            />
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewQC;
