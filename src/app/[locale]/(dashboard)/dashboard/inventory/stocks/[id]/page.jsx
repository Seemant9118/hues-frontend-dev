'use client';

import { stockApis } from '@/api/inventories/stocks/stocksApi';
import {
  convertSnakeToTitleCase,
  formattedAmount,
  getEnterpriseId,
} from '@/appUtils/helperFunctions';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useStockContext } from '@/context/StockContext';
import useMetaData from '@/hooks/useMetaData';
import { getStockDetails } from '@/services/Inventories_Services/Stocks_Services/Stocks_Services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import emptyImg from '../../../../../../../../public/Empty.png';
import { useStockItemColumns } from './useStockItemColumns';

const PAGE_LIMIT = 10;

const ViewStock = () => {
  useMetaData('Hues! - Stock Details', 'HUES Stock Details');
  const translations = useTranslations('stocks.stockDetails');
  const enterpriseId = getEnterpriseId();
  const router = useRouter();
  const params = useParams();

  const { getStockData } = useStockContext();
  const stockData = getStockData(params.id);

  const [tab, setTab] = useState('overview');
  const [stockLedger, setStockLedger] = useState(null);
  const [paginationData, setPaginationData] = useState([]);

  const itemsBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/inventory/stocks',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/inventory/stocks/${params.id}`,
      show: true, // Always show
    },
  ];

  const onTabChange = (tab) => {
    setTab(tab);
  };

  const inventoryItemIds =
    stockData?.batches?.map((item) => item.inventoryId) || [];

  // overview component data
  const overviewData = {
    productName: stockData?.productName,
    skuId: stockData?.skuId,
    bucketType: stockData?.bucketType,
    availableQuantity: stockData?.availableQuantity,
    unitPrice: formattedAmount(stockData?.unitPrice),
    totalPrice: formattedAmount(stockData?.totalPrice),
  };
  const customRender = {
    bucketType: () => {
      return (
        <Badge variant="secondary">
          {convertSnakeToTitleCase(stockData?.bucketType)}
        </Badge>
      );
    },
  };
  const overviewLabelMap = {
    productName: 'Product Name',
    skuId: 'SKU ID',
    bucketType: 'Bucket',
    availableQuantity: 'Available Quantity',
    unitPrice: 'Unit Price',
    totalPrice: 'Total Price',
  };

  // DataTable - Batches
  const batches = stockData?.batches || [];
  const batchColumns = [
    {
      accessorKey: 'batchNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Batch No" />
      ),
      cell: ({ row }) => row.original.batchNo || 'Not Available',
    },
    {
      accessorKey: 'expiryDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expiry Date" />
      ),
      cell: ({ row }) => row.original.expiryDate || 'Not Available',
    },
    {
      accessorKey: 'availableQuantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Available Quantity" />
      ),
      cell: ({ row }) => row.original.availableQuantity || 0,
    },
  ];

  // api to fetch ledger data
  const stocksDetailsQuery = useInfiniteQuery({
    queryKey: [
      stockApis.getStockDetails.endpointKey,
      params.id,
      inventoryItemIds,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return getStockDetails({
        enterpriseId,
        productId: params.id,
        inventoryItemIds,
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    staleTime: Infinity, // data never becomes stale
    refetchOnMount: false, // don’t refetch on remount
    refetchOnWindowFocus: false, // already correct
  });
  useEffect(() => {
    const source = stocksDetailsQuery.data;
    if (!source?.pages?.length) return;

    // ✅ Flatten ledger rows from all pages
    const flattenedLedger = source.pages.flatMap(
      (page) => page?.data?.data?.data || [],
    );

    // ❗ No deduplication for ledger data
    setStockLedger(flattenedLedger);

    // ✅ Pagination info from last page
    const lastPageData = source.pages[source.pages.length - 1]?.data?.data;

    setPaginationData({
      totalPages: Number(lastPageData?.totalPages ?? 0),
      currFetchedPage: Number(lastPageData?.page ?? 0),
    });
  }, [stocksDetailsQuery.data]);

  const stockItemsColumns = useStockItemColumns();

  return (
    <ProtectedWrapper permissionCode={'permission:item-masters-view'}>
      <Wrapper className="flex min-h-screen flex-col py-2">
        {/* Headers */}
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white">
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/dashboard/inventory/stocks`)}
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ledger">Ledger</TabsTrigger>
          </TabsList>
          <TabsContent
            value="overview"
            className="flex flex-1 flex-col gap-2 overflow-hidden"
          >
            <Overview
              sectionClass="grid grid-cols-3 gap-3"
              data={overviewData}
              labelMap={overviewLabelMap}
              customRender={customRender}
            />

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold">Batches</h3>
              <DataTable
                columns={batchColumns}
                data={batches}
                id="batch-table"
              />
            </div>
          </TabsContent>
          <TabsContent
            value="ledger"
            className="flex flex-1 flex-col overflow-hidden"
          >
            {stocksDetailsQuery?.isLoading && <Loading />}
            {!stocksDetailsQuery?.isLoading && stockLedger?.length === 0 && (
              <div className="flex h-[55vh] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                <Image src={emptyImg} alt="emptyIcon" />
                <p className="font-bold">
                  {translations('tabs.content.tab3.emtpyStateComponent.title')}
                </p>
                <p className="max-w-96 text-center">
                  {translations('tabs.content.tab3.emtpyStateComponent.para')}
                </p>
              </div>
            )}
            {!stocksDetailsQuery?.isLoading && stockLedger?.length > 0 && (
              <>
                <InfiniteDataTable
                  id="qc-table"
                  columns={stockItemsColumns}
                  data={stockLedger}
                  fetchNextPage={stocksDetailsQuery.fetchNextPage}
                  isFetching={stocksDetailsQuery.isFetching}
                  totalPages={paginationData?.totalPages}
                  currFetchedPage={paginationData?.currFetchedPage}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewStock;
