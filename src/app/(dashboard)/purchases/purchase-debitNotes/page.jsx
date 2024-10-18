'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import { InfiniteDataTable } from '@/components/table/infinite-data-table';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getAllPurchaseDebitNotes } from '@/services/Debit_Note_Services/DebitNoteServices';
import { exportInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { Tabs } from '@radix-ui/react-tabs';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import emptyImg from '../../../../../public/Empty.png';
import { useDebitNotesColumns } from './useDebitNotesColumns';

// macros
const PAGE_LIMIT = 10;

const PurchaseDebitNotes = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [debitNotesTabs, setDebitNotesTab] = useState({
    all: [],
    accepted: [],
    rejected: [],
  });
  const [debitNotesListing, setDebitNotesListing] = useState([]); // debitNotes
  const [selectedDebit, setSelectedDebit] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [filterData, setFilterData] = useState({});

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    // Clear existing salesListing and paginationData when the tab changes
    setDebitNotesListing([]); // Reset debitNotesListing
    setPaginationData(null); // Reset paginationData

    // Apply filters based on the selected tab
    let newFilterData = {};
    if (tab === 'accepted') {
      newFilterData = { status: 'ACCEPTED' };
    } else if (tab === 'rejected') {
      newFilterData = { status: 'REJECTED' };
    }

    setFilterData(newFilterData);

    // Check if data for this tab already exists to prevent unnecessary API calls
    if (debitNotesTabs[tab]?.length > 0) {
      setDebitNotesListing(debitNotesTabs[tab]); // Use cached data for this tab
    }
  }, [tab]);

  // [DEBIT_NOTES_FETCHING]
  // Fetch debitNotes data with infinite scroll
  const {
    data: debitNotesData,
    fetchNextPage: debitNotesFetchNextPage,
    isFetching: isDebitNotesFetching,
    isLoading: isDebitNotesLoading,
  } = useInfiniteQuery({
    queryKey: [
      DebitNoteApi.getAllPurchaseDebitNotes.endpointKey,
      enterpriseId,
      filterData,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getAllPurchaseDebitNotes({
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
    if (debitNotesData?.pages.length > 0) {
      const latestPage =
        debitNotesData.pages[debitNotesData.pages.length - 1].data.data;
      const newDebitNotesData = latestPage.data;

      // Set the pagination data
      setPaginationData({
        currentPage: latestPage.currentPage,
        totalPages: latestPage.totalPages,
      });

      // Check if the current tab already has data to avoid duplicates
      setDebitNotesTab((prevData) => {
        if (prevData[tab]?.length === 0) {
          // Only store the fresh data if it's not already there
          return {
            ...prevData,
            [tab]: newDebitNotesData, // Replace with fresh data for the current tab
          };
        }

        // Append unique data by filtering out duplicates
        const updatedTabData = [
          ...prevData[tab],
          ...newDebitNotesData.filter(
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
      setDebitNotesListing((prevdebits) => {
        if (prevdebits.length === 0) {
          return newDebitNotesData; // Set fresh data for the first time
        }

        // Append unique data to the invoices listing
        const updatedDebitNotes = [
          ...prevdebits,
          ...newDebitNotesData.filter(
            (item) => !prevdebits.some((prevItem) => prevItem.id === item.id),
          ),
        ];

        return updatedDebitNotes;
      });
    }
  }, [debitNotesData, filterData]);

  // [updateReadTracker Mutation : onRowClick] ✅
  const updateReadTrackerMutation = useMutation({
    mutationKey: [readTrackerApi.updateTrackerState.endpointKey],
    mutationFn: updateReadTracker,
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });
  const onRowClick = (row) => {
    const isPurchaseDebitRead = row?.readTracker?.buyerIsRead;

    if (isPurchaseDebitRead) {
      router.push(`/purchases/purchase-debitNotes/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(row.id);
      router.push(`/purchases/purchase-debitNotes/${row.id}`);
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
  const handleExportDebitNotes = () => {
    if (selectedDebit.length === 0) {
      toast.error('Please select atleast One Debit Note to export');
      return;
    }
    exportInvoiceMutation.mutate(selectedDebit);
  };

  const debitNotesColumns = useDebitNotesColumns(setSelectedDebit);

  return (
    <>
      <Wrapper>
        <SubHeader
          name={'Debit Notes'}
          className="sticky top-0 z-10 flex items-center justify-between bg-white"
        >
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={handleExportDebitNotes}
              variant="outline"
              className="border border-[#A5ABBD] hover:bg-neutral-600/10"
              size="sm"
            >
              <Upload size={14} />
            </Button>
          </div>
        </SubHeader>

        <section>
          <Tabs value={tab} onValueChange={onTabChange} defaultValue={'all'}>
            <section className="sticky top-14 z-10 bg-white">
              <TabsList className="border">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </section>

            <TabsContent value="all">
              {isDebitNotesLoading && <Loading />}
              {!isDebitNotesLoading && debitNotesListing?.length > 0 && (
                <InfiniteDataTable
                  id={'sale-invoice-debits'}
                  columns={debitNotesColumns}
                  onRowClick={onRowClick}
                  data={debitNotesListing}
                  isFetching={isDebitNotesFetching}
                  fetchNextPage={debitNotesFetchNextPage}
                  filterData={filterData}
                  paginationData={paginationData}
                />
              )}

              {!isDebitNotesLoading && debitNotesListing?.length === 0 && (
                <div className="flex h-[26rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                  <Image src={emptyImg} alt="emptyIcon" />
                  <p>No Debit Note Raised</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted">
              {isDebitNotesLoading && <Loading />}
              {!isDebitNotesLoading && debitNotesListing?.length > 0 && (
                <InfiniteDataTable
                  id={'sale-invoice-debits'}
                  columns={debitNotesColumns}
                  onRowClick={onRowClick}
                  data={debitNotesListing}
                  isFetching={isDebitNotesFetching}
                  fetchNextPage={debitNotesFetchNextPage}
                  filterData={filterData}
                  paginationData={paginationData}
                />
              )}

              {!isDebitNotesLoading && debitNotesListing?.length === 0 && (
                <div className="flex h-[26rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                  <Image src={emptyImg} alt="emptyIcon" />
                  <p>No Debit Note Raised</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {isDebitNotesLoading && <Loading />}
              {!isDebitNotesLoading && debitNotesListing?.length > 0 && (
                <InfiniteDataTable
                  id={'sale-invoice-debits'}
                  columns={debitNotesColumns}
                  onRowClick={onRowClick}
                  data={debitNotesListing}
                  isFetching={isDebitNotesFetching}
                  fetchNextPage={debitNotesFetchNextPage}
                  filterData={filterData}
                  paginationData={paginationData}
                />
              )}

              {!isDebitNotesLoading && debitNotesListing?.length === 0 && (
                <div className="flex h-[26rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                  <Image src={emptyImg} alt="emptyIcon" />
                  <p>No Debit Note Raised</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </Wrapper>
    </>
  );
};

export default PurchaseDebitNotes;
