'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import AddGoodsMaster from '@/components/admin/masters/AddGoodsMaster';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import {
  downloadSampleFileGoodsMaster,
  getGoodsMaster,
  uploadGoodsMaster,
} from '@/services/Admin_Services/AdminServices';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CircleFadingPlus, ServerOff, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import FileUploadBox from '@/components/upload/UploaderBox';
import { useGoodsMasterColumns } from './useGoodsMasterColumns';

// macros
const PAGE_LIMIT = 10;

const GoodsMasterPage = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [isAddingGoodsMaster, setIsAddingGoodsMaster] = useState(false);
  const [GoodsMaster, setGoodsMasterData] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [isEditingGoodsMaster, setIsEditingGoodsMaster] = useState(false);
  const [goodsMasterToEdit, setGoodsMasterToEdit] = useState(null);
  const [isUploadingGoodsMaster, setIsUploadingGoodsMaster] = useState(false);

  // fetch goods data
  const {
    data: goodsQuery,
    isLoading: isGoodsQueryLoading,
    fetchNextPage: GoodsQueryFetchNextPage,
    isFetching: isGoodsQueryFetching,
  } = useInfiniteQuery({
    queryKey: [AdminAPIs.getGoodsMaster.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getGoodsMaster({
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
    const source = goodsQuery;
    if (!source) return;
    const flattened = source?.pages?.flatMap(
      (page) => page?.data?.data?.data || [],
    );
    const uniqueData = Array.from(
      new Map(flattened?.map((item) => [item.id, item])).values(),
    );
    setGoodsMasterData(uniqueData);
    const lastPage = source?.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: Number(lastPage?.currentPage),
    });
  }, [goodsQuery]);

  const GoodsMasterColumns = useGoodsMasterColumns({
    setIsEditingGoodsMaster,
    setGoodsMasterToEdit,
  });

  return (
    <ProtectedWrapper permissionCode={'permission:admin-dashboard-view'}>
      <Wrapper className="scrollBarStyles flex h-screen flex-col">
        {!isAddingGoodsMaster &&
          !isEditingGoodsMaster &&
          !isUploadingGoodsMaster && (
            <>
              {/* headers */}
              <section className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white p-1">
                <SubHeader name="Goods Master" />
                <div className="flex items-center gap-2">
                  <Button
                    variant="blue_outline"
                    onClick={() => setIsUploadingGoodsMaster(true)}
                    size="sm"
                  >
                    <Upload size={14} />
                    Upload
                  </Button>
                  <Button
                    onClick={() => setIsAddingGoodsMaster(true)}
                    size="sm"
                  >
                    <CircleFadingPlus size={14} />
                    Add
                  </Button>
                </div>
              </section>
              <div className="h-full overflow-y-auto">
                {isGoodsQueryLoading && <Loading />}

                {!isGoodsQueryLoading && GoodsMaster?.length > 0 ? (
                  <InfiniteDataTable
                    id="categories-table"
                    columns={GoodsMasterColumns}
                    data={GoodsMaster}
                    fetchNextPage={GoodsQueryFetchNextPage}
                    isFetching={isGoodsQueryFetching}
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

        {isAddingGoodsMaster && (
          <AddGoodsMaster
            onClose={() => {
              setIsAddingGoodsMaster(false);
              queryClient.invalidateQueries([
                AdminAPIs.getGoodsMaster.endpointKey,
              ]);
            }}
            setIsAddingGoodsMaster={setIsAddingGoodsMaster}
          />
        )}

        {isEditingGoodsMaster && (
          <AddGoodsMaster
            onClose={() => {
              setIsEditingGoodsMaster(false);
              queryClient.invalidateQueries([
                AdminAPIs.getGoodsMaster.endpointKey,
              ]);
            }}
            setIsAddingGoodsMaster={setIsEditingGoodsMaster}
            goodsMasterToEdit={goodsMasterToEdit}
          />
        )}

        {isUploadingGoodsMaster && (
          <FileUploadBox
            name="Upload Goods Master"
            onClose={() => {
              setIsUploadingGoodsMaster(false);
            }}
            sampleDownloadFn={downloadSampleFileGoodsMaster}
            uploadDocFn={uploadGoodsMaster}
            queryClient={() => {
              queryClient.invalidateQueries([
                AdminAPIs.getGoodsMaster.endpointKey,
              ]);
            }}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default GoodsMasterPage;
