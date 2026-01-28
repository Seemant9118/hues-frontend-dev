'use client';

import { gstAPIs } from '@/api/gstAPI/gstApi';
import {
  formattedMonthDate,
  getEnterpriseId,
} from '@/appUtils/helperFunctions';
import ActionsDropdown from '@/components/deliveryManagement/ActionsDropdown';
import AuthenticationExpired from '@/components/gst/AuthenticationExpired';
import GSTOTPDialog from '@/components/gst/GSTOTPDialog';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import {
  checkGSTAuth,
  filingGSTR1,
  finalizeGSTR1,
  getInvoicesByPeriod,
  requestGSTOTP,
  saveDraftGSTR1,
  verifyGSTOTP,
} from '@/services/GST_Services/GST_Services';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useInvoicesForGSTFilingColumns } from './useInvoicesForGSTFilingColumns';

const PAGE_LIMIT = 10;

const GSTR1 = () => {
  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const translations = useTranslations('gsts.gstr1');
  const queryClient = useQueryClient();

  const router = useRouter();
  const { hasPermission } = usePermission();
  const searchParams = useSearchParams();
  const period = searchParams.get('period');
  const [tab, setTab] = useState('b2b');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [b2bInvoices, setB2BInvoices] = useState();
  const [paginationData, setPaginationData] = useState({});
  const [selectedInvoicesToFile, setSelectedInvoicesToFile] = useState([]);
  const [authExpiredModalOpen, setAuthExpiredModalOpen] = useState(false);
  const isFirstLoad = useRef(true);

  // Handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const gstBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/statutory/gst',
      show: true,
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/statutory/gst/gstr1?period=${encodeURIComponent(period)}`,
      show: true,
    },
  ];

  // Check authentication api
  const { refetch: refetchGstAuth } = useQuery({
    queryKey: [gstAPIs.checkAuth.endpointKey],
    queryFn: checkGSTAuth,
    enabled: false,
    select: (data) => data.data.data,
    retry: false,
  });

  // Fetch invoices for GST Filing - only enabled when authenticated
  const invoicesForGstFilingQuery = useInfiniteQuery({
    queryKey: [gstAPIs.getInvoicesByPeriod.endpointKey, period],
    queryFn: async ({ pageParam = 1 }) => {
      return getInvoicesByPeriod({
        period,
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    onSuccess: () => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false; // don't show toast on first load
        return;
      }
      toast.success(`Data refetched successfully for period ${period}`);
    },

    onError: () => {
      if (isFirstLoad.current) return;
      toast.error('Failed to refetch data');
    },
    enabled: hasPermission('permission:item-masters-view'),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    const source = invoicesForGstFilingQuery.data;

    if (!source?.pages?.length) return;

    // flatten items from pages
    const flattened = source.pages.flatMap(
      (page) => page?.data?.data?.data || [],
    );

    // remove duplicates by id
    const uniqueInvoicesListData = Array.from(
      new Map(flattened.map((item) => [item.invoiceId, item])).values(),
    );

    setB2BInvoices(uniqueInvoicesListData);

    // pagination from last page
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;

    setPaginationData({
      totalPages: Number(lastPage?.totalPages ?? 0),
      currFetchedPage: Number(lastPage?.currentPage ?? 0),
    });
  }, [invoicesForGstFilingQuery.data]);

  // Request OTP mutation
  const requestOTPMutation = useMutation({
    mutationFn: requestGSTOTP,
    onSuccess: () => {
      toast.success('OTP sent successfully to your registered contact');
      setAuthExpiredModalOpen(false);
      setShowOTPDialog(true);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to send OTP. Please try again.',
      );
    },
  });
  const handleGenerateOTP = () => {
    requestOTPMutation.mutate();
  };

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: verifyGSTOTP,
    onSuccess: () => {
      toast.success('Authentication successful!');
      setShowOTPDialog(false);
      // Refetch auth status
      queryClient.invalidateQueries({
        queryKey: [gstAPIs.checkAuth.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Invalid OTP. Please try again.',
      );
    },
  });
  const handleVerifyOTP = (otp) => {
    verifyOTPMutation.mutate({ otp });
  };

  // save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: saveDraftGSTR1,
    onSuccess: () => {
      toast.success('Draft GSTR-1 saved successfully!');
      // Refetch invoices for GST filing
      queryClient.invalidateQueries([
        gstAPIs.getInvoicesByPeriod.endpointKey,
        period,
      ]);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to save draft. Please try again.',
      );
    },
  });
  const handleSaveDraft = async () => {
    try {
      const res = await refetchGstAuth();
      const authData = res?.data;

      const isAuthenticated = authData?.isAuthenticated === true;

      if (!isAuthenticated) {
        // show modal
        setAuthExpiredModalOpen(true);
        return;
      }

      // continue with next operation
      const payload = {
        retPeriod: period,
        invoiceIds: selectedInvoicesToFile?.map((item) => item.invoiceId),
      };

      saveDraftMutation.mutate(payload);
    } catch (error) {
      // any API failure = treat as expired
      setAuthExpiredModalOpen(true);
    }
  };

  // finalize mutation
  const finalizeMutation = useMutation({
    mutationFn: finalizeGSTR1,
    onSuccess: () => {
      toast.success('GSTR-1 finalized successfully!');
      // Refetch invoices for GST filing
      queryClient.invalidateQueries([
        gstAPIs.getInvoicesByPeriod.endpointKey,
        period,
      ]);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to finalize GSTR-1. Please try again.',
      );
    },
  });
  const handleFinalize = async () => {
    try {
      const res = await refetchGstAuth();
      const authData = res?.data;

      const isAuthenticated = authData?.isAuthenticated === true;

      if (!isAuthenticated) {
        setAuthExpiredModalOpen(true);
        return;
      }

      finalizeMutation.mutate({ period });
    } catch (error) {
      setAuthExpiredModalOpen(true);
    }
  };

  // filing mutation
  const filingMutation = useMutation({
    mutationFn: filingGSTR1,
    onSuccess: () => {
      toast.success('GSTR-1 filed successfully!');
      // Refetch invoices for GST filing
      queryClient.invalidateQueries([
        gstAPIs.getInvoicesByPeriod.endpointKey,
        period,
      ]);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to file GSTR-1. Please try again.',
      );
    },
  });
  const handleFile = async () => {
    try {
      const res = await refetchGstAuth();
      const authData = res?.data;

      const isAuthenticated = authData?.isAuthenticated === true;

      if (!isAuthenticated) {
        setAuthExpiredModalOpen(true);
        return;
      }

      filingMutation.mutate({
        period,
        data: b2bInvoices,
      });
    } catch (error) {
      setAuthExpiredModalOpen(true);
    }
  };

  const gstColumns = useInvoicesForGSTFilingColumns({
    setSelectedInvoicesToFile,
  });

  return (
    <ProtectedWrapper permissionCode="permission:sales-view">
      {!enterpriseId || !isEnterpriseOnboardingComplete ? (
        <>
          {/* Headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/statutory/gst/`)}
                className="rounded-sm p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={16} />
              </button>
              {/* breadcrumbs */}
              <OrderBreadCrumbs possiblePagesBreadcrumbs={gstBreadCrumbs} />
              <Badge className="w-fit whitespace-nowrap">
                {period && formattedMonthDate(period)}{' '}
              </Badge>
              {/* <Input disabled value={GSTIN} className="max-w-fit" /> */}
            </div>
          </section>
          <RestrictedComponent />
        </>
      ) : (
        <Wrapper className="h-screen">
          {/* Headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/statutory/gst/`)}
                className="rounded-sm p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={16} />
              </button>
              {/* breadcrumbs */}
              <OrderBreadCrumbs possiblePagesBreadcrumbs={gstBreadCrumbs} />
              <Badge className="w-fit whitespace-nowrap">
                {period && formattedMonthDate(period)}{' '}
              </Badge>
              {/* <Input disabled value={GSTIN} className="max-w-fit" /> */}
            </div>
            <div className="flex items-center gap-2">
              <ActionsDropdown
                label={'Fetch'}
                variant="secondary"
                actions={[
                  {
                    key: 'b2bInvoices',
                    label: 'B2B Invoices',
                    onClick: async () => {
                      await invoicesForGstFilingQuery.refetch();
                    },
                  },
                  {
                    key: 'b2cInvoices',
                    label: 'B2C Invoices (coming soon)',
                    className: 'cursor-not-allowed opacity-50',
                    disabled: true,
                    onClick: () => {},
                  },
                  {
                    key: 'crn',
                    label: 'Credit Notes (coming soon)',
                    className: 'cursor-not-allowed opacity-50',
                    disabled: true,
                    onClick: () => {},
                  },
                ]}
              />

              <Button
                size="sm"
                disabled={selectedInvoicesToFile.length === 0}
                onClick={handleSaveDraft}
              >
                Save Draft {`(${selectedInvoicesToFile.length})`}
              </Button>

              <Button size="sm" variant="secondary" onClick={handleFinalize}>
                Finalize
              </Button>
              <Button size="sm" onClick={handleFile}>
                File
              </Button>
            </div>
          </section>

          <Tabs
            className="flex flex-col gap-2"
            value={tab}
            onValueChange={onTabChange}
            defaultValue={'b2b'}
          >
            <TabsList className="w-fit border">
              <TabsTrigger value="b2b">
                {translations('tabs.tab1.label')}
              </TabsTrigger>
              <TabsTrigger value="crn">
                {translations('tabs.tab2.label')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="b2b">
              {/* body - content */}
              <div className="flex-grow overflow-hidden">
                {invoicesForGstFilingQuery.isLoading ||
                invoicesForGstFilingQuery.isFetching ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: No data → Empty stage */}
                    {b2bInvoices?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subHeading={translations(
                          'emptyStateComponent.subHeading1',
                        )}
                        actionBtn={
                          <ActionsDropdown
                            label={'Fetch'}
                            variant="default"
                            actions={[
                              {
                                key: 'b2bInvoices',
                                label: 'B2B Invoices',
                                onClick: async () => {
                                  await invoicesForGstFilingQuery.refetch();
                                },
                              },
                              {
                                key: 'b2cInvoices',
                                label: 'B2C Invoices (coming soon)',
                                className: 'cursor-not-allowed opacity-50',
                                disabled: true,
                                onClick: () => {},
                              },
                              {
                                key: 'crn',
                                label: 'Credit Notes (coming soon)',
                                className: 'cursor-not-allowed opacity-50',
                                disabled: true,
                                onClick: () => {},
                              },
                            ]}
                          />
                        }
                      />
                    ) : (
                      // Case 2: data is available → Show Table
                      <InfiniteDataTable
                        id="gstr1-b2b-table"
                        columns={gstColumns}
                        data={b2bInvoices}
                        fetchNextPage={invoicesForGstFilingQuery.fetchNextPage}
                        isFetching={invoicesForGstFilingQuery.isFetching}
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                        // onRowClick={onRowClick}
                      />
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="crn">Coming Soon...</TabsContent>
          </Tabs>

          {/* OTP Dialog */}
          <GSTOTPDialog
            open={showOTPDialog}
            onOpenChange={setShowOTPDialog}
            onVerify={handleVerifyOTP}
            isVerifying={verifyOTPMutation.isPending}
          />

          <AuthenticationExpired
            open={authExpiredModalOpen}
            onClose={setAuthExpiredModalOpen}
            handleGenerateOTP={handleGenerateOTP}
            requestOTPMutation={requestOTPMutation}
          />
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default GSTR1;
