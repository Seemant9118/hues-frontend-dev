'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import Tooltips from '@/components/auth/Tooltips';
import FilterInvoices from '@/components/invoices/FilterInvoices';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService } from '@/lib/utils';
import { getVendors } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import {
  exportAllInvoice,
  exportSelectedInvoice,
  getAllPurchaseInvoices,
} from '@/services/Invoice_Services/Invoice_Services';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { Tabs } from '@radix-ui/react-tabs';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import emptyImg from '../../../../../../../public/Empty.png';
import { PurchaseTable } from '../purchasetable/PurchaseTable';
import { usePurchaseInvoicesColumns } from './usePurchaseInvoicesColumns';

// macros
const PAGE_LIMIT = 10;

const PurchaseInvoices = () => {
  useMetaData('Hues! - Purchase Invoices', 'HUES INVOICES'); // dynamic title

  const translations = useTranslations('purchases.purchase-invoices');

  const keys = [
    'purchases.purchase-invoices.emptyStateComponent.subItems.subItem1',
    'purchases.purchase-invoices.emptyStateComponent.subItems.subItem2',
    'purchases.purchase-invoices.emptyStateComponent.subItems.subItem3',
    'purchases.purchase-invoices.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const { hasPermission } = usePermission();
  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [purchaseinvoiceListing, setPurchaseInvoiceListing] = useState([]); // invoices
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [filterData, setFilterData] = useState({ clientIds: [] });

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    // Apply filters based on the selected tab
    let newFilterData = {};
    if (tab === 'outstanding') {
      newFilterData = {
        paymentStatus: ['NOT_PAID', 'PARTIAL_PAID'],
        clientIds: filterData?.clientIds,
      };
    } else if (tab === 'disputed') {
      newFilterData = {
        debitNoteStatus: true,
        clientIds: filterData?.clientIds,
      };
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

  // [INVOICES_FETCHING]
  // Fetch invoices data with infinite scroll
  const {
    data: invoicesData,
    fetchNextPage,
    isFetching,
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
    enabled: hasPermission('permission:purchase-view'),
    placeholderData: keepPreviousData,
  });

  // data flattening - formatting
  useEffect(() => {
    if (!invoicesData) return;

    // Flatten purchase invoices data from all pages
    const flattenedPurchaseInvoicesData = invoicesData.pages
      .map((page) => page?.data?.data?.data) // Assuming sales invoices data is nested in `data.data.data`
      .flat();

    // Deduplicate purchase data based on unique `id`
    const uniquePurchaseInvoicesData = Array.from(
      new Map(
        flattenedPurchaseInvoicesData.map((purchase) => [
          purchase.invoiceId, // Assuming `id` is the unique identifier for each purchase invoice
          purchase,
        ]),
      ).values(),
    );

    // Update state with deduplicated purchases invoices data
    setPurchaseInvoiceListing(uniquePurchaseInvoicesData);

    // Calculate pagination data using the last page's information
    const lastPage =
      invoicesData.pages[invoicesData.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [invoicesData]);

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
      router.push(`/dashboard/purchases/purchase-invoices/${row.invoiceId}`);
    } else {
      updateReadTrackerMutation.mutate(row.invoiceId);
      router.push(`/dashboard/purchases/purchase-invoices/${row.invoiceId}`);
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
  // export all invoices mutation
  const exportAllInvoicesMutations = useMutation({
    mutationKey: [invoiceApi.exportAllInvoices.endpointKey],
    mutationFn: exportAllInvoice,
    onSuccess: (response) => {
      const blobData = response.data;
      downloadBlobFile(
        blobData,
        `Purchase_Register_${moment(new Date()).format('YYYYMMDD_HH:mm')}.xlsx`,
      );
      toast.success(translations('ctas.export.successMsg'));
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('ctas.export.errorMsg'),
      );
    },
  });
  // export invoice mutation
  const selectedInvoiceExportMutation = useMutation({
    mutationKey: [invoiceApi.exportSelectedInvoice.endpointKey],
    mutationFn: exportSelectedInvoice,
    onSuccess: (response) => {
      const blobData = response.data;
      downloadBlobFile(
        blobData,
        `Purchase_Register_${moment(new Date()).format('YYYYMMDD_HH:mm')}.xlsx`,
      );
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
    if (selectedInvoices.length === 0) {
      exportAllInvoicesMutations.mutate({
        type: 'PURCHASE',
        body: { orderType: 'PURCHASE' },
      });
    } else {
      selectedInvoiceExportMutation.mutate({ invoiceData: selectedInvoices });
    }
  };

  // Assuming useinvoiceColumns is a valid hook or function to generate the table columns
  const invoiceColumns = usePurchaseInvoicesColumns(setSelectedInvoices);

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
          <Wrapper className="h-screen overflow-hidden">
            {/* headers */}
            <SubHeader
              name={translations('title')}
              className="sticky top-0 z-10 flex items-center justify-between bg-white"
            >
              <div className="flex items-center justify-center gap-3">
                <Tooltips
                  trigger={
                    <Button
                      disabled={
                        selectedInvoiceExportMutation.isPending ||
                        exportAllInvoicesMutations.isPending
                      }
                      onClick={handleExportInvoice}
                      variant="outline"
                      className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                      size="sm"
                    >
                      <Image
                        src="/xlsx_png.png"
                        alt="xlsx-icon"
                        width={16}
                        height={16}
                      />
                      {translations('ctas.export.cta')}
                    </Button>
                  }
                  content={translations(
                    selectedInvoices.length > 0
                      ? 'ctas.export.placeholder2'
                      : 'ctas.export.placeholder',
                  )}
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
                  <TabsTrigger value="outstanding">
                    {translations('tabs.label.tab2')}
                  </TabsTrigger>
                  <TabsTrigger value="disputed">
                    {translations('tabs.label.tab3')}
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
                  <FilterInvoices
                    isSalesFilter={false}
                    tab={tab}
                    setFilterData={setFilterData}
                    setPaginationData={setPaginationData}
                  />
                </div>
              </section>

              <TabsContent value="all" className="flex-grow overflow-hidden">
                {isInvoiceLoading && <Loading />}
                {!isInvoiceLoading && purchaseinvoiceListing?.length > 0 && (
                  <PurchaseTable
                    id="purchase-orders"
                    columns={invoiceColumns}
                    data={purchaseinvoiceListing}
                    fetchNextPage={fetchNextPage}
                    isFetching={isFetching}
                    totalPages={paginationData?.totalPages}
                    currFetchedPage={paginationData?.currFetchedPage}
                    onRowClick={onRowClick}
                  />
                )}
                {!isInvoiceLoading && purchaseinvoiceListing?.length === 0 && (
                  <EmptyStageComponent
                    heading={translations('emptyStateComponent.heading')}
                    subItems={keys}
                  />
                )}
              </TabsContent>
              <TabsContent
                value="outstanding"
                className="flex-grow overflow-hidden"
              >
                {isInvoiceLoading && <Loading />}
                {!isInvoiceLoading && purchaseinvoiceListing?.length > 0 && (
                  <PurchaseTable
                    id="purchase-outstanding-orders"
                    columns={invoiceColumns}
                    data={purchaseinvoiceListing}
                    fetchNextPage={fetchNextPage}
                    isFetching={isFetching}
                    totalPages={paginationData?.totalPages}
                    currFetchedPage={paginationData?.currFetchedPage}
                    onRowClick={onRowClick}
                  />
                )}

                {!isInvoiceLoading && purchaseinvoiceListing?.length === 0 && (
                  <EmptyStageComponent
                    heading={translations('emptyStateComponent.heading')}
                    subItems={keys}
                  />
                )}
              </TabsContent>
              <TabsContent
                value="disputed"
                className="flex-grow overflow-hidden"
              >
                {isInvoiceLoading && <Loading />}
                {!isInvoiceLoading && purchaseinvoiceListing?.length > 0 && (
                  <PurchaseTable
                    id="purchase-invoices-disputed"
                    columns={invoiceColumns}
                    data={purchaseinvoiceListing}
                    fetchNextPage={fetchNextPage}
                    isFetching={isFetching}
                    totalPages={paginationData?.totalPages}
                    currFetchedPage={paginationData?.currFetchedPage}
                    onRowClick={onRowClick}
                  />
                )}

                {!isInvoiceLoading && purchaseinvoiceListing?.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                    <Image src={emptyImg} alt="emptyIcon" />
                    <p>{translations('emptyStateComponent2.heading')}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Wrapper>
        </>
      )}
    </ProtectedWrapper>
  );
};

export default PurchaseInvoices;
