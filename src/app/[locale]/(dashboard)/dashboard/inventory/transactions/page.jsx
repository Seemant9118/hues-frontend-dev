'use client';

import { stockApis } from '@/api/inventories/stocks/stocksApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import InfiniteDataTable from '@/components/table/infinite-data-table';
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
import { getMaterialMovementStocks } from '@/services/Inventories_Services/Stocks_Services/Stocks_Services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useTrasnsactionsColumns } from './transactionColumns';

const PAGE_LIMIT = 10;

const Transactions = () => {
  useMetaData('Hues! - Transactions', 'HUES Transactions');

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const translations = useTranslations('transactions');
  const keys = [
    'transactions.emptyStateComponent.subItems.subItem1',
    'transactions.emptyStateComponent.subItems.subItem2',
    'transactions.emptyStateComponent.subItems.subItem3',
    'transactions.emptyStateComponent.subItems.subItem4',
  ];
  const { hasPermission } = usePermission();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCycle, setSearchCycle] = useState(0);
  const [stocksList, setStocksList] = useState(null);
  const [paginationData, setPaginationData] = useState(null);
  const [filter, setFilter] = useState(null);
  const [tab, setTab] = useState('All');

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
      stockApis.getMaterialMovementStocks.endpointKey,
      filter,
      searchTerm,
      searchCycle,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return getMaterialMovementStocks({
        page: pageParam,
        limit: PAGE_LIMIT,
        searchString: searchTerm,
        filter,
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

    // flatten items from all pages
    const flattened = source.pages.flatMap(
      (page) => page?.data?.data?.data || [],
    );

    // remove duplicates by id
    const uniqueStocksListData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );

    setStocksList(uniqueStocksListData);
    // pagination from last page
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;

    setPaginationData({
      totalPages: Number(lastPage?.totalPages ?? 0),
      currFetchedPage: Number(lastPage?.page ?? 0),
    });
  }, [stocksQuery.data]);

  const onRowClick = (row) => {
    return router.push(`/dashboard/inventory/transactions/${row.id}`);
  };

  const stocksColumns = useTrasnsactionsColumns();

  return (
    <ProtectedWrapper permissionCode="permission:item-masters-view">
      {!enterpriseId || !isEnterpriseOnboardingComplete ? (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      ) : (
        <Wrapper className="h-screen">
          <SubHeader name={translations('title')}>
            <div className="flex items-center justify-center gap-2">
              <DebouncedInput
                value={searchTerm}
                delay={400}
                onDebouncedChange={handleSearchChange}
                placeholder="Search Transactions"
              />
            </div>
          </SubHeader>

          <Tabs value={tab} onValueChange={onTabChange} defaultValue={'All'}>
            <TabsList className="border">
              <TabsTrigger value="All">
                {translations('tabs.tab1.title')}
              </TabsTrigger>
              <TabsTrigger value="inward">
                {translations('tabs.tab2.title')}
              </TabsTrigger>
              <TabsTrigger value="outward">
                {translations('tabs.tab3.title')}
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="All"
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
            <TabsContent value="inward">
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
            <TabsContent value="outward">
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
    </ProtectedWrapper>
  );
};

export default Transactions;
