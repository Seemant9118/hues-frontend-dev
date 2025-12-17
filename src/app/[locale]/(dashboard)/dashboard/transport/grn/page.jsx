'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { LocalStorageService } from '@/lib/utils';
import { getGRNs } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useGrnColumns } from './GRNColumns';
import { GRNSTable } from './GRNSTable';

const PAGE_LIMIT = 10;

function GRN() {
  useMetaData('Hues! - GRN', 'HUES GRN');

  const translations = useTranslations('transport.grns');

  const keys = [
    'transport.grns.emptyStateComponent.subItems.subItem1',
    'transport.grns.emptyStateComponent.subItems.subItem2',
    'transport.grns.emptyStateComponent.subItems.subItem3',
    'transport.grns.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const [grns, setGrns] = useState([]);
  const [paginationData, setPaginationData] = useState({});

  const grnsQuery = useInfiniteQuery({
    queryKey: [deliveryProcess.getGRNs.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getGRNs({
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const source = grnsQuery.data;
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
  }, [grnsQuery.data]);

  const GRNsColumns = useGrnColumns();

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
              {grnsQuery.isLoading ? (
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
                    <GRNSTable
                      id="grns-table"
                      columns={GRNsColumns}
                      data={grns}
                      fetchNextPage={grnsQuery.fetchNextPage}
                      isFetching={grnsQuery.isFetching}
                      totalPages={paginationData?.totalPages}
                      currFetchedPage={paginationData?.currFetchedPage}
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

export default GRN;
