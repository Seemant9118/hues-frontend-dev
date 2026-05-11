'use client';

import { batchApi } from '@/api/inventories/goods/batch';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
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
import { LocalStorageService } from '@/lib/utils';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { CircleFadingPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useBatchColumns } from './BatchColumns';
import { BatchTable } from './BatchTable';

const AddBatch = dynamic(
  () => import('../../../../../../components/inventory/batch/AddBatch'),
  {
    loading: () => <Loading />,
  },
);

const PAGE_LIMIT = 10;

function ProductBatch() {
  useMetaData('Hues! - Product Batch', 'HUES PRODUCT BATCH');

  const translations = useTranslations('batch');

  const [enterpriseId, setEnterpriseId] = useState(null);
  const [isEnterpriseOnboardingComplete, setIsEnterpriseOnboardingComplete] =
    useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { hasPermission } = usePermission();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState(null);
  const [batches, setBatches] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [paginationData, setPaginationData] = useState({});

  useEffect(() => {
    setEnterpriseId(getEnterpriseId());
    setIsEnterpriseOnboardingComplete(
      LocalStorageService.get('isEnterpriseOnboardingComplete') ?? false,
    );
    setIsMounted(true);
  }, []);

  const emptyStateSubItems = useMemo(() => {
    return [
      translations('emptyStateComponent.subItems.subItem1.value'),
      translations('emptyStateComponent.subItems.subItem2.value'),
      translations('emptyStateComponent.subItems.subItem3.value'),
      translations('emptyStateComponent.subItems.subItem4.value'),
    ];
  }, [translations]);

  useEffect(() => {
    const action = searchParams?.get?.('action');
    setIsAdding(action === 'add');
    setIsEditing(action === 'edit');
  }, [searchParams]);

  const handleSetIsEditing = (val, batch = null) => {
    setIsEditing(val);
    if (batch) setBatchToEdit(batch);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('action', 'edit');
    else {
      params.delete('action');
      setBatchToEdit(null);
    }
    router.replace(`/dashboard/inventory/batch?${params.toString()}`);
  };

  const handleSetIsAdding = (val) => {
    setIsAdding(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('action', 'add');
    else params.delete('action');
    router.replace(`/dashboard/inventory/batch?${params.toString()}`);
  };

  const batchQuery = useInfiniteQuery({
    queryKey: [batchApi.listBatches.endpointKey, enterpriseId, searchTerm],
    queryFn: async ({ pageParam = 0 }) =>
      GetProductBatchList({
        searchString: searchTerm,
        skip: pageParam,
        limit: PAGE_LIMIT,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const data = lastPage?.data?.data;
      const totalItems = data?.totalItems || 0;
      const nextSkip = allPages.length * PAGE_LIMIT;
      return nextSkip < totalItems ? nextSkip : undefined;
    },
    enabled:
      isMounted &&
      Boolean(enterpriseId) &&
      Boolean(hasPermission('permission:item-masters-view')), // Reusing permission for now
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!batchQuery.data?.pages) return;

    const flattened =
      batchQuery.data.pages.flatMap((page) => page?.data?.data?.data ?? []) ??
      [];

    setBatches(flattened);

    const lastPage =
      batchQuery.data.pages[batchQuery.data.pages.length - 1]?.data?.data;
    setPaginationData({
      totalItems: lastPage?.totalItems || 0,
    });
  }, [batchQuery.data]);

  const BatchColumns = useBatchColumns(handleSetIsEditing);

  return (
    <ProtectedWrapper permissionCode="permission:item-masters-view">
      {!isMounted ? (
        <Loading />
      ) : !enterpriseId || !isEnterpriseOnboardingComplete ? (
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
                    placeholder={translations('ctas.searchPlaceholder')}
                  />

                  <ProtectedWrapper permissionCode="permission:item-masters-create">
                    <Button onClick={() => handleSetIsAdding(true)} size="sm">
                      <CircleFadingPlus size={14} />
                      {translations('ctas.add')}
                    </Button>
                  </ProtectedWrapper>
                </div>
              </SubHeader>

              <div className="flex-grow overflow-hidden">
                {batchQuery.isLoading ? (
                  <Loading />
                ) : batches.length === 0 && !searchTerm ? (
                  <EmptyStageComponent
                    heading={translations('emptyStateComponent.heading')}
                    subItems={emptyStateSubItems}
                  />
                ) : (
                  <BatchTable
                    id="batch-table"
                    columns={BatchColumns}
                    data={batches || []}
                    fetchNextPage={batchQuery.fetchNextPage}
                    isFetching={batchQuery.isFetching}
                    hasNextPage={batchQuery.hasNextPage}
                  />
                )}
              </div>
            </Wrapper>
          )}

          {(isAdding || isEditing) && (
            <AddBatch
              setIsAdding={handleSetIsAdding}
              setIsEditing={handleSetIsEditing}
              batchToEdit={batchToEdit}
            />
          )}
        </div>
      )}
    </ProtectedWrapper>
  );
}

export default ProductBatch;
