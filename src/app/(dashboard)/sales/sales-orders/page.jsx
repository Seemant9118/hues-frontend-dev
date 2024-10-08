'use client';

import { orderApi } from '@/api/order_api/order_api';
import FilterModal from '@/components/orders/FilterModal';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  exportOrder,
  GetSales,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation } from '@tanstack/react-query';
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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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

const SalesOrder = () => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [tab, setTab] = useState('all');
  const [isOrderCreationSuccess, setIsOrderCreationSuccess] = useState(false);
  const [isCreatingSales, setIsCreatingSales] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [paginationData, setPaginationData] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterData, setFilterData] = useState(null);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

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

  const SalesColumns = useSalesColumns(
    setIsEditingOrder,
    setOrderId,
    setSelectedOrders,
  );

  const onRowClick = (row) => {
    router.push(`/sales/sales-orders/${row.id}`);
  };

  const getSalesMutation = useMutation({
    mutationKey: [orderApi.getSales.endpointKey],
    mutationFn: ({ id, data }) => GetSales(id, data), // destructuring the payload to pass correct arguments
    onSuccess: (data) => {
      const _newSalesData = data.data.data.data;
      setPaginationData(data.data.data);

      if (filterData) {
        setAllSales(_newSalesData);
      } else {
        setAllSales([...allSales, ..._newSalesData]);
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  useEffect(() => {
    if (enterpriseId) {
      if (tab === 'pending') {
        setFilterData({
          paymentStatus: 'NOT_PAID',
        });
      } else if (tab === 'bidRecieved') {
        setFilterData({
          bidReceived: true,
        });
      } else {
        setAllSales([]);
        setCurrentPage(1);
        setFilterData(null);
      }
    }
  }, [tab, enterpriseId]);

  useEffect(() => {
    if (enterpriseId) {
      let _reqFilters = {
        page: 1,
        limit: PAGE_LIMIT,
      };
      if (filterData) {
        _reqFilters = {
          ..._reqFilters,
          ...filterData,
        };
      } else {
        _reqFilters.page = currentPage;
      }
      getSalesMutation.mutate({
        id: enterpriseId,
        data: _reqFilters,
      });
    }
  }, [filterData, enterpriseId, isOrderCreationSuccess, currentPage]);

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
    if (selectedOrders.length === 0) {
      toast.error('Please select atleast One Order to export');
      return;
    }
    exportOrderMutation.mutate(selectedOrders);
  };

  return (
    <>
      {!isCreatingSales && !isCreatingInvoice && !isEditingOrder && (
        <Wrapper>
          <SubHeader
            name={'Sales'}
            className="sticky top-0 z-10 flex items-center justify-between bg-white"
          >
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
                onClick={() => setIsCreatingSales(true)}
                className="w-24 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                size="sm"
              >
                <PlusCircle size={14} />
                Offer
              </Button>
            </div>
          </SubHeader>
          <section>
            <Tabs value={tab} onValueChange={onTabChange} defaultValue={'all'}>
              <section className="sticky top-14 z-10 flex justify-between bg-white">
                <TabsList className="border">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="bidRecieved">Bid Recieved</TabsTrigger>
                  <TabsTrigger value="pending">Payment Pending</TabsTrigger>
                  {/* <TabsTrigger value="unconfirmed">Unconfirmed</TabsTrigger> */}
                </TabsList>
                <FilterModal tab={tab} setFilterData={setFilterData} />
              </section>

              <TabsContent value="all">
                {getSalesMutation.isPending && <Loading />}
                {!getSalesMutation.isPending &&
                  (allSales && allSales?.length > 0 ? (
                    <DataTable
                      id={'sale-orders'}
                      columns={SalesColumns}
                      onRowClick={onRowClick}
                      data={allSales}
                      filterData={filterData}
                      setFilterData={setFilterData}
                      setCurrentPage={setCurrentPage}
                      paginationData={paginationData}
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
              <TabsContent value="bidRecieved">
                {getSalesMutation.isPending && <Loading />}
                {!getSalesMutation.isPending &&
                  (allSales && allSales?.length > 0 ? (
                    <DataTable
                      id={'sale-orders'}
                      columns={SalesColumns}
                      onRowClick={onRowClick}
                      data={allSales}
                      filterData={filterData}
                      setFilterData={setFilterData}
                      paginationData={paginationData}
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
                {getSalesMutation.isPending && <Loading />}
                {!getSalesMutation.isPending &&
                  (allSales && allSales?.length > 0 ? (
                    <DataTable
                      id={'sale-orders'}
                      columns={SalesColumns}
                      onRowClick={onRowClick}
                      data={allSales}
                      filterData={filterData}
                      setFilterData={setFilterData}
                      paginationData={paginationData}
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

              {/* <TabsContent value="unconfirmed">
                Unconfirmed Data ...{' '}
              </TabsContent> */}
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
          setIsCreatingSales={setIsCreatingSales}
          setIsCreatingInvoice={setIsCreatingInvoice}
          onCancel={() => setIsCreatingSales(false)}
          setIsOrderCreationSuccess={setIsOrderCreationSuccess}
        />
      )}

      {/* create invoice component */}
      {isCreatingInvoice && !isCreatingSales && !isEditingOrder && (
        <CreateOrder
          type="sales"
          name="Invoice"
          cta="offer"
          isOrder="invoice"
          onCancel={() => setIsCreatingInvoice(false)}
          setIsOrderCreationSuccess={setIsOrderCreationSuccess}
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
          onCancel={() => setIsEditingOrder(false)}
          setIsOrderCreationSuccess={setIsOrderCreationSuccess}
        />
      )}
    </>
  );
};

export default SalesOrder;
