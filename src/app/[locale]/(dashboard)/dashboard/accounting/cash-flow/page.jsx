'use client';

import { accountingAPIs } from '@/api/accounting/accountingAPIs';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { getCashFlow } from '@/services/Accounting_Services/AccountingServices';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Skeleton } from 'boneyard-js/react';
import { RefreshCw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useCashFlowColumns } from './useCashFlowColumns';

const PAGE_LIMIT = 10;

const getEntriesFromPage = (page) => {
  const payload = page?.data?.data ?? page?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.entries)) return payload.entries;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getPaginationFromPage = (page) => {
  const payload = page?.data?.data ?? page?.data ?? {};
  return {
    totalPages: payload?.totalPages || 0,
    currFetchedPage: payload?.currentPage || payload?.page || 1,
  };
};

const CashFlow = () => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'actual';
    }
    return 'actual';
  });
  const enterpriseId = getEnterpriseId();

  const [actualEntries, setActualEntries] = useState(null);
  const [actualPagination, setActualPagination] = useState(null);
  const [actualSearch, setActualSearch] = useState('');
  const [impendingEntries, setImpendingEntries] = useState(null);
  const [impendingPagination, setImpendingPagination] = useState(null);
  const [impendingSearch, setImpendingSearch] = useState('');

  // columns
  const actualColumns = useCashFlowColumns({ tab: 'actual' });
  const impendingColumns = useCashFlowColumns({ tab: 'impending' });

  const {
    data: actualRes,
    fetchNextPage: fetchNextActualPage,
    isFetching: isActualFetching,
    isLoading: isActualLoading,
    refetch: refetchActual,
  } = useInfiniteQuery({
    queryKey: [
      accountingAPIs.getCashFlow.endpointKey,
      'actual',
      enterpriseId,
      { page: 1, limit: PAGE_LIMIT },
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getCashFlow({
        enterpriseId,
        page: pageParam,
        limit: PAGE_LIMIT,
        category: 'ACTUAL',
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      const totalPages =
        _lastGroup?.data?.totalPages || _lastGroup?.data?.data?.totalPages || 0;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!enterpriseId && activeTab === 'actual',
  });

  const {
    data: impendingRes,
    fetchNextPage: fetchNextImpendingPage,
    isFetching: isImpendingFetching,
    isLoading: isImpendingLoading,
    refetch: refetchImpending,
  } = useInfiniteQuery({
    queryKey: [
      accountingAPIs.getCashFlow.endpointKey,
      'impending',
      enterpriseId,
      { page: 1, limit: PAGE_LIMIT },
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getCashFlow({
        enterpriseId,
        page: pageParam,
        limit: PAGE_LIMIT,
        category: 'PIPELINE,FORECAST,RECEIVABLE',
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      const totalPages =
        _lastGroup?.data?.totalPages || _lastGroup?.data?.data?.totalPages || 0;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!enterpriseId && activeTab === 'impending',
  });

  useEffect(() => {
    if (!actualRes?.pages) return;

    const flattened = actualRes.pages.flatMap((page) =>
      getEntriesFromPage(page),
    );

    const unique = Array.from(
      new Map(flattened.map((entry) => [entry.id, entry])).values(),
    );

    setActualEntries(unique.length ? unique : []);

    const lastPage = actualRes.pages[actualRes.pages.length - 1];
    const basePagination = getPaginationFromPage(lastPage);
    setActualPagination(
      unique.length ? basePagination : { totalPages: 1, currFetchedPage: 1 },
    );
  }, [actualRes]);

  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (activeTab === 'actual') {
      refetchActual();
      return;
    }

    refetchImpending();
  }, [activeTab, refetchActual, refetchImpending]);

  useEffect(() => {
    if (!impendingRes?.pages) return;

    const flattened = impendingRes.pages.flatMap((page) =>
      getEntriesFromPage(page),
    );

    const unique = Array.from(
      new Map(flattened.map((entry) => [entry.id, entry])).values(),
    );

    setImpendingEntries(unique);

    const lastPage = impendingRes.pages[impendingRes.pages.length - 1];
    setImpendingPagination(getPaginationFromPage(lastPage));
  }, [impendingRes]);

  const renderTable = (
    columns,
    isLoading,
    isFetching,
    entries,
    fetchNextPage,
    pagination,
    tableId,
    emptyHeading,
  ) => {
    if (!entries?.length && !isLoading) {
      return <EmptyStageComponent heading={emptyHeading} />;
    }

    const displayEntries =
      entries ||
      Array.from({ length: PAGE_LIMIT }, (_, i) => ({
        id: `mock-id-${i}`,
        entryNumber: '—',
        transactionDate: null,
        description: '—',
        category: '',
        sourceRef: '—',
        inflow: null,
        outflow: null,
        netAmount: null,
        status: '—',
      }));

    return (
      <InfiniteDataTable
        id={tableId}
        columns={columns}
        data={displayEntries}
        fetchNextPage={fetchNextPage}
        isFetching={isFetching}
        totalPages={pagination?.totalPages}
        currFetchedPage={pagination?.currFetchedPage}
      />
    );
  };

  return (
    <Skeleton
      name="cashFlow"
      loading={activeTab === 'actual' ? isActualLoading : isImpendingLoading}
    >
      <Wrapper className="flex h-screen flex-col gap-2">
        <section className="flex items-center justify-between">
          <SubHeader
            name={
              activeTab === 'actual'
                ? 'Actual Registers'
                : 'Impending Registers'
            }
          />
          <div className="flex items-center gap-2">
            <Button disabled size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Bank
            </Button>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <section className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="actual">Actual</TabsTrigger>
              <TabsTrigger value="impending">Impending Register</TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                disabled
                toSearchTerm={
                  activeTab === 'actual' ? actualSearch : impendingSearch
                }
                setToSearchTerm={
                  activeTab === 'actual' ? setActualSearch : setImpendingSearch
                }
                searchPlaceholder="Search transactions, references..."
                className="w-[360px] rounded-sm border border-gray-200 bg-white text-sm"
              />
            </div>
          </section>

          <TabsContent value="actual" className="flex flex-col gap-3">
            {renderTable(
              actualColumns,
              isActualLoading,
              isActualFetching,
              actualEntries,
              fetchNextActualPage,
              actualPagination,
              'cash-flow-actual-table',
              'No Actual Cash Flow Entries Found',
            )}
          </TabsContent>

          <TabsContent value="impending" className="flex flex-col gap-3">
            {renderTable(
              impendingColumns,
              isImpendingLoading,
              isImpendingFetching,
              impendingEntries,
              fetchNextImpendingPage,
              impendingPagination,
              'cash-flow-impending-table',
              'No Impending Cash Flow Entries Found',
            )}
          </TabsContent>
        </Tabs>
      </Wrapper>
    </Skeleton>
  );
};

const CashFlowPage = () => (
  <FeatureFlagWrapper flag="ACCOUNTING.CASHFLOW" redirectTo="/dashboard">
    <CashFlow />
  </FeatureFlagWrapper>
);

export default CashFlowPage;
