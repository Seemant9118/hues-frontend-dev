'use client';

import { orderApi } from '@/api/order_api/order_api';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import Tooltips from '@/components/auth/Tooltips';
import FilterModal from '@/components/orders/FilterModal';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { LocalStorageService } from '@/lib/utils';
import {
  exportOrder,
  GetPurchases,
  getUnconfirmedPurchases,
} from '@/services/Orders_Services/Orders_Services';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
} from '@tanstack/react-query';
import {
  DatabaseZap,
  FileCheck,
  KeySquare,
  PlusCircle,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PurchaseTable } from '../purchasetable/PurchaseTable';
import { usePurchaseColumns } from './usePurchaseColumns';

// dynamic imports
const CreateOrder = dynamic(() => import('@/components/orders/CreateOrder'), {
  loading: () => <Loading />,
});

const EditOrder = dynamic(() => import('@/components/orders/EditOrder'), {
  loading: () => <Loading />,
});

// macros
const PAGE_LIMIT = 10;
const PurchaseEmptyStageData = {
  heading: `~"Simplify purchasing: from bids to invoices with digital negotiations and signatures, ensuring
  transparency and ease."`,
  subHeading: 'Features',
  subItems: [
    {
      id: 1,
      icon: <KeySquare size={14} />,
      subItemtitle: `Engage vendors with bids or receive offers on a unified platform.`,
    },
    {
      id: 2,
      icon: <DatabaseZap size={14} />,
      subItemtitle: `Securely negotiate and finalize purchases with digital signatures.`,
    },
    {
      id: 3,
      icon: <ShieldCheck size={14} />,
      subItemtitle: `Generate and organize invoices automatically or manually for precise tracking.`,
    },
    {
      id: 4,
      icon: <FileCheck size={14} />,
      subItemtitle: `Streamline internal and external financial processes with easy payment advice.`,
    },
  ],
};

