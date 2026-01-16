'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { orderApi } from '@/api/order_api/order_api';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
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
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService } from '@/lib/utils';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  exportOrder,
  GetSales,
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
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import { SalesTable } from '../salestable/SalesTable';
import { useSalesColumns } from './useSalesColumns';

// dynamic imports
const CreateOrder = dynamic(() => import('@/components/orders/CreateOrderS'), {
  loading: () => <Loading />,
});

const EditOrder = dynamic(() => import('@/components/orders/EditOrderS'), {
  loading: () => <Loading />,
});

// macros
const PAGE_LIMIT = 10;

const SalesOrder = () => {
  useMetaData('Hues! - Sales Orders', 'HUES SALES'); // dynamic title

  const translations = useTranslations('sales.sales-orders');
  const keys = [
    'sales.sales-orders.emtpyStateComponent.subItems.subItem1',
    'sales.sales-orders.emtpyStateComponent.subItems.subItem2',
    'sales.sales-orders.emtpyStateComponent.subItems.subItem3',
    'sales.sales-orders.emtpyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const { hasPermission } = usePermission();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [isCreatingSales, setIsCreatingSales] = useState(false);
  // const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [salesListing, setSalesListing] = useState([]);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [filterData, setFilterData] = useState(null);
  const [referenceOrderId, setReferenceOrderId] = useState(null);

  // Handle tab change
  const onTabChange = (value) => {
    setTab(value); // Update the tab state
  };

  useEffect(() => {
    if (isCreatingSales && referenceOrderId) {
      router.push(
        `/dashboard/sales/sales-orders?action=create_order&referenceId=${referenceOrderId}`,
      );
    } else if (isCreatingSales) {
      router.push(`/dashboard/sales/sales-orders?action=create_order`);
    } else {
      router.push(`/dashboard/sales/sales-orders`);
    }
  }, [isCreatingSales]);
  // Set `isCreatingSales` and `referenceOrderId` from URL
  useEffect(() => {
    const action = searchParams.get('action');
    const referenceId = searchParams.get('referenceId');

    if (action === 'create_order') {
      setIsCreatingSales(true);
      if (referenceId) {
        setReferenceOrderId(referenceId);
      }
    } else {
      setIsCreatingSales(false);
      setReferenceOrderId(null);
    }
  }, [searchParams]);

  useEffect(() => {
    let newFilterData = {};

    if (tab === 'underReview') {
      newFilterData = {
        status: ['OFFER_SENT', 'BID_RECEIVED'],
      };
    } else if (tab === 'confirmedOrders') {
      newFilterData = {
        status: ['ACCEPTED'],
        invoiceStatus: false,
      };
    } else if (tab === 'receivables') {
      newFilterData = {
        invoiceStatus: true,
      };
    } else if (tab === 'all') {
      newFilterData =
        filterData?.clientIds?.length > 0
          ? { clientIds: filterData.clientIds }
          : null;
    }

    // ✅ Conditionally add clientIds only if they exist
    if (filterData?.clientIds?.length > 0) {
      newFilterData.clientIds = filterData.clientIds;
    }

    // ✅ Update only if meaningfully different
    setFilterData((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(newFilterData)) {
        return newFilterData;
      }
      return prev;
    });
  }, [tab]);

  const stableFilterKey = useMemo(() => {
    if (!filterData) return null;
    return JSON.stringify(filterData);
  }, [filterData]);

  // Fetch sales data with infinite scroll
  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery({
    queryKey: [orderApi.getSales.endpointKey, enterpriseId, stableFilterKey],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await GetSales({
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
    enabled: hasPermission('permission:sales-view'),
    placeholderData: keepPreviousData,
  });

  // data flattened - formatting
  useEffect(() => {
    if (!data) return;

    // Flatten sales data from all pages
    const flattenedSalesData = data.pages
      .map((page) => page?.data?.data?.data) // Assuming sales data is nested in `data.data.data`
      .flat();

    // Deduplicate sales data based on unique `id`
    const uniqueSalesData = Array.from(
      new Map(
        flattenedSalesData.map((sale) => [
          sale.id, // Assuming `id` is the unique identifier for each sale
          sale,
        ]),
      ).values(),
    );

    // Update state with deduplicated sales data
    setSalesListing(uniqueSalesData);

    // Calculate pagination data using the last page's information
    const lastPage = data.pages[data.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [data]);

  // search by client
  const {
    data: clientData,
    refetch: fetchClients,
    isFetching: isClientFetching,
    isLoading: isClientLoading,
  } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey, enterpriseId],
    queryFn: () => getClients({ id: enterpriseId, context: 'ORDER' }),
    enabled: clientDropdownOpen,
    select: (res) => res.data.data.users,
    refetchOnWindowFocus: false,
  });
  const isClientLoad = isClientFetching || isClientLoading;

  // flatten array to get exact data
  let formattedClientData = [];
  if (clientData) {
    formattedClientData = clientData.flatMap((user) => {
      let userDetails;
      if (user.client && user?.client?.name !== null) {
        userDetails = { ...user.client };
      } else {
        userDetails = { ...user };
      }

      return {
        ...userDetails,
        id: user?.client?.id || user?.id,
        name: user?.client?.name || user?.invitation?.userDetails?.name,
      };
    });
  }
  // options data : clients
  const updatedClientData = formattedClientData.map((item) => {
    return {
      value: item.id,
      label: item.name,
    };
  });

  // value : client
  const valueClient = filterData?.clientIds?.map((client) => ({
    value: client,
    label: updatedClientData.find((opt) => opt?.value === client)?.label,
  }));

  const handleChangeForClient = (value) => {
    const ids = Array.isArray(value)
      ? value.map((v) => v.value)
      : value
        ? [value.value]
        : [];

    setFilterData((prev) => {
      // Create a copy to modify safely
      const updated = { ...prev };

      if (ids.length > 0) {
        updated.clientIds = ids; // add only when non-empty
      } else {
        delete updated.clientIds; // remove clientIds if empty
      }

      return updated;
    });
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
    const isSalesOrderRead = row?.readTracker?.sellerIsRead || true;
    const readTrackerId = row?.readTracker?.id;

    if (isSalesOrderRead) {
      router.push(`/dashboard/sales/sales-orders/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(readTrackerId);
      router.push(`/dashboard/sales/sales-orders/${row.id}`);
    }
  };

  // [EXPORT ORDER Fn] ✅
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
      downloadBlobFile(blobData, 'sales_orders.xlsx');
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

  // columns
  const SalesColumns = useSalesColumns(
    setIsEditingOrder,
    setOrderId,
    setSelectedOrders,
  );

  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && (
        <>
          {!isCreatingSales && !isEditingOrder && (
            <Wrapper className="h-screen overflow-hidden">
              {/* Headers */}
              <SubHeader
                name={translations('title')}
                className="sticky top-0 z-10 flex items-center justify-between bg-white"
              >
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

                  <ProtectedWrapper permissionCode={'permission:sales-create'}>
                    <Tooltips
                      trigger={
                        <Button
                          onClick={() => setIsCreatingSales(true)}
                          size="sm"
                        >
                          <PlusCircle size={14} />
                          {translations('ctas.offer.cta')}
                        </Button>
                      }
                      content={translations('ctas.offer.placeholder')}
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
                    <TabsTrigger value="confirmedOrders">
                      {translations('tabs.label.tab3')}
                    </TabsTrigger>
                    <TabsTrigger value="receivables">
                      {translations('tabs.label.tab4')}
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-2">
                    {/* Search by Customer */}
                    <Select
                      name="clientIds"
                      isClearable
                      isLoading={isClientLoad}
                      placeholder={translations('ctas.search.placeholder')}
                      options={updatedClientData}
                      className="w-64 min-w-64 text-sm"
                      classNamePrefix="select"
                      value={valueClient}
                      onChange={handleChangeForClient}
                      onMenuOpen={() => {
                        setClientDropdownOpen(true);
                        fetchClients();
                      }}
                    />
                    {/* filters */}
                    <FilterModal
                      isSalesFilter={true}
                      tab={tab}
                      setFilterData={setFilterData}
                      setPaginationData={setPaginationData}
                    />
                  </div>
                </section>

                <TabsContent value="all" className="flex-grow overflow-hidden">
                  {isLoading && <Loading />}
                  {!isLoading &&
                    (salesListing?.length > 0 ? (
                      <SalesTable
                        id="sale-orders"
                        columns={SalesColumns}
                        data={salesListing}
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
                    ))}
                </TabsContent>

                <TabsContent
                  value="underReview"
                  className="flex-grow overflow-hidden"
                >
                  {isLoading && <Loading />}
                  {!isLoading &&
                    (salesListing?.length > 0 ? (
                      <SalesTable
                        id="sale-orders"
                        columns={SalesColumns}
                        data={salesListing}
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
                    ))}
                </TabsContent>

                <TabsContent
                  value="confirmedOrders"
                  className="flex-grow overflow-hidden"
                >
                  {isLoading && <Loading />}
                  {!isLoading &&
                    (salesListing?.length > 0 ? (
                      <SalesTable
                        id="sale-orders"
                        columns={SalesColumns}
                        data={salesListing}
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
                    ))}
                </TabsContent>

                <TabsContent
                  value="receivables"
                  className="flex-grow overflow-hidden"
                >
                  {isLoading && <Loading />}
                  {!isLoading &&
                    (salesListing?.length > 0 ? (
                      <SalesTable
                        id="sale-orders"
                        columns={SalesColumns}
                        data={salesListing}
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
                    ))}
                </TabsContent>
              </Tabs>
            </Wrapper>
          )}

          {/* create order component */}
          {isCreatingSales && !isEditingOrder && (
            <CreateOrder
              type="sales"
              name="Offer"
              cta="offer"
              isOrder="order"
              isCreatingSales={isCreatingSales}
              setIsCreatingSales={setIsCreatingSales}
              setSalesListing={setSalesListing}
              onCancel={() => setIsCreatingSales(false)}
              referenceOrderId={referenceOrderId}
            />
          )}

          {/* editOrder Component */}
          {isEditingOrder && !isCreatingSales && (
            <EditOrder
              cta="offer"
              isOrder="order"
              orderId={orderId}
              onCancel={() => setIsEditingOrder(false)}
            />
          )}
        </>
      )}
    </ProtectedWrapper>
  );
};

export default SalesOrder;
