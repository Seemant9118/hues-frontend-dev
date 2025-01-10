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
import { LocalStorageService } from '@/lib/utils';
import {
  exportOrder,
  GetSales,
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
  FileText,
  KeySquare,
  PlusCircle,
  Upload,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { SalesTable } from '../salestable/SalesTable';
import { useSalesColumns } from './useSalesColumns';

// dynamic imports
const CreateOrder = dynamic(() => import('@/components/orders/CreateOrder'), {
  loading: () => <Loading />,
});

const EditOrder = dynamic(() => import('@/components/orders/EditOrder'), {
  loading: () => <Loading />,
});

// macros
const PAGE_LIMIT = 10;
const SaleEmptyStageData = {
  heading: `~"Seamlessly manage sales, from bids to digital negotiations and secure invoicing with digital
  signatures."`,
  subHeading: 'Features',
  subItems: [
    {
      id: 1,
      icon: <FileCheck size={14} />,
      subItemtitle: `Initiate sales and deals by receiving bids or making offers.`,
    },
    // { id: 2, subItemtitle: `Maximize impact by making or receiving offers on your catalogue.` },
    {
      id: 3,
      icon: <FileText size={14} />,
      subItemtitle: `Securely negotiate with digitally signed counter-offers and bids.`,
    },
    {
      id: 4,
      icon: <KeySquare size={14} />,
      subItemtitle: `Finalize deals with mutual digital signatures for binding commitment.`,
    },
    {
      id: 5,
      icon: <DatabaseZap size={14} />,
      subItemtitle: `Effortlessly create and share detailed invoices, completing sales professionally. `,
    },
  ],
};

const SalesOrder = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');

  const router = useRouter();
  const observer = useRef(); // Ref for infinite scrolling observer
  const [tab, setTab] = useState('all');
  const [isCreatingSales, setIsCreatingSales] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [salesListing, setSalesListing] = useState([]);
  const [filterData, setFilterData] = useState({});

  // Handle tab change
  const onTabChange = (value) => {
    setTab(value); // Update the tab state
  };

  // Update filterData dynamically based on the selected tab
  useEffect(() => {
    let newFilterData = {};
    if (tab === 'bidReceived') {
      newFilterData = { bidReceived: true };
    } else if (tab === 'pending') {
      newFilterData = { paymentStatus: 'NOT_PAID' };
    }
    setFilterData(newFilterData);
  }, [tab]);

  // Fetch sales data with infinite scroll
  const { data, fetchNextPage, isFetching, isLoading, hasNextPage } =
    useInfiniteQuery({
      queryKey: [orderApi.getSales.endpointKey, enterpriseId, tab, filterData],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await GetSales({
          id: enterpriseId,
          data: { page: pageParam, limit: PAGE_LIMIT, ...filterData },
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

  // Infinite scroll observer
  const lastSalesRef = useCallback(
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
    const isSalesOrderRead = row?.readTracker?.sellerIsRead;

    if (isSalesOrderRead) {
      router.push(`/sales/sales-orders/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(row.id);
      router.push(`/sales/sales-orders/${row.id}`);
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

  // columns
  const SalesColumns = useSalesColumns(
    setIsEditingOrder,
    setOrderId,
    setSelectedOrders,
  );

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete || !isKycVerified) && (
        <>
          <SubHeader name="Sales" />
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && isKycVerified && (
        <>
          {!isCreatingSales && !isCreatingInvoice && !isEditingOrder && (
            <Wrapper className="h-full">
              <SubHeader
                name={'Sales'}
                className="sticky top-0 z-10 flex items-center justify-between bg-white"
              >
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
                        onClick={() => setIsCreatingSales(true)}
                        className="w-24 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                        size="sm"
                      >
                        <PlusCircle size={14} />
                        Offer
                      </Button>
                    }
                    content={'Create a new sales order'}
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
                      <TabsTrigger value="bidReceived">
                        Bid Recieved
                      </TabsTrigger>
                      <TabsTrigger value="pending">Payment Pending</TabsTrigger>
                    </TabsList>
                    <FilterModal
                      isSalesFilter={true}
                      tab={tab}
                      setFilterData={setFilterData}
                    />
                  </section>

                  <TabsContent value="all">
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
                          lastSalesRef={lastSalesRef}
                        />
                      ) : (
                        <EmptyStageComponent
                          heading={SaleEmptyStageData.heading}
                          desc={SaleEmptyStageData.desc}
                          subHeading={SaleEmptyStageData.subHeading}
                          subItems={SaleEmptyStageData.subItems}
                        />
                      ))}
                  </TabsContent>
                  <TabsContent value="bidReceived">
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
                          lastSalesRef={lastSalesRef}
                        />
                      ) : (
                        <EmptyStageComponent
                          heading={SaleEmptyStageData.heading}
                          desc={SaleEmptyStageData.desc}
                          subHeading={SaleEmptyStageData.subHeading}
                          subItems={SaleEmptyStageData.subItems}
                        />
                      ))}
                  </TabsContent>
                  <TabsContent value="pending">
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
                          lastSalesRef={lastSalesRef}
                        />
                      ) : (
                        <EmptyStageComponent
                          heading={SaleEmptyStageData.heading}
                          desc={SaleEmptyStageData.desc}
                          subHeading={SaleEmptyStageData.subHeading}
                          subItems={SaleEmptyStageData.subItems}
                        />
                      ))}
                  </TabsContent>
                </Tabs>
              </section>
            </Wrapper>
          )}

          {/* create order component */}
          {isCreatingSales && !isCreatingInvoice && !isEditingOrder && (
            <CreateOrder
              type="sales"
              name="Offer"
              cta="offer"
              isOrder="order"
              isCreatingSales={isCreatingSales}
              setIsCreatingSales={setIsCreatingSales}
              setIsCreatingInvoice={setIsCreatingInvoice}
              setSalesListing={setSalesListing}
              onCancel={() => setIsCreatingSales(false)}
            />
          )}

          {/* create invoice component */}
          {isCreatingInvoice && !isCreatingSales && !isEditingOrder && (
            <CreateOrder
              type="sales"
              name="Invoice"
              cta="offer"
              isOrder="invoice"
              isCreatingInvoice={isCreatingInvoice}
              onCancel={() => setIsCreatingInvoice(false)}
            />
          )}

          {/* editOrder Component */}
          {isEditingOrder && !isCreatingSales && !isCreatingInvoice && (
            <EditOrder
              type="sales"
              name="Edit"
              cta="offer"
              isOrder="order"
              orderId={orderId}
              isEditingOrder={isEditingOrder}
              onCancel={() => setIsEditingOrder(false)}
            />
          )}
        </>
      )}
    </>
  );
};

export default SalesOrder;
