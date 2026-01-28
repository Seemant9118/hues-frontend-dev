'use client';

import { stockApis } from '@/api/inventories/stocks/stocksApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import AdHocStock from '@/components/inventory/AdHocStock';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import DebouncedInput from '@/components/ui/DebouncedSearchInput';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import { getStocksItems } from '@/services/Inventories_Services/Stocks_Services/Stocks_Services';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useStocksColumns } from './stockColumns';

const PAGE_LIMIT = 10;

const Stocks = () => {
  useMetaData('Hues! - Stock', 'HUES Stock');
  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const queryClient = useQueryClient();
  const router = useRouter();
  const translations = useTranslations('stocks');
  const keys = [
    'stocks.emptyStateComponent.subItems.subItem1',
    'stocks.emptyStateComponent.subItems.subItem2',
    'stocks.emptyStateComponent.subItems.subItem3',
    'stocks.emptyStateComponent.subItems.subItem4',
  ];
  const { hasPermission } = usePermission();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCycle, setSearchCycle] = useState(0);
  const [stocksList, setStocksList] = useState(null);
  const [paginationData, setPaginationData] = useState(null);
  const [filter, setFilter] = useState(null);
  const [tab, setTab] = useState('ALL');
  const [isAddingAdHocStockIn, setIsAddingAdHocStockIn] = useState(false);
  // const [isAddingAdHocStockOut, setIsAddingAdHocStockOut] = useState(false);

  const isSearching = searchTerm?.length > 0;
  const hasData = stocksList?.length > 0;

  const onTabChange = (tab) => {
    setTab(tab);
    setFilter(tab);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val.trim() ?? '');

    // increment when clearing
    if (val === '') {
      setSearchCycle((prev) => prev + 1);
    }
  };

  const stocksQuery = useInfiniteQuery({
    queryKey: [
      stockApis.getStocksItems.endpointKey,
      filter,
      searchTerm,
      searchCycle,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return getStocksItems({
        enterpriseId,
        page: pageParam,
        limit: PAGE_LIMIT,
        filter,
        searchString: searchTerm,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    enabled: hasPermission('permission:item-masters-view'),
    staleTime: Infinity, // data never becomes stale
    refetchOnMount: false, // don’t refetch on remount
    refetchOnWindowFocus: false, // already correct
  });

  useEffect(() => {
    const source = stocksQuery.data;
    if (!source?.pages?.length) return;

    // Flatten all pages
    const flattened = source.pages.flatMap(
      (page) => page?.data?.data?.data || [],
    );

    // Remove duplicates using inventoryid + bucketid
    // (same inventory can exist in multiple buckets)
    const uniqueStocksListData = Array.from(
      new Map(
        flattened.map((item) => [`${item.inventoryid}-${item.bucketid}`, item]),
      ).values(),
    );

    setStocksList(uniqueStocksListData);

    // Pagination info from last page
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;

    setPaginationData({
      totalPages: Number(lastPage?.totalPages ?? 0),
      currFetchedPage: Number(lastPage?.currentPage ?? 0),
    });
  }, [stocksQuery.data]);

  const stocksColumns = useStocksColumns();

  const onRowClick = (row) => {
    return router.push(`/dashboard/inventory/stocks/${row.inventoryid}`);
  };

  return (
    <ProtectedWrapper permissionCode="permission:item-masters-view">
      {!enterpriseId || !isEnterpriseOnboardingComplete ? (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      ) : (
        <>
          {!isAddingAdHocStockIn && (
            <Wrapper>
              <SubHeader name={translations('title')}>
                <div className="flex items-center justify-center gap-2">
                  <DebouncedInput
                    value={searchTerm}
                    delay={400}
                    onDebouncedChange={handleSearchChange}
                    placeholder="Search Stock..."
                  />

                  <Button
                    size="sm"
                    onClick={() => {
                      setIsAddingAdHocStockIn(true);
                    }}
                  >
                    <CheckCircle size={14} /> Stock In
                  </Button>
                </div>
              </SubHeader>

              <Tabs
                value={tab}
                onValueChange={onTabChange}
                defaultValue={'All'}
              >
                <TabsList className="border">
                  <TabsTrigger value="ALL">
                    {translations('tabs.tab1.title')}
                  </TabsTrigger>
                  <TabsTrigger value="RAW_MATERIALS">
                    {translations('tabs.tab2.title')}
                  </TabsTrigger>
                  <TabsTrigger value="INTERMEDIATE_GOODS">
                    {translations('tabs.tab3.title')}
                  </TabsTrigger>
                  <TabsTrigger value="FINISHED_GOODS">
                    {translations('tabs.tab4.title')}
                  </TabsTrigger>
                  <TabsTrigger value="QC">
                    {translations('tabs.tab5.title')}
                  </TabsTrigger>
                  <TabsTrigger value="REJECTED">
                    {translations('tabs.tab6.title')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="ALL"
                  className="flex flex-1 flex-col overflow-hidden"
                >
                  {stocksQuery.isLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!hasData && !isSearching ? (
                        <EmptyStageComponent
                          heading={translations('emptyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: data is available → Show Table
                        <InfiniteDataTable
                          id="qc-table"
                          columns={stocksColumns}
                          data={hasData ? stocksList : []}
                          fetchNextPage={stocksQuery.fetchNextPage}
                          isFetching={stocksQuery.isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                        />
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="RAW_MATERIALS">
                  {stocksQuery.isLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!hasData && !isSearching ? (
                        <EmptyStageComponent
                          heading={translations('emptyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: data is available → Show Table
                        <InfiniteDataTable
                          id="qc-table"
                          columns={stocksColumns}
                          data={hasData ? stocksList : []}
                          fetchNextPage={stocksQuery.fetchNextPage}
                          isFetching={stocksQuery.isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                        />
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="INTERMEDIATE_GOODS">
                  {stocksQuery.isLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!hasData && !isSearching ? (
                        <EmptyStageComponent
                          heading={translations('emptyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: data is available → Show Table
                        <InfiniteDataTable
                          id="qc-table"
                          columns={stocksColumns}
                          data={hasData ? stocksList : []}
                          fetchNextPage={stocksQuery.fetchNextPage}
                          isFetching={stocksQuery.isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                        />
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="FINISHED_GOODS">
                  {stocksQuery.isLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!hasData && !isSearching ? (
                        <EmptyStageComponent
                          heading={translations('emptyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: data is available → Show Table
                        <InfiniteDataTable
                          id="qc-table"
                          columns={stocksColumns}
                          data={hasData ? stocksList : []}
                          fetchNextPage={stocksQuery.fetchNextPage}
                          isFetching={stocksQuery.isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                        />
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="QC">
                  {stocksQuery.isLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!hasData && !isSearching ? (
                        <EmptyStageComponent
                          heading={translations('emptyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: data is available → Show Table
                        <InfiniteDataTable
                          id="qc-table"
                          columns={stocksColumns}
                          data={hasData ? stocksList : []}
                          fetchNextPage={stocksQuery.fetchNextPage}
                          isFetching={stocksQuery.isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                        />
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="REJECTED">
                  {stocksQuery.isLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!hasData && !isSearching ? (
                        <EmptyStageComponent
                          heading={translations('emptyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: data is available → Show Table
                        <InfiniteDataTable
                          id="qc-table"
                          columns={stocksColumns}
                          data={hasData ? stocksList : []}
                          fetchNextPage={stocksQuery.fetchNextPage}
                          isFetching={stocksQuery.isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                        />
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </Wrapper>
          )}

          {isAddingAdHocStockIn && (
            <AdHocStock
              isStockIn={true}
              name={'AdHoc - (Stock In)'}
              onClose={() => {
                setIsAddingAdHocStockIn((prev) => !prev);
                queryClient.invalidateQueries([
                  stockApis.getStocksItems.endpointKey,
                ]);
              }}
            />
          )}

          {/* {isAddingAdHocStockOut && !isAddingAdHocStockIn && (
            <AdHocStock
              isStockIn={false}
              name={'AdHoc - (Stock Out)'}
              onClose={() => {
                setIsAddingAdHocStockOut((prev) => !prev);
                queryClient.invalidateQueries([
                  stockApis.getStocksItems.endpointKey,
                ]);
              }}
            />
          )} */}
        </>
      )}
    </ProtectedWrapper>
  );
};

export default Stocks;
