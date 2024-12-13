'use client';

import { invoiceApi } from '@/api/invoice/invoiceApi';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import { InfiniteDataTable } from '@/components/table/infinite-data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  exportInvoice,
  getAllPurchaseInvoices,
} from '@/services/Invoice_Services/Invoice_Services';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { Tabs } from '@radix-ui/react-tabs';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import {
  DatabaseZap,
  FileCheck,
  FileText,
  KeySquare,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import emptyImg from '../../../../../public/Empty.png';
import { usePurchaseInvoicesColumns } from './usePurchaseInvoicesColumns';

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
    {
      id: 2,
      icon: <FileText size={14} />,
      subItemtitle: `Securely negotiate with digitally signed counter-offers and bids.`,
    },
    {
      id: 3,
      icon: <KeySquare size={14} />,
      subItemtitle: `Finalize deals with mutual digital signatures for binding commitment.`,
    },
    {
      id: 4,
      icon: <DatabaseZap size={14} />,
      subItemtitle: `Effortlessly create and share detailed invoices, completing sales professionally. `,
    },
  ],
};

const PurchaseInvoices = () => {
  // Assuming LocalStorageService is fetching enterpriseId correctly
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');
  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [invoiceListing, setInvoiceListing] = useState([]); // invoices
  const [invoicesTabs, setInvoicesTab] = useState({
    all: [],
    pending: [],
    debitNotes: [],
    creditNotes: [],
  });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [filterData, setFilterData] = useState({});

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    // Clear existing salesListing and paginationData when the tab changes
    setInvoiceListing([]); // Reset salesListing
    setPaginationData(null); // Reset paginationData

    // Apply filters based on the selected tab
    let newFilterData = {};
    if (tab === 'pending') {
      newFilterData = {
        filterData: {
          payment: {
            status: 'NOT_PAID',
          },
        },
      };
    } else if (tab === 'debitNotes') {
      newFilterData = {
        filterData: {
          debitNote: {
            status: 'RAISED',
          },
        },
      };
    }

    setFilterData(newFilterData);

    // Check if data for this tab already exists to prevent unnecessary API calls
    if (invoicesTabs[tab]?.length > 0) {
      setInvoiceListing(invoicesTabs[tab]); // Use cached data for this tab
    }
  }, [tab]);

  // [INVOICES_FETCHING]
  // Fetch invoices data with infinite scroll
  const {
    data: invoicesData,
    fetchNextPage: invoiceFetchNextPage,
    isFetching: isInvoicesFetching,
    isLoading: isInvoiceLoading,
  } = useInfiniteQuery({
    queryKey: [
      invoiceApi.getAllPurchaseInvoices.endpointKey,
      enterpriseId,
      filterData,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getAllPurchaseInvoices({
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
    if (invoicesData?.pages.length > 0) {
      const latestPage =
        invoicesData.pages[invoicesData.pages.length - 1].data.data;
      const newInvoicesData = latestPage.data;

      // Set the pagination data
      setPaginationData({
        currentPage: latestPage.currentPage,
        totalPages: latestPage.totalPages,
      });

      // Check if the current tab already has data to avoid duplicates
      setInvoicesTab((prevData) => {
        if (prevData[tab]?.length === 0) {
          // Only store the fresh data if it's not already there
          return {
            ...prevData,
            [tab]: newInvoicesData, // Replace with fresh data for the current tab
          };
        }

        // Append unique data by filtering out duplicates
        const updatedTabData = [
          ...prevData[tab],
          ...newInvoicesData.filter(
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
      setInvoiceListing((prevInvoices) => {
        if (prevInvoices.length === 0) {
          return newInvoicesData; // Set fresh data for the first time
        }

        // Append unique data to the invoices listing
        const updatedInvoices = [
          ...prevInvoices,
          ...newInvoicesData.filter(
            (item) => !prevInvoices.some((prevItem) => prevItem.id === item.id),
          ),
        ];

        return updatedInvoices;
      });
    }
  }, [invoicesData, filterData]);

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
      router.push(`/purchases/purchase-invoices/${row.invoiceId}`);
    } else {
      updateReadTrackerMutation.mutate(row.invoiceId);
      router.push(`/purchases/purchase-invoices/${row.invoiceId}`);
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
  // export invoice mutation
  const exportInvoiceMutation = useMutation({
    mutationKey: [invoiceApi.exportInvoice.endpointKey],
    mutationFn: exportInvoice,
    onSuccess: (response) => {
      const blobData = response.data;
      downloadBlobFile(blobData, 'sales_invoices.xlsx');
      toast.success('Invoice exported and downloaded successfully');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });
  // handle export order click
  const handleExportInvoice = () => {
    if (selectedInvoices.length === 0) {
      toast.error('Please select atleast One Invoice to export');
      return;
    }
    exportInvoiceMutation.mutate(selectedInvoices);
  };

  // Assuming useinvoiceColumns is a valid hook or function to generate the table columns
  const invoiceColumns = usePurchaseInvoicesColumns(setSelectedInvoices);

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete || !isKycVerified) && (
        <>
          <SubHeader name="Invoices" />
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && isKycVerified && (
        <>
          <Wrapper>
            <SubHeader
              name={'Invoices'}
              className="sticky top-0 z-10 flex items-center justify-between bg-white"
            >
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={handleExportInvoice}
                  variant="outline"
                  className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                  size="sm"
                >
                  <Upload size={16} />
                </Button>
              </div>
            </SubHeader>

            <section>
              <Tabs
                value={tab}
                onValueChange={onTabChange}
                defaultValue={'all'}
              >
                <section className="sticky top-14 z-10 bg-white">
                  <TabsList className="border">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="debitNotes">
                      {' '}
                      Debit/Credit Notes
                    </TabsTrigger>
                  </TabsList>
                </section>

                <TabsContent value="all">
                  {isInvoiceLoading && <Loading />}
                  {!isInvoiceLoading && invoiceListing?.length > 0 && (
                    <InfiniteDataTable
                      id={'sale-invoice'}
                      columns={invoiceColumns}
                      data={invoiceListing}
                      onRowClick={onRowClick}
                      isFetching={isInvoicesFetching}
                      fetchNextPage={invoiceFetchNextPage}
                      filterData={filterData}
                      paginationData={paginationData}
                    />
                  )}
                  {!isInvoiceLoading && invoiceListing?.length === 0 && (
                    <EmptyStageComponent
                      heading={SaleEmptyStageData.heading}
                      desc={SaleEmptyStageData.desc}
                      subHeading={SaleEmptyStageData.subHeading}
                      subItems={SaleEmptyStageData.subItems}
                    />
                  )}
                </TabsContent>
                <TabsContent value="pending">
                  {isInvoiceLoading && <Loading />}
                  {!isInvoiceLoading && invoiceListing?.length > 0 && (
                    <InfiniteDataTable
                      id={'sale-invoice'}
                      columns={invoiceColumns}
                      data={invoiceListing}
                      onRowClick={onRowClick}
                      isFetching={isInvoicesFetching}
                      fetchNextPage={invoiceFetchNextPage}
                      filterData={filterData}
                      paginationData={paginationData}
                    />
                  )}

                  {!isInvoiceLoading && invoiceListing?.length === 0 && (
                    <EmptyStageComponent
                      heading={SaleEmptyStageData.heading}
                      desc={SaleEmptyStageData.desc}
                      subHeading={SaleEmptyStageData.subHeading}
                      subItems={SaleEmptyStageData.subItems}
                    />
                  )}
                </TabsContent>
                <TabsContent value="debitNotes">
                  {isInvoiceLoading && <Loading />}
                  {!isInvoiceLoading && invoiceListing?.length > 0 && (
                    <InfiniteDataTable
                      id={'sale-invoice-debits'}
                      columns={invoiceColumns}
                      onRowClick={onRowClick}
                      data={invoiceListing}
                      isFetching={isInvoicesFetching}
                      fetchNextPage={invoiceFetchNextPage}
                      filterData={filterData}
                      paginationData={paginationData}
                    />
                  )}

                  {!isInvoiceLoading && invoiceListing?.length === 0 && (
                    <div className="flex h-[38rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                      <Image src={emptyImg} alt="emptyIcon" />
                      <p>No Debit Note Raised</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </section>
          </Wrapper>
        </>
      )}
    </>
  );
};

export default PurchaseInvoices;
