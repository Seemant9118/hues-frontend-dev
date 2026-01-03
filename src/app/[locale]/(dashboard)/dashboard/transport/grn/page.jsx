'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
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
import { getGRNs } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useGrnColumns } from './GRNColumns';

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

  const router = useRouter();
  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const [grns, setGrns] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [tab, setTab] = useState('ALL');

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const grnsQuery = useInfiniteQuery({
    queryKey: [deliveryProcess.getGRNs.endpointKey, tab],
    queryFn: async ({ pageParam = 1 }) => {
      return getGRNs({
        page: pageParam,
        limit: PAGE_LIMIT,
        grnStatus: tab,
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
      totalPages: Number(lastPage?.totalPages),
      currFetchedPage: Number(lastPage?.page),
    });
  }, [grnsQuery.data]);

  // [updateReadTracker Mutation : onRowClick]
  const updateReadTrackerMutation = useMutation({
    mutationKey: [readTrackerApi.updateTrackerState.endpointKey],
    mutationFn: updateReadTracker,
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });
  const onRowClick = (row) => {
    const isSeller = row.readTracker?.sellerEnterpriseId === enterpriseId;
    const isRead = isSeller
      ? row?.readTracker?.sellerIsRead
      : row?.readTracker?.buyerIsRead || true;
    const readTrackerId = row?.readTracker?.id;

    if (isRead) {
      router.push(`/dashboard/transport/grn/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(readTrackerId);
      router.push(`/dashboard/transport/grn/${row.id}`);
    }
  };

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
            <Tabs
              value={tab}
              onValueChange={onTabChange}
              defaultValue={'ALL'}
              className="flex flex-grow flex-col overflow-hidden"
            >
              <section className="flex w-full justify-between py-2">
                <TabsList className="border">
                  <TabsTrigger value="ALL">
                    {translations('tabs.tab1.label')}
                  </TabsTrigger>
                  <TabsTrigger value="DEFECTS">
                    {translations('tabs.tab2.label')}
                  </TabsTrigger>
                </TabsList>
              </section>

              <TabsContent value="ALL" className="flex-grow overflow-hidden">
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
                      <InfiniteDataTable
                        id="grns-table"
                        columns={GRNsColumns}
                        data={grns}
                        fetchNextPage={grnsQuery.fetchNextPage}
                        isFetching={grnsQuery.isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        onRowClick={onRowClick}
                      />
                    )}
                  </>
                )}
              </TabsContent>
              <TabsContent
                value="DEFECTS"
                className="flex-grow overflow-hidden"
              >
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
                      <InfiniteDataTable
                        id="grns-table"
                        columns={GRNsColumns}
                        data={grns}
                        fetchNextPage={grnsQuery.fetchNextPage}
                        isFetching={grnsQuery.isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        onRowClick={onRowClick}
                      />
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </Wrapper>
        </div>
      )}
    </ProtectedWrapper>
  );
}

export default GRN;
