'use client';

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
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService } from '@/lib/utils';
import { getGRNs } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import DebouncedInput from '@/components/ui/DebouncedSearchInput';
import { useQCColumns } from './qcColumns';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [qcList, setQCList] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [tab, setTab] = useState('ALL');

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const qcQuery = useInfiniteQuery({
    queryKey: [deliveryProcess.getGRNs.endpointKey, tab],
    queryFn: async ({ pageParam = 1 }) => {
      return getGRNs({
        page: pageParam,
        limit: PAGE_LIMIT,
        parentQcStatus: tab,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    enabled: hasPermission('permission:item-masters-view'),
    staleTime: Infinity, // data never becomes stale
    refetchOnMount: false, // don’t refetch on remount
    refetchOnWindowFocus: false, // already correct
  });

  useEffect(() => {
    const source = qcQuery.data;
    if (!source?.pages?.length) return;

    // flatten items from  pages
    const flattened = source.pages.flatMap(
      (page) => page?.data?.data?.data || [],
    );

    // remove duplicates by id
    const uniqueQCListData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );

    setQCList(uniqueQCListData);

    // pagination from last page
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;

    setPaginationData({
      totalPages: Number(lastPage?.totalPages ?? 0),
      currFetchedPage: Number(lastPage?.page ?? 0),
    });
  }, [qcQuery.data]);

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
      router.push(`/dashboard/inventory/qc/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(readTrackerId);
      router.push(`/dashboard/inventory/qc/${row.id}`);
    }
  };

  const qcColumns = useQCColumns({ enterpriseId });

  return (
    <ProtectedWrapper permissionCode="permission:item-masters-view">
      {!enterpriseId || !isEnterpriseOnboardingComplete ? (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      ) : (
        <Wrapper className="h-screen">
          <SubHeader name={translations('title')}>
            <div className="flex items-center justify-center gap-2">
              <DebouncedInput
                value={searchTerm}
                delay={400}
                onDebouncedChange={setSearchTerm}
                placeholder="Search QC(s)"
              />
            </div>
          </SubHeader>

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
                <TabsTrigger value="IN_PROGRESS">
                  {translations('tabs.tab2.label')}
                </TabsTrigger>
                <TabsTrigger value="COMPLETE">
                  {translations('tabs.tab3.label')}
                </TabsTrigger>
                <TabsTrigger value="PENDING">
                  {translations('tabs.tab4.label')}
                </TabsTrigger>
              </TabsList>
            </section>

            <TabsContent value="ALL" className="flex-grow overflow-hidden">
              <div className="flex-grow overflow-hidden">
                {qcQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: No search term, and no data → Empty stage */}
                    {qcList?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="qc-table"
                        columns={qcColumns}
                        data={qcList}
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
            </TabsContent>

            <TabsContent
              value="IN_PROGRESS"
              className="flex-grow overflow-hidden"
            >
              <div className="flex-grow overflow-hidden">
                {qcQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: No search term, and no data → Empty stage */}
                    {qcList?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="qc-table"
                        columns={qcColumns}
                        data={qcList}
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
            </TabsContent>

            <TabsContent value="COMPLETE" className="flex-grow overflow-hidden">
              <div className="flex-grow overflow-hidden">
                {qcQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: No search term, and no data → Empty stage */}
                    {qcList?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="qc-table"
                        columns={qcColumns}
                        data={qcList}
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
            </TabsContent>

            <TabsContent value="PENDING" className="flex-grow overflow-hidden">
              <div className="flex-grow overflow-hidden">
                {qcQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: No search term, and no data → Empty stage */}
                    {qcList?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="qc-table"
                        columns={qcColumns}
                        data={qcList}
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
            </TabsContent>
          </Tabs>
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
}

export default QC;
