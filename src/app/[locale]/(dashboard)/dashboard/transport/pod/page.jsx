'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { LocalStorageService } from '@/lib/utils';
import { getPODs } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePODColumns } from './PODColumns';

const PAGE_LIMIT = 10;

function PODs() {
  useMetaData('Hues! - PoD', 'HUES PoD');

  const translations = useTranslations('transport.pods');
  const router = useRouter();

  const keys = [
    'transport.pods.emptyStateComponent.subItems.subItem1',
    'transport.pods.emptyStateComponent.subItems.subItem2',
    'transport.pods.emptyStateComponent.subItems.subItem3',
    'transport.pods.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const [grns, setGrns] = useState([]);
  const [paginationData, setPaginationData] = useState({});

  const podsQuery = useInfiniteQuery({
    queryKey: [deliveryProcess.getPODs.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getPODs({
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    staleTime: Infinity, // data never becomes stale
    refetchOnMount: false, // don’t refetch on remount
    refetchOnWindowFocus: false, // already correct
  });

  useEffect(() => {
    const source = podsQuery.data;
    if (!source) return;
    const flattened = source.pages.flatMap(
      (page) => page?.data?.data?.data || [],
    );
    const uniqueGRNSData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );
    setGrns(uniqueGRNSData);
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: Number(lastPage?.currentPage),
    });
  }, [podsQuery.data]);

  const isSeller = false;

  const PODsColumns = usePODColumns({ isSeller });

  const onRowClick = (row) => {
    router.push(`/dashboard/transport/pod/${row.id}`);
  };

  return (
    // TODO: update permissions
    <ProtectedWrapper permissionCode="permission:item-masters-view">
      {!enterpriseId || !isEnterpriseOnboardingComplete ? (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      ) : (
        <div>
          <Wrapper className="h-screen">
            <SubHeader name={translations('title')}></SubHeader>
            <div className="flex-grow overflow-hidden">
              {podsQuery.isLoading ? (
                <Loading />
              ) : (
                <>
                  {/* Case 1: no data → Empty stage */}
                  {grns?.length === 0 ? (
                    <EmptyStageComponent
                      heading={translations('emptyStateComponent.heading')}
                      subItems={keys}
                    />
                  ) : (
                    // Case 2: data is available → Show Table
                    <InfiniteDataTable
                      id="PODs-table"
                      columns={PODsColumns}
                      data={grns}
                      fetchNextPage={podsQuery.fetchNextPage}
                      isFetching={podsQuery.isFetching}
                      totalPages={paginationData?.totalPages}
                      currFetchedPage={paginationData?.currFetchedPage}
                      onRowClick={onRowClick}
                    />
                  )}
                </>
              )}
            </div>
          </Wrapper>
        </div>
      )}
    </ProtectedWrapper>
  );
}

export default PODs;
