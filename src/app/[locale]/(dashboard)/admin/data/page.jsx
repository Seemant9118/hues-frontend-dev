'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import Loading from '@/components/ui/Loading';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { useRBAC } from '@/context/RBACcontext';
import {
  getEnterprisesData,
  getOnboardingData,
} from '@/services/Admin_Services/AdminServices';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { ServerOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { InfiniteDataTable } from './InfiniteDataTable';
import { useEnterpriseDataColumns } from './useEnterpriseDataColumns';
import { useOnboardingDataColumns } from './useOnboardingDataColumns';

// macros
const PAGE_LIMIT = 10;

const DataPage = () => {
  const router = useRouter();
  const { hasPageAccess, canPerformAction } = useRBAC();
  const [enterprisesData, setEnterprisesData] = useState([]);
  const [onboardingData, setOnboardingData] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [tab, setTab] = useState('onboarding');

  const onTabChange = (value) => {
    setTab(value);
  };

  // fetch onboarding data
  const {
    data: onboardingQuery,
    isLoading: isOnboardingQueryLoading,
    fetchNextPage: onboardingQueryFetchNextPage,
    isFetching: isOnboardingQueryFetching,
  } = useInfiniteQuery({
    queryKey: [AdminAPIs.getOnboardingData.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getOnboardingData({
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = (groups?.length ?? 0) + 1;
      const totalPages = _lastGroup?.data?.data?.totalPages ?? 0;

      return nextPage <= totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled:
      canPerformAction('adminReports', 'fetchedAdminData') &&
      tab === 'onboarding',
  });

  useEffect(() => {
    const source = onboardingQuery;
    if (!source) return;
    const flattened = source?.pages?.flatMap(
      (page) => page?.data?.data?.data || [],
    );
    const uniqueData = Array.from(
      new Map(flattened?.map((item) => [item.id, item])).values(),
    );
    setOnboardingData(uniqueData);
    const lastPage = source?.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: Number(lastPage?.currentPage),
    });
  }, [onboardingQuery]);

  // fetch enterprises data
  const {
    data: dataQuery,
    isLoading: isDataQueryLoading,
    fetchNextPage: dataQueryFetchNextPage,
    isFetching: isDataQueryFetching,
  } = useInfiniteQuery({
    queryKey: [AdminAPIs.getEnterpriseData.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getEnterprisesData({
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = (groups?.length ?? 0) + 1;
      const totalPages = _lastGroup?.data?.data?.totalPages ?? 0;

      return nextPage <= totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled:
      canPerformAction('adminReports', 'fetchedAdminData') && tab === 'sales',
  });

  useEffect(() => {
    const source = dataQuery;
    if (!source) return;
    const flattened = source?.pages?.flatMap(
      (page) => page?.data?.data?.data || [],
    );
    const uniqueData = Array.from(
      new Map(flattened?.map((item) => [item.enterprise_id, item])).values(),
    );
    setEnterprisesData(uniqueData);
    const lastPage = source?.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: Number(lastPage?.currentPage),
    });
  }, [dataQuery]);

  const onRowClick = (row) => {
    router.push(`/admin/data/${row.id}`);
  };

  const enterpriseDataColumns = useEnterpriseDataColumns();
  const onboardingDataColumns = useOnboardingDataColumns();

  useEffect(() => {
    if (!hasPageAccess('adminReports')) {
      router.replace('/unauthorized');
    }
  }, []);

  return (
    <Wrapper className="flex h-screen flex-col overflow-hidden">
      <>
        {/* headers */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white p-1">
          <SubHeader name="Data" />
          <SearchInput searchPlaceholder="Search..." disabled={true} />
        </div>
        <Tabs
          value={tab}
          onValueChange={onTabChange}
          defaultValue="overview"
          className="flex flex-grow flex-col overflow-hidden"
        >
          {/* TabsHeader */}
          <section className="sticky top-[0px] z-10 flex w-full justify-between bg-white py-2">
            <TabsList className="border">
              {[
                { value: 'onboarding', label: 'Onboarding' },
                { value: 'sales', label: 'Sales' },
                { value: 'purchase', label: 'Purchase' },
                { value: 'inventory', label: 'Inventory' },
                { value: 'vendors', label: 'Vendors' },
              ].map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  className={`w-24 ${tab === value ? 'shadow-customShadow' : ''}`}
                  value={value}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </section>

          <TabsContent value="onboarding" className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto">
              {isOnboardingQueryLoading && <Loading />}

              {!isOnboardingQueryLoading && onboardingData?.length > 0 ? (
                <InfiniteDataTable
                  id="enterprises-table"
                  columns={onboardingDataColumns}
                  data={onboardingData}
                  fetchNextPage={onboardingQueryFetchNextPage}
                  isFetching={isOnboardingQueryFetching}
                  totalPages={paginationData?.totalPages}
                  currFetchedPage={paginationData?.currFetchedPage}
                  onRowClick={onRowClick}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border bg-gray-50">
                  <ServerOff size={24} />
                  No Data Available
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="sales" className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto">
              {isDataQueryLoading && <Loading />}

              {!isDataQueryLoading && enterprisesData?.length > 0 ? (
                <InfiniteDataTable
                  id="enterprises-table"
                  columns={enterpriseDataColumns}
                  data={enterprisesData}
                  fetchNextPage={dataQueryFetchNextPage}
                  isFetching={isDataQueryFetching}
                  totalPages={paginationData?.totalPages}
                  currFetchedPage={paginationData?.currFetchedPage}
                  onRowClick={onRowClick}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border bg-gray-50">
                  <ServerOff size={24} />
                  No Data Available··
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="purchase">Coming Soon...</TabsContent>
          <TabsContent value="inventory">Coming Soon...</TabsContent>
          <TabsContent value="vendors">Coming Soon...</TabsContent>
        </Tabs>
      </>
    </Wrapper>
  );
};

export default DataPage;
