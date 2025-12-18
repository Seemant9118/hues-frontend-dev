'use client';

import { qcApis } from '@/api/inventories/qc/qc';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService } from '@/lib/utils';
import { getQCs } from '@/services/Inventories_Services/QC_Services/QC_Services';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useQCColumns } from './qcColumns';
import { QCTable } from './QCTable';

const PAGE_LIMIT = 10;

function QC() {
  useMetaData('Hues! - QC', 'HUES QC');

  const translations = useTranslations('qc');

  const keys = [
    'qc.emptyStateComponent.subItems.subItem1',
    'qc.emptyStateComponent.subItems.subItem2',
    'qc.emptyStateComponent.subItems.subItem3',
    'qc.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const { hasPermission } = usePermission();
  const router = useRouter();
  const [productGoods, setProductGoods] = useState([]);
  const [paginationData, setPaginationData] = useState({});

  const qcQuery = useInfiniteQuery({
    queryKey: [qcApis.getQCs.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getQCs({
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    enabled: hasPermission('permission:item-masters-view'),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const source = qcQuery.data;
    if (!source?.pages?.length) return;

    // ✅ flatten items from all pages
    const flattened = source.pages.flatMap(
      (page) => page?.data?.data?.items || [],
    );

    // ✅ remove duplicates by id
    const uniqueGoodsData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );

    setProductGoods(uniqueGoodsData);

    // ✅ pagination from last page
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;

    setPaginationData({
      totalPages: Number(lastPage?.totalPages ?? 0),
      currFetchedPage: Number(lastPage?.page ?? 0),
    });
  }, [qcQuery.data]);

  const onRowClick = (row) => {
    return router.push(`/dashboard/inventory/qc/${row.id}`);
  };

  const GoodsColumns = useQCColumns();

  return (
    <ProtectedWrapper permissionCode="permission:item-masters-view">
      {!enterpriseId || !isEnterpriseOnboardingComplete ? (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      ) : (
        <Wrapper className="h-screen">
          <SubHeader name={translations('title')}></SubHeader>
          <div className="flex-grow overflow-hidden">
            {qcQuery.isLoading ? (
              <Loading />
            ) : (
              <>
                {/* Case 1: No search term, and no data → Empty stage */}
                {productGoods?.length === 0 ? (
                  <EmptyStageComponent
                    heading={translations('emptyStateComponent.heading')}
                    subItems={keys}
                  />
                ) : (
                  // Case 2: Either searchTerm is present, or data is available → Show Table
                  <QCTable
                    id="goods-table"
                    columns={GoodsColumns}
                    data={productGoods}
                    fetchNextPage={qcQuery.fetchNextPage}
                    isFetching={qcQuery.isFetching}
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
    </ProtectedWrapper>
  );
}

export default QC;
