'use client';

import { invitation } from '@/api/invitation/Invitation';
import PendingInvitesModal from '@/components/Modals/PendingInvitesModal';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { LocalStorageService } from '@/lib/utils';
import { getReceivedInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  // get received invitations
  const { data: receivedInviteData = [], isLoading: isReceivedInviteLoading } =
    useQuery({
      queryKey: [invitation.getReceivedInvitation.endpointKey],
      queryFn: () => getReceivedInvitation(),
      select: (data) => data.data.data,
      enabled: !!enterpriseId && isEnterpriseOnboardingComplete,
    });

  const ReceivedformattedData = receivedInviteData?.map((user) => ({
    ...user.enterprise,
    id: user.invitation.id,
    status: user.status,
  }));

  const filteredData = ReceivedformattedData.filter(
    (data) => data.status === 'PENDING',
  );

  const dashBoardEmptyStagedata = {
    heading:
      'Seamlessly monitor financial health and compliance with an integrated, real-time dashboard',
    subHeading: 'Features',
    subItems: [
      {
        id: 1,
        subItemtitle:
          'Safely integrate data with secure login and automatic API access.',
      },
      {
        id: 2,
        subItemtitle:
          'Access real-time financial status for strategic decision-making',
      },
      {
        id: 3,
        subItemtitle:
          'Ensure regulatory compliance with automatic notification monitoring.',
      },
      {
        id: 4,
        subItemtitle:
          'Inform strategies with comprehensive dashboard data for competitive edge',
      },
    ],
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <SubHeader name={'Dashboard'}></SubHeader>

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
              You have {filteredData?.length} invites pending. Please take
              action
            </span>
            <PendingInvitesModal
              data={filteredData}
              isInviteModalOpen={isInviteModalOpen}
              setIsInviteModalOpen={setIsInviteModalOpen}
            />
          </div>
        )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <EmptyStageComponent
          heading={dashBoardEmptyStagedata.heading}
          subHeading={dashBoardEmptyStagedata.subHeading}
          subItems={dashBoardEmptyStagedata.subItems}
        />
      )}

      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <RestrictedComponent />
      )}
    </div>
  );
}
