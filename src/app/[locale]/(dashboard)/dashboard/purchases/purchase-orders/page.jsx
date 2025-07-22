'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
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
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useAuth } from '@/context/AuthContext';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService } from '@/lib/utils';
import { getVendors } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
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
  useQuery,
} from '@tanstack/react-query';
import { PlusCircle, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
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

const PurchaseOrders = () => {
  useMetaData('Hues! - Purchase Orders', 'HUES PURCHASES'); // dynamic title

  const translations = useTranslations('purchases.purchase-orders');

  const keys = [
    'purchases.purchase-orders.emptyStateComponent.subItems.subItem1',
    'purchases.purchase-orders.emptyStateComponent.subItems.subItem2',
    'purchases.purchase-orders.emptyStateComponent.subItems.subItem3',
    'purchases.purchase-orders.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const router = useRouter();
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
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [filterData, setFilterData] = useState({ clientIds: [] }); // Initialize with default filterPayload

  // Handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    // Apply filters based on the selected tab
    let newFilterData = null;

    if (tab === 'underReview') {
      newFilterData = { offerReceived: true, clientIds: filterData?.clientIds };
    } else if (tab === 'confirmed') {
      newFilterData = {
        status: ['ACCEPTED'],
        invoiceStatus: false,
        clientIds: filterData?.clientIds,
      };
    } else if (tab === 'payables') {
      newFilterData = {
        paymentStatus: ['NOT_PAID'],
        clientIds: filterData?.clientIds,
      };
    } else if (isOrderCreationSuccess) {
      newFilterData = null;
    } else if (tab === 'all') {
      // ✅ Just keep clientIds if present, no extra filters
      if (filterData?.clientIds?.length > 0) {
        newFilterData = {
          clientIds: filterData.clientIds,
        };
      } else {
        newFilterData = null; // no filters applied
      }
    }

    setFilterData(newFilterData);
  }, [tab]);

  // Fetch purchases data with infinite scroll
  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery({
    queryKey: [orderApi.getPurchases.endpointKey, enterpriseId, filterData],
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
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
    enabled: hasPermission('permission:purchase-view'),
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

  // search by vendor
  const {
    data: vendorData,
    refetch: fetchVendors,
    isFetching: isVendorFetching,
    isLoading: isVendorLoading,
  } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey, enterpriseId],
    queryFn: () => getVendors({ id: enterpriseId, context: 'ORDER' }),
    enabled: vendorDropdownOpen,
    select: (res) => res.data.data.users,
    refetchOnWindowFocus: false,
  });
  const isVendorLoad = isVendorFetching || isVendorLoading;

  // flatten array to get exact data
  let formattedVendorData = [];
  if (vendorData) {
    formattedVendorData = vendorData.flatMap((user) => {
      let userDetails;
      if (user.vendor && user?.vendor?.name !== null) {
        userDetails = { ...user.vendor };
      } else {
        userDetails = { ...user };
      }

      return {
        ...userDetails,
        id: user?.vendor?.id || user?.id,
        name: user?.vendor?.name || user?.invitation?.userDetails?.name,
      };
    });
  }
  // options data : vendor
  const updatedVendorData = formattedVendorData.map((item) => {
    return {
      value: item.id,
      label: item.name,
    };
  });
  // value : vendors
  const valueVendor = filterData?.clientIds?.map((vendor) => ({
    value: vendor,
    label: updatedVendorData?.find((opt) => opt.value === vendor)?.label,
  }));

  // handlerChangeFn : vendors
  const handleChangeForVendor = (value) => {
    const ids = Array.isArray(value)
      ? value.map((v) => v.value)
      : value
        ? [value.value]
        : [];

    setFilterData((prev) => ({
      ...prev,
      clientIds: ids,
    }));
  };

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
      router.push(`/dashboard/purchases/purchase-orders/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(row.id);
      router.push(`/dashboard/purchases/purchase-orders/${row.id}`);
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
      toast.success(translations('ctas.export.successMsg'));
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('ctas.export.errorMsg'),
      );
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

  if (!permissions || permissions.length === 0) {
    return null; // or <Loading />
  }

  if (!hasPermission('permission:purchase-view')) {
    router.replace('/unauthorized');
    return null;
  }

  return (
    <ProtectedWrapper permissionCode={'permission:purchase-view'}>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <>
          {!isCreatingPurchase && !isEditingOrder && (
            <Wrapper className="h-screen overflow-hidden">
              {/* headers */}
              <SubHeader name={translations('title')} className="z-10 bg-white">
                <div className="flex items-center justify-center gap-3">
                  <Tooltips
                    trigger={
                      <Button
                        disabled={
                          selectedOrders?.length === 0 ||
                          exportOrderMutation.isPending
                        }
                        onClick={handleExportOrder}
                        variant="outline"
                        className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                        size="sm"
                      >
                        <Upload size={14} />
                      </Button>
                    }
                    content={translations('ctas.export.placeholder')}
                  />

                  <ProtectedWrapper
                    permissionCode={'permission:purchase-create'}
                  >
                    <Tooltips
                      trigger={
                        <Button
                          onClick={() => setIsCreatingPurchase(true)}
                          className="w-24 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                          size="sm"
                        >
                          <PlusCircle size={14} />
                          {translations('ctas.bid.cta')}
                        </Button>
                      }
                      content={translations('ctas.bid.placeholder')}
                    />
                  </ProtectedWrapper>
                </div>
              </SubHeader>

              <Tabs
                value={tab}
                onValueChange={onTabChange}
                defaultValue={'all'}
                className="flex flex-grow flex-col overflow-hidden"
              >
                <section className="flex w-full justify-between py-2">
                  <TabsList className="border">
                    <TabsTrigger value="all">
                      {translations('tabs.label.tab1')}
                    </TabsTrigger>
                    <TabsTrigger value="underReview">
                      {translations('tabs.label.tab2')}
                    </TabsTrigger>
                    <TabsTrigger value="confirmed">
                      {translations('tabs.label.tab3')}
                    </TabsTrigger>
                    <TabsTrigger value="payables">
                      {translations('tabs.label.tab4')}
                    </TabsTrigger>
                    <TabsTrigger value="unconfirmed">
                      {translations('tabs.label.tab5')}
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-2">
                    {/* Search by Customer */}
                    <Select
                      name="clientIds"
                      isClearable
                      isLoading={isVendorLoad}
                      placeholder={translations('ctas.search.placeholder')}
                      options={updatedVendorData}
                      className="w-64 min-w-64 text-sm"
                      classNamePrefix="select"
                      value={valueVendor}
                      onChange={handleChangeForVendor}
                      onMenuOpen={() => {
                        setVendorDropdownOpen(true);
                        fetchVendors();
                      }}
                    />
                    {/* filters */}
                    <FilterModal
                      isSalesFilter={false}
                      tab={tab}
                      setFilterData={setFilterData}
                      setPaginationData={setPaginationData}
                    />
                  </div>
                </section>

                <TabsContent value="all" className="flex-grow overflow-hidden">
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
                      />
                    ) : (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ))}
                </TabsContent>
                <TabsContent
                  value="underReview"
                  className="flex-grow overflow-hidden"
                >
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
                      />
                    ) : (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ))}
                </TabsContent>
                <TabsContent
                  value="confirmed"
                  className="flex-grow overflow-hidden"
                >
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
                      />
                    ) : (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ))}
                </TabsContent>
                <TabsContent
                  value="payables"
                  className="flex-grow overflow-hidden"
                >
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
                      />
                    ) : (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ))}
                </TabsContent>

                <TabsContent
                  value="unconfirmed"
                  className="flex-grow overflow-hidden"
                >
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
                      />
                    ) : (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ))}
                </TabsContent>
              </Tabs>
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
    </ProtectedWrapper>
  );
};

export default PurchaseOrders;
