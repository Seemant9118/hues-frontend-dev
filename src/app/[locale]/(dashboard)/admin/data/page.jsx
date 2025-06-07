'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import EnterpriseDetailsComponent from '@/components/enterprise/EnterpriseDetailsComponent';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import SearchInput from '@/components/ui/SearchInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { useRBAC } from '@/context/RBACcontext';
import {
  getEnterprisesData,
  getOnboardingData,
} from '@/services/Admin_Services/AdminServices';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { CheckCheck, ServerOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { InfiniteDataTable } from './InfiniteDataTable';
import { useEnterpriseDataColumns } from './useEnterpriseDataColumns';
import { useOnboardingDataColumns } from './useOnboardingDataColumns';

// macros
const PAGE_LIMIT = 10;

const DataPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPageAccess } = useRBAC();
  const [enterprisesData, setEnterprisesData] = useState([]);
  const [onboardingData, setOnboardingData] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [tab, setTab] = useState('onboarding');
  const [enterpriseDetails, setEnterpriseDetails] = useState(null);
  const [isEnterpriseDetailsOpen, setIsEnterpriseDetailsOpen] = useState(false);

  const onTabChange = (value) => {
    setTab(value);
  };

  const dataBreadCrumbs = [
    {
      id: 1,
      name: 'Data',
      path: '/admin/data',
      show: true, // Always show
    },
    {
      id: 1,
      name: 'Enterprise Details',
      path: '/admin/data',
      show: isEnterpriseDetailsOpen, // Always show
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');

    setIsEnterpriseDetailsOpen(state === 'enterprise-details');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/admin/data`;

    if (isEnterpriseDetailsOpen) {
      newPath += '?state=enterprise-details';
    } else {
      newPath += '';
    }

    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [isEnterpriseDetailsOpen, router]);

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
    enabled: tab === 'onboarding',
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
    enabled: tab === 'sales',
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

  useEffect(() => {
    if (!hasPageAccess('adminReports')) {
      router.replace('/unauthorized');
    }
  }, []);

  const onRowClick = (row) => {
    // data set as props
    setEnterpriseDetails(row);
    setIsEnterpriseDetailsOpen(true);
  };

  const enterpriseDataColumns = useEnterpriseDataColumns();
  const onboardingDataColumns = useOnboardingDataColumns();

  return (
    <Wrapper className="flex h-screen flex-col overflow-hidden">
      {/* headers */}
      <section className="flex w-full items-center justify-between bg-white py-2">
        <div className="flex gap-2">
          {/* breadcrumbs */}
          <OrderBreadCrumbs possiblePagesBreadcrumbs={dataBreadCrumbs} />
        </div>
        <div className="flex gap-2">
          {isEnterpriseDetailsOpen ? (
            <Button size="sm">
              <CheckCheck size={14} />
              Mark Onboarding as complete
            </Button>
          ) : (
            <SearchInput searchPlaceholder="Search..." disabled={true} />
          )}
        </div>
      </section>
      {!isEnterpriseDetailsOpen && (
        <>
          {/* headers */}
          {/* <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white p-1">
            <SubHeader name="Data" />
          </div> */}
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

            <TabsContent
              value="onboarding"
              className="flex-grow overflow-hidden"
            >
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
      )}
      {isEnterpriseDetailsOpen && (
        <EnterpriseDetailsComponent enterpriseDetails={enterpriseDetails} />
      )}
    </Wrapper>
  );
};

export default DataPage;
