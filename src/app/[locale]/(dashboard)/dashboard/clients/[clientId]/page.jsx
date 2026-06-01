'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import {
  capitalize,
  formatValue,
  formattedAmount,
} from '@/appUtils/helperFunctions';
import InfoBanner from '@/components/auth/InfoBanner';
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
  getClient,
  getClientLedger,
} from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useLedgerColumns } from './columns/useLedgerColumns';
import { useDocumentsColumns } from './columns/useDocumentsColumns';
import { useAuthorizedPersonColumns } from './columns/useAuthorizedPersonsColumns';

export default function ClientDetailsPage() {
  const { clientId } = useParams();
  const { hasPermission } = usePermission();
  const translations = useTranslations('client.clientDetails');

  const [tab, setTab] = useState('overview');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    category: '',
    description: '',
    transaction: '',
    status: 'Open',
  });
  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: 'Invoice discrepancy',
      category: 'Payment',
      description:
        'The amount on invoice INV-001 does not match the payment advice.',
      transaction: 'INV-001',
      date: 'Mar 10, 2024',
      status: 'Open',
    },
    {
      id: 2,
      title: 'Delivery delay inquiry',
      category: 'Delivery',
      description: 'Shipment has been delayed at the transit hub for 2 days.',
      transaction: '',
      date: 'Feb 25, 2024',
      status: 'Resolved',
    },
  ]);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const clientBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/clients',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/clients/${clientId}`,
      show: true, // Always show
    },
  ];

  // api calling for clientDetails
  const {
    isLoading,
    data: clientDetails,
    error,
  } = useQuery({
    queryKey: [clientEnterprise.getClient.endpointKey, clientId],
    queryFn: () => getClient(clientId),
    select: (data) => data.data.data,
    enabled: hasPermission('permission:clients-view'),
    retry: (failureCount, error) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  // api calling for clientLedger
  const {
    isLoading: isLedgerLoading,
    data: ledgerData,
    error: ledgerError,
  } = useQuery({
    queryKey: [clientEnterprise.getClientLedger.endpointKey, clientId],
    queryFn: () => getClientLedger({ clientId }),
    select: (data) => data.data.data,
    enabled: tab === 'ledger' && hasPermission('permission:clients-view'),
    retry: (failureCount, error) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  const handleOpenCreateModal = () => {
    setSelectedTicketId(null);
    setTicketForm({
      title: '',
      category: '',
      description: '',
      transaction: '',
      status: 'Open',
    });
    setModalMode('create');
    setIsTicketModalOpen(true);
  };

  const handleOpenEditModal = (ticket) => {
    setSelectedTicketId(ticket.id);
    setTicketForm({
      title: ticket.title,
      category: ticket.category,
      description: ticket.description || '',
      transaction: ticket.transaction || '',
      status: ticket.status || 'Open',
    });
    setModalMode('edit');
    setIsTicketModalOpen(true);
  };

  const handleTicketFormSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.title.trim() || !ticketForm.category) return;

    if (modalMode === 'create') {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const newTicket = {
        id: Date.now(),
        title: ticketForm.title,
        category: ticketForm.category,
        description: ticketForm.description,
        transaction: ticketForm.transaction,
        date: formattedDate,
        status: 'Open',
      };
      setTickets([newTicket, ...tickets]);
    } else {
      setTickets(
        tickets.map((t) =>
          t.id === selectedTicketId
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
    }

    setIsTicketModalOpen(false);
  };

  const documentRows = React.useMemo(
    () => [
      {
        directorName: formatValue(
          clientDetails?.client?.type === 'proprietorship'
            ? clientDetails?.client?.name ||
                clientDetails?.invitation?.userDetails?.name
            : clientDetails?.client?.director?.name,
        ),
        directorNumber: formatValue(
          clientDetails?.client?.type === 'proprietorship'
            ? clientDetails?.client?.mobileNumber ||
                clientDetails?.invitation?.userDetails?.mobileNumber
            : clientDetails?.client?.director?.mobileNumber,
        ),
        pan: formatValue(
          clientDetails?.client?.panNumber ||
            clientDetails?.invitation?.userDetails?.panNumber,
        ),
        gst: formatValue(
          clientDetails?.client?.gstNumber ||
            clientDetails?.invitation?.userDetails?.gstNumber,
        ),
        cin: formatValue(
          clientDetails?.client?.cin ||
            clientDetails?.invitation?.userDetails?.cin,
        ),
        udyam: formatValue(
          clientDetails?.client?.udyam ||
            clientDetails?.invitation?.userDetails?.udyam,
        ),
      },
    ],
    [clientDetails],
  );
  const authorizedPersonsColumns = useAuthorizedPersonColumns({ translations });
  const documentColumns = useDocumentsColumns({ translations });
  const ledgerColumns = useLedgerColumns();

  if (isLoading || (!clientDetails && error?.response?.status !== 403)) {
    return <p className="p-6 text-gray-500">Loading enterprise details...</p>;
  }

  return (
    <ProtectedWrapper permissionCode={'permission:clients-view'}>
      {error?.response?.status === 403 ? (
        <AccessDenied />
      ) : (
        <Wrapper className="h-full py-2">
          {/* headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex gap-2">
              {/* breadcrumbs */}
              <OrderBreadCrumbs possiblePagesBreadcrumbs={clientBreadCrumbs} />
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
                <TabsTrigger value="authorized">
                  {translations('tabs.tab3.title', {
                    defaultValue: 'Authorized Persons',
                  })}
                </TabsTrigger>
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
                    clientDetails?.client?.name ||
                      clientDetails?.invitation?.userDetails?.name,
                  ),
                  enterpriseType: capitalize(
                    clientDetails?.client?.type ||
                      clientDetails?.invitation?.userDetails?.type,
                  ),
                  email: formatValue(
                    clientDetails?.client?.email ||
                      clientDetails?.invitation?.userDetails?.email,
                  ),
                  phone: formatValue(
                    `+91 ${
                      clientDetails?.client?.mobileNumber ||
                      clientDetails?.invitation?.userDetails?.mobileNumber
                    }`,
                  ),
                  address: formatValue(clientDetails?.address?.address),
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
                {clientDetails?.metaData?.authorizedPerson &&
                clientDetails.metaData.authorizedPerson.length > 0 ? (
                  <DataTable
                    columns={authorizedPersonsColumns}
                    data={clientDetails?.metaData?.authorizedPerson || []}
                  />
                ) : (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 text-center text-sm text-gray-500">
                    No authorized persons found for this client.
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
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleOpenEditModal(ticket)}
                      className="border-gray-150 flex cursor-pointer items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="rounded-lg bg-gray-50 p-2.5 text-gray-500">
                          <MessageSquare size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold leading-snug text-gray-800">
                            {ticket.title}
                          </h3>
                          <p className="mt-0.5 font-sans text-xs font-medium text-gray-500">
                            {ticket.category} • {ticket.date}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                          ticket.status === 'Open'
                            ? 'border-amber-200/50 bg-amber-50 text-amber-600'
                            : 'border-emerald-200/50 bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>

                <TicketModal
                  isOpen={isTicketModalOpen}
                  onOpenChange={setIsTicketModalOpen}
                  mode={modalMode}
                  ticketForm={ticketForm}
                  setTicketForm={setTicketForm}
                  onSubmit={handleTicketFormSubmit}
                  onDelete={() => {
                    setTickets(
                      tickets.filter((t) => t.id !== selectedTicketId),
                    );
                    setIsTicketModalOpen(false);
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
}
