'use client';

import { invoiceApi } from '@/api/invoice/invoiceApi';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import Tooltips from '@/components/auth/Tooltips';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { LocalStorageService } from '@/lib/utils';
import {
  exportInvoice,
  getAllSalesInvoices,
} from '@/services/Invoice_Services/Invoice_Services';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { Tabs } from '@radix-ui/react-tabs';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
} from '@tanstack/react-query';
import { PlusCircle, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { useRouter } from '@/i18n/routing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import emptyImg from '../../../../../../public/Empty.png';
import { SalesTable } from '../salestable/SalesTable';
import { useSalesInvoicesColumns } from './useSalesInvoicesColumns';

// dynamic imports
const CreateOrder = dynamic(() => import('@/components/orders/CreateOrder'), {
  loading: () => <Loading />,
});

// macros
const PAGE_LIMIT = 10;

const SalesInvoices = () => {
  useMetaData('Hues! - Sales Invoices', 'HUES INVOICES'); // dynamic title

  const translations = useTranslations('sales.sales-invoices');
  const keys = [
    'sales.sales-invoices.emtpyStateComponent.subItems.subItem1',
    'sales.sales-invoices.emtpyStateComponent.subItems.subItem2',
    'sales.sales-invoices.emtpyStateComponent.subItems.subItem3',
    'sales.sales-invoices.emtpyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const router = useRouter();
  const observer = useRef(); // Ref for infinite scrolling observer
  const [tab, setTab] = useState('all');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [invoiceListing, setInvoiceListing] = useState([]); // invoices
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [filterData, setFilterData] = useState({});

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    // Apply filters based on the selected tab
    let newFilterData = {};
    if (tab === 'outstanding') {
      newFilterData = {
        filterData: {
          payment: {
            status: ['NOT_PAID', 'PARTIAL_PAID'],
          },
        },
      };
    } else if (tab === 'disputed') {
      newFilterData = {
        filterData: {
          debitNote: {
            status: 'RAISED',
          },
        },
      };
    }

    setFilterData(newFilterData);
  }, [tab]);

  // [INVOICES_FETCHING]
  // Fetch invoices data with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading: isInvoiceLoading,
  } = useInfiniteQuery({
    queryKey: [
      invoiceApi.getAllSalesInvoices.endpointKey,
      enterpriseId,
      tab,
      filterData,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getAllSalesInvoices({
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
    if (!data) return;

    // Flatten sales invoices data from all pages
    const flattenedSalesInvoicesData = data.pages
      .map((page) => page?.data?.data?.data) // Assuming sales invoices data is nested in `data.data.data`
      .flat();

    // Deduplicate sales data based on unique `id`
    const uniqueSalesInvoicesData = Array.from(
      new Map(
        flattenedSalesInvoicesData.map((sale) => [
          sale.invoiceId, // Assuming `id` is the unique identifier for each sale invoice
          sale,
        ]),
      ).values(),
    );

    // Update state with deduplicated sales invoices data
    setInvoiceListing(uniqueSalesInvoicesData);

    // Calculate pagination data using the last page's information
    const lastPage = data.pages[data.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [data]);

  // Infinite scroll observer
  const lastSalesInvoiceRef = useCallback(
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
    const isSaleInvoiceRead = row?.readTracker?.sellerIsRead;

    if (isSaleInvoiceRead) {
      router.push(`/sales/sales-invoices/${row.invoiceId}`);
    } else {
      updateReadTrackerMutation.mutate(row.invoiceId);
      router.push(`/sales/sales-invoices/${row.invoiceId}`);
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
  const handleExportInvoice = () => {
    exportInvoiceMutation.mutate(selectedInvoices);
  };

  // Assuming useinvoiceColumns is a valid hook or function to generate the table columns
  const invoiceColumns = useSalesInvoicesColumns(setSelectedInvoices);

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
          {!isCreatingInvoice && (
            <Wrapper className="h-full">
              <SubHeader
                name={translations('title')}
                className="sticky top-0 z-10 flex items-center justify-between bg-white"
              >
                <div className="flex items-center justify-center gap-3">
                  <Tooltips
                    trigger={
                      <Button
                        disabled={selectedInvoices?.length === 0}
                        onClick={handleExportInvoice}
                        variant="outline"
                        className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                        size="sm"
                      >
                        <Upload size={14} />
                      </Button>
                    }
                    content={translations('ctas.export.placeholder')}
                  />

                  <Tooltips
                    trigger={
                      <Button
                        onClick={() => setIsCreatingInvoice(true)}
                        className="w-24 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                        size="sm"
                      >
                        <PlusCircle size={14} />
                        {translations('ctas.invoice.cta')}
                      </Button>
                    }
                    content={translations('ctas.invoice.placeholder')}
                  />
                </div>
              </SubHeader>

              <section>
                <Tabs
                  value={tab}
                  onValueChange={onTabChange}
                  defaultValue={'all'}
                >
                  <section className="sticky top-14 bg-white">
                    <TabsList className="border">
                      <TabsTrigger value="all">
                        {translations('tabs.label.tab1')}
                      </TabsTrigger>
                      <TabsTrigger value="outstanding">
                        {' '}
                        {translations('tabs.label.tab2')}
                      </TabsTrigger>
                      <TabsTrigger value="disputed">
                        {' '}
                        {translations('tabs.label.tab3')}
                      </TabsTrigger>
                    </TabsList>
                  </section>

                  <TabsContent value="all">
                    {isInvoiceLoading && <Loading />}
                    {!isInvoiceLoading && invoiceListing?.length > 0 && (
                      <SalesTable
                        id="sale-invoices"
                        columns={invoiceColumns}
                        data={invoiceListing}
                        fetchNextPage={fetchNextPage}
                        isFetching={isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        onRowClick={onRowClick}
                        lastSalesRef={lastSalesInvoiceRef}
                      />
                    )}
                    {!isInvoiceLoading && invoiceListing?.length === 0 && (
                      <EmptyStageComponent
                        heading={translations('emtpyStateComponent.heading')}
                        subItems={keys}
                      />
                    )}
                  </TabsContent>
                  <TabsContent value="outstanding">
                    {isInvoiceLoading && <Loading />}
                    {!isInvoiceLoading && invoiceListing?.length > 0 && (
                      <SalesTable
                        id="sale-invoices"
                        columns={invoiceColumns}
                        data={invoiceListing}
                        fetchNextPage={fetchNextPage}
                        isFetching={isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        onRowClick={onRowClick}
                        lastSalesRef={lastSalesInvoiceRef}
                      />
                    )}
                    {!isInvoiceLoading && invoiceListing?.length === 0 && (
                      <EmptyStageComponent
                        heading={translations('emtpyStateComponent.heading')}
                        subItems={keys}
                      />
                    )}
                  </TabsContent>
                  <TabsContent value="disputed">
                    {isInvoiceLoading && <Loading />}
                    {!isInvoiceLoading && invoiceListing?.length > 0 && (
                      <SalesTable
                        id="sale-invoices-disputed"
                        columns={invoiceColumns}
                        data={invoiceListing}
                        fetchNextPage={fetchNextPage}
                        isFetching={isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        onRowClick={onRowClick}
                        lastSalesRef={lastSalesInvoiceRef}
                      />
                    )}

                    {!isInvoiceLoading && invoiceListing?.length === 0 && (
                      <div className="flex h-[38rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                        <Image src={emptyImg} alt="emptyIcon" />
                        <p>{translations('emtpyStateComponent2.heading')}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </section>
            </Wrapper>
          )}

          {/* create invoice component */}
          {isCreatingInvoice && (
            <CreateOrder
              type="invoice"
              name="Invoice"
              cta="offer"
              isOrder="invoice"
              isCreatingInvoice={isCreatingInvoice}
              setInvoiceListing={setInvoiceListing}
              onCancel={() => setIsCreatingInvoice(false)}
            />
          )}
        </>
      )}
    </>
  );
};

export default SalesInvoices;
