'use client';

import { dashboardApis } from '@/api/dashboard/dashboardApi';
import { invitation } from '@/api/invitation/Invitation';
import {
  aggregateByMonth,
  formattedAmount,
  getTotalAndAverage,
} from '@/appUtils/helperFunctions';
import Container from '@/components/dashboard/Container';
import DataGranularity from '@/components/dashboard/DataGranularity';
import PendingInvitesModal from '@/components/Modals/PendingInvitesModal';
import DateRange from '@/components/ui/DateRange';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import LineCharts from '@/components/ui/LineCharts';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import { useAuth } from '@/context/AuthContext';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import {
  getPurchaseAnalytics,
  getSalesAnalytics,
} from '@/services/Dashboard_Services/DashboardServices';
import { getReceivedInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// data for lines Linechart
// const dataMonthBasis = [
//   { month: 'Jan', sales: 400 },
//   { month: 'Feb', sales: 420 },
//   { month: 'Mar', sales: 450 },
//   { month: 'Apr', sales: 470 },
//   { month: 'May', sales: 500 },
//   { month: 'Jun', sales: 600 },
//   { month: 'Jul', sales: 700 },
//   { month: 'Aug', sales: 300 },
//   { month: 'Sep', sales: 950 },
//   { month: 'Oct', sales: 950 },
//   { month: 'Nov', sales: 950 },
//   { month: 'Dec', sales: 950 },
// ];
// const dataWeekBasis = [
//   { day: 'Mon', sales: 100 },
//   { day: 'Tue', sales: 150 },
//   { day: 'Wed', sales: 250 },
//   { day: 'Thurs', sales: 350 },
//   { day: 'Fri', sales: 450 },
//   { day: 'Sat', sales: 550 },
//   { day: 'Sun', sales: 650 },
// ];
// const dataYearBasis = [
//   { year: 2020, sales: 200 },
//   { year: 2021, sales: 350 },
// ];

// macros
const SalesLines = [
  { dataKey: 'sales', name: 'Sales', color: '#007bff' }, // Blue
];
const PurchaseLines = [
  { dataKey: 'purchase', name: 'Purchase', color: '#F8BA05' }, // Yellow
];

export default function Home() {
  const translations = useTranslations('dashboard');

  // next-intl supports only object keys, not arrays. Use object keys for subItems.
  const keys = [
    'dashboard.emptyStateComponent.subItems.subItem1',
    'dashboard.emptyStateComponent.subItems.subItem2',
    'dashboard.emptyStateComponent.subItems.subItem3',
    'dashboard.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const router = useRouter();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [salestab, setSalesTab] = useState('totalAmount');
  const [purchaseTab, setPurchaseTab] = useState('totalAmount');
  const startDate = new Date('2024/03/01');
  const toDate = new Date();
  const [salesDateRange, setSalesDateRange] = useState([startDate, toDate]);
  const [purchaseDateRange, setPurchaseDateRange] = useState([
    startDate,
    toDate,
  ]);
  const [salesDataGranularity, setSalesDataGranularity] = useState('weekly');
  const [purchaseDataGranularity, setPurchaseDataGranularity] =
    useState('weekly');

  const onSalesTabChange = (value) => {
    setSalesTab(value);
  };
  const onPurchaseTabChange = (value) => {
    setPurchaseTab(value);
  };

  // fetch data analytics
  // sales
  const { data: salesAnalyticsData, isLoading: isSalesAnalyticsLoading } =
    useQuery({
      queryKey: [
        dashboardApis.getSalesAnalysis.endpointKey,
        salesDataGranularity,
      ],
      queryFn: () =>
        getSalesAnalytics({
          fromDate: moment(salesDateRange[0]).format('YYYY-MM-DD'),
          toDate: moment(salesDateRange[1]).format('YYYY-MM-DD'),
          salesDataGranularity,
          filterType: 'DATE_RANGE', // 'DATE_RANGE' | 'MONTHLY' | 'YEARLY'
        }),
      select: (data) => data.data.data,
      enabled:
        Array.isArray(salesDateRange) &&
        salesDateRange[0] !== null &&
        salesDateRange[1] !== null,
    });
  const dataMonthBasis = aggregateByMonth(
    salesAnalyticsData,
    salestab,
    SalesLines[0].dataKey,
  );
  const { total: totalSalesAmount, average: averageSalesAmount } =
    getTotalAndAverage(dataMonthBasis, 'sales');

  // purchase
  const { data: purchaseAnalyticsData, isLoading: isPurchaseAnalyticsLoading } =
    useQuery({
      queryKey: [
        dashboardApis.getPurchaseAnalysis.endpointKey,
        purchaseDataGranularity,
      ],
      queryFn: () =>
        getPurchaseAnalytics({
          fromDate: moment(purchaseDateRange[0]).format('YYYY-MM-DD'),
          toDate: moment(purchaseDateRange[1]).format('YYYY-MM-DD'),
          purchaseDataGranularity,
          filterType: 'DATE_RANGE', // 'DATE_RANGE' | 'MONTHLY' | 'YEARLY'
        }),
      select: (data) => data.data.data,
      enabled:
        Array.isArray(purchaseDateRange) &&
        purchaseDateRange[0] !== null &&
        purchaseDateRange[1] !== null,
    });
  const dataMonthBasisPurchase = aggregateByMonth(
    purchaseAnalyticsData,
    purchaseTab,
    PurchaseLines[0].dataKey,
  );
  const { total: totalPurchaseAmount, average: averagePurchaseAmount } =
    getTotalAndAverage(dataMonthBasisPurchase, 'purchase');

  // fetch received invitations
  const { data: receivedInviteData = [], isLoading: isReceivedInviteLoading } =
    useQuery({
      queryKey: [invitation.getReceivedInvitation.endpointKey],
      queryFn: () => getReceivedInvitation(),
      select: (data) => data.data.data,
      enabled:
        !!enterpriseId &&
        isEnterpriseOnboardingComplete &&
        hasPermission('permission:view-dashboard'),
    });

  const ReceivedformattedData = receivedInviteData?.map((user) => ({
    ...user.enterprise,
    type: user.invitation.invitationType,
    id: user.invitation.id,
    status: user.status,
  }));

  const filteredData = ReceivedformattedData.filter(
    (data) => data.status === 'PENDING',
  );

  if (!permissions || permissions.length === 0) {
    return null; // or <Loading />
  }

  if (!hasPermission('permission:view-dashboard')) {
    router.replace('/unauthorized');
    return null;
  }

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      <div className="flex h-full flex-col gap-5">
        <SubHeader name={translations('title')}></SubHeader>

        {/* Invitation table */}
        {enterpriseId &&
          isEnterpriseOnboardingComplete &&
          isReceivedInviteLoading && <Loading />}
        {enterpriseId &&
          isEnterpriseOnboardingComplete &&
          !isReceivedInviteLoading &&
          filteredData?.length > 0 && (
            <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                {`${translations('invites.prompt', { count: filteredData?.length })} ${translations('invites.actionPrompt')}`}
              </span>
              <PendingInvitesModal
                ctaName={'dashboard.invites.viewInvitesText'}
                invitesTitle={'dashboard.invites.invitesTitle'}
                invitesDetails={'dashboard.invites.invitesDetails'}
                acceptCtaName={'dashboard.invites.handleAcceptCta'}
                rejectCtaName={'dashboard.invites.handleRejectCta'}
                acceptedMsg={'dashboard.invites.messages.accept'}
                rejectedMsg={'dashboard.invites.messages.reject'}
                data={filteredData}
                isInviteModalOpen={isInviteModalOpen}
                setIsInviteModalOpen={setIsInviteModalOpen}
              />
            </div>
          )}

        {enterpriseId && isEnterpriseOnboardingComplete && (
          <>
            {isSalesAnalyticsLoading || isPurchaseAnalyticsLoading ? (
              <Loading />
            ) : salesAnalyticsData?.length === 0 &&
              purchaseAnalyticsData?.length === 0 ? (
              <EmptyStageComponent
                heading={translations('emptyStateComponent.heading')}
                subItems={keys}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Container
                  title="Sales"
                  granularityComp={
                    <DataGranularity
                      dataGranualarityType={salesDataGranularity}
                      setDataGranularityType={setSalesDataGranularity}
                    />
                  }
                  dateRangeComp={
                    <DateRange
                      dateRange={salesDateRange}
                      setDateRange={setSalesDateRange}
                    />
                  }
                >
                  <Tabs
                    value={salestab}
                    onValueChange={onSalesTabChange}
                    defaultValue="totalAmount"
                  >
                    <TabsList className="border">
                      {[
                        { value: 'totalAmount', label: 'Receipts' },
                        { value: 'totalDue', label: 'Receivables' },
                        { value: 'totalOverdue', label: 'Overdue' },
                      ].map(({ value, label }) => (
                        <TabsTrigger
                          key={value}
                          className={`w-24 ${salestab === value ? 'shadow-customShadow' : ''}`}
                          value={value}
                        >
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <section className="mt-4 flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">Total Receipts</span>
                        <span className="font-semibold">
                          {formattedAmount(totalSalesAmount)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">Average Receipts</span>
                        <span className="font-semibold">
                          {formattedAmount(averageSalesAmount)}
                        </span>
                        <span className="text-sm">per month</span>
                      </div>
                    </section>
                    <TabsContent
                      value="totalAmount"
                      className="scrollBarStyles overflow-x-auto"
                    >
                      <div className="min-w-[500px] pr-4">
                        <LineCharts
                          data={dataMonthBasis}
                          lines={SalesLines}
                          xAxisKey="month"
                          height={300}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="totalDue"
                      className="scrollBarStyles overflow-x-auto"
                    >
                      <div className="min-w-[500px] pr-4">
                        <LineCharts
                          data={dataMonthBasis}
                          lines={SalesLines}
                          xAxisKey="month"
                          height={300}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="totalOverdue"
                      className="scrollBarStyles overflow-x-auto"
                    >
                      <div className="min-w-[500px] pr-4">
                        <LineCharts
                          data={dataMonthBasis}
                          lines={SalesLines}
                          xAxisKey="month"
                          height={300}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </Container>

                <Container
                  title="Purchase"
                  granularityComp={
                    <DataGranularity
                      dataGranualarityType={purchaseDataGranularity}
                      setDataGranularityType={setPurchaseDataGranularity}
                    />
                  }
                  dateRangeComp={
                    <DateRange
                      dateRange={purchaseDateRange}
                      setDateRange={setPurchaseDateRange}
                    />
                  }
                >
                  <Tabs
                    value={purchaseTab}
                    onValueChange={onPurchaseTabChange}
                    defaultValue="totalAmount"
                  >
                    <TabsList className="border">
                      {[
                        { value: 'totalAmount', label: 'Receipts' },
                        { value: 'totalDue', label: 'Receivables' },
                        { value: 'totalOverdue', label: 'Overdue' },
                      ].map(({ value, label }) => (
                        <TabsTrigger
                          key={value}
                          className={`w-24 ${purchaseTab === value ? 'shadow-customShadow' : ''}`}
                          value={value}
                        >
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <section className="mt-4 flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">Total Purchases</span>
                        <span className="font-semibold">
                          {formattedAmount(totalPurchaseAmount)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">Average Purchases</span>
                        <span className="font-semibold">
                          {formattedAmount(averagePurchaseAmount)}
                        </span>
                        <span className="text-sm">per month</span>
                      </div>
                    </section>
                    <TabsContent
                      value="totalAmount"
                      className="scrollBarStyles overflow-x-auto"
                    >
                      <div className="min-w-[500px] pr-4">
                        <LineCharts
                          data={dataMonthBasisPurchase}
                          lines={PurchaseLines}
                          xAxisKey="month"
                          height={300}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="totalDue"
                      className="scrollBarStyles overflow-x-auto"
                    >
                      <div className="min-w-[500px] pr-4">
                        <LineCharts
                          data={dataMonthBasisPurchase}
                          lines={PurchaseLines}
                          xAxisKey="month"
                          height={300}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="totalOverdue"
                      className="scrollBarStyles overflow-x-auto"
                    >
                      <div className="min-w-[500px] pr-4">
                        <LineCharts
                          data={dataMonthBasisPurchase}
                          lines={PurchaseLines}
                          xAxisKey="month"
                          height={300}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </Container>
              </div>
            )}
          </>
        )}

        {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
          <RestrictedComponent />
        )}
      </div>
    </ProtectedWrapper>
  );
}
