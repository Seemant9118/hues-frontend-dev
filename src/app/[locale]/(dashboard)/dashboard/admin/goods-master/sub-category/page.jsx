'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import AddSubCategory from '@/components/admin/masters/AddSubCategory';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import { getSubCategories } from '@/services/Admin_Services/AdminServices';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CircleFadingPlus, ServerOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSubCategoryColumns } from './useSubCategoryColumns';

// macros
const PAGE_LIMIT = 10;

const SubCategoryPage = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [isEditingSubCategory, setIsEditingSubCategory] = useState(false);
  const [subCategoryToEdit, setSubCategoryToEdit] = useState(null);

  // fetch categories data
  const {
    data: categoriesQuery,
    isLoading: isCategoriesQueryLoading,
    fetchNextPage: categoriesQueryFetchNextPage,
    isFetching: isCategoriesQueryFetching,
  } = useInfiniteQuery({
    queryKey: [AdminAPIs.getSubCategories.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getSubCategories({
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
    const source = categoriesQuery;
    if (!source) return;
    const flattened = source?.pages?.flatMap(
      (page) => page?.data?.data?.data || [],
    );
    const uniqueData = Array.from(
      new Map(flattened?.map((item) => [item.id, item])).values(),
    );
    setCategoriesData(uniqueData);
    const lastPage = source?.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: Number(lastPage?.currentPage),
    });
  }, [categoriesQuery]);

  const subCategoryColumns = useSubCategoryColumns({
    setIsEditingSubCategory,
    setSubCategoryToEdit,
  });

  return (
    <ProtectedWrapper permissionCode={'permission:admin-dashboard-view'}>
      <Wrapper className="scrollBarStyles flex h-screen flex-col">
        {!isAddingSubCategory && !isEditingSubCategory && (
          <>
            {/* headers */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white p-1">
              <SubHeader name="Sub-Categories" />

              <Button onClick={() => setIsAddingSubCategory(true)} size="sm">
                <CircleFadingPlus size={14} />
                Add
              </Button>
            </div>
            <div className="h-full overflow-y-auto">
              {isCategoriesQueryLoading && <Loading />}

              {!isCategoriesQueryLoading && categoriesData?.length > 0 ? (
                <InfiniteDataTable
                  id="categories-table"
                  columns={subCategoryColumns}
                  data={categoriesData}
                  fetchNextPage={categoriesQueryFetchNextPage}
                  isFetching={isCategoriesQueryFetching}
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

        {isAddingSubCategory && (
          <AddSubCategory
            isAddingSubCategory={isAddingSubCategory}
            onClose={() => {
              setIsAddingSubCategory(false);
              queryClient.invalidateQueries([
                AdminAPIs.getSubCategories.endpointKey,
              ]);
            }}
            setIsAddingSubCategory={setIsAddingSubCategory}
          />
        )}

        {isEditingSubCategory && (
          <AddSubCategory
            onClose={() => {
              setIsEditingSubCategory(false);
              queryClient.invalidateQueries([
                AdminAPIs.getSubCategories.endpointKey,
              ]);
            }}
            setIsAddingSubCategory={setIsEditingSubCategory}
            subCategoryToEdit={subCategoryToEdit}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default SubCategoryPage;
