'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { LocalStorageService } from '@/lib/utils';
import { getPODs } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
  const [pods, setPods] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [tab, setTab] = useState('ALL');

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const podsQuery = useInfiniteQuery({
    queryKey: [deliveryProcess.getPODs.endpointKey, tab],
    queryFn: async ({ pageParam = 1 }) => {
      return getPODs({
        page: pageParam,
        limit: PAGE_LIMIT,
        status: tab,
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
    const uniquePODSData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );
    setPods(uniquePODSData);
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: Number(lastPage?.currentPage),
    });
  }, [podsQuery.data]);

  const PODsColumns = usePODColumns({ enterpriseId });

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
      router.push(`/dashboard/transport/pod/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(readTrackerId);
      router.push(`/dashboard/transport/pod/${row.id}`);
    }
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
                  <TabsTrigger value="POD_PENDING">
                    {translations('tabs.tab2.label')}
                  </TabsTrigger>
                  <TabsTrigger value="POD_SENT">
                    {translations('tabs.tab3.label')}
                  </TabsTrigger>
                  <TabsTrigger value="POD_REJECTED">
                    {translations('tabs.tab4.label')}
                  </TabsTrigger>
                </TabsList>
              </section>

              <TabsContent value="ALL" className="flex-grow overflow-hidden">
                {podsQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: no data → Empty stage */}
                    {pods?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="PODs-table"
                        columns={PODsColumns}
                        data={pods}
                        fetchNextPage={podsQuery.fetchNextPage}
                        isFetching={podsQuery.isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        onRowClick={onRowClick}
                      />
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent
                value="POD_PENDING"
                className="flex-grow overflow-hidden"
              >
                {podsQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: no data → Empty stage */}
                    {pods?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="PODs-table"
                        columns={PODsColumns}
                        data={pods}
                        fetchNextPage={podsQuery.fetchNextPage}
                        isFetching={podsQuery.isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        onRowClick={onRowClick}
                      />
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent
                value="POD_SENT"
                className="flex-grow overflow-hidden"
              >
                {podsQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: no data → Empty stage */}
                    {pods?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="PODs-table"
                        columns={PODsColumns}
                        data={pods}
                        fetchNextPage={podsQuery.fetchNextPage}
                        isFetching={podsQuery.isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        onRowClick={onRowClick}
                      />
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent
                value="POD_REJECTED"
                className="flex-grow overflow-hidden"
              >
                {podsQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: no data → Empty stage */}
                    {pods?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="PODs-table"
                        columns={PODsColumns}
                        data={pods}
                        fetchNextPage={podsQuery.fetchNextPage}
                        isFetching={podsQuery.isFetching}
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

export default PODs;
