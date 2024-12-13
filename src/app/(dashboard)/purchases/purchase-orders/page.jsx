'use client';

import { orderApi } from '@/api/order_api/order_api';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import FilterModal from '@/components/orders/FilterModal';
import { InfiniteDataTable } from '@/components/table/infinite-data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  exportOrder,
  GetPurchases,
  getUnconfirmedPurchases,
} from '@/services/Orders_Services/Orders_Services';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
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
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');

  const [tab, setTab] = useState('all');
  const [isOrderCreationSuccess, setIsOrderCreationSuccess] = useState(false);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [paginationData, setPaginationData] = useState(); // Ensure default structure
  const [purchaseListing, setPurchaseListing] = useState([]);
  const [unconfirmedPurchaseListing, setUnconfirmedPurhchaseListing] = useState(
    [],
  );
  const [purchasesDataByTab, setPurchasesDataByTab] = useState({
    all: [],
    offerReceived: [],
    pending: [],
    unconfirmed: [],
  });
  const [filterData, setFilterData] = useState({}); // Initialize with default filterPayload

  // Handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    // Clear existing salesListing and paginationData when the tab changes
    setPurchaseListing([]); // Reset salesListing
    setPaginationData(null); // Reset paginationData

    // Apply filters based on the selected tab
    let newFilterData = {};
    if (tab === 'offerReceived') {
      newFilterData = { offerReceived: true };
    } else if (tab === 'pending') {
      newFilterData = { paymentStatus: 'NOT_PAID' };
    } else if (isOrderCreationSuccess) {
      newFilterData = {};
    }

    setFilterData(newFilterData);

    // Check if data for this tab already exists to prevent unnecessary API calls
    if (purchasesDataByTab[tab]?.length > 0) {
      setPurchaseListing(purchasesDataByTab[tab]); // Use cached data for this tab
    }
  }, [tab]);

  // Fetch sales data with infinite scroll
  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery({
    queryKey: [orderApi.getPurchases.endpointKey, enterpriseId, filterData],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await GetPurchases({
        id: enterpriseId,
        data: { ...filterData, page: pageParam, limit: PAGE_LIMIT },
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage?.data?.data ?? {};
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.pages.length > 0) {
      const latestPage = data.pages[data.pages.length - 1].data.data;
      const newPurchaseData = latestPage.data;

      // Set the pagination data
      setPaginationData({
        currentPage: latestPage.currentPage,
        totalPages: latestPage.totalPages,
      });

      // Check if the current tab already has data to avoid duplicates
      setPurchasesDataByTab((prevData) => {
        if (prevData[tab]?.length === 0) {
          // Only store the fresh data if it's not already there
          return {
            ...prevData,
            [tab]: newPurchaseData, // Replace with fresh data for the current tab
          };
        }

        // Append unique data by filtering out duplicates
        const updatedTabData = [
          ...prevData[tab],
          ...newPurchaseData.filter(
            (item) =>
              !prevData[tab].some((prevItem) => prevItem.id === item.id),
          ),
        ];

        return {
          ...prevData,
          [tab]: updatedTabData, // Append only unique data
        };
      });

      // Update the current display data without appending duplicates
      setPurchaseListing((prevSales) => {
        if (prevSales.length === 0) {
          return newPurchaseData; // Set fresh data for the first time
        }

        // Append unique data to the sales listing
        const updatedPurchases = [
          ...prevSales,
          ...newPurchaseData.filter(
            (item) => !prevSales.some((prevItem) => prevItem.id === item.id),
          ),
        ];

        return updatedPurchases;
      });
    }
  }, [data, filterData]);

  // fetch unconfirmed sales with infinite scroll
  const {
    data: unconfirmedPurchaseLists,
    fetchNextPage: unconfirmedPurchaseFetchNextPage,
    isFetching: unconfirmedPurchaseListsIsFetching,
    isLoading: unconfirmedPurchaseListsIsLoading,
  } = useInfiniteQuery({
    queryKey: [
      orderApi.getUnconfirmedPurchases.endpointKey,
      enterpriseId,
      filterData,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getUnconfirmedPurchases({
        id: enterpriseId,
        data: { ...filterData, page: pageParam, limit: PAGE_LIMIT },
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage?.data?.data ?? {};
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    refetchOnWindowFocus: false,
    enabled: tab === 'unconfirmed',
  });

  useEffect(() => {
    if (unconfirmedPurchaseLists?.pages.length > 0) {
      const latestPage =
        unconfirmedPurchaseLists.pages[
          unconfirmedPurchaseLists.pages.length - 1
        ].data.data;
      const newUnconfirmedPurchaseData = latestPage.data;

      // Set the pagination data
      setPaginationData({
        currentPage: latestPage.currentPage,
        totalPages: latestPage.totalPages,
      });

      // Check if the current tab already has data to avoid duplicates
      setPurchasesDataByTab((prevData) => {
        if (prevData[tab]?.length === 0) {
          // Only store the fresh data if it's not already there
          return {
            ...prevData,
            [tab]: newUnconfirmedPurchaseData, // Replace with fresh data for the current tab
          };
        }

        // Append unique data by filtering out duplicates
        const updatedTabData = [
          ...prevData[tab],
          ...newUnconfirmedPurchaseData.filter(
            (item) =>
              !prevData[tab].some((prevItem) => prevItem.id === item.id),
          ),
        ];

        return {
          ...prevData,
          [tab]: updatedTabData, // Append only unique data
        };
      });

      // Update the current display data without appending duplicates
      setUnconfirmedPurhchaseListing((prevSales) => {
        if (prevSales.length === 0) {
          return newUnconfirmedPurchaseData; // Set fresh data for the first time
        }

        // Append unique data to the sales listing
        const updatedSales = [
          ...prevSales,
          ...newUnconfirmedPurchaseData.filter(
            (item) => !prevSales.some((prevItem) => prevItem.id === item.id),
          ),
        ];

        return updatedSales;
      });
    }
  }, [unconfirmedPurchaseLists, filterData]);

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
    if (selectedOrders.length === 0) {
      toast.error('Please select atleast One Order to export');
      return;
    }
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
                  <Button
                    onClick={handleExportOrder}
                    variant="outline"
                    className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                    size="sm"
                  >
                    <Upload size={14} />
                  </Button>

                  <Button
                    onClick={() => setIsCreatingPurchase(true)}
                    className="w-24 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                    size="sm"
                  >
                    <PlusCircle size={14} />
                    Bid
                  </Button>
                </div>
              </SubHeader>

              <section>
                <Tabs
                  value={tab}
                  onValueChange={onTabChange}
                  defaultValue={'all'}
                >
                  <section className="sticky top-14 z-10 flex justify-between bg-white">
                    <TabsList className="border">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="offerReceived">
                        Offer Recieved
                      </TabsTrigger>
                      <TabsTrigger value="pending">Payment Pending</TabsTrigger>
                      <TabsTrigger value="unconfirmed">Unconfirmed</TabsTrigger>
                    </TabsList>
                    <FilterModal setFilterData={setFilterData} />
                  </section>

                  <TabsContent value="all">
                    {isLoading && <Loading />}

                    {!isLoading &&
                      (purchaseListing?.length > 0 ? (
                        <InfiniteDataTable
                          id={'purchase-orders'}
                          columns={PurchaseColumns}
                          data={purchaseListing}
                          onRowClick={onRowClick}
                          isFetching={isFetching}
                          fetchNextPage={fetchNextPage}
                          filterData={filterData}
                          paginationData={paginationData}
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
                        <InfiniteDataTable
                          id={'purchase-orders'}
                          columns={PurchaseColumns}
                          data={purchaseListing}
                          onRowClick={onRowClick}
                          isFetching={isFetching}
                          fetchNextPage={fetchNextPage}
                          filterData={filterData}
                          paginationData={paginationData}
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
                        <InfiniteDataTable
                          id={'purchase-orders'}
                          columns={PurchaseColumns}
                          data={purchaseListing}
                          onRowClick={onRowClick}
                          isFetching={isFetching}
                          fetchNextPage={fetchNextPage}
                          filterData={filterData}
                          paginationData={paginationData}
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
                        <InfiniteDataTable
                          id={'purchase-orders'}
                          columns={PurchaseColumns}
                          data={unconfirmedPurchaseListing}
                          onRowClick={onRowClick}
                          isFetching={unconfirmedPurchaseListsIsFetching}
                          fetchNextPage={unconfirmedPurchaseFetchNextPage}
                          filterData={filterData}
                          paginationData={paginationData}
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
