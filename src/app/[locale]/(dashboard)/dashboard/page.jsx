'use client';

import { dashboardApis } from '@/api/dashboard/dashboardApi';
import { invitation } from '@/api/invitation/Invitation';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import InfoBanner from '@/components/auth/InfoBanner';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import PendingInvitesModal from '@/components/Modals/PendingInvitesModal';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import {
  getPurchaseAnalytics,
  getSalesAnalytics,
} from '@/services/Dashboard_Services/DashboardServices';
import { getReceivedInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const summaryMapper = (summary) => ({
  totalAmount: {
    total: Number(summary?.amountReceived ?? summary?.amountPaid ?? 0),
    average: Number(
      summary?.averageAmountReceived ?? summary?.averageAmountPaid ?? 0,
    ),
  },
  totalDue: {
    total: Number(summary?.totalDue ?? 0),
    average: Number(summary?.averageDue ?? 0),
  },
  totalOverdue: {
    total: Number(summary?.totalOverdue ?? 0),
    average: Number(summary?.averageOverdue ?? 0),
  },
});

export default function Home() {
  const translations = useTranslations('dashboard');

  // next-intl supports only object keys, not arrays. Use object keys for subItems.
  const keys = [
    'dashboard.emptyStateComponent.subItems.subItem1',
    'dashboard.emptyStateComponent.subItems.subItem2',
    'dashboard.emptyStateComponent.subItems.subItem3',
    'dashboard.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = getEnterpriseId();
  const isSwitched = Boolean(LocalStorageService.get('switchedEnterpriseId'));
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const router = useRouter();
  const { hasPermission } = usePermission();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [salestab, setSalesTab] = useState('totalAmount');
  const [purchaseTab, setPurchaseTab] = useState('totalAmount');
  const [salesDataGranularity, setSalesDataGranularity] = useState('DAILY');
  const [purchaseDataGranularity, setPurchaseDataGranularity] =
    useState('DAILY');
  const fromDate = new Date('2025/04/01');
  const toDate = new Date();
  const [salesDateRange, setSalesDateRange] = useState([fromDate, toDate]);
  const [purchaseDateRange, setPurchaseDateRange] = useState([
    fromDate,
    toDate,
  ]);

  const SalesLines = [
    {
      dataKey: 'sales',
      name: translations('analytics.bar-lines.sales'),
      color: '#007bff',
    }, // Blue
  ];
  const PurchaseLines = [
    {
      dataKey: 'purchase',
      name: translations('analytics.bar-lines.purchase'),
      color: '#F8BA05',
    }, // Yellow
  ];
  const tabConfigs = {
    sales: [
      {
        value: 'totalAmount',
        label: translations('analytics.tabConfigs.sales.labels.receipts'),
      },
      {
        value: 'totalDue',
        label: translations('analytics.tabConfigs.sales.labels.receivables'),
      },
      {
        value: 'totalOverdue',
        label: translations('analytics.tabConfigs.sales.labels.overdue'),
      },
    ],
    purchase: [
      {
        value: 'totalAmount',
        label: translations('analytics.tabConfigs.purchase.labels.payments'),
      },
      {
        value: 'totalDue',
        label: translations('analytics.tabConfigs.purchase.labels.payable'),
      },
      {
        value: 'totalOverdue',
        label: translations('analytics.tabConfigs.purchase.labels.overdue'),
      },
    ],
  };

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
        salesDateRange,
      ],
      queryFn: () => getSalesAnalytics(salesDataGranularity, salesDateRange),
      select: (data) => data.data.data,
      enabled: hasPermission('permission:view-dashboard'),
    });

  const salesAmountPaidData = salesAnalyticsData?.data?.map((item) => ({
    label: item?.label,
    sales: Number(item?.amountReceived?.toFixed(2)),
  }));

  const salesTotalDueData = salesAnalyticsData?.data?.map((item) => ({
    label: item?.label,
    sales: Number(item?.totalDue?.toFixed(2)),
  }));

  const salesTotalOverdueData = salesAnalyticsData?.data?.map((item) => ({
    label: item?.label,
    sales: Number(item?.totalOverdue?.toFixed(2)),
  }));

  // purchase
  const { data: purchaseAnalyticsData, isLoading: isPurchaseAnalyticsLoading } =
    useQuery({
      queryKey: [
        dashboardApis.getPurchaseAnalysis.endpointKey,
        purchaseDataGranularity,
        purchaseDateRange,
      ],
      queryFn: () =>
        getPurchaseAnalytics(purchaseDataGranularity, purchaseDateRange),
      select: (data) => data.data.data,
      enabled: hasPermission('permission:view-dashboard'),
    });

  const purchaseAmountPaidData = purchaseAnalyticsData?.data?.map((item) => ({
    label: item?.label,
    purchase: Number(item?.amountPaid?.toFixed(2)),
  }));

  const purchaseTotalDueData = purchaseAnalyticsData?.data?.map((item) => ({
    label: item?.label,
    purchase: Number(item?.totalDue?.toFixed(2)),
  }));

  const purchaseTotalOverdueData = purchaseAnalyticsData?.data?.map((item) => ({
    label: item?.label,
    purchase: Number(item?.totalOverdue?.toFixed(2)),
  }));

  // fetch received invitations
  const { data: receivedInviteData = [], isLoading: isReceivedInviteLoading } =
    useQuery({
      queryKey: [invitation.getReceivedInvitation.endpointKey],
      queryFn: () => getReceivedInvitation(),
      select: (data) => data.data.data,
      enabled:
        !!enterpriseId &&
        isEnterpriseOnboardingComplete &&
        hasPermission('permission:view-dashboard') &&
        !isSwitched, // disable when switched to another enterprise
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

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      <div className="flex h-full flex-col gap-5">
        <SubHeader name={translations('title')}></SubHeader>

        {/* Banner */}
        <InfoBanner
          showSupportLink={false}
          text={
            <>
              Build your{' '}
              <span
                className="cursor-pointer font-semibold underline-offset-2 hover:underline"
                onClick={() => router.push('/dashboard/inventory/goods')}
              >
                Inventory
              </span>
              , add your{' '}
              <span
                className="cursor-pointer font-semibold underline-offset-2 hover:underline"
                onClick={() => router.push('/dashboard/clients')}
              >
                Clients
              </span>
              , and start your{' '}
              <span
                className="cursor-pointer font-semibold underline-offset-2 hover:underline"
                onClick={() => router.push('/dashboard/sales/sales-orders')}
              >
                Sales
              </span>
              —three quick steps to get Hues working for you.
            </>
          }
        />
        {/* Invitation modal */}
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
                {filteredData?.length === 1 ? (
                  <>
                    {translations('invites.prompt.one', {
                      count: filteredData?.length,
                    })}
                  </>
                ) : (
                  <>
                    {translations('invites.prompt.other', {
                      count: filteredData?.length,
                    })}
                  </>
                )}{' '}
                {translations('invites.actionPrompt')}
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

        {/* dashboard analytics */}
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
                <AnalyticsCard
                  title={translations('analytics.sales')}
                  tab={salestab}
                  onTabChange={onSalesTabChange}
                  dataGranularity={salesDataGranularity}
                  setDataGranularity={setSalesDataGranularity}
                  summary={summaryMapper(salesAnalyticsData?.summary)}
                  tabsConfig={tabConfigs.sales}
                  chartData={{
                    totalAmount: salesAmountPaidData,
                    totalDue: salesTotalDueData,
                    totalOverdue: salesTotalOverdueData,
                  }}
                  lines={SalesLines}
                  dateRange={salesDateRange}
                  setDateRange={setSalesDateRange}
                  translations={translations}
                />
                <AnalyticsCard
                  title={translations('analytics.purchase')}
                  tab={purchaseTab}
                  onTabChange={onPurchaseTabChange}
                  dataGranularity={purchaseDataGranularity}
                  setDataGranularity={setPurchaseDataGranularity}
                  summary={summaryMapper(purchaseAnalyticsData?.summary)}
                  tabsConfig={tabConfigs.purchase}
                  chartData={{
                    totalAmount: purchaseAmountPaidData,
                    totalDue: purchaseTotalDueData,
                    totalOverdue: purchaseTotalOverdueData,
                  }}
                  lines={PurchaseLines}
                  dateRange={purchaseDateRange}
                  setDateRange={setPurchaseDateRange}
                  translations={translations}
                />
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
