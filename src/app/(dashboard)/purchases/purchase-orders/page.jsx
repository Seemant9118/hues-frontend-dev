'use client';

import { orderApi } from '@/api/order_api/order_api';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
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
  GetPurchases,
} from '@/services/Orders_Services/Orders_Services';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { useMutation } from '@tanstack/react-query';
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

const PurchaseOrders = () => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [isOrderCreationSuccess, setIsOrderCreationSuccess] = useState(false);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [paginationData, setPaginationData] = useState([]);
  const [allPurchase, setAllPurchase] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterData, setFilterData] = useState(null);

  const [tab, setTab] = useState('all');

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

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

  const PurchaseColumns = usePurchaseColumns(
    setIsEditingOrder,
    setOrderId,
    setSelectedOrders,
  );

  const purchaseMutation = useMutation({
    mutationKey: [orderApi.getPurchases.endpointKey, enterpriseId],
    mutationFn: ({ id, data }) => GetPurchases(id, data), // destructuring the payload to pass correct arguments
    onSuccess: (data) => {
      const _newPurchaseData = data.data.data.data;
      setPaginationData(data.data.data);

      if (filterData) {
        setAllPurchase(_newPurchaseData);
      } else {
        setAllPurchase([...allPurchase, ..._newPurchaseData]);
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
      } else if (tab === 'offerRecieved') {
        setFilterData({
          offerReceived: true,
        });
      } else {
        setAllPurchase([]);
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
      purchaseMutation.mutate({
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

  return (
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
            <Tabs value={tab} onValueChange={onTabChange} defaultValue={'all'}>
              <section className="sticky top-14 z-10 flex justify-between bg-white">
                <TabsList className="border">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="offerRecieved">
                    Offer Recieved
                  </TabsTrigger>
                  <TabsTrigger value="pending">Payment Pending</TabsTrigger>
                </TabsList>
                <FilterModal setFilterData={setFilterData} />
              </section>

              <TabsContent value="all">
                {purchaseMutation.isPending && <Loading />}

                {!purchaseMutation.isPending &&
                  (allPurchase && allPurchase?.length > 0 ? (
                    <DataTable
                      id={'purchase-orders'}
                      columns={PurchaseColumns}
                      data={allPurchase}
                      onRowClick={onRowClick}
                      filterData={filterData}
                      setFilterData={setFilterData}
                      setCurrentPage={setCurrentPage}
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
              <TabsContent value="offerRecieved">
                {purchaseMutation.isPending && <Loading />}

                {!purchaseMutation.isPending &&
                  (allPurchase && allPurchase?.length > 0 ? (
                    <DataTable
                      id={'purchase-orders'}
                      columns={PurchaseColumns}
                      data={allPurchase}
                      onRowClick={onRowClick}
                      filterData={filterData}
                      setFilterData={setFilterData}
                      setCurrentPage={setCurrentPage}
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
                {purchaseMutation.isPending && <Loading />}

                {!purchaseMutation.isPending &&
                  (allPurchase && allPurchase?.length > 0 ? (
                    <DataTable
                      id={'purchase-orders'}
                      columns={PurchaseColumns}
                      data={allPurchase}
                      onRowClick={onRowClick}
                      filterData={filterData}
                      setFilterData={setFilterData}
                      setCurrentPage={setCurrentPage}
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
  );
};

export default PurchaseOrders;
