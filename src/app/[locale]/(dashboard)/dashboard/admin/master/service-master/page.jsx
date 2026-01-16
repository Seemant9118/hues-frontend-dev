'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import AddServiceMaster from '@/components/admin/masters/AddServiceMaster';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import { getServicesMaster } from '@/services/Admin_Services/AdminServices';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CircleFadingPlus, ServerOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useServiceMasterColumns } from './useServiceMasterColumns';

// macros
const PAGE_LIMIT = 10;

const SerivceMasterPage = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [isAddingServiceMaster, setIsAddingServiceMaster] = useState(false);
  const [serviceMaster, setServiceMasterData] = useState([]);
  const [isEditingServiceMaster, setIsEditingServiceMaster] = useState(false);
  const [serviceMasterToEdit, setServiceMasterToEdit] = useState(null);
  const [paginationData, setPaginationData] = useState({});

  // fetch service data
  const {
    data: serviceQuery,
    isLoading: isServiceQueryLoading,
    fetchNextPage: ServiceQueryFetchNextPage,
    isFetching: isServiceQueryFetching,
  } = useInfiniteQuery({
    queryKey: [AdminAPIs.getServicesMaster.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getServicesMaster({
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
    enabled: hasPermission('permission:admin-dashboard-view'),
  });

  useEffect(() => {
    const source = serviceQuery;
    if (!source) return;
    const flattened = source?.pages?.flatMap(
      (page) => page?.data?.data?.data || [],
    );
    const uniqueData = Array.from(
      new Map(flattened?.map((item) => [item.id, item])).values(),
    );
    setServiceMasterData(uniqueData);
    const lastPage = source?.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: Number(lastPage?.currentPage),
    });
  }, [serviceQuery]);

  const ServiceMasterColumns = useServiceMasterColumns({
    setIsEditingServiceMaster,
    setServiceMasterToEdit,
  });

  return (
    <ProtectedWrapper permissionCode={'permission:admin-dashboard-view'}>
      <Wrapper className="scrollBarStyles flex h-screen flex-col">
        {!isAddingServiceMaster && !isEditingServiceMaster && (
          <>
            {/* headers */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white p-1">
              <SubHeader name="Service Master" />
              <Button onClick={() => setIsAddingServiceMaster(true)} size="sm">
                <CircleFadingPlus size={14} />
                Add
              </Button>
            </div>
            <div className="h-full overflow-y-auto">
              {isServiceQueryLoading && <Loading />}

              {!isServiceQueryLoading && serviceMaster?.length > 0 ? (
                <InfiniteDataTable
                  id="categories-table"
                  columns={ServiceMasterColumns}
                  data={serviceMaster}
                  fetchNextPage={ServiceQueryFetchNextPage}
                  isFetching={isServiceQueryFetching}
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
          </>
        )}

        {isAddingServiceMaster && (
          <AddServiceMaster
            onClose={() => {
              setIsAddingServiceMaster(false);
              queryClient.invalidateQueries([
                AdminAPIs.getServicesMaster.endpointKey,
              ]);
            }}
            setIsAddingServiceMaster={setIsAddingServiceMaster}
          />
        )}

        {isEditingServiceMaster && (
          <AddServiceMaster
            onClose={() => {
              setIsEditingServiceMaster(false);
              queryClient.invalidateQueries([
                AdminAPIs.getServicesMaster.endpointKey,
              ]);
            }}
            setIsAddingServiceMaster={setIsEditingServiceMaster}
            serviceMasterToEdit={serviceMasterToEdit}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default SerivceMasterPage;
