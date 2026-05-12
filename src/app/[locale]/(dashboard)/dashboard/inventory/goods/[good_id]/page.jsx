'use client';

import { batchApi } from '@/api/inventories/goods/batch';
import { goodsApi } from '@/api/inventories/goods/goods';
import { stockApis } from '@/api/inventories/stocks/stocksApi';
import { formattedAmount, getEnterpriseId } from '@/appUtils/helperFunctions';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TruncateAndShowInfo } from '@/components/ui/TruncateAndShowInfo';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useStockContext } from '@/context/StockContext';
import useMetaData from '@/hooks/useMetaData';
import {
  DeleteProductGoods,
  GetProductGoods,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';
import { getStocksItems } from '@/services/Inventories_Services/Stocks_Services/Stocks_Services';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ArrowLeft, CircleFadingPlus, Pencil } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useBatchColumns } from '../../batch/BatchColumns';
import { BatchTable } from '../../batch/BatchTable';
import { useStocksColumns } from '../../stocks/stockColumns';

const EditGoods = dynamic(() => import('@/components/inventory/AddGoods'), {
  loading: () => <Loading />,
});

const AddBatch = dynamic(
  () => import('@/components/inventory/batch/AddBatch'),
  {
    loading: () => <Loading />,
  },
);

const QuickStockInModal = dynamic(
  () => import('@/components/inventory/QuickStockInModal'),
  {
    loading: () => <Loading />,
  },
);

