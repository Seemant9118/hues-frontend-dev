'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import Tooltips from '@/components/auth/Tooltips';
import MemberInviteModal from '@/components/membersInvite/MemberInviteModal';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useAuth } from '@/context/AuthContext';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import { getAllAssociateMembers } from '@/services/Associate_Members_Services/AssociateMembersServices';
import { useQuery } from '@tanstack/react-query';
import { Upload, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { useInviteeMembersColumns } from './useInviteeMembersColumns';

const MembersPage = () => {
  useMetaData('Hues! - Members', 'HUES MEMBERS'); // dynamic title
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const router = useRouter();

  const { data: membersList, isLoading } = useQuery({
    queryKey: [
      associateMemberApi.getAllAssociateMembers.endpointKey,
      enterpriseId,
    ],
    queryFn: () => getAllAssociateMembers(enterpriseId),
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          'Something went wrong while fetching data',
      );
    },
    select: (membersList) => membersList.data.data,
    enabled: hasPermission('permission:members-view'),
  });

  const inviteeMembersColumns = useInviteeMembersColumns();

  if (!permissions || permissions.length === 0) {
    return null; // or <Loading />
  }

  if (!hasPermission('permission:members-view')) {
    router.replace('/unauthorized');
    return null;
  }

  return (
    <ProtectedWrapper permissionCode={'permission:members-view'}>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name="Members" />
          <RestrictedComponent />
        </>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <Wrapper className="h-screen">
          <SubHeader name={'Members'} className="z-10 bg-white">
            <div className="flex items-center justify-center gap-4">
              <ProtectedWrapper permissionCode={'permission:members-create'}>
                <MemberInviteModal />
              </ProtectedWrapper>

              <Tooltips
                trigger={
                  <Button
                    variant="export"
                    onClick={() => {}}
                    className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                    size="sm"
                  >
                    <Upload size={16} />
                  </Button>
                }
                content={'Export feature coming soon...'}
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
              <p className="font-bold">No Members Invited yet</p>
              <p className="max-w-96 text-center">
                {
                  "You haven't added any members yet. Start by adding your first members to keep track of your enterprise authorities"
                }
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