const PurchaseOrders = () => {
  useMetaData('Hues! - Purchase Orders', 'HUES PURCHASES'); // dynamic title
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');

  const router = useRouter();
  const observer = useRef(); // Ref for infinite scrolling observer
  const [tab, setTab] = useState('all');
  const [isOrderCreationSuccess, setIsOrderCreationSuccess] = useState(false);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [paginationData, setPaginationData] = useState({}); // Ensure default structure
  const [unconfimedPaginationData, setUnconfimedPaginationData] = useState({});
  const [purchaseListing, setPurchaseListing] = useState([]);
  const [unconfirmedPurchaseListing, setUnconfirmedPurhchaseListing] = useState(
    [],
  );
  const [filterData, setFilterData] = useState(null); // Initialize with default filterPayload

  // Handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    // Apply filters based on the selected tab
    let newFilterData = null;
    if (tab === 'offerReceived') {
      newFilterData = { offerReceived: true };
    } else if (tab === 'pending') {
      newFilterData = { paymentStatus: 'NOT_PAID' };
    } else if (isOrderCreationSuccess) {
      newFilterData = {};
    }

    if (newFilterData) {
      setFilterData(newFilterData);
    }
  }, [tab]);

  // Fetch sales data with infinite scroll
  const { data, fetchNextPage, isFetching, isLoading, hasNextPage } =
    useInfiniteQuery({
      queryKey: [
        orderApi.getPurchases.endpointKey,
        enterpriseId,
        tab,
        filterData,
      ],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await GetPurchases({
          id: enterpriseId,
          data: { page: pageParam, limit: PAGE_LIMIT, ...(filterData || {}) },
        });
        return response;
      },
      initialPageParam: 1,
      getNextPageParam: (_lastGroup, groups) => {
        const nextPage = groups.length + 1;
        return nextPage <= _lastGroup.data.data.totalPages
          ? nextPage
          : undefined;
      },
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    });

  // data flattening - formatting
  useEffect(() => {
    if (!data) return;

    // Flatten purchases data from all pages
    const flattenedPurchaseData = data.pages
      .map((page) => page?.data?.data?.data) // Assuming sales data is nested in `data.data.data`
      .flat();

    // Deduplicate purchases data based on unique `id`
    const uniquePurchaseData = Array.from(
      new Map(
        flattenedPurchaseData.map((sale) => [
          sale.id, // Assuming `id` is the unique identifier for each sale
          sale,
        ]),
      ).values(),
    );

    // Update state with deduplicated purchases data
    setPurchaseListing(uniquePurchaseData);

    // Calculate pagination data using the last page's information
    const lastPage = data.pages[data.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [data]);

  // Infinite scroll observer
  const lastPurchaseRef = useCallback(
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

  // fetch unconfirmed sales with infinite scroll
  const {
    data: unconfirmedPurchaseLists,
    fetchNextPage: unconfirmedPurchaseFetchNextPage,
    isFetching: unconfirmedPurchaseListsIsFetching,
    isLoading: unconfirmedPurchaseListsIsLoading,
    hasNextPage: unconfirmedPuchaseHasNextPage,
  } = useInfiniteQuery({
    queryKey: [
      orderApi.getUnconfirmedPurchases.endpointKey,
      enterpriseId,
      filterData,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getUnconfirmedPurchases({
        id: enterpriseId,
        data: { page: pageParam, limit: PAGE_LIMIT, ...(filterData || {}) },
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
    enabled: tab === 'unconfirmed',
    placeholderData: keepPreviousData,
  });

  // data flattening - formatting
  useEffect(() => {
    if (!unconfirmedPurchaseLists) return;

    // Flatten purchases data from all pages
    const flattenedUnconfirmedPurchaseData = unconfirmedPurchaseLists.pages
      .map((page) => page?.data?.data?.data) // Assuming sales data is nested in `data.data.data`
      .flat();

    // Deduplicate purchases data based on unique `id`
    const uniqueUnconfirmedPurchaseData = Array.from(
      new Map(
        flattenedUnconfirmedPurchaseData.map((sale) => [
          sale.id, // Assuming `id` is the unique identifier for each sale
          sale,
        ]),
      ).values(),
    );

    // Update state with deduplicated purchases data
    setUnconfirmedPurhchaseListing(uniqueUnconfirmedPurchaseData);

    // Calculate pagination data using the last page's information
    const lastPage =
      unconfirmedPurchaseLists?.pages[data.pages.length - 1]?.data?.data;
    setUnconfimedPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [unconfirmedPurchaseLists]);

  // Infinite scroll observer
  const lastUnconfirmedRef = useCallback(
    (node) => {
      if (isFetching) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && unconfirmedPuchaseHasNextPage) {
          unconfirmedPurchaseFetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [
      unconfirmedPurchaseListsIsFetching,
      unconfirmedPurchaseFetchNextPage,
      unconfirmedPuchaseHasNextPage,
    ],
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
    const isPurchaseOrderRead = row?.readTracker?.buyerIsRead;

    if (isPurchaseOrderRead) {
      router.push(`/purchases/purchase-orders/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(row.id);
      router.push(`/purchases/purchase-orders/${row.id}`);
    }
  };

  // Function to trigger the download of a .xlsx file from Blob data
  const downloadBlobFile = (blobData, fileName) => {
    const el = document.createElement('a');
    const blobFile = window.URL.createObjectURL(blobData);
    el.href = blobFile;
    el.download = fileName;
    el.click();

    // Clean up the object URL after the download is triggered
    window.URL.revokeObjectURL(blobFile);
  };
  // Export order mutation
  const exportOrderMutation = useMutation({
    mutationKey: [orderApi.exportOrder.endpointKey],
    mutationFn: exportOrder,
    onSuccess: (response) => {
      // Assuming the API response is in Blob format
      const blobData = response.data; // This should be a Blob
      downloadBlobFile(blobData, 'purchase_orders.xlsx');
      toast.success('Order exported and download starts automatically');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });
  // handle export order click
  const handleExportOrder = () => {
    exportOrderMutation.mutate(selectedOrders);
  };

  const PurchaseColumns = usePurchaseColumns(
    setIsEditingOrder,
    setOrderId,
    setSelectedOrders,
  );

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete || !isKycVerified) && (
        <>
          <SubHeader name="Purchases" />
          <RestrictedComponent />
        </>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && isKycVerified && (
        <>
          {!isCreatingPurchase && !isEditingOrder && (
            <Wrapper>
              <SubHeader name={'Purchases'} className="z-10 bg-white">
                <div className="flex items-center justify-center gap-3">
                  <Tooltips
                    trigger={
                      <Button
                        disabled={selectedOrders?.length === 0}
                        onClick={handleExportOrder}
                        variant="outline"
                        className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                        size="sm"
                      >
                        <Upload size={14} />
                      </Button>
                    }
                    content={
                      selectedOrders?.length > 0
                        ? 'Export Selected Order'
                        : 'Select a Order to export'
                    }
                  />

                  <Tooltips
                    trigger={
                      <Button
                        onClick={() => setIsCreatingPurchase(true)}
                        className="w-24 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                        size="sm"
                      >
                        <PlusCircle size={14} />
                        Bid
                      </Button>
                    }
                    content={'Create a new purchase order'}
                  />
                </div>
              </SubHeader>

              <section>
                <Tabs
                  value={tab}
                  onValueChange={onTabChange}
                  defaultValue={'all'}
                >
                  <section className="sticky top-14 flex justify-between bg-white">
                    <TabsList className="border">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="offerReceived">
                        Offer Recieved
                      </TabsTrigger>
                      <TabsTrigger value="pending">Payment Pending</TabsTrigger>
                      <TabsTrigger value="unconfirmed">Unconfirmed</TabsTrigger>
                    </TabsList>
                    <FilterModal
                      isSalesFilter={false}
                      tab={tab}
                      setFilterData={setFilterData}
                      setPaginationData={setPaginationData}
                    />
                  </section>

                  <TabsContent value="all">
                    {isLoading && <Loading />}

                    {!isLoading &&
                      (purchaseListing?.length > 0 ? (
                        <PurchaseTable
                          id="purchase-orders"
                          columns={PurchaseColumns}
                          data={purchaseListing}
                          fetchNextPage={fetchNextPage}
                          isFetching={isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                          lastPurhaseRef={lastPurchaseRef}
                        />
                      ) : (
                        <EmptyStageComponent
                          heading={PurchaseEmptyStageData.heading}
                          desc={PurchaseEmptyStageData.desc}
                          subHeading={PurchaseEmptyStageData.subHeading}
                          subItems={PurchaseEmptyStageData.subItems}
                        />
                      ))}
                  </TabsContent>
                  <TabsContent value="offerReceived">
                    {isLoading && <Loading />}

                    {!isLoading &&
                      (purchaseListing?.length > 0 ? (
                        <PurchaseTable
                          id="purchase-orders"
                          columns={PurchaseColumns}
                          data={purchaseListing}
                          fetchNextPage={fetchNextPage}
                          isFetching={isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                          lastPurhaseRef={lastPurchaseRef}
                        />
                      ) : (
                        <EmptyStageComponent
                          heading={PurchaseEmptyStageData.heading}
                          desc={PurchaseEmptyStageData.desc}
                          subHeading={PurchaseEmptyStageData.subHeading}
                          subItems={PurchaseEmptyStageData.subItems}
                        />
                      ))}
                  </TabsContent>
                  <TabsContent value="pending">
                    {isLoading && <Loading />}

                    {!isLoading &&
                      (purchaseListing?.length > 0 ? (
                        <PurchaseTable
                          id="purchase-orders"
                          columns={PurchaseColumns}
                          data={purchaseListing}
                          fetchNextPage={fetchNextPage}
                          isFetching={isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                          lastPurhaseRef={lastPurchaseRef}
                        />
                      ) : (
                        <EmptyStageComponent
                          heading={PurchaseEmptyStageData.heading}
                          desc={PurchaseEmptyStageData.desc}
                          subHeading={PurchaseEmptyStageData.subHeading}
                          subItems={PurchaseEmptyStageData.subItems}
                        />
                      ))}
                  </TabsContent>

                  <TabsContent value="unconfirmed">
                    {unconfirmedPurchaseListsIsLoading && <Loading />}

                    {!unconfirmedPurchaseListsIsLoading &&
                      (unconfirmedPurchaseListing?.length > 0 ? (
                        <PurchaseTable
                          id="purchase-uncofirmed-orders"
                          columns={PurchaseColumns}
                          data={unconfirmedPurchaseListing}
                          fetchNextPage={unconfirmedPurchaseFetchNextPage}
                          isFetching={unconfirmedPurchaseListsIsFetching}
                          totalPages={
                            unconfimedPaginationData?.totalPagesUnconfirmed
                          }
                          currFetchedPage={
                            unconfimedPaginationData?.currFetchedPageUnconfirmed
                          }
                          onRowClick={onRowClick}
                          lastUnconfirmedRef={lastUnconfirmedRef}
                        />
                      ) : (
                        <EmptyStageComponent
                          heading={PurchaseEmptyStageData.heading}
                          desc={PurchaseEmptyStageData.desc}
                          subHeading={PurchaseEmptyStageData.subHeading}
                          subItems={PurchaseEmptyStageData.subItems}
                        />
                      ))}
                  </TabsContent>
                </Tabs>
              </section>
            </Wrapper>
          )}
          {isCreatingPurchase && !isEditingOrder && (
            <CreateOrder
              type="purchase"
              name={'Bid'}
              cta="bid"
              isOrder="order"
              isCreatingPurchase={isCreatingPurchase}
              setPurchaseListing={setPurchaseListing}
              onCancel={() => setIsCreatingPurchase(false)}
              onSubmit={() => {
                setIsCreatingPurchase(false);
              }}
              setIsOrderCreationSuccess={setIsOrderCreationSuccess}
            />
          )}

          {isEditingOrder && !isCreatingPurchase && (
            <EditOrder
              type="purchase"
              name="Edit"
              cta="purchase"
              orderId={orderId}
              onCancel={() => setIsEditingOrder(false)}
              setIsOrderCreationSuccess={setIsOrderCreationSuccess}
            />
          )}
        </>
      )}
    </>
  );
};

export default PurchaseOrders;
