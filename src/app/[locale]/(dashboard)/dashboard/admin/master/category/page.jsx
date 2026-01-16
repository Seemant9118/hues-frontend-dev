'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import AddCategory from '@/components/admin/masters/AddCategory';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import { getCategories } from '@/services/Admin_Services/AdminServices';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CircleFadingPlus, ServerOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useProductCategoryColumns } from './useProductCategoryColumns';

// macros
const PAGE_LIMIT = 10;

const CategoryPage = () => {
  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [paginationData, setPaginationData] = useState({});

  // fetch categories data
  const {
    data: categoriesQuery,
    isLoading: isCategoriesQueryLoading,
    fetchNextPage: categoriesQueryFetchNextPage,
    isFetching: isCategoriesQueryFetching,
  } = useInfiniteQuery({
    queryKey: [AdminAPIs.getCategories.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getCategories({
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

  const ProductCategoryColumns = useProductCategoryColumns({
    setIsEditingCategory,
    setCategoryToEdit,
  });

  return (
    <ProtectedWrapper permissionCode={'permission:admin-dashboard-view'}>
      <Wrapper className="scrollBarStyles flex h-screen flex-col">
        {!isAddingCategory && !isEditingCategory && (
          <>
            {/* headers */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white p-1">
              <SubHeader name="Category" />
              <Button onClick={() => setIsAddingCategory(true)} size="sm">
                <CircleFadingPlus size={14} />
                Add
              </Button>
            </div>
            <div className="h-full overflow-y-auto">
              {isCategoriesQueryLoading && <Loading />}

              {!isCategoriesQueryLoading && categoriesData?.length > 0 ? (
                <InfiniteDataTable
                  id="categories-table"
                  columns={ProductCategoryColumns}
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

        {isAddingCategory && (
          <AddCategory
            onClose={() => {
              setIsAddingCategory(false);
              queryClient.invalidateQueries([
                AdminAPIs.getCategories.endpointKey,
              ]);
            }}
            setIsAddingCategory={setIsAddingCategory}
          />
        )}

        {isEditingCategory && (
          <AddCategory
            onClose={() => {
              setIsEditingCategory(false);
              queryClient.invalidateQueries([
                AdminAPIs.getCategories.endpointKey,
              ]);
            }}
            setIsAddingCategory={setIsEditingCategory}
            categoryToEdit={categoryToEdit}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default CategoryPage;