const ViewItem = () => {
  useMetaData('Hues! - Goods Details', 'HUES Goods Details');
  const translations = useTranslations('goods.goodDetails');
  const { setStockData } = useStockContext();
  const enterpriseId = getEnterpriseId();
  const router = useRouter();
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [goodsToEdit, setGoodsToEdit] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Batch states
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [isEditingBatch, setIsEditingBatch] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState(null);

  // Quick Stock In state
  const [isQuickStockInOpen, setIsQuickStockInOpen] = useState(false);

  const itemsBreadCrumbs = [
    {
      id: 1,
      name: translations('title.items'),
      path: '/dashboard/inventory/goods',
      show: true,
    },
    {
      id: 2,
      name: translations('title.item_details'),
      path: `/dashboard/inventory/goods/${params.good_id}`,
      show: true,
    },
  ];

  // Item details fetching
  const { data: itemDetails, isLoading: isItemLoading } = useQuery({
    queryKey: [goodsApi.getProductGoods.endpointKey, params.good_id],
    queryFn: () => GetProductGoods(params.good_id),
    select: (res) => res.data.data,
  });

  // Stocks Query
  const stocksQuery = useInfiniteQuery({
    queryKey: [stockApis.getStocksItems.endpointKey, params.good_id],
    queryFn: async ({ pageParam = 1 }) => {
      return getStocksItems({
        enterpriseId,
        page: pageParam,
        limit: 10,
        productId: params.good_id,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    enabled: activeTab === 'stocks' && !!enterpriseId,
  });

  const stocksList = stocksQuery.data?.pages?.flatMap(
    (page) => page?.data?.data?.data || [],
  );
  const lastStockPage =
    stocksQuery.data?.pages[stocksQuery.data.pages.length - 1]?.data?.data;

  // Batches Query
  const batchQuery = useInfiniteQuery({
    queryKey: [batchApi.listBatches.endpointKey, itemDetails?.skuId],
    queryFn: async ({ pageParam = 0 }) =>
      GetProductBatchList({
        searchString: itemDetails?.skuId,
        skip: pageParam,
        limit: 10,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const data = lastPage?.data?.data;
      const totalItems = data?.totalItems || 0;
      const nextSkip = allPages.length * 10;
      return nextSkip < totalItems ? nextSkip : undefined;
    },
    enabled: activeTab === 'batches' && !!itemDetails?.skuId,
  });

  const batches = batchQuery.data?.pages?.flatMap(
    (page) => page?.data?.data?.data || [],
  );

  const productInfoData = {
    productName: itemDetails?.productName,
    skuId: itemDetails?.skuId || 'Not available',
    huesId: itemDetails?.huesId || 'Not available',
    createdAt: moment(itemDetails?.createdAt).format('DD-MM-YYYY'),
    updatedAt: moment(itemDetails?.updatedAt).format('DD-MM-YYYY'),
    description: itemDetails?.description,
  };

  const productInfoLabel = {
    productName: translations('overview_labels.productName'),
    skuId: translations('overview_labels.skuId'),
    huesId: translations('overview_labels.huesId'),
    createdAt: translations('overview_labels.createdAt'),
    updatedAt: translations('overview_labels.updatedAt'),
    description: translations('overview_labels.description'),
  };

  const customRender = {
    description: (value) => <TruncateAndShowInfo text={value} />,
  };

  const pricingData = {
    salesPrice: formattedAmount(itemDetails?.salesPrice),
    mrp: formattedAmount(itemDetails?.mrp),
    unit: itemDetails?.unit?.name || 'Not available',
  };
  const pricingLabel = {
    salesPrice: translations('overview_labels.salesPrice'),
    mrp: translations('overview_labels.mrp'),
    unit: 'Unit',
  };

  const taxComplianceData = {
    hsnCode: itemDetails?.hsnCode,
    gstPercentage: `${itemDetails?.gstPercentage}%`,
  };
  const taxComplianceLabel = {
    hsnCode: translations('overview_labels.hsnCode'),
    gstPercentage: translations('overview_labels.gstPercentage'),
  };

  const handleSetIsEditingBatch = (val, batch = null) => {
    setIsEditingBatch(val);
    if (batch) setBatchToEdit(batch);
    else setBatchToEdit(null);
  };

  const stocksColumns = useStocksColumns();
  const batchColumns = useBatchColumns(handleSetIsEditingBatch);

  if (isItemLoading) return <Loading />;

  return (
    <ProtectedWrapper permissionCode={'permission:item-masters-view'}>
      {!isEditing && !isAddingBatch && !isEditingBatch && (
        <Wrapper className="h-full py-1">
          {/* Headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => router.back()}
                className="rounded-sm p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={16} />
              </button>
              <OrderBreadCrumbs possiblePagesBreadcrumbs={itemsBreadCrumbs} />
            </div>

            <div className="flex gap-2">
              <ProtectedWrapper permissionCode="permission:item-masters-edit">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    setIsEditing((prev) => !prev);
                    e.stopPropagation();
                    setGoodsToEdit(itemDetails);
                  }}
                >
                  <Pencil size={12} />
                  {translations('ctas.edit')}
                </Button>
              </ProtectedWrapper>
              <ProtectedWrapper permissionCode="permission:item-masters-delete">
                <ConfirmAction
                  deleteCta={translations('ctas.delete')}
                  infoText={translations('ctas.infoText', {
                    name: itemDetails?.productName,
                  })}
                  cancelCta={translations('ctas.cancel')}
                  id={itemDetails?.id}
                  mutationKey={goodsApi.getAllProductGoods.endpointKey}
                  mutationFunc={DeleteProductGoods}
                  successMsg={translations('ctas.successMsg')}
                  invalidateKey={goodsApi.getAllProductGoods.endpointKey}
                  redirectedTo={() => router.push('/dashboard/inventory/goods')}
                />
              </ProtectedWrapper>
            </div>
          </section>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col"
          >
            <section className="flex items-center justify-between">
              <TabsList className="w-fit">
                <TabsTrigger value="overview">
                  {translations('tabs.tab1.title')}
                </TabsTrigger>
                <TabsTrigger value="stocks">
                  {translations('tabs.tab2.title')}
                </TabsTrigger>
                <TabsTrigger value="batches">
                  {translations('tabs.tab3.title')}
                </TabsTrigger>
              </TabsList>
              {activeTab === 'batches' && (
                <Button
                  variant="blue_outline"
                  onClick={() => setIsAddingBatch(true)}
                  size="sm"
                >
                  <CircleFadingPlus size={14} />
                  Add Batch
                </Button>
              )}

              {activeTab === 'stocks' && (
                <Button
                  size="sm"
                  variant="blue_outline"
                  onClick={() => setIsQuickStockInOpen(true)}
                >
                  {translations('messages.quickStockIn')}
                </Button>
              )}
            </section>

            <TabsContent value="overview" className="flex flex-col">
              <section className="grid grid-cols-1 gap-4">
                <div className="px-2">
                  <div className="mb-4 border-b pb-2">
                    <h2 className="text-lg font-semibold text-primary">
                      Basic Information
                    </h2>
                    <p className="text-sm text-gray-500">
                      Core product details
                    </p>
                  </div>
                  <Overview
                    sectionClass="grid grid-cols-1 md:grid-cols-3 gap-6"
                    data={productInfoData}
                    labelMap={productInfoLabel}
                    customRender={customRender}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 px-2 md:grid-cols-2">
                  <div>
                    <div className="mb-4 border-b pb-2">
                      <h2 className="text-lg font-semibold text-primary">
                        Pricing
                      </h2>
                      <p className="text-sm text-gray-500">
                        Sales price and MRP details
                      </p>
                    </div>
                    <Overview
                      sectionClass="grid grid-cols-1 md:grid-cols-2 gap-6"
                      data={pricingData}
                      labelMap={pricingLabel}
                    />
                  </div>

                  <div>
                    <div className="mb-4 border-b pb-2">
                      <h2 className="text-lg font-semibold text-primary">
                        Tax & Compliance
                      </h2>
                      <p className="text-sm text-gray-500">
                        HSN and GST information
                      </p>
                    </div>
                    <Overview
                      sectionClass="grid grid-cols-1 md:grid-cols-2 gap-6"
                      data={taxComplianceData}
                      labelMap={taxComplianceLabel}
                    />
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="stocks" className="flex flex-col gap-2">
              {stocksQuery.isLoading ? (
                <Loading />
              ) : stocksList && stocksList.length > 0 ? (
                <InfiniteDataTable
                  id="product-stocks-table"
                  columns={stocksColumns}
                  data={stocksList || []}
                  fetchNextPage={stocksQuery.fetchNextPage}
                  isFetching={stocksQuery.isFetching}
                  totalPages={lastStockPage?.totalPages}
                  currFetchedPage={lastStockPage?.currentPage}
                  onRowClick={(row) => {
                    setStockData(row);
                    router.push(`/dashboard/inventory/stocks/${row.productId}`);
                  }}
                />
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                  {translations('messages.noStocks')}
                </div>
              )}
            </TabsContent>

            <TabsContent value="batches" className="flex flex-col gap-2">
              {batchQuery.isLoading ? (
                <Loading />
              ) : batches && batches.length > 0 ? (
                <BatchTable
                  id="product-batch-table"
                  columns={batchColumns}
                  data={batches || []}
                  fetchNextPage={batchQuery.fetchNextPage}
                  isFetching={batchQuery.isFetching}
                  hasNextPage={batchQuery.hasNextPage}
                />
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                  {translations('messages.noBatches')}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Wrapper>
      )}

      {isEditing && (
        <EditGoods
          setIsCreatingGoods={setIsEditing}
          goodsToEdit={goodsToEdit}
        />
      )}

      {isAddingBatch && (
        <AddBatch
          setIsAdding={setIsAddingBatch}
          setIsEditing={setIsEditingBatch}
          batchToEdit={null}
        />
      )}

      {isEditingBatch && (
        <AddBatch
          setIsAdding={setIsAddingBatch}
          setIsEditing={setIsEditingBatch}
          batchToEdit={batchToEdit}
        />
      )}

      {isQuickStockInOpen && (
        <QuickStockInModal
          isOpen={isQuickStockInOpen}
          onClose={() => setIsQuickStockInOpen(false)}
          product={itemDetails}
        />
      )}
    </ProtectedWrapper>
  );
};

export default ViewItem;
