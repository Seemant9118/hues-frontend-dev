'use client';

import { stockApis } from '@/api/inventories/stocks/stocksApi';
import { getValueForMovementType } from '@/appUtils/helperFunctions';
import CommentBox from '@/components/comments/CommentBox';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { getMaterialMovementStock } from '@/services/Inventories_Services/Stocks_Services/Stocks_Services';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MoveUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import useMetaData from '@/hooks/useMetaData';
import { useTransactionItemsColumns } from './transactionItemColumns';

const ViewTransaction = () => {
  useMetaData('Hues! - Transaction Details', 'HUES Transactions Details');
  const translations = useTranslations('transactions.transactionDetails');
  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState('overview');

  const itemsBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/inventory/transactions',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/inventory/transactions/${params.id}`,
      show: true, // Always show
    },
  ];

  const onTabChange = (tab) => {
    setTab(tab);
  };

  const { data: stockDetails } = useQuery({
    queryKey: [stockApis.getMaterialMovmentStock.endpointKey, params.id],
    queryFn: () => getMaterialMovementStock({ id: params.id }),
    select: (res) => res.data.data,
    enabled: true,
  });

  const overviewData = {
    stockId: stockDetails?.referenceNumber || '-',
    docType: getValueForMovementType(stockDetails?.grns?.[0]?.movementType),
    ...(stockDetails?.grns?.[0]?.referenceNumber && {
      grnId: stockDetails.grns[0].referenceNumber,
    }),
    invoiceId:
      stockDetails?.grns?.[0]?.metaData?.invoiceDetails?.referenceNumber || '-',
    clientName: stockDetails?.grns?.[0]?.metaData?.buyerDetails?.name || '-',
    vendorName: stockDetails?.grns?.[0]?.metaData?.sellerDetails?.name || '-',
  };
  const overviewLabels = {
    stockId: translations('overview.labels.transactionId'),
    docType: translations('overview.labels.docType'),
    ...(stockDetails?.grns?.[0]?.referenceNumber && {
      grnId: translations('overview.labels.docId'),
    }),
    invoiceId: translations('overview.labels.invoiceId'),
    clientName: translations('overview.labels.clientName'),
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
              `/dashboard/transport/grn/${stockDetails?.grns?.[0]?.id}`,
            );
          }}
        >
          {stockDetails?.grns?.[0]?.referenceNumber}
          <MoveUpRight size={12} />
        </p>
      );
    },
    // invoiceId
    invoiceId: () => {
      return (
        <p
          className="flex cursor-pointer items-center gap-0.5 text-base font-semibold hover:text-primary hover:underline"
          onClick={() => {
            router.push(
              `/dashboard/purchases/purchase-invoices/${stockDetails?.grns?.[0]?.metaData?.invoiceDetails?.id}`,
            );
          }}
        >
          {stockDetails?.grns?.[0]?.metaData?.invoiceDetails?.referenceNumber}
          <MoveUpRight size={12} />
        </p>
      );
    },
  };

  const stockItemsColumns = useTransactionItemsColumns();

  return (
    <ProtectedWrapper permissionCode={'permission:item-masters-view'}>
      <Wrapper className="flex min-h-screen flex-col py-2">
        {/* Headers */}
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/dashboard/inventory/transactions`)}
              className="rounded-sm p-2 hover:bg-gray-100"
            >
              <ArrowLeft size={16} />
            </button>
            {/* breadcrumbs */}
            <OrderBreadCrumbs possiblePagesBreadcrumbs={itemsBreadCrumbs} />
          </div>
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
            className="flex flex-1 flex-col overflow-hidden"
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
              <CommentBox context={'STOCK_IN'} contextId={params.id} />
            </div>

            {stockDetails?.items?.length > 0 && (
              <>
                <h1 className="font-semibold">Items</h1>
                <DataTable
                  data={stockDetails?.items || []}
                  columns={stockItemsColumns}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewTransaction;
