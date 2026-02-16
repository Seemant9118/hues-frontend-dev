'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import AddProductType from '@/components/inventory/goods/AddProductType';
import FetchedDataModal from '@/components/inventory/goods/FetchedDataModal';
import FetchItemTypesModal from '@/components/inventory/goods/FetchItemTypesModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  addIntoTypes,
  fetchItemTypes,
  getItemsTypes,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { ArrowLeft, Download, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useItemTypeColumns } from './itemTypesColumns';

const PAGE_LIMIT = 10;

const FETCH_OPTIONS = [
  {
    id: 'GST',
    label: 'MSME (Udyam) Declared Products',
    desc: 'Products declared in Udyam registration',
  },
  {
    id: 'UDYAM',
    label: 'GST Registration Declared Activities',
    desc: 'Activities from GST registration',
  },
];

const ItemMasterBuilder = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const queryClient = useQueryClient();
  const router = useRouter();
  const [itemTypes, setItemTypes] = useState(null);
  const [paginationData, setPaginationData] = useState(null);
  const [isAddingItemType, setIsAddingItemType] = useState(false);
  const [isFetchModalOpen, setIsFetchModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(
    FETCH_OPTIONS.map((option) => option.id),
  );
  const [isFetchedDataModalOpen, setIsFetchedDataModalOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState(false);

  const itemsBreadCrumbs = [
    {
      id: 1,
      name: 'Item Master',
      path: '/dashboard/inventory/goods/',
      show: true, // Always show
    },
    {
      id: 2,
      name: 'Item Master Builder',
      path: '/dashboard/inventory/goods/item-master-builder',
      show: true, // Always show
    },
  ];

  const itemTypesQuery = useInfiniteQuery({
    queryKey: [goodsApi.getItemTypes.endpointKey],
    queryFn: async ({ pageParam = 1 }) =>
      getItemsTypes({
        id: enterpriseId,
        page: pageParam,
        limit: PAGE_LIMIT,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage?.data?.data?.totalPages;
      if (!totalPages) return undefined;
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const source = itemTypesQuery?.data;
    if (!source?.pages) return;

    const flattened =
      source.pages.flatMap((page) => page?.data?.data?.data ?? []) ?? [];

    const uniqueGoodsData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );

    setItemTypes(uniqueGoodsData || []);

    if (!source?.pages?.length) return;

    const lastPage = source.pages[source.pages.length - 1]?.data?.data;

    setPaginationData({
      totalPages: lastPage?.totalPages || 0,
      currFetchedPage: Number(lastPage?.currentPage || 0),
    });
  }, [itemTypesQuery.data]);

  const fetchMutation = useMutation({
    mutationFn: fetchItemTypes,
    onSuccess: (data) => {
      toast.success('Items Types Fetched!');
      setIsFetchModalOpen(false);
      setFetchedData(data?.data?.data?.data);
      setIsFetchedDataModalOpen(true);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleToggle = (id) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleRunFetch = () => {
    fetchMutation.mutate({ data: { registrationType: selectedOptions } });
  };

  const addIntoItemTypesMutation = useMutation({
    mutationFn: addIntoTypes,
    onSuccess: () => {
      toast.success('Item types added successfully');
      setIsFetchedDataModalOpen(false);
      setFetchedData([]);
      queryClient.invalidateQueries([goodsApi.getItemTypes.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const itemTypeColumns = useItemTypeColumns({ router });

  return (
    <ProtectedWrapper permissionCode="permission:item-masters-view">
      <Wrapper className="h-screen">
        {!isAddingItemType && (
          <div>
            {/* header */}
            <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => router.push(`/dashboard/inventory/goods/`)}
                  className="rounded-sm p-2 hover:bg-gray-100"
                >
                  <ArrowLeft size={16} />
                </button>
                <OrderBreadCrumbs possiblePagesBreadcrumbs={itemsBreadCrumbs} />
              </div>
              <div className="flex items-center gap-2">
                <ProtectedWrapper permissionCode="permission:item-masters-create">
                  <Button onClick={() => setIsFetchModalOpen(true)} size="sm">
                    <Download size={14} />
                    Fetch Item Types
                  </Button>
                </ProtectedWrapper>
                <ProtectedWrapper permissionCode="permission:item-masters-create">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingItemType(true)}
                    size="sm"
                  >
                    <Plus size={14} />
                    Create Item Type manually
                  </Button>
                </ProtectedWrapper>
              </div>
            </section>

            <div className="flex-grow overflow-hidden">
              {itemTypesQuery.isLoading ? (
                <Loading />
              ) : itemTypes?.length === 0 ? (
                <EmptyStageComponent heading={'No Data'} />
              ) : (
                <InfiniteDataTable
                  id="item-types-table"
                  columns={itemTypeColumns}
                  data={itemTypes || []}
                  fetchNextPage={itemTypesQuery.fetchNextPage}
                  isFetching={itemTypesQuery.isFetching}
                  totalPages={paginationData?.totalPages || 0}
                  currFetchedPage={paginationData?.currFetchedPage || 0}
                  //   onRowClick={onRowClick}
                />
              )}
            </div>
          </div>
        )}

        {isAddingItemType && (
          <AddProductType setIsCreatingGoods={setIsAddingItemType} />
        )}

        <FetchItemTypesModal
          open={isFetchModalOpen}
          onOpenChange={setIsFetchModalOpen}
          options={FETCH_OPTIONS}
          selected={selectedOptions}
          onToggle={handleToggle}
          onRun={handleRunFetch}
        />

        <FetchedDataModal
          enterpriseId={enterpriseId}
          open={isFetchedDataModalOpen}
          onOpenChange={setIsFetchedDataModalOpen}
          fetchedData={fetchedData}
          addIntoItemTypesMutation={addIntoItemTypesMutation}
        />
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ItemMasterBuilder;
