'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import MemberInviteModal from '@/components/membersInvite/MemberInviteModal';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getAllAssociateMembers } from '@/services/Associate_Members_Services/AssociateMembersServices';
import { useQuery } from '@tanstack/react-query';
import { Upload, Users } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useInviteeMembersColumns } from './useInviteeMembersColumns';

const MembersPage = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [selectedMembers, setSelectedMembers] = useState([]);

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
  });

  const inviteeMembersColumns = useInviteeMembersColumns(setSelectedMembers);

  return (
    <Wrapper className="relative">
      <SubHeader name={'Members'} className="z-10 bg-white">
        <div className="flex items-center justify-center gap-4">
          <MemberInviteModal />

          <Button
            disabled={selectedMembers?.length === 0}
            onClick={() => {}}
            variant="outline"
            className="border border-[#A5ABBD] hover:bg-neutral-600/10"
            size="sm"
          >
            <Upload size={16} />
          </Button>
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

          <MemberInviteModal />
        </div>
      )}
    </Wrapper>
  );
};

export default MembersPage;
