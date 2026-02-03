'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import InfoBanner from '@/components/auth/InfoBanner';
import { MultiStepForm } from '@/components/shared/MultiStepForm';
import { createDispatchSteps } from '@/components/shared/MultiStepForm/example-config';
import { useSearchParams, useRouter } from 'next/navigation';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import DebouncedInput from '@/components/ui/DebouncedSearchInput';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import {
  createDispatchNote,
  getDispatchNotes,
} from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDispatchedNotes } from './useDispatchedNotes';

// macros
const PAGE_LIMIT = 10;

const DispatchedNotes = () => {
  useMetaData('Hues! - Dispatch Notes', 'HUES Dispatch Notes');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const translations = useTranslations('transport.dispatched-notes');
  const enterpriseId = getEnterpriseId();

  const keys = [
    'transport.dispatched-notes.emtpyStateComponent.subItems.subItem1',
    'transport.dispatched-notes.emtpyStateComponent.subItems.subItem2',
    'transport.dispatched-notes.emtpyStateComponent.subItems.subItem3',
    'transport.dispatched-notes.emtpyStateComponent.subItems.subItem4',
  ];
  const { hasPermission } = usePermission();
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const [dispatchedNotes, setDispatchedNotes] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCycle, setSearchCycle] = useState(0);
  const [paginationData, setPaginationData] = useState(null);
  const [tab, setTab] = useState('ALL');
  const [isCreatingDispatch, setIsCreatingDispatch] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const isSearching = searchTerm?.length > 0;
  const hasData = dispatchedNotes?.length > 0;

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    setIsCreatingDispatch(action === 'create');
  }, [action]);

  const dispatchBreadCrumbs = [
    {
      id: 1,
      name: translations('title'),
      path: '/dashboard/transport/dispatch',
      show: true,
    },
    {
      id: 2,
      name: 'Create Dispatch Note',
      path: '/dashboard/transport/dispatch?action=create',
      show: action === 'create',
    },
  ];

  const handleSearchChange = (val) => {
    setSearchTerm(val.trim() ?? '');

    // increment when clearing
    if (val === '') {
      setSearchCycle((prev) => prev + 1);
    }
  };

  // Fetch dispatched notes data with infinite scroll
  const {
    data,
    fetchNextPage,
    isFetching,
    isLoading: isDispatchLoading,
  } = useInfiniteQuery({
    queryKey: [
      deliveryProcess.getDispatchNotes.endpointKey,
      enterpriseId,
      tab,
      searchTerm,
      searchCycle,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return getDispatchNotes({
        enterpriseId,
        page: pageParam,
        limit: PAGE_LIMIT,
        movement: tab,
        searchString: searchTerm,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    enabled: hasPermission('permission:sales-view'),
    staleTime: Infinity, // data never becomes stale
    refetchOnMount: false, // don’t refetch on remount
    refetchOnWindowFocus: false, // already correct
  });

  // data flattening - formatting
  useEffect(() => {
    if (!data) return;

    // Flatten sales dispatched data from all pages
    const flattenedSalesDispatchedNotesData = data.pages
      .map((page) => page?.data?.data?.data) // Assuming sales dispatched data is nested in `data.data.data`
      .flat();

    // Deduplicate sales dispatched data based on unique `id`
    const uniqueSalesDispatchedNotesData = Array.from(
      new Map(
        flattenedSalesDispatchedNotesData.map((sale) => [
          sale.id, // Assuming `id` is the unique identifier for each sale invoice
          sale,
        ]),
      ).values(),
    );

    // Update state with deduplicated sales dispatched data
    setDispatchedNotes(uniqueSalesDispatchedNotesData);

    // Calculate pagination data using the last page's information
    const lastPage = data.pages[data.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: lastPage?.currentPage,
    });
  }, [data]);

  // [updateReadTracker Mutation : onRowClick]
  const updateReadTrackerMutation = useMutation({
    mutationKey: [readTrackerApi.updateTrackerState.endpointKey],
    mutationFn: updateReadTracker,
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });
  const onRowClick = (row) => {
    const isRead = row?.readTracker?.sellerIsRead || true;
    const readTrackerId = row?.readTracker?.id;

    if (isRead) {
      router.push(`/dashboard/transport/dispatch/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(readTrackerId);
      router.push(`/dashboard/transport/dispatch/${row.id}`);
    }
  };

  // create directe dispatch note
  const createDispatchNoteMutation = useMutation({
    mutationKey: [deliveryProcess.createDispatchNote.endpointKey],
    mutationFn: createDispatchNote,
    onSuccess: (data) => {
      toast.success(translations('successMsg.dispatach_created_success'));

      setIsCreatingDispatch(false);
      setFormData({});
      setErrors({});

      router.push(
        `/dashboard/transport/dispatch/${data?.data?.data?.data?.dispatchNoteId}`,
      );
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  const isSubmitting = createDispatchNoteMutation.isPending;

  const handleSubmit = async () => {
    const selectedItems = formData?.selectedItems || [];
    if (!selectedItems.length) return;

    const payload = {
      ...formData,

      items: selectedItems.map((item) => ({
        orderItemId: Number(item.id),
        invoiceItemId: Number(item.invoiceItemId),
        quantity: Number(item.dispatchQty),
        amount: Number(item.amount),
        gstAmount: Number(item.gstAmount),
      })),

      totalAmount: selectedItems.reduce(
        (acc, item) => acc + Number(item.amount || 0),
        0,
      ),
      totalGstAmount: selectedItems.reduce(
        (acc, item) => acc + Number(item.gstAmount || 0),
        0,
      ),
    };

    delete payload.selectedItems;

    createDispatchNoteMutation.mutate({
      id: formData?.orderId,
      data: payload,
    });
  };

  const handleCancel = () => {
    setFormData({});
    setErrors({});
    router.push('/dashboard/transport/dispatch');
  };

  // columns
  const dispatchedNotesColumns = useDispatchedNotes();

  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <Wrapper className="h-screen overflow-hidden">
          {!isCreatingDispatch && (
            <>
              {/* Headers */}
              <SubHeader
                name={translations('title')}
                className="sticky top-0 z-10 flex items-center justify-between bg-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <DebouncedInput
                    value={searchTerm}
                    delay={400}
                    onDebouncedChange={handleSearchChange}
                    placeholder="Search Dispatch note"
                  />

                  <Button
                    size="sm"
                    onClick={() =>
                      router.push('/dashboard/transport/dispatch?action=create')
                    }
                  >
                    <PlusCircle size={14} /> Create Dispatch Note
                  </Button>
                </div>
              </SubHeader>
              {/* Banner */}
              <InfoBanner
                showSupportLink={false}
                text={
                  <>
                    {`To create a Dispatch Note, go to Sales > Invoices, and select
                the appropriate Invoice.`}
                  </>
                }
              />
              <Tabs
                value={tab}
                onValueChange={onTabChange}
                defaultValue={'ALL'}
                className="flex flex-grow flex-col overflow-hidden"
              >
                <section className="flex w-full justify-between py-2">
                  <TabsList className="border">
                    <TabsTrigger value="ALL">
                      {translations('tabs.tab1.label')}
                    </TabsTrigger>
                    <TabsTrigger value="INWARD">
                      {translations('tabs.tab2.label')}
                    </TabsTrigger>
                    <TabsTrigger value="OUTWARD">
                      {translations('tabs.tab3.label')}
                    </TabsTrigger>
                  </TabsList>
                </section>

                <TabsContent value="ALL" className="flex-grow overflow-hidden">
                  {isDispatchLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!hasData && !isSearching ? (
                        <EmptyStageComponent
                          heading={translations('emtpyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: data is available → Show Table
                        <InfiniteDataTable
                          id="dispatch-table"
                          columns={dispatchedNotesColumns}
                          data={hasData ? dispatchedNotes : []}
                          fetchNextPage={fetchNextPage}
                          isFetching={isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                        />
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent
                  value="INWARD"
                  className="flex-grow overflow-hidden"
                >
                  {isDispatchLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!hasData && !isSearching ? (
                        <EmptyStageComponent
                          heading={translations('emtpyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: data is available → Show Table
                        <InfiniteDataTable
                          id="dispatch-table"
                          columns={dispatchedNotesColumns}
                          data={hasData ? dispatchedNotes : []}
                          fetchNextPage={fetchNextPage}
                          isFetching={isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                        />
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent
                  value="OUTWARD"
                  className="flex-grow overflow-hidden"
                >
                  {isDispatchLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!hasData && !isSearching ? (
                        <EmptyStageComponent
                          heading={translations('emtpyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: data is available → Show Table
                        <InfiniteDataTable
                          id="dispatch-table"
                          columns={dispatchedNotesColumns}
                          data={hasData ? dispatchedNotes : []}
                          fetchNextPage={fetchNextPage}
                          isFetching={isFetching}
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                        />
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
          {isCreatingDispatch && (
            <MultiStepForm
              steps={createDispatchSteps}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              breadcrumbs={dispatchBreadCrumbs}
              breadcrumbHome="/dashboard/transport/dispatch"
              breadcrumbHomeText="Dispatch Notes"
              breadcrumbTitle="Create Dispatch Note"
              finalStepActions={({ handleFinalSubmit, isSubmitting }) => (
                <Button
                  size="sm"
                  onClick={() => handleFinalSubmit('submit')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : '✓ Create Dispatch Note'}
                </Button>
              )}
            />
          )}
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default DispatchedNotes;
