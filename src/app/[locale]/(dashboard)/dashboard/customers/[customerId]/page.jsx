'use client';

import { customerApis } from '@/api/enterprises_user/customers/customersApi';
import {
  capitalize,
  formatValue,
  formattedAmount,
} from '@/appUtils/helperFunctions';
import InfoBanner from '@/components/auth/InfoBanner';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import AccessDenied from '@/components/shared/AccessDenied';
import { DataTable } from '@/components/table/data-table';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import {
  getCustomer,
  getCustomerLedger,
} from '@/services/Enterprises_Users_Service/Customer_Services/Customer_Services';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useLedgerColumns } from './columns/useLedgerColumns';

export default function CustomerDetailsPage() {
  const { customerId } = useParams();
  const { hasPermission } = usePermission();
  const translations = useTranslations('customer.customerDetails');
  const [tab, setTab] = useState('overview');

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const customerBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/customers',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/customers/${customerId}`,
      show: true, // Always show
    },
  ];

  // api calling for customerDetails
  const {
    isLoading,
    data: customerDetails,
    error,
  } = useQuery({
    queryKey: [customerApis.getCustomer.endpointKey, customerId],
    queryFn: () => getCustomer(customerId),
    select: (data) => data.data.data,
    enabled: hasPermission('permission:customers-view'),
    retry: (failureCount, error) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  // api calling for customerLedger
  const {
    isLoading: isLedgerLoading,
    data: ledgerData,
    error: ledgerError,
  } = useQuery({
    queryKey: [customerApis.getCustomerLedger.endpointKey, customerId],
    queryFn: () => getCustomerLedger({ customerId }),
    select: (data) => data.data.data,
    enabled: tab === 'ledger' && hasPermission('permission:customers-view'),
    retry: (failureCount, error) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  const ledgerColumns = useLedgerColumns();

  if (isLoading || (!customerDetails && error?.response?.status !== 403)) {
    return <p className="p-6 text-gray-500">Loading customer details...</p>;
  }

  return (
    <ProtectedWrapper permissionCode={'permission:customers-view'}>
      {error?.response?.status === 403 ? (
        <AccessDenied />
      ) : (
        <Wrapper className="h-full py-2">
          {/* headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex gap-2">
              {/* breadcrumbs */}
              <OrderBreadCrumbs
                possiblePagesBreadcrumbs={customerBreadCrumbs}
              />
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
                <TabsTrigger value="ledger" className="flex items-center gap-2">
                  Ledger
                </TabsTrigger>
              </TabsList>
            </section>
            <TabsContent value="overview">
              <Overview
                data={{
                  name: formatValue(
                    customerDetails?.customer?.name ||
                      customerDetails?.invitation?.userDetails?.name ||
                      customerDetails?.name ||
                      '-',
                  ),
                  enterpriseType: capitalize(
                    customerDetails?.customer?.type ||
                      customerDetails?.invitation?.userDetails?.type ||
                      customerDetails?.type ||
                      '-',
                  ),
                  email: formatValue(
                    customerDetails?.customer?.email ||
                      customerDetails?.invitation?.userDetails?.email ||
                      customerDetails?.email ||
                      '-',
                  ),
                  phone: formatValue(
                    `+91 ${
                      customerDetails?.customer?.mobileNumber ||
                      customerDetails?.invitation?.userDetails?.mobileNumber ||
                      customerDetails?.mobileNumber ||
                      '--'
                    }`.trim(),
                  ),
                  address: formatValue(
                    customerDetails?.address?.address ||
                      customerDetails?.address ||
                      '-',
                  ),
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
          </Tabs>
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
}
