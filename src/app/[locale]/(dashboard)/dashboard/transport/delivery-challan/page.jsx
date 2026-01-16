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
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import { getDeliveryChallans } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import useMetaData from '@/hooks/useMetaData';
import { toast } from 'sonner';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import DebouncedInput from '@/components/ui/DebouncedSearchInput';
import { useDeliveryChallanColumns } from './useDeliveryChallanColumns';

// macros
const PAGE_LIMIT = 10;

const DeliveryChallan = () => {
  useMetaData('Hues! - Delivery Challans', 'HUES Delivery Challans');
  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const translations = useTranslations('transport.delivery-challan');

  const keys = [
    'transport.delivery-challan.emtpyStateComponent.subItems.subItem1',
    'transport.delivery-challan.emtpyStateComponent.subItems.subItem2',
    'transport.delivery-challan.emtpyStateComponent.subItems.subItem3',
    'transport.delivery-challan.emtpyStateComponent.subItems.subItem4',
  ];

  const { hasPermission } = usePermission();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCycle, setSearchCycle] = useState(0);
  const [dispatchedNotes, setDispatchedNotes] = useState(null);
  const [paginationData, setPaginationData] = useState(null);

  const isSearching = searchTerm?.length > 0;
  const hasData = dispatchedNotes?.length > 0;

  const handleSearchChange = (val) => {
    setSearchTerm(val.trim() ?? '');

    // increment when clearing
    if (val === '') {
      setSearchCycle((prev) => prev + 1);
    }
  };

  // Fetch dispatched notes data with infinite scroll
  const {
    data,
    fetchNextPage,
    isFetching,
    isLoading: isDeliveryChallanLoading,
  } = useInfiniteQuery({
    queryKey: [
      deliveryProcess.getDeliveryChallans.endpointKey,
      enterpriseId,
      searchTerm,
      searchCycle,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getDeliveryChallans({
        page: pageParam,
        limit: PAGE_LIMIT,
        searchString: searchTerm,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    enabled: hasPermission('permission:sales-view'),
    staleTime: Infinity, // data never becomes stale
    refetchOnMount: false, // don’t refetch on remount
    refetchOnWindowFocus: false, // already correct
  });

  // data flattening - formatting
  useEffect(() => {
    if (!data) return;

    // Flatten delivery data from all pages
    const flattenedSalesDispatchedNotesData = data.pages
      .map((page) => page?.data?.data?.data) // Assuming sales dispatched data is nested in `data.data.data`
      .flat();

    // Deduplicate sales dispatched data based on unique `id`
    const uniqueSalesDispatchedNotesData = Array.from(
      new Map(
        flattenedSalesDispatchedNotesData.map((sale) => [
          sale.id, // Assuming `id` is the unique identifier for each sale invoice
          sale,
        ]),
      ).values(),
    );

    // Update state with deduplicated sales dispatched data
    setDispatchedNotes(uniqueSalesDispatchedNotesData);

    // Calculate pagination data using the last page's information
    const lastPage = data.pages[data.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [data]);

  // [updateReadTracker Mutation : onRowClick]
  const updateReadTrackerMutation = useMutation({
    mutationKey: [readTrackerApi.updateTrackerState.endpointKey],
    mutationFn: updateReadTracker,
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });
  const onRowClick = (row) => {
    const isSeller = row.enterpriseId === enterpriseId;
    const isRead = isSeller
      ? row?.readTracker?.sellerIsRead
      : row?.readTracker?.buyerIsRead || true;
    const readTrackerId = row?.readTracker?.id;

    if (isRead) {
      router.push(`/dashboard/transport/delivery-challan/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(readTrackerId);
      router.push(`/dashboard/transport/delivery-challan/${row.id}`);
    }
  };

  const dispatchedNotesColumns = useDeliveryChallanColumns(enterpriseId);

  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <Wrapper className="h-screen overflow-hidden">
          {/* Headers */}
          <SubHeader
            name={translations('title')}
            className="sticky top-0 z-10 flex items-center justify-between bg-white"
          >
            {' '}
            <div className="flex items-center justify-center gap-2">
              <DebouncedInput
                value={searchTerm}
                delay={400}
                onDebouncedChange={handleSearchChange}
                placeholder="Search Delivery Challan"
              />
            </div>
          </SubHeader>

          {isDeliveryChallanLoading ? (
            <Loading />
          ) : (
            <>
              {/* Case 1: No search term, and no data → Empty stage */}
              {!hasData && !isSearching ? (
                <EmptyStageComponent
                  heading={translations('emtpyStateComponent.heading')}
                  subItems={keys}
                />
              ) : (
                // Case 2: data is available → Show Table
                <InfiniteDataTable
                  id="delivery-challan-table"
                  columns={dispatchedNotesColumns}
                  data={hasData ? dispatchedNotes : []}
                  fetchNextPage={fetchNextPage}
                  isFetching={isFetching}
                  totalPages={paginationData?.totalPages}
                  currFetchedPage={paginationData?.currFetchedPage}
                  onRowClick={onRowClick}
                />
              )}
            </>
          )}
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default DeliveryChallan;
