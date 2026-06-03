'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import {
  capitalize,
  formatValue,
  formattedAmount,
} from '@/appUtils/helperFunctions';
import InfoBanner from '@/components/auth/InfoBanner';
import TicketChatModal from '@/components/Modals/TicketChatModal';
import TicketModal from '@/components/Modals/TicketModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import AccessDenied from '@/components/shared/AccessDenied';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import {
  getVendor,
  getVendorLedger,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import {
  createManualTicket,
  getTickets,
  updateTicketStatus,
} from '@/services/Tickets_Services/Tickets_Services';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Ticket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuthorizedPersonColumns } from './columns/useAuthorizedPersonsColumns';
import { useDocumentsColumns } from './columns/useDocumentsColumns';
import { useLedgerColumns } from './columns/useLedgerColumns';

export default function VendorsDetailsPage() {
  const { vendorId } = useParams();
  const { hasPermission } = usePermission();
  const translations = useTranslations('vendor.vendorDetails');

  const [tab, setTab] = useState('overview');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    category: 'MANUAL',
    priority: 'LOW',
    description: '',
    context: 'INVOICE',
    subCategory: 'AMOUNT_MISMATCH',
    referenceNumber: '',
    referenceDate: '',
    contextId: null,
  });

  const [createdTickets, setCreatedTickets] = useState([]);
  const [localMessages, setLocalMessages] = useState({});
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatTicket, setSelectedChatTicket] = useState(null);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const vendorBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/vendors',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/vendors/${vendorId}`,
      show: true, // Always show
    },
  ];

  // api calling for vendorDetails
  const {
    isLoading,
    data: vendorDetails,
    error,
  } = useQuery({
    queryKey: [vendorEnterprise.getVendor.endpointKey, vendorId],
    queryFn: () => getVendor(vendorId),
    select: (data) => data.data.data,
    enabled: hasPermission('permission:vendors-view'),
    retry: (failureCount, error) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  // api calling for vendorLedger
  const {
    isLoading: isLedgerLoading,
    data: ledgerData,
    error: ledgerError,
  } = useQuery({
    queryKey: [vendorEnterprise.getVendorLedger.endpointKey, vendorId],
    queryFn: () => getVendorLedger({ vendorId }),
    select: (data) => data.data.data,
    enabled: tab === 'ledger' && hasPermission('permission:vendors-view'),
    retry: (failureCount, error) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  // api call to fetch tickets
  const {
    data: ticketsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isTicketsLoading,
    refetch: refetchTickets,
  } = useInfiniteQuery({
    queryKey: ['tickets', vendorId],
    queryFn: ({ pageParam = 1 }) => {
      const targetEnterpriseId = vendorDetails?.vendor?.id || vendorDetails?.id;
      const targetEnterpriseType = vendorDetails?.vendor?.id
        ? 'ENTERPRISE'
        : 'UNCONFIRMED_ENTERPRISE';
      return getTickets({
        page: pageParam,
        limit: 10,
        targetEnterpriseId,
        targetEnterpriseType,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Number(lastPage?.data?.data?.totalPages ?? 0);
      if (totalPages > 0) {
        const nextPage = (Array.isArray(allPages) ? allPages.length : 0) + 1;
        return nextPage <= totalPages ? nextPage : undefined;
      }
      const ticketsArray =
        lastPage?.data?.data?.data ||
        lastPage?.data?.data ||
        lastPage?.data ||
        [];
      return ticketsArray.length === 10 ? allPages.length + 1 : undefined;
    },
    enabled: tab === 'tickets' && !!vendorId && !!vendorDetails,
  });

  const tickets = React.useMemo(() => {
    const fetched =
      ticketsData?.pages.flatMap((page) => {
        const list =
          page?.data?.data?.data || page?.data?.data || page?.data || [];
        return Array.isArray(list) ? list : [];
      }) || [];
    return [...createdTickets, ...fetched];
  }, [ticketsData, createdTickets]);

  const updateStatusMutation = useMutation({
    mutationFn: updateTicketStatus,
    onSuccess: (data, variables) => {
      refetchTickets();
      setSelectedChatTicket((prevSelected) => {
        const prevId = prevSelected?.id || prevSelected?._id;
        if (prevSelected && prevId === variables.ticketId) {
          return { ...prevSelected, status: variables.status.status };
        }
        return prevSelected;
      });
      toast.success('Ticket status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const createManualTicketMutation = useMutation({
    mutationFn: createManualTicket,
    onSuccess: () => {
      toast.success('Ticket created successfully');
      refetchTickets();
      setIsTicketModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    },
  });

  const handleOpenChatModal = (ticket) => {
    setSelectedChatTicket(ticket);
    setIsChatModalOpen(true);
  };

  const handleChatStatusChange = (ticketId, newStatus) => {
    updateStatusMutation.mutate({
      ticketId,
      status: { status: newStatus },
    });
  };

  const handleChatSendMessage = (ticketId, messageText) => {
    if (!messageText.trim()) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newMessage = {
      id: Date.now(),
      sender: 'agent',
      text: messageText,
      time: timeString,
    };

    setLocalMessages((prev) => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newMessage],
    }));

    setSelectedChatTicket((prevSelected) => {
      const prevId = prevSelected?.id || prevSelected?._id;
      if (prevSelected && prevId === ticketId) {
        return {
          ...prevSelected,
          messages: [...(prevSelected.messages || []), newMessage],
        };
      }
      return prevSelected;
    });
  };

  const getTicketForChatModal = (ticket) => {
    if (!ticket) return null;
    const tId = ticket.id || ticket._id;
    return {
      ...ticket,
      id: tId,
      messages: [...(ticket.messages || []), ...(localMessages[tId] || [])],
    };
  };

  const handleOpenCreateModal = () => {
    setSelectedTicketId(null);
    setTicketForm({
      title: '',
      category: 'MANUAL',
      priority: 'LOW',
      description: '',
      context: 'INVOICE',
      subCategory: 'AMOUNT_MISMATCH',
      referenceNumber: '',
      referenceDate: '',
      contextId: null,
    });
    setModalMode('create');
    setIsTicketModalOpen(true);
  };

  const handleTicketFormSubmit = (e, extraData) => {
    e.preventDefault();
    if (!ticketForm.title.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (modalMode === 'create') {
      const payload = {
        title: ticketForm.title,
        description: ticketForm.description,
        priority: ticketForm.priority,
        category: 'MANUAL',
        subCategory: ticketForm.subCategory,
        severity: ticketForm.priority,
        contextType: ticketForm.context,
        targetEnterpriseId: Number(extraData?.targetEnterpriseId),
        targetEnterpriseType: extraData?.targetEnterpriseType,
      };

      if (ticketForm.referenceNumber) {
        payload.referenceNumber = ticketForm.referenceNumber;
        payload.contextId = ticketForm.contextId;
        if (ticketForm.referenceDate) {
          payload.referenceDate = ticketForm.referenceDate;
        }
      }

      createManualTicketMutation.mutate(payload);
    } else {
      setCreatedTickets((prev) =>
        prev.map((t) =>
          (t.id || t._id) === selectedTicketId
            ? {
                ...t,
                title: ticketForm.title,
                category: ticketForm.category,
                description: ticketForm.description,
                transaction: ticketForm.transaction,
                status: ticketForm.status,
              }
            : t,
        ),
      );
      setIsTicketModalOpen(false);
    }
  };

  const documentRows = React.useMemo(
    () => [
      {
        directorName: formatValue(
          vendorDetails?.vendor?.type === 'proprietorship'
            ? vendorDetails?.vendor?.name ||
                vendorDetails?.invitation?.userDetails?.name
            : vendorDetails?.vendor?.director?.name,
        ),
        directorNumber: formatValue(
          vendorDetails?.vendor?.type === 'proprietorship'
            ? vendorDetails?.vendor?.mobileNumber ||
                vendorDetails?.invitation?.userDetails?.mobileNumber
            : vendorDetails?.vendor?.director?.mobileNumber,
        ),
        pan: formatValue(
          vendorDetails?.vendor?.panNumber ||
            vendorDetails?.invitation?.userDetails?.panNumber,
        ),
        gst: formatValue(
          vendorDetails?.vendor?.gstNumber ||
            vendorDetails?.invitation?.userDetails?.gstNumber,
        ),
        cin: formatValue(
          vendorDetails?.vendor?.cin ||
            vendorDetails?.invitation?.userDetails?.cin,
        ),
        udyam: formatValue(
          vendorDetails?.vendor?.udyam ||
            vendorDetails?.invitation?.userDetails?.udyam,
        ),
      },
    ],
    [vendorDetails],
  );
  const documentColumns = useDocumentsColumns({ translations });
  const authorizedPersonsColumns = useAuthorizedPersonColumns({ translations });
  const ledgerColumns = useLedgerColumns();

  if (isLoading || (!vendorDetails && error?.response?.status !== 403)) {
    return <p className="p-6 text-gray-500">Loading enterprise details...</p>;
  }

  return (
    <ProtectedWrapper permissionCode={'permission:vendors-view'}>
      {error?.response?.status === 403 ? (
        <AccessDenied />
      ) : (
        <Wrapper className="h-full py-2">
          {/* headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex gap-2">
              {/* breadcrumbs */}
              <OrderBreadCrumbs possiblePagesBreadcrumbs={vendorBreadCrumbs} />
            </div>
            <div className="flex gap-2"></div>
          </section>

          <Tabs
            value={tab}
            onValueChange={onTabChange}
            defaultValue={'overview'}
          >
            <section className="flex items-center justify-between gap-2">
              <TabsList className="border">
                <TabsTrigger value="overview">
                  {translations('tabs.tab1.title')}
                </TabsTrigger>
                <TabsTrigger value="authorized">Authorized Persons</TabsTrigger>
                <TabsTrigger value="ledger" className="flex items-center gap-2">
                  Ledger
                </TabsTrigger>
                <TabsTrigger
                  value="tickets"
                  className="flex items-center gap-2"
                >
                  Tickets
                </TabsTrigger>
              </TabsList>

              {tab === 'tickets' && (
                <Button onClick={handleOpenCreateModal} size="sm">
                  <Plus size={16} />
                  Create Ticket
                </Button>
              )}
            </section>
            <TabsContent value="overview">
              <Overview
                data={{
                  name: formatValue(
                    vendorDetails?.vendor?.name ||
                      vendorDetails?.invitation?.userDetails?.name,
                  ),
                  enterpriseType: capitalize(
                    vendorDetails?.vendor?.type ||
                      vendorDetails?.invitation?.userDetails?.type,
                  ),
                  email: formatValue(
                    vendorDetails?.vendor?.email ||
                      vendorDetails?.invitation?.userDetails?.email,
                  ),
                  phone: formatValue(
                    `+91 ${
                      vendorDetails?.vendor?.mobileNumber ||
                      vendorDetails?.invitation?.userDetails?.mobileNumber
                    }`,
                  ),
                  address: formatValue(vendorDetails?.address?.address),
                }}
                labelMap={{
                  name: translations('tabs.tab1.content.overview_labels.name'),
                  enterpriseType: translations(
                    'tabs.tab1.content.overview_labels.enterprise_type',
                  ),
                  email: translations(
                    'tabs.tab1.content.overview_labels.email',
                  ),
                  phone: translations(
                    'tabs.tab1.content.overview_labels.phone',
                  ),
                  address: translations(
                    'tabs.tab1.content.overview_labels.address',
                  ),
                }}
              />

              <DataTable columns={documentColumns} data={documentRows} />
            </TabsContent>
            <TabsContent value="authorized">
              <div className="flex flex-col gap-4">
                {vendorDetails?.metaData?.authorizedPerson &&
                vendorDetails.metaData.authorizedPerson.length > 0 ? (
                  <DataTable
                    columns={authorizedPersonsColumns}
                    data={vendorDetails?.metaData?.authorizedPerson || []}
                  />
                ) : (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 text-center text-sm text-gray-500">
                    No authorized persons found for this vendor.
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="ledger">
              <div className="flex flex-col gap-2">
                {/* Info banner */}
                <InfoBanner
                  text="Ledger is system-of-record. Tickets cannot modify ledger entries."
                  showSupportLink={false}
                />

                {isLedgerLoading ? (
                  <p className="p-6 text-gray-500">Loading ledger details...</p>
                ) : ledgerError ? (
                  <p className="p-6 text-rose-500">
                    Error loading ledger:{' '}
                    {ledgerError?.message || 'Something went wrong'}
                  </p>
                ) : (
                  <>
                    {/* 4 Cards Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="border-gray-150 rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Total Orders
                        </p>
                        <p className="mt-2 text-2xl font-bold text-gray-800">
                          {formattedAmount(
                            ledgerData?.summary?.totalOrderAmount,
                          )}
                        </p>
                      </div>
                      <div className="border-gray-150 rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Total Invoiced
                        </p>
                        <p className="mt-2 text-2xl font-bold text-gray-800">
                          {formattedAmount(
                            ledgerData?.summary?.totalInvoiceAmount,
                          )}
                        </p>
                      </div>
                      <div className="border-gray-150 rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Total Paid
                        </p>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">
                          {formattedAmount(
                            ledgerData?.summary?.totalPaidAmount,
                          )}
                        </p>
                      </div>
                      <div className="border-gray-150 rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Outstanding Amount
                        </p>
                        <p className="mt-2 text-2xl font-bold text-rose-600">
                          {formattedAmount(
                            ledgerData?.summary?.outstandingAmount,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Transaction History */}
                    <div>
                      <h2 className="mb-4 text-lg font-bold text-gray-800">
                        Recent Transaction History
                      </h2>
                      <DataTable
                        columns={ledgerColumns}
                        data={ledgerData?.recentTransactions || []}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="tickets">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-3">
                  {isTicketsLoading && tickets.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">
                      Loading tickets...
                    </p>
                  ) : tickets.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">
                      No tickets found.
                    </p>
                  ) : (
                    tickets.map((ticket) => (
                      <div
                        key={ticket.id || ticket._id}
                        className="border-gray-150 flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 rounded-lg bg-gray-50 p-2.5 text-gray-500">
                            <Ticket size={18} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {ticket.ticketNumber && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-sans text-[10px] font-bold text-slate-500">
                                  {ticket.ticketNumber}
                                </span>
                              )}
                              <h3 className="text-sm font-bold leading-snug text-gray-800">
                                {ticket.title}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs font-medium text-gray-500">
                              <span className="font-semibold text-slate-700">
                                {ticket.subCategory &&
                                  `${capitalize(ticket.subCategory.replace(/_/g, ' '))}`}
                              </span>
                              {ticket.referenceNumber && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="rounded bg-blue-50/50 px-1.5 py-0.5 font-semibold text-primary">
                                    Ref: {ticket.referenceNumber}
                                  </span>
                                </>
                              )}
                              <>
                                <span className="text-slate-300">•</span>
                                <span>
                                  {ticket.date ||
                                    (ticket.createdAt
                                      ? new Date(
                                          ticket.createdAt,
                                        ).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        })
                                      : '')}
                                </span>
                              </>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                              ticket.status === 'OPEN'
                                ? 'border-amber-200/50 bg-amber-50 text-amber-600'
                                : ticket.status === 'WAITING'
                                  ? 'border-blue-200/50 bg-blue-50 text-blue-600'
                                  : ticket.status === 'RESOLVED'
                                    ? 'border-emerald-200/50 bg-emerald-50 text-emerald-600'
                                    : 'border-gray-200/50 bg-gray-50 text-gray-600'
                            }`}
                          >
                            {ticket.status}
                          </span>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChatModal(ticket);
                            }}
                            size="sm"
                          >
                            {['RESOLVED', 'CLOSED'].includes(ticket.status)
                              ? 'View Chat'
                              : 'Action'}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {hasNextPage && (
                  <div className="mt-3 flex justify-center">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      variant="outline"
                      size="sm"
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}

                <TicketModal
                  isOpen={isTicketModalOpen}
                  onOpenChange={setIsTicketModalOpen}
                  mode={modalMode}
                  ticketForm={ticketForm}
                  setTicketForm={setTicketForm}
                  onSubmit={handleTicketFormSubmit}
                  onDelete={() => {
                    setCreatedTickets((prev) =>
                      prev.filter((t) => (t.id || t._id) !== selectedTicketId),
                    );
                    setIsTicketModalOpen(false);
                  }}
                  targetType="vendor"
                  targetDetails={vendorDetails}
                  targetName={
                    vendorDetails?.vendor?.name ||
                    vendorDetails?.invitation?.userDetails?.name
                  }
                />

                <TicketChatModal
                  isOpen={isChatModalOpen}
                  onOpenChange={setIsChatModalOpen}
                  ticket={getTicketForChatModal(selectedChatTicket)}
                  onStatusChange={handleChatStatusChange}
                  onSendMessage={handleChatSendMessage}
                />
              </div>
            </TabsContent>
          </Tabs>
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
}
