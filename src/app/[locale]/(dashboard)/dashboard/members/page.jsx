'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import MemberInviteModal from '@/components/membersInvite/MemberInviteModal';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import { getAllAssociateMembers } from '@/services/Associate_Members_Services/AssociateMembersServices';
import { useQuery } from '@tanstack/react-query';
import { Upload, UserPlus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useInviteeMembersColumns } from './useInviteeMembersColumns';

const MembersPage = () => {
  useMetaData('Hues! - Members', 'HUES MEMBERS'); // dynamic title

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const translation = useTranslations('members');
  const { hasPermission } = usePermission();
  const [isInvitingMembers, setIsInvitingMembers] = useState(false);
  const [isMemberEditing, setIsMemberEditing] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const { data: membersList, isLoading } = useQuery({
    queryKey: [
      associateMemberApi.getAllAssociateMembers.endpointKey,
      enterpriseId,
    ],
    queryFn: () => getAllAssociateMembers(enterpriseId),
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          translation('errors.fetchFailed') ||
          'Failed to fetch members list',
      );
    },
    select: (membersList) => membersList.data.data,
    enabled: hasPermission('permission:members-view'),
  });

  const inviteeMembersColumns = useInviteeMembersColumns(
    translation,
    setIsMemberEditing,
    setSelectedMember,
    enterpriseId,
  );

  return (
    <ProtectedWrapper permissionCode={'permission:members-view'}>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translation('header')} />
          <RestrictedComponent />
        </>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <Wrapper className="h-screen">
          <SubHeader name={translation('header')} className="z-10 bg-white">
            <div className="flex items-center justify-center gap-2">
              <ProtectedWrapper permissionCode={'permission:members-create'}>
                <Button onClick={() => setIsInvitingMembers(true)} size="sm">
                  <UserPlus size={16} />
                  {'Invite Members'}
                </Button>
                <MemberInviteModal
                  isModalOpen={isInvitingMembers}
                  setIsModalOpen={setIsInvitingMembers}
                />
                {selectedMember && (
                  <MemberInviteModal
                    isModalOpen={isMemberEditing}
                    setIsModalOpen={setIsMemberEditing}
                    membersInfo={selectedMember}
                    isEditMode={true}
                  />
                )}
              </ProtectedWrapper>

              <Tooltips
                trigger={
                  <Button
                    variant="export"
                    onClick={() => {}}
                    disabled
                    size="sm"
                  >
                    <Upload size={16} />
                  </Button>
                }
                content={translation('exportTooltip')}
              />
            </div>
          </SubHeader>

          {isLoading && <Loading />}

          {!isLoading && membersList?.length > 0 && (
            <DataTable columns={inviteeMembersColumns} data={membersList} />
          )}

          {!isLoading && membersList?.length === 0 && (
            <div className="flex h-[50rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
              <Users size={28} />
              <p className="font-bold">{translation('empty.title')}</p>
              <p className="max-w-96 text-center">
                {translation('empty.description')}
              </p>
              <ProtectedWrapper permissionCode={'permission:members-create'}>
                <MemberInviteModal />
              </ProtectedWrapper>
            </div>
          )}
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default MembersPage;
