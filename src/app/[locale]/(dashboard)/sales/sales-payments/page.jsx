'use client';

import { paymentApi } from '@/api/payments/payment_api';
import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { LocalStorageService } from '@/lib/utils';
import { getPaymentsList } from '@/services/Payment_Services/PaymentServices';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SalesTable } from '../salestable/SalesTable';
import { usePaymentsColumn } from './usePaymentsColumn';

const PAGE_LIMIT = 10;

const SalesPayments = () => {
  useMetaData('Hues! - Sales Payments', 'HUES PAYMENTS'); // dynamic title

  const translations = useTranslations('sales.sales-payments');
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const router = useRouter();
  const observer = useRef(); // Ref for infinite scrolling observer
  const [paymentsListing, setPaymentsListing] = useState(null);
  const [paginationData, setPaginationData] = useState(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading: isPaymentsLoading,
  } = useInfiniteQuery({
    queryKey: [paymentApi.getPaymentsList.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getPaymentsList({
        page: pageParam,
        limit: PAGE_LIMIT,
        context: 'SELLER',
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // data flattening - formatting
  useEffect(() => {
    if (!data) return;

    // Flatten sales payments data from all pages
    const flattenedSalesPaymentsData = data.pages
      .map((page) => page?.data?.data?.data) // Assuming sales payments data is nested in `data.data.data`
      .flat();

    // Deduplicate sales payments data based on unique `id`
    const uniqueSalesPaymentsData = Array.from(
      new Map(
        flattenedSalesPaymentsData.map((payment) => [
          payment.paymentId, // Assuming `id` is the unique identifier for each sale invoice
          payment,
        ]),
      ).values(),
    );

    // Update state with deduplicated sales payments data
    setPaymentsListing(uniqueSalesPaymentsData);

    // Calculate pagination data using the last page's information
    const lastPage = data.pages[data.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [data]);

  // Infinite scroll observer
  const lastSalesPaymentsRef = useCallback(
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

  const onRowClick = (row) => {
    router.push(`/sales/sales-payments/${row.paymentId}`);
  };

  const paymentColumns = usePaymentsColumn();

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <Wrapper>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </Wrapper>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <Wrapper>
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex w-full items-center justify-between gap-2">
              <SubHeader name={translations('title')} />
              <Tooltips
                trigger={
                  <Button
                    onClick={() => {}}
                    variant="outline"
                    className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                    size="sm"
                  >
                    <Download size={14} />
                  </Button>
                }
                content={'Coming Soon...'}
              />
            </div>
          </section>

          <section>
            {/* Loading state */}
            {isPaymentsLoading && <Loading />}

            {/* Table when data is available */}
            {!isPaymentsLoading && paymentsListing?.length > 0 && (
              <SalesTable
                id="sales-payments-listing"
                columns={paymentColumns}
                data={paymentsListing}
                fetchNextPage={fetchNextPage}
                isFetching={isFetching}
                totalPages={paginationData?.totalPages}
                currFetchedPage={paginationData?.currFetchedPage}
                lastSalesPaymentsRef={lastSalesPaymentsRef}
                onRowClick={onRowClick}
              />
            )}

            {/* Empty state */}
            {!isPaymentsLoading && paymentsListing?.length === 0 && (
              <div className="flex h-[38rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                <Image
                  src={'/Empty.png'}
                  alt="emptyIcon"
                  width={100}
                  height={100}
                />
                <p className="text-lg font-bold text-black">
                  {translations('emptyStateComponent.heading')}
                </p>
                <p className="w-1/3 text-center">
                  {translations('emptyStateComponent.description')}
                </p>
              </div>
            )}
          </section>
        </Wrapper>
      )}
    </>
  );
};

export default SalesPayments;
