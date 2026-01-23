'use client';

import { gstAPIs } from '@/api/gstAPI/gstApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import ActionsDropdown from '@/components/deliveryManagement/ActionsDropdown';
import { PrepareGstrModal } from '@/components/statutory/PrepareGSTModal';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import { filedGsts } from '@/services/GST_Services/GST_Services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useGstColumns } from './useGstColumns';

const PAGE_LIMIT = 10;
// TODO: get dynamic GSTINs
// const GSTIN = '29AADCB2230M1ZT';

const GST = () => {
  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const translations = useTranslations('gsts');
  const keys = [
    'gsts.emptyStateComponent.subItems.subItem1',
    'gsts.emptyStateComponent.subItems.subItem2',
    'gsts.emptyStateComponent.subItems.subItem3',
    'gsts.emptyStateComponent.subItems.subItem4',
  ];

  const router = useRouter();
  const { hasPermission } = usePermission();
  const [tab, setTab] = useState('pending');
  const [gsts, setGsts] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [isPreparingGSTR1, setIsPreparingGSTR1] = useState(false);

  // Handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  //   get filed gsts
  const gstsQuery = useInfiniteQuery({
    queryKey: [gstAPIs.filedGsts.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return filedGsts({
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
    staleTime: Infinity, // data never becomes stale
    refetchOnMount: false, // don’t refetch on remount
    refetchOnWindowFocus: false, // already correct
  });

  useEffect(() => {
    const source = gstsQuery.data;
    if (!source?.pages?.length) return;

    // flatten items from  pages
    const flattened = source.pages.flatMap(
      (page) => page?.data?.data?.data || [],
    );

    // remove duplicates by id
    const uniqueQCListData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );

    setGsts(uniqueQCListData);

    // pagination from last page
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;

    setPaginationData({
      totalPages: Number(lastPage?.totalPages ?? 0),
      currFetchedPage: Number(lastPage?.page ?? 0),
    });
  }, [gstsQuery.data]);

  //   TODO: columns headers change
  const gstColumns = useGstColumns();

  return (
    <ProtectedWrapper permissionCode="permission:sales-view">
      {!enterpriseId || !isEnterpriseOnboardingComplete ? (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      ) : (
        <Wrapper className="h-screen">
          <SubHeader name={translations('title')}>
            <div className="flex items-center justify-center gap-2">
              {/* <Input disabled value={GSTIN} /> */}
              <ActionsDropdown
                label={'Prepare'}
                variant="default"
                actions={[
                  {
                    key: 'gstr1',
                    label: 'GSTR-1',
                    onClick: () => {
                      setIsPreparingGSTR1(true);
                    },
                  },
                  {
                    key: 'gstr3b',
                    label: 'GSTR-3B (coming soon)',
                    className: 'cursor-not-allowed opacity-50',
                    disabled: true,
                    onClick: () => {},
                  },
                ]}
              />
            </div>
          </SubHeader>

          {/* body - content */}
          <Tabs
            className="flex flex-col gap-2"
            value={tab}
            onValueChange={onTabChange}
            defaultValue={'userOverview'}
          >
            <TabsList className="w-fit border">
              <TabsTrigger value="pending">
                {translations('tabs.tab1.label')}
              </TabsTrigger>
              <TabsTrigger value="filled">
                {translations('tabs.tab2.label')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {' '}
              <div className="flex-grow overflow-hidden">
                {gstsQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: No search term, and no data → Empty stage */}
                    {gsts?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="gst-pending-table"
                        columns={gstColumns}
                        data={gsts}
                        fetchNextPage={gstsQuery.fetchNextPage}
                        isFetching={gstsQuery.isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        // onRowClick={onRowClick}
                      />
                    )}
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="filled">
              <div className="flex-grow overflow-hidden">
                {gstsQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: No search term, and no data → Empty stage */}
                    {gsts?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="gst-filled-table"
                        columns={gstColumns}
                        data={gsts}
                        fetchNextPage={gstsQuery.fetchNextPage}
                        isFetching={gstsQuery.isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        // onRowClick={onRowClick}
                      />
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* preparing - modal */}
          {isPreparingGSTR1 && (
            <PrepareGstrModal
              open={isPreparingGSTR1}
              onOpenChange={setIsPreparingGSTR1}
              filingPeriods={[
                { label: 'Jan 2025', value: '012025' },
                { label: 'Feb 2025', value: '022025' },
              ]}
              onPrepare={(period) => {
                setIsPreparingGSTR1(false);
                router.push(
                  `/dashboard/statutory/gst/gstr1?period=${encodeURIComponent(period)}`,
                );
              }}
            />
          )}
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default GST;
