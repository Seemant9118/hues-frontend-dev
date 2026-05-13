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
import GSTR1SummaryModal from '@/components/statutory/GSTR1SummaryModal';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  checkGSTAuth,
  filingGSTR1A,
  filingOTPGenrateGSTR1A,
  finalizedGSTR1A,
  getSummaryBeforeFilingGSTR1A,
  requestGSTOTP,
  saveDraftGSTR1A,
  syncCDNRWithGSTR1A,
  syncInvoicesWithGSTR1A,
  verifyGSTOTP,
} from '@/services/GST_Services/GST_Services';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useGSTR1AColumns } from './useGSTR1AColumns';

const PAGE_LIMIT = 10;

const GSTR1A = () => {
  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const translations = useTranslations('gsts.gstr1a');
  const queryClient = useQueryClient();

  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get('period');
  const [tab, setTab] = useState('b2b');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [b2bInvoices, setB2BInvoices] = useState(null);
  const [creditNotes, setCreditNotes] = useState(null);
  const [filingState, setFilingState] = useState({
    selectedInvoices: [],
    selectedCreditNotes: [],
    deletedInvoices: [],
    deletedCreditNotes: [],
  });
  const [b2bRowSelection, setB2BRowSelection] = useState({});
  const [crnRowSelection, setCRNRowSelection] = useState({});

  const [b2bPagination, setB2BPagination] = useState({
    totalPages: 0,
    currFetchedPage: 0,
  });
  const [crnPagination, setCRNPagination] = useState({
    totalPages: 0,
    currFetchedPage: 0,
  });

  const [authExpiredModalOpen, setAuthExpiredModalOpen] = useState(false);
  /* eslint-disable-next-line no-unused-vars */
  const [isFinalized, setIsFinalized] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [filingOTPDialogOpen, setFilingOTPDialogOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const isFirstLoad = useRef(true);

  const handleResetSelection = () => {
    setFilingState({
      selectedInvoices: [],
      selectedCreditNotes: [],
      deletedInvoices: [],
      deletedCreditNotes: [],
    });
    setB2BRowSelection({});
    setCRNRowSelection({});
    setB2BPagination({ totalPages: 0, currFetchedPage: 0 });
    setCRNPagination({ totalPages: 0, currFetchedPage: 0 });
  };

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
      path: `/dashboard/statutory/gst/gstr1a?period=${encodeURIComponent(period)}`,
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

  // Fetch invoices for GSTR1A Filing
  const invoicesForGstFilingQuery = useInfiniteQuery({
    queryKey: [gstAPIs.syncInvoicesWithGSTR1A.endpointKey, period],
    queryFn: async ({ pageParam = 1 }) => {
      return syncInvoicesWithGSTR1A({
        period,
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const data = lastPage?.data?.data;
      if (data?.totalPages && data?.currentPage < data?.totalPages) {
        return data.currentPage + 1;
      }
      return undefined;
    },
    enabled: tab === 'b2b',
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Success toast for B2B query
  useEffect(() => {
    if (invoicesForGstFilingQuery.isSuccess) {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }
      toast.success(`Data refetched successfully for period ${period}`);
    }
  }, [invoicesForGstFilingQuery.isSuccess, period]);

  useEffect(() => {
    const source = invoicesForGstFilingQuery.data;
    if (!source) return;

    if (!source.pages?.length) {
      setB2BInvoices([]);
      return;
    }

    // Extract invoices from the GSTR1A sync response
    // Based on SyncInvoicesModal logic, they might be in innerData.matchedInvoices
    const flattened = source.pages.flatMap((page) => {
      const responseData = page?.data || {};
      const innerData = responseData.data || {};
      return innerData.matchedInvoices || [];
    });

    const uniqueInvoicesListData = Array.from(
      new Map(
        flattened.map((item) => [
          item.systemInvoiceNumber || item.portalInvoiceNumber,
          item,
        ]),
      ).values(),
    ).map((item) => ({
      ...item,
      // Map matched invoice fields to what columns expect
      invoiceId: item.systemInvoiceNumber,
      invoiceReferenceNumber: item.portalInvoiceNumber,
      totalAmount: item.result?.taxable_value, // Guessing field names from standard GST responses
      vendorName: item.buyerName,
      gstNumber: item.ctin,
      gstr1Filed: {
        isDraft: item.result?.status === 'DRAFT',
        isFiled: item.result?.status === 'FILED',
      },
    }));

    setB2BInvoices(uniqueInvoicesListData);

    const lastPage = source.pages[source.pages.length - 1]?.data?.data;
    setB2BPagination({
      totalPages: Number(lastPage?.totalPages ?? 1),
      currFetchedPage: Number(lastPage?.currentPage ?? 1),
    });
  }, [invoicesForGstFilingQuery.data]);

  // Handle errors for B2B query
  useEffect(() => {
    if (invoicesForGstFilingQuery.isError) {
      const { error } = invoicesForGstFilingQuery;
      if (error?.response?.data?.error === 'RET11407') {
        setAuthExpiredModalOpen(true);
      } else {
        toast.error(
          error?.response?.data?.message || 'Failed to fetch B2B invoices',
        );
      }
    }
  }, [invoicesForGstFilingQuery.isError, invoicesForGstFilingQuery.error]);

  // Fetch crns for GSTR1A Filling
  const crnsQuery = useInfiniteQuery({
    queryKey: [gstAPIs.syncCDNRWithGSTR1A.endpointKey, period],
    queryFn: async ({ pageParam = 1 }) => {
      return syncCDNRWithGSTR1A({ period, page: pageParam, limit: PAGE_LIMIT });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const data = lastPage?.data?.data;
      if (data?.totalPages && data?.currentPage < data?.totalPages) {
        return data.currentPage + 1;
      }
      return undefined;
    },
    enabled: tab === 'crn',
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Success toast for CRN query
  useEffect(() => {
    if (crnsQuery.isSuccess) {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }
      toast.success(`Data refetched successfully for period ${period}`);
    }
  }, [crnsQuery.isSuccess, period]);

  useEffect(() => {
    const source = crnsQuery.data;
    if (!source) return;

    if (!source.pages?.length) {
      setCreditNotes([]);
      return;
    }

    const flattened = source.pages.flatMap((page) => {
      const responseData = page?.data || {};
      const innerData = responseData.data || {};
      return innerData.matchedNotes || [];
    });

    const uniqueCreditNotesListData = Array.from(
      new Map(
        flattened.map((item) => [
          item.systemNoteNumber || item.portalNoteNumber,
          item,
        ]),
      ).values(),
    ).map((item) => ({
      ...item,
      id: item.systemNoteNumber,
      referenceNumber: item.portalNoteNumber,
      totalAmount: item.result?.taxable_value,
      vendorName: item.buyerName,
      gstNumber: item.ctin,
      gstr1Filed: {
        isDraft: item.result?.status === 'DRAFT',
        isFiled: item.result?.status === 'FILED',
      },
    }));

    setCreditNotes(uniqueCreditNotesListData);

    const lastPage = source.pages[source.pages.length - 1]?.data?.data;
    setCRNPagination({
      totalPages: Number(lastPage?.totalPages ?? 1),
      currFetchedPage: Number(lastPage?.currentPage ?? 1),
    });
  }, [crnsQuery.data]);

  // Handle errors for CRN query
  useEffect(() => {
    if (crnsQuery.isError) {
      const { error } = crnsQuery;
      if (error?.response?.data?.error === 'RET11407') {
        setAuthExpiredModalOpen(true);
      } else {
        toast.error(
          error?.response?.data?.message || 'Failed to fetch credit notes',
        );
      }
    }
  }, [crnsQuery.isError, crnsQuery.error]);

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
    mutationFn: saveDraftGSTR1A,
    onSuccess: () => {
      toast.success('Draft GSTR-1A saved successfully!');
      queryClient.invalidateQueries([
        gstAPIs.syncInvoicesWithGSTR1A.endpointKey,
        period,
      ]);
      queryClient.invalidateQueries([
        gstAPIs.syncCDNRWithGSTR1A.endpointKey,
        period,
      ]);
      handleResetSelection();
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
      if (authData?.isAuthenticated !== true) {
        setAuthExpiredModalOpen(true);
        return;
      }

      const payload = {
        retPeriod: period,
        invoiceIds:
          filingState.selectedInvoices?.map((item) => item.invoiceId) || [],
        creditNoteIds:
          filingState.selectedCreditNotes?.map((item) => item.id) || [],
      };

      saveDraftMutation.mutate(payload);
    } catch (error) {
      setAuthExpiredModalOpen(true);
    }
  };

  // delete draft mutation
  const handleDeleteDraft = async () => {
    try {
      const res = await refetchGstAuth();
      const authData = res?.data;
      if (authData?.isAuthenticated !== true) {
        setAuthExpiredModalOpen(true);
        return;
      }

      const draftInvoices = filingState.selectedInvoices?.filter(
        (item) => item.gstr1Filed?.isDraft === true,
      );
      const draftCreditNotes = filingState.selectedCreditNotes?.filter(
        (item) => item.gstr1Filed?.isDraft === true,
      );

      const payload = {
        retPeriod: period,
        invoiceIds: [],
        creditNoteIds: [],
        removedInvoiceIds: draftInvoices?.map((item) => item.invoiceId) || [],
        deletedCreditNoteIds: draftCreditNotes?.map((item) => item.id) || [],
      };

      saveDraftMutation.mutate(payload);
    } catch (error) {
      setAuthExpiredModalOpen(true);
    }
  };

  // finalize mutation
  const finalizeMutation = useMutation({
    mutationFn: finalizedGSTR1A,
    onSuccess: () => {
      toast.success('GSTR-1A finalized successfully!');
      queryClient.invalidateQueries([
        gstAPIs.syncInvoicesWithGSTR1A.endpointKey,
        period,
      ]);
      queryClient.invalidateQueries([
        gstAPIs.syncCDNRWithGSTR1A.endpointKey,
        period,
      ]);
      handleResetSelection();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to finalize GSTR-1A. Please try again.',
      );
    },
  });
  const handleFinalize = async () => {
    try {
      const res = await refetchGstAuth();
      const authData = res?.data;
      if (authData?.isAuthenticated !== true) {
        setAuthExpiredModalOpen(true);
        return;
      }
      finalizeMutation.mutate({ period });
    } catch (error) {
      setAuthExpiredModalOpen(true);
    }
  };

  // get summary mutation
  const getSummaryMutation = useMutation({
    mutationFn: getSummaryBeforeFilingGSTR1A,
    onSuccess: (res) => {
      setSummaryData(res?.data?.data);
      setSummaryModalOpen(true);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to fetch summary.');
    },
  });
  const handleFile = async () => {
    try {
      const res = await refetchGstAuth();
      const authData = res?.data;
      if (authData?.isAuthenticated !== true) {
        setAuthExpiredModalOpen(true);
        return;
      }
      getSummaryMutation.mutate({ period });
    } catch (error) {
      setAuthExpiredModalOpen(true);
    }
  };

  // generate filing otp mutation
  const generateFilingOTPMutation = useMutation({
    mutationFn: filingOTPGenrateGSTR1A,
    onSuccess: () => {
      toast.success('OTP sent successfully for filing');
      setSummaryModalOpen(false);
      setFilingOTPDialogOpen(true);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to generate filing OTP.',
      );
    },
  });

  const handleConfirmSummary = () => {
    generateFilingOTPMutation.mutate({ period });
  };

  const filingMutation = useMutation({
    mutationFn: filingGSTR1A,
    onSuccess: () => {
      toast.success('GSTR-1A filed successfully!');
      queryClient.invalidateQueries([
        gstAPIs.syncInvoicesWithGSTR1A.endpointKey,
        period,
      ]);
      queryClient.invalidateQueries([
        gstAPIs.syncCDNRWithGSTR1A.endpointKey,
        period,
      ]);
      handleResetSelection();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to file GSTR-1A. Please try again.',
      );
    },
  });

  const handleFilingOTPVerify = (otp) => {
    filingMutation.mutate({
      period,
      data: { otp, invoices: b2bInvoices },
    });
  };

  const isAllDraft =
    b2bInvoices?.length > 0 &&
    b2bInvoices.every((inv) => inv.gstr1Filed?.isDraft === true);

  const totalSelectedCount =
    filingState.selectedInvoices.length +
    filingState.selectedCreditNotes.length;

  const b2bColumns = useGSTR1AColumns({
    type: 'b2b',
    setFilingState,
  });

  const crnColumns = useGSTR1AColumns({
    type: 'crn',
    setFilingState,
  });

  return (
    <ProtectedWrapper permissionCode="permission:sales-view">
      {!enterpriseId || !isEnterpriseOnboardingComplete ? (
        <>
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/statutory/gst/`)}
                className="rounded-sm p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={16} />
              </button>
              <OrderBreadCrumbs possiblePagesBreadcrumbs={gstBreadCrumbs} />
              <Badge className="w-fit whitespace-nowrap">
                {period && formattedMonthDate(period)}{' '}
              </Badge>
            </div>
          </section>
          <RestrictedComponent />
        </>
      ) : (
        <Wrapper className="h-screen">
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/statutory/gst/`)}
                className="rounded-sm p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={16} />
              </button>
              <OrderBreadCrumbs possiblePagesBreadcrumbs={gstBreadCrumbs} />
              <Badge className="w-fit whitespace-nowrap">
                {period && formattedMonthDate(period)}{' '}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border-r pr-3">
                <ActionsDropdown
                  label={
                    <div className="flex items-center gap-2">
                      <Download size={14} />
                      {translations('actions.fetch')}
                    </div>
                  }
                  variant="outline"
                  className="h-8 border-dashed text-gray-600 hover:text-primary"
                  actions={[
                    {
                      key: 'b2bInvoices',
                      label: translations('tabs.tab1.label'),
                      onClick: async () => {
                        invoicesForGstFilingQuery.refetch();
                        handleResetSelection();
                      },
                    },
                    {
                      key: 'crn',
                      label: translations('tabs.tab2.label'),
                      onClick: async () => {
                        crnsQuery.refetch();
                        handleResetSelection();
                      },
                    },
                  ]}
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/50 p-1">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={totalSelectedCount === 0 || isFinalized}
                  onClick={handleSaveDraft}
                >
                  <Save size={14} className="text-gray-500" />
                  {translations('actions.saveDraft')}
                  {totalSelectedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-4 border-none bg-primary/10 px-1 text-[10px] text-primary"
                    >
                      {totalSelectedCount}
                    </Badge>
                  )}
                </Button>

                <div className="h-4 w-px bg-gray-200" />
                {!isFinalized ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!isAllDraft}
                    onClick={handleFinalize}
                  >
                    <CheckCircle size={14} className="text-gray-500" />
                    {translations('actions.finalize')}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 rounded-md border border-green-100 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    <CheckCircle size={16} />
                    {translations('actions.finalized')}
                  </div>
                )}

                <div className="h-4 w-px bg-gray-200" />

                <Button size="sm" onClick={handleFile} disabled={!isFinalized}>
                  <Send size={14} />
                  {translations('actions.file')}
                </Button>
              </div>
            </div>
          </section>

          <Tabs value={tab} onValueChange={onTabChange} defaultValue={'b2b'}>
            <section className="flex items-center justify-between gap-1">
              <TabsList className="w-fit border">
                <TabsTrigger value="b2b">
                  {translations('tabs.tab1.label')}
                  {filingState.selectedInvoices.length
                    ? ` (${filingState.selectedInvoices.length})`
                    : ''}
                </TabsTrigger>
                <TabsTrigger value="crn">
                  {translations('tabs.tab2.label')}
                  {filingState.selectedCreditNotes.length
                    ? ` (${filingState.selectedCreditNotes.length})`
                    : ''}
                </TabsTrigger>
              </TabsList>

              {(filingState.selectedInvoices.some(
                (inv) => inv.gstr1Filed?.isDraft === true,
              ) ||
                filingState.selectedCreditNotes.some(
                  (crn) => crn.gstr1Filed?.isDraft === true,
                )) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-2 border-red-100 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                  onClick={handleDeleteDraft}
                  disabled={saveDraftMutation.isPending}
                >
                  <Trash2 size={16} />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold">
                      {translations('actions.delete')}
                    </span>
                    <span className="text-[9px] opacity-70">
                      Remove items from GST Portal draft
                    </span>
                  </div>
                </Button>
              )}
            </section>

            <TabsContent value="b2b">
              <div className="flex-grow overflow-hidden">
                {invoicesForGstFilingQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {!b2bInvoices || b2bInvoices.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subHeading={translations(
                          'emptyStateComponent.subHeading1',
                        )}
                        actionBtn={
                          <ActionsDropdown
                            label={translations('actions.fetch')}
                            variant="default"
                            actions={[
                              {
                                key: 'b2bInvoices',
                                label: translations('tabs.tab1.label'),
                                onClick: async () => {
                                  invoicesForGstFilingQuery.refetch();
                                  handleResetSelection();
                                },
                              },
                              {
                                key: 'crn',
                                label: translations('tabs.tab2.label'),
                                onClick: async () => {
                                  crnsQuery.refetch();
                                  handleResetSelection();
                                },
                              },
                            ]}
                          />
                        }
                      />
                    ) : (
                      <InfiniteDataTable
                        id="gstr1a-b2b-table"
                        columns={b2bColumns}
                        data={b2bInvoices || []}
                        fetchNextPage={invoicesForGstFilingQuery.fetchNextPage}
                        isFetching={invoicesForGstFilingQuery.isFetching}
                        totalPages={b2bPagination?.totalPages}
                        currFetchedPage={b2bPagination?.currFetchedPage}
                        rowSelection={b2bRowSelection}
                        onRowSelectionChange={setB2BRowSelection}
                        getRowId={(row) => row.invoiceId}
                      />
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="crn">
              <div className="flex-grow overflow-hidden">
                {crnsQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {!creditNotes || creditNotes.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subHeading={translations(
                          'emptyStateComponent.subHeading1',
                        )}
                        actionBtn={
                          <ActionsDropdown
                            label={translations('actions.fetch')}
                            variant="default"
                            actions={[
                              {
                                key: 'b2bInvoices',
                                label: translations('tabs.tab1.label'),
                                onClick: async () => {
                                  invoicesForGstFilingQuery.refetch();
                                  handleResetSelection();
                                },
                              },
                              {
                                key: 'crn',
                                label: translations('tabs.tab2.label'),
                                onClick: async () => {
                                  crnsQuery.refetch();
                                  handleResetSelection();
                                },
                              },
                            ]}
                          />
                        }
                      />
                    ) : (
                      <InfiniteDataTable
                        id="gstr1a-crn-table"
                        columns={crnColumns}
                        data={creditNotes || []}
                        fetchNextPage={crnsQuery.fetchNextPage}
                        isFetching={crnsQuery.isFetching}
                        totalPages={crnPagination?.totalPages}
                        currFetchedPage={crnPagination?.currFetchedPage}
                        rowSelection={crnRowSelection}
                        onRowSelectionChange={setCRNRowSelection}
                        getRowId={(row) => row.id}
                      />
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <AuthenticationExpired
            open={authExpiredModalOpen}
            onClose={setAuthExpiredModalOpen}
            handleGenerateOTP={handleGenerateOTP}
            requestOTPMutation={requestOTPMutation}
          />

          {showOTPDialog && (
            <GSTOTPDialog
              open={showOTPDialog}
              onOpenChange={setShowOTPDialog}
              onVerify={handleVerifyOTP}
              isVerifying={verifyOTPMutation.isPending}
            />
          )}

          <GSTR1SummaryModal
            isOpen={summaryModalOpen}
            onClose={() => setSummaryModalOpen(false)}
            data={summaryData}
            onConfirm={handleConfirmSummary}
            isLoading={generateFilingOTPMutation.isPending}
          />

          <GSTOTPDialog
            open={filingOTPDialogOpen}
            onOpenChange={setFilingOTPDialogOpen}
            onVerify={handleFilingOTPVerify}
            isVerifying={filingMutation.isPending}
            title="Verify Filing OTP"
            description="Enter the OTP sent to your registered mobile number/email to file GSTR-1A."
          />
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default GSTR1A;
