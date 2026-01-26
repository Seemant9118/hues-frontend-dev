'use client';

import { stockApis } from '@/api/inventories/stocks/stocksApi';
import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import CommentBox from '@/components/comments/CommentBox';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import { Badge } from '@/components/ui/badge';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { getMaterialMovementStock } from '@/services/Inventories_Services/Stocks_Services/Stocks_Services';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MoveUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTransactionItemsColumns } from './transactionItemColumns';

const ViewTransaction = () => {
  useMetaData('Hues! - Stock Details', 'HUES Stock Details');
  const translations = useTranslations('stockTracker.stockDetails');
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
  const isStockOut = stockDetails?.transactionType === 'STOCK_OUT';

  const overviewData = {
    stockId: stockDetails?.referenceNumber || '-',
    docType: stockDetails?.docType || '-',
    ...((stockDetails?.grns?.[0]?.referenceNumber ||
      stockDetails?.dispatchNote?.dispatchReferenceNumber) && {
      docId:
        stockDetails.grns?.[0].referenceNumber ||
        stockDetails?.dispatchNote?.dispatchReferenceNumber ||
        '-',
    }),
    ...((stockDetails?.grns?.[0]?.metaData?.invoiceDetails?.referenceNumber ||
      stockDetails?.dispatchNote?.invoiceReferenceNumber) && {
      invoiceId:
        stockDetails?.grns?.[0]?.metaData?.invoiceDetails?.referenceNumber ||
        stockDetails?.dispatchNote?.invoiceReferenceNumber ||
        '-',
    }),
    ...(isStockOut &&
      stockDetails?.dispatchNote?.clientName && {
        clientName: stockDetails?.dispatchNote?.clientName || '-',
      }),
    ...(!isStockOut &&
      stockDetails?.grns?.[0]?.metaData?.sellerDetails?.name && {
        vendorName:
          stockDetails?.grns?.[0]?.metaData?.sellerDetails?.name || '-',
      }),
  };
  const overviewLabels = {
    stockId: translations('overview.labels.transactionId'),
    docType: translations('overview.labels.docType'),
    ...((stockDetails?.grns?.[0]?.referenceNumber ||
      stockDetails?.dispatchNote?.dispatchReferenceNumber) && {
      docId: translations('overview.labels.docId'),
    }),
    ...((stockDetails?.grns?.[0]?.metaData?.invoiceDetails?.referenceNumber ||
      stockDetails?.dispatchNote?.invoiceReferenceNumber) && {
      invoiceId: translations('overview.labels.invoiceId'),
    }),
    ...(isStockOut &&
      stockDetails?.dispatchNote?.clientName && {
        clientName: translations('overview.labels.clientName'),
      }),
    ...(!isStockOut &&
      stockDetails?.grns?.[0]?.metaData?.sellerDetails?.name && {
        vendorName: translations('overview.labels.vendorName'),
      }),
  };

  const customRender = {
    docType: () => {
      return (
        <Badge variant="secondary">
          {convertSnakeToTitleCase(stockDetails?.docType || '-').toUpperCase()}
        </Badge>
      );
    },
    docId: () => {
      const docId = isStockOut
        ? stockDetails?.dispatchNote?.dispatchNoteId
        : stockDetails?.grns?.[0]?.id;
      const docRef = isStockOut
        ? stockDetails?.dispatchNote?.dispatchReferenceNumber
        : stockDetails?.grns?.[0]?.referenceNumber;

      const path = isStockOut
        ? `/dashboard/transport/dispatch/${docId}`
        : `/dashboard/transport/grn/${docId}`;
      return (
        <p
          className="flex cursor-pointer items-center gap-0.5 text-base font-semibold hover:text-primary hover:underline"
          onClick={() => {
            router.push(path);
          }}
        >
          {docRef}
          <MoveUpRight size={12} />
        </p>
      );
    },
    // invoiceId
    invoiceId: () => {
      const invoiceId = isStockOut
        ? stockDetails?.dispatchNote?.invoiceId
        : stockDetails?.grns?.[0]?.metaData?.invoiceDetails?.id;
      const invoiceRef = isStockOut
        ? stockDetails?.dispatchNote?.invoiceReferenceNumber
        : stockDetails?.grns?.[0]?.metaData?.invoiceDetails?.referenceNumber;

      const path = isStockOut
        ? `/dashboard/sales/sales-invoices/${invoiceId}`
        : `/dashboard/purchases/purchase-invoices/${invoiceId}`;

      return (
        <p
          className="flex cursor-pointer items-center gap-0.5 text-base font-semibold hover:text-primary hover:underline"
          onClick={() => {
            router.push(path);
          }}
        >
          {invoiceRef}
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
