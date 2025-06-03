'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { useRBAC } from '@/context/RBACcontext';
import { getEnterprisesData } from '@/services/Admin_Services/AdminServices';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ServerOff } from 'lucide-react';
import { InfiniteDataTable } from './InfiniteDataTable';
import { useEnterpriseDataColumns } from './useEnterpriseDataColumns';

// macros
const PAGE_LIMIT = 10;

const DataPage = () => {
  const router = useRouter();
  const { hasPageAccess } = useRBAC();
  const [enterprisesData, setEnterprisesData] = useState([]);
  const [paginationData, setPaginationData] = useState({});

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
  });

  useEffect(() => {
    const source = dataQuery;
    if (!source) return;
    const flattened = source?.pages?.flatMap(
      (page) => page?.data?.data?.data || [],
    );
    const uniqueCustomersData = Array.from(
      new Map(flattened?.map((item) => [item.enterprise_id, item])).values(),
    );
    setEnterprisesData(uniqueCustomersData);
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

  const enterpriseDataColumns = useEnterpriseDataColumns();

  return (
    <Wrapper className="h-screen">
      {/* headers */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white p-1">
        <SubHeader name="Data" />
      </div>

      <div className="flex-grow overflow-hidden">
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
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border bg-gray-50">
            <ServerOff size={24} />
            No Data Available
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default DataPage;
