'use client';

import { paymentApi } from '@/api/payments/payment_api';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import { getPaymentsList } from '@/services/Payment_Services/PaymentServices';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
} from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import emptyImg from '../../../../../../../public/Empty.png';
import { PurchaseTable } from '../purchasetable/PurchaseTable';
import { usePaymentsColumn } from './usePaymentsColumn';

const PAGE_LIMIT = 10;

const PurchasePayments = () => {
  useMetaData('Hues! - Purchase Payments', 'HUES PAYMENTS'); // dynamic title

  const translations = useTranslations('purchases.purchase-payments');

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const { hasPermission } = usePermission();
  const router = useRouter();
  const observer = useRef(); // Ref for infinite scrolling observer
  const [paymentsListing, setPaymentsListing] = useState(null);
  const [paginationData, setPaginationData] = useState(null);
  const [tab, setTab] = useState('ALL');

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading: isPaymentsLoading,
  } = useInfiniteQuery({
    queryKey: [paymentApi.getPaymentsList.endpointKey, tab],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getPaymentsList({
        page: pageParam,
        limit: PAGE_LIMIT,
        context: 'BUYER',
        status: tab,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
    enabled: hasPermission('permission:purchase-view'),
    placeholderData: keepPreviousData,
  });

  // data flattening - formatting
  useEffect(() => {
    if (!data) return;

    // Flatten Purchase payments data from all pages
    const flattenedPurchasePaymentsData = data.pages
      .map((page) => page?.data?.data?.data) // Assuming Purchase payments data is nested in `data.data.data`
      .flat();

    // Deduplicate Purchase payments data based on unique `id`
    const uniquePurchasePaymentsData = Array.from(
      new Map(
        flattenedPurchasePaymentsData.map((payment) => [
          payment.paymentId, // Assuming `id` is the unique identifier for each sale invoice
          payment,
        ]),
      ).values(),
    );

    // Update state with deduplicated Purchase payments data
    setPaymentsListing(uniquePurchasePaymentsData);

    // Calculate pagination data using the last page's information
    const lastPage = data.pages[data.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [data]);

  // Infinite scroll observer
  const lastPurchasePaymentsRef = useCallback(
    (node) => {
      if (isFetching) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching, fetchNextPage, hasNextPage],
  );

  // [updateReadTracker Mutation : onRowClick] ✅
  const updateReadTrackerMutation = useMutation({
    mutationKey: [readTrackerApi.updateTrackerState.endpointKey],
    mutationFn: updateReadTracker,
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const onRowClick = (row) => {
    const isBuyerRead = row?.buyerIsRead || true;
    const readTrackerId = row?.rereadTrackerId;

    if (isBuyerRead) {
      router.push(`/dashboard/purchases/purchase-payments/${row.paymentId}`);
    } else {
      updateReadTrackerMutation.mutate(readTrackerId);
      router.push(`/dashboard/purchases/purchase-payments/${row.paymentId}`);
    }
  };

  const paymentColumns = usePaymentsColumn();

  return (
    <ProtectedWrapper permissionCode={'permission:purchase-view'}>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <Wrapper>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </Wrapper>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <Wrapper className="h-screen overflow-hidden">
          {/* headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex w-full items-center justify-between gap-2">
              <SubHeader name={translations('title')} />
            </div>
          </section>

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
                <TabsTrigger value="PENDING">
                  {translations('tabs.tab2.label')}
                </TabsTrigger>
                <TabsTrigger value="ACCEPTED">
                  {translations('tabs.tab3.label')}
                </TabsTrigger>
              </TabsList>
            </section>
            <TabsContent value="ALL" className="flex-grow overflow-hidden">
              {/* Loading state */}
              {isPaymentsLoading && <Loading />}

              {/* Table when data is available */}
              {!isPaymentsLoading && paymentsListing?.length > 0 && (
                <PurchaseTable
                  id="purchase-debit-note-accepted"
                  columns={paymentColumns}
                  data={paymentsListing}
                  fetchNextPage={fetchNextPage}
                  isFetching={isFetching}
                  totalPages={paginationData?.totalPages}
                  currFetchedPage={paginationData?.currFetchedPage}
                  onRowClick={onRowClick}
                  lastPurchaseDebitNotesRef={lastPurchasePaymentsRef}
                />
              )}

              {/* Empty state */}
              {!isPaymentsLoading && paymentsListing?.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                  <Image src={emptyImg} alt="emptyIcon" />
                  <p className="text-lg font-bold text-black">
                    {translations('emptyStateComponent.heading')}
                  </p>
                  <p className="w-1/3 text-center">
                    {translations('emptyStateComponent.description')}
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="PENDING" className="flex-grow overflow-hidden">
              {/* Loading state */}
              {isPaymentsLoading && <Loading />}

              {/* Table when data is available */}
              {!isPaymentsLoading && paymentsListing?.length > 0 && (
                <PurchaseTable
                  id="purchase-debit-note-accepted"
                  columns={paymentColumns}
                  data={paymentsListing}
                  fetchNextPage={fetchNextPage}
                  isFetching={isFetching}
                  totalPages={paginationData?.totalPages}
                  currFetchedPage={paginationData?.currFetchedPage}
                  onRowClick={onRowClick}
                  lastPurchaseDebitNotesRef={lastPurchasePaymentsRef}
                />
              )}

              {/* Empty state */}
              {!isPaymentsLoading && paymentsListing?.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                  <Image src={emptyImg} alt="emptyIcon" />
                  <p className="text-lg font-bold text-black">
                    {translations('emptyStateComponent.heading')}
                  </p>
                  <p className="w-1/3 text-center">
                    {translations('emptyStateComponent.description')}
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="ACCEPTED" className="flex-grow overflow-hidden">
              {/* Loading state */}
              {isPaymentsLoading && <Loading />}

              {/* Table when data is available */}
              {!isPaymentsLoading && paymentsListing?.length > 0 && (
                <PurchaseTable
                  id="purchase-debit-note-accepted"
                  columns={paymentColumns}
                  data={paymentsListing}
                  fetchNextPage={fetchNextPage}
                  isFetching={isFetching}
                  totalPages={paginationData?.totalPages}
                  currFetchedPage={paginationData?.currFetchedPage}
                  onRowClick={onRowClick}
                  lastPurchaseDebitNotesRef={lastPurchasePaymentsRef}
                />
              )}

              {/* Empty state */}
              {!isPaymentsLoading && paymentsListing?.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                  <Image src={emptyImg} alt="emptyIcon" />
                  <p className="text-lg font-bold text-black">
                    {translations('emptyStateComponent.heading')}
                  </p>
                  <p className="w-1/3 text-center">
                    {translations('emptyStateComponent.description')}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default PurchasePayments;
