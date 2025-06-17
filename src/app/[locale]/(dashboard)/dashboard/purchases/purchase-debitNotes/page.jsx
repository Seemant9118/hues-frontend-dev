'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import Tooltips from '@/components/auth/Tooltips';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService } from '@/lib/utils';
import { getAllPurchaseDebitNotes } from '@/services/Debit_Note_Services/DebitNoteServices';
import { exportInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { Tabs } from '@radix-ui/react-tabs';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
} from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import emptyImg from '../../../../../../../public/Empty.png';
import { PurchaseTable } from '../purchasetable/PurchaseTable';
import { useDebitNotesColumns } from './useDebitNotesColumns';

// macros
const PAGE_LIMIT = 10;

const PurchaseDebitNotes = () => {
  useMetaData('Hues! - Purchase Debit Notes', 'HUES DEBITNOTES'); // dynamic title

  const translations = useTranslations('purchases.purchase-debit_notes');

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [debitNotesListing, setDebitNotesListing] = useState([]); // debitNotes
  const [selectedDebit, setSelectedDebit] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [filterData, setFilterData] = useState({});

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    // Apply filters based on the selected tab
    let newFilterData = {};
    if (tab === 'accepted') {
      newFilterData = { status: 'ACCEPTED' };
    } else if (tab === 'rejected') {
      newFilterData = { status: 'REJECTED' };
    }

    setFilterData(newFilterData);
  }, [tab]);

  // [DEBIT_NOTES_FETCHING]
  // Fetch debitNotes data with infinite scroll
  const {
    data: debitNotesData,
    fetchNextPage,
    isFetching,
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
        data: { page: pageParam, limit: PAGE_LIMIT, ...filterData },
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
    if (!debitNotesData) return;

    // Flatten purchase debitnotes data from all pages
    const flattenedPurchaseDebitNotesData = debitNotesData.pages
      .map((page) => page?.data?.data?.data) // Assuming sales invoices data is nested in `data.data.data`
      .flat();

    // Deduplicate purchase data based on unique `id`
    const uniquePurchaseDebitNotesData = Array.from(
      new Map(
        flattenedPurchaseDebitNotesData.map((sale) => [
          sale.id, // Assuming `id` is the unique identifier for each purchase debit note
          sale,
        ]),
      ).values(),
    );

    // Update state with deduplicated purchase debitNotes data
    setDebitNotesListing(uniquePurchaseDebitNotesData);

    // Calculate pagination data using the last page's information
    const lastPage =
      debitNotesData.pages[debitNotesData.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [debitNotesData]);

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
      router.push(`/dashboard/purchases/purchase-debitNotes/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(row.id);
      router.push(`/dashboard/purchases/purchase-debitNotes/${row.id}`);
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
      toast.success(translations('ctas.export.successMsg'));
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('ctas.export.errorMsg'),
      );
    },
  });
  // handle export order click
  const handleExportDebitNotes = () => {
    exportInvoiceMutation.mutate(selectedDebit);
  };

  const debitNotesColumns = useDebitNotesColumns(setSelectedDebit);

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <>
          <Wrapper className="h-screen overflow-hidden">
            <SubHeader
              name={translations('title')}
              className="sticky top-0 z-10 flex items-center justify-between bg-white"
            >
              <div className="flex items-center justify-center gap-3">
                <Tooltips
                  trigger={
                    <Button
                      disabled={
                        selectedDebit?.length === 0 ||
                        exportInvoiceMutation.isPending
                      }
                      onClick={handleExportDebitNotes}
                      variant="outline"
                      className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                      size="sm"
                    >
                      <Upload size={14} />
                    </Button>
                  }
                  content={translations('ctas.export.placeholder')}
                />
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
                  <TabsTrigger value="accepted">
                    {translations('tabs.label.tab2')}
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    {translations('tabs.label.tab3')}
                  </TabsTrigger>
                </TabsList>
              </section>

              <TabsContent value="all" className="flex-grow overflow-hidden">
                {isDebitNotesLoading && <Loading />}
                {!isDebitNotesLoading && debitNotesListing?.length > 0 && (
                  <PurchaseTable
                    id="purchase-debit-notes"
                    columns={debitNotesColumns}
                    data={debitNotesListing}
                    fetchNextPage={fetchNextPage}
                    isFetching={isFetching}
                    totalPages={paginationData?.totalPages}
                    currFetchedPage={paginationData?.currFetchedPage}
                    onRowClick={onRowClick}
                  />
                )}

                {!isDebitNotesLoading && debitNotesListing?.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                    <Image src={emptyImg} alt="emptyIcon" />
                    <p>{translations('emptyStateComponent.heading')}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="accepted"
                className="flex-grow overflow-hidden"
              >
                {isDebitNotesLoading && <Loading />}
                {!isDebitNotesLoading && debitNotesListing?.length > 0 && (
                  <PurchaseTable
                    id="purchase-debit-note-accepted"
                    columns={debitNotesColumns}
                    data={debitNotesListing}
                    fetchNextPage={fetchNextPage}
                    isFetching={isFetching}
                    totalPages={paginationData?.totalPages}
                    currFetchedPage={paginationData?.currFetchedPage}
                    onRowClick={onRowClick}
                  />
                )}

                {!isDebitNotesLoading && debitNotesListing?.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                    <Image src={emptyImg} alt="emptyIcon" />
                    <p>{translations('emptyStateComponent.heading')}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="rejected"
                className="flex-grow overflow-hidden"
              >
                {isDebitNotesLoading && <Loading />}
                {!isDebitNotesLoading && debitNotesListing?.length > 0 && (
                  <PurchaseTable
                    id="purchase-debit-note-rejected"
                    columns={debitNotesColumns}
                    data={debitNotesListing}
                    fetchNextPage={fetchNextPage}
                    isFetching={isFetching}
                    totalPages={paginationData?.totalPages}
                    currFetchedPage={paginationData?.currFetchedPage}
                    onRowClick={onRowClick}
                  />
                )}

                {!isDebitNotesLoading && debitNotesListing?.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                    <Image src={emptyImg} alt="emptyIcon" />
                    <p>{translations('emptyStateComponent.heading')}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Wrapper>
        </>
      )}
    </>
  );
};

export default PurchaseDebitNotes;
