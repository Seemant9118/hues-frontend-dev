'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import { settingsAPI } from '@/api/settings/settingsApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import FilterInvoices from '@/components/invoices/FilterInvoices';
import InvoiceTypeModal from '@/components/invoices/InvoiceTypeModal';
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
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  exportAllInvoice,
  exportSelectedInvoice,
  getAllSalesInvoices,
} from '@/services/Invoice_Services/Invoice_Services';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { getSettingsByKey } from '@/services/Settings_Services/SettingsService';
import { Tabs } from '@radix-ui/react-tabs';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import emptyImg from '../../../../../../../public/Empty.png';
import { SalesTable } from '../salestable/SalesTable';
import { useSalesInvoicesColumns } from './useSalesInvoicesColumns';

const CreateB2CInvoice = dynamic(
  () => import('@/components/invoices/CreateB2CInvoice'),
  {
    loading: () => <Loading />,
  },
);

const CreateB2BInvoice = dynamic(
  () => import('@/components/invoices/CreateB2BInvoice'),
  {
    loading: () => <Loading />,
  },
);

// macros
const PAGE_LIMIT = 10;

// Dummy data for invoice types

const SalesInvoices = () => {
  useMetaData('Hues! - Sales Invoices', 'HUES INVOICES'); // dynamic title

  const translations = useTranslations('sales.sales-invoices');
  const keys = [
    'sales.sales-invoices.emtpyStateComponent.subItems.subItem1',
    'sales.sales-invoices.emtpyStateComponent.subItems.subItem2',
    'sales.sales-invoices.emtpyStateComponent.subItems.subItem3',
    'sales.sales-invoices.emtpyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const { hasPermission } = usePermission();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState('all');
  const [invoiceListing, setInvoiceListing] = useState([]); // invoices
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [filterData, setFilterData] = useState(null);
  const [invoiceType, setInvoiceType] = useState(''); // invoice type
  const [defaultInvoiceType, setDefaultInvoiceType] = useState(''); // default invoice type

  // Synchronize state with query parameters
  useEffect(() => {
    const state = searchParams.get('action');
    if (state === 'b2b' || state === 'b2c') {
      setInvoiceType(state);
    } else {
      setInvoiceType('');
    }
  }, [searchParams]);

  useEffect(() => {
    let newPath = '/dashboard/sales/sales-invoices/';

    if (invoiceType === 'b2b') {
      newPath += `?action=b2b`;
    } else if (invoiceType === 'b2c') {
      newPath += `?action=b2c`;
    }

    const currentPath = window.location.pathname + window.location.search;

    if (currentPath !== newPath) {
      router.push(newPath);
    }
  }, [invoiceType]);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    let newFilterData = {};

    if (tab === 'outstanding') {
      newFilterData = {
        paymentStatus: ['NOT_PAID', 'PARTIAL_PAID'],
      };
    } else if (tab === 'disputed') {
      newFilterData = {
        debitNoteStatus: true,
      };
    } else if (tab === 'all') {
      // If no clientIds, no filters
      newFilterData =
        filterData?.clientIds?.length > 0
          ? { clientIds: filterData.clientIds }
          : null;
    }

    // Conditionally add clientIds only if non-empty
    if (filterData?.clientIds?.length > 0 && tab !== 'all') {
      newFilterData.clientIds = filterData.clientIds;
    }

    // Only update if value actually changed
    setFilterData((prev) => {
      const prevStr = JSON.stringify(prev);
      const nextStr = JSON.stringify(newFilterData);
      if (prevStr !== nextStr) {
        return newFilterData;
      }
      return prev;
    });
  }, [tab]);

  const stableFilterKey = useMemo(() => {
    if (!filterData) return null;
    return JSON.stringify(filterData);
  }, [filterData]);

  // fetch invoice settings keys
  const { data: settings } = useQuery({
    queryKey: [settingsAPI.getSettingByKey.endpointKey],
    queryFn: () => getSettingsByKey('INVOICE'),
    select: (data) => data.data.data.settings,
  });

  useEffect(() => {
    if (settings) {
      const defaultInvoiceTypeKey = settings.find(
        (item) => item.key === 'invoice.default.type',
      )?.value;

      if (
        defaultInvoiceTypeKey &&
        defaultInvoiceTypeKey !== defaultInvoiceType
      ) {
        setDefaultInvoiceType(defaultInvoiceTypeKey);
      }
    }
  }, [settings, defaultInvoiceType]);

  // [INVOICES_FETCHING]
  // Fetch invoices data with infinite scroll
  const {
    data,
    fetchNextPage,
    isFetching,
    isLoading: isInvoiceLoading,
  } = useInfiniteQuery({
    queryKey: [
      invoiceApi.getAllSalesInvoices.endpointKey,
      enterpriseId,
      stableFilterKey,
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
    enabled: hasPermission('permission:sales-view'),
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

  // handlerChangeFn : clients
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
    const isSaleInvoiceRead = row?.readTracker?.sellerIsRead;

    if (isSaleInvoiceRead) {
      router.push(`/dashboard/sales/sales-invoices/${row.invoiceId}`);
    } else {
      updateReadTrackerMutation.mutate(row.invoiceId);
      router.push(`/dashboard/sales/sales-invoices/${row.invoiceId}`);
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
        `Sales_Register_${moment(new Date()).format('YYYYMMDD_HH:mm')}.xlsx`,
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
        `Sales_Register_${moment(new Date()).format('YYYYMMDD_HH:mm')}.xlsx`,
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
        type: 'SALES',
        body: { orderType: 'SALES' },
      });
    } else {
      selectedInvoiceExportMutation.mutate({ invoiceData: selectedInvoices });
    }
  };

  // Assuming useinvoiceColumns is a valid hook or function to generate the table columns
  const invoiceColumns = useSalesInvoicesColumns(setSelectedInvoices);

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
          {/* Show invoice list if no invoice type selected */}
          {!invoiceType && (
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

                  <ProtectedWrapper
                    permissionCode={'permission:sales-invoice-create'}
                  >
                    {defaultInvoiceType ? (
                      <Button
                        size="sm"
                        onClick={() => setInvoiceType(defaultInvoiceType)}
                      >
                        <PlusCircle size={14} />
                        {translations('ctas.invoice.cta')}
                      </Button>
                    ) : (
                      // Ask user to select invoice type
                      <InvoiceTypeModal
                        triggerInvoiceTypeModal={
                          <Button size="sm">
                            <PlusCircle size={14} />
                            {translations('ctas.invoice.cta')}
                          </Button>
                        }
                        setInvoiceType={setInvoiceType}
                      />
                    )}
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
                    <FilterInvoices
                      isSalesFilter={true}
                      tab={tab}
                      setFilterData={setFilterData}
                      setPaginationData={setPaginationData}
                    />
                  </div>
                </section>

                <TabsContent value="all" className="flex-grow overflow-hidden">
                  {isInvoiceLoading && <Loading />}
                  {!isInvoiceLoading && invoiceListing?.length > 0 ? (
                    <SalesTable
                      id="sale-invoices"
                      columns={invoiceColumns}
                      data={invoiceListing}
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
                  )}
                </TabsContent>

                <TabsContent
                  value="outstanding"
                  className="flex-grow overflow-hidden"
                >
                  {isInvoiceLoading && <Loading />}
                  {!isInvoiceLoading && invoiceListing?.length > 0 ? (
                    <SalesTable
                      id="sale-invoices"
                      columns={invoiceColumns}
                      data={invoiceListing}
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
                  )}
                </TabsContent>

                <TabsContent
                  value="disputed"
                  className="flex-grow overflow-hidden"
                >
                  {isInvoiceLoading && <Loading />}
                  {!isInvoiceLoading && invoiceListing?.length > 0 ? (
                    <SalesTable
                      id="sale-invoices-disputed"
                      columns={invoiceColumns}
                      data={invoiceListing}
                      fetchNextPage={fetchNextPage}
                      isFetching={isFetching}
                      totalPages={paginationData?.totalPages}
                      currFetchedPage={paginationData?.currFetchedPage}
                      onRowClick={onRowClick}
                    />
                  ) : (
                    <div className="flex h-[38rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                      <Image src={emptyImg} alt="emptyIcon" />
                      <p>{translations('emtpyStateComponent2.heading')}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Wrapper>
          )}

          {/* Show CreateOrder based on invoice type */}
          {invoiceType === 'b2b' && (
            <CreateB2BInvoice
              isCreatingInvoice={true}
              onCancel={() => setInvoiceType('')}
              name={translations('ctas.invoice.b2bCta')}
              cta="offer"
              isOrder="invoice"
              invoiceType={invoiceType}
              setInvoiceType={setInvoiceType}
            />
          )}

          {invoiceType === 'b2c' && (
            <CreateB2CInvoice
              cta="offer"
              type="invoice"
              name="B2C Invoice"
              isOrder="invoice"
              isCreatingInvoice={true}
              onCancel={() => setInvoiceType('')}
              invoiceType={invoiceType}
              setInvoiceType={setInvoiceType}
            />
          )}
        </>
      )}
    </ProtectedWrapper>
  );
};

export default SalesInvoices;
