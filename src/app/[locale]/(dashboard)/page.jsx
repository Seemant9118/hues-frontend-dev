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
import { useTranslations } from 'next-intl';
import { useState } from 'react';

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
  const isKycVerified = LocalStorageService.get('isKycVerified');
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
    type: user.invitation.invitationType,
    id: user.invitation.id,
    status: user.status,
  }));

  const filteredData = ReceivedformattedData.filter(
    (data) => data.status === 'PENDING',
  );

  return (
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

      {enterpriseId && isEnterpriseOnboardingComplete && isKycVerified && (
        <EmptyStageComponent
          heading={translations('emptyStateComponent.heading')}
          subItems={keys}
        />
      )}

      {(!enterpriseId || !isEnterpriseOnboardingComplete || !isKycVerified) && (
        <RestrictedComponent />
      )}
    </div>
  );
}
