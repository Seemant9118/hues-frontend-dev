'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import InfoBanner from '@/components/auth/InfoBanner';
import Tooltips from '@/components/auth/Tooltips';
import DebouncedInput from '@/components/ui/DebouncedSearchInput';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  GetAllProductGoods,
  GetSearchedProductGoods,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { CircleFadingPlus, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGoodsColumns } from './GoodsColumns';
import { GoodsTable } from './GoodsTable';

const AddGoods = dynamic(() => import('@/components/inventory/AddGoods'), {
  loading: () => <Loading />,
});
const EditGoods = dynamic(() => import('@/components/inventory/AddGoods'), {
  loading: () => <Loading />,
});
// const UploadItems = dynamic(
//   () => import('@/components/inventory/UploadItems'),
//   {
//     loading: () => <Loading />,
//   },
// );

const PAGE_LIMIT = 10;

function Goods() {
  useMetaData('Hues! - Goods', 'HUES GOODS');

  const translations = useTranslations('goods');

  const keys = [
    'goods.emptyStateComponent.subItems.subItem1',
    'goods.emptyStateComponent.subItems.subItem2',
    'goods.emptyStateComponent.subItems.subItem3',
    'goods.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  // const templateId = 1;
  const { hasPermission } = usePermission();
  // const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [goodsToEdit, setGoodsToEdit] = useState(null);
  // const [isUploading, setIsUploading] = useState(false);
  // const [files, setFiles] = useState([]);
  const [productGoods, setProductGoods] = useState([]);
  const [paginationData, setPaginationData] = useState({});

  useEffect(() => {
    const state = searchParams.get('action');
    setIsAdding(state === 'add');
    setIsEditing(state === 'edit');
    // setIsUploading(state === 'upload');
  }, [searchParams]);

  useEffect(() => {
    const currentAction = searchParams.get('action') || '';

    const requiredAction = isAdding ? 'add' : isEditing ? 'edit' : '';

    if (currentAction === requiredAction) return;

    const newPath = requiredAction
      ? `/dashboard/inventory/goods?action=${requiredAction}`
      : `/dashboard/inventory/goods`;

    router.replace(newPath);
  }, [isAdding, isEditing, router, searchParams]);

  const goodsQuery = useInfiniteQuery({
    queryKey: [goodsApi.getAllProductGoods.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return GetAllProductGoods({
        id: enterpriseId,
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage?.data?.data?.totalPages;
      if (!totalPages) return undefined;

      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    enabled:
      searchTerm.trim().length === 0 &&
      hasPermission('permission:item-masters-view'),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const searchQuery = useInfiniteQuery({
    queryKey: [goodsApi.getSearchedProductGoods.endpointKey, searchTerm],
    queryFn: async ({ pageParam = 1 }) => {
      return GetSearchedProductGoods({
        page: pageParam,
        limit: PAGE_LIMIT,
        data: { searchString: searchTerm },
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage?.data?.data?.totalPages;
      if (!totalPages) return undefined;

      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    enabled: searchTerm.trim().length > 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const source = searchTerm ? searchQuery.data : goodsQuery.data;
    if (!source) return;
    const flattened =
      source?.pages?.flatMap((page) => page?.data?.data?.data ?? []) ?? [];

    const uniqueGoodsData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );
    setProductGoods(uniqueGoodsData);
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: Number(lastPage?.currentPage),
    });
  }, [searchTerm, goodsQuery.data, searchQuery.data]);

  // const uploadFile = async (file) => {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('enterpriseId', enterpriseId);
  //   formData.append('templateId', templateId);
  //   try {
  //     await UploadProductGoods(formData);
  //     toast.success(translations('messages.uploadSuccessMsg'));
  //     setFiles((prev) => [...prev, file]);
  //     queryClient.invalidateQueries([goodsApi.getAllProductGoods.endpointKey]);
  //   } catch (error) {
  //     toast.error(error?.response?.data?.message || 'Something went wrong');
  //   }
  // };

  const onRowClick = (row) => {
    return router.push(`/dashboard/inventory/goods/${row.id}`);
  };

  const GoodsColumns = useGoodsColumns(setIsEditing, setGoodsToEdit);

  return (
    <ProtectedWrapper permissionCode="permission:item-masters-view">
      {!enterpriseId || !isEnterpriseOnboardingComplete ? (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      ) : (
        <div>
          {!isAdding && !isEditing && (
            <Wrapper className="h-screen">
              <SubHeader name={translations('title')}>
                <div className="flex items-center gap-2">
                  <DebouncedInput
                    value={searchTerm}
                    delay={400}
                    onDebouncedChange={setSearchTerm}
                    placeholder="Search items"
                  />
                  <ProtectedWrapper permissionCode="permission:item-masters-download">
                    <Tooltips
                      trigger={
                        <Button
                          variant={
                            productGoods?.length === 0 ? 'export' : 'outline'
                          }
                          size="sm"
                          className={
                            productGoods?.length === 0
                              ? 'cursor-not-allowed'
                              : 'cursor-pointer'
                          }
                          onClick={() =>
                            productGoods?.length > 0 &&
                            exportTableToExcel(
                              'goods-table',
                              translations('title'),
                            )
                          }
                        >
                          <Download size={14} />
                        </Button>
                      }
                      content={translations('ctas.export')}
                    />
                  </ProtectedWrapper>
                  {/* <ProtectedWrapper permissionCode="permission:item-masters-upload">
                    <Button
                      onClick={() => setIsUploading(true)}
                      variant="blue_outline"
                      size="sm"
                    >
                      <Upload size={14} />
                      {translations('ctas.upload')}
                    </Button>
                  </ProtectedWrapper> */}

                  <ProtectedWrapper permissionCode="permission:item-masters-create">
                    <Button onClick={() => setIsAdding(true)} size="sm">
                      <CircleFadingPlus size={14} />
                      {translations('ctas.add')}
                    </Button>
                  </ProtectedWrapper>
                </div>
              </SubHeader>

              {/* banner */}
              <InfoBanner
                text={translations('bannerText')}
                showSupportLink={false}
              />
              <div className="flex-grow overflow-hidden">
                {goodsQuery.isLoading || searchQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: No search term, and no data → Empty stage */}
                    {!searchTerm && productGoods?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: Either searchTerm is present, or data is available → Show Table
                      <GoodsTable
                        id="goods-table"
                        columns={GoodsColumns}
                        data={productGoods}
                        fetchNextPage={
                          searchTerm
                            ? searchQuery.fetchNextPage
                            : goodsQuery.fetchNextPage
                        }
                        isFetching={
                          searchTerm
                            ? searchQuery.isFetching
                            : goodsQuery.isFetching
                        }
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        onRowClick={onRowClick}
                      />
                    )}
                  </>
                )}
              </div>
            </Wrapper>
          )}

          {isAdding && <AddGoods setIsCreatingGoods={setIsAdding} />}

          {isEditing && (
            <EditGoods
              setIsCreatingGoods={setIsEditing}
              goodsToEdit={goodsToEdit}
            />
          )}

          {/* {isUploading && (
            <UploadItems
              type="goods"
              uploadFile={uploadFile}
              files={files}
              setisUploading={setIsUploading}
              setFiles={setFiles}
            />
          )} */}
        </div>
      )}
    </ProtectedWrapper>
  );
}

export default Goods;
