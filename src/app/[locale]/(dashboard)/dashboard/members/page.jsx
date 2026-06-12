'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import ActionsDropdown from '@/components/deliveryManagement/ActionsDropdown';
import AddInternalMemberModal from '@/components/membersInvite/AddInternalMemberModal';
import CreateExternalMemberModal from '@/components/membersInvite/CreateExternalMemberModal';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService } from '@/lib/utils';
import { getAllAssociateMembers } from '@/services/Associate_Members_Services/AssociateMembersServices';
import { useQuery } from '@tanstack/react-query';
import { Plus, UserPlus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useInviteeMembersColumns } from './useInviteeMembersColumns';

const MembersPage = () => {
  useMetaData('Hues! - Members', 'HUES MEMBERS'); // dynamic title

  const router = useRouter();
  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const translation = useTranslations('members');
  const { hasPermission } = usePermission();
  const [isMemberEditing, setIsMemberEditing] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddInternalOpen, setIsAddInternalOpen] = useState(false);
  const [isCreateExternalOpen, setIsCreateExternalOpen] = useState(false);

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

  const handleRowClick = (member) => {
    router.push(`/dashboard/members/${member.id}`);
  };

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
          <AddInternalMemberModal
            isOpen={isAddInternalOpen}
            setIsOpen={setIsAddInternalOpen}
          />

          <CreateExternalMemberModal
            isOpen={isCreateExternalOpen}
            setIsOpen={setIsCreateExternalOpen}
          />

          {selectedMember &&
          selectedMember.membershipType === 'EXTERNAL_MEMBER' ? (
            <CreateExternalMemberModal
              isOpen={isMemberEditing}
              setIsOpen={setIsMemberEditing}
              membersInfo={selectedMember}
              isEditMode={true}
            />
          ) : selectedMember ? (
            <AddInternalMemberModal
              isOpen={isMemberEditing}
              setIsOpen={setIsMemberEditing}
              membersInfo={selectedMember}
              isEditMode={true}
            />
          ) : null}

          <>
            <SubHeader name={translation('header')} className="z-10 bg-white">
              <div className="flex items-center justify-center gap-2">
                <ProtectedWrapper permissionCode={'permission:members-create'}>
                  <ActionsDropdown
                    label={'Invite Members'}
                    actions={[
                      {
                        key: 'invite-internal',
                        label: 'Add Internal Member',
                        icon: UserPlus,
                        onClick: () => setIsAddInternalOpen(true),
                      },
                      {
                        key: 'invite-external',
                        label: 'Add External Member',
                        icon: Plus,
                        onClick: () => setIsCreateExternalOpen(true),
                      },
                    ]}
                  />
                </ProtectedWrapper>
              </div>
            </SubHeader>

            {isLoading && <Loading />}

            {!isLoading && membersList?.length > 0 && (
              <DataTable
                columns={inviteeMembersColumns}
                data={membersList}
                onRowClick={handleRowClick}
              />
            )}

            {!isLoading && membersList?.length === 0 && (
              <div className="flex h-[50rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                <Users size={28} />
                <p className="font-bold">{translation('empty.title')}</p>
                <p className="max-w-96 text-center">
                  {translation('empty.description')}
                </p>
                <ProtectedWrapper
                  permissionCode={'permission:members-create'}
                ></ProtectedWrapper>
              </div>
            )}
          </>
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default MembersPage;
