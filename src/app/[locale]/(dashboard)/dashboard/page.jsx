'use client';

import { invitation } from '@/api/invitation/Invitation';
import Container from '@/components/dashboard/Container';
import PendingInvitesModal from '@/components/Modals/PendingInvitesModal';
import LineCharts from '@/components/ui/LineCharts';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import { useAuth } from '@/context/AuthContext';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import { getReceivedInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// data for lines Linechart
const dataMonthBasis = [
  { month: 'Jan', sales: 400 },
  { month: 'Feb', sales: 420 },
  { month: 'Mar', sales: 450 },
  { month: 'Apr', sales: 470 },
  { month: 'May', sales: 500 },
  { month: 'Jun', sales: 600 },
  { month: 'Jul', sales: 700 },
  { month: 'Aug', sales: 300 },
  { month: 'Sep', sales: 950 },
  { month: 'Oct', sales: 950 },
  { month: 'Nov', sales: 950 },
  { month: 'Dec', sales: 950 },
];
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
const INVITATION_LINES = [
  { dataKey: 'sales', name: 'Sales', color: '#007bff' }, // Blue
];

export default function Home() {
  const translations = useTranslations('dashboard');

  // next-intl supports only object keys, not arrays. Use object keys for subItems.
  // const keys = [
  //   'dashboard.emptyStateComponent.subItems.subItem1',
  //   'dashboard.emptyStateComponent.subItems.subItem2',
  //   'dashboard.emptyStateComponent.subItems.subItem3',
  //   'dashboard.emptyStateComponent.subItems.subItem4',
  // ];

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const router = useRouter();
  const [tab, setTab] = useState('receipts');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const onTabChange = (value) => {
    setTab(value);
  };

  // get received invitations
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
          // <EmptyStageComponent
          //   heading={translations('emptyStateComponent.heading')}
          //   subItems={keys}
          // />
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <Container title="Sales">
              <Tabs
                value={tab}
                onValueChange={onTabChange}
                defaultValue="receipts"
              >
                <TabsList className="border">
                  {[
                    { value: 'receipts', label: 'Receipts' },
                    { value: 'receivables', label: 'Receivables' },
                    { value: 'overdue', label: 'Overdue' },
                  ].map(({ value, label }) => (
                    <TabsTrigger
                      key={value}
                      className={`w-24 ${tab === value ? 'shadow-customShadow' : ''}`}
                      value={value}
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <section className="mt-2 flex gap-40 p-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">Total Receipts</span>
                    <span className="font-semibold">₹5,276.33</span>
                    <span className="text-sm text-red-500">-11.3%</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">Average Receipts</span>
                    <span className="font-semibold">₹5,276.33</span>
                    <span className="text-sm">per month</span>
                  </div>
                </section>

                <TabsContent value="receipts">
                  <LineCharts
                    data={dataMonthBasis}
                    lines={INVITATION_LINES}
                    xAxisKey="month"
                    width={600}
                    height={300}
                  />
                </TabsContent>

                <TabsContent value="receivables">
                  <LineCharts
                    data={dataMonthBasis}
                    lines={INVITATION_LINES}
                    xAxisKey="month"
                    width={600}
                    height={300}
                  />
                </TabsContent>

                <TabsContent value="overdue">
                  <LineCharts
                    data={dataMonthBasis}
                    lines={INVITATION_LINES}
                    xAxisKey="month"
                    width={600}
                    height={300}
                  />
                </TabsContent>
              </Tabs>
            </Container>
          </div>
        )}

        {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
          <RestrictedComponent />
        )}
      </div>
    </ProtectedWrapper>
  );
}
