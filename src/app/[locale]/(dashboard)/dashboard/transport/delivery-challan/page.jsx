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
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDeliveryChallanColumns } from './useDeliveryChallanColumns';

// macros
const PAGE_LIMIT = 10;

const DeliveryChallan = () => {
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
  const [dispatchedNotes, setDispatchedNotes] = useState(null);
  const [paginationData, setPaginationData] = useState(null);

  // Fetch dispatched notes data with infinite scroll
  const {
    data,
    fetchNextPage,
    isFetching,
    isLoading: isInvoiceLoading,
  } = useInfiniteQuery({
    queryKey: [deliveryProcess.getDeliveryChallans.endpointKey, enterpriseId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getDeliveryChallans({
        page: pageParam,
        limit: PAGE_LIMIT,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    enabled: hasPermission('permission:sales-view'),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
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

  const onRowClick = (row) => {
    router.push(`/dashboard/transport/delivery-challan/${row.id}`);
  };

  const dispatchedNotesColumns = useDeliveryChallanColumns();

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
          ></SubHeader>

          {isInvoiceLoading && <Loading />}
          {!isInvoiceLoading && dispatchedNotes?.length > 0 ? (
            <InfiniteDataTable
              id="delivery-challan-table"
              columns={dispatchedNotesColumns}
              data={dispatchedNotes}
              fetchNextPage={fetchNextPage}
              isFetching={isFetching}
              totalPages={paginationData?.totalPages}
              currFetchedPage={paginationData?.currFetchedPage}
              onRowClick={onRowClick}
            />
          ) : (
            <EmptyStageComponent
              heading={translations('emtpyStateComponent.heading')}
              subItems={keys}
            />
          )}
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default DeliveryChallan;
